/**
 * ============================================
 * GERENCIADOR DE LEGENDA INTERATIVA
 * ============================================
 * Gerencia legenda selecionável e filtros visuais
 */

let legendState = {
    verde: true,
    laranja: true,
    vermelho: true,
    cinza: true,
    roxa: true
};

// Controle global de status visíveis da legenda para uso em plugins externos (ex: Busca)
window.activeLegendStatus = {
    'verde': true,
    'laranja': true,
    'vermelho': true,
    'cinza': true,
    'roxa': true
};

/**
 * Inicializa legenda interativa
 */
function initializeLegend() {
    const legend = document.querySelector('.legend');
    if (!legend) return;

    // Adicionar classe para legenda interativa
    legend.classList.add('legend-interactive');

    // Adicionar event listeners aos itens da legenda
    const legendItems = legend.querySelectorAll('.legend-item');
    legendItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function () {
            onLegendItemClick(this);
        });
    });

    log('Legenda interativa inicializada', 'log');
}

/**
 * Callback ao clicar em item da legenda
 * @param {Element} element - Elemento clicado
 */
function onLegendItemClick(element) {
    // Determinar qual status foi clicado
    const label = element.querySelector('.legend-label').textContent;
    let status = '';

    if (label.includes('Atendimento < 30 Dias')) {
        status = 'verde';
    } else if (label.includes('Atendimento 30 a 45 dias')) {
        status = 'laranja';
    } else if (label.includes('Atendimento > 45 Dias')) {
        status = 'vermelho';
    } else if (label.includes('Oportunidades')) {
        status = 'cinza';
    } else if (label.includes('Atendidas Por Terceiro') || label.toLowerCase().includes('terceiro')) {
        status = 'roxa';
    }

    if (status) {
        toggleLegendStatus(status, element);
    }
}

/**
 * Alterna visibilidade de um status
 * @param {string} status - Status (verde, laranja, vermelho, cinza)
 * @param {Element} element - Elemento da legenda (opcional)
 */
function toggleLegendStatus(status, element = null) {
    legendState[status] = !legendState[status];

    // Atualizar elemento visual
    if (!element) {
        const legend = document.querySelector('.legend');
        const items = legend.querySelectorAll('.legend-item');
        items.forEach(item => {
            const label = item.querySelector('.legend-label').textContent;
            if ((status === 'verde' && label.includes('Atendimento < 30 Dias')) ||
                (status === 'laranja' && label.includes('Atendimento 30 a 45 dias')) ||
                (status === 'vermelho' && label.includes('Atendimento > 45 Dias')) ||
                (status === 'cinza' && label.includes('Oportunidades'))) {
                element = item;
            }
        });
    }

    if (element) {
        if (legendState[status]) {
            element.classList.remove('legend-item-disabled');
        } else {
            element.classList.add('legend-item-disabled');
        }
    }

    // Atualizar filtro
    updateLegendFilter();

    log(`Status ${status} ${legendState[status] ? 'ativado' : 'desativado'}`, 'log');
}

/**
 * Atualiza filtro baseado no estado da legenda
 */
function updateLegendFilter() {
    const activeStatuses = [];

    if (legendState.verde) activeStatuses.push('verde');
    if (legendState.laranja) activeStatuses.push('laranja');
    if (legendState.vermelho) activeStatuses.push('vermelho');
    if (legendState.cinza) activeStatuses.push('cinza');
    if (legendState.roxa) activeStatuses.push('roxa');

    // Esse estado compartilhado permite que busca rapida e filtros
    // textuais enxerguem exatamente os status visiveis no painel.
    // Atualizar estado global
    window.activeLegendStatus = activeStatuses;
    activeFilters.status = activeStatuses;
    applyFilters();
    updateLegendCounts();
}

/**
 * Ativa todos os status na legenda
 */
function activateAllLegendStatus() {
    legendState.verde = true;
    legendState.laranja = true;
    legendState.vermelho = true;
    legendState.cinza = true;
    legendState.roxa = true;

    updateLegendVisuals();
    updateLegendFilter();

    log('Todos os status ativados', 'log');
}

/**
 * Desativa todos os status na legenda
 */
function deactivateAllLegendStatus() {
    legendState.verde = false;
    legendState.laranja = false;
    legendState.vermelho = false;
    legendState.cinza = false;
    legendState.roxa = false;

    updateLegendVisuals();
    updateLegendFilter();

    log('Todos os status desativados', 'log');
}

/**
 * Atualiza visuais da legenda
 */
function updateLegendVisuals() {
    const legend = document.querySelector('.legend');
    if (!legend) return;

    const items = legend.querySelectorAll('.legend-item');
    items.forEach(item => {
        const label = item.querySelector('.legend-label').textContent;
        let status = '';

        if (label.includes('Atendimento < 30 Dias')) {
            status = 'verde';
        } else if (label.includes('Atendimento 30 a 45 dias')) {
            status = 'laranja';
        } else if (label.includes('Atendimento > 45 Dias')) {
            status = 'vermelho';
        } else if (label.includes('Oportunidades')) {
            status = 'cinza';
        } else if (label.includes('Atendidas Por Terceiro') || label.toLowerCase().includes('terceiro')) {
            status = 'roxa';
        }

        if (status) {
            if (legendState[status]) {
                item.classList.remove('legend-item-disabled');
            } else {
                item.classList.add('legend-item-disabled');
            }
        }
    });
}

/**
 * Obtém estado da legenda
 * @returns {Object} - Estado de cada status
 */
function getLegendState() {
    return { ...legendState };
}

/**
 * Define estado da legenda
 * @param {Object} state - Novo estado
 */
function setLegendState(state) {
    if (state.verde !== undefined) legendState.verde = state.verde;
    if (state.laranja !== undefined) legendState.laranja = state.laranja;
    if (state.vermelho !== undefined) legendState.vermelho = state.vermelho;
    if (state.cinza !== undefined) legendState.cinza = state.cinza;

    updateLegendVisuals();
    updateLegendFilter();
}

function addLegendControls() {
    // Função preservada para compatibilidade com o chamador principal.
    // Os botões já estão criados no HTML e seus controles foram movidos para o main.js.
}

/**
 * Cria tooltip para item da legenda
 * @param {string} status - Status
 * @returns {string} - Texto do tooltip
 */
function getLegendTooltip(status) {
    const tooltips = {
        'verde': 'Clique para mostrar/ocultar lojas com Atendimento < 30 Dias',
        'laranja': 'Clique para mostrar/ocultar lojas com Atendimento 30 a 45 dias',
        'vermelho': 'Clique para mostrar/ocultar lojas com Atendimento > 45 Dias',
        'cinza': 'Clique para mostrar/ocultar oportunidades'
    };

    tooltips.roxa = 'Clique para mostrar/ocultar lojas atendidas por terceiro';

    return tooltips[status] || '';
}

/**
 * Atualiza contadores na legenda
 */
function updateLegendCounts() {
    const stats = getLojaStats();
    // O total exibido na tela deve refletir as lojas filtradas se houver filtro ativo
    const totalElement = document.getElementById('totalLojas');
    if (totalElement) {
        // O total principal acompanha a visao atual do usuario, enquanto
        // os contadores por status continuam usando a base carregada.
        const currentCount = (typeof filteredLojas !== 'undefined' && filteredLojas.length > 0 && filteredLojas.length !== getLojas().length) ? filteredLojas.length : getLojas().length;
        totalElement.textContent = currentCount;
    }

    const legend = document.querySelector('.legend');
    if (!legend) return;

    const items = legend.querySelectorAll('.legend-item');
    items.forEach(item => {
        const label = item.querySelector('.legend-label');
        let status = '';
        let count = 0;

        if (label.textContent.includes('Atendimento < 30 Dias')) {
            status = 'verde';
            count = stats.porStatus.verde;
        } else if (label.textContent.includes('Atendimento 30 a 45 dias')) {
            status = 'laranja';
            count = stats.porStatus.laranja;
        } else if (label.textContent.includes('Atendimento > 45 Dias')) {
            status = 'vermelho';
            count = stats.porStatus.vermelho;
        } else if (label.textContent.includes('Oportunidades')) {
            status = 'cinza';
            count = stats.porStatus.cinza;
        } else if (label.textContent.includes('Atendidas Por Terceiro') || label.textContent.toLowerCase().includes('terceiro')) {
            status = 'roxa';
            count = stats.porStatus.roxa || 0;
        }

        if (status) {
            // Adicionar contador ao label
            let labelText = label.textContent.split(' (')[0]; // Remove contador anterior
            label.textContent = `${labelText} (${count})`;
            label.title = getLegendTooltip(status);
        }
    });
}

/**
 * Exporta estado da legenda
 * @returns {string} - JSON do estado
 */
function exportLegendState() {
    return JSON.stringify(legendState);
}

/**
 * Importa estado da legenda
 * @param {string} json - JSON do estado
 */
function importLegendState(json) {
    try {
        const state = JSON.parse(json);
        setLegendState(state);
        log('Estado da legenda importado', 'log');
    } catch (error) {
        log('Erro ao importar estado da legenda: ' + error.message, 'warn');
    }
}

/**
 * Alterna a visibilidade do painel da legenda
 */
function toggleLegendPanel() {
    const legend = document.getElementById('legendPanel');
    if (legend) {
        legend.classList.toggle('collapsed');
        log('Painel de legenda alternado', 'log');
        // Opcional: ajustar mapa se necessário pelo redimensionamento
        if (typeof mapInstance !== 'undefined' && mapInstance) {
            setTimeout(() => {
                mapInstance.invalidateSize();
            }, 300);
        }
    }
}

/**
 * Fecha o painel da legenda
 */
function closeLegendPanel() {
    const legend = document.getElementById('legendPanel');
    if (legend && !legend.classList.contains('collapsed')) {
        legend.classList.add('collapsed');
        log('Painel de legenda fechado', 'log');
        if (typeof mapInstance !== 'undefined' && mapInstance) {
            setTimeout(() => {
                mapInstance.invalidateSize();
            }, 300);
        }
    }
}

console.log('✓ legend-manager.js carregado com sucesso');
