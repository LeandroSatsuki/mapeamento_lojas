# Mapeamento de Lojas — Preferenza

<p align="center">
  Aplicação web para transformar uma base operacional de lojas em uma visão geográfica interativa, filtrável e pronta para análise.
</p>

<p align="center">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black">
  <img alt="Leaflet" src="https://img.shields.io/badge/Leaflet-199900?style=flat-square&logo=leaflet&logoColor=white">
  <img alt="OpenStreetMap" src="https://img.shields.io/badge/OpenStreetMap-7EBC6F?style=flat-square&logo=openstreetmap&logoColor=white">
  <img alt="Turf.js" src="https://img.shields.io/badge/Turf.js-2ECC71?style=flat-square">
</p>

## Sobre o projeto

O Mapeamento de Lojas foi criado para facilitar a leitura da cobertura operacional da Preferenza. A aplicação consome uma base publicada no Google Sheets, normaliza os registros e posiciona as lojas em um mapa com filtros, indicadores visuais e agrupamento inteligente de marcadores.

Por ser uma aplicação estática, pode ser publicada em hospedagens simples sem backend próprio. A arquitetura modular separa carregamento de dados, filtros, marcadores, regiões, popups e legenda, facilitando manutenção e evolução.

## Problemas resolvidos

- visualização geográfica de uma base que antes era consultada apenas como tabela;
- identificação rápida de lojas por status operacional;
- redução da poluição visual com clusters de marcadores;
- combinação de filtros por estado, região, texto e status;
- atualização dos dados sem necessidade de republicar o site;
- exportação do recorte filtrado para novas análises;
- acesso direto à localização da loja pelo Google Maps.

## Funcionalidades

- mapa responsivo com zoom e navegação;
- leitura de dados publicados no Google Sheets;
- normalização de campos e validação de coordenadas;
- clusters configuráveis para grandes concentrações de lojas;
- marcadores personalizados com logos das redes;
- filtros em cascata por UF e região;
- busca por loja, CNPJ, cidade, rede e outros campos;
- legenda interativa com contadores por status;
- áreas regionais calculadas dinamicamente com Turf.js;
- popups com informações e link de navegação;
- cache local com atualização manual da fonte;
- exportação CSV dos resultados filtrados.

## Arquitetura

```text
Google Sheets (CSV publicado)
            │
            ▼
 carregamento e normalização
            │
      ┌─────┴─────┐
      ▼           ▼
 filtros       regiões
      │           │
      └─────┬─────┘
            ▼
 Leaflet + MarkerCluster
            │
            ▼
 mapa, legenda e exportação
```

| Componente | Responsabilidade |
| --- | --- |
| `js/main.js` | Inicialização e coordenação da aplicação |
| `js/data-loader-v5.js` | Leitura, normalização, validação e cache dos dados |
| `js/filter-manager-fixed.js` | Estado e aplicação dos filtros |
| `js/marker-manager-gota-v2.js` | Criação e atualização dos marcadores |
| `js/region-layer-manager.js` | Geração das áreas geográficas por região |
| `js/legend-manager.js` | Legenda, status e contadores |
| `data/config.json` | Fonte de dados, mapa, cores, logos e desempenho |

## Executar localmente

O projeto não exige instalação de dependências.

### Windows

```powershell
.\scripts\static-server.ps1
```

Depois, acesse `http://localhost:8000`.

### Python

```bash
python -m http.server 8000
```

> Utilize um servidor HTTP. A leitura da configuração e dos dados não funciona corretamente ao abrir `index.html` diretamente pelo sistema de arquivos.

## Configuração

O arquivo `data/config.json` controla a fonte da planilha, posição do mapa, status, logos, clusters e duração do cache.

A planilha precisa permitir leitura pública do CSV. Não publique informações pessoais, credenciais ou dados que não devam ficar acessíveis pela internet.

## Publicação

O projeto inclui um fluxo opcional de publicação por FTP:

```powershell
Copy-Item .\scripts\ftp-deploy.config.example.json .\scripts\ftp-deploy.config.json
.\scripts\deploy-ftp.ps1 -DryRun
```

O arquivo real de configuração deve permanecer fora do Git. Depois de validar o destino, execute o script sem `-DryRun`.

## Documentação

- [Guia rápido](./docs/GUIA_RAPIDO.md)
- [Guia para VS Code](./docs/GUIA_VSCODE.md)

## Segurança e privacidade

- a aplicação é totalmente executada no navegador;
- a URL da planilha publicada fica visível para qualquer visitante;
- somente dados autorizados para acesso público devem alimentar o mapa;
- credenciais de FTP não devem ser versionadas;
- os logs não exibem o conteúdo integral das linhas carregadas.

## Autor e contexto

Projeto desenvolvido para a operação da **Preferenza** por [Leandro Santos](https://github.com/LeandroSatsuki).
