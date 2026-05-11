# 📍 Mapa Interativo de Lojas - Preferenza

## 🎯 Visão Geral

Aplicação web interativa que visualiza geograficamente todas as lojas da Preferenza em um mapa, permitindo análise de faturamento, cobertura operacional e tomada de decisão rápida.

**Versão:** 1.0.0  
**Última Atualização:** 27 de Janeiro de 2026

---

## ✨ Funcionalidades

### ✅ Implementadas

- **Mapa Interativo** com Leaflet.js
- **Marcadores Customizados** com logos das redes
- **Clusterização de Marcadores** para otimizar performance
- **Popups com Informações Detalhadas** ao clicar em marcadores
- **Botão de Atualização Manual** com indicadores visuais
- **Legenda com Estatísticas** em tempo real
- **Responsividade** para mobile, tablet e desktop
- **Cache de Dados** para melhor performance
- **Atalhos de Teclado** para funções rápidas
- **Exportação de Dados** em CSV

### 🔮 Futuras

- Filtros por região, rede e status
- Dashboard com gráficos
- Integração com Sankhya Cloud
- Controle de acesso por perfil
- Histórico de faturamento

---

## 📋 Estrutura de Pastas

```
mapa-lojas-preferenza/
├── index.html                    # Arquivo principal
├── README.md                     # Este arquivo
├── LICENSE                       # Licença
│
├── css/
│   ├── style.css                 # Estilos principais
│   └── responsive.css            # Estilos responsivos
│
├── js/
│   ├── main.js                   # Orquestração principal
│   ├── map-config.js             # Configuração do mapa
│   ├── data-loader-v5.js         # Carregamento de dados
│   ├── marker-manager-gota-v2.js # Gerenciamento de marcadores
│   ├── popup-handler.js          # Tratamento de popups
│   ├── cluster-manager.js        # Clusterização
│   ├── filter-manager-fixed.js   # Filtros
│   ├── filters-init-fixed.js     # Inicialização dos filtros
│   ├── legend-manager.js         # Legenda interativa
│   └── utils-fixed.js            # Funções utilitárias
│
├── data/
│   └── config.json               # Configurações da aplicação
│
├── images/
│   ├── logos/                    # Logos das redes (28x28px)
│   └── icons/                    # Ícones do aplicativo
│
└── docs/
    ├── GUIA_DESENVOLVIMENTO.md   # Guia para desenvolvedores
    ├── ESTRUTURA_DADOS.md        # Documentação de dados
    └── TROUBLESHOOTING.md        # Solução de problemas
```

---

## 🚀 Como Usar

### Instalação

1. **Download dos Arquivos**
   ```bash
   # Clonar ou baixar o repositório
   git clone <url-do-repositorio>
   cd mapa-lojas-preferenza
   ```

2. **Upload para Servidor**
   - Conectar via FTP/SFTP ao servidor Locaweb
   - Fazer upload de todos os arquivos mantendo a estrutura de pastas
   - Exemplo de caminho: `/public_html/mapa-lojas/`

3. **Acessar a Aplicação**
   - Abrir navegador em: `https://seu-dominio.com/mapa-lojas/`

### Uso Básico

1. **Visualizar Mapa**
   - Ao abrir, o mapa carrega automaticamente com todas as lojas
   - Use zoom (+/-) para aproximar/afastar
   - Arraste para navegar pelo mapa

2. **Clicar em Marcador**
   - Clique em qualquer marcador para ver informações detalhadas
   - Popup exibe: Nome, CNPJ, Endereço, Supervisor, Status

3. **Atualizar Dados**
   - Clique no botão "🔄 Atualizar dados"
   - Aguarde o carregamento
   - Mensagem de sucesso/erro será exibida

4. **Atalhos de Teclado**
   - `Ctrl+R`: Recarregar dados
   - `Ctrl+E`: Exportar para CSV
   - `Ctrl+S`: Mostrar estatísticas
   - `Ctrl+I`: Informações do app

---

## 🎨 Paleta de Cores

| Status | Cor | Hex | Significado |
|--------|-----|-----|-------------|
| Verde | Verde Escuro | `#228B22` | Faturamento Recente |
| Laranja | Laranja | `#FF8C00` | Faturamento Intermediário |
| Vermelho | Vermelho | `#DC143C` | Sem Faturamento |
| Cinza | Cinza | `#808080` | Status Desconhecido |

---

## 📊 Estrutura de Dados

### Colunas da Planilha Google Sheets

| Coluna | Nome | Tipo | Descrição |
|--------|------|------|-----------|
| A | Código | Sequencial | ID único da loja |
| B | CNPJ | Texto | CNPJ da loja |
| C | Status de Cor | Texto | Verde / Laranja / Vermelho |
| D | Nome Fantasia | Texto | Nome comercial |
| E | Supervisor | Texto | Vendedor responsável |
| F | CEP | Texto | CEP da loja |
| G | Logradouro | Texto | Endereço completo |
| H | Número | Texto | Número do endereço |
| I | Bairro | Texto | Bairro |
| J | Cidade | Texto | Cidade |
| K | UF | Texto | Estado (SP, RJ, etc.) |
| L | Latitude | Número | Coordenada para mapa |
| M | Longitude | Número | Coordenada para mapa |
| N | Região | Texto | Região interna |

---

## ⚙️ Configuração

### Arquivo `data/config.json`

Edite este arquivo para customizar a aplicação:

```json
{
  "map": {
    "center": [-14.2350, -51.9253],    // Centro do mapa (Brasil)
    "initialZoom": 4,                   // Zoom inicial
    "minZoom": 3,                       // Zoom mínimo
    "maxZoom": 18                       // Zoom máximo
  },
  "googleSheets": {
    "csvUrl": "https://...",            // URL da planilha
    "updateInterval": 300000            // Intervalo de atualização (ms)
  },
  "cluster": {
    "enabled": true,                    // Ativar clusterização
    "maxClusterRadius": 80,             // Raio do cluster (px)
    "disableClusteringAtZoom": 16       // Desativar cluster em zoom
  }
}
```

---

## 🔧 Desenvolvimento

### Adicionar Nova Funcionalidade

1. **Editar arquivo apropriado** em `js/`
2. **Adicionar função** com documentação JSDoc
3. **Testar** no navegador
4. **Fazer commit** com mensagem clara

### Estrutura de Módulos

```
main.js (orquestrador)
  ├── map-config.js (mapa)
  ├── data-loader-v5.js (dados)
  ├── marker-manager-gota-v2.js (marcadores)
  ├── popup-handler.js (popups)
  ├── cluster-manager.js (clusters)
  ├── filter-manager-fixed.js (filtros)
  ├── filters-init-fixed.js (bootstrap dos filtros)
  ├── legend-manager.js (legenda)
  └── utils-fixed.js (utilitários)
```

### Adicionando Novo Logo

1. Redimensionar logo para 28x28 pixels
2. Salvar em `images/logos/` com nome em minúsculas
3. Adicionar mapeamento em `data/config.json`

```json
"networks": {
  "NOVA_REDE": "nova-rede.png"
}
```

---

## 🐛 Troubleshooting

### Mapa não carrega

1. Verificar console do navegador (F12)
2. Verificar se URL da Google Sheets está correta
3. Verificar se planilha está pública
4. Limpar cache do navegador (Ctrl+Shift+Delete)

### Marcadores não aparecem

1. Verificar se coordenadas (latitude/longitude) são válidas
2. Verificar se há dados na planilha
3. Verificar se status de cor está correto
4. Clicar em "Atualizar dados"

### Performance lenta

1. Verificar número de lojas (muito grande?)
2. Verificar zoom do mapa
3. Limpar cache (Ctrl+R)
4. Desabilitar clusterização em `config.json`

### Logos não aparecem

1. Verificar se arquivos estão em `images/logos/`
2. Verificar nomes em `config.json`
3. Verificar permissões de arquivo (755)
4. Verificar console do navegador

---

## 📱 Responsividade

### Breakpoints

| Dispositivo | Largura | Comportamento |
|-------------|---------|---------------|
| Mobile | < 480px | Layout vertical, legenda em abas |
| Mobile | 480-768px | Layout adaptado |
| Tablet | 768-1024px | Layout intermediário |
| Desktop | > 1024px | Layout completo |

---

## 🔐 Segurança

- ✅ Sem credenciais expostas
- ✅ Dados públicos apenas
- ✅ Validação de entrada
- ✅ Sanitização de HTML
- ✅ CORS habilitado no Google Sheets

---

## 📞 Suporte

### Documentação Adicional

- `docs/GUIA_DESENVOLVIMENTO.md` - Guia para desenvolvedores
- `docs/ESTRUTURA_DADOS.md` - Documentação de dados
- `docs/TROUBLESHOOTING.md` - Solução de problemas

### Contato

Para dúvidas ou sugestões, entre em contato com a equipe de desenvolvimento.

---

## 📄 Licença

Este projeto é propriedade da Preferenza. Todos os direitos reservados.

---

## 🎉 Créditos

- **Desenvolvido por:** Manus
- **Data:** 27 de Janeiro de 2026
- **Tecnologias:** HTML5, CSS3, JavaScript, Leaflet.js, Google Sheets

---

## 📝 Changelog

### v1.0.0 (27/01/2026)
- ✅ Versão inicial
- ✅ Mapa com Leaflet
- ✅ Marcadores customizados
- ✅ Clusterização
- ✅ Popups
- ✅ Atualização manual
- ✅ Responsividade
- ✅ Cache de dados

---

**Última Atualização:** 27 de Janeiro de 2026
