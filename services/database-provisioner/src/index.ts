import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3005;

app.get('/health', (_req, res) => res.json({ status: 'healthy' }));

app.listen(port, () => console.log(`Database Provisioner listening on ${port}`));
