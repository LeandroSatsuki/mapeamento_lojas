# ⚡ GUIA RÁPIDO - 5 MINUTOS

Se você quer começar AGORA, siga este guia rápido!

---

## 🎯 OBJETIVO

Instalar o projeto no VSCode e ver funcionando em 5 minutos.

---

## ✅ CHECKLIST RÁPIDO

```
[ ] 1. Extrair o ZIP
[ ] 2. Instalar VSCode (se não tiver)
[ ] 3. Abrir pasta no VSCode
[ ] 4. Instalar extensão "Live Server"
[ ] 5. Clicar em "Go Live"
[ ] 6. Ver mapa no navegador
```

---

## 📥 PASSO 1: EXTRAIR ZIP (1 minuto)

### Windows
```
1. Clique direito no mapa-lojas-preferenza.zip
2. "Extrair tudo..."
3. Escolha pasta
4. "Extrair"
```

### Mac/Linux
```bash
unzip mapa-lojas-preferenza.zip
```

---

## 🔧 PASSO 2: INSTALAR VSCODE (2 minutos)

Se já tem VSCode, pule para o próximo passo.

```
1. Acesse: https://code.visualstudio.com/
2. Clique "Download"
3. Instale
4. Abra
```

---

## 📂 PASSO 3: ABRIR NO VSCODE (1 minuto)

### Opção A (Mais Fácil)
```
1. Abra VSCode
2. File → Open Folder
3. Selecione pasta "mapa-lojas-preferenza"
4. Clique "Select Folder"
```

### Opção B (Terminal)
```bash
cd caminho/para/mapa-lojas-preferenza
code .
```

---

## 🎨 PASSO 4: INSTALAR LIVE SERVER (1 minuto)

```
1. Clique no ícone de Extensões (4 quadrados na esquerda)
2. Procure: "Live Server"
3. Clique "Install"
4. Clique "Reload"
```

---

## 🚀 PASSO 5: EXECUTAR (1 minuto)

```
1. Clique com direito em "index.html"
2. "Open with Live Server"

OU

1. Abra "index.html"
2. Clique "Go Live" (canto inferior direito)
```

**Pronto!** O navegador abrirá com o mapa! 🎉

---

## 📝 EDITAR CONFIGURAÇÕES

### Mudar URL da Planilha

```
1. Abra: data/config.json
2. Procure: "csvUrl"
3. Substitua pela URL da sua planilha
4. Salve: Ctrl+S
5. Navegador recarrega automaticamente
```

### Mudar Cores

```
1. Abra: css/style.css
2. Procure: :root {
3. Altere os valores hex das cores
4. Salve: Ctrl+S
```

### Mudar Textos

```
1. Abra: index.html
2. Procure pelo texto
3. Altere
4. Salve: Ctrl+S
```

---

## 🔍 TESTAR NO NAVEGADOR

```
1. Pressione F12 (abre Console)
2. Procure por erros em vermelho
3. Se tudo OK, você verá logs verdes
```

---

## 📱 TESTAR EM MOBILE

```
1. Abra Console (F12)
2. Clique no ícone de dispositivo
3. Escolha iPhone/iPad
4. Veja como fica
```

---

## 💾 SALVAR TUDO

```
Ctrl+S = Salva arquivo atual
Ctrl+Shift+S = Salva tudo
```

---

## 🚀 FAZER UPLOAD PARA SERVIDOR

### Com FileZilla

```
1. Baixe: https://filezilla-project.org/
2. Instale
3. Abra FileZilla
4. Preencha dados do servidor FTP
5. Clique "Quickconnect"
6. Arraste pasta para /public_html/
```

### Com VSCode

```
1. Instale extensão "SFTP"
2. Configure com dados do servidor
3. Clique direito na pasta
4. "Upload Folder"
```

---

## ✨ ESTRUTURA DO PROJETO

```
mapa-lojas-preferenza/
│
├── index.html ← Abra isto no navegador
│
├── css/
│   ├── style.css ← Mude cores aqui
│   └── responsive.css ← Mobile/tablet
│
├── js/
│   ├── main.js ← Lógica principal
│   ├── map-config.js ← Config do mapa
│   ├── data-loader-v5.js ← Carrega dados
│   ├── marker-manager-gota-v2.js ← Marcadores
│   ├── popup-handler.js ← Popups
│   ├── cluster-manager.js ← Clusters
│   ├── filter-manager-fixed.js ← Filtros
│   ├── filters-init-fixed.js ← Inicialização dos filtros
│   ├── legend-manager.js ← Legenda
│   └── utils-fixed.js ← Funções auxiliares
│
├── data/
│   └── config.json ← Mude URL aqui
│
└── images/
    └── logos/ ← Logos das redes
```

---

## 🎓 ATALHOS ÚTEIS

| Atalho | O que faz |
|--------|-----------|
| `Ctrl+S` | Salvar |
| `Ctrl+/` | Comentar linha |
| `Ctrl+F` | Procurar |
| `Ctrl+H` | Procurar e substituir |
| `Ctrl+Z` | Desfazer |
| `F12` | Abrir Console |

---

## ❓ PROBLEMAS COMUNS

### "Mapa não carrega"
```
1. Abra Console (F12)
2. Procure por erros
3. Verifique URL em config.json
```

### "Logos não aparecem"
```
1. Verifique se arquivos estão em images/logos/
2. Verifique nomes em config.json
```

### "Live Server não funciona"
```
1. Reinstale a extensão
2. Reinicie VSCode
```

---

## 📚 DOCUMENTAÇÃO COMPLETA

Para mais detalhes, leia:
- `README.md` - Documentação geral
- `GUIA_VSCODE.md` - Guia completo do VSCode
- `TROUBLESHOOTING.md` - Solução de problemas

---

## 🎉 PRONTO!

Agora você tem um mapa interativo funcionando localmente! 

**Próximos passos:**
1. Editar `config.json` com URL da planilha
2. Testar no navegador
3. Fazer upload para servidor
4. Compartilhar com a equipe

---

**Tempo total: ~5 minutos ⏱️**

Boa sorte! 🚀
