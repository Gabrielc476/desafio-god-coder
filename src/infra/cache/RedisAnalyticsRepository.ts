import { Redis } from 'ioredis';
import { PgAnalyticsRepository } from '../database/PgAnalyticsRepository';
import { IAnalyticsRepository, Granularity } from '@/domain/repositories/IAnalyticsRepository';

// Importando os DTOs de seus novos locais
import { TopProductDTO } from '@/domain/dtos/TopProductDTO';
import { RevenueOverTimeDTO } from '@/domain/dtos/RevenueOverTimeDTO';
import { SalesByChannelDTO } from '@/domain/dtos/SalesByChannelDTO';
import { OverallAverageTicketDTO } from '@/domain/dtos/OverallAverageTicketDTO';
import { SalesHeatmapDTO } from '@/domain/dtos/SalesHeatmapDTO';
import { SalesByPaymentTypeDTO } from '@/domain/dtos/SalesByPaymentTypeDTO';
import { CustomerRFMDTO } from '@/domain/dtos/CustomerRFMDTO';

// Tempo de vida (TTL) do cache em segundos (ex: 1 hora)
const CACHE_TTL_SECONDS = 3600;

/**
 * Implementação do Padrão Decorator para o repositório de analytics.
 * Esta classe "envolve" o repositório PostgreSQL real e adiciona
 * uma camada de cache (Redis) transparente.
 * * Segue a Arquitetura Limpa [cite: Arquitetura Limpa - O Guia do Artesão para Estrutura e Design de Software - Autor (Robert C. Martin).pdf]: os Casos de Uso (Camada de Aplicação)
 * dependem apenas da interface 'IAnalyticsRepository' e não sabem
 * se os dados vêm do cache ou do banco.
 */
export class RedisAnalyticsRepository implements IAnalyticsRepository {
  
  constructor(
    // O repositório "real" (PostgreSQL)
    private realRepository: PgAnalyticsRepository,
    // O cliente de cache (Redis)
    private cacheClient: Redis
  ) {
    
  }

  /**
   * Função genérica de "Cache Aside".
   * Tenta buscar um dado do cache. Se não encontrar (MISS),
   * busca no 'fetcher' (o banco de dados) e salva no cache.
   */
  private async getOrSetCache<T>(
    cacheKey: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    try {
      // 1. Tentar buscar do cache
      const cachedResult = await this.cacheClient.get(cacheKey);
      if (cachedResult) {
        
        // Se encontrar, desserializa (JSON) e retorna
        return JSON.parse(cachedResult) as T;
      }
    } catch (err) {
      console.error(`[Cache] Erro ao LER do Redis (chave: ${cacheKey}):`, err);
      // Se o cache falhar ao ler, não parar a aplicação. Ir direto para o banco.
    }

    // 2. Se for 'MISS' (não encontrado no cache)
   
    
    // 3. Buscar os dados do repositório real (PostgreSQL)
    const freshData = await fetcher();

    try {
      // 4. Salvar os novos dados no cache com expiração (TTL)
      await this.cacheClient.setex(
        cacheKey,
        CACHE_TTL_SECONDS,
        JSON.stringify(freshData)
      );
    } catch (err) {
      console.error(`[Cache] Erro ao SALVAR no Redis (chave: ${cacheKey}):`, err);
      // Não parar a aplicação se o cache falhar ao salvar.
    }

    // 5. Retornar os dados frescos
    return freshData;
  }

  // --- Implementação de TODOS os métodos da interface ---

  async getTopSellingProducts(startDate: Date, endDate: Date): Promise<TopProductDTO[]> {
    const cacheKey = `analytics:top-products:${startDate.toISOString()}:${endDate.toISOString()}`;
    const fetcher = () => this.realRepository.getTopSellingProducts(startDate, endDate);
    return this.getOrSetCache(cacheKey, fetcher);
  }

  async getRevenueOverTime(startDate: Date, endDate: Date, granularity: Granularity): Promise<RevenueOverTimeDTO[]> {
    const cacheKey = `analytics:revenue-over-time:${granularity}:${startDate.toISOString()}:${endDate.toISOString()}`;
    const fetcher = () => this.realRepository.getRevenueOverTime(startDate, endDate, granularity);
    return this.getOrSetCache(cacheKey, fetcher);
  }

  async getSalesByChannel(startDate: Date, endDate: Date): Promise<SalesByChannelDTO[]> {
    const cacheKey = `analytics:sales-by-channel:${startDate.toISOString()}:${endDate.toISOString()}`;
    const fetcher = () => this.realRepository.getSalesByChannel(startDate, endDate);
    return this.getOrSetCache(cacheKey, fetcher);
  }

  async getOverallAverageTicket(startDate: Date, endDate: Date): Promise<OverallAverageTicketDTO | null> {
    const cacheKey = `analytics:avg-ticket:${startDate.toISOString()}:${endDate.toISOString()}`;
    const fetcher = () => this.realRepository.getOverallAverageTicket(startDate, endDate);
    return this.getOrSetCache(cacheKey, fetcher);
  }

  async getSalesHeatmap(startDate: Date, endDate: Date): Promise<SalesHeatmapDTO[]> {
    const cacheKey = `analytics:sales-heatmap:${startDate.toISOString()}:${endDate.toISOString()}`;
    const fetcher = () => this.realRepository.getSalesHeatmap(startDate, endDate);
    return this.getOrSetCache(cacheKey, fetcher);
  }

  async getSalesByPaymentType(startDate: Date, endDate: Date): Promise<SalesByPaymentTypeDTO[]> {
    const cacheKey = `analytics:sales-by-payment:${startDate.toISOString()}:${endDate.toISOString()}`;
    const fetcher = () => this.realRepository.getSalesByPaymentType(startDate, endDate);
    return this.getOrSetCache(cacheKey, fetcher);
  }

  async getCustomerRFM(startDate: Date, endDate: Date): Promise<CustomerRFMDTO[]> {
    const cacheKey = `analytics:customer-rfm:${startDate.toISOString()}:${endDate.toISOString()}`;
    const fetcher = () => this.realRepository.getCustomerRFM(startDate, endDate);
    return this.getOrSetCache(cacheKey, fetcher);
  }
}
