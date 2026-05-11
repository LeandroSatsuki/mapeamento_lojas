/**
 * ============================================
 * CARREGADOR DE DADOS - GOOGLE SHEETS (V3)
 * ============================================
 * Carrega dados da planilha e os processa
 * VERSÃO CORRIGIDA: Suporte a vírgula como separador decimal
 */

let lojas = [];
let lastUpdate = null;

/**
 * Carrega dados das lojas
 */
async function loadLojas() {
    try {
        log('Iniciando carregamento de dados...', 'log');
        showLoadingSpinner();

        // Tentar carregar do cache primeiro
        const cached = getCache('lojas_data', 3600000); // 1 hora
        if (cached) {
            log('Dados carregados do cache', 'log');
            lojas = cached;
            lastUpdate = getCache('lojas_lastupdate');
            hideLoadingSpinner();
            return lojas;
        }

        // Carregar configurações
        if (!mapConfig) {
            await loadMapConfig();
        }

        // Tentar carregar da Google Sheets
        let data = await loadFromGoogleSheets();

        // Se falhar, usar dados de teste
        if (!data || data.length === 0) {
            log('Usando dados de teste', 'warn');
            data = getTestData();
        }

        // Processar dados
        lojas = processLojas(data);

        // Salvar no cache
        lastUpdate = new Date();
        setCache('lojas_data', lojas);
        setCache('lojas_lastupdate', lastUpdate);

        log(`${lojas.length} lojas carregadas com sucesso`, 'log');
        hideLoadingSpinner();

        return lojas;

    } catch (error) {
        log('Erro ao carregar lojas: ' + error.message, 'error');
        hideLoadingSpinner();
        throw error;
    }
}

/**
 * Carrega dados da Google Sheets
 */
async function loadFromGoogleSheets() {
    try {
        if (!mapConfig || !mapConfig.googleSheets) {
            throw new Error('Configuração de Google Sheets não encontrada');
        }

        const csvUrl = mapConfig.googleSheets.csvUrl;
        if (!csvUrl) {
            throw new Error('URL do CSV não configurada');
        }

        log(`Carregando dados de: ${csvUrl}`, 'log');

        const response = await fetch(csvUrl);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const text = await response.text();
        if (!text || text.trim().length === 0) {
            throw new Error('Resposta vazia da Google Sheets');
        }

        const data = parseCSV(text);
        log(`${data.length} linhas carregadas do CSV`, 'log');

        return data;

    } catch (error) {
        log('Erro ao carregar de Google Sheets: ' + error.message, 'warn');
        return [];
    }
}

/**
 * Faz parsing de CSV
 * @param {string} csvText - Texto em formato CSV
 * @returns {Array} - Array de objetos
 */
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) {
        log('CSV vazio', 'warn');
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

    log(`${data.length} linhas processadas do CSV`, 'log');
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
 * Processa dados brutos da planilha
 * CORRIGIDO: Suporte a vírgula como separador decimal
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

            // CORRIGIDO: Converter vírgula para ponto nas coordenadas
            let latitude = normalizedRow['Latitude'] || '';
            let longitude = normalizedRow['Longitude'] || '';

            // Substituir vírgula por ponto
            latitude = latitude.toString().replace(',', '.');
            longitude = longitude.toString().replace(',', '.');

            // Converter para float
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);

            log(`Loja ${index + 1}: Latitude original="${normalizedRow['Latitude']}" → Convertida=${lat}`, 'log');
            log(`Loja ${index + 1}: Longitude original="${normalizedRow['Longitude']}" → Convertida=${lng}`, 'log');

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

                // Coordenadas (CORRIGIDO)
                latitude: lat,
                longitude: lng
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
 * Extrai nome da rede do nome fantasia
 * @param {string} nomeFantasia - Nome fantasia da loja
 * @returns {string} - Nome da rede
 */
function extractRede(nomeFantasia) {
    if (!nomeFantasia) return '';

    const redes = [
        'ATACADO VEM',
        'CARREFOUR',
        'SAMS',
        'MARTINS',
        'SENDAS',
        'LOJA'
    ];

    for (const rede of redes) {
        if (nomeFantasia.toUpperCase().includes(rede)) {
            return rede;
        }
    }

    return nomeFantasia.split('-')[0].trim();
}

/**
 * Dados de teste
 * @returns {Array} - Array de lojas de teste
 */
function getTestData() {
    return [
        {
            'Código': '1',
            'CNPJ': '03.845.717/0055-70',
            'Status de Cor': 'Verde',
            'Nome Fantasia': 'ATACADO VEM - ALTO LAIA',
            'Supervisor': 'João Silva',
            'CEP': '30130100',
            'Logradouro': 'Av. Getúlio Vargas',
            'Número': '1000',
            'Bairro': 'Funcionários',
            'Cidade': 'Belo Horizonte',
            'UF': 'MG',
            'Região': 'Sudeste',
            'Latitude': '-19,9191',
            'Longitude': '-43,9386'
        },
        {
            'Código': '2',
            'CNPJ': '45.543.915/0281-01',
            'Status de Cor': 'Laranja',
            'Nome Fantasia': 'CARREFOUR - ALPHAVILLE',
            'Supervisor': 'Maria Santos',
            'CEP': '06454000',
            'Logradouro': 'Rua Rubi',
            'Número': '500',
            'Bairro': 'Alphaville',
            'Cidade': 'Barueri',
            'UF': 'SP',
            'Região': 'Sudeste',
            'Latitude': '-23,5505',
            'Longitude': '-46,8388'
        },
        {
            'Código': '3',
            'CNPJ': '45.543.915/0050-91',
            'Status de Cor': 'Vermelho',
            'Nome Fantasia': 'CARREFOUR - ANALIA FRANCO',
            'Supervisor': 'Pedro Costa',
            'CEP': '03187000',
            'Logradouro': 'Av. Analía Franco',
            'Número': '1000',
            'Bairro': 'Tatuapé',
            'Cidade': 'São Paulo',
            'UF': 'SP',
            'Região': 'Sudeste',
            'Latitude': '-23,5505',
            'Longitude': '-46,5388'
        },
        {
            'Código': '4',
            'CNPJ': '59.427.302/0065-91',
            'Status de Cor': 'Cinza',
            'Nome Fantasia': 'SAMS - CENTRO',
            'Supervisor': '',
            'CEP': '01310100',
            'Logradouro': 'Av. Paulista',
            'Número': '1000',
            'Bairro': 'Bela Vista',
            'Cidade': 'São Paulo',
            'UF': 'SP',
            'Região': 'Sudeste',
            'Latitude': '-23,5505',
            'Longitude': '-46,6388'
        }
    ];
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
 * @returns {Object} - Loja ou null
 */
function getLojaById(id) {
    return lojas.find(loja => loja.id === id) || null;
}

/**
 * Filtra lojas por critério
 * @param {Function} predicate - Função de filtro
 * @returns {Array} - Array de lojas filtradas
 */
function filterLojas(predicate) {
    return lojas.filter(predicate);
}

/**
 * Limpa cache de lojas
 */
function clearLojaCache() {
    clearCache('lojas_data');
    clearCache('lojas_lastupdate');
    log('Cache de lojas limpo', 'log');
}

/**
 * Obtém última atualização
 * @returns {Date} - Data da última atualização
 */
function getLastUpdate() {
    return lastUpdate;
}

console.log('✓ data-loader-v3.js carregado com sucesso');
