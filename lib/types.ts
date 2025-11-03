// --- Tipos de Dados Brutos (Casos de Uso 1-7) ---

export type RevenueDataPoint = {
  date: string
  totalRevenue: number
}

export type TopProduct = {
  productId: number
  name: string
  totalSold: number
  totalRevenue: number
}

// Este tipo (camelCase) já corresponde ao que o log [DEBUG Canais] mostrou
export type SalesByChannel = {
  channelId: number
  channelName: string
  totalSales: number
  totalRevenue: number
}

// Este tipo foi corrigido e permanece (snake_case)
// pois a função getAverageTicket está adaptando
export type AverageTicket = {
  average_ticket: number
  totalSales: number
  total_revenue: number
}

/**
 * *** CORRIGIDO ***
 * Este tipo agora reflete EXATAMENTE o que a API envia (baseado no seu log).
 */
export type SalesHeatmapPoint = {
  hour: number
  channelId: number
  channelName: string
  totalSales: number
  totalRevenue: number
}

// Este tipo (camelCase) já corresponde ao que o log [DEBUG Pagamentos] mostrou
export type SalesByPaymentType = {
  paymentTypeId: number
  paymentTypeName: string
  totalRevenue: number
  totalTransactions: number
}

// Este tipo (camelCase) já corresponde ao que o log [DEBUG Clientes] mostrou
export type RfmCustomer = {
  customerId: number
  customerName: string
  lastPurchaseDate: string
  frequency: number
  monetaryValue: number
}


// --- Tipos para a IA (Casos de Uso 8-9) ---
// (ChatMessage, AIChatRequest, etc. permanecem iguais)

export type ChatMessage = {
  role: 'user' | 'model'
  parts: string
}

export type AIChatRequest = {
  prompt: string
  history: ChatMessage[]
}

export type AIExplainRequest = {
  dataContext: string
  dataJson: string
}

export type AIExplainResponse = {
  response: string
}

export type AIActionState<T> = {
  data: T | null
  error: string | null
}