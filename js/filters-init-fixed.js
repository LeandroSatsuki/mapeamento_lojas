/**
 * ============================================
 * INICIALIZACAO DE FILTROS
 * ============================================
 * Inicializa o painel lateral e atualiza opcoes dependentes.
 */

/**
 * Inicializa o painel de filtros
 */
function initializeFilters() {
    try {
        log('Inicializando filtros...', 'log');

        renderUFFilters();
        renderRegionFilters();

        // Criar checkboxes de redes se o container existir
        const redesContainer = document.getElementById('filterRedesContainer');
        if (redesContainer && typeof getUniqueNetworks === 'function') {
            const redes = getUniqueNetworks();
            let html = '';
            redes.forEach(rede => {
                html += `
                    <label class="filter-checkbox">
                        <input type="checkbox" data-filter-rede="${rede}">
                        <span>${rede}</span>
                    </label>
                `;
            });
            redesContainer.innerHTML = html;
            redesContainer.querySelectorAll('input[data-filter-rede]').forEach(inp => {
                inp.addEventListener('change', function () {
                    const r = this.dataset.filterRede;
                    setRedeFilter(r, this.checked);
                    applyFilters();
                });
            });
            log(`${redes.length} redes carregadas`, 'log');
        }

        setupTextFilterListeners();
        setupButtonListeners();
        setupUFSectionToggle();

        log('Filtros inicializados com sucesso', 'log');
    } catch (error) {
        log('Erro ao inicializar filtros: ' + error.message, 'error');
    }
}

function renderUFFilters() {
    const ufsContainer = document.getElementById('filterUFsContainer');
    if (!ufsContainer) return;

    const ufs = getUniqueUFs();
    let html = '';
    ufs.forEach(uf => {
        const checked = activeFilters.uf.includes(uf) ? 'checked' : '';
        html += `
            <label class="filter-checkbox">
                <input type="checkbox" data-filter-uf="${uf}" ${checked}>
                <span>${uf}</span>
            </label>
        `;
    });

    ufsContainer.innerHTML = html;
    ufsContainer.querySelectorAll('input[data-filter-uf]').forEach(inp => {
        inp.addEventListener('change', function () {
            const uf = this.dataset.filterUf;
            setUFFilter(uf, this.checked);
            renderRegionFilters();
            applyFilters();
        });
    });

    log(`${ufs.length} estados carregados`, 'log');
}

function getUniqueUFs() {
    const lojas = getLojas() || [];
    return [...new Set(
        lojas
            .map(loja => (loja.uf || '').toString().trim().toUpperCase())
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function getRegionsByUFs(selectedUFs = []) {
    const lojas = getLojas() || [];
    const normalizedUFs = selectedUFs.map(uf => (uf || '').toString().trim().toUpperCase());

    return [...new Set(
        lojas
            .filter(loja => normalizedUFs.includes((loja.uf || '').toString().trim().toUpperCase()))
            .map(loja => (loja.regiao || '').toString().trim())
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function renderRegionFilters() {
    const regioesContainer = document.getElementById('filterRegioesContainer');
    const regiaoHint = document.getElementById('filterRegioesHint');
    if (!regioesContainer) return;

    const selectedUFs = activeFilters.uf || [];
    if (!selectedUFs.length) {
        activeFilters.regiao = [];
        regioesContainer.innerHTML = '';
        if (regiaoHint) {
            regiaoHint.textContent = 'Selecione uma ou mais UFs para listar as regiões.';
        }
        return;
    }

    const regioes = getRegionsByUFs(selectedUFs);
    activeFilters.regiao = activeFilters.regiao.filter(regiao => regioes.includes(regiao));

    let html = '';
    regioes.forEach(regiao => {
        const checked = activeFilters.regiao.includes(regiao) ? 'checked' : '';
        html += `
            <label class="filter-checkbox">
                <input type="checkbox" data-filter-regiao="${regiao}" ${checked}>
                <span>${regiao}</span>
            </label>
        `;
    });

    regioesContainer.innerHTML = html;
    regioesContainer.querySelectorAll('input[data-filter-regiao]').forEach(inp => {
        inp.addEventListener('change', function () {
            const regiao = this.dataset.filterRegiao;
            setRegiaoFilter(regiao, this.checked);
            applyFilters();
        });
    });

    if (regiaoHint) {
        regiaoHint.textContent = regioes.length
            ? 'Selecione uma ou mais regiões da UF escolhida.'
            : 'Nenhuma região encontrada para a UF selecionada.';
    }

    log(`${regioes.length} regioes disponiveis para as UFs selecionadas`, 'log');
}

/**
 * Configura event listeners para inputs de texto
 */
function setupTextFilterListeners() {
    const filterNome = document.getElementById('filterNome');
    if (filterNome) {
        filterNome.addEventListener('input', function () {
            setNomeFantasiaFilter(this.value);
        });
    }

    const filterCodigo = document.getElementById('filterCodigo');
    if (filterCodigo) {
        filterCodigo.addEventListener('input', function () {
            setCodigoFilter(this.value);
        });
    }

    const filterCNPJ = document.getElementById('filterCNPJ');
    if (filterCNPJ) {
        filterCNPJ.addEventListener('input', function () {
            setCNPJFilter(this.value);
        });
    }

    const filterEndereco = document.getElementById('filterEndereco');
    if (filterEndereco) {
        filterEndereco.addEventListener('input', function () {
            setEnderecoFilter(this.value);
        });
    }

    const filterSupervisor = document.getElementById('filterSupervisor');
    if (filterSupervisor) {
        filterSupervisor.addEventListener('input', function () {
            setSupervisorFilter(this.value);
        });
    }

    const filterQuick = document.getElementById('filterQuick');
    if (filterQuick) {
        filterQuick.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                applyQuickFilter(this.value);
            }
        });
    }
}

/**
 * Configura event listeners dos botões
 */
function setupButtonListeners() {
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function () {
            clearAllFilters();
            updateFilterUI();
        });
    }

    const exportFilteredBtn = document.getElementById('exportFiltersBtn');
    if (exportFilteredBtn) {
        exportFilteredBtn.addEventListener('click', exportFilteredToCSV);
    }

    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function () {
            applyFilters();
        });
    }

    const applyQuickBtn = document.getElementById('applyQuickFilterBtn');
    if (applyQuickBtn) {
        applyQuickBtn.addEventListener('click', function () {
            const v = document.getElementById('filterQuick') ? document.getElementById('filterQuick').value : '';
            applyQuickFilter(v);
        });
    }

    const toggleFiltersBtn = document.getElementById('toggleFiltersBtn');
    if (toggleFiltersBtn) {
        toggleFiltersBtn.addEventListener('click', toggleFiltersPanel);
    }

    const closeFiltersBtn = document.getElementById('closeFiltersBtn');
    if (closeFiltersBtn) {
        closeFiltersBtn.addEventListener('click', closeFiltersPanel);
    }

    const legendShowAll = document.getElementById('legendShowAll');
    if (legendShowAll) {
        legendShowAll.addEventListener('click', activateAllLegendStatus);
    }

    const legendHideAll = document.getElementById('legendHideAll');
    if (legendHideAll) {
        legendHideAll.addEventListener('click', deactivateAllLegendStatus);
    }
}

function setupUFSectionToggle() {
    const toggleBtn = document.getElementById('toggleUFsBtn');
    const wrapper = document.getElementById('filterUFsWrapper');
    if (!toggleBtn || !wrapper) return;

    toggleBtn.addEventListener('click', function () {
        const collapsed = wrapper.classList.toggle('is-collapsed');
        toggleBtn.textContent = collapsed ? 'Expandir' : 'Recolher';
        toggleBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    });
}

/**
 * Alterna visibilidade do painel de filtros
 */
function toggleFiltersPanel() {
    const panel = document.getElementById('filtersPanel');
    if (panel) {
        panel.classList.toggle('filters-panel-open');
        log('Painel de filtros alternado', 'log');
    }
}

/**
 * Fecha painel de filtros
 */
function closeFiltersPanel() {
    const panel = document.getElementById('filtersPanel');
    if (panel) {
        panel.classList.remove('filters-panel-open');
        log('Painel de filtros fechado', 'log');
    }
}

/**
 * Abre painel de filtros
 */
function openFiltersPanel() {
    const panel = document.getElementById('filtersPanel');
    if (panel) {
        panel.classList.add('filters-panel-open');
        log('Painel de filtros aberto', 'log');
    }
}

/**
 * Verifica se painel de filtros esta aberto
 * @returns {boolean}
 */
function isFiltersPanelOpen() {
    const panel = document.getElementById('filtersPanel');
    return panel ? panel.classList.contains('filters-panel-open') : false;
}

console.log('filters-init-fixed.js carregado com sucesso');

/**
 * Aplica um unico texto a todos os filtros de texto e executa a filtragem.
 * Usado apenas para teste rapido.
 */
function applyQuickFilter(value) {
    const v = (value || '').toString().trim();
    if (typeof searchAndApplyQuickFilter === 'function') {
        searchAndApplyQuickFilter(v);
    } else {
        setNomeFantasiaFilter(v);
        setEnderecoFilter(v);
        setCNPJFilter(v);
        setCodigoFilter(v);
        setSupervisorFilter(v);
        applyFilters();
    }
}
