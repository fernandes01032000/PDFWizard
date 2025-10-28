#!/bin/bash
# Script de Verificação - DocsHgumba

echo "╔════════════════════════════════════════════════════════╗"
echo "║        DocsHgumba - Verificação de Instalação         ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
ERRORS=0

# Verificar arquivos principais
echo "📁 Verificando arquivos..."
FILES=("index.html" "app.js" "style.css" "README.md" "GUIA_RAPIDO.txt")

for file in "${FILES[@]}"; do
    if [ -f "$BASE_DIR/$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file - NÃO ENCONTRADO"
        ((ERRORS++))
    fi
done

# Verificar pastas
echo ""
echo "📂 Verificando pastas..."
DIRS=("data" "assets" "assets/pdfs" "assets/generated")

for dir in "${DIRS[@]}"; do
    if [ -d "$BASE_DIR/$dir" ]; then
        echo "   ✅ $dir/"
    else
        echo "   ❌ $dir/ - NÃO ENCONTRADA"
        ((ERRORS++))
    fi
done

# Verificar permissões
echo ""
echo "🔐 Verificando permissões..."
if [ -r "$BASE_DIR/index.html" ]; then
    echo "   ✅ Permissões de leitura OK"
else
    echo "   ❌ Sem permissão de leitura"
    ((ERRORS++))
fi

if [ -w "$BASE_DIR/data" ]; then
    echo "   ✅ Permissões de escrita OK"
else
    echo "   ⚠️  Sem permissão de escrita (templates não serão salvos)"
fi

# Verificar tamanho dos arquivos
echo ""
echo "📊 Tamanho dos arquivos:"
echo "   index.html: $(stat -f%z "$BASE_DIR/index.html" 2>/dev/null || stat -c%s "$BASE_DIR/index.html" 2>/dev/null) bytes"
echo "   app.js:     $(stat -f%z "$BASE_DIR/app.js" 2>/dev/null || stat -c%s "$BASE_DIR/app.js" 2>/dev/null) bytes"
echo "   style.css:  $(stat -f%z "$BASE_DIR/style.css" 2>/dev/null || stat -c%s "$BASE_DIR/style.css" 2>/dev/null) bytes"

# Verificar navegadores disponíveis
echo ""
echo "🌐 Navegadores disponíveis:"
if command -v google-chrome &> /dev/null; then
    echo "   ✅ Google Chrome"
elif command -v chromium &> /dev/null; then
    echo "   ✅ Chromium"
fi

if command -v microsoft-edge &> /dev/null; then
    echo "   ✅ Microsoft Edge"
fi

if command -v firefox &> /dev/null; then
    echo "   ⚠️  Firefox (pode ter limitações)"
fi

# Caminho para abrir
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
if [ $ERRORS -eq 0 ]; then
    echo "✅ INSTALAÇÃO OK! Tudo pronto para usar."
    echo ""
    echo "🚀 Para abrir o DocsHgumba:"
    echo ""
    echo "   1. Abra o navegador Chrome ou Edge"
    echo "   2. Pressione Ctrl+O"
    echo "   3. Cole este caminho:"
    echo ""
    echo "      file://$BASE_DIR/index.html"
    echo ""
else
    echo "❌ ERROS ENCONTRADOS: $ERRORS"
    echo ""
    echo "Por favor, execute o install.sh novamente:"
    echo "   ./install.sh"
    echo ""
fi

echo "═══════════════════════════════════════════════════════"
echo ""
echo "📖 Documentação: README.md"
echo "⚡ Guia rápido:    GUIA_RAPIDO.txt"
echo ""
