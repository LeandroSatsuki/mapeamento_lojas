/**
 * ============================================
 * CARREGADOR DE DADOS V2 - GOOGLE SHEETS (CORRIGIDO)
 * ============================================
 * Carrega e processa dados da planilha Google Sheets
 * Versão corrigida com suporte a múltiplos formatos
 */

let lojas = [];
let lastUpdateTime = null;

/**
 * Carrega dados da Google Sheets com tratamento de erros
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

        // Tentar carregar do Google Sheets
        let data = null;

        try {
            // Tentar primeiro com CSV
            data = await loadCSVFromSheets();
        } catch (error) {
            log('CSV falhou, tentando alternativa...', 'warn');
            // Se CSV falhar, tentar com JSON
            try {
                data = await loadJSONFromSheets();
            } catch (error2) {
                log('JSON falhou, tentando dados de teste...', 'warn');
                // Se tudo falhar, usar dados de teste
                data = getTestData();
            }
        }

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
        showStatus('Erro ao carregar dados. Usando dados de teste.', 'error', 5000);
        
        // Usar dados de teste como fallback
        lojas = getTestData();
        return lojas;
    }
}

/**
 * Carrega dados em formato CSV
 * @returns {Promise<Array>} - Array de dados
 */
async function loadCSVFromSheets() {
    const csvUrl = mapConfig.googleSheets.csvUrl;
    
    if (!csvUrl) {
        throw new Error('URL da planilha não configurada');
    }

    log(`Carregando CSV de: ${csvUrl}`, 'log');

    const response = await fetch(csvUrl);
    
    if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
    }

    const text = await response.text();

    if (!text || text.trim().length === 0) {
        throw new Error('CSV vazio recebido');
    }

    // Parsear CSV
    const data = parseCSV(text);
    
    if (!data || data.length === 0) {
        throw new Error('Nenhum dado encontrado no CSV');
    }

    log(`CSV carregado com ${data.length} registros`, 'log');
    return data;
}

/**
 * Carrega dados em formato JSON
 * @returns {Promise<Array>} - Array de dados
 */
async function loadJSONFromSheets() {
    const jsonUrl = mapConfig.googleSheets.jsonUrl;
    
    if (!jsonUrl) {
        throw new Error('URL JSON não configurada');
    }

    log(`Carregando JSON de: ${jsonUrl}`, 'log');

    const response = await fetch(jsonUrl);
    
    if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
        throw new Error('JSON inválido ou vazio');
    }

    log(`JSON carregado com ${data.length} registros`, 'log');
    return data;
}

/**
 * Parseia dados CSV manualmente
 * @param {string} csv - Texto CSV
 * @returns {Array} - Array de objetos
 */
function parseCSV(csv) {
    const lines = csv.trim().split('\n');
    
    if (lines.length < 2) {
        return [];
    }

    // Primeira linha são os headers
    const headers = parseCSVLine(lines[0]);
    
    // Processar dados
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        
        if (values.length === 0) continue;

        const row = {};
        
        for (let j = 0; j < headers.length; j++) {
            row[headers[j]] = values[j] || '';
        }

        data.push(row);
    }

    return data;
}

/**
 * Parseia uma linha CSV considerando aspas
 * @param {string} line - Linha CSV
 * @returns {Array} - Array de valores
 */
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

/**
 * Processa dados brutos da planilha
 * @param {Array} rawData - Dados brutos
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

    rawData.forEach((row, index) => {
        try {
            // Normalizar nomes de colunas (remover espaços extras)
            const normalizedRow = {};
            for (const [key, value] of Object.entries(row)) {
                normalizedRow[key.trim()] = value;
            }

            const loja = {
                // Identificação
                id: normalizedRow['Código'] || String(index + 1),
                cnpj: normalizedRow['CNPJ'] || '',
                nomeFantasia: normalizedRow['Nome Fantasia'] || 'Sem nome',
                rede: extractRede(normalizedRow['Nome Fantasia'] || ''),

                // Status
                statusCor: normalizeStatus(normalizedRow['Status de Cor'] || ''),
                supervisor: normalizedRow['Supervisor'] || '',

                // Localização
                cep: normalizedRow['CEP'] || '',
                logradouro: normalizedRow['Logradouro'] || '',
                numero: normalizedRow['Número'] || '',
                bairro: normalizedRow['Bairro'] || '',
                cidade: normalizedRow['Cidade'] || '',
                uf: normalizedRow['UF'] || '',
                regiao: normalizedRow['Região'] || '',

                // Coordenadas
                latitude: parseFloat(normalizedRow['Latitude']) || null,
                longitude: parseFloat(normalizedRow['Longitude']) || null
            };

            // Validar coordenadas
            if (!isValidCoordinates(loja.latitude, loja.longitude)) {
                log(`Loja ${loja.id} com coordenadas inválidas (${loja.latitude}, ${loja.longitude})`, 'warn');
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
 * Retorna dados de teste para demonstração
 * @returns {Array} - Array de lojas de teste
 */
function getTestData() {
    log('Usando dados de TESTE para demonstração', 'warn');
    
    return [
        {
            'Código': '1',
            'CNPJ': '03.845.717/0055-15',
            'Status de Cor': 'Verde',
            'Nome Fantasia': 'ATACADO VEM - ALTO LAIA',
            'Supervisor': 'João Silva',
            'CEP': '30130-100',
            'Logradouro': 'Avenida Getúlio Vargas',
            'Número': '1000',
            'Bairro': 'Funcionários',
            'Cidade': 'Belo Horizonte',
            'UF': 'MG',
            'Região': 'Sudeste',
            'Latitude': '-19.9191',
            'Longitude': '-43.9386'
        },
        {
            'Código': '2',
            'CNPJ': '45.543.915/0281-91',
            'Status de Cor': 'Verde',
            'Nome Fantasia': 'CARREFOUR - ALPHAVILLE',
            'Supervisor': 'Maria Santos',
            'CEP': '06454-000',
            'Logradouro': 'Avenida Alphaville',
            'Número': '500',
            'Bairro': 'Alphaville',
            'Cidade': 'Barueri',
            'UF': 'SP',
            'Região': 'Sudeste',
            'Latitude': '-23.5505',
            'Longitude': '-46.8388'
        },
        {
            'Código': '3',
            'CNPJ': '45.543.915/0050-60',
            'Status de Cor': 'Laranja',
            'Nome Fantasia': 'CARREFOUR - ANALIA FRANCO',
            'Supervisor': 'Pedro Costa',
            'CEP': '03187-000',
            'Logradouro': 'Avenida Analia Franco',
            'Número': '1500',
            'Bairro': 'Tatuapé',
            'Cidade': 'São Paulo',
            'UF': 'SP',
            'Região': 'Sudeste',
            'Latitude': '-23.5100',
            'Longitude': '-46.5400'
        },
        {
            'Código': '4',
            'CNPJ': '59.427.302/0065-58',
            'Status de Cor': 'Vermelho',
            'Nome Fantasia': 'CARREFOUR - CAMBUI',
            'Supervisor': 'Ana Paula',
            'CEP': '30140-071',
            'Logradouro': 'Avenida Getúlio Vargas',
            'Número': '2000',
            'Bairro': 'Funcionários',
            'Cidade': 'Belo Horizonte',
            'UF': 'MG',
            'Região': 'Sudeste',
            'Latitude': '-19.9250',
            'Longitude': '-43.9300'
        }
    ];
}

/**
 * Extrai nome da rede do nome fantasia
 * @param {string} nomeFantasia - Nome fantasia da loja
 * @returns {string} - Nome da rede
 */
function extractRede(nomeFantasia) {
    if (!nomeFantasia) return 'Desconhecida';

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
 * @param {string} status - Status
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
        stats.porStatus[loja.statusCor]++;

        if (!stats.porRegiao[loja.regiao]) {
            stats.porRegiao[loja.regiao] = 0;
        }
        stats.porRegiao[loja.regiao]++;

        if (!stats.porRede[loja.rede]) {
            stats.porRede[loja.rede] = 0;
        }
        stats.porRede[loja.rede]++;

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

console.log('✓ data-loader-v2.js carregado com sucesso');
