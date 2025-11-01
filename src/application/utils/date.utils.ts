/**
 * Retorna a data de "hoje" no fuso horário local (ex: '2025-11-01').
 * Isto é crucial para que a IA e o backend tenham o mesmo
 * contexto de "hoje", independentemente do fuso do servidor (UTC).
 * Esta é a mesma lógica usada no AskGeminiAnalyticsUseCase.ts.
 */
export const getLocalTodayDateString = (): string => {
  const now = new Date();
  // Ajustar a data de "hoje" para o fuso local (ex: Brasil -03:00)
  const offset = now.getTimezoneOffset() * 60000;
  const localNow = new Date(now.getTime() - offset);
  
  // Retorna no formato YYYY-MM-DD
  return localNow.toISOString().split('T')[0]; 
}
