import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';

export interface AuthRequest extends Request {
  user?: { username: string };
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }

  if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign({ username }, env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, username });
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, env.JWT_SECRET) as { username: string };
    req.user = { username: payload.username };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
