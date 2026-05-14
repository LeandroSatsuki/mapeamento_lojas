/**
 * ============================================
 * GERENCIADOR DE POPUPS
 * ============================================
 * Gerencia popups e interações com informações
 */

let currentOpenPopup = null;

/**
 * Abre popup de uma loja
 * @param {Object} loja - Dados da loja
 * @param {L.Marker} marker - Marcador associado
 */
function openLojaPopup(loja, marker) {
    if (!marker) return;

    // Fechar popup anterior se existir
    if (currentOpenPopup && currentOpenPopup !== marker) {
        currentOpenPopup.closePopup();
    }

    // Criar e abrir popup
    const popup = createPopup(loja);
    marker.bindPopup(popup, {
        maxWidth: 300,
        minWidth: 250,
        closeButton: true,
        className: 'loja-popup'
    }).openPopup();

    currentOpenPopup = marker;
    log(`Popup aberto: ${loja.nomeFantasia}`, 'log');
}

/**
 * Fecha popup atual
 */
function closeCurrentPopup() {
    if (currentOpenPopup && currentOpenPopup.closePopup) {
        currentOpenPopup.closePopup();
        currentOpenPopup = null;
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
    currentOpenPopup = null;
}

/**
 * Obtém popup aberto
 * @returns {L.Marker} - Marcador com popup aberto ou null
 */
function getCurrentOpenPopup() {
    return currentOpenPopup;
}

/**
 * Mostra informações de uma loja em um painel
 * @param {Object} loja - Dados da loja
 */
function showLojaInfo(loja) {
    const infoPanel = document.getElementById('infoPanel');
    if (!infoPanel) return;

    const statusClass = normalizeStatus(loja.statusCor);
    const statusLabel = getStatusLabel(statusClass);

    const endereco = [
        loja.logradouro,
        loja.numero,
        loja.bairro,
        loja.cidade,
        loja.uf,
        loja.cep
    ].filter(x => x).join(', ');

    const html = `
        <div class="info-panel-content">
            <h2>${sanitizeText(loja.nomeFantasia)}</h2>
            <p class="info-rede">${sanitizeText(loja.rede)}</p>

            <div class="info-section">
                <h3>Identificação</h3>
                <p><strong>ID:</strong> ${sanitizeText(loja.id)}</p>
                <p><strong>CNPJ:</strong> ${sanitizeText(loja.cnpj)}</p>
            </div>

            <div class="info-section">
                <h3>Localização</h3>
                <p><strong>Endereço:</strong> ${sanitizeText(endereco)}</p>
                <p><strong>Cidade:</strong> ${sanitizeText(loja.cidade)}</p>
                <p><strong>UF:</strong> ${sanitizeText(loja.uf)}</p>
                <p><strong>Região:</strong> ${sanitizeText(loja.regiao)}</p>
                <p><strong>Coordenadas:</strong> ${loja.latitude.toFixed(4)}, ${loja.longitude.toFixed(4)}</p>
            </div>

            ${loja.supervisor ? `
            <div class="info-section">
                <h3>Responsável</h3>
                <p><strong>Supervisor:</strong> ${sanitizeText(loja.supervisor)}</p>
            </div>
            ` : ''}

            <div class="info-section">
                <h3>Status</h3>
                <p class="status-badge ${statusClass}">${statusLabel}</p>
            </div>
        </div>
    `;

    infoPanel.innerHTML = html;
    infoPanel.classList.add('show');
}

/**
 * Esconde painel de informações
 */
function hideLojaInfo() {
    const infoPanel = document.getElementById('infoPanel');
    if (infoPanel) {
        infoPanel.classList.remove('show');
    }
}

/**
 * Cria tooltip com informações da loja
 * @param {Object} loja - Dados da loja
 * @returns {string} - Texto do tooltip
 */
function createTooltip(loja) {
    return `${loja.nomeFantasia} - ${loja.cidade}, ${loja.uf}`;
}

/**
 * Mostra confirmação de ação
 * @param {string} message - Mensagem
 * @param {Function} onConfirm - Callback ao confirmar
 * @param {Function} onCancel - Callback ao cancelar
 */
function showConfirmation(message, onConfirm, onCancel) {
    const confirmed = confirm(message);

    if (confirmed && onConfirm) {
        onConfirm();
    } else if (!confirmed && onCancel) {
        onCancel();
    }
}

/**
 * Mostra alerta
 * @param {string} message - Mensagem
 * @param {Function} onClose - Callback ao fechar
 */
function showAlert(message, onClose) {
    alert(message);

    if (onClose) {
        onClose();
    }
}

/**
 * Exporta informações de uma loja como texto
 * @param {Object} loja - Dados da loja
 * @returns {string} - Texto formatado
 */
function exportLojaInfo(loja) {
    const endereco = [
        loja.logradouro,
        loja.numero,
        loja.bairro,
        loja.cidade,
        loja.uf,
        loja.cep
    ].filter(x => x).join(', ');

    return `
INFORMAÇÕES DA LOJA
===================
Nome: ${loja.nomeFantasia}
Rede: ${loja.rede}
CNPJ: ${loja.cnpj}
ID: ${loja.id}

LOCALIZAÇÃO
===========
Endereço: ${endereco}
Cidade: ${loja.cidade}
UF: ${loja.uf}
Região: ${loja.regiao}

COORDENADAS
===========
Latitude: ${loja.latitude}
Longitude: ${loja.longitude}

${loja.supervisor ? `RESPONSÁVEL\n============\nSupervisor: ${loja.supervisor}\n` : ''}
Status: ${getStatusLabel(normalizeStatus(loja.statusCor))}
    `.trim();
}

/**
 * Copia texto para clipboard
 * @param {string} text - Texto a copiar
 * @returns {Promise<boolean>} - True se sucesso
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        log('Texto copiado para clipboard', 'log');
        return true;
    } catch (error) {
        log('Erro ao copiar para clipboard: ' + error.message, 'warn');
        return false;
    }
}

/**
 * Abre mapa externo (Google Maps)
 * @param {Object} loja - Dados da loja
 */
function openExternalMap(loja) {
    const url = generateExternalMapUrl(loja);
    window.open(url, '_blank');
    log('Abrindo mapa externo para: ' + loja.nomeFantasia, 'log');
}

function generateExternalMapUrl(loja) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${loja.latitude},${loja.longitude}`)}`;
}

/**
 * Gera URL de compartilhamento
 * @param {Object} loja - Dados da loja
 * @returns {string} - URL com parâmetros
 */
function generateShareUrl(loja) {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
        loja_id: loja.id,
        lat: loja.latitude,
        lng: loja.longitude,
        zoom: 15
    });

    return `${baseUrl}?${params.toString()}`;
}

/**
 * Compartilha informações da loja
 * @param {Object} loja - Dados da loja
 */
function shareLojaInfo(loja) {
    const text = exportLojaInfo(loja);
    const url = generateShareUrl(loja);

    if (navigator.share) {
        navigator.share({
            title: `Loja: ${loja.nomeFantasia}`,
            text: text,
            url: url
        }).catch(error => {
            log('Erro ao compartilhar: ' + error.message, 'warn');
        });
    } else {
        // Fallback: copiar URL para clipboard
        copyToClipboard(url);
        showStatus('Link copiado para clipboard!', 'success', 2000);
    }
}

console.log('✓ popup-handler.js carregado com sucesso');
