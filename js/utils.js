/**
 * ============================================
 * FUNÇÕES UTILITÁRIAS - MAPA INTERATIVO
 * ============================================
 * Arquivo com funções auxiliares reutilizáveis
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
        'cinza': '#808080'
    };

    return colors[status.toLowerCase()] || colors['cinza'];
}

/**
 * Normaliza nome de status
 * @param {string} status - Status original
 * @returns {string} - Status normalizado
 */
function normalizeStatus(status) {
    if (!status) return 'cinza';

    const normalized = status.toLowerCase().trim();

    if (normalized.includes('verde')) return 'verde';
    if (normalized.includes('laranja')) return 'laranja';
    if (normalized.includes('vermelho') || normalized.includes('antigo')) return 'vermelho';

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

console.log('✓ utils.js carregado com sucesso');
