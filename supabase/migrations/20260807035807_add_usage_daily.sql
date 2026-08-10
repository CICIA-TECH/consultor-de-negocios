-- Issue #9: cuota de uso diario por usuario (mismo límite para todos por ahora,
-- ver lib/quota.ts para el valor del límite).

create table if not exists public.usage_daily (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null default current_date,
  message_count int not null default 0,
  primary key (user_id, day)
);

alter table public.usage_daily enable row level security;

create policy "Los usuarios pueden ver su propio uso"
  on public.usage_daily for select
  using (auth.uid() = user_id);

create policy "Los usuarios pueden insertar su propio uso"
  on public.usage_daily for insert
  with check (auth.uid() = user_id);

create policy "Los usuarios pueden actualizar su propio uso"
  on public.usage_daily for update
  using (auth.uid() = user_id);

-- Incrementa atómicamente el contador del día para el usuario autenticado
-- y devuelve el nuevo conteo, en un solo round-trip (evita condición de
-- carrera entre leer el conteo y decidir si bloquear la request).
create function public.increment_daily_usage()
returns int
language plpgsql
security invoker
as $$
declare
  new_count int;
begin
  insert into public.usage_daily (user_id, day, message_count)
  values (auth.uid(), current_date, 1)
  on conflict (user_id, day)
  do update set message_count = usage_daily.message_count + 1
  returning message_count into new_count;

  return new_count;
end;
$$;
