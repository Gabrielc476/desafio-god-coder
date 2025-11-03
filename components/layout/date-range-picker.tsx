'use client'

import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

// 1. IMPORTAR o hook do estado global
import { useGlobalState } from '@/contexts/global-state-provider'

export function DateRangePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  
  // 2. REMOVER os hooks de router (useRouter, usePathname, useSearchParams)

  // 3. USAR o estado e a função de atualização do contexto global
  //    (dateRangeAsDate é o objeto Date, para o componente <Calendar />)
  //    (setDateRange é a função que atualiza o estado global)
  const { dateRangeAsDate, setDateRange } = useGlobalState()

  // 4. O handler de seleção agora chama `setDateRange` do contexto
  const handleDateSelect = (newDate: DateRange | undefined) => {
    // Só atualiza o estado global se o range for válido e completo
    if (newDate?.from && newDate?.to) {
      setDateRange({ from: newDate.from, to: newDate.to })
    }
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !dateRangeAsDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            
            {/* O texto do botão agora lê do estado global */}
            {dateRangeAsDate?.from ? (
              dateRangeAsDate.to ? (
                <>
                  {format(dateRangeAsDate.from, 'dd/MM/yyyy', { locale: ptBR })} -{' '}
                  {format(dateRangeAsDate.to, 'dd/MM/yyyy', { locale: ptBR })}
                </>
              ) : (
                format(dateRangeAsDate.from, 'dd/MM/yyyy', { locale: ptBR })
              )
            ) : (
              <span>Selecione um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRangeAsDate?.from}
            selected={dateRangeAsDate} // <-- O valor selecionado é controlado pelo contexto
            onSelect={handleDateSelect}   // <-- A seleção atualiza o contexto
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}