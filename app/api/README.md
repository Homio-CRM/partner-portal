# API Routes - Partner Portal

Esta pasta contém as APIs que servem como camada de segurança para as requisições ao Directus.

## Estrutura

### `/api/partner/` - Partner Logins
- **GET**: Buscar parceiros (com filtro opcional por tipo)
- **POST**: Criar novo parceiro

**Exemplos de uso:**
```typescript
// Buscar todos os parceiros
GET /api/partner

// Buscar apenas parceiros (excluindo admins)
GET /api/partner?type=partner

// Criar novo parceiro
POST /api/partner
{
  "name": "Nome do Parceiro",
  "email": "email@exemplo.com",
  "type": "partner"
}
```

### `/api/clients/` - Clients
- **GET**: Buscar clientes (sempre com filtros padrão)

**Filtros sempre aplicados:**
- `filter[partnerHpn][_neq]=Homio` - Exclui clientes da Homio
- `filter[useForMetrics][_neq]=false` - Apenas clientes para métricas

**Exemplos de uso:**
```typescript
// Buscar todos os clientes (com filtros padrão)
GET /api/clients

// Buscar clientes de um parceiro específico
GET /api/clients?partnerHpn=NomeDoParceiro
```

### `/api/payments/` - Partner Payments
- **GET**: Buscar pagamentos (com filtro opcional por parceiro)
- **POST**: Criar novo pagamento

**Exemplos de uso:**
```typescript
// Buscar todos os pagamentos
GET /api/payments

// Buscar pagamentos de um parceiro específico
GET /api/payments?partnerHpn=NomeDoParceiro

// Criar novo pagamento
POST /api/payments
{
  "amount": 1000,
  "paymentDate": "2024-01-01",
  "partnerHpn": "NomeDoParceiro",
  "description": "Pagamento de comissão"
}
```

### `/api/auth/` - Autenticação
- Mantido como estava (login e change-password)

## Configuração do Axios

Todas as APIs utilizam a instância do Axios configurada em `lib/axios-config.ts`:

- **Base URL**: Configurada automaticamente
- **Headers**: Authorization Bearer Token
- **Interceptors**: Logs de requisição e tratamento de erros

## Benefícios da Nova Estrutura

1. **Camada de Segurança**: APIs servem como proxy para o Directus
2. **Consistência**: Todas as APIs usam o mesmo cliente Axios
3. **Simplicidade**: Cada API foca em uma entidade específica
4. **Filtros Padrão**: Clients sempre aplicam filtros necessários
5. **Logs**: Interceptor do Axios registra todas as requisições
6. **Tratamento de Erros**: Centralizado no interceptor do Axios

## Padrão de Resposta

Todas as APIs seguem o padrão:
```typescript
// Sucesso
{
  "data": [...], // ou objeto único
}

// Erro
{
  "error": "Mensagem de erro"
}
``` 