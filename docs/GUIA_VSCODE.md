# 📝 GUIA COMPLETO: INSTALAR E USAR NO VSCODE

## 🎯 Objetivo

Este guia mostra como instalar, configurar e trabalhar com o projeto **Mapa Interativo de Lojas** no **Visual Studio Code (VSCode)**.

---

## 📥 PASSO 1: BAIXAR E EXTRAIR O PROJETO

### 1.1 Baixar o Arquivo ZIP

1. Você recebeu o arquivo: **`mapa-lojas-preferenza.zip`**
2. Salve em um local fácil de encontrar, por exemplo:
   - **Windows:** `C:\Users\SeuUsuário\Documentos\`
   - **Mac:** `~/Documents/`
   - **Linux:** `~/Documents/`

### 1.2 Extrair o ZIP

**Windows:**
- Clique com botão direito no arquivo ZIP
- Selecione: **"Extrair tudo..."**
- Escolha a pasta de destino
- Clique em **"Extrair"**

**Mac/Linux:**
- Abra o Terminal
- Navegue até a pasta onde está o ZIP:
  ```bash
  cd ~/Downloads
  ```
- Extraia o arquivo:
  ```bash
  unzip mapa-lojas-preferenza.zip
  ```

### 1.3 Resultado

Após extrair, você terá uma pasta assim:
```
mapa-lojas-preferenza/
├── index.html
├── README.md
├── css/
├── js/
├── data/
└── images/
```

---

## 🔧 PASSO 2: INSTALAR O VSCODE

### 2.1 Se ainda não tem VSCode

1. Acesse: https://code.visualstudio.com/
2. Clique em **"Download"**
3. Escolha sua plataforma (Windows, Mac ou Linux)
4. Execute o instalador
5. Siga as instruções na tela

### 2.2 Verificar Instalação

Abra o Terminal/Prompt de Comando e digite:
```bash
code --version
```

Se aparecer um número de versão, está instalado corretamente!

---

## 📂 PASSO 3: ABRIR O PROJETO NO VSCODE

### 3.1 Opção A: Abrir Pasta (Recomendado)

1. Abra o **VSCode**
2. Clique em: **File** → **Open Folder**
3. Navegue até a pasta **`mapa-lojas-preferenza`**
4. Clique em **"Select Folder"** (ou equivalente)

### 3.2 Opção B: Usar Terminal

1. Abra o Terminal/Prompt de Comando
2. Navegue até a pasta:
   ```bash
   cd caminho/para/mapa-lojas-preferenza
   ```
3. Abra no VSCode:
   ```bash
   code .
   ```

### 3.3 Resultado

O VSCode abrirá com a estrutura do projeto visível na **barra lateral esquerda**.

---

## 🎨 PASSO 4: INSTALAR EXTENSÕES RECOMENDADAS

As extensões facilitam o desenvolvimento. Instale estas:

### 4.1 Live Server (Visualizar em Tempo Real)

1. Clique no ícone de **Extensões** (4 quadrados na barra esquerda)
2. Procure por: **"Live Server"**
3. Clique em **"Install"** (do autor: Ritwick Dey)
4. Após instalar, clique em **"Reload"**

**O que faz:** Permite visualizar o projeto em tempo real enquanto você edita

### 4.2 Prettier (Formatação de Código)

1. Na aba de **Extensões**, procure por: **"Prettier"**
2. Clique em **"Install"** (do autor: Prettier)
3. Clique em **"Reload"**

**O que faz:** Formata automaticamente seu código para ficar mais legível

### 4.3 Thunder Client (Testar APIs)

1. Na aba de **Extensões**, procure por: **"Thunder Client"**
2. Clique em **"Install"**
3. Clique em **"Reload"**

**O que faz:** Permite testar requisições HTTP (útil para debug)

### 4.4 Better Comments (Comentários Coloridos)

1. Na aba de **Extensões**, procure por: **"Better Comments"**
2. Clique em **"Install"** (do autor: Aaron Bond)
3. Clique em **"Reload"**

**O que faz:** Colore comentários para melhor visualização

---

## 🚀 PASSO 5: EXECUTAR O PROJETO LOCALMENTE

### 5.1 Iniciar Live Server

1. Clique com botão direito no arquivo **`index.html`**
2. Selecione: **"Open with Live Server"**
3. O navegador abrirá automaticamente com o projeto

**Ou:**
1. Abra o arquivo `index.html`
2. Clique no botão **"Go Live"** (canto inferior direito do VSCode)

### 5.2 Acessar o Projeto

O navegador abrirá em:
```
http://127.0.0.1:5500/index.html
```

Você verá o mapa carregando!

### 5.3 Recarregar Automático

Toda vez que você salvar um arquivo (Ctrl+S), o navegador recarrega automaticamente.

---

## 📝 PASSO 6: ESTRUTURA DE ARQUIVOS EXPLICADA

Aqui está o que cada arquivo faz:

### 📄 Raiz do Projeto

| Arquivo | Função |
|---------|--------|
| `index.html` | Página principal (HTML) |
| `README.md` | Documentação do projeto |
| `LICENSE` | Licença do projeto |

### 📁 Pasta `css/`

| Arquivo | Função |
|---------|--------|
| `style.css` | Estilos principais (cores, layout, etc.) |
| `responsive.css` | Estilos para mobile/tablet |

### 📁 Pasta `js/`

| Arquivo | Função |
|---------|--------|
| `main.js` | Arquivo principal (orquestra tudo) |
| `map-config.js` | Configuração do mapa Leaflet |
| `data-loader-v5.js` | Carrega dados da Google Sheets |
| `marker-manager-gota-v2.js` | Cria e gerencia marcadores |
| `popup-handler.js` | Gerencia popups (janelas de info) |
| `cluster-manager.js` | Agrupa marcadores próximos |
| `filter-manager-fixed.js` | Aplica filtros e busca rápida |
| `filters-init-fixed.js` | Inicializa eventos do painel de filtros |
| `legend-manager.js` | Controla legenda e contadores |
| `utils-fixed.js` | Funções auxiliares reutilizáveis |

### 📁 Pasta `data/`

| Arquivo | Função |
|---------|--------|
| `config.json` | Configurações da aplicação |

### 📁 Pasta `images/`

| Subpasta | Função |
|----------|--------|
| `logos/` | Logos das redes (28x28px) |
| `icons/` | Ícones do aplicativo |

---

## ✏️ PASSO 7: EDITAR O PROJETO

### 7.1 Editar Configurações

1. Abra o arquivo: **`data/config.json`**
2. Você verá algo assim:

```json
{
  "map": {
    "center": [-14.2350, -51.9253],
    "initialZoom": 4
  },
  "googleSheets": {
    "csvUrl": "https://docs.google.com/spreadsheets/d/..."
  }
}
```

3. Para mudar a URL da planilha:
   - Copie a URL da sua planilha Google Sheets
   - Substitua em: `googleSheets.csvUrl`
   - Salve (Ctrl+S)

### 7.2 Editar Estilos (Cores, Fontes, etc.)

1. Abra o arquivo: **`css/style.css`**
2. No topo, você verá as variáveis CSS:

```css
:root {
    --color-verde: #228B22;
    --color-laranja: #FF8C00;
    --color-vermelho: #DC143C;
}
```

3. Para mudar cores:
   - Altere os valores hex
   - Salve (Ctrl+S)
   - O navegador recarrega automaticamente

### 7.3 Editar Textos

1. Abra o arquivo: **`index.html`**
2. Procure pelo texto que quer mudar
3. Exemplo: Mudar "Mapa de Lojas - Preferenza"
   ```html
   <h1>📍 Mapa de Lojas - Preferenza</h1>
   ```
4. Salve (Ctrl+S)

### 7.4 Editar Lógica JavaScript

1. Abra o arquivo apropriado em **`js/`**
2. Procure pela função que quer mudar
3. Cada função tem comentários explicando o que faz
4. Faça suas alterações
5. Salve (Ctrl+S)

---

## 🔍 PASSO 8: DEBUGAR E TESTAR

### 8.1 Abrir Console do Navegador

1. No navegador, pressione: **F12** ou **Ctrl+Shift+I**
2. Clique na aba: **"Console"**
3. Você verá logs da aplicação

### 8.2 Ver Erros

Se algo não funcionar:
1. Abra o Console (F12)
2. Procure por mensagens em vermelho
3. Leia a mensagem de erro
4. Corrija o problema no código

### 8.3 Testar Responsividade

1. Abra o Console (F12)
2. Clique no ícone de **dispositivo** (canto superior esquerdo)
3. Escolha um tamanho de tela (iPhone, iPad, etc.)
4. Veja como fica em diferentes tamanhos

---

## 💾 PASSO 9: SALVAR E FAZER BACKUP

### 9.1 Salvar Arquivo

- **Atalho:** `Ctrl+S` (Windows/Linux) ou `Cmd+S` (Mac)
- Você verá um ponto branco no nome da aba se houver mudanças não salvas

### 9.2 Salvar Tudo

- **Atalho:** `Ctrl+Shift+S` (Windows/Linux) ou `Cmd+Shift+S` (Mac)

### 9.3 Fazer Backup

1. Clique com botão direito na pasta do projeto
2. Selecione: **"Copy"**
3. Cole em outro local (ex: Dropbox, Google Drive, etc.)

---

## 🚀 PASSO 10: FAZER UPLOAD PARA SERVIDOR

### 10.1 Preparar Arquivo ZIP

1. Clique com botão direito na pasta **`mapa-lojas-preferenza`**
2. Selecione: **"Compress"** (Mac) ou **"Send to" → "Compressed folder"** (Windows)
3. Você terá um arquivo `.zip`

### 10.2 Conectar ao Servidor Locaweb

Você pode usar:

**Opção A: FileZilla (Recomendado)**
1. Baixe: https://filezilla-project.org/
2. Instale
3. Abra FileZilla
4. Preencha com dados do seu servidor:
   - Host: `seu-dominio.com` ou IP
   - Usuário: seu usuário FTP
   - Senha: sua senha FTP
   - Porta: 21 (ou 22 para SFTP)
5. Clique em **"Quickconnect"**
6. Navegue até `/public_html/`
7. Arraste a pasta do projeto para lá

**Opção B: VSCode com Extensão**
1. Instale extensão: **"SFTP"** (no VSCode)
2. Configure com dados do servidor
3. Clique com botão direito na pasta
4. Selecione: **"Upload Folder"**

### 10.3 Acessar Online

Após upload, acesse:
```
https://seu-dominio.com/mapa-lojas/
```

---

## 🎓 PASSO 11: DICAS E TRUQUES

### 11.1 Atalhos Úteis no VSCode

| Atalho | Função |
|--------|--------|
| `Ctrl+S` | Salvar arquivo |
| `Ctrl+Shift+S` | Salvar tudo |
| `Ctrl+/` | Comentar/descomentar linha |
| `Ctrl+D` | Selecionar palavra |
| `Ctrl+F` | Procurar texto |
| `Ctrl+H` | Procurar e substituir |
| `Ctrl+Z` | Desfazer |
| `Ctrl+Y` | Refazer |
| `Alt+Up/Down` | Mover linha para cima/baixo |
| `Ctrl+Shift+P` | Abrir paleta de comandos |

### 11.2 Formatar Código

1. Selecione o código
2. Pressione: `Ctrl+Shift+I` (Windows/Linux) ou `Cmd+Shift+I` (Mac)
3. Código será formatado automaticamente

### 11.3 Buscar Arquivo

1. Pressione: `Ctrl+P`
2. Digite o nome do arquivo
3. Pressione Enter para abrir

### 11.4 Ir para Linha Específica

1. Pressione: `Ctrl+G`
2. Digite o número da linha
3. Pressione Enter

---

## ❓ PASSO 12: TROUBLESHOOTING

### Problema: "Live Server não funciona"

**Solução:**
1. Verifique se a extensão está instalada
2. Clique em "Go Live" novamente
3. Verifique se a porta 5500 está disponível

### Problema: "Mapa não carrega"

**Solução:**
1. Abra o Console (F12)
2. Procure por erros em vermelho
3. Verifique se a URL da Google Sheets está correta em `config.json`
4. Verifique se a planilha é pública

### Problema: "Logos não aparecem"

**Solução:**
1. Verifique se os arquivos estão em `images/logos/`
2. Verifique os nomes em `config.json`
3. Abra o Console e procure por erros 404

### Problema: "VSCode está lento"

**Solução:**
1. Feche abas desnecessárias
2. Desinstale extensões que não usa
3. Reinicie o VSCode

---

## 📚 RECURSOS ADICIONAIS

### Documentação Oficial

- **VSCode:** https://code.visualstudio.com/docs
- **Leaflet.js:** https://leafletjs.com/
- **Google Sheets API:** https://developers.google.com/sheets

### Tutoriais Úteis

- **VSCode para Iniciantes:** https://www.youtube.com/watch?v=VqCgcpAypFQ
- **HTML/CSS/JavaScript:** https://www.w3schools.com/
- **Leaflet Maps:** https://leafletjs.com/examples.html

---

## 🎯 RESUMO RÁPIDO

```bash
# 1. Extrair ZIP
unzip mapa-lojas-preferenza.zip

# 2. Abrir no VSCode
cd mapa-lojas-preferenza
code .

# 3. Instalar extensões (no VSCode)
# - Live Server
# - Prettier
# - Thunder Client
# - Better Comments

# 4. Iniciar Live Server
# Clique em "Go Live" no canto inferior direito

# 5. Editar arquivos
# - config.json (configurações)
# - css/style.css (estilos)
# - index.html (HTML)
# - js/*.js (lógica)

# 6. Salvar
Ctrl+S

# 7. Fazer upload
# Use FileZilla ou extensão SFTP
```

---

## 💡 PRÓXIMOS PASSOS

1. ✅ Instalar VSCode
2. ✅ Abrir o projeto
3. ✅ Instalar extensões
4. ✅ Executar com Live Server
5. ✅ Editar `config.json` com URL da planilha
6. ✅ Testar no navegador
7. ✅ Fazer upload para servidor

---

## 📞 PRECISA DE AJUDA?

Se tiver dúvidas:

1. Consulte o `README.md` (documentação geral)
2. Consulte o `TROUBLESHOOTING.md` (solução de problemas)
3. Verifique o Console do navegador (F12)
4. Procure por comentários no código

---

**Versão:** 1.0  
**Data:** 27 de Janeiro de 2026  
**Autor:** Manus

Boa sorte! 🚀
