import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, TelaNavegacao } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { UnidadesAtivasView } from './components/UnidadesAtivasView';
import { DGsView } from './components/DGsView';
import { DesmobilizadasView } from './components/DesmobilizadasView';
import { FinanceiroView } from './components/FinanceiroView';
import { ModalUnidade } from './components/ModalUnidade';
import { ModalNovaUnidade } from './components/ModalNovaUnidade';
import { ModalDesmobilizar } from './components/ModalDesmobilizar';
import { ImportExportModal } from './components/ImportExportModal';
import { 
  UNIDADES_ATIVAS_INICIAIS, 
  UNIDADES_DESMOBILIZADAS_INICIAIS, 
  CONTROLE_DGS_INICIAIS, 
  LOTES_MEDICAO_INICIAIS 
} from './data/initialData';
import { UnidadeAtiva, UnidadeDesmobilizada, ControleDG, LoteMedicaoFinanceira } from './types/sst';
import { exportarParaExcel, DadosCompletosSST } from './utils/excelHandler';
import { calcularSituacaoDocumento, calcularDataVencimento } from './utils/dateCalculations';

export default function App() {
  // 1. Tema Escuro (Dark Mode)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('vivo_sst_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('vivo_sst_dark_mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // 2. Estado de Navegação
  const [telaAtiva, setTelaAtiva] = useState<TelaNavegacao>('dashboard');
  const [filtroStatusAtivas, setFiltroStatusAtivas] = useState<string | undefined>(undefined);

  // 3. Dados Principais com Persistência em LocalStorage
  const [unidadesAtivas, setUnidadesAtivas] = useState<UnidadeAtiva[]>(() => {
    const saved = localStorage.getItem('vivo_sst_unidades_ativas');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return UNIDADES_ATIVAS_INICIAIS;
  });

  const [unidadesDesmobilizadas, setUnidadesDesmobilizadas] = useState<UnidadeDesmobilizada[]>(() => {
    const saved = localStorage.getItem('vivo_sst_unidades_desmobilizadas');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return UNIDADES_DESMOBILIZADAS_INICIAIS;
  });

  const [controleDGs, setControleDGs] = useState<ControleDG[]>(() => {
    const saved = localStorage.getItem('vivo_sst_controle_dgs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return CONTROLE_DGS_INICIAIS;
  });

  const [lotesMedicao, setLotesMedicao] = useState<LoteMedicaoFinanceira[]>(() => {
    const saved = localStorage.getItem('vivo_sst_lotes_medicao');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return LOTES_MEDICAO_INICIAIS;
  });

  // Salvar em LocalStorage quando houver alterações
  useEffect(() => {
    localStorage.setItem('vivo_sst_unidades_ativas', JSON.stringify(unidadesAtivas));
  }, [unidadesAtivas]);

  useEffect(() => {
    localStorage.setItem('vivo_sst_unidades_desmobilizadas', JSON.stringify(unidadesDesmobilizadas));
  }, [unidadesDesmobilizadas]);

  useEffect(() => {
    localStorage.setItem('vivo_sst_controle_dgs', JSON.stringify(controleDGs));
  }, [controleDGs]);

  useEffect(() => {
    localStorage.setItem('vivo_sst_lotes_medicao', JSON.stringify(lotesMedicao));
  }, [lotesMedicao]);

  // 4. Modais
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<UnidadeAtiva | null>(null);
  const [unidadeParaDesmobilizar, setUnidadeParaDesmobilizar] = useState<UnidadeAtiva | null>(null);
  const [modalNovaUnidadeAberta, setModalNovaUnidadeAberta] = useState(false);
  const [modalImportExportAberta, setModalImportExportAberta] = useState(false);

  // 5. Handlers de Negócio
  const handleSalvarUnidade = (unidadeAtualizada: UnidadeAtiva) => {
    setUnidadesAtivas(prev => prev.map(u => u.id === unidadeAtualizada.id ? unidadeAtualizada : u));
    setUnidadeSelecionada(null);
  };

  const handleCadastrarNovaUnidade = (nova: UnidadeAtiva) => {
    setUnidadesAtivas(prev => [nova, ...prev]);
    setModalNovaUnidadeAberta(false);
  };

  const handleConfirmarDesmobilizacao = (desmobilizada: UnidadeDesmobilizada) => {
    setUnidadesAtivas(prev => prev.filter(u => u.cnpj !== desmobilizada.cnpj));
    setUnidadesDesmobilizadas(prev => [desmobilizada, ...prev]);
    setUnidadeParaDesmobilizar(null);
    if (unidadeSelecionada?.cnpj === desmobilizada.cnpj) {
      setUnidadeSelecionada(null);
    }
  };

  const handleReativarUnidade = (desmob: UnidadeDesmobilizada) => {
    // Cria uma unidade ativa correspondente
    const hoje = new Date().toISOString().split('T')[0];
    const vencPgr = calcularDataVencimento(hoje, 2);
    const situacaoPgr = calcularSituacaoDocumento(vencPgr);

    const reativada: UnidadeAtiva = {
      id: `u-${Date.now()}`,
      cnpj: desmob.cnpj,
      filial: desmob.filial,
      tipoPredio: (desmob.tipoPredio as any) || 'Administrativo',
      regional: desmob.regional,
      uf: desmob.uf,
      cidade: desmob.cidade,
      bairro: 'Centro',
      endereco: desmob.endereco || '',
      cep: '00000-000',
      escopoIso45001: 'Não',
      nr20: 'Não',
      mesPo: '04/2026',
      numeroPo: 'PO-4500990000',
      pgr: {
        ano: 2026,
        lista: 'Lista 31',
        dataEmissao: hoje,
        dataVencimento: vencPgr,
        situacao: situacaoPgr,
        validadeAnos: 2,
      },
      ltcat: {
        ano: 2026,
        lista: 'Lista 31',
        dataEmissao: hoje,
        dataVencimento: vencPgr,
        status: 'Vigente',
      },
      aep: {
        ano: 2026,
        lista: 'Lista 31',
        dataEmissao: hoje,
        dataVencimento: vencPgr,
        status: 'Vigente',
      },
      observacoes: `Reativada da lista de desmobilizadas. Histórico anterior: ${desmob.motivo}`,
      observacoesCampo: [],
      historico: [
        {
          id: `h-${Date.now()}`,
          dataHora: hoje,
          autor: 'SESMT Vivo',
          acao: 'Reativação Operacional',
          detalhes: 'Unidade reativada do arquivo morto.',
        }
      ],
      dataCriacao: hoje,
      ultimaAtualizacao: hoje,
    };

    setUnidadesDesmobilizadas(prev => prev.filter(u => u.id !== desmob.id));
    setUnidadesAtivas(prev => [reativada, ...prev]);
  };

  const handleAtualizarDG = (dgAtualizado: ControleDG) => {
    setControleDGs(prev => prev.map(d => d.id === dgAtualizado.id ? dgAtualizado : d));
  };

  const handleAtualizarLote = (loteAtualizado: LoteMedicaoFinanceira) => {
    setLotesMedicao(prev => prev.map(l => l.id === loteAtualizado.id ? loteAtualizado : l));
  };

  const handleAdicionarLote = (novoLote: LoteMedicaoFinanceira) => {
    setLotesMedicao(prev => [novoLote, ...prev]);
  };

  const handleImportarUnidades = (novas: UnidadeAtiva[]) => {
    // Mescla ou substitui por CNPJ
    setUnidadesAtivas(prev => {
      const mapa = new Map<string, UnidadeAtiva>();
      prev.forEach(u => mapa.set(u.cnpj, u));
      novas.forEach(u => mapa.set(u.cnpj, u));
      return Array.from(mapa.values());
    });
  };

  const handleRestaurarPadrao = () => {
    setUnidadesAtivas(UNIDADES_ATIVAS_INICIAIS);
    setUnidadesDesmobilizadas(UNIDADES_DESMOBILIZADAS_INICIAIS);
    setControleDGs(CONTROLE_DGS_INICIAIS);
    setLotesMedicao(LOTES_MEDICAO_INICIAIS);
    localStorage.removeItem('vivo_sst_unidades_ativas');
    localStorage.removeItem('vivo_sst_unidades_desmobilizadas');
    localStorage.removeItem('vivo_sst_controle_dgs');
    localStorage.removeItem('vivo_sst_lotes_medicao');
  };

  // Exportar Excel Completo
  const dadosCompletos: DadosCompletosSST = {
    unidadesAtivas,
    unidadesDesmobilizadas,
    controleDGs,
    lotesMedicao,
  };

  const handleExportarExcelCompleto = () => {
    exportarParaExcel(dadosCompletos);
  };

  // Contagens para os badges
  const totalVencendo = unidadesAtivas.filter(u => u.pgr.situacao === 'Vencendo em 60 dias').length;
  const totalVencidas = unidadesAtivas.filter(u => u.pgr.situacao === 'Vencido').length;
  const totalMedicoesAbertas = lotesMedicao.filter(l => l.statusPagamento === 'Aberto' || l.statusPagamento === 'Enviado para Medição').length;

  const titulosPorTela: Record<TelaNavegacao, { titulo: string; subtitulo: string }> = {
    dashboard: { titulo: 'Dashboard Geral', subtitulo: 'Visão Executiva & Auditoria' },
    ativas: { titulo: 'Unidades Ativas', subtitulo: 'Tabela Geral de PGR, LTCAT e AEP' },
    dgs: { titulo: 'Distribuidores Gerais', subtitulo: 'Cabines & Conformidade NR-01' },
    desmobilizadas: { titulo: 'Arquivo Morto', subtitulo: 'Unidades Desmobilizadas & Dispensadas' },
    financeiro: { titulo: 'Controle Financeiro', subtitulo: 'Medição & Faturamento de Laudos' },
    import_export: { titulo: 'Sincronização XLSX', subtitulo: 'Importação e Exportação de Planilhas' },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* 1. Top Bar Corporativo */}
      <Header
        tituloAtivo={titulosPorTela[telaAtiva].titulo}
        subtituloAtivo={titulosPorTela[telaAtiva].subtitulo}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(d => !d)}
        onExportarExcel={handleExportarExcelCompleto}
        onNovaUnidade={() => setModalNovaUnidadeAberta(true)}
        totalAtivas={unidadesAtivas.length}
        totalVencidas={totalVencidas}
      />

      {/* 2. Layout Principal: Sidebar + Conteúdo */}
      <div className="flex-1 flex w-full">
        {/* Sidebar com visual corporativo e indicadores */}
        <Sidebar
          telaAtiva={telaAtiva}
          onSelecionarTela={(tela) => {
            if (tela === 'import_export') {
              setModalImportExportAberta(true);
            } else {
              setTelaAtiva(tela);
              if (tela === 'ativas') {
                setFiltroStatusAtivas(undefined);
              }
            }
          }}
          totalAtivas={unidadesAtivas.length}
          totalVencendo={totalVencendo}
          totalVencidas={totalVencidas}
          totalDGs={controleDGs.length}
          totalDesmobilizadas={unidadesDesmobilizadas.length}
          totalMedicoesAbertas={totalMedicoesAbertas}
        />

        {/* Viewport Principal */}
        <main className="flex-1 p-5 md:p-7 overflow-y-auto max-w-7xl mx-auto w-full">
          {telaAtiva === 'dashboard' && (
            <DashboardView
              unidadesAtivas={unidadesAtivas}
              controleDGs={controleDGs}
              lotesMedicao={lotesMedicao}
              onSelecionarUnidade={(u) => setUnidadeSelecionada(u)}
              onNavegarParaAtivas={(filtro) => {
                setFiltroStatusAtivas(filtro);
                setTelaAtiva('ativas');
              }}
              onNavegarParaDGs={() => setTelaAtiva('dgs')}
            />
          )}

          {telaAtiva === 'ativas' && (
            <UnidadesAtivasView
              unidades={unidadesAtivas}
              filtroStatusInicial={filtroStatusAtivas}
              onSelecionarUnidade={(u) => setUnidadeSelecionada(u)}
              onNovaUnidade={() => setModalNovaUnidadeAberta(true)}
              onDesmobilizarUnidade={(u) => setUnidadeParaDesmobilizar(u)}
            />
          )}

          {telaAtiva === 'dgs' && (
            <DGsView
              dgs={controleDGs}
              onAtualizarDG={handleAtualizarDG}
            />
          )}

          {telaAtiva === 'desmobilizadas' && (
            <DesmobilizadasView
              unidades={unidadesDesmobilizadas}
              onReativarUnidade={handleReativarUnidade}
            />
          )}

          {telaAtiva === 'financeiro' && (
            <FinanceiroView
              lotes={lotesMedicao}
              onAtualizarLote={handleAtualizarLote}
              onAdicionarLote={handleAdicionarLote}
            />
          )}
        </main>
      </div>

      {/* 3. Modais Globais */}
      {unidadeSelecionada && (
        <ModalUnidade
          unidade={unidadeSelecionada}
          onClose={() => setUnidadeSelecionada(null)}
          onSalvar={handleSalvarUnidade}
          onDesmobilizar={(u) => {
            setUnidadeSelecionada(null);
            setUnidadeParaDesmobilizar(u);
          }}
        />
      )}

      {modalNovaUnidadeAberta && (
        <ModalNovaUnidade
          onClose={() => setModalNovaUnidadeAberta(false)}
          onSalvar={handleCadastrarNovaUnidade}
        />
      )}

      {unidadeParaDesmobilizar && (
        <ModalDesmobilizar
          unidade={unidadeParaDesmobilizar}
          onClose={() => setUnidadeParaDesmobilizar(null)}
          onConfirmar={handleConfirmarDesmobilizacao}
        />
      )}

      {modalImportExportAberta && (
        <ImportExportModal
          dados={dadosCompletos}
          onImportarUnidades={handleImportarUnidades}
          onRestaurarPadrao={handleRestaurarPadrao}
          onClose={() => setModalImportExportAberta(false)}
        />
      )}
    </div>
  );
}
