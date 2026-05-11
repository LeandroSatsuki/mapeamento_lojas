/**
 * ============================================
 * CARREGADOR DE DADOS - GOOGLE SHEETS
 * ============================================
 * Carrega e processa dados da planilha Google Sheets
 */

let lojas = [];
let lastUpdateTime = null;

/**
 * Carrega dados da Google Sheets
 * @returns {Promise<Array>} - Array de lojas
 */
async function loadLojas() {
    try {
        showLoadingSpinner();
        log('Iniciando carregamento de dados...', 'log');

        // Verificar cache
        const cached = getCache('lojas_data', 3600000); // 1 hora
        if (cached && cached.length > 0) {
            log('Dados carregados do cache', 'log');
            lojas = cached;
            hideLoadingSpinner();
            return lojas;
        }

        // Carregar do Google Sheets
        const csvUrl = mapConfig.googleSheets.csvUrl;
        const data = await loadCSV(csvUrl);

        // Processar dados
        lojas = processLojas(data);

        // Armazenar em cache
        setCache('lojas_data', lojas);

        // Atualizar timestamp
        lastUpdateTime = new Date();
        updateLastUpdateDisplay();

        log(`${lojas.length} lojas carregadas com sucesso`, 'log');
        hideLoadingSpinner();

        return lojas;
    } catch (error) {
        log('Erro ao carregar dados: ' + error.message, 'error');
        hideLoadingSpinner();
        showStatus('Erro ao carregar dados da planilha', 'error', 5000);
        throw error;
    }
}

/**
 * Processa dados brutos da planilha
 * @param {Array} rawData - Dados brutos do CSV
 * @returns {Array} - Array de lojas processadas
 */
function processLojas(rawData) {
    if (!Array.isArray(rawData) || rawData.length === 0) {
        log('Dados vazios recebidos', 'warn');
        return [];
    }

    const processed = [];
    let validCount = 0;
    let invalidCount = 0;

    // Detectar campo de logo (coluna P). Procurar header com palavras-chave ou usar a 16ª coluna se necessário
    const firstRowKeys = Object.keys(rawData[0] || {});
    let logoField = null;
    for (const k of firstRowKeys) {
        if (/logo|logomarca|imagem|image|nome.*logo/i.test(k)) {
            logoField = k;
            break;
        }
    }
    if (!logoField && firstRowKeys.length >= 16) {
        // coluna P é a 16ª (index 15)
        logoField = firstRowKeys[15];
    }

    rawData.forEach((row, index) => {
        try {
            const loja = {
                // Identificação
                id: row['Código'] || String(index + 1),
                cnpj: row['CNPJ'] || '',
                nomeFantasia: row['Nome Fantasia'] || 'Sem nome',
                rede: extractRede(row['Nome Fantasia'] || ''),

                // Status
                statusCor: normalizeStatus(row['Status de Cor'] || ''),
                supervisor: row['Supervisor'] || '',

                // Localização
                cep: row['CEP'] || '',
                logradouro: row['Logradouro'] || '',
                numero: row['Número'] || '',
                bairro: row['Bairro'] || '',
                cidade: row['Cidade'] || '',
                uf: row['UF'] || '',
                regiao: row['Região'] || '',

                // Logo (coluna P se existir) — pode conter nome de arquivo da logo
                logo: (logoField && row[logoField]) ? row[logoField] : '',

                // Coordenadas
                latitude: parseFloat(row['Latitude']) || null,
                longitude: parseFloat(row['Longitude']) || null
            };

            // Validar coordenadas
            if (!isValidCoordinates(loja.latitude, loja.longitude)) {
                log(`Loja ${loja.id} com coordenadas inválidas`, 'warn');
                invalidCount++;
                return;
            }

            // Validar dados mínimos
            if (!loja.nomeFantasia || !loja.cidade || !loja.uf) {
                log(`Loja ${loja.id} com dados incompletos`, 'warn');
                invalidCount++;
                return;
            }

            processed.push(loja);
            validCount++;
        } catch (error) {
            log(`Erro ao processar loja na linha ${index + 1}: ${error.message}`, 'warn');
            invalidCount++;
        }
    });

    log(`Processamento concluído: ${validCount} válidas, ${invalidCount} inválidas`, 'log');
    return processed;
}

/**
 * Extrai nome da rede do nome fantasia
 * @param {string} nomeFantasia - Nome fantasia da loja
 * @returns {string} - Nome da rede
 */
function extractRede(nomeFantasia) {
    if (!nomeFantasia) return 'Desconhecida';

    // Tentar extrair rede conhecida
    const redes = [
        'ATACADO VEM',
        'CARREFOUR',
        'CASA GRANDE',
        'DMA',
        'EPA',
        'EXTRA BOM',
        'EXTRA PLUS',
        'GERMANS',
        'GRASSI',
        'GUANABARA',
        'MARTINS',
        'MINEIRAO',
        'PERIM',
        'REDE MAIS BRASIL',
        'SAMS',
        'SENDAS',
        'VIANENSE'
    ];

    const upper = nomeFantasia.toUpperCase();
    for (const rede of redes) {
        if (upper.includes(rede)) {
            return rede;
        }
    }

    // Se não encontrar, usar primeira palavra
    const firstWord = nomeFantasia.split(' ')[0];
    return firstWord || 'Desconhecida';
}

/**
 * Obtém todas as lojas
 * @returns {Array} - Array de lojas
 */
function getLojas() {
    return lojas;
}

/**
 * Obtém loja por ID
 * @param {string} id - ID da loja
 * @returns {Object} - Dados da loja ou null
 */
function getLojaById(id) {
    return lojas.find(loja => loja.id === id) || null;
}

/**
 * Filtra lojas por status
 * @param {string} status - Status (verde, laranja, vermelho, cinza)
 * @returns {Array} - Array de lojas filtradas
 */
function getLojasByStatus(status) {
    const normalized = normalizeStatus(status);
    return lojas.filter(loja => loja.statusCor === normalized);
}

/**
 * Filtra lojas por região
 * @param {string} regiao - Região
 * @returns {Array} - Array de lojas filtradas
 */
function getLojasByRegion(regiao) {
    return lojas.filter(loja => loja.regiao.toLowerCase() === regiao.toLowerCase());
}

/**
 * Filtra lojas por rede
 * @param {string} rede - Nome da rede
 * @returns {Array} - Array de lojas filtradas
 */
function getLojasByNetwork(rede) {
    return lojas.filter(loja => loja.rede.toLowerCase() === rede.toLowerCase());
}

/**
 * Filtra lojas por UF
 * @param {string} uf - Unidade Federativa
 * @returns {Array} - Array de lojas filtradas
 */
function getLojasByUF(uf) {
    return lojas.filter(loja => loja.uf.toUpperCase() === uf.toUpperCase());
}

/**
 * Busca lojas por texto
 * @param {string} query - Texto de busca
 * @returns {Array} - Array de lojas encontradas
 */
function searchLojas(query) {
    const q = query.toLowerCase();
    return lojas.filter(loja =>
        loja.nomeFantasia.toLowerCase().includes(q) ||
        loja.cnpj.includes(q) ||
        loja.cidade.toLowerCase().includes(q) ||
        loja.rede.toLowerCase().includes(q)
    );
}

/**
 * Obtém estatísticas das lojas
 * @returns {Object} - Objeto com estatísticas
 */
function getLojaStats() {
    const stats = {
        total: lojas.length,
        porStatus: {
            verde: 0,
            laranja: 0,
            vermelho: 0,
            cinza: 0
        },
        porRegiao: {},
        porRede: {},
        porUF: {}
    };

    lojas.forEach(loja => {
        // Por status
        stats.porStatus[loja.statusCor]++;

        // Por região
        if (!stats.porRegiao[loja.regiao]) {
            stats.porRegiao[loja.regiao] = 0;
        }
        stats.porRegiao[loja.regiao]++;

        // Por rede
        if (!stats.porRede[loja.rede]) {
            stats.porRede[loja.rede] = 0;
        }
        stats.porRede[loja.rede]++;

        // Por UF
        if (!stats.porUF[loja.uf]) {
            stats.porUF[loja.uf] = 0;
        }
        stats.porUF[loja.uf]++;
    });

    return stats;
}

/**
 * Atualiza exibição da última atualização
 */
function updateLastUpdateDisplay() {
    const element = document.getElementById('lastUpdate');
    if (element && lastUpdateTime) {
        element.textContent = formatTime(lastUpdateTime);
    }

    const totalElement = document.getElementById('totalLojas');
    if (totalElement) {
        totalElement.textContent = formatNumber(lojas.length);
    }
}

/**
 * Obtém tempo da última atualização
 * @returns {Date} - Data/hora da última atualização
 */
function getLastUpdateTime() {
    return lastUpdateTime;
}

/**
 * Converte lojas para array de coordenadas
 * @returns {Array} - Array de [lat, lng]
 */
function getCoordinates() {
    return lojas
        .filter(loja => isValidCoordinates(loja.latitude, loja.longitude))
        .map(loja => [loja.latitude, loja.longitude]);
}

/**
 * Limpa dados em cache
 */
function clearLojaCache() {
    clearCache('lojas_data');
    lojas = [];
    lastUpdateTime = null;
    log('Cache de lojas limpo', 'log');
}

console.log('✓ data-loader.js carregado com sucesso');
