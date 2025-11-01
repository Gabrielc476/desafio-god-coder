import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface KpiCardProps {
  title: string;
  value: string;
  description: string;
}

// Este é um Server Component.
// Ele é simples, apenas exibe dados, não precisa de interatividade.
export function KpiCard({ title, value, description }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground">{description}</div>
      </CardContent>
    </Card>
  );
}

