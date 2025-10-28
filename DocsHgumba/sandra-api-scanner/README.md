# SANDRA API Scanner - Guia de Uso

Este conjunto de scripts permite fazer varredura das APIs do sistema SANDRA a partir do terminal, usando a sessão de login do navegador.

## 📁 Arquivos

- `sandra_api_scanner.py` - Script principal (Python)
- `extrair_cookies.js` - Auxiliar para extrair cookies do navegador
- `SANDRA_SCANNER_README.md` - Este arquivo

## 🚀 Como Usar (Método Recomendado)

### Passo 1: Extrair Cookies do Navegador

1. Abra o sistema SANDRA no navegador e **faça login**
2. Pressione `F12` para abrir o DevTools
3. Vá na aba **Console**
4. Copie o conteúdo do arquivo `extrair_cookies.js` e cole no console
5. Pressione `Enter`
6. O script irá copiar automaticamente o código Python com seus cookies

### Passo 2: Configurar o Scanner

1. Abra o arquivo `sandra_api_scanner.py` em um editor
2. Localize a seção `COOKIES` (linha ~24)
3. Cole o código que foi copiado do navegador
4. Salve o arquivo

### Passo 3: Executar o Scanner

```bash
python3 sandra_api_scanner.py
```

### Passo 4: Verificar Resultados

O script irá:
- Testar todas as rotas de API
- Exibir o progresso no terminal
- Gerar um relatório em `sandra_resultados.json`

## 📋 Requisitos

```bash
# Python 3.6 ou superior
python3 --version

# Biblioteca requests
pip3 install requests
```

## 🔧 Método Manual (Alternativo)

Se preferir não usar o script de extração de cookies:

1. Abra DevTools (F12) no navegador
2. Vá em **Application** (Chrome) ou **Storage** (Firefox)
3. Clique em **Cookies** → `https://sandra.hgumba.eb.mil.br`
4. Copie os valores de:
   - `ci_session`
   - `csrf_cookie_sandra`
5. Cole manualmente no arquivo `sandra_api_scanner.py`

## 📊 Saída Esperada

O script irá exibir:

```
================================================================================
🔍 VALIDANDO CONFIGURAÇÃO
================================================================================
✅ Token CSRF: 1a2b3c4d5e6f7g8h9i...
✅ Sessão: abc123def456...
📡 Base URL: https://sandra.hgumba.eb.mil.br

================================================================================
🚀 SANDRA API SCANNER - INICIANDO VARREDURA
================================================================================
Data/Hora: 27/10/2025 14:30:00
Total de rotas: 12
--------------------------------------------------------------------------------

[1/12] Testando /atendimentos/pacientesInternados...
✅ [200] /atendimentos/pacientesInternados (234ms)
   └─ 15 registros (Array de Dados)

[2/12] Testando /atendimentos/pacientesUrgenciaEmergenciaAcolhimento...
✅ [200] /atendimentos/pacientesUrgenciaEmergenciaAcolhimento (189ms)
   └─ 3 registros (Array de Dados)

...
```

## 📄 Arquivo de Saída

O arquivo `sandra_resultados.json` conterá:

```json
{
  "/atendimentos/pacientesInternados": {
    "status": 200,
    "tempo_ms": 234,
    "tipo": "JSON",
    "resumo": "15 registros (Array de Dados)",
    "descricao": "Lista de pacientes atualmente internados.",
    "exemplo_dados": {
      "data": [...]
    }
  },
  ...
}
```

## ⚠️ Problemas Comuns

### Erro: "Token CSRF não configurado"
- Execute o script `extrair_cookies.js` no console do navegador
- Certifique-se de estar logado no SANDRA

### Erro: "ERRO DE REDE"
- Verifique sua conexão com a rede do HGU
- Certifique-se de que o site SANDRA está acessível

### Erro 401/403 (Não autorizado)
- Seus cookies expiraram
- Faça login novamente no navegador
- Execute novamente o script `extrair_cookies.js`

### Erro: "ModuleNotFoundError: No module named 'requests'"
```bash
pip3 install requests
```

## 🔒 Segurança

**IMPORTANTE:**
- Nunca compartilhe os valores dos cookies
- Os cookies contêm sua sessão de autenticação
- Execute apenas em ambientes confiáveis
- Delete o arquivo após o uso se contiver dados sensíveis

## 📝 Personalização

### Adicionar Novas Rotas

Edite o arquivo `sandra_api_scanner.py` e adicione na lista `self.rotas`:

```python
{
    "path": "/sua/nova/rota",
    "description": "Descrição da rota"
}
```

### Modificar Timeout

Altere na linha do `requests.post`:

```python
response = requests.post(
    url,
    headers=self.headers,
    cookies=self.cookies,
    data=data,
    timeout=60,  # Altere aqui (em segundos)
    allow_redirects=False
)
```

### Adicionar Mais Cookies

Se necessário, adicione mais cookies no dicionário:

```python
COOKIES = {
    "ci_session": "...",
    "csrf_cookie_sandra": "...",
    "outro_cookie": "valor"
}
```

## 🤝 Suporte

Para problemas ou dúvidas:
1. Verifique os logs de erro no terminal
2. Consulte este README
3. Verifique se está conectado à rede do HGU

## 📜 Licença

Script desenvolvido por Manus AI para uso interno do HGU.
