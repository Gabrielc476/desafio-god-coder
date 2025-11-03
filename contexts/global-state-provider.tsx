'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { format } from 'date-fns'

// --- Definição dos Padrões ---
const DEFAULT_FROM = new Date('2025-10-02T00:00:00Z')
const DEFAULT_TO = new Date('2025-10-31T00:00:00Z')

// Tipos para o formato de data
type DateRangeString = {
  from: string
  to: string
}
type DateRangeDate = {
  from: Date
  to: Date
}

// Define os tipos para o estado global
interface GlobalState {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  
  // --- ESTADO DE DATA (Refatorado) ---
  dateRange: DateRangeString // Formato YYYY-MM-DD (para as Server Actions)
  dateRangeAsDate: DateRangeDate // Formato Date (para os novos inputs)
  
  // Funções de atualização mais simples
  setFromDate: (newFrom: Date) => void
  setToDate: (newTo: Date) => void
  // setDateRange foi removido
}

// Cria o contexto
const GlobalStateContext = createContext<GlobalState | undefined>(undefined)

// Cria o provedor do contexto
export function GlobalStateProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  
  // O estado de data continua sendo um objeto único
  const [date, setDate] = useState<DateRangeDate>({
    from: DEFAULT_FROM,
    to: DEFAULT_TO,
  })

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // --- FUNÇÕES DE ATUALIZAÇÃO (Refatoradas) ---
  // Atualiza apenas a data 'from'
  const handleSetFromDate = (newFrom: Date) => {
    setDate(current => ({ ...current, from: newFrom }))
  }
  
  // Atualiza apenas a data 'to'
  const handleSetToDate = (newTo: Date) => {
    setDate(current => ({ ...current, to: newTo }))
  }

  const value = {
    isSidebarOpen,
    toggleSidebar,

    // O estado fornecido permanece o mesmo
    dateRange: {
      from: format(date.from, 'yyyy-MM-dd'),
      to: format(date.to, 'yyyy-MM-dd'),
    },
    dateRangeAsDate: date,
    
    // Fornecemos as novas funções
    setFromDate: handleSetFromDate,
    setToDate: handleSetToDate,
  }

  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  )
}

// Hook customizado para usar o contexto
export function useGlobalState() {
  const context = useContext(GlobalStateContext)
  if (context === undefined) {
    throw new Error('useGlobalState deve ser usado dentro de um GlobalStateProvider')
  }
  return context
}