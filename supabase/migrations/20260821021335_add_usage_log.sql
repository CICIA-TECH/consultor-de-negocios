-- Issue #10: trazabilidad de tokens/costo por llamada a la IA, por usuario.
-- Comparte esquema con usage_daily (#9): mismo user_id, misma tabla de "uso".

create table if not exists public.usage_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  input_tokens int not null,
  output_tokens int not null,
  total_tokens int not null,
  estimated_cost_usd numeric(10, 6) not null
);

create index if not exists usage_log_user_id_created_at_idx
  on public.usage_log (user_id, created_at desc);

alter table public.usage_log enable row level security;

create policy "Los usuarios pueden insertar su propio uso"
  on public.usage_log for insert
  with check (auth.uid() = user_id);

create policy "Los usuarios pueden ver su propio uso"
  on public.usage_log for select
  using (auth.uid() = user_id);

-- Reporte interno de consumo por usuario (sin RLS propia: hereda la de
-- usage_log, así que un usuario autenticado solo ve su propia fila acá
-- también; para el reporte agregado de todos los usuarios, consultar
-- usage_log directamente desde el SQL Editor con el rol postgres).
create or replace view public.usage_by_user as
select
  user_id,
  count(*) as request_count,
  sum(input_tokens) as total_input_tokens,
  sum(output_tokens) as total_output_tokens,
  sum(total_tokens) as total_tokens,
  sum(estimated_cost_usd) as total_estimated_cost_usd,
  min(created_at) as first_request_at,
  max(created_at) as last_request_at
from public.usage_log
group by user_id;
