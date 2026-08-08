-- ============================================================
-- Inventário Breve de Dor — configuração do banco (Supabase)
-- Execute este script UMA VEZ no SQL Editor do seu projeto Supabase.
-- Troque 'TROQUE_ESTA_SENHA' pela sua senha de moderadora antes de rodar.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.pacientes_dor (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  iniciais text not null,
  nascimento date not null,
  dados jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- RLS ligado e SEM policies públicas: ninguém acessa a tabela direto pela API REST.
-- Todo acesso passa pelas funções abaixo (security definer), que controlam quem vê o quê.
alter table public.pacientes_dor enable row level security;

-- 1) Paciente cria/atualiza o próprio registro usando o código dele (sem senha)
create or replace function public.salvar_paciente(
  p_codigo text, p_iniciais text, p_nascimento date, p_dados jsonb
) returns void
language plpgsql security definer as $$
begin
  insert into public.pacientes_dor (codigo, iniciais, nascimento, dados)
  values (p_codigo, p_iniciais, p_nascimento, p_dados)
  on conflict (codigo) do update
    set dados = excluded.dados,
        iniciais = excluded.iniciais,
        nascimento = excluded.nascimento,
        atualizado_em = now();
end;
$$;

-- 2) Paciente busca o próprio registro usando o código (sem senha)
create or replace function public.buscar_paciente(p_codigo text)
returns table(iniciais text, nascimento date, dados jsonb)
language plpgsql security definer as $$
begin
  return query
  select pd.iniciais, pd.nascimento, pd.dados
  from public.pacientes_dor pd
  where pd.codigo = p_codigo;
end;
$$;

-- 3) Moderadora: lista todos os pacientes (iniciais + nascimento na frente)
--    Troque a senha abaixo pela sua.
create or replace function public.listar_pacientes(p_senha text)
returns table(codigo text, iniciais text, nascimento date, atualizado_em timestamptz)
language plpgsql security definer as $$
begin
  if p_senha is distinct from 'TROQUE_ESTA_SENHA' then
    raise exception 'senha inválida';
  end if;
  return query
  select pd.codigo, pd.iniciais, pd.nascimento, pd.atualizado_em
  from public.pacientes_dor pd
  order by pd.atualizado_em desc;
end;
$$;

-- 4) Moderadora: abre o detalhe completo de um paciente da lista
create or replace function public.buscar_detalhe_moderador(p_senha text, p_codigo text)
returns table(iniciais text, nascimento date, dados jsonb, atualizado_em timestamptz)
language plpgsql security definer as $$
begin
  if p_senha is distinct from 'TROQUE_ESTA_SENHA' then
    raise exception 'senha inválida';
  end if;
  return query
  select pd.iniciais, pd.nascimento, pd.dados, pd.atualizado_em
  from public.pacientes_dor pd
  where pd.codigo = p_codigo;
end;
$$;

grant execute on function public.salvar_paciente(text,text,date,jsonb) to anon;
grant execute on function public.buscar_paciente(text) to anon;
grant execute on function public.listar_pacientes(text) to anon;
grant execute on function public.buscar_detalhe_moderador(text,text) to anon;

-- ============================================================
-- Depois de rodar isto:
-- 1. Vá em Project Settings > API e copie a "Project URL" e a chave "anon public".
-- 2. Cole as duas no topo do arquivo inventario-dor-paciente.html,
--    no objeto SUPABASE_CONFIG.
-- 3. Troque 'TROQUE_ESTA_SENHA' nas duas funções acima pela sua senha real
--    (rode o CREATE OR REPLACE FUNCTION de novo depois de editar).
-- ============================================================
