import {
  RevenueDataPoint,
  TopProduct,
  SalesByChannel,
  AverageTicket,
  SalesHeatmapPoint,
  SalesByPaymentType,
  RfmCustomer,
  // CORREÇÃO: Removido 'PageSearchParams' que não estava sendo exportado
} from './types';

// A URL base da nossa API Backend (Node.js)
// Em produção, isso viria de uma variável de ambiente (process.env.BACKEND_API_URL)
const BASE_URL = 'http://localhost:3333/v1';

/**
 * Função genérica para buscar dados da nossa API interna.
 * Esta função SÓ DEVE ser chamada do lado do servidor (RSCs, Server Actions).
 *
 * @param path O caminho do endpoint da API (ex: "/analytics/revenue")
 * @param params Um objeto de URLSearchParams para adicionar à query string
 * @returns A resposta JSON parseada e tipada
 */
async function fetchFromApi<T>(
  path: string,
  params: URLSearchParams = new URLSearchParams()
): Promise<T> {
  const url = `${BASE_URL}${path}?${params.toString()}`;

  console.log(`[API Fetch] ${url}`); // Log para debug no servidor

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

    return response.json() as T;
  } catch (error) {
    console.error(`[API Fetch Failed] ${error}`);
    // Em um app real, poderíamos ter um sistema de 'Error Boundary'
    // Para Server Components, o Next.js usará o 'error.tsx' mais próximo.
    throw new Error(`Erro de rede ou conexão ao buscar: ${url}`);
  }
}

// --- Funções Auxiliares ---

/**
 * Pega o 'from' e 'to' da URL (searchParams) e retorna datas válidas.
 * Se não houver, retorna o default (últimos 30 dias).
 */
function parseDateRange(
  // CORREÇÃO: Usando o tipo explícito ao invés do 'PageSearchParams'
  searchParams: { [key: string]: string | undefined }
) {
  // CORREÇÃO: Trocado 'let' por 'const' (ESLint)
  const { from, to } = searchParams;

  if (!from || !to) {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(toDate.getDate() - 30); // Default: 30 dias atrás

    return {
      from: fromDate.toISOString().split('T')[0], // YYYY-MM-DD
      to: toDate.toISOString().split('T')[0], // YYYY-MM-DD
    };
  }
  return { from, to };
}

// --- SDK da API de Analytics (Casos de Uso 1-7) ---

/**
 * CU 1: Receita Total, Pedidos Totais, Ticket Médio
 */
async function getRevenueAnalytics(dates: { from: string; to: string }) {
  const params = new URLSearchParams(dates);
  return fetchFromApi<RevenueDataPoint[]>('/analytics/revenue-over-time', params);
}

/**
 * CU 2: Top 5 Produtos
 */
async function getTopProducts(dates: { from: string; to: string }) {
  const params = new URLSearchParams(dates);
  return fetchFromApi<TopProduct[]>('/analytics/top-products', params);
}

/**
 * CU 3: Vendas por Canal
 */
async function getSalesByChannel(dates: { from: string; to: string }) {
  const params = new URLSearchParams(dates);
  return fetchFromApi<SalesByChannel[]>('/analytics/sales-by-channel', params);
}

/**
 * CU 4: Ticket Médio (Geral)
 * Nota: O backend retorna um objeto, não um array
 */
async function getAverageTicket(dates: { from: string; to: string }) {
  const params = new URLSearchParams(dates);
  return fetchFromApi<AverageTicket>('/analytics/average-ticket', params);
}

/**
 * CU 5: Mapa de Calor (Vendas por Hora/Canal)
 */
async function getSalesHeatmap(dates: { from: string; to: string }) {
  const params = new URLSearchParams(dates);
  return fetchFromApi<SalesHeatmapPoint[]>('/analytics/sales-heatmap', params);
}

/**
 * CU 6: Vendas por Tipo de Pagamento
 */
async function getSalesByPaymentType(dates: { from: string; to: string }) {
  const params = new URLSearchParams(dates);
  return fetchFromApi<SalesByPaymentType[]>(
    '/analytics/sales-by-payment-type',
    params
  );
}

/**
 * CU 7: Análise RFM de Clientes
 */
async function getRfmCustomers(dates: { from: string; to: string }) {
  const params = new URLSearchParams(dates);
  return fetchFromApi<RfmCustomer[]>('/analytics/rfm-customers', params);
}

// Exporta o objeto 'api' para ser usado nos Server Components
export const api = {
  parseDateRange,
  getRevenueAnalytics,
  getTopProducts,
  getSalesByChannel,
  getAverageTicket,
  getSalesHeatmap,
  getSalesByPaymentType,
  getRfmCustomers,
};

