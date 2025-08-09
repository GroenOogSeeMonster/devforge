import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

app.get('/health', (_req, res) => res.json({ status: 'healthy' }));

app.listen(port, () => console.log(`AI Assistant listening on ${port}`));
