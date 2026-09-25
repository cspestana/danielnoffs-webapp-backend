import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Erro no pool de conexão:', err);
});

// Funções auxiliares
export const query = (text, params) => pool.query(text, params);

export const getClient = () => pool.connect();

export default pool;

// SCHEMA DO BANCO DE DADOS (copiar e colar no PostgreSQL)
export const initDatabase = async () => {
  const client = await pool.connect();
  try {
    // Tabela de usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha_hash VARCHAR(255) NOT NULL,
        nome VARCHAR(255),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de respostas do questionário
    await client.query(`
      CREATE TABLE IF NOT EXISTS questionarios (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
        objetivo VARCHAR(100),
        frequencia_semana INTEGER,
        nivel VARCHAR(50),
        local VARCHAR(100),
        equipamentos TEXT,
        restricoes TEXT,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(usuario_id)
      );
    `);

    // Tabela de programas gerados
    await client.query(`
      CREATE TABLE IF NOT EXISTS programas (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
        questionario_id INTEGER NOT NULL REFERENCES questionarios(id),
        programa_json JSON,
        semana_atual INTEGER DEFAULT 1,
        data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data_vencimento TIMESTAMP,
        ativo BOOLEAN DEFAULT true,
        UNIQUE(usuario_id)
      );
    `);

    // Tabela de histórico de treinos
    await client.query(`
      CREATE TABLE IF NOT EXISTS historico_treinos (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
        programa_id INTEGER NOT NULL REFERENCES programas(id),
        dia_treino DATE,
        tipo_treino VARCHAR(50),
        exercicio_id INTEGER,
        peso_utilizado DECIMAL(5,2),
        repeticoes INTEGER,
        series_completadas INTEGER,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de transações (Asaas)
    await client.query(`
      CREATE TABLE IF NOT EXISTS transacoes (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
        asaas_payment_id VARCHAR(255) UNIQUE,
        valor DECIMAL(10,2),
        status VARCHAR(50),
        metodo_pagamento VARCHAR(50),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        confirmado_em TIMESTAMP
      );
    `);

    console.log('Banco de dados inicializado com sucesso');
  } catch (err) {
    console.error('Erro ao inicializar banco:', err);
  } finally {
    client.release();
  }
};