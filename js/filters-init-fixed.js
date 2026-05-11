/**
 * ============================================
 * INICIALIZAÇÃO DE FILTROS (CORRIGIDO)
 * ============================================
 * Inicializa e configura o painel de filtros
 * VERSÃO CORRIGIDA: Painel funciona corretamente
 */

/**
 * Inicializa o painel de filtros
 */
function initializeFilters() {
    try {
        log('Inicializando filtros...', 'log');

        // Criar checkboxes de regiões
        const regioesContainer = document.getElementById('filterRegioesContainer');
        if (regioesContainer) {
            const regioes = getUniqueRegions();
            let html = '<strong>Região:</strong><br>';
            regioes.forEach(regiao => {
                html += `
                    <label class="filter-checkbox">
                        <input type="checkbox" data-filter-regiao="${regiao}">
                        <span>${regiao}</span>
                    </label>
                `;
            });
            regioesContainer.innerHTML = html;
            // Attach listeners (avoid inline onchange to prevent conflicts)
            regioesContainer.querySelectorAll('input[data-filter-regiao]').forEach(inp => {
                inp.addEventListener('change', function() {
                    const r = this.dataset.filterRegiao;
                    setRegiaoFilter(r, this.checked);
                    applyFilters();
                });
            });
            log(`${regioes.length} regiões carregadas`, 'log');
        }

        // Criar checkboxes de UFs
        const ufsContainer = document.getElementById('filterUFsContainer');
        if (ufsContainer) {
            const ufs = getUniqueUFs();
            let html = '<strong>Estado:</strong><br>';
            ufs.forEach(uf => {
                html += `
                    <label class="filter-checkbox">
                        <input type="checkbox" data-filter-uf="${uf}">
                        <span>${uf}</span>
                    </label>
                `;
            });
            ufsContainer.innerHTML = html;
            ufsContainer.querySelectorAll('input[data-filter-uf]').forEach(inp => {
                inp.addEventListener('change', function() {
                    const u = this.dataset.filterUf;
                    setUFFilter(u, this.checked);
                    applyFilters();
                });
            });
            log(`${ufs.length} estados carregados`, 'log');
        }

        // Criar checkboxes de redes
        const redesContainer = document.getElementById('filterRedesContainer');
        if (redesContainer) {
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
                inp.addEventListener('change', function() {
                    const r = this.dataset.filterRede;
                    setRedeFilter(r, this.checked);
                    applyFilters();
                });
            });
            log(`${redes.length} redes carregadas`, 'log');
        }

        // Adicionar event listeners aos inputs de texto
        setupTextFilterListeners();

        // Adicionar event listeners dos botões
        setupButtonListeners();

        log('Filtros inicializados com sucesso', 'log');
    } catch (error) {
        log('Erro ao inicializar filtros: ' + error.message, 'error');
    }
}

/**
 * Configura event listeners para inputs de texto
 */
function setupTextFilterListeners() {
    const filterNome = document.getElementById('filterNome');
    if (filterNome) {
        filterNome.addEventListener('input', function() {
            setNomeFantasiaFilter(this.value);
        });
    }

    const filterCodigo = document.getElementById('filterCodigo');
    if (filterCodigo) {
        filterCodigo.addEventListener('input', function() {
            setCodigoFilter(this.value);
        });
    }

    const filterCNPJ = document.getElementById('filterCNPJ');
    if (filterCNPJ) {
        filterCNPJ.addEventListener('input', function() {
            setCNPJFilter(this.value);
        });
    }

    const filterEndereco = document.getElementById('filterEndereco');
    if (filterEndereco) {
        filterEndereco.addEventListener('input', function() {
            setEnderecoFilter(this.value);
        });
    }

    const filterSupervisor = document.getElementById('filterSupervisor');
    if (filterSupervisor) {
        filterSupervisor.addEventListener('input', function() {
            setSupervisorFilter(this.value);
        });
    }

    // Field: quick combined filter (press Enter or click Apply)
    const filterQuick = document.getElementById('filterQuick');
    if (filterQuick) {
        filterQuick.addEventListener('keydown', function(e) {
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
    // Botão de limpar filtros
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            clearAllFilters();
            updateFilterUI();
        });
    }

    // Botão de exportar CSV
    const exportFilteredBtn = document.getElementById('exportFiltersBtn');
    if (exportFilteredBtn) {
        exportFilteredBtn.addEventListener('click', exportFilteredToCSV);
    }

    // Botão de aplicar filtros
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            applyFilters();
        });
    }

    // Quick apply button
    const applyQuickBtn = document.getElementById('applyQuickFilterBtn');
    if (applyQuickBtn) {
        applyQuickBtn.addEventListener('click', function() {
            const v = document.getElementById('filterQuick') ? document.getElementById('filterQuick').value : '';
            applyQuickFilter(v);
        });
    }

    // Botão de mostrar/ocultar filtros
    const toggleFiltersBtn = document.getElementById('toggleFiltersBtn');
    if (toggleFiltersBtn) {
        toggleFiltersBtn.addEventListener('click', toggleFiltersPanel);
    }

    // Botão de fechar filtros
    const closeFiltersBtn = document.getElementById('closeFiltersBtn');
    if (closeFiltersBtn) {
        closeFiltersBtn.addEventListener('click', closeFiltersPanel);
    }

    // Botões da legenda
    const legendShowAll = document.getElementById('legendShowAll');
    if (legendShowAll) {
        legendShowAll.addEventListener('click', activateAllLegendStatus);
    }

    const legendHideAll = document.getElementById('legendHideAll');
    if (legendHideAll) {
        legendHideAll.addEventListener('click', deactivateAllLegendStatus);
    }
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
 * Verifica se painel de filtros está aberto
 * @returns {boolean}
 */
function isFiltersPanelOpen() {
    const panel = document.getElementById('filtersPanel');
    return panel ? panel.classList.contains('filters-panel-open') : false;
}

console.log('✓ filters-init-fixed.js carregado com sucesso');

/**
 * Aplica um único texto a todos os filtros de texto e executa a filtragem.
 * Usado apenas para teste rápido.
 */
function applyQuickFilter(value) {
    const v = (value || '').toString().trim();
    // Use the centralized quick-search in filter-manager-fixed.js for broader matching
    if (typeof searchAndApplyQuickFilter === 'function') {
        searchAndApplyQuickFilter(v);
    } else {
        // Fallback to original behaviour
        setNomeFantasiaFilter(v);
        setEnderecoFilter(v);
        setCNPJFilter(v);
        setCodigoFilter(v);
        setSupervisorFilter(v);
        applyFilters();
    }
}
