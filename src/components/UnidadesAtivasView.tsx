import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  ExternalLink, 
  Archive, 
  ChevronUp, 
  ChevronDown, 
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Flame,
  Award
} from 'lucide-react';
import { UnidadeAtiva, Regional, SituacaoDocumento } from '../types/sst';
import { formatarDataBR, formatarCNPJ, getDiasRestantes } from '../utils/dateCalculations';
import { exportarTabelaCSV } from '../utils/excelHandler';

interface UnidadesAtivasViewProps {
  unidades: UnidadeAtiva[];
  filtroStatusInicial?: string;
  onSelecionarUnidade: (unidade: UnidadeAtiva) => void;
  onNovaUnidade: () => void;
  onDesmobilizarUnidade: (unidade: UnidadeAtiva) => void;
}

type SortField = 'filial' | 'cnpj' | 'regional' | 'cidade' | 'pgrVencimento' | 'situacao';
type SortOrder = 'asc' | 'desc';

export const UnidadesAtivasView: React.FC<UnidadesAtivasViewProps> = ({
  unidades,
  filtroStatusInicial,
  onSelecionarUnidade,
  onNovaUnidade,
  onDesmobilizarUnidade,
}) => {
  // Filtros
  const [busca, setBusca] = useState('');
  const [filtroRegional, setFiltroRegional] = useState<string>('todos');
  const [filtroStatusPgr, setFiltroStatusPgr] = useState<string>(filtroStatusInicial || 'todos');
  const [filtroIso, setFiltroIso] = useState<string>('todos');
  const [filtroNr20, setFiltroNr20] = useState<string>('todos');
  const [filtroLista, setFiltroLista] = useState<string>('todos');

  // Ordenação
  const [sortField, setSortField] = useState<SortField>('pgrVencimento');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(15);

  // Listas de opções dinâmicas
  const regionaisDisponiveis = useMemo(() => {
    const set = new Set(unidades.map(u => u.regional));
    return Array.from(set).sort();
  }, [unidades]);

  const listasDisponiveis = useMemo(() => {
    const set = new Set(unidades.map(u => u.pgr.lista));
    return Array.from(set).sort();
  }, [unidades]);

  // Filtragem
  const unidadesFiltradas = useMemo(() => {
    return unidades.filter(u => {
      // Busca geral
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const bateu = 
          u.filial.toLowerCase().includes(termo) ||
          u.cnpj.includes(termo) ||
          u.cidade.toLowerCase().includes(termo) ||
          u.bairro.toLowerCase().includes(termo) ||
          u.endereco.toLowerCase().includes(termo) ||
          u.regional.toLowerCase().includes(termo) ||
          u.numeroPo.toLowerCase().includes(termo);
        if (!bateu) return false;
      }

      // Filtro Regional
      if (filtroRegional !== 'todos' && u.regional !== filtroRegional) return false;

      // Filtro Status PGR
      if (filtroStatusPgr !== 'todos' && u.pgr.situacao !== filtroStatusPgr) return false;

      // Filtro ISO 45001
      if (filtroIso !== 'todos' && u.escopoIso45001 !== filtroIso) return false;

      // Filtro NR-20
      if (filtroNr20 !== 'todos' && u.nr20 !== filtroNr20) return false;

      // Filtro Lista
      if (filtroLista !== 'todos' && u.pgr.lista !== filtroLista) return false;

      return true;
    });
  }, [unidades, busca, filtroRegional, filtroStatusPgr, filtroIso, filtroNr20, filtroLista]);

  // Ordenação
  const unidadesOrdenadas = useMemo(() => {
    return [...unidadesFiltradas].sort((a, b) => {
      let valorA: any = '';
      let valorB: any = '';

      switch (sortField) {
        case 'filial':
          valorA = a.filial.toLowerCase();
          valorB = b.filial.toLowerCase();
          break;
        case 'cnpj':
          valorA = a.cnpj;
          valorB = b.cnpj;
          break;
        case 'regional':
          valorA = a.regional;
          valorB = b.regional;
          break;
        case 'cidade':
          valorA = a.cidade.toLowerCase();
          valorB = b.cidade.toLowerCase();
          break;
        case 'pgrVencimento':
          valorA = a.pgr.dataVencimento || '9999-99-99';
          valorB = b.pgr.dataVencimento || '9999-99-99';
          break;
        case 'situacao':
          valorA = a.pgr.situacao;
          valorB = b.pgr.situacao;
          break;
      }

      if (valorA < valorB) return sortOrder === 'asc' ? -1 : 1;
      if (valorA > valorB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [unidadesFiltradas, sortField, sortOrder]);

  // Paginação
  const totalPaginas = Math.ceil(unidadesOrdenadas.length / itensPorPagina) || 1;
  const unidadesPaginadas = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    return unidadesOrdenadas.slice(inicio, inicio + itensPorPagina);
  }, [unidadesOrdenadas, paginaAtual, itensPorPagina]);

  const alternarOrdenacao = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const limparFiltros = () => {
    setBusca('');
    setFiltroRegional('todos');
    setFiltroStatusPgr('todos');
    setFiltroIso('todos');
    setFiltroNr20('todos');
    setFiltroLista('todos');
    setPaginaAtual(1);
  };

  const exportarCSVFiltrado = () => {
    const dados = unidadesOrdenadas.map(u => ({
      CNPJ: u.cnpj,
      Filial: u.filial,
      Tipo_Predio: u.tipoPredio,
      Regional: u.regional,
      UF: u.uf,
      Cidade: u.cidade,
      Endereco: u.endereco,
      ISO_45001: u.escopoIso45001,
      NR_20: u.nr20,
      PO_SAP: u.numeroPo,
      PGR_Lista: u.pgr.lista,
      PGR_Emissao: u.pgr.dataEmissao,
      PGR_Vencimento: u.pgr.dataVencimento,
      PGR_Situacao: u.pgr.situacao,
      LTCAT_Status: u.ltcat.status,
      AEP_Status: u.aep.status,
    }));
    exportarTabelaCSV(dados, `UNIDADES_ATIVAS_PGR_VIVO_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-4">
      {/* 1. Barra de Ações Superiores & Busca */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Campo de Busca Rápida */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setPaginaAtual(1); }}
              placeholder="Buscar por filial, CNPJ, cidade, regional, PO SAP..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#61249b]"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={exportarCSVFiltrado}
              title="Exportar dados visíveis para CSV"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={onNovaUnidade}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#61249b] hover:bg-[#4d1c7c] rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar Unidade</span>
            </button>
          </div>
        </div>

        {/* Linha de Filtros de Alta Densidade */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Filtro Regional */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Regional
            </label>
            <select
              value={filtroRegional}
              onChange={(e) => { setFiltroRegional(e.target.value); setPaginaAtual(1); }}
              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-[#61249b]"
            >
              <option value="todos">Todas as Regionais</option>
              {regionaisDisponiveis.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Filtro Status PGR */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Status do PGR
            </label>
            <select
              value={filtroStatusPgr}
              onChange={(e) => { setFiltroStatusPgr(e.target.value); setPaginaAtual(1); }}
              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-[#61249b]"
            >
              <option value="todos">Todos os Status</option>
              <option value="Vigente">Vigente (Verde)</option>
              <option value="Vencendo em 60 dias">Vencendo em 60d (Âmbar)</option>
              <option value="Vencido">Vencido (Vermelho)</option>
              <option value="Sem Laudo">Sem Laudo</option>
            </select>
          </div>

          {/* Filtro Lista PGR */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Lista de Entrega
            </label>
            <select
              value={filtroLista}
              onChange={(e) => { setFiltroLista(e.target.value); setPaginaAtual(1); }}
              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-[#61249b]"
            >
              <option value="todos">Todas as Listas</option>
              {listasDisponiveis.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Filtro Escopo ISO 45001 */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Escopo ISO 45001
            </label>
            <select
              value={filtroIso}
              onChange={(e) => { setFiltroIso(e.target.value); setPaginaAtual(1); }}
              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-[#61249b]"
            >
              <option value="todos">Todos</option>
              <option value="Sim">Sim (No Escopo)</option>
              <option value="Não">Não</option>
              <option value="Em Auditoria">Em Auditoria</option>
            </select>
          </div>

          {/* Filtro NR-20 */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              NR-20 (Gerador)
            </label>
            <select
              value={filtroNr20}
              onChange={(e) => { setFiltroNr20(e.target.value); setPaginaAtual(1); }}
              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-[#61249b]"
            >
              <option value="todos">Todos</option>
              <option value="Sim">Sim (Com Gerador)</option>
              <option value="Não">Não</option>
            </select>
          </div>

          {/* Botão Limpar Filtros */}
          <div className="flex items-end">
            <button
              onClick={limparFiltros}
              className="w-full py-1 px-2 flex items-center justify-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-xs font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpar Filtros</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Tabela de Dados Interativa */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th 
                  onClick={() => alternarOrdenacao('filial')}
                  className="px-4 py-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Filial / Unidade</span>
                    {sortField === 'filial' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th 
                  onClick={() => alternarOrdenacao('cnpj')}
                  className="px-3 py-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>CNPJ</span>
                    {sortField === 'cnpj' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th 
                  onClick={() => alternarOrdenacao('regional')}
                  className="px-3 py-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Regional / Cidade</span>
                    {sortField === 'regional' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="px-3 py-3 text-center">Normas</th>
                <th 
                  onClick={() => alternarOrdenacao('pgrVencimento')}
                  className="px-3 py-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>PGR (Lista · Vencimento)</span>
                    {sortField === 'pgrVencimento' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th 
                  onClick={() => alternarOrdenacao('situacao')}
                  className="px-3 py-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Situação PGR</span>
                    {sortField === 'situacao' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="px-3 py-3 text-center">LTCAT</th>
                <th className="px-3 py-3 text-center">AEP</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {unidadesPaginadas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                    <p className="text-sm font-medium">Nenhuma unidade encontrada para os filtros selecionados.</p>
                    <button
                      onClick={limparFiltros}
                      className="mt-2 text-xs text-[#61249b] dark:text-purple-400 underline font-semibold"
                    >
                      Redefinir todos os filtros
                    </button>
                  </td>
                </tr>
              ) : (
                unidadesPaginadas.map((u) => {
                  const dias = getDiasRestantes(u.pgr.dataVencimento);
                  const isVencido = u.pgr.situacao === 'Vencido';
                  const isVencendo = u.pgr.situacao === 'Vencendo em 60 dias';

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Filial & Tipo */}
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        <div 
                          onClick={() => onSelecionarUnidade(u)}
                          className="cursor-pointer hover:text-[#61249b] dark:hover:text-purple-400 transition-colors truncate max-w-[220px]" 
                          title={u.filial}
                        >
                          {u.filial}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal flex items-center gap-1.5 mt-0.5">
                          <span>{u.tipoPredio}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{u.numeroPo}</span>
                        </div>
                      </td>

                      {/* CNPJ */}
                      <td className="px-3 py-3 font-mono tabular-nums text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {u.cnpj}
                      </td>

                      {/* Regional & UF / Cidade */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {u.regional} · {u.uf}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                          {u.cidade}
                        </div>
                      </td>

                      {/* Badges de Normas (ISO 45001 / NR-20) */}
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5 text-[11px]">
                          {u.escopoIso45001 === 'Sim' ? (
                            <span 
                              title="No escopo certificado ISO 45001 (Validade Trienal)" 
                              className="font-medium text-[#61249b] dark:text-purple-400 flex items-center gap-0.5"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>ISO</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-600">-</span>
                          )}

                          {u.nr20 === 'Sim' && (
                            <span 
                              title="Possui Gerador e Tanques de Combustível (NR-20)"
                              className="font-medium text-amber-600 dark:text-amber-400 flex items-center gap-0.5"
                            >
                              <Flame className="w-3.5 h-3.5" />
                              <span>NR-20</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* PGR Lista & Vencimento */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <span className="font-mono">{u.pgr.lista}</span>
                          <span className="text-slate-400">·</span>
                          <span className="font-mono tabular-nums">{formatarDataBR(u.pgr.dataVencimento)}</span>
                        </div>
                        <div className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                          {dias !== null ? (
                            dias < 0 ? (
                              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                                Vencido há {Math.abs(dias)}d
                              </span>
                            ) : dias <= 60 ? (
                              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                                Restam {dias}d
                              </span>
                            ) : (
                              <span>Validade: {dias}d</span>
                            )
                          ) : '-'}
                        </div>
                      </td>

                      {/* Situação PGR */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 font-semibold text-xs ${
                          isVencido ? 'text-rose-600 dark:text-rose-400' :
                          isVencendo ? 'text-amber-600 dark:text-amber-400' :
                          'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            isVencido ? 'bg-rose-500' :
                            isVencendo ? 'bg-amber-500' :
                            'bg-emerald-500'
                          }`}></span>
                          <span>{u.pgr.situacao}</span>
                        </span>
                      </td>

                      {/* LTCAT */}
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        <span className={`font-semibold text-xs ${
                          u.ltcat.status === 'Vigente' ? 'text-blue-600 dark:text-blue-400' :
                          u.ltcat.status === 'Atenção' ? 'text-amber-600 dark:text-amber-400' :
                          u.ltcat.status === 'Na Rede' ? 'text-purple-600 dark:text-purple-400' :
                          'text-slate-400'
                        }`}>
                          {u.ltcat.status}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {u.ltcat.lista}
                        </div>
                      </td>

                      {/* AEP */}
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        <span className={`font-semibold text-xs ${
                          u.aep.status === 'Vigente' ? 'text-emerald-600 dark:text-emerald-400' :
                          u.aep.status === 'Atenção' ? 'text-amber-600 dark:text-amber-400' :
                          'text-slate-400'
                        }`}>
                          {u.aep.status}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {u.aep.lista}
                        </div>
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelecionarUnidade(u)}
                            title="Ver Detalhes e Tríade Documental"
                            className="p-1.5 text-[#61249b] dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60 rounded-md transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDesmobilizarUnidade(u)}
                            title="Desmobilizar Unidade (Arquivo Morto)"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé da Tabela: Paginação & Contagem */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Exibindo <strong className="font-mono text-slate-800 dark:text-slate-200">{unidadesFiltradas.length > 0 ? (paginaAtual - 1) * itensPorPagina + 1 : 0}</strong> a{' '}
              <strong className="font-mono text-slate-800 dark:text-slate-200">
                {Math.min(paginaAtual * itensPorPagina, unidadesFiltradas.length)}
              </strong> de{' '}
              <strong className="font-mono text-slate-800 dark:text-slate-200">{unidadesFiltradas.length}</strong> unidades
            </span>
            <span className="hidden sm:inline">·</span>
            <select
              value={itensPorPagina}
              onChange={(e) => { setItensPorPagina(Number(e.target.value)); setPaginaAtual(1); }}
              className="bg-transparent border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-700 dark:text-slate-300"
            >
              <option value={10}>10 / página</option>
              <option value={15}>15 / página</option>
              <option value={25}>25 / página</option>
              <option value={50}>50 / página</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPaginaAtual(p => Math.max(p - 1, 1))}
              disabled={paginaAtual === 1}
              className="px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors font-medium text-xs"
            >
              Anterior
            </button>
            <span className="px-2 font-mono tabular-nums">
              Página {paginaAtual} de {totalPaginas}
            </span>
            <button
              onClick={() => setPaginaAtual(p => Math.min(p + 1, totalPaginas))}
              disabled={paginaAtual === totalPaginas}
              className="px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors font-medium text-xs"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
