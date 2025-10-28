#!/bin/bash
# Script de Instalação Automática - DocsHgumba
# Sistema 100% offline para geração de PDFs editáveis

set -e

echo "======================================"
echo "  DocsHgumba - Instalação Automática  "
echo "======================================"
echo ""

# Detectar sistema operacional
OS=$(uname -s)
echo "✓ Sistema detectado: $OS"

# Detectar IP local
IP=$(hostname -I | awk '{print $1}' || echo "localhost")
echo "✓ IP local: $IP"

# Diretório base
BASE_DIR="$HOME/Documentos/asp fernandes/DocsHgumba"
echo "✓ Diretório de instalação: $BASE_DIR"
echo ""

# Criar estrutura de pastas
echo "📁 Criando estrutura de pastas..."
mkdir -p "$BASE_DIR/assets/pdfs"
mkdir -p "$BASE_DIR/assets/generated"
mkdir -p "$BASE_DIR/data"

# Verificar permissões
if [ -w "$BASE_DIR" ]; then
    echo "✓ Permissões de escrita OK"
else
    echo "⚠️ AVISO: Sem permissão de escrita em $BASE_DIR"
    exit 1
fi

# Criar arquivo de templates vazio se não existir
if [ ! -f "$BASE_DIR/data/templates.json" ]; then
    echo '{"templates":[],"version":"1.0.0"}' > "$BASE_DIR/data/templates.json"
    echo "✓ templates.json criado"
fi

# Criar arquivo .gitignore
cat > "$BASE_DIR/.gitignore" << 'EOF'
assets/generated/*.pdf
node_modules/
.DS_Store
EOF
echo "✓ .gitignore criado"

# Informações finais
echo ""
echo "======================================"
echo "  ✅ Instalação Concluída!            "
echo "======================================"
echo ""
echo "📍 Localização: $BASE_DIR"
echo "🌐 Para abrir o DocsHgumba:"
echo ""
echo "   1. Abra seu navegador (Chrome/Edge)"
echo "   2. Pressione Ctrl+O"
echo "   3. Navegue até:"
echo "      $BASE_DIR/index.html"
echo ""
echo "   Ou cole este caminho na barra de endereços:"
echo "   file://$BASE_DIR/index.html"
echo ""
echo "🔗 Acesso em rede:"
echo "   Compartilhe a pasta 'asp fernandes' na rede"
echo "   Outros PCs acessam: file://CAMINHO-REDE/DocsHgumba/index.html"
echo ""
echo "📚 Leia o README.md para instruções detalhadas"
echo ""
