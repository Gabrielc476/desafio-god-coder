'use client'

// Estamos usando a versão com useEffect e useState para depurar
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
// Importamos o renderer que já corrigimos
import { MarkdownRenderer } from './markdown-renderer'

interface ExplainDataButtonProps {
  dataContext: string
  dataJson: string
}

export function ExplainDataButton({
  dataContext,
  dataJson,
}: ExplainDataButtonProps) {
  // --- LÓGICA DE ESTADO (A Causa Provável do Bug) ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [state, handleSubmit, isPending] = useActionState(explainDataAction, {
    data: null,
    error: null,
  })

  // --- LOG 1: DENTRO DO useEffect ---
  // Este log nos mostrará se o useEffect está reabrindo o modal
  useEffect(() => {
    console.log('%c[useEffect] Disparado.', 'color: orange;')
    console.log(`[useEffect] state.data existe? ${!!state.data}`)
    console.log(`[useEffect] state.error existe? ${!!state.error}`)

    if (state.data || state.error) {
      console.log(
        '%c[useEffect] CONDIÇÃO ATINGIDA. Chamando setIsModalOpen(true).',
        'color: red; font-weight: bold;',
      )
      setIsModalOpen(true)
    }
  }, [state]) // Dispara toda vez que 'state' muda

  // --- LOG 2: DENTRO DO handleCloseModal ---
  // Este log nos mostrará se o clique no botão está sendo registrado
  const handleCloseModal = () => {
    console.log(
      '%c[handleCloseModal] Botão "Fechar" clicado. Chamando setIsModalOpen(false).',
      'color: cyan;',
    )
    setIsModalOpen(false)
    // NOTA: 'state.data' não é limpo aqui. Esse é o problema.
  }

  // --- LOG 3: DENTRO DO RENDER ---
  // Este log mostrará cada renderização do componente
  console.log(
    `%c[Render] Componente renderizando...`,
    'color: lightgreen;',
  )
  console.log(`[Render] Valor ATUAL de isModalOpen: ${isModalOpen}`)
  console.log(
    `[Render] Valor ATUAL de state.data: ${
      state.data ? state.data.substring(0, 20) + '...' : 'null'
    }`,
  )

  return (
    <div>
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

      {/* O modal usa 'isModalOpen' do useState */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        {/* Usamos a largura que você gostou */}
        <DialogContent className="sm:max-w-[893px]">
          <DialogHeader>
            <DialogTitle>
              <Sparkles className="mr-2 inline-block h-5 w-5 text-primary" />
              Análise da IA
            </DialogTitle>
            <DialogDescription>
              A IA analisou os dados selecionados e gerou este resumo.
            </DialogDescription>
          </DialogHeader>

          {/* Usamos o renderer que já está corrigido */}
          <ScrollArea className="max-h-[60vh] p-4">
            {state.error && (
              <div className="text-sm text-destructive">{state.error}</div>
            )}
            {state.data && <MarkdownRenderer content={state.data} />}
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