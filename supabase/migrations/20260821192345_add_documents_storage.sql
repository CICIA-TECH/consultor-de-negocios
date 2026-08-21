-- Issue #11: subida de documentos a Supabase Storage, asociados a user_id.
-- Reemplaza la File System Access API (solo Chrome/Edge, no persiste).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  20971520, -- 20MB
  array[
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/csv'
  ]
)
on conflict (id) do nothing;

create policy "Los usuarios pueden subir sus propios documentos"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Los usuarios pueden ver sus propios documentos"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Los usuarios pueden borrar sus propios documentos"
  on storage.objects for delete
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  status text not null default 'uploaded', -- uploaded | parsing | loaded | error
  content text,
  error_message text,
  size_bytes bigint not null,
  created_at timestamptz not null default now()
);

create index if not exists documents_user_id_created_at_idx
  on public.documents (user_id, created_at desc);

alter table public.documents enable row level security;

create policy "Los usuarios pueden insertar sus propios documentos"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Los usuarios pueden ver sus propios documentos"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "Los usuarios pueden actualizar sus propios documentos"
  on public.documents for update
  using (auth.uid() = user_id);

create policy "Los usuarios pueden borrar sus propios documentos"
  on public.documents for delete
  using (auth.uid() = user_id);
