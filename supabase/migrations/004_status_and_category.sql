-- ============================================================
-- Migração: status de acompanhamento + categoria do negócio
--
-- Rode UMA VEZ no SQL Editor do seu projeto Supabase existente
-- (projetos novos já nascem com isso via schema.sql).
-- ============================================================

alter table public.leads
  add column if not exists categoria text;

alter table public.leads
  add column if not exists status text not null default 'novo';

-- Constraint em statement separado: "add column ... check" falha se a
-- coluna já foi criada sem ele por uma migração anterior nesse mesmo
-- arquivo rodando de novo (idempotência).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'leads_status_check'
  ) then
    alter table public.leads
      add constraint leads_status_check
      check (status in ('novo', 'contatado', 'respondeu', 'fechado', 'sem_interesse'));
  end if;
end $$;
