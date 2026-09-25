import sqlite3 from 'sqlite3';
import bcryptjs from 'bcryptjs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../students.db');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function addStudent() {
  console.log('\n🎓 Adicionar Aluno\n');

  const name = await question('Nome completo: ');
  const email = await question('Email: ');
  const password = await question('Senha padrão (deixe em branco para "123456"): ') || '123456';

  if (!name || !email) {
    console.log('❌ Nome e email são obrigatórios');
    rl.close();
    return;
  }

  try {
    // Hash da senha
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Conectar ao banco
    const db = new sqlite3.Database(DB_PATH);

    db.run(
      'INSERT INTO students (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            console.log('❌ Este email já está cadastrado');
          } else {
            console.log('❌ Erro ao adicionar aluno:', err.message);
          }
        } else {
          console.log(`\n✅ Aluno adicionado com sucesso!`);
          console.log(`📧 Email: ${email}`);
          console.log(`🔐 Senha padrão: ${password}`);
          console.log(`🆔 ID: ${this.lastID}\n`);
        }
        db.close();
        rl.close();
      }
    );
  } catch (error) {
    console.log('❌ Erro:', error.message);
    rl.close();
  }
}

addStudent();
