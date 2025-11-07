import { Pool } from 'pg';
import 'dotenv/config';

// O 'dotenv/config' carregará a variável DATABASE_URL do seu arquivo .env
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'Variável de ambiente DATABASE_URL não encontrada. ' +
    'Por favor, adicione-a ao seu arquivo .env (obtenha do painel Supabase).',
  );
}

// Criamos um Pool de conexões usando a string de conexão.
// O 'node-postgres' (pg) é otimizado para ler a connectionString.
export const pool = new Pool({
  connectionString: connectionString,
  // A string de conexão padrão do Supabase já lida com as configurações de SSL.

  // Mantemos suas configurações de pool
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
  console.log('Cliente conectado ao pool do banco de dados (Supabase)!');
});

// Adicionamos um listener de erro para robustez
pool.on('error', (err, client) => {
  console.error('Erro inesperado no cliente do pool (Supabase)', err);
});