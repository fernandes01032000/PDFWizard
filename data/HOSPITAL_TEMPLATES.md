# Templates Hospitalares Pré-configurados

Este documento descreve os templates hospitalares que podem ser criados no DocsHgumba.

## 📋 Templates Disponíveis

### 1. Sumário de Alta Hospitalar

**Descrição**: Documento para registro da alta hospitalar do paciente.

**Campos necessários**:
- Nome completo do paciente (text)
- Data de nascimento (date)
- Número do prontuário (text)
- Data de internação (date)
- Data de alta (date - auto-preenchido)
- Diagnóstico principal (textarea)
- Diagnósticos secundários (textarea)
- Procedimentos realizados (textarea)
- Medicações prescritas (textarea)
- Orientações pós-alta (textarea)
- Data do retorno ambulatorial (date)
- Nome do médico responsável (text)
- CRM (text)
- Assinatura do médico (signature)

**Tamanho PDF recomendado**: A4 (210 x 297 mm)

---

### 2. Checklist de Cirurgia Segura (OMS)

**Descrição**: Checklist baseado nas diretrizes da OMS para segurança cirúrgica.

**Seção 1: Antes da Indução Anestésica**
- Paciente confirmou identidade (checkbox)
- Sítio cirúrgico marcado (checkbox)
- Consentimento informado assinado (checkbox)
- Pulsioxímetro funcionando (checkbox)
- Alergias conhecidas? (text)
- Via aérea difícil/risco de aspiração? (checkbox)
- Risco de sangramento > 500ml? (checkbox)

**Seção 2: Antes da Incisão Cirúrgica**
- Todos os membros da equipe se apresentaram (checkbox)
- Cirurgião confirma procedimento (text)
- Eventos críticos revisados (checkbox)
- Antibiótico profilaxia administrada (checkbox)
- Exames de imagem disponíveis (checkbox)

**Seção 3: Antes do Paciente Sair da Sala**
- Procedimento realizado (text)
- Contagem de instrumentos/compressas (checkbox)
- Identificação de espécimes (text)
- Equipamento com problemas? (text)
- Questões para recuperação (textarea)

**Assinaturas**:
- Enfermeiro circulante (signature)
- Anestesista (signature)
- Cirurgião (signature)

**Tamanho PDF recomendado**: A4

---

### 3. Notificação Compulsória de Doenças

**Descrição**: Formulário para notificação obrigatória de doenças e agravos.

**Dados do Paciente**:
- Nome completo (text)
- Data de nascimento (date)
- Sexo (text)
- Nome da mãe (text)
- Endereço completo (textarea)
- Telefone (text)
- Município de residência (text)
- Cartão SUS (text)

**Dados da Notificação**:
- Doença/agravo notificado (text)
- CID-10 (text)
- Data dos primeiros sintomas (date)
- Data da notificação (date - auto-preenchido)
- Critério de confirmação (text)

**Dados da Unidade Notificadora**:
- Nome da unidade de saúde (text)
- Município da unidade (text)
- Código CNES (text)
- Nome do notificante (text)
- Cargo/função (text)
- Assinatura (signature)

**Tamanho PDF recomendado**: A4

---

### 4. Prescrição Médica

**Descrição**: Modelo simplificado de prescrição médica.

**Dados do Paciente**:
- Nome (text)
- Idade (text)
- Peso (text)
- Alergias (text)

**Prescrição**:
- Medicamento 1 (text)
- Dose/Via/Frequência 1 (text)
- Medicamento 2 (text)
- Dose/Via/Frequência 2 (text)
- Medicamento 3 (text)
- Dose/Via/Frequência 3 (text)
- Medicamento 4 (text)
- Dose/Via/Frequência 4 (text)
- Medicamento 5 (text)
- Dose/Via/Frequência 5 (text)
- Observações (textarea)

**Dados do Médico**:
- Nome do médico (text)
- CRM (text)
- Data (date - auto-preenchido)
- Assinatura (signature)
- Carimbo/Logo (image)

**Tamanho PDF recomendado**: A4

---

### 5. Termo de Consentimento Informado

**Descrição**: Modelo genérico de termo de consentimento.

**Campos**:
- Nome do procedimento/tratamento (text)
- Nome do paciente (text)
- CPF (text)
- Declaro que recebi informações sobre (textarea)
- Riscos e benefícios explicados (checkbox)
- Dúvidas esclarecidas (checkbox)
- Concordo com o procedimento (checkbox)
- Data (date - auto-preenchido)
- Assinatura do paciente (signature)
- Nome do médico (text)
- CRM (text)
- Assinatura do médico (signature)
- Testemunha 1 - Nome (text)
- Testemunha 1 - CPF (text)
- Testemunha 1 - Assinatura (signature)

**Tamanho PDF recomendado**: A4

---

### 6. Evolução de Enfermagem

**Descrição**: Registro diário de evolução de enfermagem.

**Campos**:
- Nome do paciente (text)
- Leito (text)
- Data (date - auto-preenchido)
- Hora (text)
- Sinais vitais - PA (text)
- Sinais vitais - FC (text)
- Sinais vitais - FR (text)
- Sinais vitais - Temp (text)
- Sinais vitais - SatO2 (text)
- Estado geral (textarea)
- Diurese (text)
- Evacuação (text)
- Aceitação alimentar (text)
- Intercorrências (textarea)
- Cuidados prestados (textarea)
- Nome do profissional (text)
- COREN (text)
- Assinatura (signature)

**Tamanho PDF recomendado**: A4

---

### 7. Atestado Médico

**Descrição**: Modelo simples de atestado médico.

**Campos**:
- Atesto para os devidos fins que (text - nome paciente)
- Necessita afastamento de suas atividades por (text - dias)
- CID-10 (texto - opcional)
- Observações (textarea)
- Local (text)
- Data (date - auto-preenchido)
- Nome do médico (text)
- CRM (text)
- Assinatura (signature)
- Carimbo (image)

**Tamanho PDF recomendado**: A5 ou A4

---

## 🎨 Como Usar Estes Templates

### Método 1: Criar Manualmente
1. Prepare um PDF base com o layout desejado
2. Abra o DocsHgumba no Modo Design
3. Faça upload do PDF
4. Adicione os campos conforme a lista acima
5. Posicione os campos sobre o PDF
6. Salve com o nome do template

### Método 2: Importar Templates Prontos
Se você receber um arquivo `templates.json` com estes templates:
1. Vá ao Modo Design
2. Clique em "Importar"
3. Selecione o arquivo JSON
4. Os templates estarão disponíveis no Modo Preenchimento

## 📝 Dicas de Criação

### Posicionamento de Campos
- Use a grade (botão de grade na toolbar) para alinhamento preciso
- Campos de assinatura: mínimo 150x40 pixels
- Campos de texto longo: 200x80 pixels recomendado
- Checkboxes: 20x20 pixels

### Nomenclatura
- Use nomes descritivos: "paciente_nome" em vez de "campo1"
- Organize por seções: "alta_diagnostico", "alta_medicacoes"
- Facilita identificação no formulário de preenchimento

### Tamanhos de Fonte
- Texto normal: 12pt
- Títulos: 14-16pt
- Observações/notas: 10pt

### Boas Práticas
- Teste o template preenchendo-o completamente
- Verifique o PDF gerado antes de usar em produção
- Mantenha backup do templates.json em pasta compartilhada
- Documente campos especiais ou obrigatórios

## 🔄 Compartilhamento em Rede

Para compartilhar templates entre vários computadores/tablets:

1. **Configuração inicial**:
   - Salve a pasta DocsHgumba em pasta compartilhada de rede
   - Ex: `\\servidor\compartilhado\DocsHgumba\`

2. **Todos os dispositivos acessam**:
   - Abrem o mesmo `index.html` da rede
   - Todos veem os mesmos templates salvos em `data/templates.json`

3. **Sincronização automática**:
   - Templates salvos ficam disponíveis para todos
   - Cada dispositivo mantém cópia local (localStorage)
   - Mudanças são salvas em ambos os locais

## ⚠️ Observações Importantes

### LGPD e Privacidade
- DocsHgumba é 100% offline - dados não saem do dispositivo
- PDFs gerados devem ser armazenados conforme política hospitalar
- Recomenda-se não salvar dados sensíveis em templates compartilhados
- Use apenas para estrutura de formulários, não para dados de pacientes

### Segurança
- Templates compartilhados não devem conter dados reais de pacientes
- Apenas estrutura de campos deve ser compartilhada
- PDFs gerados devem ser salvos em local seguro

### Manutenção
- Faça backup regular do `templates.json`
- Documente alterações em templates críticos
- Teste templates após atualizações do DocsHgumba

---

**DocsHgumba v2.0** - Sistema 100% Offline para Hospitais
