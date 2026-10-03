import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { register as promRegister, collectDefaultMetrics } from "prom-client";

collectDefaultMetrics();

const app = express();
const PORT = parseInt(process.env.PORT ?? "4001", 10);
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/sugarcane_three_tier";

app.use(cors());
app.use(express.json());

// Lazy-load controllers to allow shared services
import { authController } from "./controllers/auth.controller";
import { advisoryController } from "./controllers/advisory.controller";
import { metricsMiddleware } from "./middleware/metrics";
import { requestIdMiddleware } from "./middleware/requestId";

app.use(requestIdMiddleware);
app.use(metricsMiddleware);
app.use("/api/auth", authController);
app.use("/api/advisory", advisoryController);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "sugarcane-three-tier-logic" });
});

app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", promRegister.contentType);
  res.end(await promRegister.metrics());
});

app.use((_req, res) => {
  res.status(404).json({ code: "NOT_FOUND", message: "Route not found" });
});

mongoose.connect(MONGODB_URI).then(() => {
  console.log("MongoDB connected");
  const server = app.listen(PORT, () => console.log(`Three-tier logic on port ${PORT}`));
  const shutdown = () => server.close(() => mongoose.disconnect().then(() => process.exit(0)));
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}).catch((e) => { console.error(e); process.exit(1); });
