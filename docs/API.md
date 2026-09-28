# API do NexusDesk

Base local via Docker: `http://localhost:8088/api`

Exceto o login, os endpoints exigem:

```http
Authorization: Bearer <JWT>
```

## Autenticação

### `POST /auth/login`

```json
{
  "email": "agent@nexusdesk.dev",
  "password": "Agent@123"
}
```

Retorna JWT, validade e usuário autenticado.

### `GET /auth/me`

Retorna os dados da sessão atual.

## Dashboard

### `GET /dashboard`

Retorna contadores por status, chamados sem responsável para a equipe e chamados recentes. Para cliente, os dados são limitados aos seus próprios chamados.

## Categorias e agentes

### `GET /categories`

Lista categorias ativas.

### `GET /agents`

Lista usuários que podem receber chamados. Apenas `AGENT` e `ADMIN`.

## Chamados

### `GET /tickets`

Parâmetros opcionais:

- `status`
- `priority`
- `categoryId`
- `assigneeId`
- `unassigned`
- `search`
- `page`
- `size` (máximo 50)

Clientes recebem apenas os próprios chamados.

### `POST /tickets`

```json
{
  "title": "Notebook sem acesso à VPN",
  "description": "Após a troca da senha não consigo conectar à VPN corporativa.",
  "priority": "HIGH",
  "categoryId": 1
}
```

### `GET /tickets/{id}`

Detalhe com conversa e histórico. Notas/eventos internos não são retornados ao cliente.

### `PATCH /tickets/{id}`

Apenas agentes/admins. Todos os campos são opcionais.

```json
{
  "status": "IN_PROGRESS",
  "priority": "URGENT",
  "categoryId": 2,
  "assigneeId": 2
}
```

### `POST /tickets/{id}/assign-to-me`

Apenas agentes/admins. Atribui o chamado ao usuário autenticado; se estava `OPEN`, passa para `IN_PROGRESS`.

### `POST /tickets/{id}/comments`

```json
{
  "body": "Estamos verificando o problema.",
  "internal": false
}
```

Cliente não pode criar comentário interno.

## Administração

Todos os endpoints abaixo exigem `ADMIN`.

### `GET /admin/users`

Lista usuários.

### `POST /admin/users`

```json
{
  "name": "Novo Agente",
  "email": "novo.agente@example.com",
  "password": "SenhaForte123!",
  "role": "AGENT"
}
```

### `PATCH /admin/users/{id}`

```json
{
  "role": "AGENT",
  "active": true
}
```

A sessão atual não pode desativar a própria conta nem alterar o próprio papel.

## Enums

Status:

```text
OPEN
IN_PROGRESS
WAITING_CUSTOMER
RESOLVED
CLOSED
```

Prioridade:

```text
LOW
MEDIUM
HIGH
URGENT
```

Papel:

```text
CLIENT
AGENT
ADMIN
```
