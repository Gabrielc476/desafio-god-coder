import Redis from 'ioredis';

// Cria uma instância singleton do cliente Redis.
// Por defeito, o 'ioredis' liga-se a '127.0.0.1:6379',
// que é exatamente o que o nosso docker-compose.yml (no Canvas) expõe.
const redisClient = new Redis({
  // Ativar o 'lazy connect' melhora a performance de inicialização
  lazyConnect: true, 
  maxRetriesPerRequest: 3, // Tentar reconectar 3 vezes
});

// Listener de eventos para depuração (opcional, mas recomendado)
redisClient.on('connect', () => {
  console.log('[Redis] Cliente conectado com sucesso.');
});

redisClient.on('error', (err) => {
  console.error('[Redis] Erro de conexão:', err);
});

export { redisClient };
