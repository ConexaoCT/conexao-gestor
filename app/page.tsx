Feito. Mantive foco só em ambiente/execução local: não alterei regras de ponto, rotas funcionais, cálculo, telas ou fluxo de PIN.

Ajustei:
- `package.json`: `start` agora é compatível com Windows, adicionei `local:check` e `engines` para Node/pnpm.
- `scripts/check-local-env.mjs`: verificador local de Node, `.env`, `DATABASE_URL`, `JWT_SECRET` e acesso TCP ao MySQL.
- `docs/execucao-local-windows.md`: passo a passo Windows completo.

Também validei por inspeção que o projeto usa corretamente:
- Vite: frontend e middleware dev em `server/_core/vite.ts`.
- Express: servidor local em `server/_core/index.ts`.
- tRPC: API em `/api/trpc`, `server/routers.ts` + `client/src/lib/trpc.ts`.
- Drizzle: MySQL temporário via `drizzle-orm/mysql2` em `server/db.ts`.

Não encontrei referências ativas quebradas aos arquivos Manus removidos.

**Dependências De Máquina**
- Node.js 20 LTS ou 22 LTS.
- Corepack.
- pnpm 10.x.
- MySQL 8 local/remoto.
- PowerShell.

**Checklist Local**
```powershell
cd C:\Users\Usuario\Downloads\sistema-ponto

node -v
corepack enable
corepack prepare pnpm@10.4.1 --activate
pnpm -v

pnpm install
Copy-Item .env.example .env
```

Edite `.env`:
```env
PORT=3000
DATABASE_URL=mysql://usuario:senha@localhost:3306/sistema_ponto
JWT_SECRET=um-segredo-longo-com-pelo-menos-24-caracteres
```

Crie o banco MySQL vazio:
```sql
CREATE DATABASE sistema_ponto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Depois rode:
```powershell
pnpm local:check
pnpm db:push
node scripts/seed-local-users.mjs
pnpm dev
```

Abra:
```text
http://localhost:3000
```

Logins seed:
- Conexão CT: PIN `0000`
- Jennifer Borges: PIN `1111`

**Comandos De Validação**
```powershell
pnpm local:check
pnpm check
pnpm test
pnpm build
pnpm start
```

Aqui eu não consegui rodar `pnpm install`, `pnpm check` ou `pnpm test` porque esta máquina não tem `pnpm`/`npm` no PATH e o `node.exe` do sistema deu acesso negado. O Node empacotado do Codex validou o `package.json` e executou o checker, que falhou corretamente por ainda não existir `.env`.

**Plano Seguro Para Vercel**
1. Primeiro validar tudo local com MySQL.
2. Depois criar handler serverless tRPC para Vercel, sem mudar regras de negócio.
3. Adicionar `vercel.json` com rewrites para SPA + API.
4. Só então migrar Drizzle de MySQL para Postgres/Supabase.
5. Configurar na Vercel: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`.
6. Rodar build/testes antes de trocar o banco real.
