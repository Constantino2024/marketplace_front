/**
 * Formata um valor numérico para o formato de moeda angolana/portuguesa
 * Exemplo: 200000.00 -> 200.000,00 Kz
 * 
 * @param value - Valor a ser formatado (number ou string)
 * @param showSymbol - Se deve mostrar o símbolo "Kz" (padrão: true)
 * @returns String formatada
 */
export const formatCurrency = (value: number | string | undefined | null, showSymbol: boolean = true): string => {
  if (value === undefined || value === null) return showSymbol ? '0,00 Kz' : '0,00';
  
  // Converter para número
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  // Verificar se é um número válido
  if (isNaN(num)) return showSymbol ? '0,00 Kz' : '0,00';
  
  // Formatar com 2 casas decimais, ponto como separador de milhares e vírgula como decimal
  const formatted = num.toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return showSymbol ? `${formatted} Kz` : formatted;
};

/**
 * Formata um valor para exibição em contexto de preço
 * Versão mais curta sem o símbolo
 */
export const formatPrice = (value: number | string | undefined | null): string => {
  return formatCurrency(value, false);
};