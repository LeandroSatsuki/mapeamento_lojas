/**
 * ============================================
 * CAMADA DE AREAS POR REGIAO
 * ============================================
 * Gera e exibe contornos dinamicos a partir das lojas por regiao.
 */

let regionOverlayLayer = null;

const REGION_COLOR_PALETTE = [
    '#2563EB',
    '#0F766E',
    '#7C3AED',
    '#C2410C',
    '#BE123C',
    '#4338CA',
    '#15803D',
    '#B45309'
];

function initializeRegionLayer() {
    if (!mapInstance || typeof L === 'undefined') return;

    if (!mapInstance.getPane('regionOverlayPane')) {
        const pane = mapInstance.createPane('regionOverlayPane');
        pane.style.zIndex = '350';
        pane.style.pointerEvents = 'none';
        // O blend mode deixa as sobreposicoes mais "clipadas" visualmente
        // sem exigir recorte geometrico real a cada intersecao.
        pane.style.mixBlendMode = 'multiply';
    }

    if (!regionOverlayLayer) {
        regionOverlayLayer = L.layerGroup().addTo(mapInstance);
    }
}

function clearRegionOverlays() {
    if (regionOverlayLayer) {
        regionOverlayLayer.clearLayers();
    }
}

function updateRegionOverlays() {
    initializeRegionLayer();
    if (!regionOverlayLayer) return;

    clearRegionOverlays();

    if (!activeFilters || !Array.isArray(activeFilters.regiao) || activeFilters.regiao.length === 0) {
        return;
    }

    const stores = getRegionOverlayStores();
    const groupedStores = groupStoresByRegion(stores);

    Object.entries(groupedStores).forEach(([regionName, regionStores]) => {
        const layer = createRegionOverlay(regionName, regionStores);
        if (layer) {
            regionOverlayLayer.addLayer(layer);
        }
    });
}

function getRegionOverlayStores() {
    const lojas = getLojas() || [];
    const selectedRegions = new Set((activeFilters.regiao || []).map(region => (region || '').toString().trim()));
    const selectedUFs = new Set((activeFilters.uf || []).map(uf => (uf || '').toString().trim().toUpperCase()));

    return lojas.filter(loja => {
        const region = (loja.regiao || '').toString().trim();
        const uf = (loja.uf || '').toString().trim().toUpperCase();
        if (!selectedRegions.has(region)) return false;
        if (selectedUFs.size > 0 && !selectedUFs.has(uf)) return false;
        return isFinite(Number(loja.latitude)) && isFinite(Number(loja.longitude));
    });
}

function groupStoresByRegion(stores) {
    return stores.reduce((acc, loja) => {
        const region = (loja.regiao || '').toString().trim();
        if (!region) return acc;
        if (!acc[region]) acc[region] = [];
        acc[region].push(loja);
        return acc;
    }, {});
}

function createRegionOverlay(regionName, stores) {
    const geometry = buildRegionGeometry(stores);
    if (!geometry) return null;

    const color = getRegionOverlayColor(regionName);
    const layer = L.geoJSON(geometry, {
        pane: 'regionOverlayPane',
        style: {
            color: color,
            weight: 2,
            opacity: 0.8,
            fillColor: color,
            fillOpacity: 0.2
        }
    });

    const center = getGeometryCenter(geometry, stores);
    if (center) {
        const label = L.marker(center, {
            pane: 'regionOverlayPane',
            interactive: false,
            icon: L.divIcon({
                className: 'region-overlay-label',
                html: `<span>${escapeHtml(regionName)}</span>`,
                iconSize: [140, 24],
                iconAnchor: [70, 12]
            })
        });
        layer.addLayer(label);
    }

    return layer;
}

function buildRegionGeometry(stores) {
    const points = stores
        .map(loja => [Number(loja.longitude), Number(loja.latitude)])
        .filter(([lng, lat]) => !Number.isNaN(lat) && !Number.isNaN(lng));

    if (points.length === 0 || typeof turf === 'undefined') {
        return null;
    }

    if (points.length === 1) {
        return turf.circle(points[0], 8, { units: 'kilometers', steps: 40 });
    }

    if (points.length === 2) {
        return turf.buffer(turf.lineString(points), 6, { units: 'kilometers' });
    }

    const uniquePoints = dedupeCoordinates(points);
    const featureCollection = turf.featureCollection(uniquePoints.map(point => turf.point(point)));

    let geometry = turf.concave(featureCollection, { maxEdge: 250, units: 'kilometers' });
    if (!geometry) {
        geometry = turf.convex(featureCollection);
    }
    if (!geometry) {
        geometry = turf.buffer(turf.lineString(uniquePoints), 6, { units: 'kilometers' });
    }

    return geometry;
}

function dedupeCoordinates(points) {
    const seen = new Set();
    return points.filter(([lng, lat]) => {
        const key = `${lng.toFixed(6)}:${lat.toFixed(6)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function getGeometryCenter(geometry, stores) {
    try {
        if (geometry && typeof turf !== 'undefined') {
            const center = turf.centerOfMass(geometry);
            if (center && center.geometry && Array.isArray(center.geometry.coordinates)) {
                const [lng, lat] = center.geometry.coordinates;
                return [lat, lng];
            }
        }
    } catch (error) {
        log(`Centro da regiao calculado via fallback: ${error.message}`, 'warn');
    }

    if (!stores.length) return null;
    const avg = stores.reduce((acc, loja) => {
        acc.lat += Number(loja.latitude) || 0;
        acc.lng += Number(loja.longitude) || 0;
        return acc;
    }, { lat: 0, lng: 0 });

    return [avg.lat / stores.length, avg.lng / stores.length];
}

function getRegionOverlayColor(regionName) {
    let hash = 0;
    const normalized = (regionName || '').toString();
    for (let i = 0; i < normalized.length; i++) {
        hash = ((hash << 5) - hash) + normalized.charCodeAt(i);
        hash |= 0;
    }
    return REGION_COLOR_PALETTE[Math.abs(hash) % REGION_COLOR_PALETTE.length];
}

function escapeHtml(text) {
    return (text || '').toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
