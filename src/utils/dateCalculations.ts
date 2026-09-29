import { SituacaoDocumento } from '../types/sst';

// Data de referência do sistema (2026-09-28) ou data atual real
export const DATA_REFERENCIA = '2026-09-28';

/**
 * Calcula a data de vencimento a partir da data de emissão/revisão e do prazo de validade (anos)
 */
export function calcularDataVencimento(dataEmissao: string, anosValidade: number = 2): string {
  if (!dataEmissao) return '';
  const data = new Date(dataEmissao);
  if (isNaN(data.getTime())) return '';
  
  data.setFullYear(data.getFullYear() + anosValidade);
  return data.toISOString().split('T')[0];
}

/**
 * Retorna os dias restantes até o vencimento a partir da data de referência
 */
export function getDiasRestantes(dataVencimento: string, dataRef: string = DATA_REFERENCIA): number | null {
  if (!dataVencimento) return null;
  const dVenc = new Date(dataVencimento);
  const dRef = new Date(dataRef);
  if (isNaN(dVenc.getTime()) || isNaN(dRef.getTime())) return null;

  const diffTime = dVenc.getTime() - dRef.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determina a situação do documento com base na data de vencimento:
 * - Se sem data: 'Sem Laudo'
 * - Se vencido (< 0 dias): 'Vencido'
 * - Se faltar entre 0 e 60 dias: 'Vencendo em 60 dias'
 * - Se faltar > 60 dias: 'Vigente'
 */
export function calcularSituacaoDocumento(dataVencimento: string, dataRef: string = DATA_REFERENCIA): SituacaoDocumento {
  if (!dataVencimento) return 'Sem Laudo';
  
  const dias = getDiasRestantes(dataVencimento, dataRef);
  if (dias === null) return 'Sem Laudo';

  if (dias < 0) {
    return 'Vencido';
  } else if (dias <= 60) {
    return 'Vencendo em 60 dias';
  } else {
    return 'Vigente';
  }
}

/**
 * Formata CNPJ (00.000.000/0000-00)
 */
export function formatarCNPJ(valor: string): string {
  const limpo = valor.replace(/\D/g, '');
  if (limpo.length !== 14) return valor;
  return limpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formata Moeda BRL
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

/**
 * Formata data padrão brasileiro DD/MM/AAAA
 */
export function formatarDataBR(dataIso: string): string {
  if (!dataIso) return '-';
  const partes = dataIso.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataIso;
}
