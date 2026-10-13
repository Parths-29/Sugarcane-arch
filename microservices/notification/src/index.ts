import express from "express";
import cors from "cors";
import Redis from "ioredis";
import { collectDefaultMetrics, register as promRegister, Counter, Histogram, Gauge } from "prom-client";

collectDefaultMetrics({ prefix: "notification_" });
const notifSentTotal  = new Counter({ name: "notifications_sent_total", help: "Notifications sent" });
const notifDuration   = new Histogram({ name: "notification_processing_seconds", help: "Notification processing time", buckets: [0.01, 0.05, 0.1, 0.5] });
const queueLag        = new Gauge({ name: "notification_queue_lag", help: "Unprocessed messages in stream" });
const streamLength    = new Gauge({ name: "notification_stream_length", help: "Total entries currently retained in the advisory Redis stream" });
const pendingMessages = new Gauge({ name: "notification_pending_messages", help: "Messages delivered to consumers but not acknowledged" });
const redisUp         = new Gauge({ name: "notification_redis_up", help: "Whether the notification worker can reach Redis" });

const REDIS_URL  = process.env.REDIS_URL         ?? "redis://localhost:6379";
const TRANS_URL  = process.env.TRANSLATION_SERVICE_URL ?? "http://translation:8004";
const PORT       = parseInt(process.env.PORT ?? "8005", 10);
const STREAM_KEY = "advisory.created";
const GROUP_NAME = "notification-group";
const CONSUMER   = "notification-1";

const redis  = new Redis(REDIS_URL, { lazyConnect: true, retryStrategy: (t) => Math.min(t * 100, 3000) });
const sub    = new Redis(REDIS_URL, { lazyConnect: true, retryStrategy: (t) => Math.min(t * 100, 3000) });

const recentNotifs: Array<{ ts: string; phone: string; message: string; decision: string }> = [];

function maskPhone(phone: string): string {
  return phone.replace(/(\d{2})(\d{4})(\d{4})/, "+91$1XXXX$3");
}

async function translateMessage(decision: string, language: string, irrigationMm: number): Promise<string> {
  try {
    const r = await fetch(`${TRANS_URL}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, language, soilMoisturePct: 50, rain3dMm: 0 }),
    });
    const d = await r.json() as { explanation?: string };
    const label = decision === "irrigate" ? `Irrigate ${irrigationMm}mm.` : decision === "delay" ? "Delay irrigation." : "Skip irrigation.";
    return `[Advisory] ${label} ${d.explanation ?? ""}`.trim();
  } catch { return `[Advisory] Decision: ${decision}`; }
}

async function initStream() {
  try {
    await redis.xgroup("CREATE", STREAM_KEY, GROUP_NAME, "0", "MKSTREAM");
    console.log("Stream group created");
  } catch (e: unknown) {
    if ((e as Error).message?.includes("BUSYGROUP")) { console.log("Stream group already exists"); }
    else console.error("Stream init error:", e);
  }
}

async function refreshQueueMetrics() {
  try {
    const [length, pending, groups] = await Promise.all([
      redis.xlen(STREAM_KEY),
      redis.xpending(STREAM_KEY, GROUP_NAME),
      redis.xinfo("GROUPS", STREAM_KEY),
    ]);
    const pendingCount = Number(Array.isArray(pending) ? pending[0] : 0) || 0;
    const group = Array.isArray(groups)
      ? groups.find((entry) => Array.isArray(entry) && entry[1] === GROUP_NAME) as unknown[] | undefined
      : undefined;
    const lagIndex = group?.indexOf("lag") ?? -1;
    const lagCount = lagIndex >= 0 ? Number(group?.[lagIndex + 1]) || 0 : 0;
    streamLength.set(length);
    pendingMessages.set(pendingCount);
    queueLag.set(lagCount);
    redisUp.set(1);
  } catch {
    redisUp.set(0);
    throw new Error("Could not refresh Redis stream metrics");
  }
}

async function processMessages() {
  while (true) {
    try {
      const msgs = await sub.xreadgroup("GROUP", GROUP_NAME, CONSUMER, "COUNT", "10", "BLOCK", "2000", "STREAMS", STREAM_KEY, ">");
      if (!msgs) continue;

      for (const [, entries] of msgs as Array<[string, Array<[string, string[]]>]>) {
        for (const [msgId, fields] of entries) {
          const end = notifDuration.startTimer();
          const data: Record<string, string> = {};
          for (let i = 0; i < fields.length; i += 2) data[fields[i]] = fields[i + 1];

          const { phone = "0000000000", decision = "skip", irrigationMm = "0", language = "en", requestId = "?" } = data;
          const message = await translateMessage(decision, language, parseFloat(irrigationMm));
          const masked  = maskPhone(phone);

          console.log(`[MOCK-SMS] to ${masked}: ${message} (reqId=${requestId})`);
          recentNotifs.unshift({ ts: new Date().toISOString(), phone: masked, message, decision });
          if (recentNotifs.length > 50) recentNotifs.pop();

          await sub.xack(STREAM_KEY, GROUP_NAME, msgId);
          notifSentTotal.inc();
          end();
        }
      }

      await refreshQueueMetrics();
    } catch (e) {
      console.error("Redis error:", e);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/notifications", (_req, res) => res.json(recentNotifs));
app.get("/health", async (_req, res) => {
  try {
    await redis.ping();
    redisUp.set(1);
    res.json({ status: "ok", service: "notification", redis: "ok" });
  } catch {
    redisUp.set(0);
    res.status(503).json({ status: "degraded", service: "notification", redis: "unavailable" });
  }
});
app.get("/metrics", async (_req, res) => { res.set("Content-Type", promRegister.contentType); res.end(await promRegister.metrics()); });

async function start() {
  await redis.connect();
  await sub.connect();
  await initStream();
  await refreshQueueMetrics();
  processMessages().catch(console.error);

  const server = app.listen(PORT, () => console.log(`Notification service on ${PORT}`));
  const shutdown = () => {
    server.close(() => { redis.disconnect(); sub.disconnect(); process.exit(0); });
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

start().catch(e => { console.error(e); process.exit(1); });
