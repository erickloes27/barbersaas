# Guia do Desenvolvedor - Barber SaaS

Este guia serve como um tutorial para entender a estrutura, o funcionamento e como desenvolver novas funcionalidades no sistema Barber SaaS.

## 1. Estrutura de Pastas

O projeto segue a estrutura padrão do **Next.js (App Router)**. Aqui está o que você precisa saber sobre as pastas principais:

*   **`src/app`**: O coração da aplicação.
    *   Cada pasta aqui é uma **rota** (URL) do site.
    *   `page.tsx`: O arquivo que renderiza a página.
    *   `layout.tsx`: Define o layout (cabeçalho, rodapé) compartilhado por aquela rota e suas filhas.
    *   Exemplo: `src/app/login/page.tsx` é a página acessível em `/login`.
*   **`src/components`**: Blocos de construção da interface (botões, formulários, modais).
    *   `ui`: Componentes genéricos e reutilizáveis (Botão, Input, Card) - baseados no shadcn/ui.
    *   `dashboard`: Componentes específicos do painel administrativo.
    *   `auth`: Componentes de login e registro.
*   **`src/actions`**: **(Novo!)** Aqui vive a lógica do servidor (Backend).
    *   Em vez de ter uma API separada, usamos "Server Actions". São funções que rodam no servidor mas podem ser chamadas direto do frontend.
    *   `auth.ts`: Login, logout, cadastro.
    *   `user.ts`: Gerenciamento de perfil.
    *   `service.ts`: Criar/editar serviços.
    *   `booking.ts`: Lógica de agendamento.
*   **`src/lib`**: Utilitários e configurações.
    *   `prisma.ts`: Conexão com o banco de dados.
    *   `utils.ts`: Funções de ajuda (formatar data, validar CPF).
*   **`prisma`**: Configuração do Banco de Dados.
    *   `schema.prisma`: Onde definimos as tabelas (Models) do banco.

## 2. Fluxo de Dados (Como as coisas funcionam)

### Frontend -> Backend
1.  O usuário preenche um formulário (ex: Login).
2.  O formulário chama uma função em `src/actions/auth.ts` (ex: `loginWithCredentials`).
3.  Essa função roda no servidor, valida os dados com `zod` (biblioteca de validação) e fala com o banco de dados via `prisma`.
4.  Se der tudo certo, ela retorna sucesso ou redireciona o usuário.

### Banco de Dados (Prisma)
Usamos o **Prisma ORM** para falar com o banco (PostgreSQL na AWS).
*   Para buscar dados: `await prisma.user.findUnique(...)`
*   Para criar: `await prisma.service.create(...)`
*   Para atualizar: `await prisma.user.update(...)`

Sempre que você mudar o arquivo `prisma/schema.prisma`, você precisa rodar:
```bash
npx prisma migrate dev
```
Isso atualiza o banco de dados real para bater com o seu código.

## 3. Autenticação (NextAuth.js)

A segurança é feita pelo **NextAuth.js** (arquivo `src/auth.ts`).
*   Ele gerencia sessões, cookies e login social (Google).
*   Para proteger uma página, usamos `await auth()` para ver se tem usuário logado.
*   Se não tiver, redirecionamos para `/login`.

## 4. Como criar uma nova funcionalidade?

Digamos que você queira criar um "Blog" para a barbearia.

1.  **Banco de Dados**: Adicione o model `Post` no `prisma/schema.prisma`.
2.  **Migração**: Rode `npx prisma migrate dev` para criar a tabela.
3.  **Ações**: Crie `src/actions/blog.ts` com funções `createPost`, `getPosts`.
4.  **Página**: Crie `src/app/blog/page.tsx` para listar os posts.
5.  **Componentes**: Crie o visual dos posts em `src/components/blog`.

## 5. Dicas Importantes

*   **Server Components vs Client Components**:
    *   Por padrão, tudo no `app` é Server Component (roda no servidor, mais rápido, bom para SEO).
    *   Se você precisar de interatividade (onClick, useState, useEffect), coloque `"use client";` na primeira linha do arquivo.
*   **Variáveis de Ambiente**: Nunca coloque senhas no código! Use o arquivo `.env` e chame via `process.env.VARIAVEL`.

---
*Este guia foi gerado para facilitar o entendimento e manutenção do sistema Barber SaaS.*
