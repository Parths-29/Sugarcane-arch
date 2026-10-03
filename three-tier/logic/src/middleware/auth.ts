import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'changeme_dev_secret_32chars_min!!';

declare global {
  namespace Express {
    interface Request { userId?: string; userPhone?: string; }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing or invalid token' });
    return;
  }
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { userId: string; phone: string };
    req.userId = payload.userId;
    req.userPhone = payload.phone;
    next();
  } catch {
    res.status(401).json({ code: 'TOKEN_INVALID', message: 'Token invalid or expired' });
  }
}
