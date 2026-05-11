/**
 * ============================================
 * GERENCIADOR DE FILTROS AVANÇADOS
 * ============================================
 * Gerencia filtros de busca e visualização
 */

let activeFilters = {
    status: [],      // Verde, Laranja, Vermelho, Cinza
    regiao: [],      // Região
    rede: [],        // Nome da rede
    uf: [],          // Estado
    supervisor: '',  // Supervisor (busca por texto)
    endereco: '',    // Endereço (busca por texto)
    cnpj: '',        // CNPJ (busca por texto)
    codigo: '',      // Código (busca por texto)
    nomeFantasia: '' // Nome fantasia (busca por texto)
};

let filteredLojas = [];

/**
 * Aplica todos os filtros ativos
 * @returns {Array} - Array de lojas filtradas
 */
function applyFilters() {
    let result = getLojas();

    // Filtrar por status (múltipla seleção)
    if (activeFilters.status.length > 0) {
        result = result.filter(loja =>
            activeFilters.status.includes(loja.statusCor)
        );
    }

    // Filtrar por região (múltipla seleção)
    if (activeFilters.regiao.length > 0) {
        result = result.filter(loja =>
            activeFilters.regiao.some(r => loja.regiao.toLowerCase().includes(r.toLowerCase()))
        );
    }

    // Filtrar por rede (múltipla seleção)
    if (activeFilters.rede.length > 0) {
        result = result.filter(loja =>
            activeFilters.rede.some(r => loja.rede.toLowerCase().includes(r.toLowerCase()))
        );
    }

    // Filtrar por UF (múltipla seleção)
    if (activeFilters.uf.length > 0) {
        result = result.filter(loja =>
            activeFilters.uf.includes(loja.uf.toUpperCase())
        );
    }

    // Filtrar por supervisor (texto)
    if (activeFilters.supervisor.trim()) {
        result = result.filter(loja =>
            loja.supervisor.toLowerCase().includes(activeFilters.supervisor.toLowerCase())
        );
    }

    // Filtrar por endereço (texto)
    if (activeFilters.endereco.trim()) {
        result = result.filter(loja => {
            const endereco = `${loja.logradouro} ${loja.numero} ${loja.bairro}`.toLowerCase();
            return endereco.includes(activeFilters.endereco.toLowerCase());
        });
    }

    // Filtrar por CNPJ (texto)
    if (activeFilters.cnpj.trim()) {
        result = result.filter(loja =>
            loja.cnpj.includes(activeFilters.cnpj)
        );
    }

    // Filtrar por código (texto)
    if (activeFilters.codigo.trim()) {
        result = result.filter(loja =>
            loja.id.toString().includes(activeFilters.codigo)
        );
    }

    // Filtrar por nome fantasia (texto)
    if (activeFilters.nomeFantasia.trim()) {
        result = result.filter(loja =>
            loja.nomeFantasia.toLowerCase().includes(activeFilters.nomeFantasia.toLowerCase())
        );
    }

    filteredLojas = result;
    log(`Filtros aplicados: ${filteredLojas.length} lojas encontradas`, 'log');

    return filteredLojas;
}

/**
 * Define filtro de status
 * @param {Array} statuses - Array de status (verde, laranja, vermelho, cinza)
 */
function setStatusFilter(statuses) {
    activeFilters.status = Array.isArray(statuses) ? statuses : [];
    applyFilters();
    updateMapDisplay();
}

/**
 * Alterna filtro de status (toggle)
 * @param {string} status - Status a alternar
 */
function toggleStatusFilter(status) {
    const index = activeFilters.status.indexOf(status);
    if (index > -1) {
        activeFilters.status.splice(index, 1);
    } else {
        activeFilters.status.push(status);
    }
    applyFilters();
    updateMapDisplay();
}

/**
 * Define filtro de região
 * @param {Array} regioes - Array de regiões
 */
function setRegionFilter(regioes) {
    activeFilters.regiao = Array.isArray(regioes) ? regioes : [];
    applyFilters();
    updateMapDisplay();
}

/**
 * Alterna filtro de região
 * @param {string} regiao - Região a alternar
 */
function toggleRegionFilter(regiao) {
    const index = activeFilters.regiao.indexOf(regiao);
    if (index > -1) {
        activeFilters.regiao.splice(index, 1);
    } else {
        activeFilters.regiao.push(regiao);
    }
    applyFilters();
    updateMapDisplay();
}

/**
 * Define filtro de rede
 * @param {Array} redes - Array de redes
 */
function setNetworkFilter(redes) {
    activeFilters.rede = Array.isArray(redes) ? redes : [];
    applyFilters();
    updateMapDisplay();
}

/**
 * Alterna filtro de rede
 * @param {string} rede - Rede a alternar
 */
function toggleNetworkFilter(rede) {
    const index = activeFilters.rede.indexOf(rede);
    if (index > -1) {
        activeFilters.rede.splice(index, 1);
    } else {
        activeFilters.rede.push(rede);
    }
    applyFilters();
    updateMapDisplay();
}

/**
 * Define filtro de UF
 * @param {Array} ufs - Array de UFs
 */
function setUFFilter(ufs) {
    activeFilters.uf = Array.isArray(ufs) ? ufs : [];
    applyFilters();
    updateMapDisplay();
}

/**
 * Alterna filtro de UF
 * @param {string} uf - UF a alternar
 */
function toggleUFFilter(uf) {
    const index = activeFilters.uf.indexOf(uf.toUpperCase());
    if (index > -1) {
        activeFilters.uf.splice(index, 1);
    } else {
        activeFilters.uf.push(uf.toUpperCase());
    }
    applyFilters();
    updateMapDisplay();
}

/**
 * Define filtro de supervisor
 * @param {string} supervisor - Nome do supervisor
 */
function setSupervisorFilter(supervisor) {
    activeFilters.supervisor = supervisor;
    applyFilters();
    updateMapDisplay();
}

/**
 * Define filtro de endereço
 * @param {string} endereco - Texto de endereço
 */
function setEnderecoFilter(endereco) {
    activeFilters.endereco = endereco;
    applyFilters();
    updateMapDisplay();
}

/**
 * Define filtro de CNPJ
 * @param {string} cnpj - CNPJ
 */
function setCNPJFilter(cnpj) {
    activeFilters.cnpj = cnpj;
    applyFilters();
    updateMapDisplay();
}

/**
 * Define filtro de código
 * @param {string} codigo - Código da loja
 */
function setCodigoFilter(codigo) {
    activeFilters.codigo = codigo;
    applyFilters();
    updateMapDisplay();
}

/**
 * Define filtro de nome fantasia
 * @param {string} nome - Nome fantasia
 */
function setNomeFantasiaFilter(nome) {
    activeFilters.nomeFantasia = nome;
    applyFilters();
    updateMapDisplay();
}

/**
 * Limpa todos os filtros
 */
function clearAllFilters() {
    activeFilters = {
        status: [],
        regiao: [],
        rede: [],
        uf: [],
        supervisor: '',
        endereco: '',
        cnpj: '',
        codigo: '',
        nomeFantasia: ''
    };

    applyFilters();
    updateMapDisplay();
    updateFilterUI();

    log('Todos os filtros foram limpos', 'log');
    showStatus('Filtros removidos', 'info', 2000);
}

/**
 * Obtém lojas filtradas
 * @returns {Array} - Array de lojas filtradas
 */
function getFilteredLojas() {
    return filteredLojas;
}

/**
 * Obtém filtros ativos
 * @returns {Object} - Objeto com filtros ativos
 */
function getActiveFilters() {
    return { ...activeFilters };
}

/**
 * Verifica se há filtros ativos
 * @returns {boolean} - True se há filtros
 */
function hasActiveFilters() {
    return activeFilters.status.length > 0 ||
           activeFilters.regiao.length > 0 ||
           activeFilters.rede.length > 0 ||
           activeFilters.uf.length > 0 ||
           activeFilters.supervisor.trim() !== '' ||
           activeFilters.endereco.trim() !== '' ||
           activeFilters.cnpj.trim() !== '' ||
           activeFilters.codigo.trim() !== '' ||
           activeFilters.nomeFantasia.trim() !== '';
}

/**
 * Atualiza exibição do mapa com lojas filtradas
 */
function updateMapDisplay() {
    clearMarkers();
    addMarkersToMap(getFilteredLojas());

    // Atualizar estatísticas
    updateFilterStats();
}

/**
 * Atualiza estatísticas dos filtros
 */
function updateFilterStats() {
    const stats = {
        total: getLojas().length,
        filtrados: getFilteredLojas().length,
        porStatus: {}
    };

    // Contar por status
    getFilteredLojas().forEach(loja => {
        if (!stats.porStatus[loja.statusCor]) {
            stats.porStatus[loja.statusCor] = 0;
        }
        stats.porStatus[loja.statusCor]++;
    });

    // Atualizar UI
    const statsElement = document.getElementById('filterStats');
    if (statsElement) {
        let html = `<p><strong>Mostrando:</strong> ${stats.filtrados} de ${stats.total} lojas</p>`;

        if (Object.keys(stats.porStatus).length > 0) {
            html += '<p><strong>Por Status:</strong><br>';
            for (const [status, count] of Object.entries(stats.porStatus)) {
                html += `• ${getStatusLabel(status)}: ${count}<br>`;
            }
            html += '</p>';
        }

        statsElement.innerHTML = html;
    }

    log(`Mapa atualizado: ${stats.filtrados} lojas visíveis`, 'log');
}

/**
 * Atualiza UI dos filtros (checkboxes, etc)
 */
function updateFilterUI() {
    // Atualizar checkboxes de status
    document.querySelectorAll('[data-filter-status]').forEach(el => {
        const status = el.dataset.filterStatus;
        el.checked = activeFilters.status.includes(status);
    });

    // Atualizar checkboxes de região
    document.querySelectorAll('[data-filter-regiao]').forEach(el => {
        const regiao = el.dataset.filterRegiao;
        el.checked = activeFilters.regiao.includes(regiao);
    });

    // Atualizar checkboxes de rede
    document.querySelectorAll('[data-filter-rede]').forEach(el => {
        const rede = el.dataset.filterRede;
        el.checked = activeFilters.rede.includes(rede);
    });

    // Atualizar checkboxes de UF
    document.querySelectorAll('[data-filter-uf]').forEach(el => {
        const uf = el.dataset.filterUf;
        el.checked = activeFilters.uf.includes(uf.toUpperCase());
    });

    // Atualizar inputs de texto
    const supervisorInput = document.getElementById('filterSupervisor');
    if (supervisorInput) supervisorInput.value = activeFilters.supervisor;

    const enderecoInput = document.getElementById('filterEndereco');
    if (enderecoInput) enderecoInput.value = activeFilters.endereco;

    const cnpjInput = document.getElementById('filterCNPJ');
    if (cnpjInput) cnpjInput.value = activeFilters.cnpj;

    const codigoInput = document.getElementById('filterCodigo');
    if (codigoInput) codigoInput.value = activeFilters.codigo;

    const nomeInput = document.getElementById('filterNome');
    if (nomeInput) nomeInput.value = activeFilters.nomeFantasia;
}

/**
 * Obtém lista de regiões únicas
 * @returns {Array} - Array de regiões
 */
function getUniqueRegions() {
    const regions = new Set();
    getLojas().forEach(loja => {
        if (loja.regiao) regions.add(loja.regiao);
    });
    return Array.from(regions).sort();
}

/**
 * Obtém lista de redes únicas
 * @returns {Array} - Array de redes
 */
function getUniqueNetworks() {
    const networks = new Set();
    getLojas().forEach(loja => {
        if (loja.rede) networks.add(loja.rede);
    });
    return Array.from(networks).sort();
}

/**
 * Obtém lista de UFs únicas
 * @returns {Array} - Array de UFs
 */
function getUniqueUFs() {
    const ufs = new Set();
    getLojas().forEach(loja => {
        if (loja.uf) ufs.add(loja.uf.toUpperCase());
    });
    return Array.from(ufs).sort();
}

/**
 * Obtém lista de supervisores únicos
 * @returns {Array} - Array de supervisores
 */
function getUniqueSupervisors() {
    const supervisors = new Set();
    getLojas().forEach(loja => {
        if (loja.supervisor && loja.supervisor.trim()) {
            supervisors.add(loja.supervisor);
        }
    });
    return Array.from(supervisors).sort();
}

/**
 * Exporta lojas filtradas para CSV
 */
function exportFilteredToCSV() {
    const lojas = getFilteredLojas();

    if (lojas.length === 0) {
        showAlert('Nenhuma loja para exportar com os filtros aplicados');
        return;
    }

    let csv = 'Código,CNPJ,Nome Fantasia,Rede,Status,Cidade,UF,Supervisor,Latitude,Longitude,Região\n';

    lojas.forEach(loja => {
        csv += `"${loja.id}","${loja.cnpj}","${loja.nomeFantasia}","${loja.rede}","${loja.statusCor}","${loja.cidade}","${loja.uf}","${loja.supervisor}",${loja.latitude},${loja.longitude},"${loja.regiao}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `lojas-filtradas-${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    log('Lojas filtradas exportadas para CSV', 'log');
    showStatus('Dados exportados com sucesso!', 'success', 2000);
}

console.log('✓ filter-manager.js carregado com sucesso');
