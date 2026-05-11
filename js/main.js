/**
 * ============================================
 * ARQUIVO PRINCIPAL - ORQUESTRAÇÃO
 * ============================================
 * Inicializa e coordena todos os módulos
 */

/**
 * Inicializa a aplicação
 */
async function initializeApp() {
    try {
        log('Iniciando aplicação...', 'log');

        // 1. Carregar configurações
        // A ordem de bootstrap importa porque mapa, filtros e marcadores
        // dependem das configuracoes e da base ja carregadas.
        await loadMapConfig();

        // 2. Inicializar mapa
        initializeMap();

        // 3. Inicializar grupo de clusters
        initializeClusterGroup();

        // 4. Carregar dados das lojas
        await loadLojas();

        // 5. Inicializar filtros
        initializeFilters();

        // 6. Inicializar legenda interativa
        initializeLegend();
        addLegendControls();
        updateLegendCounts();

        // 7. Adicionar marcadores ao mapa
        addMarkersToMap(getLojas());

        // 8. Configurar event listeners
        setupEventListeners();

        // 9. Atualizar exibição de estatísticas
        updateLastUpdateDisplay();

        log('Aplicação inicializada com sucesso!', 'log');
        showStatus('Mapa carregado com sucesso!', 'success', 2000);

    } catch (error) {
        log('Erro ao inicializar aplicação: ' + error.message, 'error');
        showStatus('Erro ao carregar o mapa. Tente recarregar a página.', 'error', 5000);
    }
}

/**
 * Configura event listeners
 */
function setupEventListeners() {
    // Botão de atualização
    const updateBtn = document.getElementById('updateBtn');
    if (updateBtn) {
        updateBtn.addEventListener('click', onUpdateButtonClick);
    }

    // O botão principal do menu superior aglutina Filtros e Legenda
    const toggleLegendBtn = document.getElementById('toggleLegendBtn');
    if (toggleLegendBtn) {
        if (typeof toggleLegendPanel === 'function') {
            toggleLegendBtn.addEventListener('click', toggleLegendPanel);
            log('Event listener: Botão de legenda (toggle)', 'log');
        }
    }

    const closeLegendBtn = document.getElementById('closeLegendBtn');
    if (closeLegendBtn) {
        if (typeof closeLegendPanel === 'function') {
            closeLegendBtn.addEventListener('click', closeLegendPanel);
            log('Event listener: Botão fechar legenda', 'log');
        }
    }

    // Campo de Busca Rápida (incorporada na legenda agora)
    const filterQuick = document.getElementById('filterQuick');
    const applyQuickFilterBtn = document.getElementById('applyQuickFilterBtn');

    if (filterQuick && typeof searchAndApplyQuickFilter === 'function') {
        // Busca ao pressionar Enter
        filterQuick.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                searchAndApplyQuickFilter(this.value);
            }
        });

        // Busca ao clicar no botão buscar
        if (applyQuickFilterBtn) {
            applyQuickFilterBtn.addEventListener('click', function () {
                searchAndApplyQuickFilter(filterQuick.value);
            });
        }
    }





    // Botão de exportar CSV
    const exportFilteredBtn = document.getElementById('exportFilteredBtn');
    if (exportFilteredBtn) {
        exportFilteredBtn.addEventListener('click', exportFilteredToCSV);
        log('Event listener: Botão exportar CSV', 'log');
    }

    // Botões da legenda
    const legendShowAll = document.getElementById('legendShowAll');
    if (legendShowAll) {
        legendShowAll.addEventListener('click', activateAllLegendStatus);
        log('Event listener: Botão mostrar todas', 'log');
    }

    const legendHideAll = document.getElementById('legendHideAll');
    if (legendHideAll) {
        legendHideAll.addEventListener('click', deactivateAllLegendStatus);
        log('Event listener: Botão ocultar todas', 'log');
    }

    // Fechar popups ao clicar no mapa
    if (mapInstance) {
        // Close popups when clicking on the map, but ignore clicks
        // that happen inside marker elements so marker clicks can
        // properly open their popups without being immediately closed.
        mapInstance.on('click', function (e) {
            try {
                const tgt = e && e.originalEvent && e.originalEvent.target;
                if (tgt && typeof tgt.closest === 'function') {
                    // If the click occurred inside a marker or cluster element,
                    // don't close popups (allows marker interior clicks to work).
                    if (tgt.closest('.marker-custom') || tgt.closest('.marker-icon') || tgt.closest('.marker-cluster') || tgt.closest('.leaflet-marker-icon')) {
                        return;
                    }
                }
            } catch (ex) {
                // fall through to close popups on unexpected errors
            }

            closeAllPopups();
        });
    }

    // Detectar mudanças de zoom para ajustar clusters
    if (mapInstance) {
        mapInstance.on('zoomend', onMapZoomEnd);
    }

    log('Event listeners configurados', 'log');
}

/**
 * Callback ao clicar no botão de atualização
 */
async function onUpdateButtonClick() {
    try {
        const btn = document.getElementById('updateBtn');
        if (btn.disabled) return;

        // Desabilitar botão e mostrar loading
        // O refresh forca nova leitura da fonte oficial e evita seguir
        // trabalhando com uma base antiga persistida em cache local.
        btn.disabled = true;
        btn.classList.add('loading');

        log('Iniciando atualização de dados...', 'log');

        // Limpar cache
        clearLojaCache();

        // Recarregar dados
        await loadLojas();

        // Atualizar marcadores
        clearMarkers();
        addMarkersToMap(getLojas());

        // Atualizar estatísticas
        updateLastUpdateDisplay();

        // Mostrar mensagem de sucesso
        const now = new Date();
        const timeStr = formatTime(now);
        showStatus(`Base atualizada em ${timeStr}`, 'success', 3000);

        log('Dados atualizados com sucesso', 'log');

    } catch (error) {
        log('Erro ao atualizar dados: ' + error.message, 'error');
        showStatus('Não foi possível atualizar. Última base mantida.', 'error', 5000);

    } finally {
        // Reabilitar botão
        const btn = document.getElementById('updateBtn');
        btn.disabled = false;
        btn.classList.remove('loading');
    }
}

/**
 * Callback ao mudar zoom do mapa
 */
function onMapZoomEnd() {
    const zoom = getMapZoom();
    const disableClusteringAtZoom = mapConfig.cluster.disableClusteringAtZoom;

    if (zoom >= disableClusteringAtZoom) {
        log(`Zoom ${zoom}: Clusterização desativada`, 'log');
    } else {
        log(`Zoom ${zoom}: Clusterização ativa`, 'log');
    }
}

/**
 * Recarrega a página
 */
function reloadPage() {
    window.location.reload();
}

/**
 * Exporta dados para CSV
 */
function exportToCSV() {
    try {
        const lojas = getLojas();
        if (lojas.length === 0) {
            showAlert('Nenhuma loja para exportar');
            return;
        }

        // A exportacao usa a colecao em memoria para refletir o mesmo
        // conjunto que esta disponivel no mapa naquele instante.
        // Criar CSV
        let csv = 'Código,CNPJ,Nome Fantasia,Rede,Status,Cidade,UF,Latitude,Longitude,Região\n';

        lojas.forEach(loja => {
            csv += `"${loja.id}","${loja.cnpj}","${loja.nomeFantasia}","${loja.rede}","${loja.statusCor}","${loja.cidade}","${loja.uf}",${loja.latitude},${loja.longitude},"${loja.regiao}"\n`;
        });

        // Download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `lojas-preferenza-${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        log('Dados exportados para CSV', 'log');
        showStatus('Dados exportados com sucesso!', 'success', 2000);

    } catch (error) {
        log('Erro ao exportar CSV: ' + error.message, 'error');
        showStatus('Erro ao exportar dados', 'error', 3000);
    }
}

/**
 * Mostra estatísticas
 */
function showStatistics() {
    const stats = getLojaStats();

    let message = `
📊 ESTATÍSTICAS DO MAPA
======================

Total de Lojas: ${stats.total}

Por Status:
- Verde (Roteirizado / Atendido): ${stats.porStatus.verde}
- Laranja (Não Roteirizado / Com Venda): ${stats.porStatus.laranja}
- Vermelho (Roteirizado / Sem Venda): ${stats.porStatus.vermelho}
- Cinza Escuro (Não Roteirizado / Sem Venda): ${stats.porStatus.cinza}

Redes Cadastradas: ${Object.keys(stats.porRede).length}
Regiões: ${Object.keys(stats.porRegiao).length}
Estados: ${Object.keys(stats.porUF).length}
    `.trim();

    console.log(message);
    showAlert(message);
}

/**
 * Obtém informações do aplicativo
 */
function getAppInfo() {
    const info = {
        title: mapConfig.app.title,
        version: mapConfig.app.version,
        description: mapConfig.app.description,
        totalLojas: getLojas().length,
        totalMarkers: getMarkerCount(),
        lastUpdate: getLastUpdateTime(),
        mapZoom: getMapZoom(),
        mapCenter: getMapCenter()
    };

    return info;
}

/**
 * Mostra informações do aplicativo
 */
function showAppInfo() {
    const info = getAppInfo();

    let message = `
ℹ️ INFORMAÇÕES DO APLICATIVO
============================

Título: ${info.title}
Versão: ${info.version}
Descrição: ${info.description}

Total de Lojas: ${info.totalLojas}
Marcadores: ${info.totalMarkers}
Última Atualização: ${info.lastUpdate ? formatDate(info.lastUpdate) : 'Nunca'}

Zoom Atual: ${info.mapZoom}
Centro: ${info.mapCenter.lat.toFixed(4)}, ${info.mapCenter.lng.toFixed(4)}
    `.trim();

    console.log(message);
    showAlert(message);
}

/**
 * Trata erros globais
 */
function setupErrorHandling() {
    window.addEventListener('error', function (event) {
        log(`Erro não tratado: ${event.message}`, 'error');
    });

    window.addEventListener('unhandledrejection', function (event) {
        log(`Promise rejeitada: ${event.reason}`, 'error');
    });
}

/**
 * Inicializa atalhos de teclado
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function (event) {
        // Ctrl+R: Recarregar dados
        if (event.ctrlKey && event.key === 'r') {
            event.preventDefault();
            onUpdateButtonClick();
        }

        // Ctrl+E: Exportar CSV
        if (event.ctrlKey && event.key === 'e') {
            event.preventDefault();
            exportToCSV();
        }

        // Ctrl+S: Mostrar estatísticas
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            showStatistics();
        }

        // Ctrl+I: Informações do app
        if (event.ctrlKey && event.key === 'i') {
            event.preventDefault();
            showAppInfo();
        }
    });

    log('Atalhos de teclado configurados', 'log');
}

/**
 * Ponto de entrada da aplicação
 */
document.addEventListener('DOMContentLoaded', function () {
    log('DOM carregado, iniciando aplicação...', 'log');

    // Configurar tratamento de erros
    setupErrorHandling();

    // Configurar atalhos de teclado
    setupKeyboardShortcuts();

    // Inicializar aplicação
    initializeApp();
});

// Logs de inicialização
console.log('✓ main.js carregado com sucesso');
console.log('Atalhos disponíveis:');
console.log('  Ctrl+R: Recarregar dados');
console.log('  Ctrl+E: Exportar CSV');
console.log('  Ctrl+S: Mostrar estatísticas');
console.log('  Ctrl+I: Informações do app');
