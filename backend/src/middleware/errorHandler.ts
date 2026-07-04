import { Request, Response, NextFunction } from 'express';
import { persistLog } from '../utils/logger';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  persistLog('ERROR', err.message, { stack: err.stack });
  res.status(500).json({ error: 'Internal server error', message: err.message });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Not found' });
}
