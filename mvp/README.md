# DocsHgumba MVP - PDF Template System

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Offline](https://img.shields.io/badge/status-100%25%20offline-success)

## 📖 Sobre

**DocsHgumba MVP** é uma versão simplificada e minimalista do sistema completo DocsHgumba. Este MVP foca nas funcionalidades essenciais para criar templates de PDF com campos editáveis e preencher formulários de forma offline.

### ✨ Diferenças: MVP vs. Versão Completa

| Aspecto | **MVP** | **Versão Completa** |
|---------|---------|---------------------|
| **Linhas de código** | ~750 | 4.515 |
| **Páginas** | 3 | 6 |
| **Tipos de campos** | 5 | 11 |
| **Autenticação** | ❌ Não | ✅ Sim (PBKDF2) |
| **Dashboard** | ❌ Não | ✅ Sim |
| **Histórico** | ❌ Não | ✅ Sim |
| **Biblioteca de textos** | ❌ Não | ✅ Sim |
| **Tema escuro** | ❌ Não | ✅ Sim |
| **Validações** | ❌ Não | ✅ Sim (CPF, CNS, etc) |
| **Funcionalidades** | 6 básicas | 30+ avançadas |
| **Tempo de dev** | 1 semana | 2-3 meses |

---

## 🚀 Funcionalidades

### ✅ Incluídas no MVP

1. **Upload de PDF** - Arraste ou selecione um arquivo PDF
2. **Criar Campos** - 5 tipos básicos de campos
3. **Posicionar Campos** - Arrastar e redimensionar campos
4. **Salvar Template** - Armazenamento no localStorage
5. **Listar Templates** - Visualizar todos os templates criados
6. **Preencher Template** - Formulário dinâmico + preview ao vivo
7. **Gerar PDF** - Download do PDF preenchido

### 📝 Tipos de Campos Suportados

| Tipo | Descrição | Ícone |
|------|-----------|-------|
| **Texto** | Campo de texto simples | 🔤 |
| **Área de Texto** | Campo de texto multi-linha | 📝 |
| **Data** | Seletor de data | 📅 |
| **Checkbox** | Caixa de seleção | ☑️ |
| **Assinatura** | Canvas para desenhar assinatura | ✍️ |

---

## 🛠️ Instalação

### Requisitos

- **Navegador moderno** (Chrome, Firefox, Edge, Safari)
- **Nenhum servidor necessário** (funciona com `file://`)

### Passo a Passo

1. **Clone ou baixe o repositório**

```bash
cd PDFWizard/mvp
```

2. **Abra o arquivo `index.html`**

   - **Opção 1:** Clique duas vezes no arquivo
   - **Opção 2:** Arraste para o navegador
   - **Opção 3:** Servidor local (opcional)

```bash
# Se preferir usar servidor local
python3 -m http.server 8000
# Abra: http://localhost:8000
```

3. **Pronto!** O sistema está funcionando.

---

## 📚 Como Usar

### 1️⃣ Criar um Template

1. Clique em **"Criar Template"** no menu superior
2. Faça **upload de um PDF** (arraste ou selecione)
3. Adicione campos clicando nos botões:
   - Texto
   - Área de Texto
   - Data
   - Checkbox
   - Assinatura
4. **Arraste** os campos para posicionar sobre o PDF
5. **Clique** em um campo para editar propriedades:
   - Nome do campo
   - Largura e altura
   - Tamanho da fonte
6. Digite um **nome para o template**
7. Clique em **"Salvar Template"**

### 2️⃣ Preencher um Template

1. Na lista de templates, clique em **"Preencher"**
2. Ou navegue para **"Preencher Template"** e selecione o template
3. Preencha os campos do formulário
4. Veja o **preview ao vivo** no lado direito
5. Para assinatura:
   - Clique em **"Desenhar Assinatura"**
   - Desenhe com o mouse
   - Clique em **"Salvar Assinatura"**
6. Clique em **"Gerar PDF"** para download

### 3️⃣ Gerenciar Templates

- **Editar:** Clique em "Editar" para modificar o template
- **Excluir:** Clique em "Excluir" para remover o template
- **Duplicar:** Edite e salve com novo nome

---

## 📁 Estrutura de Arquivos

```
mvp/
├── index.html          # Interface do usuário (SPA)
├── app.js              # Lógica da aplicação (~400 linhas)
├── style.css           # Estilos CSS (~150 linhas)
└── README.md           # Este arquivo

assets/ (compartilhado com versão completa)
├── js/
│   ├── pdf.min.js              # PDF.js (Mozilla)
│   ├── pdf.worker.min.js       # PDF.js worker
│   ├── pdf-lib.min.js          # PDF-lib
│   └── bootstrap.bundle.min.js # Bootstrap JS
└── css/
    ├── bootstrap.min.css       # Bootstrap CSS
    └── bootstrap-icons.css     # Bootstrap Icons
```

**Total:** ~750 linhas de código

---

## 💾 Armazenamento de Dados

### localStorage

Todos os dados são armazenados localmente no navegador:

- **Chave:** `mvpTemplates`
- **Formato:** JSON array de templates
- **Capacidade:** ~5-10 MB (dependente do navegador)
- **Templates suportados:** ~50 templates de tamanho médio

### Estrutura de Dados

```javascript
{
  id: "template_1234567890",
  name: "Nome do Template",
  pdfData: "base64_encoded_pdf_data",
  fields: [
    {
      id: "field_1234567890",
      type: "text|textarea|date|checkbox|signature",
      name: "Nome do Campo",
      x: 100,        // Posição X em pixels
      y: 50,         // Posição Y em pixels
      width: 150,    // Largura em pixels
      height: 30,    // Altura em pixels
      fontSize: 12   // Tamanho da fonte
    }
  ],
  createdAt: "2025-10-29T12:00:00.000Z"
}
```

---

## 🔧 Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **HTML5** | - | Estrutura da interface |
| **CSS3** | - | Estilos e layout responsivo |
| **JavaScript** | ES6+ | Lógica da aplicação |
| **Bootstrap** | 5.0 | Framework CSS |
| **PDF.js** | Latest | Renderização de PDFs |
| **PDF-lib** | Latest | Geração de PDFs |
| **Bootstrap Icons** | Latest | Ícones |

### APIs do Navegador

- **localStorage** - Persistência de dados
- **Canvas API** - Renderização de PDF e assinatura
- **File API** - Upload de arquivos
- **Blob API** - Download de PDFs

---

## 🎯 Casos de Uso

### 1. Atestados Médicos

1. Crie template com PDF de atestado em branco
2. Adicione campos: nome paciente, data, CID, dias de afastamento
3. Preencha para cada paciente
4. Gere e imprima PDFs

### 2. Formulários Administrativos

1. Upload de formulário PDF
2. Adicione checkboxes e campos de texto
3. Preencha conforme necessário
4. Salve PDFs preenchidos

### 3. Receitas Médicas

1. Template com PDF de receita
2. Campos: nome medicamento, dosagem, via, frequência
3. Preencha para cada prescrição
4. Gere PDF para paciente

---

## 🐛 Troubleshooting

### PDF não aparece após upload

- **Causa:** Arquivo corrompido ou muito grande
- **Solução:** Use PDFs menores que 5MB

### Campos não aparecem no PDF gerado

- **Causa:** Coordenadas fora dos limites do PDF
- **Solução:** Verifique se campos estão dentro da área visível

### localStorage cheio

- **Causa:** Muitos templates armazenados
- **Solução:** Exclua templates antigos ou use navegador diferente

### Assinatura não salva

- **Causa:** Canvas vazio
- **Solução:** Desenhe algo antes de clicar em "Salvar"

---

## 📊 Limitações Conhecidas

1. **Apenas primeira página** - Templates usam somente a primeira página do PDF
2. **Sem backup automático** - Dados podem ser perdidos se limpar cache do navegador
3. **Sem importação/exportação** - Não é possível transferir templates entre navegadores
4. **Sem validações** - Campos não têm validação de formato (CPF, email, etc)
5. **Sem cálculos** - Não há campos calculados (idade, IMC, etc)
6. **Sem lógica condicional** - Campos não podem mostrar/ocultar baseado em condições

---

## 🚀 Próximos Passos (Roadmap)

### Versão 1.1
- [ ] Export/Import de templates (JSON)
- [ ] Suporte a múltiplas páginas
- [ ] Duplicação de templates
- [ ] Validação básica (obrigatório)

### Versão 1.2
- [ ] Máscaras de input (CPF, telefone, CEP)
- [ ] Campo numérico com min/max
- [ ] Campo hora
- [ ] Mais tipos de campos (select, radio)

### Versão 2.0
- [ ] Autenticação simples
- [ ] Histórico de PDFs gerados
- [ ] Categorização de templates
- [ ] Tema escuro

---

## 🤝 Contribuindo

Este é um MVP simplificado. Sugestões de melhorias são bem-vindas!

---

## 📄 Licença

MIT License - Livre para uso pessoal e comercial.

---

## 📞 Suporte

- **Issues:** Reporte problemas via GitHub Issues
- **Documentação:** Este README
- **Versão Completa:** Veja `/` para a versão completa do DocsHgumba

---

## ✅ Checklist de Verificação

Antes de usar, verifique:

- [ ] Navegador moderno instalado
- [ ] JavaScript habilitado
- [ ] localStorage disponível
- [ ] Arquivos `assets/` acessíveis
- [ ] PDF de teste preparado

---

**Desenvolvido como MVP do projeto DocsHgumba**
**Versão:** 1.0.0
**Data:** Outubro 2025
**Status:** Produção ✅
