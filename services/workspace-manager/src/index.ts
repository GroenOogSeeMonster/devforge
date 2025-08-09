import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3004;

app.get('/health', (_req, res) => res.json({ status: 'healthy' }));

app.listen(port, () => console.log(`Workspace Manager listening on ${port}`));
