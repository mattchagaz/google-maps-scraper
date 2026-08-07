-- ============================================================
-- Migração: nota do Google + notas manuais
--
-- Rode UMA VEZ no SQL Editor do seu projeto Supabase existente
-- (projetos novos já nascem com isso via schema.sql).
-- ============================================================

alter table public.leads add column if not exists avaliacao      numeric(2,1);
alter table public.leads add column if not exists num_avaliacoes integer;
alter table public.leads add column if not exists notas          text;
