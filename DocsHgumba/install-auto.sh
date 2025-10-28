#!/bin/bash

################################################################################
#                                                                              #
#  DocsHgumba - Script de Instalação Automática                               #
#  Sistema 100% Offline de PDFs Editáveis                                     #
#                                                                              #
#  Uso: bash install-auto.sh                                                  #
#  Ou: curl -sL URL | bash                                                    #
#                                                                              #
################################################################################

set -e  # Sair em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Caracteres especiais
CHECK_MARK="${GREEN}✓${NC}"
CROSS_MARK="${RED}✗${NC}"
ARROW="${BLUE}→${NC}"
STAR="${YELLOW}★${NC}"

################################################################################
# Funções auxiliares
################################################################################

print_header() {
    echo ""
    echo -e "${BOLD}${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${CYAN}║                                                            ║${NC}"
    echo -e "${BOLD}${CYAN}║${NC}              ${BOLD}DocsHgumba - Instalação Automática${NC}              ${BOLD}${CYAN}║${NC}"
    echo -e "${BOLD}${CYAN}║${NC}          Sistema 100% Offline de PDFs Editáveis         ${BOLD}${CYAN}║${NC}"
    echo -e "${BOLD}${CYAN}║                                                            ║${NC}"
    echo -e "${BOLD}${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_section() {
    echo ""
    echo -e "${BOLD}${PURPLE}▶ $1${NC}"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "  ${CHECK_MARK} $1"
}

print_error() {
    echo -e "  ${CROSS_MARK} ${RED}$1${NC}"
}

print_warning() {
    echo -e "  ${YELLOW}⚠${NC}  ${YELLOW}$1${NC}"
}

print_info() {
    echo -e "  ${ARROW} $1"
}

print_command() {
    echo -e "  ${CYAN}$${NC} $1"
}

################################################################################
# Detecção de Sistema
################################################################################

detect_system() {
    print_section "Detectando Sistema"

    # Sistema Operacional
    OS=$(uname -s)
    case "$OS" in
        Linux*)
            OS_NAME="Linux"
            OS_ICON="🐧"
            ;;
        Darwin*)
            OS_NAME="macOS"
            OS_ICON="🍎"
            ;;
        CYGWIN*|MINGW*|MSYS*)
            OS_NAME="Windows"
            OS_ICON="🪟"
            ;;
        *)
            OS_NAME="Desconhecido"
            OS_ICON="❓"
            ;;
    esac
    print_success "Sistema: ${OS_ICON} ${BOLD}${OS_NAME}${NC} (${OS})"

    # Arquitetura
    ARCH=$(uname -m)
    print_success "Arquitetura: ${BOLD}${ARCH}${NC}"

    # Distribuição Linux
    if [ "$OS_NAME" = "Linux" ]; then
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            DISTRO="${NAME:-Linux} ${VERSION_ID:-}"
            print_success "Distribuição: ${BOLD}${DISTRO}${NC}"
        fi
    fi

    # Kernel
    KERNEL=$(uname -r)
    print_info "Kernel: ${KERNEL}"

    # Shell
    SHELL_NAME=$(basename "$SHELL")
    print_info "Shell: ${SHELL_NAME}"

    # Usuário
    USERNAME=$(whoami)
    print_info "Usuário: ${USERNAME}"

    # Home directory
    HOME_DIR="$HOME"
    print_info "Home: ${HOME_DIR}"
}

################################################################################
# Detecção de IP
################################################################################

detect_network() {
    print_section "Detectando Rede"

    # IP Local
    if command -v hostname &> /dev/null; then
        IP_LOCAL=$(hostname -I 2>/dev/null | awk '{print $1}')
        if [ -z "$IP_LOCAL" ]; then
            IP_LOCAL=$(ifconfig 2>/dev/null | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | head -1)
        fi
        if [ -z "$IP_LOCAL" ]; then
            IP_LOCAL="localhost"
        fi
    else
        IP_LOCAL="localhost"
    fi
    print_success "IP Local: ${BOLD}${IP_LOCAL}${NC}"

    # Hostname
    HOSTNAME=$(hostname 2>/dev/null || echo "unknown")
    print_info "Hostname: ${HOSTNAME}"

    # Interface de rede principal
    if command -v ip &> /dev/null; then
        NETWORK_INTERFACE=$(ip route | grep default | awk '{print $5}' | head -1)
        if [ -n "$NETWORK_INTERFACE" ]; then
            print_info "Interface: ${NETWORK_INTERFACE}"
        fi
    fi
}

################################################################################
# Verificação de Permissões
################################################################################

check_permissions() {
    print_section "Verificando Permissões"

    # Diretório base
    BASE_DIR="$HOME/Documentos/asp fernandes"

    # Verificar se diretório pai existe
    if [ -d "$HOME/Documentos" ]; then
        print_success "Diretório ~/Documentos existe"
    else
        print_warning "Diretório ~/Documentos não existe, será criado"
    fi

    # Verificar permissões de escrita
    if [ -w "$HOME/Documentos" ] || [ -w "$HOME" ]; then
        print_success "Permissões de escrita: OK"
        HAS_WRITE_PERMISSION=true
    else
        print_error "Sem permissões de escrita em ~/Documentos"
        HAS_WRITE_PERMISSION=false
    fi

    # Verificar espaço em disco
    if command -v df &> /dev/null; then
        DISK_SPACE=$(df -h "$HOME" 2>/dev/null | awk 'NR==2 {print $4}')
        print_info "Espaço disponível: ${DISK_SPACE}"
    fi

    # Verificar se já existe instalação
    if [ -d "$BASE_DIR/DocsHgumba" ]; then
        print_warning "DocsHgumba já instalado em:"
        print_command "cd \"$BASE_DIR/DocsHgumba\""

        echo ""
        echo -e "${YELLOW}O que deseja fazer?${NC}"
        echo "  1) Reinstalar (sobrescrever)"
        echo "  2) Atualizar (manter dados)"
        echo "  3) Cancelar"
        echo -n "Escolha (1-3): "
        read -r CHOICE

        case $CHOICE in
            1)
                print_info "Removendo instalação anterior..."
                rm -rf "$BASE_DIR/DocsHgumba"
                print_success "Instalação anterior removida"
                ;;
            2)
                print_info "Modo atualização selecionado"
                UPDATE_MODE=true
                ;;
            *)
                print_error "Instalação cancelada"
                exit 0
                ;;
        esac
    fi

    if [ "$HAS_WRITE_PERMISSION" = false ]; then
        print_error "Instalação não pode continuar sem permissões"
        echo ""
        echo -e "${YELLOW}Tente executar com sudo:${NC}"
        print_command "sudo bash install-auto.sh"
        exit 1
    fi
}

################################################################################
# Verificação de Dependências
################################################################################

check_dependencies() {
    print_section "Verificando Dependências"

    MISSING_DEPS=()

    # Verificar navegador
    BROWSER_FOUND=false
    for browser in google-chrome chromium firefox microsoft-edge opera brave; do
        if command -v "$browser" &> /dev/null; then
            print_success "Navegador: ${BOLD}${browser}${NC}"
            BROWSER_FOUND=true
            BROWSER_CMD="$browser"
            break
        fi
    done

    if [ "$BROWSER_FOUND" = false ]; then
        print_warning "Nenhum navegador detectado"
        print_info "DocsHgumba precisa de Chrome, Edge ou Firefox"
        MISSING_DEPS+=("navegador")
    fi

    # Verificar curl ou wget (para possível download futuro)
    if command -v curl &> /dev/null; then
        print_success "curl instalado"
    elif command -v wget &> /dev/null; then
        print_success "wget instalado"
    else
        print_warning "curl/wget não encontrado"
    fi

    # Verificar git (opcional)
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version | awk '{print $3}')
        print_info "git ${GIT_VERSION} (opcional)"
    fi

    # Resumo de dependências faltantes
    if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
        echo ""
        print_warning "Dependências faltantes: ${MISSING_DEPS[*]}"
        print_info "Instalação continuará, mas funcionalidades podem ser limitadas"
        echo ""
        echo -n "Continuar mesmo assim? (s/N): "
        read -r CONTINUE
        if [[ ! "$CONTINUE" =~ ^[Ss]$ ]]; then
            print_error "Instalação cancelada"
            exit 0
        fi
    fi
}

################################################################################
# Criação da Estrutura
################################################################################

create_structure() {
    print_section "Criando Estrutura de Pastas"

    BASE_DIR="$HOME/Documentos/asp fernandes"
    INSTALL_DIR="$BASE_DIR/DocsHgumba"

    # Criar diretórios
    print_info "Criando diretórios..."

    mkdir -p "$BASE_DIR"
    print_success "Criado: asp fernandes/"

    mkdir -p "$INSTALL_DIR"
    print_success "Criado: DocsHgumba/"

    mkdir -p "$INSTALL_DIR/assets/pdfs"
    print_success "Criado: DocsHgumba/assets/pdfs/"

    mkdir -p "$INSTALL_DIR/assets/generated"
    print_success "Criado: DocsHgumba/assets/generated/"

    mkdir -p "$INSTALL_DIR/data"
    print_success "Criado: DocsHgumba/data/"

    mkdir -p "$INSTALL_DIR/backups"
    print_success "Criado: DocsHgumba/backups/"

    # Exportar para uso global
    export INSTALL_DIR
}

################################################################################
# Download/Cópia dos Arquivos
################################################################################

install_files() {
    print_section "Instalando Arquivos"

    # Verificar se estamos no repositório git
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

    if [ -f "$SCRIPT_DIR/index.html" ]; then
        # Modo local (executando do repositório)
        print_info "Modo: Instalação local (repositório detectado)"

        # Copiar arquivos principais
        cp "$SCRIPT_DIR/index.html" "$INSTALL_DIR/"
        print_success "Copiado: index.html"

        cp "$SCRIPT_DIR/app.js" "$INSTALL_DIR/"
        print_success "Copiado: app.js"

        cp "$SCRIPT_DIR/style.css" "$INSTALL_DIR/"
        print_success "Copiado: style.css"

        # Copiar arquivos auxiliares
        if [ -f "$SCRIPT_DIR/README.md" ]; then
            cp "$SCRIPT_DIR/README.md" "$INSTALL_DIR/"
            print_success "Copiado: README.md"
        fi

        if [ -f "$SCRIPT_DIR/GUIA_RAPIDO.txt" ]; then
            cp "$SCRIPT_DIR/GUIA_RAPIDO.txt" "$INSTALL_DIR/"
            print_success "Copiado: GUIA_RAPIDO.txt"
        fi

        # Copiar scripts
        if [ -f "$SCRIPT_DIR/verificar.sh" ]; then
            cp "$SCRIPT_DIR/verificar.sh" "$INSTALL_DIR/"
            chmod +x "$INSTALL_DIR/verificar.sh"
            print_success "Copiado: verificar.sh"
        fi

        # Copiar data/templates.json se existir
        if [ -f "$SCRIPT_DIR/data/templates.json" ]; then
            cp "$SCRIPT_DIR/data/templates.json" "$INSTALL_DIR/data/"
            print_success "Copiado: data/templates.json"
        fi

    else
        # Modo download (via GitHub)
        print_info "Modo: Download do GitHub"

        GITHUB_RAW_URL="https://raw.githubusercontent.com/fernandes01032000/PDFWizard/main/DocsHgumba"

        # Download com curl ou wget
        if command -v curl &> /dev/null; then
            DOWNLOAD_CMD="curl -sL"
        elif command -v wget &> /dev/null; then
            DOWNLOAD_CMD="wget -qO-"
        else
            print_error "Nem curl nem wget disponível para download"
            print_info "Por favor, instale curl ou wget:"
            print_command "sudo apt-get install curl"
            exit 1
        fi

        # Baixar arquivos
        print_info "Baixando index.html..."
        $DOWNLOAD_CMD "$GITHUB_RAW_URL/index.html" > "$INSTALL_DIR/index.html"
        print_success "Baixado: index.html"

        print_info "Baixando app.js..."
        $DOWNLOAD_CMD "$GITHUB_RAW_URL/app.js" > "$INSTALL_DIR/app.js"
        print_success "Baixado: app.js"

        print_info "Baixando style.css..."
        $DOWNLOAD_CMD "$GITHUB_RAW_URL/style.css" > "$INSTALL_DIR/style.css"
        print_success "Baixado: style.css"

        # Baixar arquivos adicionais
        for file in README.md GUIA_RAPIDO.txt verificar.sh; do
            print_info "Baixando $file..."
            $DOWNLOAD_CMD "$GITHUB_RAW_URL/$file" > "$INSTALL_DIR/$file" 2>/dev/null || true
            if [ -f "$INSTALL_DIR/$file" ]; then
                print_success "Baixado: $file"
                [ "$file" = "verificar.sh" ] && chmod +x "$INSTALL_DIR/$file"
            fi
        done
    fi

    # Criar templates.json se não existir
    if [ ! -f "$INSTALL_DIR/data/templates.json" ]; then
        cat > "$INSTALL_DIR/data/templates.json" << 'EOF'
{
  "templates": [],
  "version": "1.0.0",
  "lastUpdated": null
}
EOF
        print_success "Criado: data/templates.json"
    fi

    # Criar .gitignore
    cat > "$INSTALL_DIR/.gitignore" << 'EOF'
assets/generated/*.pdf
backups/
data/templates.json.bak
.DS_Store
Thumbs.db
EOF
    print_success "Criado: .gitignore"
}

################################################################################
# Criar Atalhos
################################################################################

create_shortcuts() {
    print_section "Criando Atalhos"

    # Atalho para abrir no navegador
    cat > "$INSTALL_DIR/abrir-docshgumba.sh" << EOF
#!/bin/bash
# Atalho para abrir DocsHgumba

DOCSHGUMBA_PATH="$INSTALL_DIR/index.html"

# Detectar navegador
if command -v xdg-open &> /dev/null; then
    xdg-open "\$DOCSHGUMBA_PATH"
elif command -v open &> /dev/null; then
    open "\$DOCSHGUMBA_PATH"
elif command -v google-chrome &> /dev/null; then
    google-chrome "\$DOCSHGUMBA_PATH"
elif command -v firefox &> /dev/null; then
    firefox "\$DOCSHGUMBA_PATH"
else
    echo "Abra manualmente: file://\$DOCSHGUMBA_PATH"
fi
EOF
    chmod +x "$INSTALL_DIR/abrir-docshgumba.sh"
    print_success "Criado: abrir-docshgumba.sh"

    # Atalho .desktop para Linux
    if [ "$OS_NAME" = "Linux" ]; then
        DESKTOP_DIR="$HOME/.local/share/applications"
        mkdir -p "$DESKTOP_DIR"

        cat > "$DESKTOP_DIR/docshgumba.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=DocsHgumba
Comment=Sistema de PDFs Editáveis
Exec=bash "$INSTALL_DIR/abrir-docshgumba.sh"
Icon=application-pdf
Terminal=false
Categories=Office;
EOF
        print_success "Criado: atalho na área de trabalho (Linux)"
    fi

    # Script de backup
    cat > "$INSTALL_DIR/backup.sh" << 'EOF'
#!/bin/bash
# Backup automático de templates

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/templates_backup_$DATE.json"

mkdir -p "$BACKUP_DIR"

if [ -f "data/templates.json" ]; then
    cp "data/templates.json" "$BACKUP_FILE"
    echo "✓ Backup criado: $BACKUP_FILE"

    # Manter apenas últimos 10 backups
    ls -t "$BACKUP_DIR"/templates_backup_*.json | tail -n +11 | xargs -r rm
    echo "✓ Limpeza de backups antigos concluída"
else
    echo "✗ Arquivo templates.json não encontrado"
    exit 1
fi
EOF
    chmod +x "$INSTALL_DIR/backup.sh"
    print_success "Criado: backup.sh"
}

################################################################################
# Configuração Final
################################################################################

final_setup() {
    print_section "Configuração Final"

    # Definir permissões corretas
    chmod 755 "$INSTALL_DIR"
    chmod 644 "$INSTALL_DIR"/*.html "$INSTALL_DIR"/*.js "$INSTALL_DIR"/*.css 2>/dev/null || true
    chmod 755 "$INSTALL_DIR"/*.sh 2>/dev/null || true
    print_success "Permissões configuradas"

    # Criar arquivo de configuração
    cat > "$INSTALL_DIR/config.json" << EOF
{
  "version": "1.0.0",
  "installedAt": "$(date -Iseconds)",
  "installedBy": "$USERNAME",
  "installPath": "$INSTALL_DIR",
  "systemInfo": {
    "os": "$OS_NAME",
    "hostname": "$HOSTNAME",
    "ip": "$IP_LOCAL"
  }
}
EOF
    print_success "Arquivo de configuração criado"

    # Criar README de instalação
    cat > "$INSTALL_DIR/INSTALACAO.txt" << EOF
╔════════════════════════════════════════════════════════════╗
║               DocsHgumba - Instalado com Sucesso           ║
╚════════════════════════════════════════════════════════════╝

📍 Localização:
   $INSTALL_DIR

🖥️  Sistema:
   OS: $OS_NAME
   IP: $IP_LOCAL
   Usuário: $USERNAME

🚀 Como Abrir:

   Método 1: Atalho
   $ cd "$INSTALL_DIR"
   $ ./abrir-docshgumba.sh

   Método 2: Navegador
   Abra o navegador e cole:
   file://$INSTALL_DIR/index.html

   Método 3: Comando direto
   $ xdg-open "$INSTALL_DIR/index.html"

📚 Documentação:
   - README.md: Documentação completa
   - GUIA_RAPIDO.txt: Guia de uso rápido
   - verificar.sh: Verificar instalação

🔧 Scripts Úteis:
   - ./abrir-docshgumba.sh: Abrir no navegador
   - ./backup.sh: Fazer backup de templates
   - ./verificar.sh: Verificar instalação

💾 Backup:
   Execute periodicamente:
   $ cd "$INSTALL_DIR"
   $ ./backup.sh

🌐 Acesso em Rede:
   Outros PCs podem acessar via:
   \\\\$IP_LOCAL\\asp fernandes\\DocsHgumba\\index.html

📞 Suporte:
   - Leia README.md para instruções detalhadas
   - Verifique GUIA_RAPIDO.txt para início rápido

═══════════════════════════════════════════════════════════

Instalado em: $(date '+%d/%m/%Y às %H:%M:%S')

EOF
    print_success "README de instalação criado"
}

################################################################################
# Verificação Pós-Instalação
################################################################################

verify_installation() {
    print_section "Verificando Instalação"

    ERRORS=0

    # Verificar arquivos essenciais
    REQUIRED_FILES=(
        "index.html"
        "app.js"
        "style.css"
        "data/templates.json"
    )

    for file in "${REQUIRED_FILES[@]}"; do
        if [ -f "$INSTALL_DIR/$file" ]; then
            print_success "OK: $file"
        else
            print_error "FALTANDO: $file"
            ((ERRORS++))
        fi
    done

    # Verificar diretórios
    REQUIRED_DIRS=(
        "assets/pdfs"
        "assets/generated"
        "data"
        "backups"
    )

    for dir in "${REQUIRED_DIRS[@]}"; do
        if [ -d "$INSTALL_DIR/$dir" ]; then
            print_success "OK: $dir/"
        else
            print_error "FALTANDO: $dir/"
            ((ERRORS++))
        fi
    done

    # Resumo
    if [ $ERRORS -eq 0 ]; then
        echo ""
        print_success "${BOLD}Instalação verificada com sucesso!${NC}"
    else
        echo ""
        print_error "${BOLD}Encontrados $ERRORS erros na instalação${NC}"
        return 1
    fi
}

################################################################################
# Informações Finais
################################################################################

print_final_info() {
    echo ""
    echo -e "${BOLD}${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${GREEN}║                                                            ║${NC}"
    echo -e "${BOLD}${GREEN}║${NC}          ${BOLD}✓ DocsHgumba Instalado com Sucesso!${NC}             ${BOLD}${GREEN}║${NC}"
    echo -e "${BOLD}${GREEN}║                                                            ║${NC}"
    echo -e "${BOLD}${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    echo -e "${BOLD}📍 Localização:${NC}"
    echo -e "   ${CYAN}$INSTALL_DIR${NC}"
    echo ""

    echo -e "${BOLD}🚀 Para Abrir o DocsHgumba:${NC}"
    echo ""
    echo -e "${BOLD}   Opção 1 - Atalho (Mais Fácil):${NC}"
    print_command "cd \"$INSTALL_DIR\""
    print_command "./abrir-docshgumba.sh"
    echo ""

    echo -e "${BOLD}   Opção 2 - Navegador:${NC}"
    echo -e "   ${ARROW} Abra seu navegador (Chrome/Edge/Firefox)"
    echo -e "   ${ARROW} Pressione ${BOLD}Ctrl+O${NC}"
    echo -e "   ${ARROW} Cole este caminho:"
    echo -e "     ${CYAN}file://$INSTALL_DIR/index.html${NC}"
    echo ""

    if [ "$OS_NAME" = "Linux" ]; then
        echo -e "${BOLD}   Opção 3 - Comando Direto:${NC}"
        print_command "xdg-open \"$INSTALL_DIR/index.html\""
        echo ""
    fi

    echo -e "${BOLD}📚 Próximos Passos:${NC}"
    echo -e "   1. ${ARROW} Leia o ${CYAN}README.md${NC} para instruções completas"
    echo -e "   2. ${ARROW} Veja o ${CYAN}GUIA_RAPIDO.txt${NC} para começar rapidamente"
    echo -e "   3. ${ARROW} Crie seu primeiro template!"
    echo ""

    echo -e "${BOLD}🔧 Scripts Úteis:${NC}"
    echo -e "   ${ARROW} Verificar instalação:  ${CYAN}./verificar.sh${NC}"
    echo -e "   ${ARROW} Fazer backup:          ${CYAN}./backup.sh${NC}"
    echo -e "   ${ARROW} Abrir DocsHgumba:      ${CYAN}./abrir-docshgumba.sh${NC}"
    echo ""

    echo -e "${BOLD}💡 Dica:${NC}"
    echo -e "   Adicione um atalho ao seu ambiente:"
    echo -e "   ${CYAN}echo \"alias docshgumba='cd \\\"$INSTALL_DIR\\\" && ./abrir-docshgumba.sh'\" >> ~/.bashrc${NC}"
    echo ""

    echo -e "${BOLD}🌐 Compartilhar em Rede:${NC}"
    echo -e "   Outros PCs podem acessar via:"
    echo -e "   ${CYAN}\\\\\\\\$IP_LOCAL\\\\asp fernandes\\\\DocsHgumba\\\\index.html${NC}"
    echo ""

    echo -e "${BOLD}${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}Instalação concluída em $(date '+%d/%m/%Y às %H:%M:%S')${NC}"
    echo -e "${BOLD}${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

################################################################################
# Main
################################################################################

main() {
    # Limpar tela
    clear

    # Mostrar header
    print_header

    # Executar passos de instalação
    detect_system
    detect_network
    check_permissions
    check_dependencies
    create_structure
    install_files
    create_shortcuts
    final_setup

    # Verificar instalação
    if verify_installation; then
        print_final_info

        # Perguntar se quer abrir agora
        echo ""
        echo -n "Deseja abrir o DocsHgumba agora? (s/N): "
        read -r OPEN_NOW

        if [[ "$OPEN_NOW" =~ ^[Ss]$ ]]; then
            echo ""
            print_info "Abrindo DocsHgumba..."
            sleep 1
            bash "$INSTALL_DIR/abrir-docshgumba.sh" &
            print_success "DocsHgumba aberto!"
        fi
    else
        echo ""
        print_error "Instalação completada com erros"
        print_info "Revise as mensagens acima e tente novamente"
        exit 1
    fi

    echo ""
}

################################################################################
# Executar
################################################################################

main "$@"
