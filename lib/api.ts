import {
  RevenueDataPoint,
  TopProduct,
  SalesByChannel,
  AverageTicket,
  SalesHeatmapPoint,
  SalesByPaymentType,
  RfmCustomer,
} from './types';

// A URL base da nossa API Backend (Node.js)
// Em produção, isso viria de uma variável de ambiente (process.env.BACKEND_API_URL)
// CORREÇÃO: Adicionado o prefixo '/api'
const BASE_URL = 'http://localhost:3333/api/v1';

/**
 * Função genérica para buscar dados da nossa API interna.
 * Esta função SÓ DEVE ser chamada do lado do servidor (RSCs, Server Actions).
 *
 * @param path O caminho do endpoint da API (ex: "/analytics/revenue-over-time")
 * @param params Um objeto de URLSearchParams para adicionar à query string
 * @returns A resposta JSON parseada e tipada
 */
async function fetchFromApi<T>(
  path: string,
  params: URLSearchParams = new URLSearchParams()
): Promise<T> {
  const url = `${BASE_URL}${path}?${params.toString()}`;

  // Log para debug no servidor
  console.log(`[API Fetch] ${url}`);

  try {
    const response = await fetch(url, {
      // 'no-store' é o padrão no Next.js 15/16, mas é bom ser explícito.
      // Nós confiamos no cache do Redis do nosso backend.
      cache: 'no-store',
    });

    if (!response.ok) {
      // Tenta parsear o erro, se houver
      const errorBody = await response.json().catch(() => ({}));
      console.error(`[API Error] Status ${response.status}:`, errorBody);
      throw new Error(
        `Falha ao buscar dados da API: ${response.status} ${response.statusText}`
      );
    }

    const data: T = await response.json();
    // NOVO LOG: Mostra os dados retornados no console do SERVIDOR
    console.log(`[API Response] ${url}`, data)
    
    return data;
  } catch (error) {
    // Este erro acontece se o fetch falhar (backend crashou ou não está rodando)
    console.error(`[API Fetch Failed] ${error}`);
    throw new Error(`Erro de rede ou conexão ao buscar: ${url}`);
  }
}

// --- Funções Auxiliares ---

/**
 * Pega o 'from' e 'to' da URL (searchParams) e retorna datas válidas.
 * Se não houver, retorna o default (últimos 30 dias dos dados de amostra).
 *
 * CORREÇÃO (Next.js 16): Esta função agora é responsável por
 * "desembrulhar" (unwrap) os searchParams.
 */
function parseDateRange(searchParams: {
  [key: string]: string | string[] | undefined;
}) {
  // 1. Extrai 'from' e 'to' com segurança
  const params = searchParams || {};
  const from = Array.isArray(params.from) ? params.from[0] : params.from;
  const to = Array.isArray(params.to) ? params.to[0] : params.to;

  // 2. Se o usuário FILTROU (ex: usou o DatePicker), usa as datas da URL
  if (from && to) {
    return { from, to };
  }

 
  const toDate = new Date('2025-10-31T00:00:00Z'); // 31 (para incluir 30)
  const fromDate = new Date('2025-10-02T00:00:00Z'); // 02 (para incluir 01)

  // Log para debug
  console.log(
    `[API Date] Usando datas DEFAULT: ${fromDate.toISOString().split('T')[0]} a ${toDate.toISOString().split('T')[0]}`
  );

  return {
    from: fromDate.toISOString().split('T')[0], // YYYY-MM-DD
    to: toDate.toISOString().split('T')[0], // YYYY-MM-DD
  };
}

// --- SDK da API de Analytics (Casos de Uso 1-7) ---

/**
 * CU 1: Receita por Tempo
 */
async function getRevenueOverTime(
  dates: { from: string; to: string },
  groupBy: 'day' | 'hour'
) {
  console.log("revenue over time foi chamado")
  const params = new URLSearchParams({
    startDate: dates.from, // Envia 'startDate'
    endDate: dates.to, // Envia 'endDate'
    groupBy,
  });
  return fetchFromApi<RevenueDataPoint[]>(
    '/analytics/revenue-over-time',
    params
  );
}

/**
 * CU 2: Top Produtos
 */
async function getTopProducts(dates: { from: string; to: string }, limit = 100) {
  console.log("top products foi chamado")
  const params = new URLSearchParams({
    startDate: dates.from, // Envia 'startDate'
    endDate: dates.to, // Envia 'endDate'
    limit: String(limit),
  });
  return fetchFromApi<TopProduct[]>('/analytics/top-products', params);
}

/**
 * CU 3: Vendas por Canal
 */
async function getSalesByChannel(dates: { from: string; to: string }) {
  console.log("channel foi chamado")
  const params = new URLSearchParams({
    startDate: dates.from, // Envia 'startDate'
    endDate: dates.to, // Envia 'endDate'
  });
  return fetchFromApi<SalesByChannel[]>('/analytics/sales-by-channel', params);
}

/**
 * CU 4: Ticket Médio (Geral)
 * ROTA CORRIGIDA: /overall-average-ticket
 */
async function getAverageTicket(dates: { from: string; to: string }) {
  console.log("average ticket foi chamado")
  const params = new URLSearchParams({
    startDate: dates.from, // Envia 'startDate'
    endDate: dates.to, // Envia 'endDate'
  });
  // CORREÇÃO: Endpoint corrigido de 'average_ticket'
  return fetchFromApi<AverageTicket>(
    '/analytics/overall-average-ticket',
    params
  );
}

/**
 * CU 5: Mapa de Calor (Vendas por Hora/Canal)
 */
async function getSalesHeatmap(dates: { from: string; to: string }) {
  console.log("heatmap foi chamado")
  const params = new URLSearchParams({
    startDate: dates.from, // Envia 'startDate'
    endDate: dates.to, // Envia 'endDate'
  });
  return fetchFromApi<SalesHeatmapPoint[]>('/analytics/sales-heatmap', params);
}

/**
 * CU 6: Vendas por Tipo de Pagamento
 */
async function getSalesByPaymentType(dates: { from: string; to: string }) {
  console.log("payment type foi chamado")
  const params = new URLSearchParams({
    startDate: dates.from, // Envia 'startDate'
    endDate: dates.to, // Envia 'endDate'
  });
  return fetchFromApi<SalesByPaymentType[]>(
    '/analytics/sales-by-payment-type',
    params
  );
}

/**
 * CU 7: Análise RFM de Clientes
 */
async function getRfmCustomers(dates: { from: string; to: string }) {
  console.log("rfm customers foi chamado")
  const params = new URLSearchParams({
    startDate: dates.from, // Envia 'startDate'
    endDate: dates.to, // Envia 'endDate'
  });
  // CORREÇÃO: Endpoint corrigido para 'customer-rfm'
  return fetchFromApi<RfmCustomer[]>('/analytics/customer-rfm', params);
}

// Exporta o objeto 'api' para ser usado nos Server Components
export const api = {
  parseDateRange,
  getRevenueOverTime,
  getTopProducts,
  getSalesByChannel,
  getAverageTicket,
  getSalesHeatmap,
  getSalesByPaymentType,
  getRfmCustomers,
};
