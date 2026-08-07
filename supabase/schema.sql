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
  whatsapp      text,
  telefone      text,
  email         text,
  endereco      text,
  categoria     text,
  -- Nota do Google (0.0–5.0) e nº de avaliações, capturados pelo scraper
  -- junto com o resto — mesmo dado que aparece na ficha do Maps.
  avaliacao       numeric(2,1),
  num_avaliacoes  integer,
  -- Acompanhamento manual no dashboard (fora do que o Maps entrega).
  status        text not null default 'novo'
                  check (status in ('novo', 'contatado', 'respondeu', 'fechado', 'sem_interesse')),
  notas         text,
  -- Enriquecimento por CNPJ (BrasilAPI) — colado manualmente no dashboard,
  -- não vem do Maps. Ver web/src/lib/cnpj.js.
  cnpj               text,
  razao_social       text,
  situacao_cadastral text,
  data_abertura      date,
  porte              text,
  cnpj_consultado_em timestamptz,
  -- Identifica a empresa de forma estável entre coletas diferentes:
  -- telefone quando existe, senão nome+endereço. Usado pra evitar que
  -- rodar a mesma busca no Maps duas vezes duplique o lead no banco.
  dedup_key     text generated always as (
                   coalesce(nullif(telefone, 'Sem info'), nome || '||' || coalesce(nullif(endereco, 'Sem info'), ''))
                 ) stored,
  created_at    timestamptz not null default now()
);

create index if not exists collections_user_id_created_at_idx
  on public.collections (user_id, created_at desc);

create index if not exists leads_collection_id_idx
  on public.leads (collection_id);

create index if not exists leads_user_id_idx
  on public.leads (user_id);

-- Um usuário nunca tem dois leads com a mesma "identidade" — o insert
-- da extensão usa upsert com ON CONFLICT nesse índice pra ignorar
-- silenciosamente empresas já sincronizadas antes.
create unique index if not exists leads_user_dedup_key_idx
  on public.leads (user_id, dedup_key);

-- `collections.total` sempre reflete quantos leads ela tem de verdade —
-- necessário porque leads podem ser inseridos (sync) ou apagados
-- (exclusão manual de um lead no dashboard) depois que a coleta nasceu.
create or replace function public.leads_sync_collection_total()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    update public.collections
    set total = (select count(*) from public.leads where collection_id = old.collection_id)
    where id = old.collection_id;
    return old;
  else
    update public.collections
    set total = (select count(*) from public.leads where collection_id = new.collection_id)
    where id = new.collection_id;
    return new;
  end if;
end;
$$;

drop trigger if exists leads_after_change on public.leads;
create trigger leads_after_change
  after insert or delete on public.leads
  for each row execute function public.leads_sync_collection_total();

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
