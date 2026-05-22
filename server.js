import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { handleChatRequest } from './backend/ragAgent.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '1mb' }));

app.options('/api/chat', async (req, res) => {
  res.setHeader('access-control-allow-origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('access-control-allow-methods', 'POST,OPTIONS');
  res.setHeader('access-control-allow-headers', 'content-type');
  res.status(204).send('');
});

app.post('/api/chat', async (req, res) => {
  const response = await handleChatRequest(req.body);
  res.status(response.statusCode);
  Object.entries(response.headers || {}).forEach(([key, value]) => res.setHeader(key, value));
  res.send(response.body);
});

// Serve static assets from dist
const distPath = path.resolve('dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Fallback dev route indicating frontend is served by Vite on port 5173
  app.get('/', (req, res) => {
    res.send('Backend static server is running. Front-end is served by Vite in development mode on port 5173.');
  });
}

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
