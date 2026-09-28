# Security Notes

NexusDesk é um projeto demonstrativo de portfólio.

## Não use as credenciais demo em produção

As contas e senhas presentes no `SeedData` são intencionais para facilitar a avaliação local. Remova-as ou substitua-as antes de qualquer exposição pública com dados reais.

## Segredos

O segredo JWT deve ser fornecido por variável de ambiente e possuir pelo menos 32 bytes. Não versione segredos reais no Git.

## Tokens

A SPA armazena o access token no `localStorage` para simplificar a demonstração. Em um produto real exposto à internet, avalie access tokens de curta duração, refresh token em cookie `HttpOnly`, `Secure` e `SameSite`, revogação e CSP rigorosa.

## Relato de vulnerabilidades

Para um repositório público pessoal, substitua esta seção pelo canal de contato que desejar antes da publicação.
