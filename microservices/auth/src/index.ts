import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Schema, model } from "mongoose";
import { collectDefaultMetrics, register as promRegister, Counter } from "prom-client";

collectDefaultMetrics({ prefix: "auth_" });
const regsTotal = new Counter({ name: "auth_registrations_total", help: "Successful registrations" });
const loginsTotal = new Counter({ name: "auth_logins_total", help: "Successful logins" });

const app = express();
const PORT = parseInt(process.env.PORT ?? "8001", 10);
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/sugarcane_auth";
const JWT_SECRET = process.env.JWT_SECRET ?? "changeme_dev_secret_32chars_min!!";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

app.use(cors());
app.use(express.json());

const UserSchema = new Schema({ name: { type: String, required: true }, phone: { type: String, required: true, unique: true }, password: { type: String, required: true }, village: { type: String, default: "" }, language: { type: String, default: "en" } }, { timestamps: true });
const User = model("User", UserSchema);
const sanitize = (u: { _id: unknown; name: string; phone: string; village: string; language: string }) => ({ id: String(u._id), name: u.name, phone: u.phone, village: u.village, language: u.language });

app.post("/register", async (req, res) => {
  try {
    const { name, phone, password, confirmPassword, village = "", language = "en" } = req.body;
    if (!/^\d{10}$/.test(phone)) { res.status(400).json({ code: "PHONE_INVALID", message: "Phone must be exactly 10 digits" }); return; }
    if ((password?.length ?? 0) < 8) { res.status(400).json({ code: "PASSWORD_TOO_SHORT", message: "Min 8 chars" }); return; }
    if (password !== confirmPassword) { res.status(400).json({ code: "PASSWORD_MISMATCH", message: "Passwords do not match" }); return; }
    if (await User.findOne({ phone })) { res.status(409).json({ code: "PHONE_DUPLICATE", message: "Account exists" }); return; }
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, phone, password: hashed, village, language });
    const token = jwt.sign({ userId: user._id, phone }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
    regsTotal.inc();
    res.status(201).json({ token, user: sanitize(user) });
  } catch { res.status(500).json({ code: "SERVER_ERROR", message: "Server error" }); }
});

app.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) { res.status(401).json({ code: "NO_ACCOUNT_FOUND", message: "No account found" }); return; }
    if (!(await bcrypt.compare(password, user.password))) { res.status(401).json({ code: "INCORRECT_PASSWORD", message: "Incorrect password" }); return; }
    const token = jwt.sign({ userId: user._id, phone }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
    loginsTotal.inc();
    res.json({ token, user: sanitize(user) });
  } catch { res.status(500).json({ code: "SERVER_ERROR", message: "Server error" }); }
});

app.get("/health", (_req, res) => res.json({ status: "ok", service: "auth" }));
app.get("/metrics", async (_req, res) => { res.set("Content-Type", promRegister.contentType); res.end(await promRegister.metrics()); });

mongoose.connect(MONGODB_URI).then(() => {
  console.log("Auth MongoDB connected");
  const server = app.listen(PORT, () => console.log(`Auth service on ${PORT}`));
  const shutdown = () => server.close(() => mongoose.disconnect().then(() => process.exit(0)));
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}).catch(e => { console.error(e); process.exit(1); });
