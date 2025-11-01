Documentação da API Backend - Nola Analytics

Esta documentação detalha a arquitetura, configuração e os endpoints da API RESTful do Nola Analytics. O backend foi construído em Node.js com Express e TypeScript, seguindo os princípios da Arquitetura Limpa (Clean Architecture) [cite: Arquitetura Limpa - O Guia do Artesão para Estrutura e Design de Software - Autor (Robert C. Martin).pdf] para garantir alta manutenibilidade, testabilidade e performance.

O objetivo desta API é fornecer dados analíticos complexos (BI) e uma interface de chat com IA (Gemini) [cite: implemente a IA com gemini e não uma simulação co...] para a persona "Maria", dona de um restaurante [cite: lucasvieira94/nola-god-level/nola-god-level-9151baff26208d64a11deab0a1a2977746f46c9b/PROBLEMA.md].

1. Stack de Tecnologia

Runtime: Node.js

Framework: Express.js

Linguagem: TypeScript

Banco de Dados (SQL): PostgreSQL (via Docker)

Driver do Banco: node-postgres (SQL puro para performance)

Cache: Redis (via Docker)

Driver do Cache: ioredis

IA: Google Gemini (via @google/generative-ai)

Testes: Jest & ts-jest

Runner (Dev): tsx

2. Visão Geral da Arquitetura (Clean Architecture)

Para que o frontend entenda como o backend está organizado, seguimos uma separação estrita de responsabilidades:

src/domain: O coração. Define as interfaces (contratos) e tipos de dados (DTOs). Não conhece Express, nem banco de dados.

src/application: A lógica de negócio. Contém os Casos de Uso (ex: GetTopProductsUseCase). Depende apenas do Domain.

src/infra: Os detalhes. Implementa as interfaces do Domain. Aqui vivem:

infra/database: O PgAnalyticsRepository (SQL puro).

infra/cache: O RedisAnalyticsRepository (o Decorator de cache).

infra/ai: O GeminiAssistantService (o SDK da IA).

infra/http: Os Controllers (que lidam com req e res).

src/main: O ponto de entrada. Conecta tudo. Aqui vivem:

main/server.ts: O servidor Express.

main/routes: As "Fábricas" (Composition Roots) que instanciam e injetam as dependências.

3. Configuração do Ambiente Local

Para executar este backend, o frontend precisará do Node.js (v18+) e do Docker Desktop.

3.1. Instalação (PowerShell)

# 1. Navegue até a pasta do backend
cd backend

# 2. Instale todas as dependências
npm install


3.2. Configuração do Ambiente (.env)

Crie um ficheiro chamado .env na raiz da pasta backend/. Este ficheiro é ignorado pelo Git (.gitignore) e contém os segredos.

Template do .env:

# Variáveis de Ambiente do Nola Analytics

# 1. Banco de Dados (PostgreSQL)
# (Estas credenciais devem bater com as do docker-compose.yml)
PGHOST=localhost
PGPORT=5432
PGUSER=challenge
PGPASSWORD=challenge_2024
PGDATABASE=challenge_db

# 2. IA (Google Gemini)
# (Obtenha esta chave no Google AI Studio ou Google Cloud)
GEMINI_API_KEY=SUA_CHAVE_API_DO_GEMINI_AQUI

# 3. Servidor
PORT=3333


3.3. Subir os Serviços (Docker)

O docker-compose.yml (na raiz do projeto) gere o PostgreSQL, o Redis e o gerador de dados.

Execute estes comandos na raiz do projeto (não na pasta backend/):

# 1. (Opcional) Derrubar tudo se já estiver a correr (o -v apaga os dados)
try {
  docker compose down -v
} catch {}

# 2. Construir a imagem do gerador de dados
docker compose build --no-cache data-generator

# 3. Subir o PostgreSQL e o Redis em background
docker compose up -d postgres redis

# 4. Esperar ~10 segundos para o banco ficar pronto e então
#    executar o gerador de dados para criar o schema e popular o banco.
docker compose run --rm data-generator

# 5. (Opcional) Subir o PgAdmin na porta 5050
docker compose --profile tools up -d pgadmin


3.4. Executar a Aplicação

Depois que os contêineres Docker estiverem a correr e os dados gerados, volte para a pasta backend/:

# Iniciar o servidor em modo de desenvolvimento (com hot-reload)
npm run dev


O servidor estará disponível em http://localhost:3333.

3.5. Executar os Testes

Para garantir que a lógica de negócio está correta (sem tocar no banco de dados):

npm test


4. Referência da API (Endpoints)

Esta é a documentação de todos os endpoints disponíveis para o frontend.

URL Base: http://localhost:3333/api/v1

4.1. Contexto de Análise (/analytics)

Todos os endpoints de GET partilham os mesmos parâmetros de query de data.

Parâmetros de Query (GET):

startDate (string, obrigatório): Data de início (formato YYYY-MM-DD).

endDate (string, obrigatório): Data de fim (formato YYYY-MM-DD).

1. GET /analytics/top-products

Busca os 10 produtos mais vendidos no período, ordenados por receita.

Sucesso (200 OK):

[
  {
    "productId": 425,
    "name": "Cerveja P #010",
    "totalSold": 11115,
    "totalRevenue": 1461109.09
  },
  // ... (mais 9 produtos)
]


Erro (400 Bad Request): Se as datas estiverem ausentes ou mal formatadas.

{ "error": "Data de início e data de fim são obrigatórias." }


2. GET /analytics/revenue-over-time

Busca o faturamento agregado por granularidade.

Parâmetros de Query Adicionais:

granularity (string, opcional): 'day', 'week' ou 'month'. (Assume 'day' se não for fornecido).

Sucesso (200 OK):

[
  {
    "date": "2025-09-01T03:00:00.000Z",
    "totalRevenue": 691585.30
  },
  {
    "date": "2025-09-02T03:00:00.000Z",
    "totalRevenue": 844069.56
  }
  // ... (restante do período)
]


3. GET /analytics/sales-by-channel

Busca o total de vendas e receita agrupados por canal.

Sucesso (200 OK):

[
  {
    "channelId": 1,
    "channelName": "iFood",
    "totalSales": 100000,
    "totalRevenue": 15000000.00
  },
  {
    "channelId": 2,
    "channelName": "Salão",
    "totalSales": 80000,
    "totalRevenue": 12000000.00
  }
  // ... (restante dos canais)
]


4. GET /analytics/overall-average-ticket

Busca o ticket médio geral e o total de vendas no período.

Sucesso (200 OK):

{
  "averageTicket": 366.50,
  "totalSales": 516809
}


Nota: Se não houver vendas, retorna { "averageTicket": 0, "totalSales": 0 }.

5. GET /analytics/sales-heatmap

Busca o faturamento e vendas agrupados por hora do dia e por canal.

Sucesso (200 OK):

[
  {
    "hour": 0, // 00:00 (meia-noite)
    "channelId": 1,
    "channelName": "iFood",
    "totalSales": 500,
    "totalRevenue": 50000.00
  },
  {
    "hour": 0,
    "channelId": 2,
    "channelName": "Salão",
    "totalSales": 10,
    "totalRevenue": 1000.00
  },
  {
    "hour": 1, // 01:00
    "channelId": 1,
    "channelName": "iFood",
    "totalSales": 800,
    "totalRevenue": 80000.00
  }
  // ... (restante das horas e canais)
]


6. GET /analytics/sales-by-payment-type

Busca o faturamento e transações agrupados por tipo de pagamento.

Sucesso (200 OK):

[
  {
    "paymentTypeId": 3,
    "paymentTypeName": "Cartão de Débito",
    "totalRevenue": 34113001.37,
    "totalTransactions": 112524
  },
  {
    "paymentTypeId": 2,
    "paymentTypeName": "Cartão de Crédito",
    "totalRevenue": 33861869.94,
    "totalTransactions": 111871
  }
  // ... (restante dos tipos de pagamento)
]


7. GET /analytics/customer-rfm

Busca a análise de Recência (data da última compra), Frequência (n.º de compras) e Valor (total gasto) dos clientes.

Sucesso (200 OK):

[
  {
    "customerId": 8190,
    "customerName": "Marcelo Rocha",
    "lastPurchaseDate": "2025-10-24T21:32:43.098Z",
    "frequency": 52,
    "monetaryValue": 25866.39
  },
  {
    "customerId": 956,
    "customerName": "Kaique Lima",
    "lastPurchaseDate": "2025-10-29T13:23:31.098Z",
    "frequency": 54,
    "monetaryValue": 23671.00
  }
  // ... (restante dos clientes)
]


4.2. Contexto de IA (/ai)

Estes endpoints gerem a interação com o assistente Gemini.

1. POST /ai/ask (O "Chatbot")

Recebe um prompt em linguagem natural, usa o Function Calling do Gemini para (potencialmente) chamar um dos endpoints de análise acima, e retorna uma resposta em linguagem natural.

Corpo da Requisição (JSON):

{
  "prompt": "Qual foi o meu faturamento em Setembro de 2025?",
  "history": []
}


prompt (string, obrigatório): A pergunta do utilizador.

history (array, opcional): O histórico da conversa (para manter o contexto). O formato é [{ "role": "user" | "model", "parts": "texto" }, ...].

Sucesso (200 OK):

{
  "response": "No mês de setembro de 2025, você vendeu um total de R$ 29.560.849,66."
}


Erro (500 Server Error): Se a API Key do Gemini for inválida ou o loop de IA falhar.

{ "error": "O assistente de IA excedeu o limite de iterações." }


2. POST /ai/explain (O "Analista")

Recebe um JSON de dados e um contexto, e retorna uma explicação em linguagem natural sobre esses dados.

Corpo da Requisição (JSON):

{
  "dataContext": "Estes são os meus produtos mais vendidos na semana passada",
  "dataJson": "[{\"productId\":1,\"name\":\"Pizza\",\"totalRevenue\":5000},{\"productId\":2,\"name\":\"Refrigerante\",\"totalRevenue\":1500}]"
}


dataContext (string, obrigatório): Diz à IA o que são os dados.

dataJson (string, obrigatório): Os dados (em formato JSON.stringify).

Sucesso (200 OK):

{
  "response": "Aqui está a análise dos seus dados: A Pizza foi o seu principal produto, gerando R$ 5.000,00, o que é mais de 3 vezes a receita do Refrigerante (R$ 1.500,00). Focar em combos de Pizza + Refrigerante pode ser uma boa estratégia."
}


Erro (400 Bad Request):

{ "error": "Contexto e JSON dos dados são obrigatórios." }


5. Estratégia de Cache (Redis)

Para garantir a performance de < 500ms [cite: lucasvieira94/nola-god-level/nola-god-level-9151baff26208d64a11deab0a1a2977746f46c9b/FAQ.md] e reduzir os custos de consulta, o backend implementa uma camada de cache (Redis) usando o Padrão Decorator.

Como funciona: Todos os 7 endpoints de /analytics são "envolvidos" pelo RedisAnalyticsRepository.

Duração (TTL): O cache é definido para expirar após 1 hora (3600 segundos).

Teste (Logs): Ao fazer uma requisição pela primeira vez, o log do servidor (npm run dev) mostrará [Cache] MISS. Na segunda requisição (dentro de 1 hora), mostrará [Cache] HIT, e a resposta será quase instantânea (pois não consultou o PostgreSQL).