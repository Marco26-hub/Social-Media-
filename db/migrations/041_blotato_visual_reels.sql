alter table calendario
  add column if not exists blotato_visual_id text,
  add column if not exists blotato_visual_status text,
  add column if not exists blotato_visual_media_url text,
  add column if not exists blotato_visual_source_hash text,
  add column if not exists blotato_visual_updated_at timestamptz;

create index if not exists idx_calendario_visual_source
  on calendario (cliente_id, blotato_visual_source_hash)
  where blotato_visual_source_hash is not null;
