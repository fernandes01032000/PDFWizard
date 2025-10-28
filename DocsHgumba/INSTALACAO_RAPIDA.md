# 🚀 Instalação Rápida - DocsHgumba

## ⚡ Instalação com 1 Comando

### Método 1: Copiar e Colar no Terminal (Recomendado)

Basta copiar e colar este comando no terminal:

```bash
bash <(curl -sL https://raw.githubusercontent.com/fernandes01032000/PDFWizard/main/DocsHgumba/install-auto.sh)
```

**OU se não tiver curl:**

```bash
bash <(wget -qO- https://raw.githubusercontent.com/fernandes01032000/PDFWizard/main/DocsHgumba/install-auto.sh)
```

---

## 📥 Método 2: Download + Executar

### Opção A: Com Git

```bash
# 1. Clonar repositório
git clone https://github.com/fernandes01032000/PDFWizard.git
cd PDFWizard/DocsHgumba

# 2. Executar instalador
bash install-auto.sh
```

### Opção B: Download Manual

```bash
# 1. Baixar script
curl -O https://raw.githubusercontent.com/fernandes01032000/PDFWizard/main/DocsHgumba/install-auto.sh

# 2. Tornar executável
chmod +x install-auto.sh

# 3. Executar
./install-auto.sh
```

---

## 🎯 O Que o Script Faz?

O script automático:

1. ✅ **Detecta** sistema operacional, IP e permissões
2. ✅ **Cria** estrutura de pastas em `~/Documentos/asp fernandes/DocsHgumba/`
3. ✅ **Baixa** todos os arquivos necessários (ou copia localmente)
4. ✅ **Configura** permissões e atalhos
5. ✅ **Verifica** instalação
6. ✅ **Mostra** instruções de uso

---

## 📊 Output do Script

O script mostra informações detalhadas:

```
╔════════════════════════════════════════════════════════════╗
║              DocsHgumba - Instalação Automática            ║
║          Sistema 100% Offline de PDFs Editáveis           ║
╚════════════════════════════════════════════════════════════╝

▶ Detectando Sistema
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ Sistema: 🐧 Linux (Linux)
  ✓ Arquitetura: x86_64
  ✓ Distribuição: Ubuntu 22.04
  → Kernel: 5.15.0-84-generic
  → Shell: bash
  → Usuário: saladeestudos
  → Home: /home/saladeestudos

▶ Detectando Rede
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ IP Local: 192.168.1.100
  → Hostname: localhost
  → Interface: eth0

▶ Verificando Permissões
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ Diretório ~/Documentos existe
  ✓ Permissões de escrita: OK
  → Espaço disponível: 50G

... (continua com todos os passos)

╔════════════════════════════════════════════════════════════╗
║          ✓ DocsHgumba Instalado com Sucesso!              ║
╚════════════════════════════════════════════════════════════╝
```

---

## 🔧 Requisitos do Sistema

### Mínimos
- **SO**: Linux, macOS ou Windows (com WSL/Git Bash)
- **Espaço**: ~5 MB
- **Navegador**: Chrome 90+, Edge 90+ ou Firefox 88+

### Recomendados
- **Conexão**: Internet (apenas para instalação)
- **RAM**: 2 GB
- **Processador**: Qualquer

---

## 📂 Estrutura Criada

Após a instalação:

```
~/Documentos/asp fernandes/DocsHgumba/
├── index.html              ← Arquivo principal (abrir no navegador)
├── app.js                  ← Lógica JavaScript
├── style.css               ← Estilos CSS
├── README.md               ← Documentação completa
├── GUIA_RAPIDO.txt         ← Guia de uso rápido
├── config.json             ← Configurações
├── INSTALACAO.txt          ← Informações da instalação
├── abrir-docshgumba.sh     ← Atalho para abrir
├── backup.sh               ← Script de backup
├── verificar.sh            ← Verificar instalação
├── assets/
│   ├── pdfs/               ← PDFs originais
│   └── generated/          ← PDFs gerados
├── data/
│   └── templates.json      ← Templates salvos
└── backups/                ← Backups automáticos
```

---

## 🚀 Depois da Instalação

### 1. Abrir DocsHgumba

**Opção A - Atalho:**
```bash
cd ~/Documentos/"asp fernandes"/DocsHgumba
./abrir-docshgumba.sh
```

**Opção B - Navegador:**
1. Abra Chrome/Edge/Firefox
2. Pressione `Ctrl+O`
3. Navegue até: `~/Documentos/asp fernandes/DocsHgumba/index.html`

**Opção C - Comando direto:**
```bash
xdg-open ~/Documentos/"asp fernandes"/DocsHgumba/index.html
```

### 2. Criar Alias (Opcional)

Para abrir com comando simples:

```bash
# Adicionar ao ~/.bashrc ou ~/.zshrc
echo 'alias docshgumba="cd ~/Documentos/\"asp fernandes\"/DocsHgumba && ./abrir-docshgumba.sh"' >> ~/.bashrc

# Recarregar
source ~/.bashrc

# Agora basta digitar:
docshgumba
```

---

## ✅ Verificar Instalação

Para verificar se tudo está OK:

```bash
cd ~/Documentos/"asp fernandes"/DocsHgumba
./verificar.sh
```

Output esperado:
```
╔════════════════════════════════════════════════════════╗
║        DocsHgumba - Verificação de Instalação         ║
╚════════════════════════════════════════════════════════╝

📁 Verificando arquivos...
   ✅ index.html
   ✅ app.js
   ✅ style.css
   ✅ README.md
   ✅ GUIA_RAPIDO.txt

📂 Verificando pastas...
   ✅ data/
   ✅ assets/
   ✅ assets/pdfs/
   ✅ assets/generated/

✅ INSTALAÇÃO OK! Tudo pronto para usar.
```

---

## 💾 Fazer Backup

Para fazer backup dos templates:

```bash
cd ~/Documentos/"asp fernandes"/DocsHgumba
./backup.sh
```

Backups ficam em: `backups/templates_backup_YYYYMMDD_HHMMSS.json`

---

## 🔄 Atualizar

Para atualizar para versão mais recente:

```bash
# Fazer backup primeiro
cd ~/Documentos/"asp fernandes"/DocsHgumba
./backup.sh

# Executar instalador novamente
bash install-auto.sh

# Escolher opção "2) Atualizar (manter dados)"
```

---

## 🗑️ Desinstalar

Para remover completamente:

```bash
rm -rf ~/Documentos/"asp fernandes"/DocsHgumba
rm -f ~/.local/share/applications/docshgumba.desktop  # Linux apenas
```

**ATENÇÃO**: Faça backup antes se tiver templates importantes!

---

## ❓ Troubleshooting

### Problema: "curl: command not found"

**Solução**: Instalar curl:
```bash
# Ubuntu/Debian
sudo apt-get install curl

# macOS
brew install curl

# Ou usar wget em vez de curl
```

### Problema: "Permission denied"

**Solução 1**: Dar permissões:
```bash
chmod +x install-auto.sh
./install-auto.sh
```

**Solução 2**: Executar com bash:
```bash
bash install-auto.sh
```

### Problema: Script não executa no Windows

**Solução**: Usar Git Bash ou WSL:
```bash
# Instalar Git Bash: https://git-scm.com/downloads
# Ou usar WSL (Windows Subsystem for Linux)
```

### Problema: Navegador não abre

**Solução**: Abrir manualmente:
```
file:///home/usuario/Documentos/asp%20fernandes/DocsHgumba/index.html
```

---

## 📞 Suporte

### Documentação
- **README.md**: Documentação completa
- **GUIA_RAPIDO.txt**: Guia de início rápido
- **ANALISE_E_MELHORIAS.md**: Detalhes técnicos

### Comunidade
- **GitHub Issues**: https://github.com/fernandes01032000/PDFWizard/issues
- **Pull Requests**: Contribuições bem-vindas!

---

## 🎯 Checklist Pós-Instalação

- [ ] Script executado sem erros
- [ ] Verificação passou (`./verificar.sh`)
- [ ] DocsHgumba abre no navegador
- [ ] Upload de PDF funciona
- [ ] Criar campo funciona
- [ ] Salvar template funciona
- [ ] Preencher formulário funciona
- [ ] Gerar PDF funciona

---

## 🌟 Recursos Instalados

| Recurso | Disponível |
|---------|-----------|
| Interface web completa | ✅ |
| Upload de PDFs | ✅ |
| Criar templates | ✅ |
| 5 tipos de campo | ✅ |
| Salvar templates | ✅ |
| Preencher formulários | ✅ |
| Preview em tempo real | ✅ |
| Gerar PDFs | ✅ |
| Tema verde Exército | ✅ |
| 100% offline | ✅ |
| Scripts de backup | ✅ |
| Atalhos de abertura | ✅ |

---

## 🚀 Próximos Passos

1. ✅ Instalação completa
2. 📖 Ler README.md
3. 🎯 Criar primeiro template
4. 📄 Usar templates para gerar PDFs
5. 💾 Fazer backups regulares
6. 🌐 Compartilhar na rede (opcional)

---

**DocsHgumba v1.0.0** - Sistema 100% Offline de PDFs Editáveis
Desenvolvido para profissionais de saúde ❤️🏥

---

*Última atualização: 28/10/2025*
