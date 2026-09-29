import React, { useState, useMemo } from 'react';
import { 
  Radio, 
  Search, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  Flame, 
  ShieldCheck,
  Edit2
} from 'lucide-react';
import { ControleDG, Regional } from '../types/sst';
import { formatarDataBR, getDiasRestantes } from '../utils/dateCalculations';
import { exportarTabelaCSV } from '../utils/excelHandler';

interface DGsViewProps {
  dgs: ControleDG[];
  onAtualizarDG: (dgAtualizado: ControleDG) => void;
}

export const DGsView: React.FC<DGsViewProps> = ({ dgs, onAtualizarDG }) => {
  const [busca, setBusca] = useState('');
  const [filtroRegional, setFiltroRegional] = useState<string>('todos');
  const [filtroStatusNr01, setFiltroStatusNr01] = useState<string>('todos');
  const [dgEditando, setDgEditando] = useState<ControleDG | null>(null);

  const dgsFiltrados = useMemo(() => {
    return dgs.filter(dg => {
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const bateu = 
          dg.nomeEmpresa.toLowerCase().includes(termo) ||
          dg.cnpjDg.includes(termo) ||
          dg.codigoDg.toLowerCase().includes(termo) ||
          dg.cidade.toLowerCase().includes(termo) ||
          dg.bairro.toLowerCase().includes(termo);
        if (!bateu) return false;
      }
      if (filtroRegional !== 'todos' && dg.regional !== filtroRegional) return false;
      if (filtroStatusNr01 !== 'todos' && dg.statusNr01 !== filtroStatusNr01) return false;
      return true;
    });
  }, [dgs, busca, filtroRegional, filtroStatusNr01]);

  const exportarCSV = () => {
    const dados = dgsFiltrados.map(d => ({
      Nome_Empresa: d.nomeEmpresa,
      CNPJ_DG: d.cnpjDg,
      Codigo_DG: d.codigoDg,
      Regional: d.regional,
      UF: d.uf,
      Cidade: d.cidade,
      PGR_Situacao: d.pgrSituacao,
      PGR_Vencimento: d.pgrDataVencimento,
      Status_NR01_GRO: d.statusNr01,
      LTCAT: d.ltcatStatus,
      AEP: d.aepStatus,
      Tipo_Cabine: d.tipoCabine,
      Gerador_NR20: d.nr20Gerador ? 'Sim' : 'Não',
      Ultima_Vistoria: d.ultimaVistoria,
    }));
    exportarTabelaCSV(dados, `CONTROLE_DGS_VIVO_${new Date().toISOString().split('T')[0]}`);
  };

  const salvarEdicaoDG = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dgEditando) return;
    onAtualizarDG(dgEditando);
    setDgEditando(null);
  };

  return (
    <div className="space-y-4">
      {/* 1. Header do Módulo de DGs */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#61249b] dark:text-purple-400" />
            <h1 className="text-base font-bold text-slate-900 dark:text-white">
              Controle de DGs (Distribuidores Gerais)
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitoramento das centrais técnicas, cabines primárias e conformidade com NR-01 (GRO) e NR-20
          </p>
        </div>

        <button
          onClick={exportarCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar DGs (CSV)</span>
        </button>
      </div>

      {/* 2. Filtros e Busca */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar DG por código, nome, CNPJ, cidade..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#61249b]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filtroRegional}
            onChange={(e) => setFiltroRegional(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-[#61249b]"
          >
            <option value="todos">Todas Regionais</option>
            <option value="SPO">SPO</option>
            <option value="SPI">SPI</option>
            <option value="NDT">NDT</option>
            <option value="SUL">SUL</option>
            <option value="CO">CO</option>
            <option value="RJ/ES">RJ/ES</option>
          </select>

          <select
            value={filtroStatusNr01}
            onChange={(e) => setFiltroStatusNr01(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-[#61249b]"
          >
            <option value="todos">Todos Status NR-01</option>
            <option value="Conforme (GRO Implantado)">Conforme GRO</option>
            <option value="Pendente Revisão">Pendente Revisão</option>
            <option value="Não Conforme">Não Conforme</option>
          </select>
        </div>
      </div>

      {/* 3. Tabela de DGs */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Código DG / Empresa</th>
                <th className="px-3 py-3">CNPJ DG</th>
                <th className="px-3 py-3">Regional / UF</th>
                <th className="px-3 py-3">Tipo Cabine</th>
                <th className="px-3 py-3">PGR (Vencimento)</th>
                <th className="px-3 py-3">Situação PGR</th>
                <th className="px-3 py-3">Status NR-01 (GRO)</th>
                <th className="px-3 py-3 text-center">LTCAT / AEP</th>
                <th className="px-3 py-3">Última Vistoria</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {dgsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    Nenhum DG correspondente aos filtros.
                  </td>
                </tr>
              ) : (
                dgsFiltrados.map((dg) => {
                  const dias = getDiasRestantes(dg.pgrDataVencimento);
                  const isVencido = dg.pgrSituacao === 'Vencido';
                  const isVencendo = dg.pgrSituacao === 'Vencendo em 60 dias';

                  return (
                    <tr key={dg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Código DG & Nome */}
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        <div className="font-mono text-purple-700 dark:text-purple-300">
                          {dg.codigoDg}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate max-w-[220px]" title={dg.nomeEmpresa}>
                          {dg.nomeEmpresa}
                        </div>
                      </td>

                      {/* CNPJ */}
                      <td className="px-3 py-3 font-mono tabular-nums text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {dg.cnpjDg}
                      </td>

                      {/* Regional / UF */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{dg.regional}</span>
                        <span className="text-slate-400 mx-1">·</span>
                        <span>{dg.uf} ({dg.cidade})</span>
                      </td>

                      {/* Tipo Cabine */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {dg.tipoCabine}
                        </span>
                        {dg.nr20Gerador && (
                          <span className="block text-[10px] text-amber-600 dark:text-amber-400">
                            Gerador NR-20 Ativo
                          </span>
                        )}
                      </td>

                      {/* PGR Vencimento */}
                      <td className="px-3 py-3 font-mono tabular-nums whitespace-nowrap">
                        {formatarDataBR(dg.pgrDataVencimento)}
                        <span className="block text-[10px] text-slate-400">
                          Emissão: {formatarDataBR(dg.pgrDataEmissao)}
                        </span>
                      </td>

                      {/* Situação PGR */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 font-semibold ${
                          isVencido ? 'text-rose-600 dark:text-rose-400' :
                          isVencendo ? 'text-amber-600 dark:text-amber-400' :
                          'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            isVencido ? 'bg-rose-500' : isVencendo ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}></span>
                          <span>{dg.pgrSituacao}</span>
                        </span>
                      </td>

                      {/* Status NR-01 GRO */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 font-medium ${
                          dg.statusNr01 === 'Conforme (GRO Implantado)'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : dg.statusNr01 === 'Pendente Revisão'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {dg.statusNr01 === 'Conforme (GRO Implantado)' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          <span>{dg.statusNr01}</span>
                        </span>
                      </td>

                      {/* LTCAT / AEP */}
                      <td className="px-3 py-3 text-center whitespace-nowrap font-mono text-[11px]">
                        <span className={dg.ltcatStatus === 'Vigente' ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}>
                          LTCAT: {dg.ltcatStatus}
                        </span>
                        <span className="block text-slate-400">
                          AEP: {dg.aepStatus}
                        </span>
                      </td>

                      {/* Última Vistoria */}
                      <td className="px-3 py-3 font-mono tabular-nums whitespace-nowrap text-slate-600 dark:text-slate-400">
                        {formatarDataBR(dg.ultimaVistoria)}
                      </td>

                      {/* Ação */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setDgEditando({ ...dg })}
                          className="px-2.5 py-1 text-xs font-medium text-[#61249b] dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/60 rounded-md transition-colors inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Atualizar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Atualização de DG */}
      {dgEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Atualizar Status do DG: {dgEditando.codigoDg}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{dgEditando.nomeEmpresa}</p>
              </div>
              <button
                onClick={() => setDgEditando(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={salvarEdicaoDG} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Situação do PGR
                  </label>
                  <select
                    value={dgEditando.pgrSituacao}
                    onChange={(e) => setDgEditando({ ...dgEditando, pgrSituacao: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  >
                    <option value="Vigente">Vigente</option>
                    <option value="Vencendo em 60 dias">Vencendo em 60 dias</option>
                    <option value="Vencido">Vencido</option>
                    <option value="Sem Laudo">Sem Laudo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Status NR-01 (GRO)
                  </label>
                  <select
                    value={dgEditando.statusNr01}
                    onChange={(e) => setDgEditando({ ...dgEditando, statusNr01: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  >
                    <option value="Conforme (GRO Implantado)">Conforme (GRO Implantado)</option>
                    <option value="Pendente Revisão">Pendente Revisão</option>
                    <option value="Não Conforme">Não Conforme</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Data Emissão PGR
                  </label>
                  <input
                    type="date"
                    value={dgEditando.pgrDataEmissao}
                    onChange={(e) => setDgEditando({ ...dgEditando, pgrDataEmissao: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Data Vencimento PGR
                  </label>
                  <input
                    type="date"
                    value={dgEditando.pgrDataVencimento}
                    onChange={(e) => setDgEditando({ ...dgEditando, pgrDataVencimento: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Data da Última Vistoria Técnica
                  </label>
                  <input
                    type="date"
                    value={dgEditando.ultimaVistoria}
                    onChange={(e) => setDgEditando({ ...dgEditando, ultimaVistoria: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Gerador NR-20 Ativo?
                  </label>
                  <select
                    value={dgEditando.nr20Gerador ? 'Sim' : 'Não'}
                    onChange={(e) => setDgEditando({ ...dgEditando, nr20Gerador: e.target.value === 'Sim' })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  >
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Observações Técnicas / Plano de Ação
                </label>
                <textarea
                  rows={2}
                  value={dgEditando.observacoes}
                  onChange={(e) => setDgEditando({ ...dgEditando, observacoes: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDgEditando(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#61249b] hover:bg-[#4d1c7c] text-white font-semibold transition-colors shadow-xs"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
