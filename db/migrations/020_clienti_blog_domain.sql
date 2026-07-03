alter table clienti add column if not exists blog_domain text;
create unique index if not exists clienti_blog_domain_idx on clienti (blog_domain) where blog_domain is not null;
