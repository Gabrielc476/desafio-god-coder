import { Pool } from 'pg';
import 'dotenv/config';

// Criamos um Pool de conexões. Isso é crucial para performance,
// pois reutiliza conexões em vez de abrir uma nova a cada query.
// O 'node-postgres' lê as variáveis de ambiente (PGHOST, PGUSER, etc.)
// automaticamente, que virão do nosso arquivo .env
export const pool = new Pool({
  max: 20, // Número máximo de clientes no pool
  idleTimeoutMillis: 30000, // Tempo (ms) que um cliente fica ocioso antes de fechar
  connectionTimeoutMillis: 2000, // Tempo (ms) para esperar por uma conexão
});

// Exportamos uma função 'query' simplificada que usa o pool.
// Nossos repositórios usarão isso para se comunicar com o banco.
export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
};

// Adicionamos um listener para ver o pool em ação
pool.on('connect', () => {
  console.log('Cliente conectado ao pool do banco de dados!');
});

