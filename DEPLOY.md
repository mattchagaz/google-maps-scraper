# 🚀 Deploy do Dashboard Web

Guia passo a passo pra ligar a extensão a um banco Supabase e publicar o
dashboard na Vercel. Leva uns 10 minutos, tudo gratuito pra começar.

Sem isso configurado, a extensão continua funcionando 100% localmente
(igual sempre funcionou) — o dashboard é opcional.

---

## 1. Criar o projeto no Supabase

1. Acesse [app.supabase.com](https://app.supabase.com) → **New project**.
2. Escolha nome, senha do banco e região (ex: `South America (São Paulo)`).
3. Espere uns 2 minutos até o projeto ficar pronto.

## 2. Rodar o schema

1. No painel do projeto, vá em **SQL Editor → New query**.
2. Cole todo o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e clique **Run**.
3. Isso cria as tabelas `collections` e `leads`, com Row Level Security
   já configurada (cada usuário só vê os próprios dados).

## 3. Pegar as credenciais

Em **Project Settings → API**, copie:
- **Project URL** (algo como `https://xxxxx.supabase.co`)
- **anon public key** (a chave pública — é seguro usar no front-end,
  a segurança de verdade vem da RLS configurada no passo 2)

> Opcional: em **Authentication → Providers → Email**, se quiser testar
> rápido sem configurar envio de email, desative "Confirm email" — assim
> a conta criada já entra direto, sem precisar clicar num link de confirmação.

## 4. Configurar e buildar a extensão

Na raiz do projeto:

```bash
cp .env.example .env
```

Edite `.env` e preencha:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
VITE_DASHBOARD_URL=       # deixe em branco por enquanto, volta aqui no passo 6
```

```bash
npm install
npm run build
```

Recarregue a extensão em `chrome://extensions` (botão de reload no card
dela). O popup agora mostra uma barra "☁️ Sincronize suas coletas..." —
clique em **Conectar**, crie uma conta (email + senha) e pronto: toda
coleta finalizada a partir de agora é enviada pro Supabase automaticamente.

## 5. Configurar o dashboard web

```bash
cd web
cp .env.example .env
```

Edite `web/.env` com **as mesmas** `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
do passo 3.

```bash
npm install
npm run build     # gera web/dist — é isso que vai pro ar
```

## 6. Deploy na Vercel

Você já tem conta na Vercel, então duas opções:

**Pelo painel (mais simples):**
1. [vercel.com/new](https://vercel.com/new) → importe este repositório.
2. Em **Root Directory**, selecione a pasta `web`.
3. Vercel detecta Vite automaticamente (`npm run build`, saída `dist`).
4. Em **Environment Variables**, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
   (os mesmos valores do passo 3).
5. **Deploy**.

**Pela CLI:**
```bash
cd web
npx vercel          # segue o fluxo interativo, aponta pra pasta web/
npx vercel env add VITE_SUPABASE_URL
npx vercel env add VITE_SUPABASE_ANON_KEY
npx vercel --prod
```

Ao final você tem uma URL tipo `https://seu-projeto.vercel.app`.

## 7. Fechar o círculo

Volte no `.env` da raiz do projeto (extensão) e preencha:
```
VITE_DASHBOARD_URL=https://seu-projeto.vercel.app
```

```bash
npm run build
```

Recarregue a extensão de novo. Agora, logado, o popup mostra um link
**"Dashboard ↗"** que abre o site direto.

---

## Atualizando depois

- Mudou algo em `src/popup/`? → `npm run build` na raiz + reload da extensão.
- Mudou algo em `web/src/`? → `cd web && npx vercel --prod` (ou só dá push
  se conectou o repositório à Vercel — ela builda sozinha a cada push).
- Mudou o schema? → edite `supabase/schema.sql` e rode a mudança no SQL Editor
  do Supabase manualmente (esse arquivo não é aplicado automaticamente).
