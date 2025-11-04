'use server'

import {
  // --- Tipos para a IA ---
  AIChatRequest,
  AIExplainRequest,
  AIExplainResponse,
  ChatMessage,
  AIActionState,

  // --- Tipos para o Dashboard ---
  AverageTicket,
  RevenueDataPoint,
  TopProduct,
  SalesByChannel,
  SalesHeatmapPoint,
  SalesByPaymentType,
  RfmCustomer,
} from './types'

// Import da API (para buscar dados)
import { api } from './api'

// A URL base da API Backend (para IA).
const API_URL = process.env.BACKEND_API_URL || 'http://localhost:3333/api/v1'

// --- Tipos de Dados para as Actions ---

type DateRangeParams = {
  from: string
  to: string
}

export type DashboardData = {
  averageTicket: AverageTicket | { average_ticket: 0; totalSales: 0; total_revenue: 0 }
  topProducts: TopProduct[]
  revenueOverTime: RevenueDataPoint[]
  totalRevenue: number
}

// A página de Canais só busca dados de canais
export type CanaisData = {
  salesByChannel: SalesByChannel[]
}

// A página de Pagamentos só busca dados de pagamentos
export type PagamentosData = {
  salesByPaymentType: SalesByPaymentType[]
}

// A página de Heatmap só busca dados de heatmap
export type HeatmapData = {
  salesHeatmap: SalesHeatmapPoint[]
}

// Tipo para os parâmetros do Relatório Dinâmico
export type DynamicReportParams = {
  dimension: 'product' | 'channel' | 'payment' | 'customer' | 'time'
  dateRange: DateRangeParams
}

// --- FIM dos Tipos ---

/**
 * Server Action para buscar os dados do Dashboard Principal
 */
export async function getDashboardDataAction(
  dateRange: DateRangeParams,
): Promise<DashboardData> {
  
  const [averageTicket, topProducts, revenueOverTime] = await Promise.all([
    api.getAverageTicket(dateRange).catch(() => ({
      average_ticket: 0,
      totalSales: 0,
      total_revenue: 0,
    })),
    api.getTopProducts(dateRange, 10).catch(() => []),
    api.getRevenueOverTime(dateRange, 'day').catch(() => []),
  ])
  const totalRevenue = (revenueOverTime || []).reduce(
    (sum, item) => sum + (item.totalRevenue || 0),
    0,
  )
  return {
    averageTicket,
    topProducts,
    revenueOverTime,
    totalRevenue,
  }
}

/**
 * Server Action para a Página de Produtos (Top Products)
 */
export async function getTopProductsAction(
  dateRange: DateRangeParams,
): Promise<TopProduct[]> {
  
  // Usamos um limite alto (10) para o relatório dedicado de produtos
  return api.getTopProducts(dateRange, 10).catch(() => [])
}

/**
 * Server Action para a Página de Canais
 */
export async function getCanaisDataAction(
  dateRange: DateRangeParams,
): Promise<CanaisData> {
  // 1. Busca os dados brutos da API, que podem conter duplicatas
  const salesByChannelRaw = await api.getSalesByChannel(dateRange).catch(() => [])

  // --- INÍCIO DA CORREÇÃO ---

  // 2. Agrega os dados por 'channelName'
  // Usamos .reduce() para criar um mapa (objeto) onde a chave é o 'channelName'.
  const aggregatedMap = salesByChannelRaw.reduce(
    (acc, channel) => {
      const name = channel.channelName

      if (!acc[name]) {
        // Se é a primeira vez que vemos esse 'channelName',
        // criamos uma nova entrada (copiando o objeto com spread '...').
        acc[name] = { ...channel }
      } else {
        // Se o 'channelName' já existe no nosso mapa, somamos os valores.
        acc[name].totalSales += channel.totalSales
        acc[name].totalRevenue += channel.totalRevenue
      }

      return acc
    },
    {} as Record<string, SalesByChannel>, // O acumulador (acc) é um mapa de string -> SalesByChannel
  )

  // 3. Converte o mapa agregado de volta para um array
  const salesByChannel = Object.values(aggregatedMap)

  // 4. (Opcional) Ordena o resultado final por receita, já que a agregação
  // pode ter bagunçado a ordem original.
  salesByChannel.sort((a, b) => b.totalRevenue - a.totalRevenue)

  // --- FIM DA CORREÇÃO ---

  // 5. Retorna os dados limpos e agregados
  return {
    salesByChannel,
  }
}

/**
 * Server Action para a Página de Pagamentos
 */
export async function getPagamentosDataAction(
  dateRange: DateRangeParams,
): Promise<PagamentosData> {
  
  const salesByPaymentType = await api.getSalesByPaymentType(dateRange).catch(() => [])
  return {
    salesByPaymentType,
  }
}

/**
 * Server Action para a Página de Heatmap
 */
export async function getHeatmapDataAction(
  dateRange: DateRangeParams,
): Promise<HeatmapData> {
  
  const salesHeatmap = await api.getSalesHeatmap(dateRange).catch(() => [])
  return {
    salesHeatmap,
  }
}

/**
 * Server Action para buscar os dados do Relatório Dinâmico
 */
export async function getDynamicReportAction({
  dimension,
  dateRange,
}: DynamicReportParams): Promise<any[]> {
 

  // O 'switch' roteia para a função de API correta
  switch (dimension) {
    case 'product':
      // Buscamos todos os produtos (limite alto para relatório)
      return api.getTopProducts(dateRange, 200).catch(() => [])
    case 'channel':
      return api.getSalesByChannel(dateRange).catch(() => [])
    case 'payment':
      return api.getSalesByPaymentType(dateRange).catch(() => [])
    case 'customer':
      return api.getRfmCustomers(dateRange).catch(() => [])
    case 'time':
      return api.getRevenueOverTime(dateRange, 'day').catch(() => [])
    default:
      return []
  }
}


// --- ACTIONS DE IA (Do seu arquivo original) ---

/**
 * Server Action para o Chat Geral (Caso de Uso 8)
 */
export async function askAIAction(
  previousState: AIActionState<ChatMessage>,
  formData: FormData,
): Promise<AIActionState<ChatMessage>> {
  const prompt = formData.get('prompt') as string
  const historyString = formData.get('history') as string
  
  const dateContext = formData.get('dateContext') as string

  if (!prompt) {
    return { data: null, error: 'Prompt é obrigatório.' }
  }
  
  if (!dateContext) {
    return { data: null, error: 'Contexto de data é obrigatório.' }
  }

  let history: ChatMessage[] = []
  try {
    history = JSON.parse(historyString || '[]')
  } catch (e) {
    console.error('Erro ao parsear histórico do chat:', e)
    return { data: null, error: 'Histórico de chat inválido.' }
  }

 
  const requestBody: AIChatRequest = {
    prompt,
    history,
    dateContext, 
  }

  try {
    const res = await fetch(`${API_URL}/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    })

    if (!res.ok) {
      const errorBody = await res.json()
      
      return { data: null, error: errorBody.error || 'Erro ao contatar a IA.' }
    }

    const data: { response: string } = await res.json()

    return {
      data: { role: 'model', parts: data.response },
      error: null,
    }
  } catch (error) {
    
    return { data: null, error: 'Erro de rede ao conectar com o assistente.' }
  }
}

/**
 * Server Action para "Explicar Dados" (Caso de Uso 9)
 */
export async function explainDataAction(
  previousState: AIActionState<string>,
  formData: FormData,
): Promise<AIActionState<string>> {
 
  const dataContext = formData.get('dataContext') as string
  const dataJson = formData.get('dataJson') as string
  if (!dataContext || !dataJson) {
    console.error('[explainDataAction] ERRO: Contexto ou JSON ausentes.')
    return { data: null, error: 'Contexto e dados são obrigatórios.' }
  }
  const requestBody: AIExplainRequest = {
    dataContext,
    dataJson,
  }
  const url = `${API_URL}/ai/explain`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    })

    if (!res.ok) {
      const errorBody = await res
        .json()
        .catch(() => ({ error: 'Resposta de erro ilegível ou sem corpo' }))
      console.error(
        '[explainDataAction] ERRO da API Backend (/ai/explain):',
        errorBody,
      )
      return {
        data: null,
        error: errorBody.error || `Erro ao gerar explicação., por favor tente de novo em alguns segundos`,
      }
    }
    const data: AIExplainResponse = await res.json()
    return { data: data.explanation, error: null }
  } catch (error) {
    console.error('[explainDataAction] ERRO de Rede/Fetch:', error)
    // @ts-expect-error: error pode ser de tipo desconhecido
    const errorMessage = error.message || 'Erro de rede desconhecido.'
    return {
      data: null,
      error: `Erro de rede ao conectar com a IA: ${errorMessage}`,
    }
  }
}