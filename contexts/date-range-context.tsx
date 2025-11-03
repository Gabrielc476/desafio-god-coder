'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { format } from 'date-fns'

// --- Definição dos Padrões ---
// Usamos EXATAMENTE os mesmos padrões da sua api.ts
const DEFAULT_FROM = new Date('2025-10-02T00:00:00Z')
const DEFAULT_TO = new Date('2025-10-31T00:00:00Z')

// O formato que a API espera (YYYY-MM-DD)
type DateRangeString = {
  from: string
  to: string
}

// O que o contexto fornecerá
type DateRangeContextType = {
  dateRange: DateRangeString // Datas como string para a API
  dateRangeAsDate: { from: Date; to: Date } // Datas como Date para o Picker
  setDateRange: (newRange: { from: Date; to: Date }) => void
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(
  undefined
)

export function DateRangeProvider({ children }: { children: ReactNode }) {
  // O estado é armazenado internamente como objetos Date
  const [date, setDate] = useState<{ from: Date; to: Date }>({
    from: DEFAULT_FROM,
    to: DEFAULT_TO,
  })

  // Função para atualizar o estado
  const handleSetDateRange = (newRange: { from: Date; to: Date }) => {
    setDate(newRange)
  }

  // Montamos o valor que será fornecido pelo contexto
  const value = {
    dateRange: {
      from: format(date.from, 'yyyy-MM-dd'),
      to: format(date.to, 'yyyy-MM-dd'),
    },
    dateRangeAsDate: date,
    setDateRange: handleSetDateRange,
  }

  return (
    <DateRangeContext.Provider value={value}>
      {children}
    </DateRangeContext.Provider>
  )
}

// Hook customizado para facilitar o uso
export function useDateRange() {
  const context = useContext(DateRangeContext)
  if (context === undefined) {
    throw new Error('useDateRange deve ser usado dentro de um DateRangeProvider')
  }
  return context
}