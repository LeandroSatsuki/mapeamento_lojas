let markers = [];
let markerClusterGroup = null;

function initializeClusterGroup() {
    if (!mapInstance) return;
    if (markerClusterGroup) mapInstance.removeLayer(markerClusterGroup);
    markerClusterGroup = L.markerClusterGroup({
        maxClusterRadius: mapConfig.cluster.maxClusterRadius,
        disableClusteringAtZoom: mapConfig.cluster.disableClusteringAtZoom,
        iconCreateFunction: createClusterIcon
    });
    mapInstance.addLayer(markerClusterGroup);
    log('Grupo de clusters inicializado', 'log');
}

function createClusterIcon(cluster) {
    const count = cluster.getChildCount();
    let size = count < 10 ? 40 : count < 50 ? 50 : 60;
    return L.divIcon({
        html: `<div class="marker-cluster"><span>${count}</span></div>`,
        className: 'marker-cluster-icon',
        iconSize: L.point(size, size)
    });
}

function createMarker(loja) {
    if (!loja.latitude || !loja.longitude) return null;
    const lat = parseFloat(loja.latitude);
    const lng = parseFloat(loja.longitude);
    if (isNaN(lat) || isNaN(lng) || lat < -33.7 || lat > 5.3 || lng < -73.9 || lng > -34.7) return null;
    try {
        const color = getColorByStatus(loja.statusCor);
        const icon = createDropIcon(loja, color);
        const marker = L.marker([lat, lng], { icon: icon });
        marker.lojaData = loja;
        marker.on('click', function(e) {
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
    const logoPath = getLogoPath(loja.rede);
    const html = `<div class="marker-drop" style="border-color:${color};"><div class="marker-drop-head" style="background-color:${color};"><img src="${logoPath}" class="marker-logo" onerror="this.style.display='none'"></div></div>`;
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
    const map = {'atacadovem':'atacado_vem.png','carrefour':'carrefour.png','casagrande':'casagrande.png','dma':'dma.png','epa':'epa.png','epaplus':'epa.png','extrabom':'extrabom.png','extraplus':'extraplus.png','germans':'germans.png','grassi':'grassi.png','guanabara':'guanabara.png','martins':'martins.png','mineirao':'mineirao.png','perim':'perim.png','redemaisbrasil':'redemaisbrasil.png','sams':'sams.png','sendas':'sendas.png','vianense':'vianense.png','bh':'bh.png'};
    return `images/logos/${map[redeNorm] || 'default.png'}`;
}

function getColorByStatus(status) {
    const s = (status || '').toLowerCase().trim();
    if (s.includes('verde')) return '#22c55e';
    if (s.includes('laranja')) return '#f97316';
    if (s.includes('vermelho')) return '#ef4444';
    return '#9ca3af';
}

function addMarkersToMap(lojas) {
    if (!markerClusterGroup) return;
    markers.forEach(m => markerClusterGroup.removeLayer(m));
    markers = [];
    lojas.forEach(loja => {
        const marker = createMarker(loja);
        if (marker) {
            markerClusterGroup.addLayer(marker);
            markers.push(marker);
        }
    });
}

function clearMarkers() {
    markers.forEach(m => markerClusterGroup.removeLayer(m));
    markers = [];
}

function onMarkerClick(marker) {
    const loja = marker.lojaData;
    if (!loja) return;

    try { closeAllPopups(); } catch (e) {}

    const popup = `<div class="popup-content"><h3>${loja.nomeFantasia}</h3><p><b>CNPJ:</b> ${loja.cnpj}</p><p><b>Endereço:</b> ${loja.logradouro}, ${loja.numero}</p><p><b>Cidade/UF:</b> ${loja.cidade}/${loja.uf}</p><p><b>Status:</b> ${loja.statusCor}</p></div>`;
    try { marker.unbindPopup(); } catch (e) {}
    marker.bindPopup(popup).openPopup();
}

console.log('✓ marker-manager-gota.js carregado');
