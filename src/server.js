import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initDatabase, runQuerySingle } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura_aqui_mude_isso';

app.use(cors({
  origin: 'https://noffs-training.vercel.app',
  credentials: true
}));

app.use(express.json());

// Inicializar banco de dados
await initDatabase();

app.get('/health', (req, res) => {
  res.json({ status: 'Backend rodando', timestamp: new Date() });
});

// ROTA DE LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validar entrada
    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    // Buscar aluno no banco
    const student = await runQuerySingle('SELECT * FROM students WHERE email = ?', [email]);

    if (!student) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    // Comparar senha
    const passwordMatch = await bcryptjs.compare(senha, student.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    // Gerar JWT
    const token = jwt.sign(
      { id: student.id, email: student.email, name: student.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      student: {
        id: student.id,
        name: student.name,
        email: student.email
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/auth/register', (req, res) => {
  res.json({ message: 'Rota de registro' });
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
  console.log(`✓ Servidor rodando em http://localhost:${PORT}`);
});
