/**
 * ============================================
 * INICIALIZAÇÃO DE FILTROS
 * ============================================
 * Inicializa e configura o painel de filtros
 */

/**
 * Inicializa o painel de filtros
 */
function initializeFilters() {
    try {
        // Criar checkboxes de regiões
        const regioesContainer = document.getElementById('filterRegioesContainer');
        if (regioesContainer) {
            const regioes = getUniqueRegions();
            regioesContainer.innerHTML = '<strong>Região:</strong>';
            regioes.forEach(regiao => {
                const label = document.createElement('label');
                label.className = 'filter-checkbox';
                label.innerHTML = `
                    <input type="checkbox" data-filter-regiao="${regiao}" 
                           onchange="toggleRegionFilter('${regiao}')">
                    <span>${regiao}</span>
                `;
                regioesContainer.appendChild(label);
            });
        }

        // Criar checkboxes de UFs
        const ufsContainer = document.getElementById('filterUFsContainer');
        if (ufsContainer) {
            const ufs = getUniqueUFs();
            ufsContainer.innerHTML = '<strong>Estado:</strong>';
            ufs.forEach(uf => {
                const label = document.createElement('label');
                label.className = 'filter-checkbox';
                label.innerHTML = `
                    <input type="checkbox" data-filter-uf="${uf}" 
                           onchange="toggleUFFilter('${uf}')">
                    <span>${uf}</span>
                `;
                ufsContainer.appendChild(label);
            });
        }

        // Criar checkboxes de redes
        const redesContainer = document.getElementById('filterRedesContainer');
        if (redesContainer) {
            const redes = getUniqueNetworks();
            redes.forEach(rede => {
                const label = document.createElement('label');
                label.className = 'filter-checkbox';
                label.innerHTML = `
                    <input type="checkbox" data-filter-rede="${rede}" 
                           onchange="toggleNetworkFilter('${rede}')">
                    <span>${rede}</span>
                `;
                redesContainer.appendChild(label);
            });
        }

        // Adicionar event listeners aos inputs de texto
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

        log('Filtros inicializados', 'log');
    } catch (error) {
        log('Erro ao inicializar filtros: ' + error.message, 'error');
    }
}

/**
 * Alterna visibilidade do painel de filtros
 */
function toggleFiltersPanel() {
    const panel = document.getElementById('filtersPanel');
    if (panel) {
        panel.classList.toggle('filters-panel-open');
    }
}

/**
 * Fecha painel de filtros
 */
function closeFiltersPanel() {
    const panel = document.getElementById('filtersPanel');
    if (panel) {
        panel.classList.remove('filters-panel-open');
    }
}

/**
 * Abre painel de filtros
 */
function openFiltersPanel() {
    const panel = document.getElementById('filtersPanel');
    if (panel) {
        panel.classList.add('filters-panel-open');
    }
}

console.log('✓ filters-init.js carregado com sucesso');
