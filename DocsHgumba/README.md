# 📄 DocsHgumba

Sistema 100% offline para criação e preenchimento de PDFs com campos editáveis.

**Desenvolvido para:** Hospital/Unidades de Saúde - Uso interno sem dependência de internet.

---

## 🎯 O que é o DocsHgumba?

DocsHgumba é uma aplicação web leve que funciona **totalmente no navegador**, sem precisar de servidor ou conexão com a internet. Permite:

1. **Criar templates** de PDF com campos editáveis (texto, data, checkbox, assinatura)
2. **Salvar templates** reutilizáveis
3. **Preencher formulários** com preview em tempo real
4. **Gerar PDFs** preenchidos para download

---

## 📦 Instalação

### Opção 1: Instalação Automática

```bash
cd ~/Documentos/"asp fernandes"/DocsHgumba
chmod +x install.sh
./install.sh
```

### Opção 2: Instalação Manual

Basta ter a pasta `DocsHgumba` com os seguintes arquivos:

```
DocsHgumba/
├── index.html
├── app.js
├── style.css
├── install.sh
├── README.md
├── assets/
│   ├── pdfs/
│   └── generated/
└── data/
    └── templates.json
```

---

## 🚀 Como Usar

### 1️⃣ Abrir o DocsHgumba

**No seu computador:**

1. Abra o navegador Chrome ou Edge
2. Pressione `Ctrl + O`
3. Navegue até:
   ```
   /home/usuario/Documentos/asp fernandes/DocsHgumba/index.html
   ```
4. Ou cole este caminho na barra de endereços:
   ```
   file:///home/usuario/Documentos/asp%20fernandes/DocsHgumba/index.html
   ```

**Em rede compartilhada:**

Se a pasta `asp fernandes` estiver compartilhada na rede, outros PCs podem acessar diretamente o mesmo arquivo HTML.

---

### 2️⃣ Modo Design: Criar Templates

Este modo é usado para criar templates reutilizáveis.

#### Passo a passo:

1. **Upload do PDF base**
   - Clique em "Upload PDF" (painel esquerdo)
   - Selecione um PDF existente (ex: formulário em branco, checklist, etc.)

2. **Adicionar campos**
   - Clique nos tipos de campo (painel esquerdo):
     - 📝 **Texto (linha única)** - Nome, CPF, etc.
     - 📄 **Texto (múltiplas linhas)** - Observações, descrições
     - ☑️ **Checkbox** - Sim/Não, marcações
     - 📅 **Data** - Datas
     - ✍️ **Assinatura** - Nome para assinar

3. **Posicionar campos**
   - Os campos aparecem no canvas (centro)
   - **Clique e arraste** para posicionar sobre o PDF
   - **Clique no X vermelho** para remover campo

4. **Salvar template**
   - Digite um nome no campo "Nome do template"
   - Clique em "Salvar Template"
   - Exemplos de nomes:
     - "Sumário de Alta"
     - "Check List Ambulatório"
     - "Notificação de Acidente Biológico"

---

### 3️⃣ Modo Preenchimento: Usar Templates

Este modo é usado para preencher os templates criados.

#### Passo a passo:

1. **Selecionar template**
   - Clique na aba "Modo Preenchimento"
   - Escolha um template salvo no dropdown

2. **Preencher campos**
   - Digite os dados nos campos (painel esquerdo)
   - O preview atualiza em tempo real (painel direito)

3. **Gerar PDF**
   - Clique em "Gerar e Baixar PDF"
   - O PDF preenchido será baixado automaticamente
   - Salve onde desejar (ex: `assets/generated/`)

4. **Limpar formulário** (opcional)
   - Clique em "Limpar Formulário" para começar novo preenchimento

---

## 📂 Estrutura de Arquivos

```
DocsHgumba/
├── index.html              # Aplicação principal (abra este arquivo)
├── app.js                  # Lógica de PDFs (JavaScript)
├── style.css               # Estilo verde Exército
├── install.sh              # Script de instalação
├── README.md               # Este arquivo
├── assets/
│   ├── pdfs/               # PDFs originais (opcional)
│   └── generated/          # PDFs gerados (salvamento manual)
└── data/
    └── templates.json      # Metadados (não editar)
```

---

## 💾 Onde os Dados São Salvos?

### Templates

Os templates são salvos no **localStorage do navegador**, que fica armazenado em:

```
~/.config/google-chrome/Default/Local Storage/
```

**Importante:** Se você limpar o cache do navegador, os templates serão apagados!

### PDFs Gerados

Os PDFs gerados são **baixados automaticamente** pelo navegador. Por padrão vão para:

```
~/Downloads/
```

Você pode movê-los manualmente para `assets/generated/` ou qualquer pasta da rede.

---

## 🌐 Usar em Rede Compartilhada

### Configuração de Rede

1. **Compartilhar a pasta `asp fernandes`** na rede local
2. **Dar permissões de leitura/escrita** para todos os usuários
3. **Anotar o caminho de rede**, exemplo:
   ```
   \\192.168.1.100\asp fernandes\DocsHgumba\
   ```

### Acesso de Outros PCs

Cada computador da rede pode abrir o arquivo HTML diretamente:

```
file://CAMINHO-DA-REDE/DocsHgumba/index.html
```

**Vantagens:**
- Todos veem os mesmos templates (se usar localStorage compartilhado)
- PDFs podem ser salvos em pasta centralizada
- Sem necessidade de servidor

**Limitação:**
- localStorage é **local de cada navegador**, então templates criados em um PC não aparecem automaticamente em outros
- **Solução futura:** Usar `templates.json` para persistência compartilhada

---

## 🎨 Personalização

### Cores

O tema usa **verde Exército (#53643B)**. Para mudar:

Edite `style.css`:

```css
:root {
    --army-green: #53643B;      /* Cor principal */
    --army-green-dark: #3d4a2b;  /* Hover/escuro */
    --army-green-light: #6b7d4d; /* Claro */
}
```

### Tipos de Campo

Para adicionar novos tipos de campo, edite `app.js` na função `renderFormFields()`.

---

## 🔧 Troubleshooting

### Problema: "PDF não carrega"

**Solução:**
- Verifique se o arquivo é um PDF válido
- Tente outro navegador (Chrome ou Edge funcionam melhor)
- PDFs com muitas páginas podem demorar

### Problema: "Templates não aparecem no Modo Preenchimento"

**Solução:**
- Certifique-se de ter criado e **salvado** templates no Modo Design
- Verifique o console do navegador (F12) para erros
- Limpe o cache e recarregue

### Problema: "Campos não aparecem no PDF gerado"

**Solução:**
- Certifique-se de ter preenchido os campos
- Campos em branco não aparecem no PDF final
- Verifique se salvou o template corretamente

### Problema: "Erro ao gerar PDF"

**Solução:**
- Feche e reabra o DocsHgumba
- Tente carregar o template novamente
- Verifique se o PDF original não está corrompido

---

## 📋 Casos de Uso Sugeridos

### Templates Médicos

- ✅ **Sumário de Alta Hospitalar**
- ✅ **Atendimento de Síndrome Gripal**
- ✅ **Check List de Ambulatório**
- ✅ **Check List de Farmácia (CCIH)**
- ✅ **Notificação de Acidente Biológico**
- ✅ **Protocolo de Cirurgia Segura**
- ✅ **Relatório de Evolução (EVAM)**
- ✅ **Devolução de Medicamentos**

### Templates Administrativos

- 📄 Relatórios
- 📝 Formulários de requisição
- 📊 Checklists de inspeção
- 🔖 Certificados

---

## ⚙️ Requisitos Técnicos

### Navegadores Suportados

- ✅ Google Chrome 90+
- ✅ Microsoft Edge 90+
- ⚠️ Firefox (pode ter limitações)
- ❌ Internet Explorer (não suportado)

### Sistema Operacional

- ✅ Linux (testado)
- ✅ Windows 10/11
- ✅ macOS

### Dependências

**Nenhuma!** Tudo funciona via CDN:

- Bootstrap 5.0
- PDF.js (Mozilla)
- PDF-lib

---

## 🔒 Segurança e Privacidade

- ✅ **100% offline** - Nenhum dado sai do computador
- ✅ **Sem rastreamento** - Nenhuma coleta de dados
- ✅ **Código aberto** - Todo código é visível e auditável
- ✅ **Sem autenticação** - Acesso livre para usuários autorizados

**Atenção:** Como não há autenticação, qualquer pessoa com acesso ao arquivo pode usar o sistema.

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique este README
2. Verifique a seção **Troubleshooting**
3. Verifique o console do navegador (F12)
4. Entre em contato com o administrador do sistema

---

## 📝 Notas da Versão

### v1.0.0 (2025-10-28)

- ✅ Implementação inicial
- ✅ Modo Design para criar templates
- ✅ Modo Preenchimento para usar templates
- ✅ Suporte a 5 tipos de campo
- ✅ Preview em tempo real
- ✅ Geração de PDF com pdf-lib
- ✅ Tema verde Exército
- ✅ 100% offline

---

## 🚀 Roadmap Futuro

Possíveis melhorias:

- [ ] Persistência em `templates.json` (compartilhamento entre PCs)
- [ ] Editor de propriedades de campo (tamanho de fonte, cores)
- [ ] Suporte a múltiplas páginas
- [ ] Histórico de PDFs gerados
- [ ] Modo escuro
- [ ] Exportar/importar templates
- [ ] Assinatura digital com canvas
- [ ] Campos calculados (somas, datas automáticas)
- [ ] Modo servidor opcional (Node.js)

---

## 📄 Licença

Projeto de uso interno - Hospital/Unidades de Saúde.

---

**DocsHgumba** - Desenvolvido para facilitar o trabalho de profissionais de saúde. ❤️🏥
