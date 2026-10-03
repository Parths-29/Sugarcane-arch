import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { computeAdvisory } from "../services/advisory.service";

export const advisoryController = Router();

advisoryController.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await computeAdvisory(req.body);
    res.json(result);
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string; status?: number };
    res.status(e.status ?? 500).json({ code: e.code ?? "SERVER_ERROR", message: e.message ?? "Server error" });
  }
});
