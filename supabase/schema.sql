-- ============================================================
-- Google Maps Business Scraper — schema do dashboard web
--
-- Rode isto uma vez no SQL editor do seu projeto Supabase
-- (https://app.supabase.com/project/_/sql/new).
--
-- Modelo: cada "coleta" (uma execução da extensão) vira uma
-- linha em `collections`; cada empresa coletada vira uma linha
-- em `leads`, ligada à coleta. RLS garante que cada usuário só
-- vê/edita os próprios dados — sem isso, qualquer pessoa com a
-- anon key conseguiria ler os dados de todo mundo.
--
-- user_id tem default auth.uid(), então o client (extensão/site)
-- nunca precisa mandar user_id no insert — o Supabase preenche
-- sozinho a partir do usuário logado.
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists public.collections (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  label      text not null default 'Coleta sem nome',
  total      integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nome          text,
  website       text,
  agendamento   text,
  cardapio      text,
  redes         text,
  telefone      text,
  email         text,
  endereco      text,
  created_at    timestamptz not null default now()
);

create index if not exists collections_user_id_created_at_idx
  on public.collections (user_id, created_at desc);

create index if not exists leads_collection_id_idx
  on public.leads (collection_id);

create index if not exists leads_user_id_idx
  on public.leads (user_id);

-- ── Row Level Security ─────────────────────────────────────
alter table public.collections enable row level security;
alter table public.leads       enable row level security;

create policy "collections: owner full access"
  on public.collections
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "leads: owner full access"
  on public.leads
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
