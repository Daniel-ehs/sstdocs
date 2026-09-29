import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Radio, 
  Archive, 
  Receipt, 
  UploadCloud, 
  AlertTriangle,
  Flame,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export type TelaNavegacao = 
  | 'dashboard'
  | 'ativas'
  | 'dgs'
  | 'desmobilizadas'
  | 'financeiro'
  | 'import_export';

interface SidebarProps {
  telaAtiva: TelaNavegacao;
  onSelecionarTela: (tela: TelaNavegacao) => void;
  totalAtivas: number;
  totalVencendo: number;
  totalVencidas: number;
  totalDGs: number;
  totalDesmobilizadas: number;
  totalMedicoesAbertas: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  telaAtiva,
  onSelecionarTela,
  totalAtivas,
  totalVencendo,
  totalVencidas,
  totalDGs,
  totalDesmobilizadas,
  totalMedicoesAbertas,
}) => {
  const itensNav = [
    {
      id: 'dashboard' as TelaNavegacao,
      label: 'Dashboard Executivo',
      icone: LayoutDashboard,
      badge: totalVencidas > 0 ? `${totalVencidas} alertas` : undefined,
      badgeCor: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40',
    },
    {
      id: 'ativas' as TelaNavegacao,
      label: 'Unidades Ativas (PGR)',
      icone: Building2,
      badge: totalAtivas.toString(),
      badgeCor: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800',
    },
    {
      id: 'dgs' as TelaNavegacao,
      label: 'Controle de DGs',
      icone: Radio,
      badge: totalDGs.toString(),
      badgeCor: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800',
    },
    {
      id: 'desmobilizadas' as TelaNavegacao,
      label: 'Unidades Desmobilizadas',
      icone: Archive,
      badge: totalDesmobilizadas.toString(),
      badgeCor: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800',
    },
    {
      id: 'financeiro' as TelaNavegacao,
      label: 'Medição Financeira',
      icone: Receipt,
      badge: totalMedicoesAbertas > 0 ? `${totalMedicoesAbertas} lotes` : undefined,
      badgeCor: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
    },
    {
      id: 'import_export' as TelaNavegacao,
      label: 'Importar / Exportar XLSX',
      icone: UploadCloud,
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between h-[calc(100vh-57px)] sticky top-[57px] transition-colors">
      <div className="p-4 space-y-6">
        {/* Painel do Usuário / Contexto Corporativo */}
        <div className="px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            AMBIENTE CORPORATIVO
          </p>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
            SESMT & Meio Ambiente
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Base sincronizada (2026)</span>
          </div>
        </div>

        {/* Links de Navegação */}
        <nav className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
            MÓDULOS REGULAMENTARES
          </p>
          <div className="pt-1.5 space-y-0.5">
            {itensNav.map((item) => {
              const Icone = item.icone;
              const ativo = telaAtiva === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelecionarTela(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                    ativo
                      ? 'bg-purple-50 dark:bg-purple-950/40 text-[#61249b] dark:text-purple-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icone
                      className={`w-4 h-4 shrink-0 ${
                        ativo ? 'text-[#61249b] dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`ml-2 px-1.5 py-0.5 text-[10px] font-mono tabular-nums rounded ${item.badgeCor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Resumo de Conformidade Rápido */}
        <div className="pt-2 px-3 space-y-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            SITUAÇÃO DO PGR 2026
          </p>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Vigentes</span>
              </span>
              <span className="font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                {totalAtivas - totalVencendo - totalVencidas}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Vencendo (≤ 60d)</span>
              </span>
              <span className="font-mono tabular-nums font-semibold text-amber-600 dark:text-amber-400">
                {totalVencendo}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Vencidos</span>
              </span>
              <span className="font-mono tabular-nums font-semibold text-rose-600 dark:text-rose-400">
                {totalVencidas}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé da Sidebar */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
        <p className="font-medium text-slate-700 dark:text-slate-300">Normas Regulamentadoras</p>
        <p className="mt-0.5">NR-01 (GRO) · NR-20 · ISO 45001</p>
      </div>
    </aside>
  );
};
