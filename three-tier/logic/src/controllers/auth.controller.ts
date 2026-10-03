import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";

export const authController = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? "changeme_dev_secret_32chars_min!!";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

function sanitize(u: { _id: unknown; name: string; phone: string; village: string; language: string }) {
  return { id: String(u._id), name: u.name, phone: u.phone, village: u.village, language: u.language };
}

authController.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, phone, password, confirmPassword, village = "", language = "en" } = req.body;
    if (!/^\d{10}$/.test(phone)) { res.status(400).json({ code: "PHONE_INVALID", message: "Phone must be exactly 10 digits" }); return; }
    if ((password?.length ?? 0) < 8) { res.status(400).json({ code: "PASSWORD_TOO_SHORT", message: "Password must be at least 8 characters" }); return; }
    if (password !== confirmPassword) { res.status(400).json({ code: "PASSWORD_MISMATCH", message: "Passwords do not match" }); return; }
    if (await UserRepository.findByPhone(phone)) { res.status(409).json({ code: "PHONE_DUPLICATE", message: "Account with this number exists" }); return; }
    const hashed = await bcrypt.hash(password, 12);
    const user = await UserRepository.create({ name, phone, password: hashed, village, language });
    const token = jwt.sign({ userId: user._id, phone }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.status(201).json({ token, user: sanitize(user) });
  } catch (e) { res.status(500).json({ code: "SERVER_ERROR", message: "Server error" }); }
});

authController.post("/login", async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;
    const user = await UserRepository.findByPhone(phone);
    if (!user) { res.status(401).json({ code: "NO_ACCOUNT_FOUND", message: "No account found" }); return; }
    if (!(await bcrypt.compare(password, user.password))) { res.status(401).json({ code: "INCORRECT_PASSWORD", message: "Incorrect password" }); return; }
    const token = jwt.sign({ userId: user._id, phone }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ token, user: sanitize(user) });
  } catch (e) { res.status(500).json({ code: "SERVER_ERROR", message: "Server error" }); }
});
