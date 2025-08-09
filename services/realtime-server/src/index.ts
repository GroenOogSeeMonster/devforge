import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const port = Number(process.env.PORT) || 3002;

io.on('connection', (socket) => {
  socket.emit('welcome', { message: 'Connected to DevForge realtime server' });
});

app.get('/health', (_req, res) => res.json({ status: 'healthy' }));

server.listen(port, () => console.log(`Realtime server listening on ${port}`));
