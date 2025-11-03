import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  FunctionDeclarationsTool,
  GenerativeModel,
  ChatSession,
  SchemaType,
} from '@google/generative-ai';
import 'dotenv/config';

import {
  IAssistantService,
  ChatHistory,
  AssistantResponseDTO,
} from '@/domain/services/IAssistantService';

// --- Definição das Ferramentas (Function Calling) ---
// (Todo o seu código de 'analyticsTools' permanece aqui, idêntico)
const analyticsTools: FunctionDeclarationsTool[] = [
  {
    functionDeclarations: [
      // 1. Top Produtos
      {
        name: 'getTopSellingProducts',
        description: 'Busca os 10 produtos mais vendidos num período.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            startDate: { type: SchemaType.STRING, description: 'Data de início (YYYY-MM-DD). Opcional, assume "hoje" se não for fornecida.' },
            endDate: { type: SchemaType.STRING, description: 'Data de fim (YYYY-MM-DD). Opcional, assume "startDate" se não for fornecida.' },
          },
          required: [],
        },
      },
      // 2. Faturação ao Longo do Tempo
      {
        name: 'getRevenueOverTime',
        description: 'Busca o faturamento agregado ao longo do tempo.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            startDate: { type: SchemaType.STRING, description: 'Data de início (YYYY-MM-DD). Opcional, assume "hoje".' },
            endDate: { type: SchemaType.STRING, description: 'Data de fim (YYYY-MM-DD). Opcional, assume "startDate".' },
            granularity: {
              type: SchemaType.STRING,
              description: 'Agrupamento: "day", "week", or "month". Opcional, assume "day".',
            },
          },
          required: [],
        },
      },
      // 3. Vendas por Canal
      {
        name: 'getSalesByChannel',
        description: 'Busca o total de vendas e faturamento agrupados por canal (ex: iFood, Salão).',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            startDate: { type: SchemaType.STRING, description: 'Data de início (YYYY-MM-DD). Opcional, assume "hoje".' },
            endDate: { type: SchemaType.STRING, description: 'Data de fim (YYYY-MM-DD). Opcional, assume "startDate".' },
          },
          required: [],
        },
      },
      // 4. Ticket Médio Geral
      {
        name: 'getOverallAverageTicket',
        description: 'Busca o ticket médio geral e o número total de vendas no período.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            startDate: { type: SchemaType.STRING, description: 'Data de início (YYYY-MM-DD). Opcional, assume "hoje".' },
            endDate: { type: SchemaType.STRING, description: 'Data de fim (YYYY-MM-DD). Opcional, assume "startDate".' },
          },
          required: [],
        },
      },
      // 5. Heatmap de Vendas
      {
        name: 'getSalesHeatmap',
        description: 'Busca o volume de vendas e faturamento agrupados por hora do dia e por canal.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            startDate: { type: SchemaType.STRING, description: 'Data de início (YYYY-MM-DD). Opcional, assume "hoje".' },
            endDate: { type: SchemaType.STRING, description: 'Data de fim (YYYY-MM-DD). Opcional, assume "startDate".' },
          },
          required: [],
        },
      },
      // 6. Vendas por Tipo de Pagamento
      {
        name: 'getSalesByPaymentType',
        description: 'Busca o faturamento e o número de transações agrupados por tipo de pagamento (ex: Pix, Cartão, Dinheiro).',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            startDate: { type: SchemaType.STRING, description: 'Data de início (YYYY-MM-DD). Opcional, assume "hoje".' },
            endDate: { type: SchemaType.STRING, description: 'Data de fim (YYYY-MM-DD). Opcional, assume "startDate".' },
          },
          required: [],
        },
      },
      // 7. RFM de Clientes
      {
        name: 'getCustomerRFM',
        description: 'Busca a análise de Recência, Frequência e Valor (RFM) dos clientes.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            startDate: { type: SchemaType.STRING, description: 'Data de início (YYYY-MM-DD). Opcional, assume "hoje".' },
            endDate: { type: SchemaType.STRING, description: 'Data de fim (YYYY-MM-DD). Opcional, assume "startDate".' },
          },
          required: [],
        },
      },
    ],
  },
];


/**
 * Implementação concreta do IAssistantService usando a API do Google Gemini.
 * Esta classe vive na camada de Infraestrutura.
 */
export class GeminiAssistantService implements IAssistantService {
  private generativeModel: GenerativeModel;
  private chatModel: GenerativeModel;
  private apiKey: string;

  // --- CORREÇÃO DE ARQUITETURA (Inversão de Dependência) ---
  // A camada de Infra (este ficheiro) não deve importar da Aplicação.
  // Em vez disso, recebemos os dados necessários (a data de hoje) 
  // no construtor.
  constructor(localTodayDate: string) {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (!this.apiKey) {
      // --- LOG ADICIONADO AQUI TAMBÉM ---
      console.error("--- [GeminiService] ERRO FATAL: GEMINI_API_KEY não encontrada no .env ---");
      // --- FIM DO LOG ---
      throw new Error('GEMINI_API_KEY não encontrada no .env');
    }

    // Usar a data injetada para construir a instrução de sistema
    const SYSTEM_INSTRUCTION = `
      Você é um assistente de IA focado em *ação*, especializado em análise de dados de restaurantes.
      A data de hoje é: ${localTodayDate}.
      O conjunto de dados disponíveis para análise cobre o período de 3 de Maio de 2025 a 30 de Outubro de 2025.

      **REGRAS CRÍTICAS (NÃO QUEBRE):**
      1.  **USE AS FERRAMENTAS. SEMPRE.** Se o usuário perguntar sobre dados (vendas, produtos, clientes), a sua *única* resposta deve ser uma chamada de função (\`FUNCTION_CALL\`). Não converse, execute.
      2.  **NÃO ANUNCIE. FAÇA.** Nunca responda ao usuário dizendo o que você *vai* fazer (ex: "Vou buscar os dados..." ou "Preciso de duas etapas..."). Apenas **CHAME A FUNÇÃO** imediatamente.
      3.  **PERGUNTAS COMPLEXAS:** Se a pergunta for complexa (ex: "top produto NO horário de pico"), chame a primeira ferramenta necessária (ex: 'getSalesHeatmap' para encontrar o horário de pico). O sistema retornará os dados. Você então usará esses dados para decidir o próximo passo (ex: chamar 'getTopSellingProducts' com o filtro de hora).
      4.  **USE O CONTEXTO DE DATA:** Sempre use as datas acima para interpretar "hoje" (${localTodayDate}), "ontem", "este mês", etc.
    `;
    // --- FIM DA CORREÇÃO ---

    const genAI = new GoogleGenerativeAI(this.apiKey);

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    // Modelo para "Function Calling" (Caso de Uso 8)
    this.generativeModel = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-preview-09-2025', // Usando o modelo 2.5-flash
      tools: analyticsTools,
      safetySettings,
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    // Modelo simples de chat/texto (Caso de Uso 9)
    this.chatModel = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-preview-09-2025', // Usando o modelo 2.5-flash
      safetySettings,
      systemInstruction: SYSTEM_INSTRUCTION,
    });
  }

  // Função helper para 'Exponential Backoff'
  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * (Caso de Uso 8) Gera uma resposta (texto ou chamada de função)
   */
  async generateFunctionCallResponse(
    prompt: string,
    history: ChatHistory[]
  ): Promise<AssistantResponseDTO> {
    
    let retries = 3;
    let delay = 1000; // 1 segundo inicial

    while (retries > 0) {
      try {
        // Mapear o nosso tipo 'ChatHistory' para o tipo do SDK
        const sdkHistory = history.map(item => ({
          role: item.role,
          parts: [{ text: item.parts }],
        }));

        const chat: ChatSession = this.generativeModel.startChat({
            history: sdkHistory,
        });

        const result = await chat.sendMessage(prompt);
        const response = result.response;
        const responseContent = response.candidates?.[0]?.content;

        if (!responseContent) {
          throw new Error('Resposta inválida da API do Gemini.');
        }

        // Verificar se o Gemini pediu para chamar uma função
        if (responseContent.parts[0].functionCall) {
          const fnCall = responseContent.parts[0].functionCall;
          return {
            type: 'FUNCTION_CALL',
            functionCall: {
              name: fnCall.name,
              args: fnCall.args,
            },
          };
        }

        // Se não for uma chamada de função, é uma resposta de texto
        if (responseContent.parts[0].text) {
          return {
            type: 'TEXT',
            textResponse: responseContent.parts[0].text,
          };
        }
        
        throw new Error('Resposta do Gemini não continha nem texto nem chamada de função.');

      } catch (error) {
        // Verificar se é um erro de cota (429)
        if (error instanceof Error && error.message.includes('429')) {
          console.warn(`[GeminiService] Erro 429 (Rate Limit). Tentando novamente em ${delay / 1000}s... (${retries} tentativas restantes)`);
          await this.sleep(delay);
          retries--;
          delay *= 2; // Dobrar o tempo de espera (backoff)
        } else {
          // Se for outro erro, falhar imediatamente
          console.error('Erro ao chamar a API do Gemini (Function Call):', error);
          if (error instanceof Error) {
            throw new Error(`Falha ao comunicar com o assistente de IA: ${error.message}`);
          }
          throw new Error('Falha desconhecida ao comunicar com o assistente de IA.');
        }
      }
    }

    // Se esgotar as tentativas
    throw new Error('Falha ao comunicar com o assistente de IA após múltiplas tentativas (Rate Limit).');
  }

  /**
   * (Caso de Uso 9) Gera uma análise (apenas texto) de um conjunto de dados.
   */
  async explainData(
    dataContext: string,
    dataJson: string
  ): Promise<string> {
    const prompt = `
      Você é um analista de dados sênior especializado em restaurantes (food service).
      A sua tarefa é explicar os dados a seguir para o dono do restaurante (a "Maria").
      Seja direto, acionável e use uma linguagem simples.

      Contexto dos Dados: ${dataContext}
      Dados (JSON):
      ${dataJson}

      A sua análise:
    `;

    // --- LOG 4: PROMPT ENVIADO ---
    console.log('--- [GeminiService] explainData: INICIADO ---');
    console.log('[GeminiService] Enviando o seguinte prompt para o chatModel:');
    console.log(prompt);
    console.log('--------------------------------------------------');
    // --- FIM DO LOG 4 ---

    try {
      const result = await this.chatModel.generateContent(prompt);
      const response = result.response;

      // --- LOG 5: RESPOSTA BRUTA DA API ---
      // ESTE É O LOG MAIS IMPORTANTE. Ele mostrará o 'finishReason' (ex: SAFETY)
      console.log('--- [GeminiService] Resposta BRUTA da API recebida: ---');
      console.log(JSON.stringify(response, null, 2));
      console.log('--------------------------------------------------');
      // --- FIM DO LOG 5 ---
      
      const text = response.text();

      // --- LOG 6: TEXTO EXTRAÍDO ---
      console.log(`[GeminiService] Texto extraído via response.text(): ${text ? text.substring(0, 100) + '...' : 'VAZIO'}`);
      console.log('--- [GeminiService] explainData: FINALIZADO ---');
      // --- FIM DO LOG 6 ---

      return text;
    } catch (error) {
      // --- LOG 7: ERRO NA CHAMADA ---
      console.error('--- [GeminiService] ERRO ao chamar a API do Gemini (Explain): ---', error);
      // --- FIM DO LOG 7 ---
      if (error instanceof Error) {
        throw new Error(`Falha ao gerar análise dos dados: ${error.message}`);
      }
      throw new Error('Falha desconhecida ao gerar análise dos dados.');
    }
  }
}