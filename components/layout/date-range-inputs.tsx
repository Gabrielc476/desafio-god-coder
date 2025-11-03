'use client'

import React from 'react'
import { format, parseISO, isValid } from 'date-fns'
import { useGlobalState } from '@/contexts/global-state-provider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label' // Usamos Label para acessibilidade

export function DateRangeInputs() {
  // 1. Pegamos o estado e as novas funções do contexto
  const { dateRangeAsDate, setFromDate, setToDate } = useGlobalState()

  // 2. Handler para a data INICIAL
  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = parseISO(e.target.value)
    if (isValid(date)) {
      setFromDate(date)
    }
  }

  // 3. Handler para a data FINAL
  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = parseISO(e.target.value)
    if (isValid(date)) {
      setToDate(date)
    }
  }

  return (
    <div className="flex flex-row items-center gap-4">
      {/* Input de Data Mínima */}
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="date-from" className="text-xs text-muted-foreground">
          De
        </Label>
        <Input
          id="date-from"
          type="date"
          value={format(dateRangeAsDate.from, 'yyyy-MM-dd')}
          onChange={handleFromChange}
          className="w-full md:w-[180px]"
        />
      </div>
      
      {/* Input de Data Máxima */}
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="date-to" className="text-xs text-muted-foreground">
          Até
        </Label>
        <Input
          id="date-to"
          type="date"
          value={format(dateRangeAsDate.to, 'yyyy-MM-dd')}
          onChange={handleToChange}
          className="w-full md:w-[180px]"
        />
      </div>
    </div>
  )
}