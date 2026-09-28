# NexusDesk

**NexusDesk** é uma aplicação full stack de Service Desk / Help Desk criada para demonstrar uma arquitetura próxima de um produto real: autenticação, autorização por papéis, API REST, banco relacional, auditoria, filtros, paginação, dashboard, administração de usuários e ambiente reproduzível com Docker.

O objetivo do projeto é ir além de um CRUD simples e mostrar decisões que aparecem em sistemas corporativos de suporte técnico.

> **Status:** versão `1.0.0` validada localmente com Docker Desktop no Windows, incluindo autenticação, RBAC, dashboards, chamados, notas internas, administração de usuários e isolamento de dados por perfil. Consulte [`docs/VALIDATION.md`](docs/VALIDATION.md).

## Principais recursos

- autenticação stateless com JWT e senhas protegidas com BCrypt;
- controle de acesso por perfil: **Cliente**, **Agente** e **Administrador**;
- criação e acompanhamento de chamados;
- prioridades, categorias e ciclo de status;
- atribuição de chamados para agentes;
- comentários públicos e notas internas;
- histórico/auditoria de alterações do chamado;
- proteção de notas internas também no backend;
- busca, filtros e paginação server-side;
- dashboard com indicadores e chamados recentes;
- gerenciamento de usuários pelo administrador;
- validação de entrada e tratamento centralizado de erros;
- optimistic locking nos chamados para reduzir conflitos de edição concorrente;
- migrations de banco com Flyway;
- dados iniciais para demonstração;
- health checks e orquestração com Docker Compose;
- workflow de CI para backend e frontend.

## Stack

### Frontend
- React 19
- TypeScript
- React Router
- Vite
- CSS responsivo sem framework visual
- Nginx no container de produção

### Backend
- Java 21
- Spring Boot 4
- Spring Web MVC
- Spring Security
- OAuth2 Resource Server / JWT
- Spring Data JPA / Hibernate
- Bean Validation
- Flyway
- Actuator

### Dados e infraestrutura
- PostgreSQL 17
- Docker / Docker Compose
- GitHub Actions

## Arquitetura

```text
Browser
   |
   v
Nginx / React SPA  :8088
   |
   | /api
   v
Spring Boot API    :8080
   |
   v
PostgreSQL         :5432 (rede interna do Compose)
```

O frontend nunca decide sozinho se uma ação é permitida. As regras de autorização também são aplicadas na API. Um cliente, por exemplo, só consegue consultar os próprios chamados e não consegue criar ou visualizar notas internas.

Mais detalhes: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Screenshots

### Dashboard do Administrador

![Dashboard do Administrador](docs/images/dashboard-admin.png)

<details>
<summary>Ver mais telas</summary>

### Login

![Tela de login](docs/images/login.png)

### Administração de usuários

![Administração de usuários](docs/images/users-admin.png)

### Dashboard do Agente

![Dashboard do Agente](docs/images/dashboard-agent.png)

### Dashboard do Cliente

![Dashboard do Cliente](docs/images/dashboard-client.png)

</details>

## Como executar — forma recomendada

### Pré-requisitos

Instale e abra o **Docker Desktop**. Não é necessário instalar Java, Maven, Node ou PostgreSQL separadamente quando você utiliza o Docker Compose.

### Windows

Na pasta do projeto, dê dois cliques em:

```text
start.bat
```

Ou execute no terminal:

```bash
docker compose up --build -d
```

Depois acesse:

```text
http://localhost:8088
```

### Linux/macOS

```bash
./start.sh
```

ou:

```bash
docker compose up --build -d
```

Acesse `http://localhost:8088`.

### Parar o sistema

Windows:

```text
stop.bat
```

Linux/macOS:

```bash
./stop.sh
```

Ou em qualquer sistema:

```bash
docker compose down
```

Para apagar também o volume do banco e recriar os dados de demonstração do zero:

```bash
docker compose down -v
```

## Contas de demonstração

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | `admin@nexusdesk.dev` | `Admin@123` |
| Agente | `agent@nexusdesk.dev` | `Agent@123` |
| Cliente | `client@nexusdesk.dev` | `Client@123` |

Na tela de login há atalhos que preenchem as credenciais de demonstração.

> As credenciais acima existem apenas para demonstração local. O seed só é ativado quando `SEED_DEMO=true` (o Docker Compose faz isso para facilitar os testes). Em um deploy público, mantenha `SEED_DEMO=false` e configure segredos próprios.

## O que testar

### Como Cliente

1. entre como `client@nexusdesk.dev`;
2. veja apenas os chamados pertencentes ao cliente;
3. abra um novo chamado;
4. adicione uma mensagem ao chamado;
5. confirme que controles administrativos e notas internas não aparecem.

### Como Agente

1. entre como `agent@nexusdesk.dev`;
2. abra um chamado sem responsável;
3. use **Assumir chamado**;
4. altere status, prioridade, categoria ou responsável;
5. adicione um comentário público;
6. adicione uma nota interna;
7. confira o histórico de auditoria.

### Como Administrador

1. entre como `admin@nexusdesk.dev`;
2. acesse **Usuários**;
3. crie um usuário;
4. altere papel ou estado ativo/inativo de outro usuário;
5. confirme as proteções contra desativar ou rebaixar a própria conta da sessão.

## Desenvolvimento sem Docker

### Backend

Pré-requisitos: Java 21, Maven e PostgreSQL.

Crie um banco chamado `nexusdesk`, ajuste as variáveis abaixo e execute:

```bash
cd backend
mvn spring-boot:run
```

Variáveis aceitas:

```text
DB_URL=jdbc:postgresql://localhost:5432/nexusdesk
DB_USER=nexusdesk
DB_PASSWORD=nexusdesk
JWT_SECRET=uma-chave-com-pelo-menos-32-bytes
JWT_TTL_MINUTES=480
SEED_DEMO=true
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8088
```

### Frontend

Pré-requisito: Node.js moderno.

```bash
cd frontend
npm install
npm run dev
```

Durante o desenvolvimento, o Vite encaminha `/api` para `http://localhost:8080`.

## Testes e verificação

Backend:

```bash
cd backend
mvn test
```

Frontend:

```bash
cd frontend
npm install
npm run typecheck
npm run build
```

Com Docker:

```bash
docker compose ps
docker compose logs -f api
```

Health endpoint:

```text
http://localhost:8088/actuator/health
```

A checklist da validação manual está em [`docs/VALIDATION.md`](docs/VALIDATION.md).

## API

A API fica sob `/api` e exige `Authorization: Bearer <token>` exceto no login.

Os principais endpoints estão documentados em [`docs/API.md`](docs/API.md). Também há um arquivo [`docs/nexusdesk.http`](docs/nexusdesk.http) para clientes REST compatíveis.

## Estrutura do repositório

```text
NexusDesk/
├── .github/workflows/ci.yml
├── backend/
│   ├── src/main/java/com/nexusdesk/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── common/
│   │   ├── config/
│   │   ├── dashboard/
│   │   ├── security/
│   │   ├── ticket/
│   │   └── user/
│   ├── src/main/resources/db/migration/
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   └── pages/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docs/
├── docker-compose.yml
├── start.bat
└── README.md
```

## Decisões técnicas que valem discutir em entrevista

**RBAC em duas camadas.** A interface adapta a experiência conforme o perfil, mas toda regra importante é novamente validada na API.

**JWT stateless.** Simplifica a API e demonstra integração com Spring Security. Para um produto público de maior risco, vale evoluir para access token curto + refresh token em cookie `HttpOnly` e uma política de revogação.

**Flyway + `ddl-auto: validate`.** O schema é versionado explicitamente. O Hibernate valida o mapeamento em vez de alterar o banco silenciosamente.

**Optimistic locking.** A coluna `version` reduz a chance de um agente sobrescrever silenciosamente a alteração feita por outro.

**Notas internas.** A restrição não é apenas visual: clientes não podem criá-las e a API remove comentários/eventos internos das respostas destinadas a clientes.

**DTOs.** Entidades JPA não são expostas diretamente pela API, evitando acoplamento e vazamento acidental de campos como `passwordHash`.

## Antes de publicar na internet

Este repositório foi preparado como demonstração/portfólio. Para produção real, entre outras medidas, seria necessário:

- substituir todas as credenciais de demonstração;
- armazenar segredos em um secret manager;
- adotar estratégia de refresh/revogação de tokens;
- configurar HTTPS, headers de segurança e rate limiting;
- usar observabilidade centralizada;
- configurar backups e política de retenção do PostgreSQL;
- aumentar cobertura de testes unitários, integração e E2E;
- integrar e-mail/SSO se fizer parte do contexto do produto.

## Versão e histórico

Consulte [`CHANGELOG.md`](CHANGELOG.md) para o resumo da versão de portfólio.

Para publicar o repositório, siga [`docs/GITHUB_PUBLISH.md`](docs/GITHUB_PUBLISH.md).

## Licença

MIT. Consulte [`LICENSE`](LICENSE).
