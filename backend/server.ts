/* eslint-disable import/first */
import dotenv from 'dotenv'; // Load environment variables from .env
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import openAIRoutes from './routes/openai';

const app = express();
const PORT = process.env.PORT || 3100;

// Middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  next();
});

app.use(cors());
app.use(bodyParser.json());
app.use('/api/openai', openAIRoutes);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
