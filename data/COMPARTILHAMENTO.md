# 🔄 Como Compartilhar Templates Entre Dispositivos

## Entendendo o Armazenamento

DocsHgumba usa **localStorage** do navegador para armazenar templates. Isto significa:
- ✅ 100% offline - não precisa de internet
- ✅ Rápido e confiável
- ⚠️ Cada navegador/dispositivo tem seu próprio armazenamento local

## Métodos de Compartilhamento

### Método 1: Exportar/Importar Manual (Recomendado)

**Ideal para:** Compartilhar templates entre diferentes computadores/tablets.

#### Passo a Passo:

**No computador de origem (que tem os templates):**
1. Abra DocsHgumba
2. Vá para **Modo Design**
3. Clique em **"Exportar Todos"**
4. Salve o arquivo `templates.json` em:
   - Pasta de rede compartilhada: `\\servidor\compartilhado\DocsHgumba\templates.json`
   - OU em pen drive para transferir

**No computador de destino (que precisa dos templates):**
1. Abra DocsHgumba
2. Vá para **Modo Design**
3. Clique em **"Importar"**
4. Selecione o arquivo `templates.json` da rede ou pen drive
5. Templates serão importados e mesclados com os existentes

**Vantagens:**
- ✅ Simples e confiável
- ✅ Controle total sobre o que é compartilhado
- ✅ Não requer configuração de servidor
- ✅ Funciona 100% offline

---

### Método 2: Pasta Compartilhada de Rede

**Ideal para:** Equipe grande que precisa acessar os mesmos templates constantemente.

#### Configuração:

1. **Criar pasta compartilhada no servidor:**
   ```
   \\servidor\compartilhado\DocsHgumba\
   ```

2. **Copiar DocsHgumba para a pasta compartilhada:**
   - Copie toda a pasta DocsHgumba para a rede
   - Certifique-se de que todos têm permissão de leitura

3. **Acessar de qualquer dispositivo:**
   - Windows: `\\servidor\compartilhado\DocsHgumba\index.html`
   - Linux: `/mnt/servidor/compartilhado/DocsHgumba/index.html`
   - Mac: `smb://servidor/compartilhado/DocsHgumba/index.html`

4. **Workflow de uso:**
   - Pessoa A cria template → clica "Exportar Todos"
   - Salva `templates.json` na pasta `\\servidor\compartilhado\DocsHgumba\data\`
   - Pessoa B abre DocsHgumba → clica "Importar"
   - Seleciona `templates.json` da pasta compartilhada
   - Todos os templates ficam disponíveis

**Vantagens:**
- ✅ Centralizado - um local para todos os templates
- ✅ Backup automático (se servidor tem backup)
- ✅ Acesso de qualquer computador na rede

**Desvantagens:**
- ⚠️ Requer rede funcional
- ⚠️ Importação/exportação manual ainda necessária

---

### Método 3: Criar Atalho na Área de Trabalho

**Para facilitar acesso:**

**Windows:**
1. Navegue até a pasta do DocsHgumba
2. Clique com botão direito em `index.html`
3. **Enviar para** → **Área de trabalho (criar atalho)**
4. Renomeie para "DocsHgumba"

**Linux:**
1. Crie arquivo `DocsHgumba.desktop`:
```ini
[Desktop Entry]
Name=DocsHgumba
Exec=xdg-open /caminho/para/DocsHgumba/index.html
Icon=application-pdf
Type=Application
Categories=Office;
```
2. Salve em `~/Desktop/` ou `~/.local/share/applications/`
3. Dê permissão de execução: `chmod +x DocsHgumba.desktop`

---

## Boas Práticas de Compartilhamento

### 1. Template "Master"
- Designe um computador/tablet como "master"
- Todos os templates oficiais são criados lá
- Exportação semanal para pasta de rede
- Outros dispositivos importam quando necessário

### 2. Versionamento
- Ao exportar, adicione data ao nome: `templates_2024-10-28.json`
- Mantenha versões antigas como backup
- Exemplo de estrutura:
  ```
  \\servidor\DocsHgumba\
  ├── templates.json (atual)
  ├── backup/
  │   ├── templates_2024-10-01.json
  │   ├── templates_2024-10-15.json
  │   └── templates_2024-10-28.json
  ```

### 3. Sincronização Periódica
- Estabeleça rotina semanal de sync
- Segunda-feira: exportar templates do master
- Outros dispositivos importam conforme necessário
- Evita divergências entre dispositivos

### 4. Backup Regular
- Use o botão "Exportar Todos" semanalmente
- Salve em local seguro (servidor, cloud corporativo)
- Protege contra perda de dados

---

## Troubleshooting

### Templates não aparecem após importar
**Solução:**
- Verifique se clicou em "Importar" (não "Exportar")
- Certifique-se de que selecionou arquivo `.json` válido
- Tente recarregar a página (F5)
- Verifique console do navegador (F12) para erros

### Arquivo templates.json não abre
**Solução:**
- Não tente abrir, ele é para importação no DocsHgumba
- Use o botão "Importar" dentro do aplicativo
- Se precisar editar, use editor de texto (Notepad++, VSCode)

### Templates duplicados
**Solução:**
- Importar o mesmo arquivo duas vezes cria duplicatas
- Delete duplicatas no Modo Preenchimento (botão lixeira)
- Exporte novamente para atualizar arquivo

### Perdi todos os templates
**Solução:**
- Importe o último backup de templates.json
- Se não tem backup, templates foram salvos apenas em localStorage
- localStorage pode ser limpo ao:
  - Limpar cache/cookies do navegador
  - Usar modo anônimo/privado
  - Reinstalar sistema operacional

**Prevenção:**
- **SEMPRE** faça backup exportando regularmente!
- Salve `templates.json` em pasta de rede

---

## Segurança e Privacidade

### ⚠️ IMPORTANTE - Dados Sensíveis

**Templates NÃO devem conter:**
- ❌ Dados reais de pacientes
- ❌ Informações pessoais
- ❌ Números de documentos reais

**Templates devem conter apenas:**
- ✅ Estrutura de campos (nome, tipo, posição)
- ✅ Layout do formulário
- ✅ PDF base em branco

**Razão:**
- Templates são compartilhados entre dispositivos
- Arquivo JSON pode ser acessado por outros
- Dados de pacientes devem ficar apenas nos PDFs gerados
- PDFs gerados devem ser salvos em local seguro conforme política hospitalar

### Conformidade LGPD/GDPR

DocsHgumba é 100% offline e compatível com LGPD/GDPR:
- ✅ Nenhum dado é enviado para servidores externos
- ✅ Dados ficam no dispositivo local
- ✅ Sem rastreamento ou telemetria
- ✅ Controle total sobre exportação/importação

**Responsabilidade do hospital:**
- Salvar PDFs gerados em local seguro
- Definir política de backup de templates
- Treinar equipe sobre uso correto
- Não incluir dados sensíveis em templates compartilhados

---

## Exemplo de Workflow Hospitalar

**Cenário:** Hospital com 10 tablets para preenchimento de formulários

### Configuração Inicial:
1. **Administrador TI:**
   - Instala DocsHgumba em pasta de rede: `\\servidor\apps\DocsHgumba\`
   - Cria atalhos em todos os tablets
   - Configura backup automático do servidor

2. **Responsável pelos formulários (enfermagem/administração):**
   - Cria templates oficiais no computador master
   - Exporta para: `\\servidor\apps\DocsHgumba\data\templates.json`
   - Comunica equipe que novos templates estão disponíveis

3. **Profissionais de saúde:**
   - Abrem DocsHgumba no tablet
   - Importam templates da pasta de rede (uma única vez)
   - Templates ficam disponíveis localmente no tablet
   - Preenchem formulários conforme necessário
   - PDFs gerados são salvos em prontuário eletrônico

### Atualização de Templates:
1. Responsável cria/atualiza template → Exporta
2. Salva na pasta de rede sobrescrevendo `templates.json`
3. Envia comunicado para equipe
4. Cada profissional abre DocsHgumba → Importa novamente
5. Templates atualizados ficam disponíveis

### Backup:
- Semanal: Exportar templates.json com data
- Mensal: Cópia para cloud corporativo/servidor backup
- Anual: Revisão e limpeza de templates obsoletos

---

## Perguntas Frequentes

**P: Posso acessar de um tablet Android/iPad?**
R: Sim! Abra o navegador (Chrome, Safari) e acesse o index.html via rede ou copie DocsHgumba para o dispositivo.

**P: Funciona sem internet?**
R: Sim! 100% offline. Internet só é necessária para acessar pasta de rede (se aplicável).

**P: Quantos templates posso ter?**
R: Limite do localStorage é ~10MB. Isso permite centenas de templates. Se atingir limite, exporte e arquive templates antigos.

**P: Templates são seguros?**
R: Sim, se não incluir dados sensíveis. Templates devem ter apenas estrutura, não dados de pacientes.

**P: Posso usar em computadores sem DocsHgumba instalado?**
R: Sim, copie a pasta DocsHgumba para pen drive e abra index.html de qualquer dispositivo.

---

**DocsHgumba v2.0** - Persistência Local com Compartilhamento Manual
100% Offline | Seguro | Compatível LGPD
