import React from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  FileText, 
  Award,
  ArrowRight,
  ShieldAlert,
  Flame,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { UnidadeAtiva, ControleDG, LoteMedicaoFinanceira } from '../types/sst';
import { formatarDataBR, getDiasRestantes, DATA_REFERENCIA } from '../utils/dateCalculations';

interface DashboardViewProps {
  unidadesAtivas: UnidadeAtiva[];
  controleDGs: ControleDG[];
  lotesMedicao: LoteMedicaoFinanceira[];
  onSelecionarUnidade: (unidade: UnidadeAtiva) => void;
  onNavegarParaAtivas: (filtroStatus?: string) => void;
  onNavegarParaDGs: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  unidadesAtivas,
  controleDGs,
  lotesMedicao,
  onSelecionarUnidade,
  onNavegarParaAtivas,
  onNavegarParaDGs,
}) => {
  // Cálculos de métricas
  const totalAtivas = unidadesAtivas.length;
  
  const pgrVigentes = unidadesAtivas.filter(u => u.pgr.situacao === 'Vigente').length;
  const pgrVencendo = unidadesAtivas.filter(u => u.pgr.situacao === 'Vencendo em 60 dias').length;
  const pgrVencidos = unidadesAtivas.filter(u => u.pgr.situacao === 'Vencido').length;
  const pctPgrVigentes = totalAtivas > 0 ? Math.round((pgrVigentes / totalAtivas) * 100) : 0;

  const ltcatVigentes = unidadesAtivas.filter(u => u.ltcat.status === 'Vigente').length;
  const pctLtcat = totalAtivas > 0 ? Math.round((ltcatVigentes / totalAtivas) * 100) : 0;

  const aepVigentes = unidadesAtivas.filter(u => u.aep.status === 'Vigente').length;
  const pctAep = totalAtivas > 0 ? Math.round((aepVigentes / totalAtivas) * 100) : 0;

  const iso45001 = unidadesAtivas.filter(u => u.escopoIso45001 === 'Sim').length;
  const pctIso = totalAtivas > 0 ? Math.round((iso45001 / totalAtivas) * 100) : 0;

  const unidadesNr20 = unidadesAtivas.filter(u => u.nr20 === 'Sim').length;

  // Distribuição por Regional
  const regionais = ['SPO', 'SPI', 'NDT', 'SUL', 'CO', 'RJ/ES', 'NORTE'] as const;
  const contagemRegional = regionais.map(reg => {
    const total = unidadesAtivas.filter(u => u.regional === reg).length;
    const vencendoOuVencido = unidadesAtivas.filter(
      u => u.regional === reg && (u.pgr.situacao === 'Vencendo em 60 dias' || u.pgr.situacao === 'Vencido')
    ).length;
    return {
      regional: reg,
      total,
      vencendoOuVencido,
      pctTotal: totalAtivas > 0 ? Math.round((total / totalAtivas) * 100) : 0,
    };
  });

  // Alertas Críticos: Unidades vencidas ou vencendo em 60 dias
  const alertasCriticos = unidadesAtivas
    .filter(u => u.pgr.situacao === 'Vencido' || u.pgr.situacao === 'Vencendo em 60 dias')
    .sort((a, b) => {
      // Prioridade: Vencidos primeiro, depois os com menor dias restantes
      if (a.pgr.situacao === 'Vencido' && b.pgr.situacao !== 'Vencido') return -1;
      if (a.pgr.situacao !== 'Vencido' && b.pgr.situacao === 'Vencido') return 1;
      const diasA = getDiasRestantes(a.pgr.dataVencimento) ?? 999;
      const diasB = getDiasRestantes(b.pgr.dataVencimento) ?? 999;
      return diasA - diasB;
    });

  // DGs com pendências
  const dgsAlerta = controleDGs.filter(dg => dg.pgrSituacao !== 'Vigente' || dg.statusNr01 !== 'Conforme (GRO Implantado)');

  return (
    <div className="space-y-6">
      {/* 1. Header do Dashboard com Resumo Executivo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Painel Executivo de Segurança do Trabalho
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitoramento em tempo real do Programa de Gerenciamento de Riscos (PGR), LTCAT e AEP
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 rounded-lg text-xs text-[#61249b] dark:text-purple-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#61249b] animate-pulse"></span>
            <span>Auditoria NR-01 & ISO 45001 Ativa</span>
          </div>
        </div>
      </div>

      {/* 2. Grid de KPIs Executivos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1: Total CNPJs Ativos */}
        <div 
          onClick={() => onNavegarParaAtivas()}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-medium tracking-wide">CNPJs ATIVOS</span>
            <Building2 className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {totalAtivas}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">unidades</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            7 Regionais cobertas
          </p>
        </div>

        {/* KPI 2: PGR Vigentes */}
        <div 
          onClick={() => onNavegarParaAtivas('Vigente')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-medium tracking-wide text-emerald-700 dark:text-emerald-400">PGR VIGENTES</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              {pgrVigentes}
            </span>
            <span className="text-xs font-mono font-medium text-emerald-700 dark:text-emerald-500">
              ({pctPgrVigentes}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Em conformidade plena
          </p>
        </div>

        {/* KPI 3: PGR Vencendo em 60 dias */}
        <div 
          onClick={() => onNavegarParaAtivas('Vencendo em 60 dias')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 hover:border-amber-400 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-2">
            <span className="text-[11px] font-medium tracking-wide">VENCENDO (≤60D)</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
              {pgrVencendo}
            </span>
            <span className="text-xs text-amber-700 dark:text-amber-500 font-medium">alerta</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Em elaboração / Lista 30
          </p>
        </div>

        {/* KPI 4: PGR Vencidos */}
        <div 
          onClick={() => onNavegarParaAtivas('Vencido')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 hover:border-rose-400 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 mb-2">
            <span className="text-[11px] font-medium tracking-wide">PGR VENCIDOS</span>
            <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
              {pgrVencidos}
            </span>
            <span className="text-xs text-rose-700 dark:text-rose-400 font-semibold">crítico</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Ação corretiva imediata
          </p>
        </div>

        {/* KPI 5: Cobertura LTCAT */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-medium tracking-wide">COBERTURA LTCAT</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {pctLtcat}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({ltcatVigentes}/{totalAtivas})
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Previdência & eSocial
          </p>
        </div>

        {/* KPI 6: Escopo ISO 45001 */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-[#61249b] dark:text-purple-400 mb-2">
            <span className="text-[11px] font-medium tracking-wide">ESCOPO ISO 45001</span>
            <Award className="w-4 h-4 text-[#61249b] dark:text-purple-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#61249b] dark:text-purple-400 font-mono tabular-nums">
              {iso45001}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({pctIso}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Validade Trienal
          </p>
        </div>
      </div>

      {/* 3. Seção Intermediária: Tríade Documental + Distribuição Regional */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Painel da Tríade Documental (PGR, LTCAT, AEP) */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Conformidade da Tríade Documental
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aderência regulamentar das unidades ativas da Vivo
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
              2026
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {/* PGR */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  PGR · Programa de Gerenciamento de Riscos (NR-01)
                </span>
                <span className="font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                  {pctPgrVigentes}% vigente
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-500 h-full transition-all" 
                  style={{ width: `${pctPgrVigentes}%` }} 
                  title={`Vigentes: ${pgrVigentes}`}
                />
                <div 
                  className="bg-amber-400 h-full transition-all" 
                  style={{ width: `${(pgrVencendo / totalAtivas) * 100}%` }} 
                  title={`Vencendo: ${pgrVencendo}`}
                />
                <div 
                  className="bg-rose-500 h-full transition-all" 
                  style={{ width: `${(pgrVencidos / totalAtivas) * 100}%` }} 
                  title={`Vencidos: ${pgrVencidos}`}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>{pgrVigentes} vigentes</span>
                <span>{pgrVencendo} vencendo em 60d</span>
                <span>{pgrVencidos} vencidos</span>
              </div>
            </div>

            {/* LTCAT */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  LTCAT · Laudo Técnico Ambiental (Previdência / INSS)
                </span>
                <span className="font-mono tabular-nums font-bold text-blue-600 dark:text-blue-400">
                  {pctLtcat}% regular
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div 
                  className="bg-blue-500 h-full transition-all" 
                  style={{ width: `${pctLtcat}%` }} 
                />
                <div 
                  className="bg-amber-400 h-full transition-all" 
                  style={{ width: `${((totalAtivas - ltcatVigentes) / totalAtivas) * 100}%` }} 
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>{ltcatVigentes} vigentes na rede</span>
                <span>{totalAtivas - ltcatVigentes} sob revisão ou na rede</span>
              </div>
            </div>

            {/* AEP / AET */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  AEP / AET · Avaliação Ergonômica (NR-17)
                </span>
                <span className="font-mono tabular-nums font-bold text-purple-600 dark:text-purple-400">
                  {pctAep}% regular
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div 
                  className="bg-[#61249b] h-full transition-all" 
                  style={{ width: `${pctAep}%` }} 
                />
                <div 
                  className="bg-amber-400 h-full transition-all" 
                  style={{ width: `${((totalAtivas - aepVigentes) / totalAtivas) * 100}%` }} 
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>{aepVigentes} laudos vigentes</span>
                <span>{totalAtivas - aepVigentes} sob acompanhamento</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Unidades com geradores / NR-20:
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {unidadesNr20} de {totalAtivas} prédios
            </span>
          </div>
        </div>

        {/* Distribuição por Regional */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Distribuição de Unidades por Regional
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Volume de prédios e status de vencimento por divisão geográfica
              </p>
            </div>
            <button 
              onClick={() => onNavegarParaAtivas()}
              className="text-xs font-semibold text-[#61249b] dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {contagemRegional.map((reg) => (
              <div key={reg.regional} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-12 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {reg.regional}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {reg.regional === 'SPO' ? 'São Paulo Operações' :
                       reg.regional === 'SPI' ? 'São Paulo Interior' :
                       reg.regional === 'NDT' ? 'Nordeste' :
                       reg.regional === 'SUL' ? 'Região Sul' :
                       reg.regional === 'CO' ? 'Centro-Oeste' :
                       reg.regional === 'RJ/ES' ? 'Rio de Janeiro e Espírito Santo' : 'Região Norte'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono tabular-nums">
                    {reg.vencendoOuVencido > 0 && (
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        {reg.vencendoOuVencido} pendência(s)
                      </span>
                    )}
                    <span className="font-bold text-slate-900 dark:text-white">
                      {reg.total} unidades
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-[#61249b] h-full" 
                    style={{ width: `${(reg.total / totalAtivas) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Tabela de Alertas Críticos (Vencidos ou Vencendo em 60 dias) */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Quadro de Alertas Críticos de Vencimento
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {alertasCriticos.length} unidades com PGR vencido ou com validade limite inferior a 60 dias
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavegarParaAtivas('Vencendo em 60 dias')}
            className="text-xs font-semibold text-[#61249b] dark:text-purple-400 hover:text-[#4d1c7c] dark:hover:text-purple-300 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Filtrar na Tabela Geral</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {alertasCriticos.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-medium">Nenhum documento com vencimento crítico no momento.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Unidade / Filial</th>
                  <th className="px-4 py-3">CNPJ</th>
                  <th className="px-4 py-3">Regional / UF</th>
                  <th className="px-4 py-3">PGR Atual</th>
                  <th className="px-4 py-3">Data Vencimento</th>
                  <th className="px-4 py-3">Dias Restantes</th>
                  <th className="px-4 py-3">Situação</th>
                  <th className="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {alertasCriticos.map((u) => {
                  const dias = getDiasRestantes(u.pgr.dataVencimento);
                  const isVencido = u.pgr.situacao === 'Vencido';
                  return (
                    <tr 
                      key={u.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        <div className="truncate max-w-[200px]" title={u.filial}>
                          {u.filial}
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                          {u.tipoPredio}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono tabular-nums text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {u.cnpj}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{u.regional}</span>
                        <span className="text-slate-400 dark:text-slate-500 mx-1">·</span>
                        <span>{u.uf} ({u.cidade})</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                          {u.pgr.lista} ({u.pgr.ano})
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono tabular-nums whitespace-nowrap">
                        {formatarDataBR(u.pgr.dataVencimento)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-mono tabular-nums font-semibold">
                        {dias !== null ? (
                          dias < 0 ? (
                            <span className="text-rose-600 dark:text-rose-400">
                              Vencido há {Math.abs(dias)} dias
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400">
                              Faltam {dias} dias
                            </span>
                          )
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 font-semibold ${
                          isVencido ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${isVencido ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                          <span>{u.pgr.situacao}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onSelecionarUnidade(u)}
                          className="px-2.5 py-1 text-xs font-medium text-[#61249b] dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/60 rounded-md transition-colors inline-flex items-center gap-1"
                        >
                          <span>Tratar / Renovar</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Card de DGs em Atenção */}
      {dgsAlerta.length > 0 && (
        <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Flame className="w-5 h-5 text-[#61249b] dark:text-purple-400 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-slate-900 dark:text-white">
                Atenção Especial: {dgsAlerta.length} Distribuidores Gerais (DGs) com pendências de NR-01 ou PGR
              </p>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                DGs concentram cabines primárias e risco elétrico crítico na malha de telecomunicações da Telefônica.
              </p>
            </div>
          </div>
          <button
            onClick={onNavegarParaDGs}
            className="px-3 py-1.5 text-xs font-semibold text-[#61249b] dark:text-purple-300 bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-950/60 transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            Ver Módulo de DGs
          </button>
        </div>
      )}
    </div>
  );
};
