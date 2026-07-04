import { Router } from 'express';
import { loginHandler } from '../middleware/auth';

const router = Router();

router.post('/login', loginHandler);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'TechDigest AI', timestamp: new Date().toISOString() });
});

export default router;
