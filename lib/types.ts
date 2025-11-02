// Este arquivo define o contrato de dados entre o
// frontend e a API backend (baseado na documentação da API).

// --- Tipos de Resposta dos Endpoints GET /analytics/* ---
// Estes tipos refletem EXATAMENTE o JSON retornado pela API.

/**
 * Caso de Uso 1: GET /v1/analytics/top-products
 */
export type TopProduct = {
  productId: number;
  name: string;
  totalSold: number;
  totalRevenue: number;
 
};

/**
 * Caso de Uso 2: GET /v1/analytics/revenue-over-time
 */
export type RevenueDataPoint = {
  date: string; // (ISO Date String)
  totalRevenue: number;
};

/**
 * Caso de Uso 3: GET /v1/analytics/sales-by-channel
 */
export type SalesByChannel = {
  channel_id: number;
  channel_name: string;
  total_sales: number;
  total_revenue: number;
};

/**
 * Caso de Uso 4: GET /v1/analytics/overall-average-ticket
 * * CORREÇÃO CRÍTICA: Os logs mostram que o backend retorna 'totalSales' (camelCase),
 * enquanto o tipo DTO do Domínio usa 'totalSales' (camelCase), mas o tipo
 * do frontend anterior usava 'total_sales' (snake_case).
 * Para compatibilidade com o retorno do backend (visto no log), usamos CAMELCASE aqui.
 */
export type AverageTicket = {
  average_ticket: number; // MANTIDO: snake_case (para evitar quebras em outros lugares)
  totalSales: number; // CORRIGIDO: camelCase (como visto no log do servidor)
  total_revenue: number; // MANTIDO: snake_case
};

/**
 * Caso de Uso 5: GET /v1/analytics/sales-heatmap
 */
export type SalesHeatmapPoint = {
  hour: number; // (0-23)
  channel_id: number;
  channel_name: string;
  total_sales: number;
  total_revenue: number;
};

/**
 * Caso de Uso 6: GET /v1/analytics/sales-by-payment-type
 */
export type SalesByPaymentType = {
  payment_type_id: number;
  payment_type_name: string;
  total_revenue: number;
  total_transactions: number;
};

/**
 * Caso de Uso 7: GET /v1/analytics/customer-rfm
 */
export type RfmCustomer = {
  customer_id: number;
  customer_name: string;
  last_purchase_date: string; // (ISO Date String)
  frequency: number;
  monetary_value: number;
};

// --- Tipos para a API de IA (/ai) ---
// Estes tipos refletem as requisições e respostas dos Casos de Uso 8 e 9

// Tipagem para o histórico do chat
export type ChatMessage = {
  role: 'user' | 'model';
  parts: string;
};

/**
 * Payload da Requisição para:
 * Caso de Uso 8: POST /v1/ai/ask
 */
export type AIChatRequest = {
  prompt: string;
  history?: ChatMessage[];
};

/**
 * Payload da Requisição para:
 * Caso de Uso 9: POST /v1/ai/explain
 */
export type AIExplainRequest = {
  dataContext: string;
  dataJson: string; // JSON.stringify(data)
};

// --- Tipos de RESPOSTA ---

/**
 * Caso de Uso 8: POST /v1/ai/ask
 */
export type AIChatResponse = {
  response: string;
};

/**
 * Caso de Uso 9: POST /v1/ai/explain
 */
export type AIExplainResponse = {
  response: string; // A análise em linguagem natural
};

// --- Tipos Auxiliares do Frontend ---

// Tipagem para o retorno das Server Actions (útil para useActionState)
export type AIActionState<T> = {
  data: T | null;
  error: string | null;
};
