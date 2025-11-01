'use client';

import * as React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { explainDataAction } from '@/lib/actions'; // CORREÇÃO: 'in' para 'from'
import { AIActionState } from '@/lib/types'; // CORREÇÃO: Importar o tipo de estado correto

// CORREÇÃO: Removida a interface 'ExplainActionState' local. Usaremos 'AIActionState'

// CORREÇÃO: Removido 'ButtonProps', estendido de 'ButtonHTMLAttributes'
interface ExplainDataButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  dataContext: string; // Ex: "Estes são os meus 5 produtos mais vendidos"
  dataJson: string; // Ex: JSON.stringify(products)
}

export function ExplainDataButton({
  dataContext,
  dataJson,
  // CORREÇÃO: Removido 'children', pois não é usado
  ...props
}: ExplainDataButtonProps) {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  // Hook 'useActionState' (React 19) para gerenciar a chamada da Server Action
  const [state, formAction, isPending] = useActionState(
    explainDataAction, // A Server Action que importamos
    // CORREÇÃO: Usar o estado inicial correto com 'data'
    { data: null, error: null } as AIActionState<string>
  );

  // Efeito para observar a mudança no 'state' e abrir o Sheet
  React.useEffect(() => {
    // CORREÇÃO: Verificar 'state.data' em vez de 'state.response'
    if (!isPending && (state.data || state.error)) {
      setIsSheetOpen(true); // ...abrimos o Sheet para mostrar o resultado.
    }
  }, [state, isPending]);

  // Função para lidar com o clique
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Cria um FormData e dispara a Server Action
    const formData = new FormData();
    formData.append('dataContext', dataContext);
    formData.append('dataJson', dataJson);
    formAction(formData); // CORREÇÃO: Isso agora está correto após o ajuste de tipo.
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Button
          type="submit"
          variant="outline"
          size="icon"
          disabled={isPending}
          {...props}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          <span className="sr-only">Explicar dados com IA</span>
        </Button>
      </form>

      {/* O Sheet (gaveta) que mostrará a resposta da IA */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Nola IA - Análise
            </SheetTitle>
            <SheetDescription>
              {/* O contexto que enviamos para a IA */}
              {dataContext}
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100%-120px)] w-full pr-4 mt-4">
            <div className="space-y-4">
              {/* CORREÇÃO: Verificar 'state.data' */}
              {isPending && !state.data && (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}

              {state.error && (
                <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
                  <strong>Erro ao analisar:</strong> {state.error}
                </div>
              )}

              {/* CORREÇÃO: Verificar 'state.data' */}
              {state.data && (
                // Renderiza a resposta da IA (idealmente como Markdown)
                <div
                  className="prose prose-sm dark:prose-invert"
                  // CORREÇÃO: Usar 'state.data'
                  dangerouslySetInnerHTML={{ __html: state.data.replace(/\n/g, '<br />') }}
                />
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}

