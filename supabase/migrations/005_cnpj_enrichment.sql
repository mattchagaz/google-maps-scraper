-- ============================================================
-- Migração: enriquecimento por CNPJ
--
-- Rode UMA VEZ no SQL Editor do seu projeto Supabase existente
-- (projetos novos já nascem com isso via schema.sql).
--
-- Dados vêm da BrasilAPI (pública, sem chave) quando você cola um
-- CNPJ no modal do lead — não é buscado automaticamente pelo Maps.
-- ============================================================

alter table public.leads add column if not exists cnpj               text;
alter table public.leads add column if not exists razao_social       text;
alter table public.leads add column if not exists situacao_cadastral text;
alter table public.leads add column if not exists data_abertura      date;
alter table public.leads add column if not exists porte              text;
alter table public.leads add column if not exists cnpj_consultado_em timestamptz;
