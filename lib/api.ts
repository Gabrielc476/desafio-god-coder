import {
  RevenueDataPoint,
  TopProduct,
  SalesByChannel,
  AverageTicket,
  SalesHeatmapPoint,
  SalesByPaymentType,
  RfmCustomer,
} from './types'
import { isValid } from 'date-fns'

// A URL base da nossa API Backend (Node.js)
const BASE_URL = 'http://localhost:3333/api/v1'

/**
 * Função genérica para buscar dados da nossa API interna.
 * Logs genéricos removidos.
 */
async function fetchFromApi<T>(
  path: string,
  params: URLSearchParams = new URLSearchParams()
): Promise<T> {
  const url = `${BASE_URL}${path}?${params.toString()}`

  try {
    const response = await fetch(url, {
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      console.error(`[API Error] Status ${response.status}:`, errorBody)
      throw new Error(
        `Falha ao buscar dados da API: ${response.status} ${response.statusText}`
      )
    }

    const data: T = await response.json()
    return data
  } catch (error) {
    console.error(`[API Fetch Failed] ${error}`)
    throw new Error(`Erro de rede ou conexão ao buscar: ${url}`)
  }
}

// --- Funções Auxiliares ---

// Esta função não é mais usada pelas páginas de Cliente,
// mas pode ser usada por outras páginas RSC.
function parseDateRange(dateParams: {
  from?: string | string[] | undefined
  to?: string | string[] | undefined
}) {
  const params = dateParams || {}
  const from = Array.isArray(params.from) ? params.from[0] : params.from
  const to = Array.isArray(params.to) ? params.to[0] : params.to

  if (from && to && isValid(new Date(from)) && isValid(new Date(to))) {
    return { from, to }
  }

  const toDate = new Date('2025-10-31T00:00:00Z')
  const fromDate = new Date('2025-10-02T00:00:00Z')

  console.log(
    `[API Date] Usando datas DEFAULT: ${fromDate.toISOString().split('T')[0]} a ${toDate.toISOString().split('T')[0]}`
  )

  return {
    from: fromDate.toISOString().split('T')[0],
    to: toDate.toISOString().split('T')[0],
  }
}

// --- SDK da API de Analytics ---

async function getRevenueOverTime(
  dates: { from: string; to: string },
  groupBy: 'day' | 'hour'
) {
  console.log('revenue over time foi chamado')
  const params = new URLSearchParams({
    startDate: dates.from,
    endDate: dates.to,
    groupBy,
  })
  return fetchFromApi<RevenueDataPoint[]>(
    '/analytics/revenue-over-time',
    params
  )
}

async function getTopProducts(dates: { from: string; to: string }, limit = 100) {
  console.log('top products foi chamado')
  const params = new URLSearchParams({
    startDate: dates.from,
    endDate: dates.to,
    limit: String(limit),
  })
  return fetchFromApi<TopProduct[]>('/analytics/top-products', params)
}

/**
 * CU 3: Vendas por Canal
 * *** CORRIGIDO COM BASE NO LOG ***
 */
/**
 * CU 3: Vendas por Canal
 * *** CORRIGIDO (Sem Adaptador) ***
 */
async function getSalesByChannel(dates: { from: string; to: string }): Promise<SalesByChannel[]> {
  console.log('channel foi chamado')
  const params = new URLSearchParams({
    startDate: dates.from,
    endDate: dates.to,
  })

  // 1. Buscar dados brutos (tipados com o NOVO tipo)
  const data = await fetchFromApi<SalesByChannel[]>(
    '/analytics/sales-by-channel',
    params
  )

  // 2. *** LOG SOLICITADO (Mantido) ***
  console.log('[DEBUG Canais] Dados brutos recebidos do backend:', data)

  // 3. Retornar os dados (sem adaptador)
  return Array.isArray(data) ? data : []
}

// (getAverageTicket permanece como estava, já corrigido)
async function getAverageTicket(dates: { from: string; to: string }): Promise<AverageTicket> {
  console.log('average ticket foi chamado')
  const params = new URLSearchParams({
    startDate: dates.from,
    endDate: dates.to,
  })
  const rawData: any = await fetchFromApi(
    '/analytics/overall-average-ticket',
    params
  )
  const formattedData: AverageTicket = {
    average_ticket: rawData.averageTicket || 0,
    totalSales: rawData.totalSales || 0,
    total_revenue: rawData.totalRevenue || 0,
  }
  return formattedData
}

/**
 * CU 5: Mapa de Calor (Vendas por Hora/Canal)
 * *** LOG ADICIONADO ***
 */
async function getSalesHeatmap(dates: { from: string; to: string }): Promise<SalesHeatmapPoint[]> {
  console.log('heatmap foi chamado')
  const params = new URLSearchParams({
    startDate: dates.from,
    endDate: dates.to,
  })

  // 1. Buscar dados brutos
  const data = await fetchFromApi<SalesHeatmapPoint[]>(
    '/analytics/sales-heatmap',
    params
  )
  
  // 2. *** LOG SOLICITADO ***
  console.log('[DEBUG Heatmap] Dados brutos recebidos do backend:', data)

  return Array.isArray(data) ? data : []
}

/**
 * CU 6: Vendas por Tipo de Pagamento
 * *** CORRIGIDO (Sem Adaptador, Log Mantido) ***
 */
async function getSalesByPaymentType(dates: { from: string; to: string }): Promise<SalesByPaymentType[]> {
  console.log('payment type foi chamado')
  const params = new URLSearchParams({
    startDate: dates.from,
    endDate: dates.to,
  })

  // 1. Buscar dados brutos (tipados com o tipo correto)
  const data = await fetchFromApi<SalesByPaymentType[]>(
    '/analytics/sales-by-payment-type',
    params
  )

  // 2. *** LOG SOLICITADO (Mantido) ***
  console.log('[DEBUG Pagamentos] Dados brutos recebidos do backend:', data)

  return Array.isArray(data) ? data : []
}
/**
 * CU 7: Análise RFM de Clientes
 * *** LOG REMOVIDO (Já corrigido) ***
 */
async function getRfmCustomers(dates: { from: string; to: string }): Promise<RfmCustomer[]> {
  console.log('rfm customers foi chamado')
  const params = new URLSearchParams({
    startDate: dates.from,
    endDate: dates.to,
  })

  const data = await fetchFromApi<RfmCustomer[]>(
    '/analytics/customer-rfm',
    params
  )

  return Array.isArray(data) ? data : []
}

// Exporta o objeto 'api'
export const api = {
  parseDateRange,
  getRevenueOverTime,
  getTopProducts,
  getSalesByChannel, // <-- Agora retorna a função corrigida
  getAverageTicket,
  getSalesHeatmap,
  getSalesByPaymentType, // <-- Agora retorna a função corrigida
  getRfmCustomers,
}