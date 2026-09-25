import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'Backend rodando', timestamp: new Date() });
});

app.post('/api/auth/register', (req, res) => {
  res.json({ message: 'Rota de registro' });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ message: 'Rota de login' });
});

app.post('/api/questionnaire', (req, res) => {
  res.json({ message: 'Rota de questionário' });
});

app.post('/api/webhooks/asaas', (req, res) => {
  res.json({ message: 'Webhook recebido' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});