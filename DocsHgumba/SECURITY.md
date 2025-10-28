# Segurança do DocsHgumba

## Sistema de Autenticação Offline

### Arquitetura de Segurança

O DocsHgumba utiliza um sistema de autenticação **100% offline** baseado em localStorage com as seguintes características de segurança:

#### 1. Hash de Senhas
- **Algoritmo**: PBKDF2 com SHA-256
- **Iterações**: 100.000 (alta resistência a ataques offline)
- **Salt**: Único por usuário (16 bytes aleatórios)
- **Método**: `crypto.subtle.deriveBits()` com PBKDF2

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

#### 9. Sistema de Troca de Senha Obrigatória ✅

**IMPLEMENTADO**: Quando um usuário com senha padrão faz login:

1. Sistema detecta flag `mustChangePassword: true`
2. **BLOQUEIA acesso** mostrando modal de troca obrigatória
3. Modal não pode ser fechado (backdrop static)
4. Validações aplicadas:
   - Senha ≥ 8 caracteres
   - Confirmação deve coincidir
   - Não permite senhas padrão (admin123, medico123, enfermeira123)
5. Nova senha é hashada com PBKDF2 + salt do usuário
6. Flag `mustChangePassword` removida
7. Acesso liberado somente após troca bem-sucedida

**Resultado**: Impossível usar o sistema com senhas padrão!

#### 10. Melhorias Futuras (TODO)

- [ ] Controle de tentativas de login (rate limiting)
- [ ] Log de auditoria de acessos
- [ ] Bloqueio automático após inatividade
- [ ] Gerenciamento de usuários (adicionar/remover/editar)
- [ ] Migração para Argon2 quando disponível em Web Crypto API

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
