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
        chunkedLoading: true, // OtimizaÃ§Ã£o severa para 1000+ marcadores
        chunkInterval: 100, // Tempo de execuÃ§Ã£o sÃ­ncrona
        chunkDelay: 50, // Pula de execuÃ§Ã£o para destravar a aba do navegador
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
        const normalizedStatus = (typeof normalizeStatus === 'function')
            ? normalizeStatus(loja.statusCor)
            : loja.statusCor;
        const color = getColorByStatus(normalizedStatus);
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
    const originalLogoPath = (typeof getLogoSrc === 'function') ? getLogoSrc(loja.rede || loja.nomeFantasia, loja.logo) : getLogoPath(loja.rede);
    const logoPath = (typeof getOptimizedLogoSrc === 'function') ? getOptimizedLogoSrc(originalLogoPath) : originalLogoPath;
    // A imagem tenta usar a logo oficial; se falhar, as iniciais
    // viram fallback visual dentro do mesmo marcador.
    // Escapar rede para passar ao handler
    const redeEsc = (loja.rede || loja.nomeFantasia || '').replace(/'/g, "\\'");
    // iniciais fallback
    const initials = (loja.rede || loja.nomeFantasia || '').toString().split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '??';
    const html = `<div class="marker-drop" style="border-color:${color};"><div class="marker-drop-head" style="background-color:${color};"><img src="${encodeURI(logoPath)}" class="marker-logo" alt="${redeEsc}" data-logo="${(loja.logo || '')}" data-original-src="${encodeURI(originalLogoPath)}" loading="lazy" decoding="async" fetchpriority="low" onerror="handleLogoError(this, '${redeEsc}')"><span class="marker-initials" style="display:none">${initials}</span></div></div>`;
    return L.divIcon({
        html: html,
        className: 'marker-custom-drop',
        iconSize: [60, 78],
        iconAnchor: [30, 78],
        popupAnchor: [0, -78]
    });
}

function getLogoPath(rede) {
    if (!rede) return 'images/logos/default.png';
    const redeNorm = rede.toLowerCase().replace(/\s+/g, '');
    const map = { 'atacadovem': 'atacadovem.png', 'carrefour': 'carrefour.png', 'casagrande': 'casagrande.png', 'dma': 'dma.png', 'epa': 'epa.png', 'epaplus': 'epa.png', 'extrabom': 'extrabom.png', 'extraplus': 'extraplus.png', 'germans': 'germans.png', 'grassi': 'grassi.png', 'guanabara': 'guanabara.png', 'martins': 'martins.png', 'mineirao': 'mineirao.png', 'perim': 'perim.png', 'redemaisbrasil': 'redemaisbrasil.png', 'sams': 'sams.png', 'sendas': 'sendas.png', 'vianense': 'vianense.png', 'bh': 'bh.png' };
    return `images/logos/${map[redeNorm] || 'default.png'}`;
}

function getColorByStatus(status) {
    const normalizedStatus = (typeof normalizeStatus === 'function')
        ? normalizeStatus(status)
        : (status || '').toLowerCase().trim();
    const colors = {
        verde: '#22c55e',
        laranja: '#f97316',
        vermelho: '#ef4444',
        cinza: '#4b5563'
    };

    return colors[normalizedStatus] || colors.cinza;
}

function addMarkersToMap(lojas) {
    if (!markerClusterGroup) return;
    markerClusterGroup.clearLayers();
    markers = [];
    // Primeiro reunimos os marcadores validos e depois adicionamos
    // tudo de uma vez para reduzir custo de renderizacao no Leaflet.

    // Adicionar marcadores em "lote" (bulk add) ao invÃ©s de 1 a 1 para aumentar muito a performance
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

    const mapUrl = typeof generateExternalMapUrl === 'function'
        ? generateExternalMapUrl(loja)
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${loja.latitude},${loja.longitude}`)}`;
    const popup = `<div class="popup-content"><h3>${loja.nomeFantasia}</h3><p><b>CNPJ:</b> ${loja.cnpj}</p><p><b>EndereÃ§o:</b> ${loja.logradouro}, ${loja.numero}</p><p><b>Cidade/UF:</b> ${loja.cidade}/${loja.uf}</p><p><b>Status:</b> ${getStatusLabel(normalizeStatus(loja.statusCor))}</p><a class="popup-map-link" href="${mapUrl}" target="_blank" rel="noopener noreferrer">Abrir no Google Maps</a></div>`;
    try { marker.unbindPopup(); } catch (e) { }
    marker.bindPopup(popup).openPopup();
}

console.log('âœ“ marker-manager-gota-v2.js carregado (sem clusters)');
