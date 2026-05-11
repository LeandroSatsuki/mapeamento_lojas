/**
 * ============================================
 * GERENCIADOR DE CLUSTERIZAÇÃO
 * ============================================
 * Gerencia clusterização de marcadores
 */

/**
 * Ativa clusterização
 */
function enableClustering() {
    if (!markerClusterGroup) {
        log('Grupo de clusters não inicializado', 'error');
        return;
    }

    try {
        markerClusterGroup.disableClustering = false;
        log('Clusterização ativada', 'log');
    } catch (error) {
        log('Erro ao ativar clusterização: ' + error.message, 'warn');
    }
}

/**
 * Desativa clusterização
 */
function disableClustering() {
    if (!markerClusterGroup) {
        log('Grupo de clusters não inicializado', 'error');
        return;
    }

    try {
        markerClusterGroup.disableClustering = true;
        log('Clusterização desativada', 'log');
    } catch (error) {
        log('Erro ao desativar clusterização: ' + error.message, 'warn');
    }
}

/**
 * Verifica se clusterização está ativa
 * @returns {boolean} - True se ativa
 */
function isClusteringEnabled() {
    return markerClusterGroup && !markerClusterGroup.disableClustering;
}

/**
 * Obtém clusters visíveis
 * @returns {Array} - Array de clusters
 */
function getVisibleClusters() {
    if (!markerClusterGroup) return [];

    try {
        return markerClusterGroup._clusters || [];
    } catch (error) {
        log('Erro ao obter clusters: ' + error.message, 'warn');
        return [];
    }
}

/**
 * Obtém número de clusters
 * @returns {number} - Quantidade de clusters
 */
function getClusterCount() {
    return getVisibleClusters().length;
}

/**
 * Obtém informações de um cluster
 * @param {Object} cluster - Objeto do cluster
 * @returns {Object} - Informações do cluster
 */
function getClusterInfo(cluster) {
    if (!cluster) return null;

    try {
        const childCount = cluster.getChildCount();
        const bounds = cluster.getBounds();
        const center = bounds.getCenter();

        return {
            count: childCount,
            center: {
                lat: center.lat,
                lng: center.lng
            },
            bounds: {
                north: bounds.getNorth(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                west: bounds.getWest()
            }
        };
    } catch (error) {
        log('Erro ao obter informações do cluster: ' + error.message, 'warn');
        return null;
    }
}

/**
 * Agrupa marcadores por região
 * @param {string} regiao - Nome da região
 * @returns {Object} - Informações de agrupamento
 */
function groupByRegion(regiao) {
    const filtered = getLojasByRegion(regiao);
    const coordinates = filtered
        .filter(loja => isValidCoordinates(loja.latitude, loja.longitude))
        .map(loja => [loja.latitude, loja.longitude]);

    return {
        regiao: regiao,
        count: filtered.length,
        coordinates: coordinates
    };
}

/**
 * Agrupa marcadores por rede
 * @param {string} rede - Nome da rede
 * @returns {Object} - Informações de agrupamento
 */
function groupByNetwork(rede) {
    const filtered = getLojasByNetwork(rede);
    const coordinates = filtered
        .filter(loja => isValidCoordinates(loja.latitude, loja.longitude))
        .map(loja => [loja.latitude, loja.longitude]);

    return {
        rede: rede,
        count: filtered.length,
        coordinates: coordinates
    };
}

/**
 * Agrupa marcadores por status
 * @param {string} status - Status
 * @returns {Object} - Informações de agrupamento
 */
function groupByStatus(status) {
    const filtered = getLojasByStatus(status);
    const coordinates = filtered
        .filter(loja => isValidCoordinates(loja.latitude, loja.longitude))
        .map(loja => [loja.latitude, loja.longitude]);

    return {
        status: status,
        count: filtered.length,
        coordinates: coordinates
    };
}

/**
 * Agrupa marcadores por UF
 * @param {string} uf - Unidade Federativa
 * @returns {Object} - Informações de agrupamento
 */
function groupByUF(uf) {
    const filtered = getLojasByUF(uf);
    const coordinates = filtered
        .filter(loja => isValidCoordinates(loja.latitude, loja.longitude))
        .map(loja => [loja.latitude, loja.longitude]);

    return {
        uf: uf,
        count: filtered.length,
        coordinates: coordinates
    };
}

/**
 * Filtra marcadores visíveis por status
 * @param {string} status - Status
 */
function filterByStatus(status) {
    const normalized = normalizeStatus(status);
    const filtered = getLojasByStatus(normalized);

    // Limpar e recriar marcadores
    clearMarkers();
    addMarkersToMap(filtered);

    log(`Filtro aplicado: ${status} (${filtered.length} lojas)`, 'log');
}

/**
 * Filtra marcadores visíveis por rede
 * @param {string} rede - Nome da rede
 */
function filterByNetwork(rede) {
    const filtered = getLojasByNetwork(rede);

    // Limpar e recriar marcadores
    clearMarkers();
    addMarkersToMap(filtered);

    log(`Filtro aplicado: ${rede} (${filtered.length} lojas)`, 'log');
}

/**
 * Filtra marcadores visíveis por região
 * @param {string} regiao - Nome da região
 */
function filterByRegion(regiao) {
    const filtered = getLojasByRegion(regiao);

    // Limpar e recriar marcadores
    clearMarkers();
    addMarkersToMap(filtered);

    log(`Filtro aplicado: ${regiao} (${filtered.length} lojas)`, 'log');
}

/**
 * Remove todos os filtros
 */
function clearFilters() {
    clearMarkers();
    addMarkersToMap(getLojas());

    log('Filtros removidos', 'log');
}

/**
 * Obtém estatísticas de clusterização
 * @returns {Object} - Estatísticas
 */
function getClusteringStats() {
    const clusters = getVisibleClusters();
    const stats = {
        totalClusters: clusters.length,
        totalMarkers: getMarkerCount(),
        clusteredMarkers: 0,
        unclustered: 0
    };

    clusters.forEach(cluster => {
        const count = cluster.getChildCount();
        if (count > 1) {
            stats.clusteredMarkers += count;
        } else {
            stats.unclustered += 1;
        }
    });

    return stats;
}

/**
 * Expande todos os clusters
 */
function expandAllClusters() {
    const clusters = getVisibleClusters();
    clusters.forEach(cluster => {
        if (cluster.spiderfy) {
            cluster.spiderfy();
        }
    });

    log(`${clusters.length} clusters expandidos`, 'log');
}

/**
 * Recolhe todos os clusters
 */
function collapseAllClusters() {
    const clusters = getVisibleClusters();
    clusters.forEach(cluster => {
        if (cluster.unspiderfy) {
            cluster.unspiderfy();
        }
    });

    log(`${clusters.length} clusters recolhidos`, 'log');
}

/**
 * Obtém marcadores de um cluster
 * @param {Object} cluster - Objeto do cluster
 * @returns {Array} - Array de marcadores
 */
function getClusterMarkers(cluster) {
    if (!cluster || !cluster.getAllChildMarkers) return [];

    try {
        return cluster.getAllChildMarkers();
    } catch (error) {
        log('Erro ao obter marcadores do cluster: ' + error.message, 'warn');
        return [];
    }
}

/**
 * Calcula densidade de marcadores em uma área
 * @param {Array} bounds - Bounds da área [north, south, east, west]
 * @returns {number} - Densidade (marcadores por km²)
 */
function calculateDensity(bounds) {
    if (!bounds || bounds.length < 4) return 0;

    const [north, south, east, west] = bounds;

    // Calcular área aproximada em km²
    const latDiff = north - south;
    const lngDiff = east - west;
    const areaKm2 = latDiff * lngDiff * 111 * 111; // Aproximação

    // Contar marcadores na área
    const count = markers.filter(marker => {
        const lat = marker.getLatLng().lat;
        const lng = marker.getLatLng().lng;
        return lat >= south && lat <= north && lng >= west && lng <= east;
    }).length;

    return areaKm2 > 0 ? count / areaKm2 : 0;
}

console.log('✓ cluster-manager.js carregado com sucesso');
