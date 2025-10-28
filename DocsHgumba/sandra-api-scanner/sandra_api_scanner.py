#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SANDRA API Scanner - Script para Terminal
Autor: Manus AI
Data: 27/10/2025

Objetivo: Testar todas as rotas de API conhecidas do sistema SANDRA,
coletar dados de exemplo, medir tempo de resposta e gerar um relatório.

INSTRUÇÕES:
1. Certifique-se de estar logado no sistema SANDRA no navegador
2. Abra DevTools (F12) → Application/Storage → Cookies → https://sandra.hgumba.eb.mil.br
3. Copie os valores dos cookies (principalmente ci_session e csrf_cookie_sandra)
4. Cole os valores nas variáveis COOKIES abaixo
5. Execute: python3 sandra_api_scanner.py
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, Any

# ===== CONFIGURAÇÃO - PREENCHA COM SEUS COOKIES =====
BASE_URL = "https://sandra.hgumba.eb.mil.br"

# IMPORTANTE: Copie estes valores do DevTools do seu navegador
COOKIES = {
    "ci_session": "SEU_CI_SESSION_AQUI",  # Cookie de sessão principal
    "csrf_cookie_sandra": "SEU_CSRF_COOKIE_AQUI"  # Token CSRF
}

# Se você tiver outros cookies, adicione aqui
# "outro_cookie": "valor",

# ===== FIM DA CONFIGURAÇÃO =====


class SandraScanner:
    """Scanner de APIs do sistema SANDRA."""

    def __init__(self):
        self.base_url = BASE_URL
        self.cookies = COOKIES
        self.resultados = {}

        # Extrai o token CSRF do cookie
        self.csrf_token = COOKIES.get("csrf_cookie_sandra", "")

        # Headers padrão para simular requisição AJAX
        self.headers = {
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
        }

        # Rotas de API identificadas
        self.rotas = [
            {
                "path": "/atendimentos/pacientesInternados",
                "description": "Lista de pacientes atualmente internados."
            },
            {
                "path": "/atendimentos/pacientesUrgenciaEmergenciaAcolhimento",
                "description": "Lista de pacientes em acolhimento na Urgência/Emergência."
            },
            {
                "path": "/atendimentos/pacientesUrgenciaEmergenciaEmAtendimento",
                "description": "Lista de pacientes em atendimento na Urgência/Emergência."
            },
            {
                "path": "/atendimentos/pacientesUrgenciaEmergenciaMeusPacientes",
                "description": "Lista de pacientes atribuídos ao usuário logado."
            },
            {
                "path": "/atendimentos/verificaSala",
                "description": "Verifica status de sala ou ambiente."
            },
            {
                "path": "/atendimentos/filtrarUnidadeInternacao",
                "description": "Filtra unidades de internação."
            },
            {
                "path": "/especialidades/listaDropDownEspecialistasDisponivelMarcacao",
                "description": "Lista de especialistas disponíveis para marcação."
            },
            {
                "path": "/especialidades/listaDropDownEspecialidadesDisponivelMarcacao",
                "description": "Lista de especialidades disponíveis para marcação."
            },
            {
                "path": "/questionarios/verificaExistencia",
                "description": "Verifica a existência de questionários pendentes."
            },
            {
                "path": "/pacientes/getOutrosContatosTmp",
                "description": "Obtém contatos temporários de pacientes."
            },
            {
                "path": "/atendimentos/listaDropDownUnidadesInternacao",
                "description": "Lista dropdown de unidades de internação."
            },
            {
                "path": "/atendimentos/listaDropDownExamesLista",
                "description": "Lista dropdown de exames disponíveis."
            }
        ]

    def validar_configuracao(self) -> bool:
        """Valida se os cookies foram configurados."""
        print("=" * 80)
        print("🔍 VALIDANDO CONFIGURAÇÃO")
        print("=" * 80)

        if not self.csrf_token or self.csrf_token == "SEU_CSRF_COOKIE_AQUI":
            print("❌ ERRO: Token CSRF não configurado!")
            print("   Por favor, copie o valor do cookie 'csrf_cookie_sandra' do navegador.")
            return False

        if COOKIES.get("ci_session") == "SEU_CI_SESSION_AQUI":
            print("❌ ERRO: Cookie de sessão (ci_session) não configurado!")
            print("   Por favor, copie o valor do cookie 'ci_session' do navegador.")
            return False

        print(f"✅ Token CSRF: {self.csrf_token[:20]}...")
        print(f"✅ Sessão: {COOKIES['ci_session'][:20]}...")
        print(f"📡 Base URL: {self.base_url}")
        print()
        return True

    def testar_rota(self, rota: Dict[str, str]) -> Dict[str, Any]:
        """Testa uma rota específica da API."""
        url = self.base_url + rota["path"]

        # Corpo da requisição com token CSRF
        data = {"csrf_sandra": self.csrf_token}

        inicio = time.time()

        try:
            response = requests.post(
                url,
                headers=self.headers,
                cookies=self.cookies,
                data=data,
                timeout=30,
                allow_redirects=False
            )

            tempo_ms = int((time.time() - inicio) * 1000)

            # Tenta parsear como JSON
            try:
                json_data = response.json()
                tipo = "JSON"

                # Gera resumo baseado na estrutura
                if isinstance(json_data, dict) and "data" in json_data:
                    if isinstance(json_data["data"], list):
                        resumo = f"{len(json_data['data'])} registros (Array de Dados)"
                    else:
                        resumo = "JSON com campo 'data' não-array"
                else:
                    resumo = f"JSON: {str(json_data)[:80]}..."

                exemplo_dados = json_data

            except json.JSONDecodeError:
                tipo = "HTML/Texto"
                texto = response.text
                resumo = f"HTML/Texto: {texto[:80]}..."
                exemplo_dados = texto[:500]

            resultado = {
                "status": response.status_code,
                "tempo_ms": tempo_ms,
                "tipo": tipo,
                "resumo": resumo,
                "descricao": rota["description"],
                "exemplo_dados": exemplo_dados
            }

            # Exibe no console
            status_emoji = "✅" if 200 <= response.status_code < 300 else "⚠️"
            print(f"{status_emoji} [{response.status_code}] {rota['path']} ({tempo_ms}ms)")
            print(f"   └─ {resumo}")

            return resultado

        except requests.exceptions.RequestException as e:
            resultado = {
                "status": "ERRO DE REDE",
                "erro": str(e),
                "descricao": rota["description"]
            }
            print(f"❌ FALHA em {rota['path']}: {str(e)}")
            return resultado

    def executar_varredura(self):
        """Executa a varredura em todas as rotas."""
        print("=" * 80)
        print("🚀 SANDRA API SCANNER - INICIANDO VARREDURA")
        print("=" * 80)
        print(f"Data/Hora: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
        print(f"Total de rotas: {len(self.rotas)}")
        print("-" * 80)
        print()

        for i, rota in enumerate(self.rotas, 1):
            print(f"[{i}/{len(self.rotas)}] Testando {rota['path']}...")
            resultado = self.testar_rota(rota)
            self.resultados[rota["path"]] = resultado
            print()

            # Pequeno delay para não sobrecarregar o servidor
            time.sleep(0.5)

        print("-" * 80)
        print("🏁 VARREDURA CONCLUÍDA!")
        print("-" * 80)
        print()

    def gerar_relatorio(self):
        """Gera relatório em formato de tabela."""
        print("=" * 80)
        print("📊 RELATÓRIO RESUMIDO")
        print("=" * 80)
        print()

        # Cabeçalho da tabela
        print(f"{'Rota':<50} {'Status':<10} {'Tempo':<10} {'Tipo':<10}")
        print("-" * 80)

        for rota, dados in self.resultados.items():
            status = str(dados.get("status", "N/A"))
            tempo = f"{dados.get('tempo_ms', 0)}ms"
            tipo = dados.get("tipo", "N/A")

            print(f"{rota:<50} {status:<10} {tempo:<10} {tipo:<10}")

        print()

    def salvar_json(self, arquivo: str = "sandra_resultados.json"):
        """Salva os resultados em arquivo JSON."""

        # Remove dados muito grandes para facilitar leitura
        resultados_limpos = {}
        for rota, dados in self.resultados.items():
            dados_copia = dados.copy()
            if "exemplo_dados" in dados_copia:
                exemplo = dados_copia["exemplo_dados"]
                if isinstance(exemplo, str) and len(exemplo) > 500:
                    dados_copia["exemplo_dados"] = exemplo[:500] + "... (TRUNCADO)"
            resultados_limpos[rota] = dados_copia

        with open(arquivo, "w", encoding="utf-8") as f:
            json.dump(resultados_limpos, f, indent=2, ensure_ascii=False)

        print(f"✅ Relatório completo salvo em: {arquivo}")
        print()


def main():
    """Função principal."""
    scanner = SandraScanner()

    # Valida configuração antes de iniciar
    if not scanner.validar_configuracao():
        print()
        print("=" * 80)
        print("📖 COMO OBTER OS COOKIES:")
        print("=" * 80)
        print("1. Abra o site SANDRA no navegador e faça login")
        print("2. Pressione F12 para abrir DevTools")
        print("3. Vá em Application (Chrome) ou Storage (Firefox)")
        print("4. Clique em Cookies → https://sandra.hgumba.eb.mil.br")
        print("5. Copie os valores de:")
        print("   - ci_session")
        print("   - csrf_cookie_sandra")
        print("6. Cole os valores no início deste script (variável COOKIES)")
        print("7. Execute novamente: python3 sandra_api_scanner.py")
        print("=" * 80)
        return

    # Executa a varredura
    scanner.executar_varredura()

    # Gera relatórios
    scanner.gerar_relatorio()
    scanner.salvar_json()

    print("=" * 80)
    print("✨ SCANNER FINALIZADO COM SUCESSO!")
    print("=" * 80)


if __name__ == "__main__":
    main()
