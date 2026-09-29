import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  ShieldCheck, 
  MapPin, 
  Award, 
  Flame, 
  MessageSquare, 
  History, 
  Archive, 
  Save, 
  X,
  FileText,
  Clock,
  Send,
  User,
  AlertTriangle
} from 'lucide-react';
import { UnidadeAtiva, ObservacaoCampo, TipoPredio, Regional, EscopoISO } from '../types/sst';
import { 
  calcularDataVencimento, 
  calcularSituacaoDocumento, 
  formatarDataBR, 
  formatarCNPJ,
  getDiasRestantes,
  DATA_REFERENCIA
} from '../utils/dateCalculations';

interface ModalUnidadeProps {
  unidade: UnidadeAtiva;
  onClose: () => void;
  onSalvar: (unidadeAtualizada: UnidadeAtiva) => void;
  onDesmobilizar: (unidade: UnidadeAtiva) => void;
}

export const ModalUnidade: React.FC<ModalUnidadeProps> = ({
  unidade,
  onClose,
  onSalvar,
  onDesmobilizar,
}) => {
  const [abaAtiva, setAbaAtiva] = useState<'triade' | 'cadastral' | 'notas' | 'historico'>('triade');
  
  // Estado local para edição
  const [form, setForm] = useState<UnidadeAtiva>({ ...unidade });

  // Nova observação de campo
  const [novaNotaAutor, setNovaNotaAutor] = useState('');
  const [novaNotaCargo, setNovaNotaCargo] = useState('Técnico de Segurança do Trabalho');
  const [novaNotaTexto, setNovaNotaTexto] = useState('');

  // Atualização em tempo real de datas do PGR com cálculo automático de vencimento
  const handlePgrEmissaoChange = (novaDataEmissao: string) => {
    const anos = form.escopoIso45001 === 'Sim' ? 3 : form.pgr.validadeAnos || 2;
    const novoVencimento = calcularDataVencimento(novaDataEmissao, anos);
    const novaSituacao = calcularSituacaoDocumento(novoVencimento);

    setForm({
      ...form,
      pgr: {
        ...form.pgr,
        dataEmissao: novaDataEmissao,
        dataVencimento: novoVencimento,
        situacao: novaSituacao,
        validadeAnos: anos,
      }
    });
  };

  const handlePgrValidadeChange = (anos: number) => {
    const novoVencimento = calcularDataVencimento(form.pgr.dataEmissao, anos);
    const novaSituacao = calcularSituacaoDocumento(novoVencimento);

    setForm({
      ...form,
      pgr: {
        ...form.pgr,
        validadeAnos: anos,
        dataVencimento: novoVencimento,
        situacao: novaSituacao,
      }
    });
  };

  const handlePgrVencimentoManual = (novoVencimento: string) => {
    const novaSituacao = calcularSituacaoDocumento(novoVencimento);
    setForm({
      ...form,
      pgr: {
        ...form.pgr,
        dataVencimento: novoVencimento,
        situacao: novaSituacao,
      }
    });
  };

  // LTCAT
  const handleLtcatEmissaoChange = (data: string) => {
    const venc = calcularDataVencimento(data, 2);
    setForm({
      ...form,
      ltcat: {
        ...form.ltcat,
        dataEmissao: data,
        dataVencimento: venc,
      }
    });
  };

  // AEP
  const handleAepEmissaoChange = (data: string) => {
    const venc = calcularDataVencimento(data, 2);
    setForm({
      ...form,
      aep: {
        ...form.aep,
        dataEmissao: data,
        dataVencimento: venc,
      }
    });
  };

  const adicionarNotaCampo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaNotaTexto.trim()) return;

    const nova: ObservacaoCampo = {
      id: `oc-${Date.now()}`,
      dataHora: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      autor: novaNotaAutor.trim() || 'Equipe SST Vivo',
      cargo: novaNotaCargo,
      texto: novaNotaTexto.trim(),
    };

    setForm({
      ...form,
      observacoesCampo: [nova, ...(form.observacoesCampo || [])],
    });

    setNovaNotaTexto('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const agora = new Date().toISOString().split('T')[0];
    const historicoAtualizado = [
      {
        id: `h-${Date.now()}`,
        dataHora: `${agora} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
        autor: 'Usuário SESMT',
        acao: 'Edição de Dados e Tríade',
        detalhes: `PGR atualizado: ${form.pgr.situacao} (Venc: ${formatarDataBR(form.pgr.dataVencimento)})`,
      },
      ...(form.historico || [])
    ];

    onSalvar({
      ...form,
      historico: historicoAtualizado,
      ultimaAtualizacao: agora,
    });
  };

  const diasPgr = getDiasRestantes(form.pgr.dataVencimento);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* 1. Modal Top Bar */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#61249b] dark:text-purple-300 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {form.filial}
                </h2>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                  form.pgr.situacao === 'Vigente' ? 'text-emerald-600 dark:text-emerald-400' :
                  form.pgr.situacao === 'Vencendo em 60 dias' ? 'text-amber-600 dark:text-amber-400' :
                  'text-rose-600 dark:text-rose-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    form.pgr.situacao === 'Vigente' ? 'bg-emerald-500' :
                    form.pgr.situacao === 'Vencendo em 60 dias' ? 'bg-amber-500' :
                    'bg-rose-500'
                  }`}></span>
                  <span>{form.pgr.situacao}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span>{form.cnpj}</span>
                <span aria-hidden="true">·</span>
                <span>{form.regional} - {form.cidade}/{form.uf}</span>
                <span aria-hidden="true">·</span>
                <span>{form.tipoPredio}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDesmobilizar(form)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-lg transition-colors"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Desmobilizar</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Abas de Navegação */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setAbaAtiva('triade')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              abaAtiva === 'triade'
                ? 'border-[#61249b] text-[#61249b] dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Tríade Documental & Prazos</span>
          </button>

          <button
            onClick={() => setAbaAtiva('cadastral')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              abaAtiva === 'cadastral'
                ? 'border-[#61249b] text-[#61249b] dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Dados Cadastrais & NR-20 / ISO</span>
          </button>

          <button
            onClick={() => setAbaAtiva('notas')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              abaAtiva === 'notas'
                ? 'border-[#61249b] text-[#61249b] dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Notas Técnicas de Campo ({form.observacoesCampo?.length || 0})</span>
          </button>

          <button
            onClick={() => setAbaAtiva('historico')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              abaAtiva === 'historico'
                ? 'border-[#61249b] text-[#61249b] dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Histórico de Alterações</span>
          </button>
        </div>

        {/* 3. Conteúdo da Aba */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {/* ABA 1: Tríade Documental */}
          {abaAtiva === 'triade' && (
            <div className="space-y-6">
              {/* Alerta de Vencimento Dinâmico */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                form.pgr.situacao === 'Vigente'
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                  : form.pgr.situacao === 'Vencendo em 60 dias'
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300'
                  : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300'
              }`}>
                <Clock className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">
                    Situação Atual do PGR: {form.pgr.situacao}
                  </p>
                  <p className="text-xs leading-relaxed">
                    Data de Vencimento: <strong className="font-mono">{formatarDataBR(form.pgr.dataVencimento)}</strong>
                    {diasPgr !== null && (
                      <span> · {diasPgr < 0 ? `Vencido há ${Math.abs(diasPgr)} dias` : `Faltam ${diasPgr} dias para expirar`} (referência {formatarDataBR(DATA_REFERENCIA)})</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Bloco 1: PGR */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#61249b] dark:text-purple-400" />
                    PGR · Programa de Gerenciamento de Riscos (NR-01)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Cálculo automático de vencimento ativado
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Data de Revisão / Emissão
                    </label>
                    <input
                      type="date"
                      value={form.pgr.dataEmissao}
                      onChange={(e) => handlePgrEmissaoChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Prazo de Validade
                    </label>
                    <select
                      value={form.pgr.validadeAnos}
                      onChange={(e) => handlePgrValidadeChange(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    >
                      <option value={2}>2 anos (NR-01 Padrão)</option>
                      <option value={3}>3 anos (Certificação ISO 45001)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Data de Vencimento
                    </label>
                    <input
                      type="date"
                      value={form.pgr.dataVencimento}
                      onChange={(e) => handlePgrVencimentoManual(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Lista / Lote do PGR
                    </label>
                    <input
                      type="text"
                      value={form.pgr.lista}
                      onChange={(e) => setForm({ ...form, pgr: { ...form.pgr, lista: e.target.value } })}
                      placeholder="Ex: Lista 29"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Bloco 2: LTCAT */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  LTCAT · Laudo Técnico das Condições Ambientais de Trabalho
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Data de Emissão
                    </label>
                    <input
                      type="date"
                      value={form.ltcat.dataEmissao}
                      onChange={(e) => handleLtcatEmissaoChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Data de Vencimento
                    </label>
                    <input
                      type="date"
                      value={form.ltcat.dataVencimento}
                      onChange={(e) => setForm({ ...form, ltcat: { ...form.ltcat, dataVencimento: e.target.value } })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Status LTCAT
                    </label>
                    <select
                      value={form.ltcat.status}
                      onChange={(e) => setForm({ ...form, ltcat: { ...form.ltcat, status: e.target.value as any } })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    >
                      <option value="Vigente">Vigente</option>
                      <option value="Atenção">Atenção</option>
                      <option value="Na Rede">Na Rede</option>
                      <option value="Ausente">Ausente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Lista LTCAT
                    </label>
                    <input
                      type="text"
                      value={form.ltcat.lista}
                      onChange={(e) => setForm({ ...form, ltcat: { ...form.ltcat, lista: e.target.value } })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Bloco 3: AEP / AET */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#61249b] dark:text-purple-400" />
                  AEP / AET · Avaliação Ergonômica Preliminar (NR-17)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Data de Emissão
                    </label>
                    <input
                      type="date"
                      value={form.aep.dataEmissao}
                      onChange={(e) => handleAepEmissaoChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Data de Vencimento
                    </label>
                    <input
                      type="date"
                      value={form.aep.dataVencimento}
                      onChange={(e) => setForm({ ...form, aep: { ...form.aep, dataVencimento: e.target.value } })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Status AEP
                    </label>
                    <select
                      value={form.aep.status}
                      onChange={(e) => setForm({ ...form, aep: { ...form.aep, status: e.target.value as any } })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    >
                      <option value="Vigente">Vigente</option>
                      <option value="Atenção">Atenção</option>
                      <option value="Ausente">Ausente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Lista AEP
                    </label>
                    <input
                      type="text"
                      value={form.aep.lista}
                      onChange={(e) => setForm({ ...form, aep: { ...form.aep, lista: e.target.value } })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: Dados Cadastrais */}
          {abaAtiva === 'cadastral' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Nome da Filial / Identificação da Unidade
                  </label>
                  <input
                    type="text"
                    value={form.filial}
                    onChange={(e) => setForm({ ...form, filial: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    CNPJ Completo
                  </label>
                  <input
                    type="text"
                    value={form.cnpj}
                    onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Tipo de Prédio / Instalação
                  </label>
                  <select
                    value={form.tipoPredio}
                    onChange={(e) => setForm({ ...form, tipoPredio: e.target.value as TipoPredio })}
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
                    value={form.regional}
                    onChange={(e) => setForm({ ...form, regional: e.target.value as Regional })}
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
                    UF
                  </label>
                  <input
                    type="text"
                    value={form.uf}
                    onChange={(e) => setForm({ ...form, uf: e.target.value.toUpperCase() })}
                    maxLength={2}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    value={form.endereco}
                    onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={form.bairro}
                    onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Escopo ISO 45001
                  </label>
                  <select
                    value={form.escopoIso45001}
                    onChange={(e) => {
                      const novo = e.target.value as EscopoISO;
                      setForm({ ...form, escopoIso45001: novo });
                      if (novo === 'Sim') {
                        handlePgrValidadeChange(3);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Sim">Sim (Validade 3 anos)</option>
                    <option value="Não">Não</option>
                    <option value="Em Auditoria">Em Auditoria</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    NR-20 (Gerador / Combustíveis)
                  </label>
                  <select
                    value={form.nr20}
                    onChange={(e) => setForm({ ...form, nr20: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Mês do PO SAP
                  </label>
                  <input
                    type="text"
                    value={form.mesPo}
                    onChange={(e) => setForm({ ...form, mesPo: e.target.value })}
                    placeholder="Ex: 03/2026"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Número do PO SAP
                  </label>
                  <input
                    type="text"
                    value={form.numeroPo}
                    onChange={(e) => setForm({ ...form, numeroPo: e.target.value })}
                    placeholder="Ex: PO-4500892010"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Observações Gerais da Unidade
                </label>
                <textarea
                  rows={3}
                  value={form.observacoes}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* ABA 3: Notas Técnicas de Campo */}
          {abaAtiva === 'notas' && (
            <div className="space-y-4">
              {/* Formulário para adicionar nova nota */}
              <form onSubmit={adicionarNotaCampo} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-[#61249b] dark:text-purple-400" />
                  Registrar Nova Observação Técnica de Campo
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Nome do Técnico / Autor
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Carlos Mendonça"
                      value={novaNotaAutor}
                      onChange={(e) => setNovaNotaAutor(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Cargo / Função
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: TST Regional"
                      value={novaNotaCargo}
                      onChange={(e) => setNovaNotaCargo(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Relato Técnico / Evidência de Vistoria
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Descreva medições de ruído, iluminação, estanqueidade de tanques de geradores ou pendências de consultoria..."
                    value={novaNotaTexto}
                    onChange={(e) => setNovaNotaTexto(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white leading-relaxed"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-[#61249b] hover:bg-[#4d1c7c] text-white font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Adicionar Observação</span>
                  </button>
                </div>
              </form>

              {/* Lista de notas */}
              <div className="space-y-3">
                {(!form.observacoesCampo || form.observacoesCampo.length === 0) ? (
                  <p className="text-center py-6 text-slate-400">
                    Nenhuma observação técnica registrada para esta filial ainda.
                  </p>
                ) : (
                  form.observacoesCampo.map((nota) => (
                    <div 
                      key={nota.id}
                      className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                          <User className="w-3 h-3 text-[#61249b] dark:text-purple-400" />
                          {nota.autor} ({nota.cargo})
                        </span>
                        <span className="text-slate-400 font-mono tabular-nums">
                          {nota.dataHora}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {nota.texto}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ABA 4: Histórico de Alterações */}
          {abaAtiva === 'historico' && (
            <div className="space-y-3">
              {(!form.historico || form.historico.length === 0) ? (
                <p className="text-center py-6 text-slate-400">
                  Sem registros anteriores no histórico.
                </p>
              ) : (
                form.historico.map((h) => (
                  <div key={h.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{h.acao}</p>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">{h.detalhes}</p>
                      <p className="text-[11px] text-slate-400 mt-1">Por: {h.autor}</p>
                    </div>
                    <span className="font-mono tabular-nums text-[11px] text-slate-400 shrink-0">
                      {h.dataHora}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 4. Rodapé do Modal com Ações */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            Última atualização: {form.ultimaAtualizacao}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-1.5 rounded-lg bg-[#61249b] hover:bg-[#4d1c7c] text-white font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
