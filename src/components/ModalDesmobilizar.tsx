import React, { useState } from 'react';
import { Archive, X, AlertTriangle } from 'lucide-react';
import { UnidadeAtiva, UnidadeDesmobilizada } from '../types/sst';

interface ModalDesmobilizarProps {
  unidade: UnidadeAtiva;
  onClose: () => void;
  onConfirmar: (desmobilizada: UnidadeDesmobilizada) => void;
}

export const ModalDesmobilizar: React.FC<ModalDesmobilizarProps> = ({
  unidade,
  onClose,
  onConfirmar,
}) => {
  const [motivo, setMotivo] = useState(
    'Informado por e-mail pelo TST: Prédio devolvido ao proprietário, dispensada emissão de laudo regulamentar.'
  );
  const [responsavelTst, setResponsavelTst] = useState('TST Regional');
  const [dataDesmobilizacao, setDataDesmobilizacao] = useState(new Date().toISOString().split('T')[0]);
  const [documentosDispensados, setDocumentosDispensados] = useState(true);
  const [observacoes, setObservacoes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo.trim()) return;

    const desmobilizada: UnidadeDesmobilizada = {
      id: `ud-${Date.now()}`,
      cnpj: unidade.cnpj,
      filial: unidade.filial,
      tipoPredio: unidade.tipoPredio,
      regional: unidade.regional,
      uf: unidade.uf,
      cidade: unidade.cidade,
      endereco: unidade.endereco,
      dataDesmobilizacao,
      motivo: motivo.trim(),
      responsavelTst: responsavelTst.trim(),
      documentosDispensados,
      observacoes: observacoes.trim(),
    };

    onConfirmar(desmobilizada);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <Archive className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Desmobilizar Unidade (Arquivo Morto)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-lg flex items-start gap-2.5 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">Atenção ao Desmobilizar</p>
              <p className="text-[11px] leading-relaxed">
                A unidade <strong>{unidade.filial}</strong> sairá do painel de monitoramento ativo de PGR/LTCAT/AEP e será arquivada no histórico corporativo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Data de Desmobilização
              </label>
              <input
                type="date"
                required
                value={dataDesmobilizacao}
                onChange={(e) => setDataDesmobilizacao(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Responsável Técnico (TST / Eng)
              </label>
              <input
                type="text"
                required
                value={responsavelTst}
                onChange={(e) => setResponsavelTst(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              Motivo do Encerramento / Justificativa Técnica *
            </label>
            <textarea
              rows={3}
              required
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white leading-relaxed"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={documentosDispensados}
              onChange={(e) => setDocumentosDispensados(e.target.checked)}
              className="rounded text-[#61249b] focus:ring-[#61249b]"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Dispensada emissão e renovação de laudos de SST (PGR / LTCAT)
            </span>
          </label>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              Observações Adicionais (Destinação de resíduos, descarte, etc.)
            </label>
            <input
              type="text"
              placeholder="Ex: Gerador e transformador removidos com destinação ambiental homologada."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors shadow-xs"
            >
              Confirmar Desmobilização
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
