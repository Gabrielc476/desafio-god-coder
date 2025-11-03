'use client'

import { useState, useEffect, useRef } from 'react'
import { useActionState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { askAIAction } from '@/lib/actions'
import { AIActionState, ChatMessage } from '@/lib/types'
import { ArrowUp, Bot, Loader2, User } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

const initialState: AIActionState<ChatMessage> = {
  data: null,
  error: null,
}

interface ChatInterfaceProps {
  dateContext: string;
}

// Componente "Digitando..."
function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1.5">
      <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-current" />
    </div>
  )
}

export function ChatInterface({ dateContext }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      parts: 'Olá! Sou a Nola IA. Pergunte-me sobre suas vendas, produtos ou clientes.',
    },
  ])
  const [prompt, setPrompt] = useState('')

  // *** MUDANÇA 1: Renomear 'dispatch' para 'formAction' para clareza ***
  const [state, formAction, isPending] = useActionState(
    askAIAction,
    initialState,
  )

  const lastProcessedState = useRef(initialState)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // *** MUDANÇA 2: Criar um handler síncrono APENAS para a UI ***
  const handleOptimisticSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Não usamos e.preventDefault()
    // Este handler roda, e DEPOIS o 'action' do form é disparado.

    const currentPrompt = prompt.trim()
    if (!currentPrompt || isPending) {
      e.preventDefault() // Previne o envio se estiver vazio ou pendente
      return
    }

    // Atualização Otimista: Adiciona a mensagem do usuário
    const userMessage: ChatMessage = { role: 'user', parts: currentPrompt }
    setMessages((prev) => [...prev, userMessage])
    setPrompt('') // Limpa o input
  }

  // useEffect para reagir à *resposta* (sem alterações)
  useEffect(() => {
    if (state === lastProcessedState.current) {
      return
    }
    lastProcessedState.current = state

    if (state.data === null && state.error === null) {
      return
    }

    const responseData = state.data
    const responseError = state.error

    if (responseData) {
      setMessages((prev) => [...prev, responseData])
    } else if (responseError) {
      const errorMessage: ChatMessage = {
        role: 'model',
        parts: `Desculpe, ocorreu um erro: ${responseError}. Tente perguntar de outra forma.`,
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }, [state])

  // useEffect para auto-scroll (sem alterações)
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]',
      )
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight
      }
    }
  }, [messages, isPending])

  return (
    <Card className="flex h-[75vh] flex-col">
      <CardHeader>
        <p className="text-sm text-muted-foreground">
          Pergunte sobre os dados no período selecionado.
        </p>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                  msg.role === 'user' && 'justify-end',
                )}
              >
                {msg.role === 'model' && (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="h-5 w-5" />
                  </span>
                )}
                <div
                  className={cn(
                    'max-w-[75%] rounded-lg p-3 text-sm',
                    'prose prose-sm prose-invert max-w-none',
                    msg.role === 'user'
                      ? 'bg-muted prose-neutral'
                      : 'bg-primary text-primary-foreground',
                  )}
                >
                  <ReactMarkdown>{msg.parts}</ReactMarkdown>
                </div>
                {msg.role === 'user' && (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <User className="h-5 w-5" />
                  </span>
                )}
              </div>
            ))}
            {/* O 'isPending' agora funcionará corretamente */}
            {isPending && (
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Bot className="h-5 w-5" />
                </span>
                <div className="rounded-lg bg-primary px-4 py-3 text-primary-foreground">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        {/* *** MUDANÇA 3: Usar 'action' e 'onSubmit' juntos *** */}
        <form
          action={formAction} // O 'action' real (corrige o erro)
          onSubmit={handleOptimisticSubmit} // O handler otimista (síncrono)
          className="flex w-full gap-2"
        >
          <Input
            name="prompt" // <-- 'name' é obrigatório para o FormData
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Qual foi o meu ticket médio no iFood ontem?"
            disabled={isPending}
          />
          {/* *** MUDANÇA 4: Passar 'history' e 'dateContext' via hidden inputs *** */}
          <input
            type="hidden"
            name="history"
            value={JSON.stringify(messages.slice(1))}
          />
          <input type="hidden" name="dateContext" value={dateContext} />

          <Button type="submit" disabled={isPending || !prompt.trim()}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}