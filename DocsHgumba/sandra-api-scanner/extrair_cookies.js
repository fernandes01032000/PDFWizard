/**
 * Script auxiliar para extrair cookies do navegador
 *
 * INSTRUÇÕES:
 * 1. Certifique-se de estar logado no SANDRA
 * 2. Abra o Console do Desenvolvedor (F12)
 * 3. Cole este código no console e pressione Enter
 * 4. Copie a saída e use no script Python
 */

(function() {
    console.clear();
    console.log("=" .repeat(70));
    console.log("🍪 EXTRATOR DE COOKIES PARA SANDRA API SCANNER");
    console.log("=" .repeat(70));
    console.log();

    // Extrai cookies relevantes
    const cookies = {
        ci_session: "",
        csrf_cookie_sandra: ""
    };

    // Parse dos cookies
    document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name === 'ci_session') {
            cookies.ci_session = value;
        } else if (name === 'csrf_cookie_sandra') {
            cookies.csrf_cookie_sandra = value;
        }
    });

    // Verifica se encontrou os cookies
    if (!cookies.ci_session) {
        console.error("❌ Cookie 'ci_session' não encontrado!");
        console.warn("Você precisa estar logado no sistema SANDRA.");
        return;
    }

    if (!cookies.csrf_cookie_sandra) {
        console.error("❌ Cookie 'csrf_cookie_sandra' não encontrado!");
        console.warn("Verifique se o sistema está funcionando corretamente.");
        return;
    }

    // Exibe os cookies encontrados
    console.log("✅ Cookies encontrados com sucesso!");
    console.log();
    console.log("📋 COPIE O CÓDIGO ABAIXO E COLE NO SCRIPT PYTHON:");
    console.log();
    console.log("─".repeat(70));

    const pythonCode = `COOKIES = {
    "ci_session": "${cookies.ci_session}",
    "csrf_cookie_sandra": "${cookies.csrf_cookie_sandra}"
}`;

    console.log(pythonCode);
    console.log("─".repeat(70));
    console.log();

    // Tenta copiar para clipboard
    navigator.clipboard.writeText(pythonCode).then(() => {
        console.log("✅ Código Python COPIADO para a área de transferência!");
        console.log("   Cole diretamente no arquivo sandra_api_scanner.py");
    }).catch(err => {
        console.warn("⚠️  Não foi possível copiar automaticamente.");
        console.log("   Por favor, copie manualmente o código acima.");
    });

    console.log();
    console.log("=" .repeat(70));
    console.log("🚀 Agora execute no terminal: python3 sandra_api_scanner.py");
    console.log("=" .repeat(70));
})();
