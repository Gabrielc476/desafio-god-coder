'use server';
// Este arquivo define nossas Server Actions,
// que rodam SOMENTE no servidor.
// Elas substituem os Route Handlers (/api/*) para chamadas de IA.

import { 
  AIChatRequest, 
  AIExplainRequest, 
  AIExplainResponse, 
  ChatMessage,
  AIActionState
} from './types';

// A URL base da API Backend.
const API_URL = process.env.BACKEND_API_URL || 'http://localhost:3333/api/v1';


/**
 * Server Action para o Chat Geral (Caso de Uso 8)
 */
export async function askAIAction(
  previousState: AIActionState<ChatMessage>,
  formData: FormData,
): Promise<AIActionState<ChatMessage>> {
  const prompt = formData.get('prompt') as string;
  const historyString = formData.get('history') as string;

  if (!prompt) {
    return { data: null, error: 'Prompt é obrigatório.' };
  }

  let history: ChatMessage[] = [];
  try {
    history = JSON.parse(historyString || '[]');
  } catch (e) {
    console.error('Erro ao parsear histórico do chat:', e);
    return { data: null, error: 'Histórico de chat inválido.' };
  }

  const requestBody: AIChatRequest = {
    prompt,
    history,
  };

  try {
    const res = await fetch(`${API_URL}/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      cache: 'no-store', // Mutações nunca devem ser cacheadas
    });

    if (!res.ok) {
      const errorBody = await res.json();
      console.error('Erro da API Backend (/ai/ask):', errorBody);
      return { data: null, error: errorBody.error || 'Erro ao contatar a IA.' };
    }

    const data: { response: string } = await res.json();
    
    return {
      data: { role: 'model', parts: data.response },
      error: null,
    };

  } catch (error) {
    console.error('Erro de rede na askAIAction:', error);
    return { data: null, error: 'Erro de rede ao conectar com o assistente.' };
  }
}

/**
 * Server Action para "Explicar Dados" (Caso de Uso 9)
 */
export async function explainDataAction(
  previousState: AIActionState<string>,
  formData: FormData,
): Promise<AIActionState<string>> {
  
  const dataContext = formData.get('dataContext') as string;
  const dataJson = formData.get('dataJson') as string;

  if (!dataContext || !dataJson) {
    return { data: null, error: 'Contexto e dados são obrigatórios.' };
  }

  const requestBody: AIExplainRequest = {
    dataContext,
    dataJson,
  };

  try {
    const res = await fetch(`${API_URL}/ai/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorBody = await res.json();
      console.error('Erro da API Backend (/ai/explain):', errorBody);
      return { data: null, error: errorBody.error || 'Erro ao gerar explicação.' };
    }

    const data: AIExplainResponse = await res.json();
    return { data: data.response, error: null };

  } catch (error) {
    console.error('Erro de rede na explainDataAction:', error);
    return { data: null, error: 'Erro de rede ao conectar com a IA.' };
  }
}

