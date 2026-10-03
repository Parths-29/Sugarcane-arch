import express from "express";
import cors from "cors";
import { collectDefaultMetrics, register as promRegister, Counter } from "prom-client";
import { buildExplanation } from "./translation.service";
import type { Language, Decision } from "./translation.service";

collectDefaultMetrics({ prefix: "translation_" });
const translationsTotal = new Counter({ name: "translations_total", help: "Translations served", labelNames: ["language"] });

const app = express();
const PORT = parseInt(process.env.PORT ?? "8004", 10);
app.use(cors());
app.use(express.json());

app.post("/translate", (req, res) => {
  const { decision, language, soilMoisturePct, rain3dMm } = req.body as {
    decision: Decision; language: Language; soilMoisturePct: number; rain3dMm: number;
  };
  if (!decision || !language) { res.status(400).json({ code: "INVALID_INPUT", message: "decision and language required" }); return; }
  const explanation = buildExplanation(decision, language, soilMoisturePct ?? 50, rain3dMm ?? 0);
  translationsTotal.inc({ language });
  res.json({ explanation });
});

app.get("/health", (_req, res) => res.json({ status: "ok", service: "translation" }));
app.get("/metrics", async (_req, res) => { res.set("Content-Type", promRegister.contentType); res.end(await promRegister.metrics()); });

const server = app.listen(PORT, () => console.log(`Translation service on ${PORT}`));
const shutdown = () => server.close(() => process.exit(0));
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
