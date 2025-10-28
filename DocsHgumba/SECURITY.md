# Segurança do DocsHgumba

## Sistema de Autenticação Offline

### Arquitetura de Segurança

O DocsHgumba utiliza um sistema de autenticação **100% offline** baseado em localStorage com as seguintes características de segurança:

#### 1. Hash de Senhas
- **Algoritmo**: SHA-256
- **Salt**: Único por usuário (16 bytes aleatórios)
- **Método**: `crypto.subtle.digest()` + salt personalizado

#### 2. Armazenamento
- **LocalStorage**: Usuários armazenados localmente no navegador
- **Sem arquivo JSON**: Não há exposição de credenciais via HTTP
- **Isolamento**: Cada instalação tem seus próprios usuários

#### 3. Usuários Padrão

Na primeira execução, são criados 3 usuários com senhas **pré-hashadas**:

| Usuário     | Senha Padrão | Perfil         | Deve Trocar |
|-------------|--------------|----------------|-------------|
| admin       | admin123     | Administrador  | ✅ Sim      |
| dr.silva    | medico123    | Médico         | ✅ Sim      |
| enf.maria   | enfermeira123| Enfermeiro(a)  | ✅ Sim      |

**⚠️ IMPORTANTE**: As senhas padrão devem ser alteradas após o primeiro acesso!

#### 4. Estrutura de Dados

Cada usuário no localStorage contém:

```json
{
  "id": "user_001",
  "username": "admin",
  "passwordHash": "a1b2c3...",
  "salt": "def456...",
  "name": "Administrador",
  "role": "admin",
  "profile": "Administrador",
  "crm": "",
  "coren": "",
  "mustChangePassword": true,
  "createdAt": "2024-10-28T12:00:00.000Z"
}
```

**Nenhuma senha em texto plano é armazenada!**

#### 5. Processo de Login

1. Usuário digita username e senha
2. Sistema busca usuário no localStorage
3. Senha é hashada com SHA-256 + salt do usuário
4. Hash comparado com hash armazenado
5. Se válido, cria sessão em localStorage

#### 6. Proteções Implementadas

✅ **Sem bypass de autenticação** - Erro não cria sessão guest  
✅ **Sem senhas em plaintext** - Tudo pré-hashado  
✅ **Salt individual** - Dificulta rainbow tables  
✅ **Sessão isolada** - Cada navegador/dispositivo independente  

#### 7. Limitações e Considerações

⚠️ **Sistema Offline**: Não há servidor de autenticação central  
⚠️ **LocalStorage**: Dados locais por navegador/dispositivo  
⚠️ **Troca de Senha**: TODO - Implementar UI de troca obrigatória  
⚠️ **Recuperação**: Não há recuperação de senha (sistema offline)  

#### 8. Boas Práticas Recomendadas

1. **Alterar senhas padrão** imediatamente após instalação
2. **Limpar localStorage** ao desativar estação de trabalho
3. **Backup de usuários**: Exportar docsHgumbaUsers periodicamente
4. **Não compartilhar** credenciais entre profissionais
5. **Logout** sempre ao sair da estação

#### 9. Melhorias Futuras (TODO)

- [ ] Tela de troca de senha obrigatória no primeiro login
- [ ] PBKDF2 ou Argon2 ao invés de SHA-256 simples
- [ ] Controle de tentativas de login (rate limiting)
- [ ] Log de auditoria de acessos
- [ ] Bloqueio automático após inatividade
- [ ] Gerenciamento de usuários (adicionar/remover/editar)

## Segurança Geral do Sistema

### Validações
- CPF: Validação de dígitos verificadores
- CNS: Validação de cartão SUS
- Telefone: Máscara (XX) XXXXX-XXXX
- Campos obrigatórios: Marcação visual

### Integridade de PDFs
- QR Code: Gerado com hash SHA-256 do documento
- Verificação: Pode validar autenticidade offline

### Backup e Recuperação
- **Templates**: Exportação manual para arquivo JSON
- **Histórico**: Últimos 50 PDFs gerados
- **Dados**: Tudo em localStorage (backup do navegador)

---

**Data de Última Atualização**: 28/10/2024  
**Versão do Sistema**: 3.0 (Fases 1+2+3 completas)
