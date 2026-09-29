import React, { useState } from 'react';
import { Building2, X, Plus, ShieldCheck } from 'lucide-react';
import { UnidadeAtiva, TipoPredio, Regional, EscopoISO } from '../types/sst';
import { calcularDataVencimento, calcularSituacaoDocumento } from '../utils/dateCalculations';

interface ModalNovaUnidadeProps {
  onClose: () => void;
  onSalvar: (novaUnidade: UnidadeAtiva) => void;
}

export const ModalNovaUnidade: React.FC<ModalNovaUnidadeProps> = ({ onClose, onSalvar }) => {
  const [filial, setFilial] = useState('');
  const [cnpj, setCnpj] = useState('02.558.157/');
  const [tipoPredio, setTipoPredio] = useState<TipoPredio>('Administrativo');
  const [regional, setRegional] = useState<Regional>('SPO');
  const [uf, setUf] = useState('SP');
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cep, setCep] = useState('');
  const [escopoIso, setEscopoIso] = useState<EscopoISO>('Sim');
  const [nr20, setNr20] = useState<'Sim' | 'Não'>('Não');
  const [numeroPo, setNumeroPo] = useState('PO-4500950000');
  const [mesPo, setMesPo] = useState('04/2026');

  // Tríade
  const [dataEmissaoPgr, setDataEmissaoPgr] = useState('2026-04-01');
  const [listaPgr, setListaPgr] = useState('Lista 30');
  const [validadeAnos, setValidadeAnos] = useState<number>(3); // 3 para ISO 45001

  const [statusLtcat, setStatusLtcat] = useState<'Vigente' | 'Atenção' | 'Na Rede' | 'Ausente'>('Vigente');
  const [statusAep, setStatusAep] = useState<'Vigente' | 'Atenção' | 'Ausente'>('Vigente');
  const [observacoes, setObservacoes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filial.trim() || !cnpj.trim()) return;

    const vencimentoPgr = calcularDataVencimento(dataEmissaoPgr, validadeAnos);
    const situacaoPgr = calcularSituacaoDocumento(vencimentoPgr);

    const nova: UnidadeAtiva = {
      id: `u-${Date.now()}`,
      cnpj: cnpj.trim(),
      filial: filial.trim(),
      tipoPredio,
      regional,
      uf: uf.toUpperCase().trim(),
      cidade: cidade.trim() || 'São Paulo',
      bairro: bairro.trim(),
      endereco: endereco.trim(),
      cep: cep.trim(),
      escopoIso45001: escopoIso,
      nr20,
      mesPo,
      numeroPo,
      pgr: {
        ano: new Date(dataEmissaoPgr).getFullYear() || 2026,
        lista: listaPgr,
        dataEmissao: dataEmissaoPgr,
        dataVencimento: vencimentoPgr,
        situacao: situacaoPgr,
        validadeAnos,
      },
      ltcat: {
        ano: 2026,
        lista: listaPgr,
        dataEmissao: dataEmissaoPgr,
        dataVencimento: calcularDataVencimento(dataEmissaoPgr, 2),
        status: statusLtcat,
      },
      aep: {
        ano: 2026,
        lista: listaPgr,
        dataEmissao: dataEmissaoPgr,
        dataVencimento: calcularDataVencimento(dataEmissaoPgr, 2),
        status: statusAep,
      },
      observacoes: observacoes.trim(),
      observacoesCampo: [],
      historico: [
        {
          id: `h-${Date.now()}`,
          dataHora: new Date().toISOString().split('T')[0],
          autor: 'Usuário SESMT',
          acao: 'Cadastro Inicial',
          detalhes: 'Unidade cadastrada no sistema de Gestão SST Vivo.',
        }
      ],
      dataCriacao: new Date().toISOString().split('T')[0],
      ultimaAtualizacao: new Date().toISOString().split('T')[0],
    };

    onSalvar(nova);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#61249b] dark:text-purple-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Cadastrar Nova Unidade / Filial
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Nome da Filial / Código *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: SPO-120 / Loja Morumbi"
                value={filial}
                onChange={(e) => setFilial(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                CNPJ da Unidade *
              </label>
              <input
                type="text"
                required
                placeholder="02.558.157/0000-00"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Tipo de Prédio
              </label>
              <select
                value={tipoPredio}
                onChange={(e) => setTipoPredio(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="Administrativo">Administrativo</option>
                <option value="Operacional / NOC">Operacional / NOC</option>
                <option value="Distribuidor Geral (DG)">Distribuidor Geral (DG)</option>
                <option value="Estação Rádio Base (ERB)">Estação Rádio Base (ERB)</option>
                <option value="Loja Própria">Loja Própria</option>
                <option value="Centro de Distribuição">Centro de Distribuição</option>
                <option value="Data Center">Data Center</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Regional
              </label>
              <select
                value={regional}
                onChange={(e) => setRegional(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="SPO">SPO</option>
                <option value="SPI">SPI</option>
                <option value="NDT">NDT</option>
                <option value="SUL">SUL</option>
                <option value="CO">CO</option>
                <option value="RJ/ES">RJ/ES</option>
                <option value="NORTE">NORTE</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                UF / Estado
              </label>
              <input
                type="text"
                maxLength={2}
                value={uf}
                onChange={(e) => setUf(e.target.value.toUpperCase())}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white uppercase font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Cidade
              </label>
              <input
                type="text"
                placeholder="Ex: São Paulo"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Endereço
              </label>
              <input
                type="text"
                placeholder="Rua / Av., número"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Escopo ISO 45001
              </label>
              <select
                value={escopoIso}
                onChange={(e) => {
                  const val = e.target.value as EscopoISO;
                  setEscopoIso(val);
                  setValidadeAnos(val === 'Sim' ? 3 : 2);
                }}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="Sim">Sim (3 anos)</option>
                <option value="Não">Não (2 anos)</option>
                <option value="Em Auditoria">Em Auditoria</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                NR-20 Gerador
              </label>
              <select
                value={nr20}
                onChange={(e) => setNr20(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="Não">Não</option>
                <option value="Sim">Sim</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Emissão PGR
              </label>
              <input
                type="date"
                value={dataEmissaoPgr}
                onChange={(e) => setDataEmissaoPgr(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Lista PGR
              </label>
              <input
                type="text"
                value={listaPgr}
                onChange={(e) => setListaPgr(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              Observações Iniciais
            </label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Histórico técnico, características do prédio ou notas de auditoria..."
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
              className="px-4 py-1.5 rounded-lg bg-[#61249b] hover:bg-[#4d1c7c] text-white font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Salvar Unidade</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
