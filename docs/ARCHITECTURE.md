# Arquitetura do NexusDesk

## Visão geral

O NexusDesk segue uma divisão frontend/backend com API REST. A aplicação web é uma SPA React. O backend concentra autenticação, autorização e regras de negócio e persiste os dados em PostgreSQL.

```text
[ React SPA ] ---> [ REST API / Spring Boot ] ---> [ PostgreSQL ]
      |                        |
      |                        +-- Spring Security / JWT
      |                        +-- JPA / Hibernate
      |                        +-- Flyway migrations
      |                        +-- Actuator
      |
      +-- React Router / TypeScript
```

Em Docker Compose, o Nginx serve o build do React e atua como reverse proxy para `/api` e `/actuator`.

## Domínio

### User

Representa uma conta do sistema.

Papéis:

- `CLIENT`: abre e acompanha os próprios chamados;
- `AGENT`: atende chamados e acessa recursos de operação;
- `ADMIN`: possui capacidades de agente e administração de usuários.

### Category

Classifica o tipo de atendimento. O seed inclui Acesso e Conta, Hardware, Software, Rede e Conectividade e Solicitação.

### Ticket

Agregado principal. Possui solicitante, responsável opcional, categoria, prioridade, status e timestamps. A coluna `version` implementa optimistic locking.

### TicketComment

Conversa do chamado. Pode ser pública ou interna. Notas internas são exclusivas de agentes/administradores.

### TicketEvent

Registra eventos de auditoria como criação, mudança de status, prioridade, categoria, responsável e comentários. Eventos internos também são marcados e filtrados para clientes.

## Segurança

O login recebe e-mail/senha e, após validação BCrypt, emite JWT HMAC SHA-256. O token contém o e-mail como `sub`, identificador e papel do usuário.

O Spring Security converte a claim `roles` em authorities `ROLE_*` e protege os endpoints. Além dessa camada, serviços de domínio validam acesso a recursos específicos, como garantir que um cliente só visualize tickets em que é solicitante.

Não existem senhas em respostas da API. Entidades JPA são convertidas para DTOs antes de sair da camada de aplicação.

## Persistência

O Flyway cria o schema inicial. O Hibernate usa `ddl-auto: validate`, deixando a evolução estrutural do banco explícita e versionável.

Índices foram adicionados nos campos mais relevantes para listagem e dashboard: status, prioridade, solicitante, responsável e atualização.

## Concorrência

`Ticket.version` utiliza `@Version`. Se duas sessões tentarem salvar versões incompatíveis do mesmo chamado, o backend converte a falha de optimistic locking em HTTP `409 Conflict`.

## Tratamento de erros

`@RestControllerAdvice` transforma validações e exceções de domínio em respostas coerentes. Erros inesperados são registrados no backend e devolvidos ao cliente sem detalhes internos da stack trace.

## Evoluções possíveis

- refresh tokens e revogação;
- SLA com prazos por prioridade;
- anexos via object storage;
- notificações assíncronas;
- filas/eventos;
- base de conhecimento;
- organizações/tenants;
- testes E2E;
- OpenAPI/Swagger;
- observabilidade com métricas e tracing.
