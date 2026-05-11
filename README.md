# ðŸ“ Mapa Interativo de Lojas - Preferenza

## ðŸŽ¯ VisÃ£o Geral

AplicaÃ§Ã£o web interativa que visualiza geograficamente todas as lojas da Preferenza em um mapa, permitindo anÃ¡lise de faturamento, cobertura operacional e tomada de decisÃ£o rÃ¡pida.

**VersÃ£o:** 1.0.0  
**Ãšltima AtualizaÃ§Ã£o:** 27 de Janeiro de 2026

---

## âœ¨ Funcionalidades

### âœ… Implementadas

- **Mapa Interativo** com Leaflet.js
- **Marcadores Customizados** com logos das redes
- **ClusterizaÃ§Ã£o de Marcadores** para otimizar performance
- **Popups com InformaÃ§Ãµes Detalhadas** ao clicar em marcadores
- **BotÃ£o de AtualizaÃ§Ã£o Manual** com indicadores visuais
- **Legenda com EstatÃ­sticas** em tempo real
- **Responsividade** para mobile, tablet e desktop
- **Cache de Dados** para melhor performance
- **Atalhos de Teclado** para funÃ§Ãµes rÃ¡pidas
- **ExportaÃ§Ã£o de Dados** em CSV

### ðŸ”® Futuras

- Filtros por regiÃ£o, rede e status
- Dashboard com grÃ¡ficos
- IntegraÃ§Ã£o com Sankhya Cloud
- Controle de acesso por perfil
- HistÃ³rico de faturamento

---

## ðŸ“‹ Estrutura de Pastas

```
mapa-lojas-preferenza/
â”œâ”€â”€ index.html                    # Arquivo principal
â”œâ”€â”€ README.md                     # Este arquivo
â”œâ”€â”€ LICENSE                       # LicenÃ§a
â”‚
â”œâ”€â”€ css/
â”‚   â”œâ”€â”€ style.css                 # Estilos principais
â”‚   â””â”€â”€ responsive.css            # Estilos responsivos
â”‚
â”œâ”€â”€ js/
â”‚   â”œâ”€â”€ main.js                   # OrquestraÃ§Ã£o principal
â”‚   â”œâ”€â”€ map-config.js             # ConfiguraÃ§Ã£o do mapa
â”‚   â”œâ”€â”€ data-loader-v5.js         # Carregamento de dados
â”‚   â”œâ”€â”€ marker-manager-gota-v2.js # Gerenciamento de marcadores
â”‚   â”œâ”€â”€ popup-handler.js          # Tratamento de popups
â”‚   â”œâ”€â”€ cluster-manager.js        # ClusterizaÃ§Ã£o
â”‚   â”œâ”€â”€ filter-manager-fixed.js   # Filtros
â”‚   â”œâ”€â”€ filters-init-fixed.js     # InicializaÃ§Ã£o dos filtros
â”‚   â”œâ”€â”€ legend-manager.js         # Legenda interativa
â”‚   â””â”€â”€ utils-fixed.js            # FunÃ§Ãµes utilitÃ¡rias
â”‚
â”œâ”€â”€ data/
â”‚   â””â”€â”€ config.json               # ConfiguraÃ§Ãµes da aplicaÃ§Ã£o
â”‚
â”œâ”€â”€ images/
â”‚   â”œâ”€â”€ logos/                    # Logos das redes (28x28px)
â”‚   â””â”€â”€ icons/                    # Ãcones do aplicativo
â”‚
â””â”€â”€ docs/
    â”œâ”€â”€ GUIA_DESENVOLVIMENTO.md   # Guia para desenvolvedores
    â”œâ”€â”€ ESTRUTURA_DADOS.md        # DocumentaÃ§Ã£o de dados
    â””â”€â”€ TROUBLESHOOTING.md        # SoluÃ§Ã£o de problemas
```

---

## ðŸš€ Como Usar

### InstalaÃ§Ã£o

1. **Download dos Arquivos**
   ```bash
   # Clonar ou baixar o repositÃ³rio
   git clone <url-do-repositorio>
   cd mapa-lojas-preferenza
   ```

2. **Upload para Servidor**
   - Conectar via FTP/SFTP ao servidor Locaweb
   - Fazer upload de todos os arquivos mantendo a estrutura de pastas
   - Exemplo de caminho: `/public_html/mapa-lojas/`

3. **Acessar a AplicaÃ§Ã£o**
   - Abrir navegador em: `https://seu-dominio.com/mapa-lojas/`

### Uso BÃ¡sico

1. **Visualizar Mapa**
   - Ao abrir, o mapa carrega automaticamente com todas as lojas
   - Use zoom (+/-) para aproximar/afastar
   - Arraste para navegar pelo mapa

2. **Clicar em Marcador**
   - Clique em qualquer marcador para ver informaÃ§Ãµes detalhadas
   - Popup exibe: Nome, CNPJ, EndereÃ§o, Supervisor, Status

3. **Atualizar Dados**
   - Clique no botÃ£o "ðŸ”„ Atualizar dados"
   - Aguarde o carregamento
   - Mensagem de sucesso/erro serÃ¡ exibida

4. **Atalhos de Teclado**
   - `Ctrl+R`: Recarregar dados
   - `Ctrl+E`: Exportar para CSV
   - `Ctrl+S`: Mostrar estatÃ­sticas
   - `Ctrl+I`: InformaÃ§Ãµes do app

---

## ðŸŽ¨ Paleta de Cores

| Status | Cor | Hex | Significado |
|--------|-----|-----|-------------|
| Verde | Verde Escuro | `#228B22` | Roteirizado (Atendido) |
| Laranja | Laranja | `#FF8C00` | Não Roteirizado (Com Venda) |
| Vermelho | Vermelho | `#DC143C` | Roteirizado (Sem Venda) |
| Cinza | Cinza Escuro | `#4B5563` | Não Roteirizado (Sem Venda) |

---

## ðŸ“Š Estrutura de Dados

### Colunas da Planilha Google Sheets

| Coluna | Nome | Tipo | DescriÃ§Ã£o |
|--------|------|------|-----------|
| A | CÃ³digo | Sequencial | ID Ãºnico da loja |
| B | CNPJ | Texto | CNPJ da loja |
| C | Status de Cor | Texto | Verde / Laranja / Vermelho |
| D | Nome Fantasia | Texto | Nome comercial |
| E | Supervisor | Texto | Vendedor responsÃ¡vel |
| F | CEP | Texto | CEP da loja |
| G | Logradouro | Texto | EndereÃ§o completo |
| H | NÃºmero | Texto | NÃºmero do endereÃ§o |
| I | Bairro | Texto | Bairro |
| J | Cidade | Texto | Cidade |
| K | UF | Texto | Estado (SP, RJ, etc.) |
| L | Latitude | NÃºmero | Coordenada para mapa |
| M | Longitude | NÃºmero | Coordenada para mapa |
| N | RegiÃ£o | Texto | RegiÃ£o interna |

---

## âš™ï¸ ConfiguraÃ§Ã£o

### Arquivo `data/config.json`

Edite este arquivo para customizar a aplicaÃ§Ã£o:

```json
{
  "map": {
    "center": [-14.2350, -51.9253],    // Centro do mapa (Brasil)
    "initialZoom": 4,                   // Zoom inicial
    "minZoom": 3,                       // Zoom mÃ­nimo
    "maxZoom": 18                       // Zoom mÃ¡ximo
  },
  "googleSheets": {
    "csvUrl": "https://...",            // URL da planilha
    "updateInterval": 300000            // Intervalo de atualizaÃ§Ã£o (ms)
  },
  "cluster": {
    "enabled": true,                    // Ativar clusterizaÃ§Ã£o
    "maxClusterRadius": 80,             // Raio do cluster (px)
    "disableClusteringAtZoom": 16       // Desativar cluster em zoom
  }
}
```

---

## ðŸ”§ Desenvolvimento

### Adicionar Nova Funcionalidade

1. **Editar arquivo apropriado** em `js/`
2. **Adicionar funÃ§Ã£o** com documentaÃ§Ã£o JSDoc
3. **Testar** no navegador
4. **Fazer commit** com mensagem clara

### Estrutura de MÃ³dulos

```
main.js (orquestrador)
  â”œâ”€â”€ map-config.js (mapa)
  â”œâ”€â”€ data-loader-v5.js (dados)
  â”œâ”€â”€ marker-manager-gota-v2.js (marcadores)
  â”œâ”€â”€ popup-handler.js (popups)
  â”œâ”€â”€ cluster-manager.js (clusters)
  â”œâ”€â”€ filter-manager-fixed.js (filtros)
  â”œâ”€â”€ filters-init-fixed.js (bootstrap dos filtros)
  â”œâ”€â”€ legend-manager.js (legenda)
  â””â”€â”€ utils-fixed.js (utilitÃ¡rios)
```

### Adicionando Novo Logo

1. Redimensionar logo para 28x28 pixels
2. Salvar em `images/logos/` com nome em minÃºsculas
3. Adicionar mapeamento em `data/config.json`

```json
"networks": {
  "NOVA_REDE": "nova-rede.png"
}
```

---

## ðŸ› Troubleshooting

### Mapa nÃ£o carrega

1. Verificar console do navegador (F12)
2. Verificar se URL da Google Sheets estÃ¡ correta
3. Verificar se planilha estÃ¡ pÃºblica
4. Limpar cache do navegador (Ctrl+Shift+Delete)

### Marcadores nÃ£o aparecem

1. Verificar se coordenadas (latitude/longitude) sÃ£o vÃ¡lidas
2. Verificar se hÃ¡ dados na planilha
3. Verificar se status de cor estÃ¡ correto
4. Clicar em "Atualizar dados"

### Performance lenta

1. Verificar nÃºmero de lojas (muito grande?)
2. Verificar zoom do mapa
3. Limpar cache (Ctrl+R)
4. Desabilitar clusterizaÃ§Ã£o em `config.json`

### Logos nÃ£o aparecem

1. Verificar se arquivos estÃ£o em `images/logos/`
2. Verificar nomes em `config.json`
3. Verificar permissÃµes de arquivo (755)
4. Verificar console do navegador

---

## ðŸ“± Responsividade

### Breakpoints

| Dispositivo | Largura | Comportamento |
|-------------|---------|---------------|
| Mobile | < 480px | Layout vertical, legenda em abas |
| Mobile | 480-768px | Layout adaptado |
| Tablet | 768-1024px | Layout intermediÃ¡rio |
| Desktop | > 1024px | Layout completo |

---

## ðŸ” SeguranÃ§a

- âœ… Sem credenciais expostas
- âœ… Dados pÃºblicos apenas
- âœ… ValidaÃ§Ã£o de entrada
- âœ… SanitizaÃ§Ã£o de HTML
- âœ… CORS habilitado no Google Sheets

---

## ðŸ“ž Suporte

### DocumentaÃ§Ã£o Adicional

- `docs/GUIA_DESENVOLVIMENTO.md` - Guia para desenvolvedores
- `docs/ESTRUTURA_DADOS.md` - DocumentaÃ§Ã£o de dados
- `docs/TROUBLESHOOTING.md` - SoluÃ§Ã£o de problemas

### Contato

Para dÃºvidas ou sugestÃµes, entre em contato com a equipe de desenvolvimento.

---

## ðŸ“„ LicenÃ§a

Este projeto Ã© propriedade da Preferenza. Todos os direitos reservados.

---

## ðŸŽ‰ CrÃ©ditos

- **Desenvolvido por:** Manus
- **Data:** 27 de Janeiro de 2026
- **Tecnologias:** HTML5, CSS3, JavaScript, Leaflet.js, Google Sheets

---

## ðŸ“ Changelog

### v1.0.0 (27/01/2026)
- âœ… VersÃ£o inicial
- âœ… Mapa com Leaflet
- âœ… Marcadores customizados
- âœ… ClusterizaÃ§Ã£o
- âœ… Popups
- âœ… AtualizaÃ§Ã£o manual
- âœ… Responsividade
- âœ… Cache de dados

---

**Ãšltima AtualizaÃ§Ã£o:** 27 de Janeiro de 2026


