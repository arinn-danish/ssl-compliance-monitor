import path from 'path';
import { createServer as createViteServer } from 'vite';
import express, { Request, Response } from 'express';
import { app } from './server/app.ts';

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  // ==========================================
  // Vite Middleware (Dev) / Static Serve (Prod)
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sabah State Library Compliance Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
