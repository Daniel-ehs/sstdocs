import React from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  Moon, 
  Sun, 
  Calendar, 
  ShieldCheck, 
  DownloadCloud,
  RefreshCw
} from 'lucide-react';
import { DATA_REFERENCIA, formatarDataBR } from '../utils/dateCalculations';

interface HeaderProps {
  tituloAtivo: string;
  subtituloAtivo: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onExportarExcel: () => void;
  onNovaUnidade: () => void;
  totalAtivas: number;
  totalVencidas: number;
}

export const Header: React.FC<HeaderProps> = ({
  tituloAtivo,
  subtituloAtivo,
  darkMode,
  onToggleDarkMode,
  onExportarExcel,
  onNovaUnidade,
  totalAtivas,
  totalVencidas,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Zone 1: Single text element wordmark / Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#61249b] text-white flex items-center justify-center font-bold text-base shadow-sm">
          V
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
            Telefônica <span className="text-[#61249b] dark:text-purple-400">|</span> Vivo SST
          </span>
          <span className="hidden lg:inline text-xs text-slate-500 dark:text-slate-400">
            · CONTROLE PGR_2026_V4
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Breadcrumb */}
      <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        <span>Gestão Regulamentar</span>
        <span aria-hidden="true">/</span>
        <span className="text-slate-800 dark:text-slate-200 font-semibold">{tituloAtivo}</span>
        {subtituloAtivo && (
          <>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500 dark:text-slate-400">{subtituloAtivo}</span>
          </>
        )}
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2.5">
        {/* Data de Referência do Sistema */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-md text-xs text-slate-600 dark:text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-[#61249b] dark:text-purple-400" />
          <span className="font-mono tabular-nums">Ref: {formatarDataBR(DATA_REFERENCIA)}</span>
        </div>

        {/* Botão Exportar Excel Geral */}
        <button
          onClick={onExportarExcel}
          title="Exportar todas as abas para CONTROLE_PGR_2026_V4.xlsx"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline">Exportar Excel</span>
        </button>

        {/* Botão Nova Unidade */}
        <button
          onClick={onNovaUnidade}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#61249b] hover:bg-[#4d1c7c] rounded-lg shadow-sm transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Unidade</span>
        </button>

        {/* Toggle Dark Mode */}
        <button
          onClick={onToggleDarkMode}
          title={darkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Alternar tema"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
