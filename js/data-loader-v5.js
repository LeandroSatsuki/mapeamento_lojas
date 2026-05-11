/**
 * ============================================
 * CARREGADOR DE DADOS - GOOGLE SHEETS (V5)
 * ============================================
 * Carrega dados da planilha e os processa
 * VERSÃO CORRIGIDA: Parser CSV que respeita vírgulas decimais
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

        // O cache reduz chamadas repetidas para a planilha e acelera
        // a abertura do mapa em acessos frequentes.
        // Tentar carregar do cache primeiro
        const cached = getCache('lojas_data', 3600000); // 1 hora
        if (cached && cached.length > 0) {
            log(`Dados carregados do cache (${cached.length} lojas)`, 'log');
            console.log('DEBUG: carregando lojas do cache, desative o cache com `localStorage.removeItem("lojas_data")` para forçar reprocessamento.');
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
        let data = [];
        try {
            data = await loadFromGoogleSheets();
            if (data && data.length > 0) {
                log(`${data.length} linhas carregadas da Google Sheets`, 'log');
            }
        } catch (error) {
            log(`Erro ao carregar de Google Sheets: ${error.message}`, 'warn');
            log('Tentando usar dados de teste...', 'warn');
            data = getTestData();
        }

        // Se ainda não tiver dados, usar dados de teste
        if (!data || data.length === 0) {
            log('Nenhum dado obtido. Usando dados de teste.', 'warn');
            data = getTestData();
        }

        // Processar dados
        lojas = processLojas(data);

        if (lojas.length === 0) {
            log('AVISO: Nenhuma loja válida foi carregada!', 'error');
            throw new Error('Nenhuma loja válida foi carregada');
        }

        // Salvar no cache
        lastUpdate = new Date();
        setCache('lojas_data', lojas);
        setCache('lojas_lastupdate', lastUpdate);

        log(`✓ ${lojas.length} lojas carregadas com sucesso`, 'log');
        hideLoadingSpinner();

        return lojas;

    } catch (error) {
        log('Erro ao carregar lojas: ' + error.message, 'error');
        hideLoadingSpinner();

        // Último recurso: usar dados de teste
        log('Usando dados de teste como fallback...', 'warn');
        lojas = processLojas(getTestData());

        return lojas;
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

        const response = await fetch(csvUrl, {
            method: 'GET',
            headers: {
                'Accept': 'text/csv'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
        }

        const text = await response.text();
        if (!text || text.trim().length === 0) {
            throw new Error('Resposta vazia da Google Sheets');
        }

        // Verificar se é HTML (erro da Google)
        if (text.includes('<!DOCTYPE') || text.includes('<html')) {
            throw new Error('Google Sheets retornou HTML em vez de CSV. Verifique se a planilha é pública.');
        }

        const data = parseCSV(text);
        if (!data || data.length === 0) {
            throw new Error('CSV vazio ou inválido');
        }

        log(`✓ ${data.length} linhas carregadas do CSV`, 'log');
        return data;

    } catch (error) {
        log('Erro ao carregar de Google Sheets: ' + error.message, 'warn');
        return [];
    }
}

/**
 * Faz parsing de CSV
 * CORRIGIDO: Respeita vírgulas decimais em coordenadas
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
    const headers = parseCSVLine(lines[0]);
    const data = [];

    log(`Headers encontrados: ${headers.join(', ')}`, 'log');

    // Preserva o pareamento entre headers e valores mesmo quando
    // a linha vier com colunas vazias no meio do CSV.
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

    log(`✓ ${data.length} linhas processadas do CSV`, 'log');
    return data;
}

/**
 * Faz parsing de uma linha CSV respeitando aspas e vírgulas decimais
 * CORRIGIDO: Detecta quando vírgula é decimal vs separador
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
        const prevChar = i > 0 ? line[i - 1] : '';

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                // Aspas escapadas
                current += '"';
                i++;
            } else {
                // Abre ou fecha aspas
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            // CORRIGIDO: Verificar se é vírgula decimal ou separador
            const isDecimalComma = isDecimalSeparator(current, line, i);

            if (isDecimalComma) {
                // É vírgula decimal, mantém no valor
                current += char;
            } else {
                // É separador de coluna
                values.push(current.trim());
                current = '';
            }
        } else {
            current += char;
        }
    }

    values.push(current.trim());
    return values;
}

/**
 * Detecta se uma vírgula é separador decimal ou separador de coluna
 * NOVO: Função auxiliar para resolver conflito de vírgulas
 * @param {string} currentValue - Valor atual sendo processado
 * @param {string} line - Linha completa
 * @param {number} commaIndex - Índice da vírgula
 * @returns {boolean} - true se é decimal, false se é separador
 */
function isDecimalSeparator(currentValue, line, commaIndex) {
    // A planilha mistura virgula decimal com virgula separadora.
    // Esta heuristica evita quebrar latitude/longitude em colunas extras.
    // Se o valor atual contém apenas números, é provável que seja decimal
    if (!/^\s*-?\d+$/.test(currentValue.trim())) {
        return false;
    }

    // Verificar o próximo caractere
    const nextChar = line[commaIndex + 1];

    // Se próximo é dígito, é provavelmente decimal
    if (/\d/.test(nextChar)) {
        // Verificar se há mais dígitos após a vírgula
        let digitCount = 0;
        for (let i = commaIndex + 1; i < line.length && /\d/.test(line[i]); i++) {
            digitCount++;
        }

        // Se tem 3-5 dígitos após vírgula, é coordenada (latitude/longitude)
        if (digitCount >= 3 && digitCount <= 5) {
            return true;
        }
    }

    return false;
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
    const invalidReasons = { coords: 0, incomplete: 0, parseError: 0 };
    const invalidSamples = [];

    // Detectar campo de logo (coluna P). Procurar header com palavras-chave ou usar a 16ª coluna se necessário
    const rawHeaders = Object.keys(rawData[0] || {});
    const trimmedHeaders = rawHeaders.map(h => h.trim());
    console.log('CSV headers (raw):', rawHeaders);
    console.log('CSV headers (trimmed):', trimmedHeaders);
    let logoHeader = null;
    for (const h of trimmedHeaders) {
        if (/logo|logomarca|imagem|image|nome.*logo/i.test(h)) {
            logoHeader = h;
            break;
        }
    }
    if (logoHeader === null && trimmedHeaders.length >= 16) {
        logoHeader = trimmedHeaders[15]; // coluna P
    }
    console.log('Logo header detectado (coluna P candidate):', JSON.stringify(logoHeader));

    rawData.forEach((row, index) => {
        try {
            // Normalizar os headers simplifica compatibilidade com pequenas
            // variacoes vindas da planilha sem espalhar condicionais.
            // Normalizar nomes de colunas (remover espaços extras) e criar versão com chaves em minúsculas
            const normalizedRow = {};
            const normalizedLower = {};
            for (const [key, value] of Object.entries(row)) {
                const kTrim = key.trim();
                normalizedRow[kTrim] = value;
                normalizedLower[kTrim.toLowerCase()] = value;
            }

            // Obter coordenadas (já vêm com vírgula decimal preservada)
            let latitude = normalizedRow['Latitude'] || '';
            let longitude = normalizedRow['Longitude'] || '';

            // Converter para float (vírgula já foi preservada no parser)
            const lat = parseFloat(latitude.toString().replace(',', '.'));
            const lng = parseFloat(longitude.toString().replace(',', '.'));

            log(`Loja ${index + 1}: Latitude original="${latitude}" → ${lat}, Longitude original="${longitude}" → ${lng}`, 'log');

            // DEBUG: Log EXTREMAMENTE detalhado
            console.log('LOJA ' + (index + 1) + ' - TODAS AS COLUNAS:');
            console.log(normalizedRow);
            console.log('Status encontrado:', normalizedRow['Status']);
            console.log('Status de Cor encontrado:', normalizedRow['Status de Cor']);

            // Obter valor bruto da coluna P por nome (caso-insensitivo) ou por índice como fallback
            // A logo pode vir nomeada explicitamente ou cair apenas na
            // coluna P; por isso mantemos os dois caminhos de leitura.
            let logoValue = '';
            if (normalizedLower.hasOwnProperty('logo')) {
                logoValue = normalizedLower['logo'];
            } else if (logoHeader !== null && Object.prototype.hasOwnProperty.call(normalizedRow, logoHeader)) {
                logoValue = normalizedRow[logoHeader];
            }
            if ((!logoValue || logoValue === '') && Object.values(row).length >= 16) {
                try {
                    const vals = Object.values(row);
                    logoValue = vals[15]; // índice 15 = coluna P
                    if (logoValue) {
                        log(`Usando fallback por índice (coluna P) para linha ${index + 1}: ${logoValue}`, 'log');
                    }
                } catch (e) {
                    // ignore
                }
            }

            const loja = {
                // Identificação
                id: normalizedRow['Código'] || String(index + 1),
                cnpj: normalizedRow['CNPJ'] || '',
                nomeFantasia: normalizedRow['Nome Fantasia'] || 'Sem nome',
                rede: extractRede(normalizedRow['Nome Fantasia'] || ''),

                // Status
                statusCor: normalizeStatus(normalizedRow['Status'] || normalizedRow['Status de Cor'] || ''),
                supervisor: normalizedRow['Supervisor'] || '',

                // Localização
                cep: normalizedRow['CEP'] || '',
                logradouro: normalizedRow['Logradouro'] || '',
                numero: normalizedRow['Número'] || '',
                bairro: normalizedRow['Bairro'] || '',
                cidade: normalizedRow['Cidade'] || '',
                uf: normalizedRow['UF'] || '',
                regiao: normalizedRow['Região'] || '',

                // Logo (coluna P se existir) — pode conter nome de arquivo da logo
                logo: logoValue || '',

                // Coordenadas
                latitude: lat,
                longitude: lng
            };
            console.log(`Loja processada [${loja.id}] "${loja.nomeFantasia}" → logo field value:`, loja.logo);

            // Validar coordenadas
            // So mantemos lojas realmente posicionaveis no mapa para evitar
            // marcadores invalidos e clusters inconsistentes.
            if (!isValidCoordinates(loja.latitude, loja.longitude)) {
                log(`Loja ${loja.id} com coordenadas inválidas (${loja.latitude}, ${loja.longitude})`, 'warn');
                invalidCount++;
                invalidReasons.coords++;
                if (invalidSamples.length < 10) invalidSamples.push({ index: index + 1, id: loja.id, nome: loja.nomeFantasia, reason: 'coords', latitude: loja.latitude, longitude: loja.longitude });
                return;
            }

            // Validar dados mínimos
            if (!loja.nomeFantasia || !loja.cidade || !loja.uf) {
                log(`Loja ${loja.id} com dados incompletos`, 'warn');
                invalidCount++;
                invalidReasons.incomplete++;
                if (invalidSamples.length < 10) invalidSamples.push({ index: index + 1, id: loja.id, nome: loja.nomeFantasia, reason: 'incomplete', cidade: loja.cidade, uf: loja.uf });
                return;
            }

            processed.push(loja);
            validCount++;
        } catch (error) {
            log(`Erro ao processar loja na linha ${index + 1}: ${error.message}`, 'warn');
            invalidCount++;
            invalidReasons.parseError++;
            if (invalidSamples.length < 10) invalidSamples.push({ index: index + 1, reason: 'parseError', error: error.message, raw: row });
        }
    });

    log(`Processamento concluído: ${validCount} válidas, ${invalidCount} inválidas`, 'log');
    log(`Motivos: coords=${invalidReasons.coords}, incomplete=${invalidReasons.incomplete}, parseError=${invalidReasons.parseError}`, 'log');
    console.log('Amostra de linhas inválidas (até 10):', invalidSamples);
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
 * Dados de teste - VERSÃO EXPANDIDA
 * @returns {Array} - Array de lojas de teste
 */
function getTestData() {
    return [
        {
            'Código': '1',
            'CNPJ': '03.845.717/0055-70',
            'Status': 'Verde',
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
            'Status': 'Laranja',
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
            'Status': 'Vermelho',
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
            'Status': 'Cinza',
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
        },
        {
            'Código': '5',
            'CNPJ': '11.111.111/0001-01',
            'Status': 'Verde',
            'Nome Fantasia': 'MARTINS - ZONA SUL',
            'Supervisor': 'Carlos Lima',
            'CEP': '04543000',
            'Logradouro': 'Av. Imigrantes',
            'Número': '2000',
            'Bairro': 'Vila Mariana',
            'Cidade': 'São Paulo',
            'UF': 'SP',
            'Região': 'Sudeste',
            'Latitude': '-23,5905',
            'Longitude': '-46,6788'
        }
    ];
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
        const key = typeof normalizeStatus === 'function' ? normalizeStatus(loja.statusCor) : (loja.statusCor || '').toString().toLowerCase();
        if (stats.porStatus[key] === undefined) stats.porStatus[key] = 0;
        stats.porStatus[key]++;

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
 * Atualiza exibição da última atualização
 */
function updateLastUpdateDisplay() {
    const element = document.getElementById('lastUpdate');
    if (element && lastUpdate) {
        element.textContent = formatTime(lastUpdate);
    }

    const totalElement = document.getElementById('totalLojas');
    if (totalElement) {
        // Se houver lojas filtradas, mostrá-las, senão mostra o total base
        const currentCount = (typeof filteredLojas !== 'undefined' && filteredLojas.length > 0 && filteredLojas.length !== lojas.length) ? filteredLojas.length : lojas.length;
        totalElement.textContent = currentCount;
    }
}

/**
 * Obtém última atualização
 * @returns {Date} - Data da última atualização
 */
function getLastUpdate() {
    return lastUpdate;
}

console.log('✓ data-loader-v5.js carregado com sucesso');
