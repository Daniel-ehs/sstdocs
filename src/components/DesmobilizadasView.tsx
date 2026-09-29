import React, { useState, useMemo } from 'react';
import { 
  Archive, 
  Search, 
  Download, 
  RotateCcw, 
  AlertCircle, 
  FileCheck, 
  Calendar,
  UserCheck
} from 'lucide-react';
import { UnidadeDesmobilizada } from '../types/sst';
import { formatarDataBR, formatarCNPJ } from '../utils/dateCalculations';
import { exportarTabelaCSV } from '../utils/excelHandler';

interface DesmobilizadasViewProps {
  unidades: UnidadeDesmobilizada[];
  onReativarUnidade: (unidade: UnidadeDesmobilizada) => void;
}

export const DesmobilizadasView: React.FC<DesmobilizadasViewProps> = ({
  unidades,
  onReativarUnidade,
}) => {
  const [busca, setBusca] = useState('');
  const [filtroRegional, setFiltroRegional] = useState<string>('todos');
  const [unidadeParaReativar, setUnidadeParaReativar] = useState<UnidadeDesmobilizada | null>(null);

  const unidadesFiltradas = useMemo(() => {
    return unidades.filter(u => {
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const bateu = 
          u.filial.toLowerCase().includes(termo) ||
          u.cnpj.includes(termo) ||
          u.cidade.toLowerCase().includes(termo) ||
          u.motivo.toLowerCase().includes(termo) ||
          u.responsavelTst.toLowerCase().includes(termo);
        if (!bateu) return false;
      }
      if (filtroRegional !== 'todos' && u.regional !== filtroRegional) return false;
      return true;
    });
  }, [unidades, busca, filtroRegional]);

  const exportarCSV = () => {
    const dados = unidadesFiltradas.map(u => ({
      CNPJ: u.cnpj,
      Filial: u.filial,
      Tipo_Predio: u.tipoPredio,
      Regional: u.regional,
      UF: u.uf,
      Cidade: u.cidade,
      Data_Desmobilizacao: u.dataDesmobilizacao,
      Motivo: u.motivo,
      Responsavel_TST: u.responsavelTst,
      Dispensa_Laudo: u.documentosDispensados ? 'Sim' : 'Não',
      Observacoes: u.observacoes,
    }));
    exportarTabelaCSV(dados, `UNIDADES_DESMOBILIZADAS_VIVO_${new Date().toISOString().split('T')[0]}`);
  };

  const confirmarReativacao = () => {
    if (!unidadeParaReativar) return;
    onReativarUnidade(unidadeParaReativar);
    setUnidadeParaReativar(null);
  };

  return (
    <div className="space-y-4">
      {/* 1. Banner & Header do Arquivo Morto */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h1 className="text-base font-bold text-slate-800 dark:text-white">
              Unidades Desmobilizadas (Arquivo Morto)
            </h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Registro de prédios entregues, sites desativados e justificativas técnicas com dispensa de laudos de SST
          </p>
        </div>

        <button
          onClick={exportarCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors whitespace-nowrap self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar Arquivo Morto (CSV)</span>
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
            placeholder="Buscar por filial, CNPJ, motivo de encerramento, responsável TST..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-500"
          />
        </div>

        <select
          value={filtroRegional}
          onChange={(e) => setFiltroRegional(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-slate-500 w-full sm:w-auto"
        >
          <option value="todos">Todas as Regionais</option>
          <option value="SPO">SPO</option>
          <option value="SPI">SPI</option>
          <option value="NDT">NDT</option>
          <option value="SUL">SUL</option>
          <option value="CO">CO</option>
          <option value="RJ/ES">RJ/ES</option>
        </select>
      </div>

      {/* 3. Tabela do Arquivo Morto */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Unidade / Filial</th>
                <th className="px-3 py-3">CNPJ</th>
                <th className="px-3 py-3">Regional / UF</th>
                <th className="px-3 py-3">Data Desmobilização</th>
                <th className="px-4 py-3">Motivo / Parecer Técnico do TST</th>
                <th className="px-3 py-3">Responsável</th>
                <th className="px-3 py-3 text-center">Dispensa Laudo</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              {unidadesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    Nenhuma unidade desmobilizada encontrada.
                  </td>
                </tr>
              ) : (
                unidadesFiltradas.map((u) => (
                  <tr 
                    key={u.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                      <div className="truncate max-w-[200px]" title={u.filial}>
                        {u.filial}
                      </div>
                      <span className="text-[11px] text-slate-400 font-normal">
                        {u.tipoPredio}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                      {u.cnpj}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{u.regional}</span>
                      <span className="text-slate-400 mx-1">·</span>
                      <span>{u.uf} ({u.cidade})</span>
                    </td>
                    <td className="px-3 py-3 font-mono tabular-nums whitespace-nowrap">
                      {formatarDataBR(u.dataDesmobilizacao)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-md">
                        {u.motivo}
                      </p>
                      {u.observacoes && (
                        <p className="text-[11px] text-slate-400 mt-0.5 italic">
                          Obs: {u.observacoes}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                      {u.responsavelTst}
                    </td>
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Dispensado</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setUnidadeParaReativar(u)}
                        className="px-2.5 py-1 text-xs font-semibold text-[#61249b] dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/60 rounded-md transition-colors inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reativar</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmação de Reativação */}
      {unidadeParaReativar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Reativar Unidade Operacional?
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              A unidade <strong>{unidadeParaReativar.filial}</strong> será restaurada para a lista de <strong>Unidades Ativas</strong>.
              Você deverá cadastrar novas datas de emissão e vencimento para a Tríade Documental (PGR, LTCAT e AEP).
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs space-y-1">
              <p><strong>CNPJ:</strong> {unidadeParaReativar.cnpj}</p>
              <p><strong>Cidade:</strong> {unidadeParaReativar.cidade} - {unidadeParaReativar.uf}</p>
              <p><strong>Data da Desmobilização:</strong> {formatarDataBR(unidadeParaReativar.dataDesmobilizacao)}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setUnidadeParaReativar(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarReativacao}
                className="px-4 py-1.5 rounded-lg bg-[#61249b] hover:bg-[#4d1c7c] text-white font-semibold transition-colors text-xs"
              >
                Confirmar Reativação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
