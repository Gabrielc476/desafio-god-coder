'use client';

import { useState, useEffect, useRef } from 'react'; // 1. Importar useEffect e useRef
import { useActionState } from 'react'; // React 19
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// CORREÇÃO (TS2724): Corrigido o case de 'askAIAction'
import { askAIAction } from '@/lib/actions';
import { AIActionState, ChatMessage } from '@/lib/types';
import { ArrowUp, Bot, Loader2, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown'; // Lembre-se: npm install react-markdown

// O estado inicial da nossa Server Action
// CORREÇÃO (TS2554): O tipo agora é ChatMessage, e não string
const initialState: AIActionState<ChatMessage> = {
  data: null,
  error: null,
};

interface ChatInterfaceProps {
  dateContext: string; // Ex: "O usuário está vendo o período X a Y"
}

export function ChatInterface({ dateContext }: ChatInterfaceProps) {
  // 1. Histórico de mensagens da UI
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      parts: 'Olá! Sou a Nola IA. Pergunte-me sobre suas vendas, produtos ou clientes.',
    },
  ]);

  // 2. O prompt atual que o usuário está digitando
  const [prompt, setPrompt] = useState('');

  // 3. Hook useActionState para lidar com a chamada da Server Action
  // A correção no 'initialState' resolve o erro de tipo no 'dispatch'
  const [state, dispatch, isPending] = useActionState(askAIAction, initialState);

  // 4. Ref para rastrear o último 'state' que já processamos
  // Isso evita que o useEffect adicione a mesma resposta da IA múltiplas vezes
  const lastProcessedState = useRef(initialState);

  // 5. Handler para enviar o formulário
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const currentPrompt = prompt.trim();
    if (!currentPrompt || isPending) return;

    // 5A. Atualização Otimista: Adiciona a mensagem do usuário à UI
    const userMessage: ChatMessage = { role: 'user', parts: currentPrompt };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt(''); // Limpa o input

    // 5B. Prepara o FormData para a Server Action
    const formData = new FormData();
    formData.append('prompt', currentPrompt);
    formData.append('dateContext', dateContext);
    // Envia o histórico (sem a msg de boas-vindas, mas com a msg atual)
    // A action 'askAIAction' espera o histórico *antes* da msg atual
    const history = [...messages.slice(1)];
    formData.append('history', JSON.stringify(history));

    // 5C. Dispara a Server Action
    dispatch(formData);
  };

  // 6. useEffect para reagir à *resposta* da Server Action (quando 'state' muda)
  useEffect(() => {
    // Se o 'state' atual é o mesmo que já processamos, não faz nada.
    if (state === lastProcessedState.current) {
      return;
    }

    // Se o 'state' é novo, marca como processado
    lastProcessedState.current = state;

    // Não processa o estado inicial
    if (state.data === null && state.error === null) {
      return;
    }

    // CORREÇÃO (TS2345): Criamos uma const local para ajudar o TypeScript
    const responseData = state.data;
    const responseError = state.error;

    // 6A. Adiciona a resposta da IA (data)
    if (responseData) {
      setMessages((prev) => [...prev, responseData]);
    }
    // 6B. Adiciona a mensagem de erro
    else if (responseError) {
      const errorMessage: ChatMessage = {
        role: 'model',
        parts: `Desculpe, ocorreu um erro: ${responseError}. Tente perguntar de outra forma.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
    // O 'state' é limpo automaticamente pelo React na próxima 'dispatch'
  }, [state]); // Apenas 'state' como dependência

  return (
    <Card className="flex h-[75vh] flex-col">
      <CardHeader>
        <p className="text-sm text-muted-foreground">
          Pergunte sobre os dados no período selecionado.
        </p>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                  msg.role === 'user' && 'justify-end'
                )}
              >
                {/* Ícone */}
                {msg.role === 'model' && (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="h-5 w-5" />
                  </span>
                )}

                {/* Balão da Mensagem */}
                {/* CORREÇÃO (TS2322): Classes 'prose' movidas para o 'div' pai */}
                <div
                  className={cn(
                    'max-w-[75%] rounded-lg p-3 text-sm',
                    'prose prose-sm prose-invert max-w-none', // As classes prose estilizam o conteúdo
                    msg.role === 'user'
                      ? 'bg-muted prose-neutral' // Ajusta as cores do prose para o modo claro
                      : 'bg-primary text-primary-foreground'
                  )}
                >
                  {/* O ReactMarkdown agora não precisa de classes */}
                  <ReactMarkdown>{msg.parts}</ReactMarkdown>
                </div>

                {/* Ícone do Usuário */}
                {msg.role === 'user' && (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <User className="h-5 w-5" />
                  </span>
                )}
              </div>
            ))}
            {/* 7. O 'isPending' do hook controla o loader */}
            {isPending && (
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Bot className="h-5 w-5" />
                </span>
                <div className="rounded-lg bg-primary p-3 text-primary-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        {/* 8. O form agora chama o handleSubmit */}
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Qual foi o meu ticket médio no iFood ontem?"
            disabled={isPending}
          />
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
  );
}

