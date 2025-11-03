

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


export type SalesByChannel = {
  channelId: number
  channelName: string
  totalSales: number
  totalRevenue: number
}


export type AverageTicket = {
  average_ticket: number
  totalSales: number
  total_revenue: number
}


export type SalesHeatmapPoint = {
  hour: number
  channelId: number
  channelName: string
  totalSales: number
  totalRevenue: number
}


export type SalesByPaymentType = {
  paymentTypeId: number
  paymentTypeName: string
  totalRevenue: number
  totalTransactions: number
}


export type RfmCustomer = {
  customerId: number
  customerName: string
  lastPurchaseDate: string
  frequency: number
  monetaryValue: number
}




export type ChatMessage = {
  role: 'user' | 'model'
  parts: string
}

export type AIChatRequest = {
  prompt: string
  history: ChatMessage[]
  dateContext: string // <-- ADICIONE ESTA LINHA
}

export type AIExplainRequest = {
  dataContext: string
  dataJson: string
}


export type AIExplainResponse = {
  
  explanation: string
}


export type AIActionState<T> = {
  data: T | null
  error: string | null
}