# Validação funcional

Esta versão foi validada manualmente em ambiente local com Docker Desktop no Windows.

## Cenários verificados

- inicialização completa com Docker Compose;
- PostgreSQL saudável antes da API;
- migrations Flyway executadas na inicialização;
- autenticação JWT com as três contas de demonstração;
- dashboard do Administrador;
- dashboard do Agente;
- dashboard do Cliente;
- criação de chamado;
- listagem e filtros de chamados;
- atualização de status, prioridade, categoria e responsável;
- criação de comentários públicos;
- criação de notas internas por equipe;
- ocultação de notas internas para Cliente;
- isolamento dos chamados do Cliente;
- bloqueio de acesso do Cliente ao painel administrativo;
- administração de usuários pelo Administrador;
- alteração de perfil e ativação/desativação de usuários.

## Correções incorporadas após a validação

1. Remoção de `allowImportingTsExtensions` do `tsconfig.node.json`, permitindo o build TypeScript no container.
2. Uso de `spring-boot-starter-flyway`, garantindo a execução automática das migrations no Spring Boot.
3. Ajuste da ordem da condição de busca no `TicketRepository` para evitar inferência de `bytea` pelo PostgreSQL quando `search` é nulo.

## Comandos de verificação

```bash
docker compose up --build -d
docker compose ps
docker compose logs api --tail=200
```

A aplicação web deve ficar disponível em `http://localhost:8088`.
