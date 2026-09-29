import React, { useState } from 'react';
import { 
  Receipt, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  Plus, 
  FileText,
  Send,
  Eye,
  Percent
} from 'lucide-react';
import { LoteMedicaoFinanceira, StatusPagamento } from '../types/sst';
import { formatarMoeda, formatarDataBR } from '../utils/dateCalculations';
import { exportarTabelaCSV } from '../utils/excelHandler';

interface FinanceiroViewProps {
  lotes: LoteMedicaoFinanceira[];
  onAtualizarLote: (lote: LoteMedicaoFinanceira) => void;
  onAdicionarLote: (novoLote: LoteMedicaoFinanceira) => void;
}

export const FinanceiroView: React.FC<FinanceiroViewProps> = ({
  lotes,
  onAtualizarLote,
  onAdicionarLote,
}) => {
  const [loteDetalhes, setLoteDetalhes] = useState<LoteMedicaoFinanceira | null>(null);
  const [modalNovoLote, setModalNovoLote] = useState(false);

  // Totais consolidados
  const totalBruto = lotes.reduce((acc, l) => acc + l.valorBruto, 0);
  const totalGlosas = lotes.reduce((acc, l) => acc + l.descontosGlosas, 0);
  const totalLiquido = lotes.reduce((acc, l) => acc + l.valorLiquido, 0);
  const totalPago = lotes
    .filter(l => l.statusPagamento === 'Aprovado / Pago')
    .reduce((acc, l) => acc + l.valorLiquido, 0);
  const totalEmMedicao = lotes
    .filter(l => l.statusPagamento === 'Enviado para Medição' || l.statusPagamento === 'Aberto')
    .reduce((acc, l) => acc + l.valorLiquido, 0);

  // Exportar Tabela Financeira
  const exportarFinanceiroCSV = () => {
    const dados = lotes.map(l => ({
      Lista: l.lista,
      Periodo: l.periodo,
      PGR_Qtd: l.quantidades.pgr,
      LTCAT_Qtd: l.quantidades.ltcat,
      AET_Qtd: l.quantidades.aet,
      Periculosidade_Qtd: l.quantidades.periculosidade,
      Insalubridade_Qtd: l.quantidades.insalubridade,
      ARP_Qtd: l.quantidades.arp,
      Valor_Bruto: l.valorBruto,
      Glosas_Descontos: l.descontosGlosas,
      Valor_Liquido: l.valorLiquido,
      Data_Envio: l.dataEnvioPagamento || 'Não Enviado',
      Status_Pagamento: l.statusPagamento,
      Nota_Fiscal: l.numeroNotaFiscal,
      PO_SAP: l.ordemCompraSap,
      Observacoes: l.observacoes,
    }));
    exportarTabelaCSV(dados, `MEDICAO_FINANCEIRA_SST_VIVO_${new Date().toISOString().split('T')[0]}`);
  };

  const handleMarcarEnviado = (lote: LoteMedicaoFinanceira) => {
    const atualizado: LoteMedicaoFinanceira = {
      ...lote,
      statusPagamento: 'Enviado para Medição',
      dataEnvioPagamento: new Date().toISOString().split('T')[0],
      saldoPendente: lote.valorLiquido,
    };
    onAtualizarLote(atualizado);
  };

  const handleAprovarPago = (lote: LoteMedicaoFinanceira) => {
    const atualizado: LoteMedicaoFinanceira = {
      ...lote,
      statusPagamento: 'Aprovado / Pago',
      saldoPendente: 0,
    };
    onAtualizarLote(atualizado);
  };

  return (
    <div className="space-y-5">
      {/* 1. Header do Módulo Financeiro */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#61249b] dark:text-purple-400" />
            <h1 className="text-base font-bold text-slate-900 dark:text-white">
              Controle Financeiro & Medições de SST
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Demonstrativo de faturamento por lote/lista de laudos (PGR, LTCAT, AET, Insalubridade, Periculosidade e ARP)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportarFinanceiroCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => setModalNovoLote(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#61249b] hover:bg-[#4d1c7c] rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Medição / Lote</span>
          </button>
        </div>
      </div>

      {/* 2. Cards de Balanço Financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-medium tracking-wide">TOTAL FATURADO</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {formatarMoeda(totalLiquido)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Valor líquido total de {lotes.length} lotes
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-950/60 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-1">
            <span className="text-[11px] font-medium tracking-wide">PAGO / APROVADO</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatarMoeda(totalPago)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Liquidados pelo CSC Vivo SAP
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-950/60 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-1">
            <span className="text-[11px] font-medium tracking-wide">EM MEDIÇÃO / ABERTO</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
            {formatarMoeda(totalEmMedicao)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Aguardando aprovação e nota
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/60 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 mb-1">
            <span className="text-[11px] font-medium tracking-wide">GLOSAS / DESCONTOS</span>
            <Percent className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <p className="text-xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
            {formatarMoeda(totalGlosas)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Retenções técnicas aplicadas
          </p>
        </div>
      </div>

      {/* 3. Tabela de Lotes de Faturamento */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Demonstrativo de Lotes (Lista 22 a 30)
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Valores unitários vigentes contratados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Lote / Lista</th>
                <th className="px-3 py-3">Período</th>
                <th className="px-3 py-3 text-center">PGR</th>
                <th className="px-3 py-3 text-center">LTCAT</th>
                <th className="px-3 py-3 text-center">AET</th>
                <th className="px-3 py-3 text-center">Peric.</th>
                <th className="px-3 py-3 text-center">Insal.</th>
                <th className="px-3 py-3 text-center">ARP</th>
                <th className="px-3 py-3 text-right">Valor Líquido</th>
                <th className="px-3 py-3 text-center">Data Envio SAP</th>
                <th className="px-3 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {lotes.map((lote) => {
                const isPago = lote.statusPagamento === 'Aprovado / Pago';
                const isEnviado = lote.statusPagamento === 'Enviado para Medição';
                const isAberto = lote.statusPagamento === 'Aberto';

                return (
                  <tr key={lote.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      <div className="font-mono text-purple-700 dark:text-purple-300">
                        {lote.lista}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {lote.numeroNotaFiscal}
                      </div>
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      {lote.periodo}
                    </td>

                    <td className="px-3 py-3 text-center font-mono tabular-nums">
                      {lote.quantidades.pgr}
                    </td>

                    <td className="px-3 py-3 text-center font-mono tabular-nums">
                      {lote.quantidades.ltcat}
                    </td>

                    <td className="px-3 py-3 text-center font-mono tabular-nums">
                      {lote.quantidades.aet}
                    </td>

                    <td className="px-3 py-3 text-center font-mono tabular-nums">
                      {lote.quantidades.periculosidade}
                    </td>

                    <td className="px-3 py-3 text-center font-mono tabular-nums">
                      {lote.quantidades.insalubridade}
                    </td>

                    <td className="px-3 py-3 text-center font-mono tabular-nums">
                      {lote.quantidades.arp}
                    </td>

                    <td className="px-3 py-3 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatarMoeda(lote.valorLiquido)}
                      {lote.descontosGlosas > 0 && (
                        <span className="block text-[10px] text-rose-600 dark:text-rose-400 font-normal">
                          Glosa: -{formatarMoeda(lote.descontosGlosas)}
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-3 text-center font-mono tabular-nums whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {lote.dataEnvioPagamento ? formatarDataBR(lote.dataEnvioPagamento) : '-'}
                    </td>

                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 font-semibold text-xs ${
                        isPago ? 'text-emerald-600 dark:text-emerald-400' :
                        isEnviado ? 'text-blue-600 dark:text-blue-400' :
                        'text-amber-600 dark:text-amber-400'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          isPago ? 'bg-emerald-500' : isEnviado ? 'bg-blue-500' : 'bg-amber-500'
                        }`}></span>
                        <span>{lote.statusPagamento}</span>
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setLoteDetalhes(lote)}
                          title="Ver Demonstrativo Completo"
                          className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {isAberto && (
                          <button
                            onClick={() => handleMarcarEnviado(lote)}
                            title="Marcar como Enviado para Pagamento"
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors inline-flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Enviar</span>
                          </button>
                        )}

                        {isEnviado && (
                          <button
                            onClick={() => handleAprovarPago(lote)}
                            title="Confirmar Pagamento Realizado"
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors inline-flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Aprovar</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Modal de Detalhes da Medição */}
      {loteDetalhes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Demonstrativo Analítico: {loteDetalhes.lista}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Período: {loteDetalhes.periodo} · {loteDetalhes.ordemCompraSap}
                </p>
              </div>
              <button
                onClick={() => setLoteDetalhes(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-[11px] text-slate-500">PGR (R$ 850,00)</span>
                  <p className="text-sm font-bold font-mono mt-0.5">
                    {loteDetalhes.quantidades.pgr} un = {formatarMoeda(loteDetalhes.quantidades.pgr * loteDetalhes.valoresUnitarios.pgr)}
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-[11px] text-slate-500">LTCAT (R$ 920,00)</span>
                  <p className="text-sm font-bold font-mono mt-0.5">
                    {loteDetalhes.quantidades.ltcat} un = {formatarMoeda(loteDetalhes.quantidades.ltcat * loteDetalhes.valoresUnitarios.ltcat)}
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-[11px] text-slate-500">AET (R$ 650,00)</span>
                  <p className="text-sm font-bold font-mono mt-0.5">
                    {loteDetalhes.quantidades.aet} un = {formatarMoeda(loteDetalhes.quantidades.aet * loteDetalhes.valoresUnitarios.aet)}
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-[11px] text-slate-500">Periculosidade (R$ 480)</span>
                  <p className="text-sm font-bold font-mono mt-0.5">
                    {loteDetalhes.quantidades.periculosidade} un = {formatarMoeda(loteDetalhes.quantidades.periculosidade * loteDetalhes.valoresUnitarios.periculosidade)}
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-[11px] text-slate-500">Insalubridade (R$ 480)</span>
                  <p className="text-sm font-bold font-mono mt-0.5">
                    {loteDetalhes.quantidades.insalubridade} un = {formatarMoeda(loteDetalhes.quantidades.insalubridade * loteDetalhes.valoresUnitarios.insalubridade)}
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-[11px] text-slate-500">ARP (R$ 320,00)</span>
                  <p className="text-sm font-bold font-mono mt-0.5">
                    {loteDetalhes.quantidades.arp} un = {formatarMoeda(loteDetalhes.quantidades.arp * loteDetalhes.valoresUnitarios.arp)}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 rounded-lg space-y-1">
                <div className="flex justify-between">
                  <span>Valor Bruto:</span>
                  <span className="font-mono font-bold">{formatarMoeda(loteDetalhes.valorBruto)}</span>
                </div>
                <div className="flex justify-between text-rose-600 dark:text-rose-400">
                  <span>Descontos / Glosas:</span>
                  <span className="font-mono font-bold">-{formatarMoeda(loteDetalhes.descontosGlosas)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#61249b] dark:text-purple-300 pt-1 border-t border-purple-200 dark:border-purple-800">
                  <span>Valor Líquido Aprovado:</span>
                  <span className="font-mono">{formatarMoeda(loteDetalhes.valorLiquido)}</span>
                </div>
              </div>

              {loteDetalhes.observacoes && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Observações Técnicas / Auditoria:</p>
                  <p className="mt-0.5 text-slate-700 dark:text-slate-300">{loteDetalhes.observacoes}</p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setLoteDetalhes(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal Novo Lote */}
      {modalNovoLote && (
        <NovoLoteModal
          onClose={() => setModalNovoLote(false)}
          onSalvar={(novo) => {
            onAdicionarLote(novo);
            setModalNovoLote(false);
          }}
        />
      )}
    </div>
  );
};

// Subcomponente Modal de Criação de Lote
const NovoLoteModal: React.FC<{ onClose: () => void; onSalvar: (lote: LoteMedicaoFinanceira) => void }> = ({
  onClose,
  onSalvar,
}) => {
  const [lista, setLista] = useState('Lista 31');
  const [periodo, setPeriodo] = useState('Outubro/2026');
  const [pgrQtd, setPgrQtd] = useState(20);
  const [ltcatQtd, setLtcatQtd] = useState(20);
  const [aetQtd, setAetQtd] = useState(15);
  const [pericQtd, setPericQtd] = useState(8);
  const [insalQtd, setInsalQtd] = useState(6);
  const [arpQtd, setArpQtd] = useState(25);
  const [glosas, setGlosas] = useState(0);
  const [numeroNota, setNumeroNota] = useState('');
  const [poSap, setPoSap] = useState('PO-4500951000');
  const [observacoes, setObservacoes] = useState('');

  const pgrVal = 850;
  const ltcatVal = 920;
  const aetVal = 650;
  const pericVal = 480;
  const insalVal = 480;
  const arpVal = 320;

  const bruto = (pgrQtd * pgrVal) + (ltcatQtd * ltcatVal) + (aetQtd * aetVal) +
                (pericQtd * pericVal) + (insalQtd * insalVal) + (arpQtd * arpVal);
  const liquido = Math.max(0, bruto - glosas);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const novo: LoteMedicaoFinanceira = {
      id: `lote-${Date.now()}`,
      lista,
      periodo,
      quantidades: {
        pgr: pgrQtd,
        ltcat: ltcatQtd,
        aet: aetQtd,
        periculosidade: pericQtd,
        insalubridade: insalQtd,
        arp: arpQtd,
      },
      valoresUnitarios: {
        pgr: pgrVal,
        ltcat: ltcatVal,
        aet: aetVal,
        periculosidade: pericVal,
        insalubridade: insalVal,
        arp: arpVal,
      },
      valorBruto: bruto,
      descontosGlosas: glosas,
      valorLiquido: liquido,
      dataEnvioPagamento: null,
      statusPagamento: 'Aberto',
      numeroNotaFiscal: numeroNota || 'Pendente Emissão',
      ordemCompraSap: poSap,
      observacoes,
      saldoPendente: liquido,
    };
    onSalvar(novo);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Registrar Nova Medição / Lote de Laudos
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Nome do Lote
              </label>
              <input
                type="text"
                value={lista}
                onChange={(e) => setLista(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Mês / Período
              </label>
              <input
                type="text"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Qtd PGR (R$ 850)
              </label>
              <input
                type="number"
                min={0}
                value={pgrQtd}
                onChange={(e) => setPgrQtd(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Qtd LTCAT (R$ 920)
              </label>
              <input
                type="number"
                min={0}
                value={ltcatQtd}
                onChange={(e) => setLtcatQtd(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Qtd AET (R$ 650)
              </label>
              <input
                type="number"
                min={0}
                value={aetQtd}
                onChange={(e) => setAetQtd(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Qtd Periculosidade
              </label>
              <input
                type="number"
                min={0}
                value={pericQtd}
                onChange={(e) => setPericQtd(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Qtd Insalubridade
              </label>
              <input
                type="number"
                min={0}
                value={insalQtd}
                onChange={(e) => setInsalQtd(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Qtd ARP (R$ 320)
              </label>
              <input
                type="number"
                min={0}
                value={arpQtd}
                onChange={(e) => setArpQtd(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Glosas / Descontos (R$)
              </label>
              <input
                type="number"
                min={0}
                value={glosas}
                onChange={(e) => setGlosas(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-rose-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Nº Pedido Compra SAP (PO)
              </label>
              <input
                type="text"
                value={poSap}
                onChange={(e) => setPoSap(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-lg flex justify-between items-center">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Total Líquido Calculado:</span>
            <span className="text-base font-bold font-mono text-[#61249b] dark:text-purple-400">
              {formatarMoeda(liquido)}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#61249b] hover:bg-[#4d1c7c] text-white font-semibold shadow-xs"
            >
              Salvar Lote de Medição
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
