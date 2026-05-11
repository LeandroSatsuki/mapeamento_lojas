/**
 * ============================================
 * GERENCIADOR DE MARCADORES
 * ============================================
 * Cria, gerencia e customiza marcadores no mapa
 */

let markers = [];
let markerClusterGroup = null;

/**
 * Inicializa o grupo de clusters
 */
function initializeClusterGroup() {
    if (!mapInstance) {
        log('Mapa não inicializado', 'error');
        return;
    }

    // Remover cluster anterior se existir
    if (markerClusterGroup) {
        mapInstance.removeLayer(markerClusterGroup);
    }

    // Criar novo grupo de clusters
    markerClusterGroup = L.markerClusterGroup({
        maxClusterRadius: mapConfig.cluster.maxClusterRadius,
        disableClusteringAtZoom: mapConfig.cluster.disableClusteringAtZoom,
        iconCreateFunction: createClusterIcon
    });

    mapInstance.addLayer(markerClusterGroup);
    log('Grupo de clusters inicializado', 'log');
}

/**
 * Cria ícone customizado para cluster
 * @param {Object} cluster - Objeto do cluster
 * @returns {L.Icon} - Ícone do cluster
 */
function createClusterIcon(cluster) {
    const count = cluster.getChildCount();
    let size, className;

    if (count < 10) {
        size = 40;
        className = 'marker-cluster marker-cluster-small';
    } else if (count < 50) {
        size = 50;
        className = 'marker-cluster marker-cluster-medium';
    } else {
        size = 60;
        className = 'marker-cluster marker-cluster-large';
    }

    return L.divIcon({
        html: `<div class="${className}"><span>${count}</span></div>`,
        className: 'marker-cluster-icon',
        iconSize: L.point(size, size)
    });
}

/**
 * Cria marcador para uma loja
 * @param {Object} loja - Dados da loja
 * @returns {L.Marker} - Marcador criado
 */
function createMarker(loja) {
    if (!isValidCoordinates(loja.latitude, loja.longitude)) {
        return null;
    }

    try {
        // Obter cor baseada no status
        const color = getColorByStatus(loja.statusCor);

        // Criar ícone customizado
        const icon = createCustomIcon(loja, color);

        // Criar marcador
        const marker = L.marker(
            [loja.latitude, loja.longitude],
            { icon: icon }
        );

        // Armazenar dados da loja no marcador
        marker.lojaData = loja;

        // Adicionar evento de clique — parar propagação para evitar que o
        // clique chegue ao mapa e feche popups imediatamente.
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
        log(`Erro ao criar marcador para loja ${loja.id}: ${error.message}`, 'warn');
        return null;
    }
}

/**
 * Cria ícone customizado com logo da rede
 * @param {Object} loja - Dados da loja
 * @param {string} color - Cor do marcador
 * @returns {L.DivIcon} - Ícone customizado
 */
function createCustomIcon(loja, color) {
    // Obter caminho do logo (usa helper consolidado quando disponível).
    // Passa `loja.logo` (coluna P) como primeiro candidato, se presente.
    const logoPath = (typeof getLogoSrc === 'function') ? getLogoSrc(loja.rede || loja.nomeFantasia, loja.logo) : getLogoPath(loja.rede);

    // Escapar rede para passar ao handler
    const redeEsc = (loja.rede || loja.nomeFantasia || '').replace(/'/g, "\\'");

    // Calcular iniciais para fallback
    const initials = (loja.rede || loja.nomeFantasia || '').toString().split(/\s+/).filter(Boolean).slice(0,2).map(w => w[0]).join('').toUpperCase() || '??';

    // HTML do ícone com fallback de iniciais
    const html = `
        <div class="marker-icon" style="background-color: ${color};">
            <img src="${encodeURI(logoPath)}" alt="${redeEsc}" data-logo="${sanitizeText(loja.logo || '')}" onerror="handleLogoError(this, '${redeEsc}')">
            <span class="marker-initials" style="display:none">${initials}</span>
        </div>
    `;

    return L.divIcon({
        html: html,
        className: 'marker-custom',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });
}

/**
 * Obtém caminho do logo da rede
 * @param {string} rede - Nome da rede
 * @returns {string} - Caminho do logo
 */
function getLogoPath(rede) {
    if (!mapConfig || !mapConfig.logos) {
        return '';
    }

    const logoMap = mapConfig.logos.networks;
    const logoName = logoMap[rede] || logoMap[rede.toUpperCase()];

    if (logoName) {
        return `${mapConfig.logos.path}${logoName}`;
    }

    return '';
}

/**
 * Callback ao clicar em um marcador
 * @param {L.Marker} marker - Marcador clicado
 */
function onMarkerClick(marker) {
    if (!marker.lojaData) return;

    // Garantir que outros popups sejam fechados antes de abrir o do marcador clicado
    try { closeAllPopups(); } catch (e) {}

    // Criar conteúdo do popup
    const popup = createPopup(marker.lojaData);

    // Rebind para garantir conteúdo atualizado e abrir
    try { marker.unbindPopup(); } catch (e) {}
    marker.bindPopup(popup, {
        maxWidth: 300,
        minWidth: 250,
        closeButton: true
    }).openPopup();

    log(`Marcador clicado: ${marker.lojaData.nomeFantasia}`, 'log');
}

/**
 * Cria conteúdo do popup
 * @param {Object} loja - Dados da loja
 * @returns {string} - HTML do popup
 */
function createPopup(loja) {
    const statusClass = normalizeStatus(loja.statusCor);
    const statusLabel = getStatusLabel(statusClass);

    const endereco = [
        loja.logradouro,
        loja.numero,
        loja.bairro,
        loja.cidade,
        loja.uf,
        loja.cep
    ].filter(x => x).join(' - ');

    const html = `
        <div class="popup-container">
            <div class="popup-header">${sanitizeText(loja.nomeFantasia)}</div>

            <div class="popup-field">
                <span class="popup-label">CNPJ:</span>
                <span class="popup-value">${sanitizeText(loja.cnpj)}</span>
            </div>

            <div class="popup-field">
                <span class="popup-label">Rede:</span>
                <span class="popup-value">${sanitizeText(loja.rede)}</span>
            </div>

            <div class="popup-field">
                <span class="popup-label">Endereço:</span>
                <span class="popup-value">${sanitizeText(endereco)}</span>
            </div>

            <div class="popup-field">
                <span class="popup-label">Cidade/UF:</span>
                <span class="popup-value">${sanitizeText(loja.cidade)} - ${sanitizeText(loja.uf)}</span>
            </div>

            <div class="popup-field">
                <span class="popup-label">Região:</span>
                <span class="popup-value">${sanitizeText(loja.regiao)}</span>
            </div>

            ${loja.supervisor ? `
            <div class="popup-field">
                <span class="popup-label">Supervisor:</span>
                <span class="popup-value">${sanitizeText(loja.supervisor)}</span>
            </div>
            ` : ''}

            <div class="popup-status ${statusClass}">
                ${statusLabel}
            </div>
        </div>
    `;

    return html;
}

/**
 * Obtém label do status
 * @param {string} status - Status normalizado
 * @returns {string} - Label do status
 */
function getStatusLabel(status) {
    const labels = {
        'verde': '✓ Faturamento Recente',
        'laranja': '⚠ Faturamento Intermediário',
        'vermelho': '✗ Sem Faturamento',
        'cinza': '? Status Desconhecido',
        'roxa': '✦ Roxa Atendidas Por Terceiros'
    };

    return labels[status] || labels['cinza'];
}

/**
 * Adiciona marcadores ao mapa
 * @param {Array} lojas - Array de lojas
 */
function addMarkersToMap(lojas) {
    if (!markerClusterGroup) {
        log('Grupo de clusters não inicializado', 'error');
        return;
    }

    try {
        // Limpar marcadores anteriores
        markerClusterGroup.clearLayers();
        markers = [];

        // Criar e adicionar novos marcadores
        lojas.forEach(loja => {
            const marker = createMarker(loja);
            if (marker) {
                markers.push(marker);
                markerClusterGroup.addLayer(marker);
            }
        });

        log(`${markers.length} marcadores adicionados ao mapa`, 'log');

        // Ajustar vista do mapa aos marcadores
        if (markers.length > 0) {
            const coordinates = getCoordinates();
            fitMapBounds(coordinates);
        }
    } catch (error) {
        log(`Erro ao adicionar marcadores: ${error.message}`, 'error');
    }
}

/**
 * Remove todos os marcadores do mapa
 */
function clearMarkers() {
    if (markerClusterGroup) {
        markerClusterGroup.clearLayers();
    }
    markers = [];
    log('Marcadores removidos', 'log');
}

/**
 * Obtém todos os marcadores
 * @returns {Array} - Array de marcadores
 */
function getMarkers() {
    return markers;
}

/**
 * Obtém número de marcadores
 * @returns {number} - Quantidade de marcadores
 */
function getMarkerCount() {
    return markers.length;
}

/**
 * Filtra marcadores por status
 * @param {string} status - Status
 * @returns {Array} - Array de marcadores filtrados
 */
function getMarkersByStatus(status) {
    const normalized = normalizeStatus(status);
    return markers.filter(marker =>
        marker.lojaData && normalizeStatus(marker.lojaData.statusCor) === normalized
    );
}

/**
 * Destaca marcadores (muda opacidade dos outros)
 * @param {Array} markersToHighlight - Marcadores a destacar
 */
function highlightMarkers(markersToHighlight) {
    markers.forEach(marker => {
        const shouldHighlight = markersToHighlight.includes(marker);
        const opacity = shouldHighlight ? 1 : 0.3;

        marker.setOpacity(opacity);
    });
}

/**
 * Remove destaque de todos os marcadores
 */
function clearHighlight() {
    markers.forEach(marker => {
        marker.setOpacity(1);
    });
}

/**
 * Abre popup de um marcador
 * @param {L.Marker} marker - Marcador
 */
function openMarkerPopup(marker) {
    if (marker && marker.openPopup) {
        marker.openPopup();
    }
}

/**
 * Fecha popup de um marcador
 * @param {L.Marker} marker - Marcador
 */
function closeMarkerPopup(marker) {
    if (marker && marker.closePopup) {
        marker.closePopup();
    }
}

/**
 * Fecha todos os popups
 */
function closeAllPopups() {
    markers.forEach(marker => {
        if (marker.closePopup) {
            marker.closePopup();
        }
    });
}

console.log('✓ marker-manager.js carregado com sucesso');
