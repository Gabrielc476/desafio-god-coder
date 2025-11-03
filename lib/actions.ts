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
  console.log(
    `[Server Action] Buscando dados para ${dateRange.from} a ${dateRange.to}`,
  )
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
 * Server Action para a Página de Canais
 */
export async function getCanaisDataAction(
  dateRange: DateRangeParams,
): Promise<CanaisData> {
  console.log(
    `[Server Action] Buscando dados de CANAIS para ${dateRange.from} a ${dateRange.to}`,
  )
  const salesByChannel = await api.getSalesByChannel(dateRange).catch(() => [])
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
  console.log(
    `[Server Action] Buscando dados de PAGAMENTOS para ${dateRange.from} a ${dateRange.to}`,
  )
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
  console.log(
    `[Server Action] Buscando dados de HEATMAP para ${dateRange.from} a ${dateRange.to}`,
  )
  const salesHeatmap = await api.getSalesHeatmap(dateRange).catch(() => [])
  return {
    salesHeatmap,
  }
}

/**
 * *** NOVA ACTION ***
 * Server Action para buscar os dados do Relatório Dinâmico
 */
export async function getDynamicReportAction({
  dimension,
  dateRange,
}: DynamicReportParams): Promise<any[]> {
  console.log(
    `[Server Action] Gerando relatório dinâmico por [${dimension}]`,
  )

  // O 'switch' roteia para a função de API correta
  switch (dimension) {
    case 'product':
      // Buscamos todos os produtos (limite alto)
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

  if (!prompt) {
    return { data: null, error: 'Prompt é obrigatório.' }
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
  }

  try {
    const res = await fetch(`${API_URL}/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      cache: 'no-store', // Mutações nunca devem ser cacheadas
    })

    if (!res.ok) {
      const errorBody = await res.json()
      console.error('Erro da API Backend (/ai/ask):', errorBody)
      return { data: null, error: errorBody.error || 'Erro ao contatar a IA.' }
    }

    const data: { response: string } = await res.json()

    return {
      data: { role: 'model', parts: data.response },
      error: null,
    }
  } catch (error) {
    console.error('Erro de rede na askAIAction:', error)
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
    return { data: null, error: 'Contexto e dados são obrigatórios.' }
  }

  const requestBody: AIExplainRequest = {
    dataContext,
    dataJson,
  }

  try {
    const res = await fetch(`${API_URL}/ai/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    })

    if (!res.ok) {
      const errorBody = await res.json()
      console.error('Erro da API Backend (/ai/explain):', errorBody)
      return { data: null, error: errorBody.error || 'Erro ao gerar explicação.' }
    }

    const data: AIExplainResponse = await res.json()
    return { data: data.response, error: null }
  } catch (error) {
    console.error('Erro de rede na explainDataAction:', error)
    return { data: null, error: 'Erro de rede ao conectar com a IA.' }
  }
}