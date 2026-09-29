import * as XLSX from 'xlsx';
import { UnidadeAtiva, UnidadeDesmobilizada, ControleDG, LoteMedicaoFinanceira } from '../types/sst';
import { formatarDataBR, formatarMoeda } from './dateCalculations';

export interface DadosCompletosSST {
  unidadesAtivas: UnidadeAtiva[];
  unidadesDesmobilizadas: UnidadeDesmobilizada[];
  controleDGs: ControleDG[];
  lotesMedicao: LoteMedicaoFinanceira[];
}

/**
 * Exporta os dados do sistema em formato Excel (.xlsx) com múltiplas abas
 */
export function exportarParaExcel(dados: DadosCompletosSST, nomeArquivo = 'CONTROLE_PGR_2026_V4.xlsx') {
  const wb = XLSX.utils.book_new();

  // 1. Aba UNIDADES ATIVAS (Tabela GERAL)
  const rowsAtivas = dados.unidadesAtivas.map(u => ({
    'CNPJ': u.cnpj,
    'Filial / Unidade': u.filial,
    'Tipo de Prédio': u.tipoPredio,
    'Regional': u.regional,
    'UF': u.uf,
    'Cidade': u.cidade,
    'Bairro': u.bairro,
    'Endereço Completo': u.endereco,
    'CEP': u.cep,
    'Escopo ISO 45001': u.escopoIso45001,
    'NR-20 (Gerador/Diesel)': u.nr20,
    'Mês PO': u.mesPo,
    'Nº PO SAP': u.numeroPo,
    'PGR Ano': u.pgr.ano,
    'PGR Lista': u.pgr.lista,
    'PGR Data Emissão': formatarDataBR(u.pgr.dataEmissao),
    'PGR Data Vencimento': formatarDataBR(u.pgr.dataVencimento),
    'PGR Situação': u.pgr.situacao,
    'LTCAT Status': u.ltcat.status,
    'LTCAT Lista': u.ltcat.lista,
    'LTCAT Emissão': formatarDataBR(u.ltcat.dataEmissao),
    'LTCAT Vencimento': formatarDataBR(u.ltcat.dataVencimento),
    'AEP Status': u.aep.status,
    'AEP Lista': u.aep.lista,
    'AEP Emissão': formatarDataBR(u.aep.dataEmissao),
    'AEP Vencimento': formatarDataBR(u.aep.dataVencimento),
    'Observações Técnicas': u.observacoes,
  }));
  const wsAtivas = XLSX.utils.json_to_sheet(rowsAtivas);
  XLSX.utils.book_append_sheet(wb, wsAtivas, 'UNIDADES_ATIVAS');

  // 2. Aba DGs (Distribuidores Gerais)
  const rowsDGs = dados.controleDGs.map(dg => ({
    'Nome da Empresa': dg.nomeEmpresa,
    'CNPJ DG': dg.cnpjDg,
    'Código DG': dg.codigoDg,
    'Regional': dg.regional,
    'UF': dg.uf,
    'Cidade': dg.cidade,
    'Bairro': dg.bairro,
    'Endereço': dg.endereco,
    'PGR Situação': dg.pgrSituacao,
    'PGR Emissão': formatarDataBR(dg.pgrDataEmissao),
    'PGR Vencimento': formatarDataBR(dg.pgrDataVencimento),
    'Status NR-01 (GRO)': dg.statusNr01,
    'LTCAT': dg.ltcatStatus,
    'AEP': dg.aepStatus,
    'Tipo de Cabine': dg.tipoCabine,
    'Gerador NR-20': dg.nr20Gerador ? 'Sim' : 'Não',
    'Última Vistoria': formatarDataBR(dg.ultimaVistoria),
    'Observações': dg.observacoes,
  }));
  const wsDGs = XLSX.utils.json_to_sheet(rowsDGs);
  XLSX.utils.book_append_sheet(wb, wsDGs, 'CONTROLE_DGs');

  // 3. Aba UNIDADES DESMOBILIZADAS (Arquivo Morto)
  const rowsDesmob = dados.unidadesDesmobilizadas.map(ud => ({
    'CNPJ': ud.cnpj,
    'Filial': ud.filial,
    'Tipo': ud.tipoPredio,
    'Regional': ud.regional,
    'UF': ud.uf,
    'Cidade': ud.cidade,
    'Endereço': ud.endereco,
    'Data Desmobilização': formatarDataBR(ud.dataDesmobilizacao),
    'Motivo / Justificativa': ud.motivo,
    'Responsável TST': ud.responsavelTst,
    'Dispensa de Laudo': ud.documentosDispensados ? 'Sim' : 'Não',
    'Observações': ud.observacoes,
  }));
  const wsDesmob = XLSX.utils.json_to_sheet(rowsDesmob);
  XLSX.utils.book_append_sheet(wb, wsDesmob, 'DESMOBILIZADAS');

  // 4. Aba MEDIÇÃO FINANCEIRA
  const rowsFinanceiro = dados.lotesMedicao.map(m => ({
    'Lista de Faturamento': m.lista,
    'Período / Mês': m.periodo,
    'Qtd PGR': m.quantidades.pgr,
    'Qtd LTCAT': m.quantidades.ltcat,
    'Qtd AET': m.quantidades.aet,
    'Qtd Periculosidade': m.quantidades.periculosidade,
    'Qtd Insalubridade': m.quantidades.insalubridade,
    'Qtd ARP': m.quantidades.arp,
    'Valor Bruto (R$)': m.valorBruto,
    'Descontos / Glosas (R$)': m.descontosGlosas,
    'Valor Líquido (R$)': m.valorLiquido,
    'Data Envio SAP': m.dataEnvioPagamento ? formatarDataBR(m.dataEnvioPagamento) : 'Pendente',
    'Status do Pagamento': m.statusPagamento,
    'Nota Fiscal': m.numeroNotaFiscal,
    'PO SAP': m.ordemCompraSap,
    'Saldo Pendente (R$)': m.saldoPendente,
    'Observações Financeiras': m.observacoes,
  }));
  const wsFinanceiro = XLSX.utils.json_to_sheet(rowsFinanceiro);
  XLSX.utils.book_append_sheet(wb, wsFinanceiro, 'MEDICAO_FINANCEIRA');

  // Gera download
  XLSX.writeFile(wb, nomeArquivo);
}

/**
 * Exporta qualquer array de objetos como CSV
 */
export function exportarTabelaCSV<T extends Record<string, unknown>>(linhas: T[], nomeArquivo: string) {
  const ws = XLSX.utils.json_to_sheet(linhas);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${nomeArquivo}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Importa e analisa arquivo XLSX selecionado pelo usuário
 */
export async function importarArquivoXLSX(file: File): Promise<Partial<DadosCompletosSST>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const resultado: Partial<DadosCompletosSST> = {};

        // Procura aba de unidades ativas
        const sheetAtivasName = workbook.SheetNames.find(n => 
          n.toUpperCase().includes('ATIVA') || n.toUpperCase().includes('GERAL') || n.toUpperCase().includes('PGR')
        );
        if (sheetAtivasName) {
          const sheet = workbook.Sheets[sheetAtivasName];
          const rows = XLSX.utils.sheet_to_json(sheet) as any[];
          if (rows.length > 0) {
            resultado.unidadesAtivas = rows.map((r, i) => ({
              id: `imp-${Date.now()}-${i}`,
              cnpj: r['CNPJ'] || r['cnpj'] || '',
              filial: r['Filial / Unidade'] || r['Filial'] || r['filial'] || `Unidade ${i + 1}`,
              tipoPredio: r['Tipo de Prédio'] || r['Tipo'] || 'Administrativo',
              regional: r['Regional'] || 'SPO',
              uf: r['UF'] || 'SP',
              cidade: r['Cidade'] || '',
              bairro: r['Bairro'] || '',
              endereco: r['Endereço Completo'] || r['Endereço'] || '',
              cep: r['CEP'] || '',
              escopoIso45001: (r['Escopo ISO 45001'] || 'Sim') as any,
              nr20: (r['NR-20 (Gerador/Diesel)'] || r['NR-20'] || 'Não') as any,
              mesPo: r['Mês PO'] || '03/2026',
              numeroPo: r['Nº PO SAP'] || r['PO'] || '',
              pgr: {
                ano: Number(r['PGR Ano']) || 2026,
                lista: r['PGR Lista'] || 'Lista 29',
                dataEmissao: r['PGR Data Emissão'] || '2026-03-01',
                dataVencimento: r['PGR Data Vencimento'] || '2028-03-01',
                situacao: (r['PGR Situação'] || 'Vigente') as any,
                validadeAnos: 2,
              },
              ltcat: {
                ano: Number(r['LTCAT Ano']) || 2026,
                lista: r['LTCAT Lista'] || 'Lista 29',
                dataEmissao: r['LTCAT Emissão'] || '2026-03-01',
                dataVencimento: r['LTCAT Vencimento'] || '2028-03-01',
                status: (r['LTCAT Status'] || 'Vigente') as any,
              },
              aep: {
                ano: Number(r['AEP Ano']) || 2026,
                lista: r['AEP Lista'] || 'Lista 29',
                dataEmissao: r['AEP Emissão'] || '2026-03-01',
                dataVencimento: r['AEP Vencimento'] || '2028-03-01',
                status: (r['AEP Status'] || 'Vigente') as any,
              },
              observacoes: r['Observações Técnicas'] || r['Observações'] || '',
              observacoesCampo: [],
              historico: [],
              dataCriacao: new Date().toISOString().split('T')[0],
              ultimaAtualizacao: new Date().toISOString().split('T')[0],
            }));
          }
        }

        resolve(resultado);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
