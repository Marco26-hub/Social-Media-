alter table calendario add column if not exists template_id text;
alter table calendario add column if not exists template_style text;
alter table calendario add column if not exists layout_spec_json jsonb;
alter table calendario add column if not exists asset_requirements_json jsonb;

comment on column calendario.template_id is 'Template operativo suggerito per produrre il contenuto';
comment on column calendario.template_style is 'Stile visual: minimal, editorial, ugc, premium, bold, educational';
comment on column calendario.layout_spec_json is 'Specifiche layout: aspect ratio, safe-zone, gerarchia visuale, griglia';
comment on column calendario.asset_requirements_json is 'Asset richiesti per produrre il contenuto: foto, video, logo, UGC, proof';

create index if not exists idx_calendario_cliente_template on calendario(cliente_id, template_id);
