/**
 * ============================================
 * GERENCIADOR DE FILTROS
 * ============================================
 * Mantem uma unica fonte de verdade para filtros, legenda e busca.
 */

let activeFilters = {
    status: [],
    regiao: [],
    rede: [],
    uf: [],
    supervisor: '',
    endereco: '',
    cnpj: '',
    codigo: '',
    nomeFantasia: '',
    quickQuery: ''
};

let filteredLojas = [];

function getFilteredLojas(lojas, options = {}) {
    const {
        includeStatus = true,
        includeTextFilters = true,
        includeQuickQuery = true
    } = options;

    let result = (lojas || []).slice();

    if (includeStatus && typeof getLegendState === 'function') {
        const legend = getLegendState();
        result = result.filter(loja => {
            const status = typeof normalizeStatus === 'function'
                ? normalizeStatus(loja.statusCor)
                : (loja.statusCor || '').toString().toLowerCase();
            return legend[status] !== false;
        });
    } else if (includeStatus && activeFilters.status.length) {
        result = result.filter(loja => {
            const status = typeof normalizeStatus === 'function'
                ? normalizeStatus(loja.statusCor)
                : (loja.statusCor || '').toString().toLowerCase();
            return activeFilters.status.includes(status);
        });
    }

    if (activeFilters.regiao.length) {
        result = result.filter(loja => activeFilters.regiao.includes((loja.regiao || '').toString().trim()));
    }

    if (activeFilters.rede.length) {
        result = result.filter(loja => activeFilters.rede.some(rede => (loja.rede || '').toLowerCase().includes(rede.toLowerCase())));
    }

    if (activeFilters.uf.length) {
        result = result.filter(loja => activeFilters.uf.includes((loja.uf || '').toString().toUpperCase()));
    }

    if (includeTextFilters) {
        if (activeFilters.supervisor && activeFilters.supervisor.trim()) {
            const q = activeFilters.supervisor.toLowerCase();
            result = result.filter(loja => (loja.supervisor || '').toLowerCase().includes(q));
        }

        if (activeFilters.endereco && activeFilters.endereco.trim()) {
            const q = activeFilters.endereco.toLowerCase();
            result = result.filter(loja => (`${loja.logradouro || ''} ${loja.numero || ''} ${loja.bairro || ''}`).toLowerCase().includes(q));
        }

        if (activeFilters.cnpj && activeFilters.cnpj.trim()) {
            result = result.filter(loja => (loja.cnpj || '').includes(activeFilters.cnpj));
        }

        if (activeFilters.codigo && activeFilters.codigo.trim()) {
            result = result.filter(loja => loja.id && loja.id.toString().includes(activeFilters.codigo));
        }

        if (activeFilters.nomeFantasia && activeFilters.nomeFantasia.trim()) {
            const q = activeFilters.nomeFantasia.toLowerCase();
            result = result.filter(loja => (loja.nomeFantasia || '').toLowerCase().includes(q));
        }
    }

    if (includeQuickQuery && activeFilters.quickQuery && activeFilters.quickQuery.trim()) {
        const q = activeFilters.quickQuery.toLowerCase().trim();
        result = result.filter(loja => {
            const nome = (loja.nomeFantasia || '').toString().toLowerCase();
            const id = (loja.id || '').toString().toLowerCase();
            const cnpj = (loja.cnpj || '').toString().toLowerCase();
            const endereco = (`${loja.logradouro || ''} ${loja.numero || ''} ${loja.bairro || ''}`).toString().toLowerCase();
            const supervisor = (loja.supervisor || '').toString().toLowerCase();
            const rede = (loja.rede || '').toString().toLowerCase();
            const cidade = (loja.cidade || '').toString().toLowerCase();
            const regiao = (loja.regiao || '').toString().toLowerCase();
            const uf = (loja.uf || '').toString().toLowerCase();

            return nome.includes(q) || id.includes(q) || cnpj.includes(q) || endereco.includes(q) || supervisor.includes(q) || rede.includes(q) || cidade.includes(q) || regiao.includes(q) || uf.includes(q);
        });
    }

    return result;
}

function hasActiveNonStatusFilters() {
    return Boolean(
        activeFilters.regiao.length ||
        activeFilters.rede.length ||
        activeFilters.uf.length ||
        (activeFilters.supervisor && activeFilters.supervisor.trim()) ||
        (activeFilters.endereco && activeFilters.endereco.trim()) ||
        (activeFilters.cnpj && activeFilters.cnpj.trim()) ||
        (activeFilters.codigo && activeFilters.codigo.trim()) ||
        (activeFilters.nomeFantasia && activeFilters.nomeFantasia.trim()) ||
        (activeFilters.quickQuery && activeFilters.quickQuery.trim())
    );
}

function applyFilters() {
    try {
        filteredLojas = getFilteredLojas(getLojas() || [], {
            includeStatus: true,
            includeTextFilters: true,
            includeQuickQuery: true
        });

        updateFilterUI();
        clearMarkers();
        addMarkersToMap(filteredLojas);
        if (typeof updateRegionOverlays === 'function') updateRegionOverlays();
        updateLegendCounts();

        log(`Filtros aplicados: ${filteredLojas.length} lojas encontradas`, 'log');
        showStatus(`${filteredLojas.length} lojas encontradas`, 'success', 1200);
        return filteredLojas;
    } catch (err) {
        log('Erro applyFilters: ' + err.message, 'error');
        return [];
    }
}

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
        nomeFantasia: '',
        quickQuery: ''
    };

    filteredLojas = [];

    if (typeof renderRegionFilters === 'function') {
        renderRegionFilters();
    }

    updateFilterUI();
    clearMarkers();
    addMarkersToMap(getLojas());
    if (typeof updateRegionOverlays === 'function') updateRegionOverlays();
    updateLegendCounts();

    log('Todos os filtros foram limpos', 'log');
    showStatus('Filtros limpos', 'info', 1000);
}

function setRegiaoFilter(regiao, checked) {
    if (checked) {
        if (!activeFilters.regiao.includes(regiao)) activeFilters.regiao.push(regiao);
    } else {
        activeFilters.regiao = activeFilters.regiao.filter(item => item !== regiao);
    }
}

function setUFFilter(uf, checked) {
    if (checked) {
        if (!activeFilters.uf.includes(uf)) activeFilters.uf.push(uf);
    } else {
        activeFilters.uf = activeFilters.uf.filter(item => item !== uf);
    }
}

function setRedeFilter(rede, checked) {
    if (checked) {
        if (!activeFilters.rede.includes(rede)) activeFilters.rede.push(rede);
    } else {
        activeFilters.rede = activeFilters.rede.filter(item => item !== rede);
    }
}

function setStatusFilter(status, checked) {
    const key = typeof normalizeStatus === 'function'
        ? normalizeStatus(status)
        : (status || '').toString().toLowerCase().trim();

    if (checked) {
        if (!activeFilters.status.includes(key)) activeFilters.status.push(key);
    } else {
        activeFilters.status = activeFilters.status.filter(item => item !== key);
    }
}

function setNomeFantasiaFilter(nome) { activeFilters.nomeFantasia = nome || ''; }
function setCodigoFilter(codigo) { activeFilters.codigo = codigo || ''; }
function setCNPJFilter(cnpj) { activeFilters.cnpj = cnpj || ''; }
function setEnderecoFilter(endereco) { activeFilters.endereco = endereco || ''; }
function setSupervisorFilter(supervisor) { activeFilters.supervisor = supervisor || ''; }
function setQuickQueryFilter(query) { activeFilters.quickQuery = query || ''; }

function updateFilterUI() {
    document.querySelectorAll('[data-filter-regiao]').forEach(el => {
        el.checked = activeFilters.regiao.includes(el.dataset.filterRegiao);
    });
    document.querySelectorAll('[data-filter-rede]').forEach(el => {
        el.checked = activeFilters.rede.includes(el.dataset.filterRede);
    });
    document.querySelectorAll('[data-filter-uf]').forEach(el => {
        el.checked = activeFilters.uf.includes(el.dataset.filterUf);
    });
    document.querySelectorAll('[data-filter-status]').forEach(el => {
        const ds = el.dataset.filterStatus || '';
        const key = typeof normalizeStatus === 'function' ? normalizeStatus(ds) : ds.toString().toLowerCase();
        el.checked = activeFilters.status.includes(key);
    });

    const nome = document.getElementById('filterNome'); if (nome) nome.value = activeFilters.nomeFantasia || '';
    const codigo = document.getElementById('filterCodigo'); if (codigo) codigo.value = activeFilters.codigo || '';
    const cnpj = document.getElementById('filterCNPJ'); if (cnpj) cnpj.value = activeFilters.cnpj || '';
    const endereco = document.getElementById('filterEndereco'); if (endereco) endereco.value = activeFilters.endereco || '';
    const supervisor = document.getElementById('filterSupervisor'); if (supervisor) supervisor.value = activeFilters.supervisor || '';
    const quick = document.getElementById('filterQuick'); if (quick) quick.value = activeFilters.quickQuery || '';

    const regiaoHint = document.getElementById('filterRegioesHint');
    if (regiaoHint) {
        regiaoHint.textContent = activeFilters.uf.length
            ? 'Selecione uma ou mais regiões da UF escolhida.'
            : 'Selecione uma ou mais UFs para listar as regiões.';
    }
}

function exportFilteredToCSV() {
    const lojas = filteredLojas && filteredLojas.length ? filteredLojas : getLojas() || [];
    if (!lojas.length) {
        showStatus('Nenhuma loja para exportar', 'info', 1500);
        return;
    }

    let csv = 'Código,CNPJ,Nome Fantasia,Rede,Status,Cidade,UF,Supervisor,Latitude,Longitude,Região\n';
    lojas.forEach(loja => {
        csv += `"${loja.id}","${loja.cnpj}","${(loja.nomeFantasia || '').replace(/"/g, '""')}","${loja.rede}","${loja.statusCor}","${loja.cidade}","${loja.uf}","${loja.supervisor}",${loja.latitude},${loja.longitude},"${loja.regiao}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.setAttribute('download', `lojas-filtradas-${Date.now()}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showStatus('Exportado para CSV', 'success', 1200);
}

function searchAndApplyQuickFilter(query) {
    setQuickQueryFilter((query || '').toString().trim());
    return applyFilters();
}

console.log('filter-manager-fixed.js carregado');
