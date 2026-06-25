-- Social Automation V2 — Seed production
-- Eseguire DOPO 001_full_schema.sql
-- Sostituisci email/password/nome con i valori reali dell'admin

-- ─────────────────────────────────────────
-- ADMIN USER
-- password_hash = bcrypt("admin123") generato con:
--   SELECT crypt('admin123', gen_salt('bf'));
-- Sostituisci con la tua password reale dopo il deploy
-- ─────────────────────────────────────────
insert into profiles (email, nome, password_hash, ruolo_globale)
values (
  'admin@socialautomation.it',
  'Admin Social Automation',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'super_admin'
)
on conflict (email) do nothing;

-- ─────────────────────────────────────────
-- CLIENTE TEST: SILKinCOM
-- ─────────────────────────────────────────
insert into clienti (nome, slug, settore, email, piano, contenuti_mese, attivo)
values ('SILKinCOM', 'silkincom', 'Fashion e-commerce', 'info@silkincom.com', 'pro', 30, true)
on conflict (slug) do nothing;

-- Assegna admin al cliente
insert into user_client_access (user_id, cliente_id, ruolo)
select p.id, c.id, 'owner'
from profiles p, clienti c
where p.email = 'admin@socialautomation.it'
  and c.slug = 'silkincom'
on conflict (user_id, cliente_id) do nothing;

-- ─────────────────────────────────────────
-- BRAND TEST
-- ─────────────────────────────────────────
insert into brand (cliente_id, brand_name, sito_url, tono_voce, target, hashtag_base, cta_base)
select id, 'SILKinCOM', 'https://silkincom.com', 'Moderno, elegante, accessibile. Luxury accessibile.', 'Donna 25-45 professionista, attenta allo stile ma con budget ragionevole.', '#silkincom #modaaccessibile', 'Scopri il look completo su silkincom.com'
from clienti
where slug = 'silkincom'
and not exists (select 1 from brand where cliente_id = (select id from clienti where slug = 'silkincom'));

-- ─────────────────────────────────────────
-- SETTINGS DEFAULT
-- ─────────────────────────────────────────
insert into settings (cliente_id, chiave, valore, descrizione)
select c.id, s.chiave, s.valore, s.descrizione
from clienti c
cross join (values
  ('automation_enabled', 'TRUE', 'Se FALSE nessun contenuto viene pubblicato'),
  ('dry_run', 'TRUE', 'Se TRUE simula senza pubblicare (imposta FALSE in produzione)'),
  ('timezone', 'Europe/Rome', 'Timezone ufficiale'),
  ('max_retry', '2', 'Numero massimo di retry automatici'),
  ('default_utm_campaign', 'social_default', 'Campagna UTM di default'),
  ('approval_required', 'TRUE', 'Pubblica solo contenuti approvati'),
  ('media_validation_required', 'TRUE', 'Blocca contenuti con media non validi'),
  ('stock_check_required', 'TRUE', 'Blocca prodotti non attivi o esauriti')
) as s(chiave, valore, descrizione)
where c.slug = 'silkincom'
on conflict (cliente_id, chiave) do nothing;

-- ─────────────────────────────────────────
-- PRODOTTI TEST
-- ─────────────────────────────────────────
insert into prodotti (cliente_id, product_id, nome_prodotto, categoria, collezione, prezzo, link_prodotto, link_img_1, colori, taglie, mood, target, priorita, prodotto_attivo, stock_status, stock_quantity)
select c.id, 'P001', 'Blazer in lino', 'giacche', 'primavera-estate 2026', 129, 'https://silkincom.com/p/blazer-lino', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300', 'beige, nero', 'XS, S, M, L, XL', 'elegante', 'donna 30+', 'alta', 'SI', 'disponibile', 50
from clienti c where c.slug = 'silkincom'
and not exists (select 1 from prodotti where product_id = 'P001');

insert into prodotti (cliente_id, product_id, nome_prodotto, categoria, collezione, prezzo, link_prodotto, link_img_1, colori, taglie, mood, target, priorita, prodotto_attivo, stock_status, stock_quantity)
select c.id, 'P002', 'Jeans dritti vita alta', 'jeans', 'permanente', 89, 'https://silkincom.com/p/jeans-dritti', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300', 'denim chiaro', '24, 26, 28, 30, 32', 'casual', 'unisex', 'alta', 'SI', 'disponibile', 120
from clienti c where c.slug = 'silkincom'
and not exists (select 1 from prodotti where product_id = 'P002');

insert into prodotti (cliente_id, product_id, nome_prodotto, categoria, collezione, prezzo, prezzo_promo, link_prodotto, link_img_1, colori, taglie, mood, target, priorita, prodotto_attivo, stock_status, stock_quantity, note)
select c.id, 'P003', 'T-shirt cotone bio', 't-shirt', 'sostenibile', 39, 29, 'https://silkincom.com/p/tshirt-bio', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300', 'bianco, nero, oliva', 'XS, S, M, L, XL, XXL', 'casual', 'unisex', 'media', 'SI', 'esaurito', 0, 'Restock previsto giugno 2026'
from clienti c where c.slug = 'silkincom'
and not exists (select 1 from prodotti where product_id = 'P003');

-- ─────────────────────────────────────────
-- ACCOUNT SOCIAL test (placeholder)
-- ─────────────────────────────────────────
insert into account_social (cliente_id, canale, nome_account, platform_account_id, attivo, formati_permessi, default_media_type)
select c.id, 'instagram', 'silkincom_official', 'IG_PLACEHOLDER', 'SI', 'post,carousel,reel,story', 'image'
from clienti c where c.slug = 'silkincom'
and not exists (select 1 from account_social where canale = 'instagram');

insert into account_social (cliente_id, canale, nome_account, platform_account_id, attivo, formati_permessi, default_media_type)
select c.id, 'facebook', 'SILKinCOM Official', 'FB_PLACEHOLDER', 'SI', 'post,carousel,video,reel', 'image'
from clienti c where c.slug = 'silkincom'
and not exists (select 1 from account_social where canale = 'facebook');

insert into account_social (cliente_id, canale, nome_account, platform_account_id, attivo, formati_permessi, default_media_type)
select c.id, 'tiktok', '@silkincom', 'TT_PLACEHOLDER', 'SI', 'video,reel', 'video'
from clienti c where c.slug = 'silkincom'
and not exists (select 1 from account_social where canale = 'tiktok');

insert into account_social (cliente_id, canale, nome_account, platform_account_id, attivo, formati_permessi, default_media_type)
select c.id, 'pinterest', 'SILKinCOM', 'PIN_PLACEHOLDER', 'SI', 'pin', 'image'
from clienti c where c.slug = 'silkincom'
and not exists (select 1 from account_social where canale = 'pinterest');
