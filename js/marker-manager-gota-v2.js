let markers = [];
let markerClusterGroup = null;

function initializeClusterGroup() {
    if (!mapInstance) return;
    if (markerClusterGroup) mapInstance.removeLayer(markerClusterGroup);

    // Estes limites ficam em config para permitir ajuste fino
    // sem alterar o fluxo de renderizacao.
    const maxRadius = (typeof mapConfig !== 'undefined' && mapConfig.cluster) ? mapConfig.cluster.maxClusterRadius : 80;
    const disableZoom = (typeof mapConfig !== 'undefined' && mapConfig.cluster) ? mapConfig.cluster.disableClusteringAtZoom : 9;

    markerClusterGroup = L.markerClusterGroup({
        chunkedLoading: true, // Otimização severa para 1000+ marcadores
        chunkInterval: 100, // Tempo de execução síncrona
        chunkDelay: 50, // Pula de execução para destravar a aba do navegador
        maxClusterRadius: maxRadius,
        disableClusteringAtZoom: disableZoom,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true
    });

    mapInstance.addLayer(markerClusterGroup);
    log('Grupo de marcadores inicializado com MarkerCluster otimizado', 'log');
}

function createMarker(loja) {
    if (!loja.latitude || !loja.longitude) return null;
    const lat = parseFloat(loja.latitude);
    const lng = parseFloat(loja.longitude);
    // Faixa geografica aproximada do Brasil para bloquear coordenadas
    // quebradas vindas de erro de planilha ou parsing.
    if (isNaN(lat) || isNaN(lng) || lat < -33.7 || lat > 5.3 || lng < -73.9 || lng > -34.7) return null;
    try {
        const color = getColorByStatus(loja.statusCor);
        const icon = createDropIcon(loja, color);
        const marker = L.marker([lat, lng], { icon: icon });
        marker.lojaData = loja;
        marker.on('click', function (e) {
            try {
                if (window.L && L.DomEvent && typeof L.DomEvent.stopPropagation === 'function') {
                    L.DomEvent.stopPropagation(e);
                }
            } catch (ex) {
                // ignore
            }
            onMarkerClick(this);
        });
        return marker;
    } catch (error) {
        return null;
    }
}

function createDropIcon(loja, color) {
    const logoPath = (typeof getLogoSrc === 'function') ? getLogoSrc(loja.rede || loja.nomeFantasia, loja.logo) : getLogoPath(loja.rede);
    // A imagem tenta usar a logo oficial; se falhar, as iniciais
    // viram fallback visual dentro do mesmo marcador.
    // Escapar rede para passar ao handler
    const redeEsc = (loja.rede || loja.nomeFantasia || '').replace(/'/g, "\\'");
    // iniciais fallback
    const initials = (loja.rede || loja.nomeFantasia || '').toString().split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '??';
    const html = `<div class="marker-drop" style="border-color:${color};"><div class="marker-drop-head" style="background-color:${color};"><img src="${encodeURI(logoPath)}" class="marker-logo" alt="${redeEsc}" data-logo="${(loja.logo || '')}" onerror="handleLogoError(this, '${redeEsc}')"><span class="marker-initials" style="display:none">${initials}</span></div></div>`;
    return L.divIcon({
        html: html,
        className: 'marker-custom-drop',
        iconSize: [50, 65],
        iconAnchor: [25, 65],
        popupAnchor: [0, -65]
    });
}

function getLogoPath(rede) {
    if (!rede) return 'images/logos/default.png';
    const redeNorm = rede.toLowerCase().replace(/\s+/g, '');
    const map = { 'atacadovem': 'atacado_vem.png', 'carrefour': 'carrefour.png', 'casagrande': 'casagrande.png', 'dma': 'dma.png', 'epa': 'epa.png', 'epaplus': 'epa.png', 'extrabom': 'extrabom.png', 'extraplus': 'extraplus.png', 'germans': 'germans.png', 'grassi': 'grassi.png', 'guanabara': 'guanabara.png', 'martins': 'martins.png', 'mineirao': 'mineirao.png', 'perim': 'perim.png', 'redemaisbrasil': 'redemaisbrasil.png', 'sams': 'sams.png', 'sendas': 'sendas.png', 'vianense': 'vianense.png', 'bh': 'bh.png' };
    return `images/logos/${map[redeNorm] || 'default.png'}`;
}

function getColorByStatus(status) {
    const s = (status || '').toLowerCase().trim();
    if (s.includes('roxa') || s.includes('terceiro')) return '#7C3AED';
    if (s.includes('verde')) return '#22c55e';
    if (s.includes('laranja')) return '#f97316';
    if (s.includes('vermelho')) return '#ef4444';
    return '#9ca3af';
}

function addMarkersToMap(lojas) {
    if (!markerClusterGroup) return;
    markerClusterGroup.clearLayers();
    markers = [];
    // Primeiro reunimos os marcadores validos e depois adicionamos
    // tudo de uma vez para reduzir custo de renderizacao no Leaflet.

    // Adicionar marcadores em "lote" (bulk add) ao invés de 1 a 1 para aumentar muito a performance
    const validMarkers = [];
    lojas.forEach(loja => {
        const marker = createMarker(loja);
        if (marker) {
            validMarkers.push(marker);
            markers.push(marker);
        }
    });

    // Adicionando tudo de uma vez
    markerClusterGroup.addLayers(validMarkers);

    log(`${markers.length} marcadores adicionados ao mapa com bulk`, 'log');
}

function clearMarkers() {
    if (markerClusterGroup) markerClusterGroup.clearLayers();
    markers = [];
}

function onMarkerClick(marker) {
    const loja = marker.lojaData;
    if (!loja) return;

    try { closeAllPopups(); } catch (e) { }

    const popup = `<div class="popup-content"><h3>${loja.nomeFantasia}</h3><p><b>CNPJ:</b> ${loja.cnpj}</p><p><b>Endereço:</b> ${loja.logradouro}, ${loja.numero}</p><p><b>Cidade/UF:</b> ${loja.cidade}/${loja.uf}</p><p><b>Status:</b> ${loja.statusCor}</p></div>`;
    try { marker.unbindPopup(); } catch (e) { }
    marker.bindPopup(popup).openPopup();
}

console.log('✓ marker-manager-gota-v2.js carregado (sem clusters)');
