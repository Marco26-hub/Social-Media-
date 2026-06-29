-- Generazione visual AI (Blotato): immagini/carosello/video creati dall'AI a partire
-- dal contenuto testuale. Il job è asincrono: salviamo id + stato + output (url media).
alter table calendario add column if not exists visual_job_id      text;
alter table calendario add column if not exists visual_status      text;     -- queueing|generating|done|failed
alter table calendario add column if not exists visual_template_id text;
alter table calendario add column if not exists visual_kind        text;     -- image|carousel|video
alter table calendario add column if not exists visual_url         text;     -- mediaUrl (video) se presente
alter table calendario add column if not exists visual_image_urls  jsonb;    -- imageUrls[] (slide/carosello/immagini)
alter table calendario add column if not exists visual_error       text;
alter table calendario add column if not exists visual_synced_at   timestamptz;

comment on column calendario.visual_job_id is 'ID creazione visual Blotato (videos/creations/:id) per il polling stato.';
comment on column calendario.visual_url is 'URL del video renderizzato (mediaUrl) generato dall AI.';
comment on column calendario.visual_image_urls is 'Array di URL immagini (imageUrls) per carosello/slideshow generati dall AI.';
