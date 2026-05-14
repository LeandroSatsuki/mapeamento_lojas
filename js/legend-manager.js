/**
 * ============================================
 * GERENCIADOR DE LEGENDA INTERATIVA
 * ============================================
 * Gerencia legenda selecionÃ¡vel e filtros visuais
 */

let legendState = {
    verde: true,
    laranja: true,
    vermelho: true,
    cinza: true
};

// Controle global de status visÃ­veis da legenda para uso em plugins externos (ex: Busca)
window.activeLegendStatus = {
    'verde': true,
    'laranja': true,
    'vermelho': true,
    'cinza': true
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
        const label = item.querySelector('.legend-label');
        if (label && !label.dataset.baseLabel) {
            label.dataset.baseLabel = label.textContent.trim();
        }
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
    const status = getLegendItemStatus(element);

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
            if (getLegendItemStatus(item) === status) {
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
        const status = getLegendItemStatus(item);

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
 * ObtÃ©m estado da legenda
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
    // FunÃ§Ã£o preservada para compatibilidade com o chamador principal.
    // Os botÃµes jÃ¡ estÃ£o criados no HTML e seus controles foram movidos para o main.js.
}

/**
 * Cria tooltip para item da legenda
 * @param {string} status - Status
 * @returns {string} - Texto do tooltip
 */
function getLegendTooltip(status) {
    const tooltips = {
        'verde': 'Clique para mostrar/ocultar lojas roteirizadas e atendidas',
        'laranja': 'Clique para mostrar/ocultar lojas nÃ£o roteirizadas com venda',
        'vermelho': 'Clique para mostrar/ocultar lojas roteirizadas sem venda',
        'cinza': 'Clique para mostrar/ocultar lojas nÃ£o roteirizadas sem venda'
    };

    return tooltips[status] || '';
}

/**
 * Atualiza contadores na legenda
 */
function updateLegendCounts() {
    const stats = getLegendScopedStats();
    // O total exibido na tela deve refletir as lojas filtradas se houver filtro ativo
    const totalElement = document.getElementById('totalLojas');
    if (totalElement) {
        const currentCount = hasAnyVisibleFilterApplied()
            ? (Array.isArray(filteredLojas) ? filteredLojas.length : 0)
            : getLojas().length;
        totalElement.textContent = currentCount;
    }

    const legend = document.querySelector('.legend');
    if (!legend) return;

    const items = legend.querySelectorAll('.legend-item');
    items.forEach(item => {
        const label = item.querySelector('.legend-label');
        const status = getLegendItemStatus(item);
        const count = status ? (stats.porStatus[status] || 0) : 0;

        if (status && label) {
            const labelText = label.dataset.baseLabel || label.textContent.trim();
            label.textContent = `${labelText} (${count})`;
            label.title = getLegendTooltip(status);
        }
    });
}

function getLegendScopedStats() {
    const source = (typeof getFilteredLojas === 'function')
        ? getFilteredLojas(getLojas() || [], { includeStatus: false, includeTextFilters: true, includeQuickQuery: true })
        : (getLojas() || []);

    const stats = {
        total: source.length,
        porStatus: {
            verde: 0,
            laranja: 0,
            vermelho: 0,
            cinza: 0
        }
    };

    source.forEach(loja => {
        const key = typeof normalizeStatus === 'function'
            ? normalizeStatus(loja.statusCor)
            : (loja.statusCor || '').toString().toLowerCase();
        if (stats.porStatus[key] === undefined) stats.porStatus[key] = 0;
        stats.porStatus[key]++;
    });

    return stats;
}

function hasAnyVisibleFilterApplied() {
    const legendHasHiddenStatus = Object.values(legendState).some(value => value === false);
    const structuredFilters = typeof hasActiveNonStatusFilters === 'function' ? hasActiveNonStatusFilters() : false;
    return legendHasHiddenStatus || structuredFilters;
}

function getLegendItemStatus(element) {
    if (!element) return '';

    const dataStatus = (element.dataset.status || '').toString().trim().toLowerCase();
    if (dataStatus) return dataStatus;

    const label = element.querySelector('.legend-label');
    const text = label ? (label.dataset.baseLabel || label.textContent || '').trim() : '';

    if (text === 'Roteirizado (Atendido)') return 'verde';
    if (text === 'Não Roteirizado (Com Venda)' || text === 'NÃ£o Roteirizado (Com Venda)') return 'laranja';
    if (text === 'Roteirizado (Sem Venda)') return 'vermelho';
    if (text === 'Não Roteirizado (Sem Venda)' || text === 'NÃ£o Roteirizado (Sem Venda)') return 'cinza';

    return '';
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
        // Opcional: ajustar mapa se necessÃ¡rio pelo redimensionamento
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

console.log('âœ“ legend-manager.js carregado com sucesso');


