/**
 * Tipos e Interfaces para o Sistema de Gestão de SST da Telefônica / Vivo
 * Baseado na estrutura do CONTROLE PGR_2026_V4.xlsx
 */

export type TipoPredio = 
  | 'Administrativo'
  | 'Operacional / NOC'
  | 'Distribuidor Geral (DG)'
  | 'Estação Rádio Base (ERB)'
  | 'Loja Própria'
  | 'Centro de Distribuição'
  | 'Data Center';

export type Regional = 'SPO' | 'SPI' | 'NDT' | 'SUL' | 'CO' | 'RJ/ES' | 'NORTE';

export type SituacaoDocumento = 'Vigente' | 'Vencendo em 60 dias' | 'Vencido' | 'Sem Laudo';

export type StatusLTCAT = 'Vigente' | 'Atenção' | 'Na Rede' | 'Ausente';
export type StatusAEP = 'Vigente' | 'Atenção' | 'Ausente';

export type EscopoISO = 'Sim' | 'Não' | 'Em Auditoria';

export interface DocumentoPGR {
  ano: number;
  lista: string; // Ex: 'Lista 28', 'Lista 29'
  dataEmissao: string; // YYYY-MM-DD
  dataVencimento: string; // YYYY-MM-DD
  situacao: SituacaoDocumento;
  validadeAnos: number; // 2 anos padrão NR-01, ou 3 anos se ISO 45001
}

export interface DocumentoLTCAT {
  ano: number;
  lista: string;
  dataEmissao: string;
  dataVencimento: string;
  status: StatusLTCAT;
}

export interface DocumentoAEP {
  ano: number;
  lista: string;
  dataEmissao: string;
  dataVencimento: string;
  status: StatusAEP;
}

export interface HistoricoAlteracao {
  id: string;
  dataHora: string;
  autor: string;
  acao: string;
  detalhes: string;
}

export interface ObservacaoCampo {
  id: string;
  dataHora: string;
  autor: string;
  cargo: string;
  texto: string;
}

export interface UnidadeAtiva {
  id: string;
  cnpj: string;
  filial: string;
  tipoPredio: TipoPredio;
  regional: Regional;
  uf: string;
  cidade: string;
  bairro: string;
  endereco: string;
  cep: string;
  escopoIso45001: EscopoISO;
  nr20: 'Sim' | 'Não'; // Presença de gerador de energia e tanque de diesel
  mesPo: string; // Ex: '03/2026'
  numeroPo: string; // Ex: 'PO-4500892110'
  pgr: DocumentoPGR;
  ltcat: DocumentoLTCAT;
  aep: DocumentoAEP;
  observacoes: string;
  observacoesCampo: ObservacaoCampo[];
  historico: HistoricoAlteracao[];
  dataCriacao: string;
  ultimaAtualizacao: string;
}

export interface UnidadeDesmobilizada {
  id: string;
  cnpj: string;
  filial: string;
  tipoPredio: string;
  regional: Regional;
  uf: string;
  cidade: string;
  endereco: string;
  dataDesmobilizacao: string;
  motivo: string;
  responsavelTst: string;
  documentosDispensados: boolean;
  observacoes: string;
}

export interface ControleDG {
  id: string;
  nomeEmpresa: string;
  cnpjDg: string;
  codigoDg: string;
  regional: Regional;
  uf: string;
  cidade: string;
  bairro: string;
  endereco: string;
  pgrSituacao: SituacaoDocumento;
  pgrDataEmissao: string;
  pgrDataVencimento: string;
  statusNr01: 'Conforme (GRO Implantado)' | 'Pendente Revisão' | 'Não Conforme';
  ltcatStatus: StatusLTCAT;
  aepStatus: StatusAEP;
  tipoCabine: 'Cabine Primária' | 'Distribuidor Metálico' | 'Central Óptica' | 'Misto';
  nr20Gerador: boolean;
  ultimaVistoria: string;
  observacoes: string;
}

export interface QuantitativosMedicao {
  pgr: number;
  ltcat: number;
  aet: number;
  periculosidade: number;
  insalubridade: number;
  arp: number;
}

export interface ValoresUnitarios {
  pgr: number;
  ltcat: number;
  aet: number;
  periculosidade: number;
  insalubridade: number;
  arp: number;
}

export type StatusPagamento = 
  | 'Aberto'
  | 'Enviado para Medição'
  | 'Aprovado / Pago'
  | 'Glosado / Retido';

export interface LoteMedicaoFinanceira {
  id: string;
  lista: string; // 'Lista 22', 'Lista 23', ... 'Lista 30'
  periodo: string; // 'Janeiro/2026', 'Fevereiro/2026', etc.
  quantidades: QuantitativosMedicao;
  valoresUnitarios: ValoresUnitarios;
  valorBruto: number;
  descontosGlosas: number;
  valorLiquido: number;
  dataEnvioPagamento: string | null;
  statusPagamento: StatusPagamento;
  numeroNotaFiscal: string;
  ordemCompraSap: string;
  observacoes: string;
  saldoPendente: number;
}
