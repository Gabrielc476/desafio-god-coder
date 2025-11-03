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

import { MarkdownRenderer } from './markdown-renderer'

interface ExplainDataButtonProps {
  dataContext: string
  dataJson: string
}

export function ExplainDataButton({
  dataContext,
  dataJson,
}: ExplainDataButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [state, handleSubmit, isPending] = useActionState(explainDataAction, {
    data: null,
    error: null,
  })

  
  useEffect(() => {
    

    if (state.data || state.error) {
     
      setIsModalOpen(true)
    }
  }, [state]) 
  const handleCloseModal = () => {
    console.log(
      '%c[handleCloseModal] Botão "Fechar" clicado. Chamando setIsModalOpen(false).',
      'color: cyan;',
    )
    setIsModalOpen(false)
   
  }

  
  

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

      
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        
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