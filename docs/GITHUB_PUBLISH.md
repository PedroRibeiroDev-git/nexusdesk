# Publicação no GitHub

## 1. Crie o repositório

No GitHub, crie um repositório público chamado `nexusdesk` e deixe **README, .gitignore e licença desmarcados**, pois o projeto já possui esses arquivos.

## 2. Envie o projeto

Abra um terminal na raiz do NexusDesk e execute:

```bash
git init
git add .
git commit -m "feat: publish NexusDesk 1.0.0"
git branch -M main
git remote add origin https://github.com/PedroRibeiroDev-git/nexusdesk.git
git push -u origin main
```

## 3. Confira o Actions

Após o push, abra a aba **Actions** do repositório e confirme se o workflow de CI executou o backend e o frontend.

## 4. Atualize o portfólio

O portfólio final já está configurado para apontar para `https://github.com/PedroRibeiroDev-git/nexusdesk`.

## 5. Sugestão de descrição do repositório

> Full stack Service Desk com Java 21, Spring Boot, React, TypeScript, PostgreSQL, JWT/RBAC, auditoria e Docker Compose.

## 6. Tópicos sugeridos

`java` `spring-boot` `react` `typescript` `postgresql` `docker` `jwt` `rest-api` `portfolio` `helpdesk`
