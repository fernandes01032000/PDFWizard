# 🚀 Início Rápido - DocsHgumba MVP

## ⏱️ Em 2 minutos

### 1. Abrir o Sistema (10 segundos)

```bash
# Navegue até a pasta
cd PDFWizard/mvp

# Abra no navegador
# Opção 1: Clique duas vezes em index.html
# Opção 2: Arraste index.html para o navegador
```

### 2. Criar Primeiro Template (60 segundos)

1. Clique em **"Criar Template"**
2. Clique em **"Escolher arquivo"** e selecione um PDF
3. Clique em **"Texto"** para adicionar campo
4. Arraste o campo azul para posição desejada no PDF
5. Digite um nome: "Meu Primeiro Template"
6. Clique em **"Salvar Template"** ✅

### 3. Preencher Template (50 segundos)

1. Na lista, clique em **"Preencher"** no template criado
2. Digite um texto no campo do formulário
3. Veja o preview atualizar automaticamente
4. Clique em **"Gerar PDF"** 📄
5. Pronto! PDF baixado ✅

---

## 🎯 Tutorial Completo (5 minutos)

### Passo 1: Preparar PDF de Teste

Tenha em mãos:
- Um PDF em branco ou com layout (ex: atestado médico)
- Tamanho recomendado: < 5 MB
- Apenas a primeira página será usada

### Passo 2: Criar Template Completo

1. **Upload do PDF**
   - Arraste PDF ou clique para selecionar
   - Aguarde renderização (1-2 segundos)

2. **Adicionar Campos**

   Clique nos botões para adicionar:

   - **Texto** 🔤 - Nome, endereço, etc
   - **Área de Texto** 📝 - Observações longas
   - **Data** 📅 - Datas
   - **Checkbox** ☑️ - Sim/não
   - **Assinatura** ✍️ - Assinatura digital

3. **Posicionar Campos**

   Para cada campo azul:
   - **Clique** para selecionar (fica verde)
   - **Arraste** para mover
   - **Ajuste** largura/altura no painel direito

4. **Configurar Propriedades**

   Com campo selecionado:
   - Nome: "Nome do Paciente"
   - Largura: 200
   - Altura: 30
   - Tamanho da fonte: 12

5. **Salvar**
   - Digite nome descritivo
   - Clique em "Salvar Template"

### Passo 3: Preencher e Gerar PDF

1. **Selecionar Template**
   - Clique "Preencher" no card do template
   - Ou vá em "Preencher Template" e escolha na lista

2. **Preencher Formulário**
   - Digite nos campos de texto
   - Selecione data no calendário
   - Marque checkboxes

3. **Assinatura** (se houver)
   - Clique "Desenhar Assinatura"
   - Desenhe com o mouse
   - Clique "Salvar Assinatura"

4. **Preview em Tempo Real**
   - Veja mudanças instantaneamente
   - Verifique posicionamento

5. **Gerar PDF**
   - Clique "Gerar PDF"
   - Arquivo baixa automaticamente
   - Nome: `Template_timestamp.pdf`

---

## 💡 Dicas Rápidas

### ✅ Boas Práticas

1. **Nomes descritivos**
   - ❌ "campo1", "texto2"
   - ✅ "Nome do Paciente", "Data de Nascimento"

2. **Tamanhos consistentes**
   - Textos curtos: 150x30
   - Textos longos: 200x80
   - Assinaturas: 200x60

3. **Fonte legível**
   - Mínimo: 10px
   - Recomendado: 12px
   - Títulos: 14-16px

4. **Posicionamento preciso**
   - Clique no campo para ver propriedades
   - Use as coordenadas X/Y para ajuste fino
   - Teste preenchendo antes de usar em produção

### ⚠️ Evite

1. **PDFs muito grandes**
   - Limite: 5 MB
   - Solução: Comprima o PDF antes

2. **Campos sobrepostos**
   - Campos não devem se sobrepor
   - Deixe espaço entre eles

3. **Campos fora da página**
   - Verifique se o campo está visível
   - Scroll no canvas para ver áreas ocultas

---

## 🎨 Exemplos de Templates

### Exemplo 1: Atestado Médico Simples

**Campos:**
1. Nome do Paciente (text) - 200x30
2. Data de Nascimento (date) - 150x30
3. CID (text) - 100x30
4. Dias de Afastamento (text) - 80x30
5. Data de Emissão (date) - 150x30
6. Assinatura do Médico (signature) - 200x60

**Tempo:** 3 minutos

### Exemplo 2: Formulário de Consentimento

**Campos:**
1. Nome Completo (text) - 250x30
2. CPF (text) - 150x30
3. Concordo (checkbox) - 30x30
4. Observações (textarea) - 300x100
5. Data (date) - 150x30
6. Assinatura (signature) - 200x60

**Tempo:** 4 minutos

### Exemplo 3: Receita Médica

**Campos:**
1. Nome do Paciente (text) - 200x30
2. Medicamento 1 (text) - 250x30
3. Posologia 1 (textarea) - 250x60
4. Medicamento 2 (text) - 250x30
5. Posologia 2 (textarea) - 250x60
6. Data (date) - 150x30
7. Assinatura + Carimbo (signature) - 200x80

**Tempo:** 5 minutos

---

## 🐛 Solução de Problemas Rápida

| Problema | Solução |
|----------|---------|
| PDF não carrega | Verifique tamanho < 5MB |
| Campo não aparece | Verifique se está dentro da página |
| Assinatura não salva | Desenhe algo antes de salvar |
| Preview não atualiza | Recarregue a página (F5) |
| Templates sumiram | Não limpe cache do navegador |
| PDF gerado em branco | Preencha pelo menos um campo |

---

## ⌨️ Atalhos Úteis

| Ação | Atalho |
|------|--------|
| Selecionar campo | Clique no campo |
| Deletar campo | Selecione + botão "Deletar" |
| Limpar formulário | Botão "Limpar Formulário" |
| Gerar PDF | Botão "Gerar PDF" |

---

## 📱 Uso em Tablet/Mobile

1. Funciona em dispositivos móveis
2. Use toque ao invés de mouse
3. Pinça para zoom (nativo do navegador)
4. Rotação horizontal recomendada para edição

---

## 🎓 Próximos Passos

Depois de dominar o básico:

1. **Crie múltiplos templates** para casos diferentes
2. **Experimente todos os tipos de campos**
3. **Teste diferentes tamanhos de fonte**
4. **Pratique posicionamento preciso**

---

## 📚 Recursos Adicionais

- **README.md** - Documentação completa
- **COMPARACAO.md** - MVP vs. Versão Completa
- **Console do navegador** (F12) - Para debug

---

## ✅ Checklist de Sucesso

Você dominou o MVP quando conseguir:

- [ ] Criar um template em < 3 minutos
- [ ] Adicionar 5 tipos de campos diferentes
- [ ] Posicionar campos com precisão
- [ ] Preencher formulário e gerar PDF
- [ ] Gerenciar múltiplos templates

---

**Tempo total de aprendizado: 15 minutos**
**Tempo para primeiro template: 2 minutos**

🎉 **Parabéns! Você está pronto para usar o DocsHgumba MVP!**
