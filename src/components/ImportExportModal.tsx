import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  X,
  FileCheck
} from 'lucide-react';
import { UnidadeAtiva, UnidadeDesmobilizada, ControleDG, LoteMedicaoFinanceira } from '../types/sst';
import { exportarParaExcel, importarArquivoXLSX, DadosCompletosSST } from '../utils/excelHandler';

interface ImportExportModalProps {
  dados: DadosCompletosSST;
  onImportarUnidades: (unidadesNovas: UnidadeAtiva[]) => void;
  onRestaurarPadrao: () => void;
  onClose: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  dados,
  onImportarUnidades,
  onRestaurarPadrao,
  onClose,
}) => {
  const [carregando, setCarregando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [unidadesPrevia, setUnidadesPrevia] = useState<UnidadeAtiva[] | null>(null);

  const handleArquivoSelecionado = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCarregando(true);
    setMensagemErro(null);
    setMensagemSucesso(null);

    try {
      const resultado = await importarArquivoXLSX(file);
      if (resultado.unidadesAtivas && resultado.unidadesAtivas.length > 0) {
        setUnidadesPrevia(resultado.unidadesAtivas);
        setMensagemSucesso(`${resultado.unidadesAtivas.length} unidades identificadas na planilha com sucesso!`);
      } else {
        setMensagemErro('Nenhuma linha compatível encontrada. Verifique se o arquivo possui colunas como CNPJ, Filial ou PGR.');
      }
    } catch (err: any) {
      setMensagemErro(`Erro ao processar planilha: ${err.message || 'Formato inválido'}`);
    } finally {
      setCarregando(false);
    }
  };

  const aplicarImportacao = () => {
    if (!unidadesPrevia) return;
    onImportarUnidades(unidadesPrevia);
    setMensagemSucesso('Unidades importadas e integradas à base ativa com sucesso!');
    setUnidadesPrevia(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-xl overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Sincronização & Exportação XLSX (CONTROLE PGR_2026_V4)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs">
          {/* Seção 1: Exportar */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  Exportar Pasta de Trabalho Completa (.xlsx)
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  Gera arquivo Excel original com 4 abas estruturadas: UNIDADES_ATIVAS, CONTROLE_DGs, DESMOBILIZADAS e MEDICAO_FINANCEIRA.
                </p>
              </div>
              <button
                onClick={() => exportarParaExcel(dados)}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Excel</span>
              </button>
            </div>
          </div>

          {/* Seção 2: Importar */}
          <div className="space-y-3">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                Importar ou Atualizar Planilha de Controle
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                Faça upload do arquivo .xlsx ou .xls para atualizar cadastros ou carregar novas filiais.
              </p>
            </div>

            <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#61249b] dark:hover:border-purple-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white dark:bg-slate-900">
              <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {carregando ? 'Lendo e validando colunas da planilha...' : 'Clique para selecionar arquivo .xlsx'}
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                Suporta planilhas padrão CONTROLE PGR_2026_V4.xlsx
              </span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleArquivoSelecionado}
                disabled={carregando}
                className="hidden"
              />
            </label>

            {mensagemSucesso && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{mensagemSucesso}</span>
              </div>
            )}

            {mensagemErro && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{mensagemErro}</span>
              </div>
            )}

            {unidadesPrevia && (
              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Pré-visualização Pronta
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Deseja mesclar {unidadesPrevia.length} filiais com a base de dados ativa?
                  </p>
                </div>
                <button
                  onClick={aplicarImportacao}
                  className="px-3.5 py-1.5 rounded-lg bg-[#61249b] hover:bg-[#4d1c7c] text-white font-semibold flex items-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Aplicar Sincronização</span>
                </button>
              </div>
            )}
          </div>

          {/* Seção 3: Restaurar Base Original */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Restaurar Base de Demonstração
              </p>
              <p className="text-slate-400">
                Retorna todas as filiais e lotes financeiros aos valores padrão da Telefônica Vivo.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Tem certeza de que deseja restaurar os dados iniciais do CONTROLE PGR 2026?')) {
                  onRestaurarPadrao();
                  setMensagemSucesso('Dados oficiais de demonstração restaurados com sucesso.');
                }
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrão</span>
            </button>
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
