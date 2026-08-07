-- ============================================================
-- Migração: coluna whatsapp + total automático
--
-- Rode UMA VEZ no SQL Editor do seu projeto Supabase existente
-- (projetos novos já nascem com isso via schema.sql).
--
-- O que faz:
--   1. Adiciona a coluna `whatsapp` em leads (antes ficava misturado
--      dentro de `redes`, o que impedia um filtro específico).
--   2. Cria um trigger que mantém `collections.total` sempre igual
--      à contagem real de leads — necessário agora que dá pra
--      excluir um lead individualmente pelo dashboard.
-- ============================================================

alter table public.leads
  add column if not exists whatsapp text;

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
