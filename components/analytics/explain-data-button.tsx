'use client'

import { useActionState, useState, useEffect } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { explainDataAction } from '@/lib/actions'
import { AIActionState } from '@/lib/types'

interface ExplainDataButtonProps {
  dataContext: string
  dataJson: string
}

export function ExplainDataButton({
  dataContext,
  dataJson,
}: ExplainDataButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // O useActionState está correto
  const [state, handleSubmit, isPending] = useActionState(explainDataAction, {
    data: null,
    error: null,
  })

  // Efeito para abrir o modal quando os dados chegarem
  useEffect(() => {
    if (state.data || state.error) {
      setIsModalOpen(true)
    }
  }, [state])

  // Limpa o estado ao fechar o modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    // NOTA: O 'state' não pode ser resetado diretamente
    //       mas o React 19 pode ter uma API `form.reset()`
  }

  return (
    <div>
      {/* *** A CORREÇÃO ESTÁ AQUI ***
        'onSubmit' foi substituído por 'action'.
        Isso informa ao React para tratar 'handleSubmit' 
        como uma Server Action, corrigindo o erro de transição.
      */}
      <form action={handleSubmit}>
        <input type="hidden" name="dataContext" value={dataContext} />
        <input type="hidden" name="dataJson" value={dataJson} />
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Explicar
        </Button>
      </form>

      {/* Modal para exibir a resposta */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>
              <Sparkles className="mr-2 inline-block h-5 w-5 text-primary" />
              Análise da IA
            </DialogTitle>
            <DialogDescription>
              A IA analisou os dados selecionados e gerou este resumo.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] p-4">
            {state.error && (
              <div className="text-sm text-destructive">{state.error}</div>
            )}
            {state.data && (
              <div className="prose prose-sm dark:prose-invert">
                {/* Usamos 'white-space: pre-wrap' para preservar 
                  as quebras de linha e formatação do Markdown da IA 
                */}
                <p style={{ whiteSpace: 'pre-wrap' }}>{state.data}</p>
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}