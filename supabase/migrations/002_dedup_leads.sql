-- ============================================================
-- Migração: deduplicação de leads
--
-- Rode UMA VEZ no SQL Editor do seu projeto Supabase existente
-- (projetos novos já nascem com isso via schema.sql — não precisa
-- rodar esse arquivo neles).
--
-- O que faz:
--   1. Adiciona a coluna calculada `dedup_key` (identidade estável
--      da empresa: telefone, ou nome+endereço quando não tem telefone).
--   2. Apaga as duplicatas que já existem, mantendo a mais antiga.
--   3. Cria o índice único que impede duplicata dali pra frente.
--   4. Recalcula o total de cada coleta pra bater com o que sobrou,
--      e remove coletas que ficaram vazias (tudo era duplicata).
-- ============================================================

alter table public.leads
  add column if not exists dedup_key text generated always as (
    coalesce(nullif(telefone, 'Sem info'), nome || '||' || coalesce(nullif(endereco, 'Sem info'), ''))
  ) stored;

delete from public.leads
where id in (
  select id from (
    select id, row_number() over (
      partition by user_id, dedup_key
      order by created_at asc, id asc
    ) as rn
    from public.leads
  ) ranked
  where rn > 1
);

create unique index if not exists leads_user_dedup_key_idx
  on public.leads (user_id, dedup_key);

update public.collections c
set total = sub.cnt
from (select collection_id, count(*) as cnt from public.leads group by collection_id) sub
where c.id = sub.collection_id;

delete from public.collections c
where not exists (select 1 from public.leads l where l.collection_id = c.id);
