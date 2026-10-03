import { Router, Request, Response } from 'express';
import { register, login } from './auth.service';

export const authRouter = Router();

authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const result = await register(req.body);
    res.status(201).json(result);
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string; status?: number };
    res.status(e.status ?? 500).json({ code: e.code ?? 'SERVER_ERROR', message: e.message ?? 'Server error' });
  }
});

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const result = await login(req.body);
    res.json(result);
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string; status?: number };
    res.status(e.status ?? 500).json({ code: e.code ?? 'SERVER_ERROR', message: e.message ?? 'Server error' });
  }
});
