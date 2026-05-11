/**
 * ============================================
 * CONFIGURAÇÃO DO MAPA - LEAFLET
 * ============================================
 * Inicializa e configura o mapa Leaflet
 */

let mapInstance = null;
let mapConfig = null;

/**
 * Carrega configurações do arquivo config.json
 */
async function loadMapConfig() {
    try {
        const response = await fetch('data/config.json');
        if (!response.ok) {
            throw new Error('Erro ao carregar config.json');
        }
        mapConfig = await response.json();
        log('Configurações carregadas com sucesso', 'log');
        return mapConfig;
    } catch (error) {
        log('Erro ao carregar configurações: ' + error.message, 'error');
        throw error;
    }
}

/**
 * Inicializa o mapa Leaflet
 * @returns {L.Map} - Instância do mapa
 */
function initializeMap() {
    if (!mapConfig) {
        log('Configurações não carregadas', 'error');
        return null;
    }

    try {
        // Criar mapa
        mapInstance = L.map('map', {
            center: mapConfig.map.center,
            zoom: mapConfig.map.initialZoom,
            minZoom: mapConfig.map.minZoom,
            maxZoom: mapConfig.map.maxZoom,
            zoomControl: true,
            attributionControl: true
        });

        // Adicionar tile layer (OpenStreetMap)
        L.tileLayer(mapConfig.map.tileLayer, {
            attribution: mapConfig.map.attribution,
            maxZoom: mapConfig.map.maxZoom
        }).addTo(mapInstance);

        // Eventos do mapa
        mapInstance.on('load', onMapLoad);
        mapInstance.on('moveend', onMapMove);
        mapInstance.on('zoomend', onMapZoom);

        log('Mapa inicializado com sucesso', 'log');
        return mapInstance;
    } catch (error) {
        log('Erro ao inicializar mapa: ' + error.message, 'error');
        throw error;
    }
}

/**
 * Callback quando o mapa carrega
 */
function onMapLoad() {
    log('Mapa carregado', 'log');
}

/**
 * Callback quando o mapa se move
 */
function onMapMove() {
    const center = mapInstance.getCenter();
    log(`Mapa movido para: ${center.lat.toFixed(2)}, ${center.lng.toFixed(2)}`, 'log');
}

/**
 * Callback quando o zoom muda
 */
function onMapZoom() {
    const zoom = mapInstance.getZoom();
    log(`Zoom alterado para: ${zoom}`, 'log');
    
    // Desaglutinar clusters quando zoom >= 7
    if (zoom >= 7) {
        disableClustering();
    } else {
        enableClustering();
    }
}

/**
 * Centraliza o mapa em um ponto
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} zoom - Nível de zoom (opcional)
 */
function centerMap(lat, lng, zoom = null) {
    if (!mapInstance) return;

    if (isValidCoordinates(lat, lng)) {
        mapInstance.setView([lat, lng], zoom || mapInstance.getZoom());
    }
}

/**
 * Centraliza o mapa em múltiplos pontos (fit bounds)
 * @param {Array} coordinates - Array de [lat, lng]
 */
function fitMapBounds(coordinates) {
    if (!mapInstance || coordinates.length === 0) return;

    try {
        const bounds = L.latLngBounds(coordinates);
        mapInstance.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 12
        });
    } catch (error) {
        log('Erro ao ajustar bounds: ' + error.message, 'warn');
    }
}

/**
 * Obtém zoom atual do mapa
 * @returns {number} - Nível de zoom
 */
function getMapZoom() {
    return mapInstance ? mapInstance.getZoom() : null;
}

/**
 * Obtém centro atual do mapa
 * @returns {Object} - {lat, lng}
 */
function getMapCenter() {
    if (!mapInstance) return null;
    const center = mapInstance.getCenter();
    return {
        lat: center.lat,
        lng: center.lng
    };
}

/**
 * Obtém bounds do mapa
 * @returns {Object} - {north, south, east, west}
 */
function getMapBounds() {
    if (!mapInstance) return null;
    const bounds = mapInstance.getBounds();
    return {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
    };
}

/**
 * Define zoom do mapa
 * @param {number} zoom - Nível de zoom
 */
function setMapZoom(zoom) {
    if (mapInstance) {
        mapInstance.setZoom(zoom);
    }
}

/**
 * Aumenta zoom do mapa
 */
function zoomMapIn() {
    if (mapInstance) {
        mapInstance.zoomIn();
    }
}

/**
 * Diminui zoom do mapa
 */
function zoomMapOut() {
    if (mapInstance) {
        mapInstance.zoomOut();
    }
}

/**
 * Reseta vista do mapa para posição inicial
 */
function resetMapView() {
    if (!mapInstance || !mapConfig) return;

    mapInstance.setView(
        mapConfig.map.center,
        mapConfig.map.initialZoom
    );
}

/**
 * Obtém instância do mapa
 * @returns {L.Map} - Instância do mapa
 */
function getMapInstance() {
    return mapInstance;
}

/**
 * Obtém configurações do mapa
 * @returns {Object} - Objeto de configurações
 */
function getMapConfig() {
    return mapConfig;
}

console.log('✓ map-config.js carregado com sucesso');

/**
 * Desabilita clusterização (mostra todos os marcadores individuais)
 */
function disableClustering() {
    try {
        if (clusterGroup && mapInstance) {
            mapInstance.removeLayer(clusterGroup);
            log('Clusterização desabilitada - Todos os marcadores visíveis', 'log');
        }
    } catch (error) {
        log('Erro ao desabilitar clusterização: ' + error.message, 'error');
    }
}

/**
 * Habilita clusterização (agrupa marcadores próximos)
 */
function enableClustering() {
    try {
        if (clusterGroup && mapInstance) {
            mapInstance.addLayer(clusterGroup);
            log('Clusterização habilitada', 'log');
        }
    } catch (error) {
        log('Erro ao habilitar clusterização: ' + error.message, 'error');
    }
}
