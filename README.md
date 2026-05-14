# Mapeamento de Lojas - Preferenza

Aplicacao web estatica para visualizacao geografica das lojas da Preferenza em mapa interativo, com filtros operacionais, legenda por status, agrupamento de marcadores e leitura de dados a partir de planilha publicada.

## Visao Geral

O projeto foi organizado para uso direto em hospedagem estatica. O mapa carrega os dados da planilha configurada em `data/config.json`, exibe as lojas no Leaflet e permite filtrar rapidamente por:

- UF
- Regiao
- busca textual
- status pela legenda

Tambem existem areas dinamicas por regiao, popups com link para Google Maps e logos customizadas por rede.

## Stack

- HTML5
- CSS3
- JavaScript vanilla
- Leaflet
- Leaflet MarkerCluster
- Turf.js

## Estrutura

```text
.
|-- index.html
|-- css/
|   |-- filters.css
|   |-- responsive.css
|   `-- style.css
|-- data/
|   `-- config.json
|-- images/
|   `-- logos/
|-- js/
|   |-- cluster-manager.js
|   |-- data-loader-v5.js
|   |-- filter-manager-fixed.js
|   |-- filters-init-fixed.js
|   |-- legend-manager.js
|   |-- main.js
|   |-- map-config.js
|   |-- marker-manager-gota-v2.js
|   |-- popup-handler.js
|   |-- region-layer-manager.js
|   `-- utils-fixed.js
`-- scripts/
    |-- deploy-ftp.ps1
    |-- ftp-deploy.config.example.json
    `-- static-server.ps1
```

## Funcionalidades Atuais

- mapa interativo com zoom e arraste
- clusterizacao de marcadores para reduzir custo de renderizacao
- marcadores customizados com logos das redes
- legenda interativa com ativacao e ocultacao por status
- contadores da legenda sincronizados com os filtros ativos
- filtros em cascata por UF e Regiao
- busca rapida por loja, CNPJ, cidade, regiao, rede e outros campos
- areas de regiao desenhadas dinamicamente a partir dos pontos
- popup com dados da loja e link para abrir no Google Maps
- exportacao CSV das lojas filtradas

## Status e Cores

| Status | Cor |
|---|---|
| Roteirizado (Atendido) | Verde |
| Roteirizado (Sem Venda) | Vermelho |
| Nao Roteirizado (Com Venda) | Laranja |
| Nao Roteirizado (Sem Venda) | Cinza escuro |

## Origem dos Dados

Os dados sao lidos da planilha configurada em `data/config.json`.

Campos usados no fluxo atual:

- id
- cnpj
- statusCor
- nomeFantasia
- supervisor
- logradouro
- numero
- bairro
- cidade
- uf
- latitude
- longitude
- regiao
- rede

## Como Rodar Localmente

### Opcao 1: servidor local ja incluido

```powershell
.\scripts\static-server.ps1
```

Depois abra:

```text
http://localhost:8000/
```

### Opcao 2: qualquer servidor estatico

Basta servir a raiz do projeto sem processamento adicional.

## Publicacao por FTP

O projeto possui script de deploy para hospedagem estatica via FTP.

### Arquivos

- exemplo de config: `scripts/ftp-deploy.config.example.json`
- script de deploy: `scripts/deploy-ftp.ps1`

### Preparacao

Copie o arquivo de exemplo e preencha seus acessos:

```text
scripts/ftp-deploy.config.json
```

Campos principais:

- `server`
- `username`
- `password`
- `remotePath`
- `useSsl`
- `passiveMode`

### Teste de publicacao

```powershell
.\scripts\deploy-ftp.ps1 -DryRun
```

### Publicacao real

```powershell
.\scripts\deploy-ftp.ps1
```

O deploy publica:

- `index.html`
- `css/`
- `js/`
- `data/`
- `images/`

## Manutencao de Logos

As logos ficam em `images/logos/`.

Recomendacoes:

- manter nomes consistentes com o mapeamento usado no JS
- preferir PNG com fundo transparente
- evitar arquivos muito pesados quando a logo aparece em muitos marcadores

## Arquivos Principais

- `js/main.js`: bootstrap geral da aplicacao
- `js/data-loader-v5.js`: leitura, normalizacao e atualizacao dos dados
- `js/filter-manager-fixed.js`: estado central de filtros
- `js/legend-manager.js`: comportamento da legenda e contadores
- `js/marker-manager-gota-v2.js`: criacao e atualizacao dos marcadores
- `js/region-layer-manager.js`: desenho das areas de regiao
- `js/utils-fixed.js`: utilitarios compartilhados

## Observacoes Importantes

- o projeto e estatico; nao depende de backend proprio
- a qualidade da experiencia depende diretamente da planilha publicada e das logos disponiveis
- o `.gitignore` foi preparado para evitar versionar credenciais de deploy

## Estado Atual

Projeto limpo, publicado e com deploy FTP automatizado.
