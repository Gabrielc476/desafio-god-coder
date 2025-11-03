import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils' // Importar o helper 'cn'

interface KpiCardProps {
  title: string
  value: string
  description: string
  size?: 'default' | 'large'
}

export function KpiCard({
  title,
  value,
  description,
  size = 'default',
}: KpiCardProps) {
  // Classes dinâmicas para o Valor (o número grande)
  const headerPadding = size === 'large' ? 'pb-4' : 'pb-2'
  const titleClass = size === 'large' ? 'text-4xl font-bold' : 'text-3xl'

  return (
    <Card>
      <CardHeader className={cn('pb-2', headerPadding)}>
        {/* --- MUDANÇA AQUI ---
          1. Aumentamos a fonte (de 'text-sm' para 'text-base')
          2. Demos peso ('font-semibold')
          3. Mudamos a cor (de 'text-muted-foreground' para 'text-foreground')
        */}
        <CardDescription
          className={cn('text-base font-semibold text-foreground')}
        >
          {title}
        </CardDescription>

        {/* O valor (número) continua como estava */}
        <CardTitle className={cn(titleClass)}>{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground">{description}</div>
      </CardContent>
    </Card>
  )
}