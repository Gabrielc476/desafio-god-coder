// app/(main)/chat/page.tsx
'use client'

import React from 'react'
import { ChatInterface } from '@/components/analytics/chat-interface'
// CORREÇÃO: Importar o tipo 'DateRangeString' do provider onde ele é definido
import {
  useGlobalState,
  type DateRangeString,
} from '@/contexts/global-state-provider'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Formata um objeto DateRangeString para uma string de contexto legível.
 * Ex: "1 de jan. de 2024 a 31 de jan. de 2024"
 */
function formatDateContext(dateRange: DateRangeString): string {
  const formatString = 'd MMM yyyy'

  // 1. Converte as strings ISO 'from' e 'to' em objetos Date.
  const fromDate = parseISO(dateRange.from)
  const toDate = parseISO(dateRange.to)

  // 2. Formata os objetos Date
  const fromFormatted = format(fromDate, formatString, { locale: ptBR })
  const toFormatted = format(toDate, formatString, { locale: ptBR })

  return `O usuário está analisando o período de ${fromFormatted} a ${toFormatted}.`
}

/**
 * Página do Chat com a IA (Nola IA)
 */
export default function ChatPage() {
  // 'dateRange' é do tipo DateRangeString
  const { dateRange } = useGlobalState()

  // A função agora recebe o tipo correto
  const dateContext = formatDateContext(dateRange)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Assistente Nola IA</h2>
      </div>

      <ChatInterface dateContext={dateContext} />
    </div>
  )
}