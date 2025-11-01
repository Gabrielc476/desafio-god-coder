'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { addDays, format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Importa a localização pt-BR
import { DateRange } from 'react-day-picker';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Componente principal do seletor de período
export function DateRangePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Função para criar a string da URL com os novos parâmetros
  const createQueryString = React.useCallback(
    (params: Record<string, string>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        newSearchParams.set(key, value);
      });
      return newSearchParams.toString();
    },
    [searchParams]
  );

  // Lê as datas 'from' e 'to' da URL
  const fromDate = searchParams.get('from');
  const toDate = searchParams.get('to');

  // Define o estado inicial com base na URL
  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    const from = fromDate ? new Date(fromDate) : undefined;
    const to = toDate ? new Date(toDate) : undefined;
    
    // Garante que as datas são válidas antes de definir o estado
    if (isValid(from) && isValid(to)) {
      return { from, to };
    }
    if (isValid(from)) {
      return { from, to: from }; // Se só 'from' é válido, define 'to' como 'from'
    }
    
    // Estado padrão (ex: últimos 7 dias) se nada estiver na URL
    const defaultFrom = addDays(new Date(), -7);
    const defaultTo = new Date();
    return { from: defaultFrom, to: defaultTo };
  });

  // Efeito para atualizar a URL quando o estado 'date' mudar
  React.useEffect(() => {
    if (date?.from && date?.to) {
      const query = createQueryString({
        from: format(date.from, 'yyyy-MM-dd'),
        to: format(date.to, 'yyyy-MM-dd'),
      });
      // Usa router.push para atualizar a URL e revalidar os Server Components
      router.push(`${pathname}?${query}`);
    }
  }, [date, createQueryString, pathname, router]);


  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'dd/MM/yyyy', { locale: ptBR })} -{' '}
                  {format(date.to, 'dd/MM/yyyy', { locale: ptBR })}
                </>
              ) : (
                format(date.from, 'dd/MM/yyyy', { locale: ptBR })
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
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            locale={ptBR} // Aplica a localização pt-BR ao calendário
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
