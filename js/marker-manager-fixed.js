/**
 * ============================================
 * GERENCIADOR DE MARCADORES (CORRIGIDO)
 * ============================================
 * Cria, gerencia e customiza marcadores no mapa
 * VERSÃO CORRIGIDA: Localização precisa
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
    // CORRIGIDO: Validação mais rigorosa de coordenadas
    if (!loja.latitude || !loja.longitude) {
        log(`Loja ${loja.id} sem coordenadas`, 'warn');
        return null;
    }

    const lat = parseFloat(loja.latitude);
    const lng = parseFloat(loja.longitude);

    // Validar se são números válidos
    if (isNaN(lat) || isNaN(lng)) {
        log(`Loja ${loja.id} com coordenadas inválidas: ${loja.latitude}, ${loja.longitude}`, 'warn');
        return null;
    }

    // Validar se estão dentro do Brasil
    if (lat < -33.7 || lat > 5.3 || lng < -73.9 || lng > -34.7) {
        log(`Loja ${loja.id} com coordenadas fora do Brasil: ${lat}, ${lng}`, 'warn');
        return null;
    }

    try {
        // Obter cor baseada no status
        const color = getColorByStatus(loja.statusCor);

        // Criar ícone customizado
        const icon = createCustomIcon(loja, color);

        // CORRIGIDO: Usar coordenadas precisas [latitude, longitude]
        const marker = L.marker(
            [lat, lng],
            { icon: icon }
        );

        // Armazenar dados da loja no marcador
        marker.lojaData = loja;

        // Adicionar evento de clique
        marker.on('click', function() {
            onMarkerClick(this);
        });

        log(`Marcador criado para ${loja.nomeFantasia} em (${lat}, ${lng})`, 'log');

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
    // Obter caminho do logo
    const logoPath = getLogoPath(loja.rede);

    // HTML do ícone
    const html = `
        <div class="marker-icon" style="background-color: ${color};">
            <img src="${logoPath}" alt="${loja.rede}" onerror="this.style.display='none'">
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

    // Criar popup
    const popup = createPopup(marker.lojaData);

    // Abrir popup
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
                <span class="popup-value">${sanitizeText(loja.cidade)}/${sanitizeText(loja.uf)}</span>
            </div>

            <div class="popup-field">
                <span class="popup-label">Região:</span>
                <span class="popup-value">${sanitizeText(loja.regiao)}</span>
            </div>

            <div class="popup-field">
                <span class="popup-label">Status:</span>
                <span class="popup-value" style="color: ${getColorByStatus(loja.statusCor)}; font-weight: bold;">
                    ${statusLabel}
                </span>
            </div>

            ${loja.supervisor ? `
                <div class="popup-field">
                    <span class="popup-label">Supervisor:</span>
                    <span class="popup-value">${sanitizeText(loja.supervisor)}</span>
                </div>
            ` : ''}

            <div class="popup-field">
                <span class="popup-label">Coordenadas:</span>
                <span class="popup-value">${loja.latitude.toFixed(4)}, ${loja.longitude.toFixed(4)}</span>
            </div>
        </div>
    `;

    return html;
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

        let sucessos = 0;
        let falhas = 0;

        // Criar e adicionar novos marcadores
        lojas.forEach(loja => {
            const marker = createMarker(loja);
            if (marker) {
                markers.push(marker);
                markerClusterGroup.addLayer(marker);
                sucessos++;
            } else {
                falhas++;
            }
        });

        log(`${sucessos} marcadores adicionados, ${falhas} falharam`, 'log');

        // CORRIGIDO: Ajustar vista do mapa aos marcadores com validação
        if (markers.length > 0) {
            const coordinates = getCoordinates();
            if (coordinates && coordinates.length > 0) {
                fitMapBounds(coordinates);
                log(`Mapa ajustado para ${coordinates.length} marcadores`, 'log');
            }
        } else {
            log('Nenhum marcador válido para exibir', 'warn');
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
 * Obtém marcador por ID da loja
 * @param {string} lojaId - ID da loja
 * @returns {L.Marker} - Marcador ou null
 */
function getMarkerByLojaId(lojaId) {
    return markers.find(marker => marker.lojaData && marker.lojaData.id === lojaId) || null;
}

/**
 * Centraliza mapa em um marcador
 * @param {string} lojaId - ID da loja
 */
function focusMarker(lojaId) {
    const marker = getMarkerByLojaId(lojaId);
    if (marker) {
        mapInstance.setView(marker.getLatLng(), 15);
        marker.openPopup();
    }
}

/**
 * Obtém coordenadas válidas de todos os marcadores
 * @returns {Array} - Array de [lat, lng]
 */
function getCoordinates() {
    return markers
        .filter(marker => marker && marker.getLatLng)
        .map(marker => {
            const latlng = marker.getLatLng();
            return [latlng.lat, latlng.lng];
        });
}

console.log('✓ marker-manager-fixed.js carregado com sucesso');
