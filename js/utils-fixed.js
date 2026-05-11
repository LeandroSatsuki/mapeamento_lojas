/**
 * ============================================
 * FUNÇÕES UTILITÁRIAS - MAPA INTERATIVO (CORRIGIDO)
 * ============================================
 * Arquivo com funções auxiliares reutilizáveis
 * VERSÃO CORRIGIDA: normalizeStatus com limpeza de espaços
 */

/**
 * Carrega um arquivo JSON
 * @param {string} url - URL do arquivo JSON
 * @returns {Promise<Object>} - Dados do JSON
 */
async function loadJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro ao carregar JSON: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Erro em loadJSON:', error);
        throw error;
    }
}

/**
 * Carrega um arquivo CSV e converte para array de objetos
 * @param {string} url - URL do arquivo CSV
 * @returns {Promise<Array>} - Array de objetos com dados
 */
async function loadCSV(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro ao carregar CSV: ${response.status}`);
        }
        const text = await response.text();
        return parseCSV(text);
    } catch (error) {
        console.error('Erro em loadCSV:', error);
        throw error;
    }
}

/**
 * Converte texto CSV para array de objetos
 * @param {string} csvText - Texto em formato CSV
 * @returns {Array} - Array de objetos
 */
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) {
        console.warn('CSV vazio');
        return [];
    }

    // Primeira linha é o header
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    // Processar linhas de dados
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '') continue;

        const values = parseCSVLine(line);
        const obj = {};

        headers.forEach((header, index) => {
            obj[header] = values[index] || '';
        });

        data.push(obj);
    }

    return data;
}

/**
 * Faz parsing de uma linha CSV respeitando aspas
 * @param {string} line - Linha CSV
 * @returns {Array} - Array de valores
 */
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    values.push(current.trim());
    return values;
}

/**
 * Valida coordenadas de latitude e longitude
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} - True se válido
 */
function isValidCoordinates(lat, lng) {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    return (
        !isNaN(latNum) &&
        !isNaN(lngNum) &&
        latNum >= -90 &&
        latNum <= 90 &&
        lngNum >= -180 &&
        lngNum <= 180
    );
}

/**
 * Formata data para exibição
 * @param {Date|string} date - Data a formatar
 * @returns {string} - Data formatada
 */
function formatDate(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }

    if (!(date instanceof Date) || isNaN(date)) {
        return '-';
    }

    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    };

    return date.toLocaleDateString('pt-BR', options);
}

/**
 * Formata hora para exibição (HH:MM)
 * @param {Date|string} date - Data/hora a formatar
 * @returns {string} - Hora formatada
 */
function formatTime(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }

    if (!(date instanceof Date) || isNaN(date)) {
        return '-';
    }

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
}

/**
 * Sanitiza texto para evitar XSS
 * @param {string} text - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
function sanitizeText(text) {
    if (typeof text !== 'string') {
        return '';
    }

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Mostra o loading spinner
 */
function showLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.add('show');
    }
}

/**
 * Esconde o loading spinner
 */
function hideLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.remove('show');
    }
}

/**
 * Mostra mensagem de status
 * @param {string} message - Mensagem a exibir
 * @param {string} type - Tipo: 'success' ou 'error'
 * @param {number} duration - Duração em ms (0 = permanente)
 */
function showStatus(message, type = 'success', duration = 3000) {
    const statusEl = document.getElementById('updateStatus');
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.className = `update-status show ${type}`;

    if (duration > 0) {
        setTimeout(() => {
            statusEl.classList.remove('show');
        }, duration);
    }
}

/**
 * Esconde mensagem de status
 */
function hideStatus() {
    const statusEl = document.getElementById('updateStatus');
    if (statusEl) {
        statusEl.classList.remove('show');
    }
}

/**
 * Obtém cor baseada no status
 * @param {string} status - Status (verde, laranja, vermelho, cinza)
 * @returns {string} - Código hex da cor
 */
function getColorByStatus(status) {
    const colors = {
        'verde': '#228B22',
        'laranja': '#FF8C00',
        'vermelho': '#DC143C',
        'cinza': '#808080',
        'roxa': '#7C3AED'
    };

    return colors[status.toLowerCase()] || colors['cinza'];
}

/**
 * Normaliza nome de status
 * CORRIGIDO: Remove espaços extras e caracteres invisíveis
 * @param {string} status - Status original
 * @returns {string} - Status normalizado
 */
function normalizeStatus(status) {
    console.log('=== NORMALIZANDO STATUS ===');
    console.log('1. Status recebido (RAW):', status);
    console.log('2. Tipo:', typeof status);
    console.log('3. Comprimento:', status ? status.length : 'N/A');
    console.log('4. Código dos caracteres:', status ? Array.from(status).map(c => c.charCodeAt(0)).join(',') : 'N/A');
    
    if (!status) {
        console.log('5. Status vazio! Retornando CINZA');
        log('Status vazio, usando cinza', 'warn');
        return 'cinza';
    }

    // CORRIGIDO: Remover espaços extras, quebras de linha, tabs, etc
    // A origem dos dados pode trazer espacos invisiveis e variacoes
    // sutis; essa limpeza evita status duplicados por detalhe textual.
    const normalized = status
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')  // Substituir múltiplos espaços por um
        .replace(/[\n\r\t]/g, ''); // Remover quebras de linha e tabs

    console.log('5. Status normalizado:', normalized);
    console.log('6. Comprimento normalizado:', normalized.length);
    console.log('7. Código dos caracteres normalizados:', Array.from(normalized).map(c => c.charCodeAt(0)).join(','));
    
    log(`Status original: "${status}" → Normalizado: "${normalized}"`, 'log');

    // Verificar cada tipo de status
    console.log('8. Testando ROXA/ROXO/TERCEIROS:', normalized.includes('roxa') || normalized.includes('roxo') || normalized.includes('rox') || normalized.includes('terceir'));
    if (normalized.includes('roxa') || normalized.includes('roxo') || normalized.includes('rox') || normalized.includes('terceir')) {
        console.log('✓ ROXA encontrado!');
        log('Status identificado como: ROXA', 'log');
        return 'roxa';
    }

    console.log('9. Testando VERDE:', normalized.includes('verde'));
    if (normalized.includes('verde')) {
        console.log('✓ VERDE encontrado!');
        log('Status identificado como: VERDE', 'log');
        return 'verde';
    }
    
    console.log('10. Testando LARANJA:', normalized.includes('laranja'));
    if (normalized.includes('laranja')) {
        console.log('✓ LARANJA encontrado!');
        log('Status identificado como: LARANJA', 'log');
        return 'laranja';
    }
    
    console.log('11. Testando VERMELHO:', normalized.includes('vermelho'));
    if (normalized.includes('vermelho') || normalized.includes('antigo')) {
        console.log('✓ VERMELHO encontrado!');
        log('Status identificado como: VERMELHO', 'log');
        return 'vermelho';
    }

    console.log('11. Nenhum match encontrado! Retornando CINZA');
    log(`Status não reconhecido: "${status}" → Usando CINZA como padrão`, 'warn');
    return 'cinza';
}

/**
 * Calcula distância entre dois pontos (Haversine)
 * @param {number} lat1 - Latitude ponto 1
 * @param {number} lng1 - Longitude ponto 1
 * @param {number} lat2 - Latitude ponto 2
 * @param {number} lng2 - Longitude ponto 2
 * @returns {number} - Distância em km
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Formata número como moeda brasileira
 * @param {number} value - Valor a formatar
 * @returns {string} - Valor formatado
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Formata número com separadores
 * @param {number} value - Valor a formatar
 * @param {number} decimals - Casas decimais
 * @returns {string} - Valor formatado
 */
function formatNumber(value, decimals = 0) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

/**
 * Debounce para funções
 * @param {Function} func - Função a executar
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function} - Função com debounce
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle para funções
 * @param {Function} func - Função a executar
 * @param {number} limit - Tempo mínimo entre execuções em ms
 * @returns {Function} - Função com throttle
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Gera candidatos de caminho para logos com base na configuração e no nome da rede
 * @param {string} rede
 * @returns {string[]} lista de URLs relativas
 */
function buildLogoCandidates(rede, logoFilename) {
    const path = (mapConfig && mapConfig.logos && mapConfig.logos.path) ? mapConfig.logos.path : 'images/logos/';
    const logoMap = (mapConfig && mapConfig.logos && mapConfig.logos.networks) ? mapConfig.logos.networks : {};
    const candidates = [];

    // Se foi fornecido um nome de arquivo explícito na planilha (coluna P), tentar apenas variantes dele
    // Quando a planilha informa um arquivo explicito, priorizamos
    // variacoes dele antes de cair no mapeamento por rede.
    if (logoFilename) {
        const lfRaw = logoFilename.toString().trim();
        if (lfRaw) {
            // separar extensão se existir
            const m = lfRaw.match(/^(.*)\.([a-zA-Z0-9]+)$/);
            const base = m ? m[1] : lfRaw;
            const ext = m ? m[2] : '';

            // normalizações: removendo acentos, variando espaços/underscores/hyphens, lower-case
            const normalize = (s) => s
                .normalize('NFD').replace(/\p{Diacritic}/gu, '') // remover acentos
                .replace(/[^\w\s-\.]/g, '') // remover caracteres estranhos
                .trim();

            const baseNorm = normalize(base);
            const variants = new Set();
            variants.add(base);
            variants.add(baseNorm);
            variants.add(baseNorm.toLowerCase());
            variants.add(baseNorm.toLowerCase().replace(/\s+/g, '_'));
            variants.add(baseNorm.toLowerCase().replace(/\s+/g, '-'));
            variants.add(baseNorm.toLowerCase().replace(/\s+/g, ''));

            // incluir com e sem extensão; limitar número de variantes para evitar muitas requisições
            let count = 0;
            for (const v of variants) {
                if (count >= 6) break;
                if (ext) {
                    candidates.push(path + v + '.' + ext);
                    count++;
                }
                if (count >= 6) break;
                candidates.push(path + v + '.png');
                count++;
                if (count >= 6) break;
                candidates.push(path + v + '.jpg');
                count++;
            }
            // Quando a coluna `logo` existir, não adicionar candidatos baseados em `rede` — assume explicit
            const final = candidates.filter(Boolean);
            return final;
        }
    }

    if (rede) {
        // Tentar chave exata do mapa de logos (caso o config contenha o mapeamento)
        if (logoMap[rede]) candidates.push(path + logoMap[rede]);
        // Versões normais do nome
        const redeNorm = rede.toString().trim();
        candidates.push(path + redeNorm + '.png');
        candidates.push(path + redeNorm.toLowerCase().replace(/\s+/g, '_') + '.png');
        candidates.push(path + redeNorm.toLowerCase().replace(/\s+/g, '-') + '.png');
        candidates.push(path + redeNorm.toLowerCase().replace(/\s+/g, '') + '.png');
    }

    // Fallbacks conhecidos presentes no repositório
    candidates.push(path + 'bh.png');
    candidates.push(path + 'martins.png');
    return candidates.filter(Boolean);
}

/**
 * Retorna o primeiro candidato de logo (não verifica existência — browser fará o carregamento)
 * @param {string} rede
 * @returns {string}
 */
function getLogoSrc(rede, logoFilename) {
    const c = buildLogoCandidates(rede, logoFilename);
    return c.length ? c[0] : 'images/logos/bh.png';
}

/**
 * Handler para erro de carregamento de imagem: tenta próximos candidatos antes de esconder
 * @param {HTMLImageElement} img
 * @param {string} rede
 */
function handleLogoError(img, rede) {
    try {
        img.onerror = null;
        // Se o elemento img tiver um atributo data-logo, passá-lo adiante
        const logoFilename = img && img.dataset ? img.dataset.logo : null;
        const candidates = buildLogoCandidates(rede, logoFilename);
        const current = img.src || '';
        // controlar tentativas via data-attempts para evitar loop infinito/requests em massa
        const attempts = parseInt(img.dataset.attempts || '0', 10);
        let idx = candidates.findIndex(c => current.indexOf(c) !== -1);
        if (idx === -1) idx = 0; else idx = idx + 1;

        // se já tentou muitas vezes, abortar e mostrar fallback
        if (attempts >= 3 || idx >= candidates.length) {
            img.style.display = 'none';
            try {
                const fallback = img.parentElement ? img.parentElement.querySelector('.marker-initials') : null;
                if (fallback) {
                    fallback.style.display = 'flex';
                }
            } catch (e) {
                // ignore
            }
            return;
        }

        // tentar próximo candidato
        img.dataset.attempts = String(attempts + 1);
        img.src = candidates[idx];
        img.onerror = function() { handleLogoError(this, rede); };
    } catch (e) {
        img.style.display = 'none';
    }
}

/**
 * Armazena dados no localStorage
 * @param {string} key - Chave
 * @param {*} value - Valor
 */
function setCache(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify({
            data: value,
            timestamp: Date.now()
        }));
    } catch (error) {
        console.warn('Erro ao salvar no cache:', error);
    }
}

/**
 * Recupera dados do localStorage
 * @param {string} key - Chave
 * @param {number} maxAge - Idade máxima em ms (0 = sem limite)
 * @returns {*} - Valor armazenado ou null
 */
function getCache(key, maxAge = 0) {
    try {
        const item = localStorage.getItem(key);
        if (!item) return null;

        const cached = JSON.parse(item);

        if (maxAge > 0) {
            const age = Date.now() - cached.timestamp;
            if (age > maxAge) {
                localStorage.removeItem(key);
                return null;
            }
        }

        return cached.data;
    } catch (error) {
        console.warn('Erro ao ler cache:', error);
        return null;
    }
}

/**
 * Limpa cache
 * @param {string} key - Chave (opcional, limpa tudo se não informado)
 */
function clearCache(key) {
    try {
        if (key) {
            localStorage.removeItem(key);
        } else {
            localStorage.clear();
        }
    } catch (error) {
        console.warn('Erro ao limpar cache:', error);
    }
}

/**
 * Log com timestamp
 * @param {string} message - Mensagem
 * @param {string} type - Tipo: 'log', 'warn', 'error'
 */
function log(message, type = 'log') {
    const timestamp = formatTime(new Date());
    const prefix = `[${timestamp}]`;

    if (type === 'error') {
        console.error(prefix, message);
    } else if (type === 'warn') {
        console.warn(prefix, message);
    } else {
        console.log(prefix, message);
    }
}

/**
 * Obtém label do status para exibição
 * @param {string} status - Status normalizado
 * @returns {string} - Label para exibição
 */
function getStatusLabel(status) {
    const labels = {
        'verde': 'Faturamento Recente',
        'laranja': 'Faturamento Intermediário',
        'vermelho': 'Sem Faturamento',
        'cinza': 'Status Desconhecido',
        'roxa': 'Roxa Atendidas Por Terceiros'
    };

    return labels[status] || 'Desconhecido';
}

console.log('✓ utils-fixed.js carregado com sucesso');
