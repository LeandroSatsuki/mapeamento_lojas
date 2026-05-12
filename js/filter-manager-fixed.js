/**
 * ============================================
 * GERENCIADOR DE FILTROS REFEITO
 * ============================================
 * Implementação simples, confiável e com APIs
 */

let activeFilters = {
    status: [], regiao: [], rede: [], uf: [], supervisor: '', endereco: '', cnpj: '', codigo: '', nomeFantasia: ''
};

let filteredLojas = [];

function getNonTextFilteredLojas(lojas) {
    let result = (lojas || []).slice();

    if (typeof getLegendState === 'function') {
        const ls = getLegendState();
        result = result.filter(l => {
            const s = typeof normalizeStatus === 'function' ? normalizeStatus(l.statusCor) : (l.statusCor || '').toString().toLowerCase();
            return ls[s] !== false;
        });
    } else if (activeFilters.status.length) {
        result = result.filter(l => activeFilters.status.includes(typeof normalizeStatus === 'function' ? normalizeStatus(l.statusCor) : (l.statusCor || '').toString().toLowerCase()));
    }

    if (activeFilters.regiao.length) result = result.filter(l => activeFilters.regiao.includes((l.regiao || '').toString().trim()));
    if (activeFilters.rede.length) result = result.filter(l => activeFilters.rede.some(r => (l.rede || '').toLowerCase().includes(r.toLowerCase())));
    if (activeFilters.uf.length) result = result.filter(l => activeFilters.uf.includes((l.uf || '').toUpperCase()));

    return result;
}

function applyFilters() {
    try {
        const lojas = getLojas() || [];
        let result = getNonTextFilteredLojas(lojas);
        // A legenda eh a fonte principal do filtro por status. Os demais
        // filtros refinam esse conjunto sem quebrar a selecao visual.

        // O status é controlado primariamente pela Legenda. Usar estado real da legenda se acessível.
        if (typeof getLegendState === 'function') {
            const ls = getLegendState();
            result = result.filter(l => {
                const s = typeof normalizeStatus === 'function' ? normalizeStatus(l.statusCor) : (l.statusCor || '').toString().toLowerCase();
                return ls[s] !== false;
            });
        } else if (activeFilters.status.length) {
            result = result.filter(l => activeFilters.status.includes(typeof normalizeStatus === 'function' ? normalizeStatus(l.statusCor) : (l.statusCor || '').toString().toLowerCase()));
        }
        if (activeFilters.regiao.length) result = result.filter(l => activeFilters.regiao.includes((l.regiao || '').toString().trim()));
        if (activeFilters.rede.length) result = result.filter(l => activeFilters.rede.some(r => (l.rede || '').toLowerCase().includes(r.toLowerCase())));
        if (activeFilters.uf.length) result = result.filter(l => activeFilters.uf.includes((l.uf || '').toUpperCase()));
        if (activeFilters.supervisor && activeFilters.supervisor.trim()) { const q = activeFilters.supervisor.toLowerCase(); result = result.filter(l => (l.supervisor || '').toLowerCase().includes(q)); }
        if (activeFilters.endereco && activeFilters.endereco.trim()) { const q = activeFilters.endereco.toLowerCase(); result = result.filter(l => (`${l.logradouro || ''} ${l.numero || ''} ${l.bairro || ''}`).toLowerCase().includes(q)); }
        if (activeFilters.cnpj && activeFilters.cnpj.trim()) result = result.filter(l => (l.cnpj || '').includes(activeFilters.cnpj));
        if (activeFilters.codigo && activeFilters.codigo.trim()) result = result.filter(l => l.id && l.id.toString().includes(activeFilters.codigo));
        if (activeFilters.nomeFantasia && activeFilters.nomeFantasia.trim()) { const q = activeFilters.nomeFantasia.toLowerCase(); result = result.filter(l => (l.nomeFantasia || '').toLowerCase().includes(q)); }

        filteredLojas = result;
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
    activeFilters = { status: [], regiao: [], rede: [], uf: [], supervisor: '', endereco: '', cnpj: '', codigo: '', nomeFantasia: '' };
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

// Setters usados pelo painel (checkboxes)
function setRegiaoFilter(regiao, checked) {
    if (checked) {
        if (!activeFilters.regiao.includes(regiao)) activeFilters.regiao.push(regiao);
    } else {
        activeFilters.regiao = activeFilters.regiao.filter(r => r !== regiao);
    }
    console.log('setRegiaoFilter:', regiao, checked, 'activeFilters.regiao=', JSON.stringify(activeFilters.regiao));
}

function setUFFilter(uf, checked) {
    if (checked) {
        if (!activeFilters.uf.includes(uf)) activeFilters.uf.push(uf);
    } else {
        activeFilters.uf = activeFilters.uf.filter(u => u !== uf);
    }
    console.log('setUFFilter:', uf, checked, 'activeFilters.uf=', JSON.stringify(activeFilters.uf));
}

function setRedeFilter(rede, checked) {
    if (checked) {
        if (!activeFilters.rede.includes(rede)) activeFilters.rede.push(rede);
    } else {
        activeFilters.rede = activeFilters.rede.filter(r => r !== rede);
    }
    console.log('setRedeFilter:', rede, checked, 'activeFilters.rede=', JSON.stringify(activeFilters.rede));
}

function setStatusFilter(status, checked) {
    const key = (typeof normalizeStatus === 'function') ? normalizeStatus(status) : (status || '').toString().toLowerCase().trim();
    if (checked) {
        if (!activeFilters.status.includes(key)) activeFilters.status.push(key);
    } else {
        activeFilters.status = activeFilters.status.filter(s => s !== key);
    }
    console.log('setStatusFilter:', status, '→', key, checked, 'activeFilters.status=', JSON.stringify(activeFilters.status));
}

// Text setters (inputs update activeFilters; apply when user clicks Apply)
function setNomeFantasiaFilter(nome) { activeFilters.nomeFantasia = nome || ''; }
function setCodigoFilter(codigo) { activeFilters.codigo = codigo || ''; }
function setCNPJFilter(cnpj) { activeFilters.cnpj = cnpj || ''; }
function setEnderecoFilter(endereco) { activeFilters.endereco = endereco || ''; }
function setSupervisorFilter(supervisor) { activeFilters.supervisor = supervisor || ''; }

function updateFilterUI() {
    document.querySelectorAll('[data-filter-regiao]').forEach(el => { el.checked = activeFilters.regiao.includes(el.dataset.filterRegiao); });
    document.querySelectorAll('[data-filter-rede]').forEach(el => { el.checked = activeFilters.rede.includes(el.dataset.filterRede); });
    document.querySelectorAll('[data-filter-uf]').forEach(el => { el.checked = activeFilters.uf.includes(el.dataset.filterUf); });
    document.querySelectorAll('[data-filter-status]').forEach(el => {
        const ds = el.dataset.filterStatus || '';
        const key = (typeof normalizeStatus === 'function') ? normalizeStatus(ds) : ds.toString().toLowerCase();
        el.checked = activeFilters.status.includes(key);
    });

    const nome = document.getElementById('filterNome'); if (nome) nome.value = activeFilters.nomeFantasia || '';
    const codigo = document.getElementById('filterCodigo'); if (codigo) codigo.value = activeFilters.codigo || '';
    const cnpj = document.getElementById('filterCNPJ'); if (cnpj) cnpj.value = activeFilters.cnpj || '';
    const endereco = document.getElementById('filterEndereco'); if (endereco) endereco.value = activeFilters.endereco || '';
    const supervisor = document.getElementById('filterSupervisor'); if (supervisor) supervisor.value = activeFilters.supervisor || '';

    const regiaoHint = document.getElementById('filterRegioesHint');
    if (regiaoHint) {
        regiaoHint.textContent = activeFilters.uf.length
            ? 'Selecione uma ou mais regiões da UF escolhida.'
            : 'Selecione uma ou mais UFs para listar as regiões.';
    }
}

function exportFilteredToCSV() {
    const lojas = filteredLojas && filteredLojas.length ? filteredLojas : getLojas() || [];
    if (!lojas.length) { showStatus('Nenhuma loja para exportar', 'info', 1500); return; }
    let csv = 'Código,CNPJ,Nome Fantasia,Rede,Status,Cidade,UF,Supervisor,Latitude,Longitude,Região\n';
    lojas.forEach(loja => { csv += `"${loja.id}","${loja.cnpj}","${(loja.nomeFantasia || '').replace(/"/g, '""')}","${loja.rede}","${loja.statusCor}","${loja.cidade}","${loja.uf}","${loja.supervisor}",${loja.latitude},${loja.longitude},"${loja.regiao}"\n`; });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.setAttribute('download', `lojas-filtradas-${Date.now()}.csv`); document.body.appendChild(a); a.click(); document.body.removeChild(a); showStatus('Exportado para CSV', 'success', 1200);
}

/**
 * Busca rápida por texto em múltiplos campos e aplica os resultados ao mapa
 * @param {string} query - Texto de busca
 */
function searchAndApplyQuickFilter(query) {
    const q = (query || '').toString().toLowerCase().trim();
    if (!q) {
        // Se a busca for vazia mas a legenda estiver filtrada, precisamos re-aplicar o estado das Legendas.
        // Simulando que vamos limpar a busca rápida, então as lojas devem refletir apenas o estado da legenda.
        // Busca vazia nao significa "mostrar tudo" cegamente; ela precisa
        // respeitar o estado atual da legenda para manter coerencia visual.
        let baseLojas = getNonTextFilteredLojas(getLojas() || []);

        if (typeof getLegendState === 'function') {
            const ls = getLegendState();
            baseLojas = baseLojas.filter(l => {
                const s = typeof normalizeStatus === 'function' ? normalizeStatus(l.statusCor) : (l.statusCor || '').toString().toLowerCase();
                return ls[s] !== false;
            });
        }

        filteredLojas = baseLojas;
        updateFilterUI();
        clearMarkers();
        addMarkersToMap(filteredLojas);
        if (typeof updateRegionOverlays === 'function') updateRegionOverlays();
        updateLegendCounts();
        showStatus(`${filteredLojas.length} lojas exibidas`, 'info', 1000);
        log('Busca rápida vazia: exibindo status base', 'log');
        return filteredLojas;
    }

    // Ao invés de usar `getLojas()`, vamos garantir que o filtro rápido trabalhe em cima
    // do filtro de legendas atualmente ativo (se houver alguma seleção de status ativa).
    // A busca rapida trabalha sobre a base ja filtrada pela legenda,
    // mantendo coerencia entre painel lateral e mapa.
    let baseLojas = getNonTextFilteredLojas(getLojas() || []);

    if (typeof getLegendState === 'function') {
        const ls = getLegendState();
        baseLojas = baseLojas.filter(l => {
            const s = typeof normalizeStatus === 'function' ? normalizeStatus(l.statusCor) : (l.statusCor || '').toString().toLowerCase();
            return ls[s] !== false;
        });
    }

    const result = baseLojas.filter(l => {
        try {
            const nome = (l.nomeFantasia || '').toString().toLowerCase();
            const id = (l.id || '').toString().toLowerCase();
            const cnpj = (l.cnpj || '').toString().toLowerCase();
            const endereco = (`${l.logradouro || ''} ${l.numero || ''} ${l.bairro || ''}`).toString().toLowerCase();
            const supervisor = (l.supervisor || '').toString().toLowerCase();
            const rede = (l.rede || '').toString().toLowerCase();
            const cidade = (l.cidade || '').toString().toLowerCase();
            const regiao = (l.regiao || '').toString().toLowerCase();
            const uf = (l.uf || '').toString().toLowerCase();

            return nome.includes(q) || id.includes(q) || cnpj.includes(q) || endereco.includes(q) || supervisor.includes(q) || rede.includes(q) || cidade.includes(q) || regiao.includes(q) || uf.includes(q);
        } catch (e) {
            return false;
        }
    });

    filteredLojas = result;
    updateFilterUI();
    clearMarkers();
    addMarkersToMap(filteredLojas);
    if (typeof updateRegionOverlays === 'function') updateRegionOverlays();
    updateLegendCounts();
    log(`Busca rápida: ${filteredLojas.length} lojas encontradas para "${query}"`, 'log');
    showStatus(`${filteredLojas.length} lojas encontradas`, 'success', 1200);
    return filteredLojas;
}

console.log('✓ filter-manager-fixed.js (refeito) carregado');
