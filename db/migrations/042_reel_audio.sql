alter table calendario
  add column if not exists reel_audio_url text,
  add column if not exists reel_audio_title text,
  add column if not exists reel_audio_source_url text,
  add column if not exists reel_audio_license text,
  add column if not exists blotato_audio_visual_id text,
  add column if not exists blotato_audio_visual_status text,
  add column if not exists blotato_audio_visual_media_url text,
  add column if not exists blotato_audio_visual_updated_at timestamptz;

comment on column calendario.reel_audio_url is 'Audio pubblico da incorporare nel Reel finale';
comment on column calendario.reel_audio_source_url is 'Pagina sorgente/licenza della traccia audio';

create index if not exists idx_calendario_audio_visual
  on calendario (cliente_id, blotato_audio_visual_id)
  where blotato_audio_visual_id is not null;
