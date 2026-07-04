process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret-key';
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'testpassword';
process.env.NODE_ENV = 'test';
