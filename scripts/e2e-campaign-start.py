"""Real local Next/SQL import with synthetic S3 listing; no AI, upload or publishing."""
import json
import os
import subprocess
import threading
from datetime import date, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
DB = os.environ['TEST_DATABASE_URL']
BASE = 'http://127.0.0.1:3211'
assert urlparse(DB).hostname == '127.0.0.1' and DB == os.environ['DATABASE_URL']
assert os.environ['STORAGE_ENDPOINT'] == 'http://127.0.0.1:3213'
assert os.environ['AUTH_SECRET'] == 'swa-cycle-local-test-only'
assert os.environ['PUBLISH_ENABLED'] == 'false'
CID = 'aaaaaaa1-1111-4111-8111-111111111111'
ADMIN = 'aaaaaaa2-1111-4111-8111-111111111111'
KEY = 'c12345678'
OUT = Path('/private/tmp/swa-campaign-start-e2e')
OUT.mkdir(exist_ok=True)
checks = []

def sql(statement):
    return subprocess.check_output(['psql', DB, '-XAt', '-v', 'ON_ERROR_STOP=1', '-c', statement], text=True).strip()

def passed(name):
    checks.append(name)
    print('PASS:', name, flush=True)

sql(f"""INSERT INTO profiles(id,email,password_hash,ruolo_globale,status) VALUES
('{ADMIN}','start-test@test.invalid','synthetic','super_admin','active') ON CONFLICT DO NOTHING;
INSERT INTO clienti(id,nome,slug,timezone) VALUES ('{CID}','Start date test','start-date-test','Europe/Rome') ON CONFLICT DO NOTHING;
DELETE FROM integration_events WHERE cliente_id='{CID}'; DELETE FROM calendario WHERE cliente_id='{CID}';
INSERT INTO calendario(cliente_id,id_contenuto,campaign_content_key,canale,formato,status,data_pubblicazione,ora_pubblicazione)
VALUES ('{CID}','START_ORIGINAL','{KEY}__post_01','instagram','post','DA_APPROVARE','2026-10-01','18:15');""")
assets = [f'uploads/{CID}/{KEY}-w1-{platform}-post-0{n}-00-00000000000000000000.png'
          for platform in ['instagram', 'facebook'] for n in [1, 2]]

class Storage(BaseHTTPRequestHandler):
    def log_message(self, *_): pass
    def do_GET(self):
        assert 'list-type=2' in self.path, self.path
        self.send_response(200)
        self.send_header('Content-Type', 'application/xml')
        self.end_headers()
        self.wfile.write(('<ListBucketResult><IsTruncated>false</IsTruncated>' + ''.join(
            f'<Contents><Key>{key}</Key><Size>100</Size><LastModified>2026-10-09T12:00:00Z</LastModified></Contents>' for key in assets) + '</ListBucketResult>').encode())
    def do_POST(self): raise AssertionError('No provider writes allowed')
    def do_PUT(self): raise AssertionError('No upload allowed')
server = ThreadingHTTPServer(('127.0.0.1', 3213), Storage)
threading.Thread(target=server.serve_forever, daemon=True).start()
manifest = {'campaign_cycle_id': 'synthetic-start-test', 'expected_contents': 2, 'expected_publications': 4,
    'contents': [{'order': n, 'content_key': f'post_0{n}', 'week': 1, 'date': f'2026-10-0{1 if n == 1 else 4}', 'format': 'post',
        'copy': {platform: {'hook': f'{platform} {n}', 'caption': f'Synthetic {platform} caption {n}'} for platform in ['instagram', 'facebook']}} for n in [1, 2]]}
start = (date.today() + timedelta(days=25)).isoformat()
end = (date.fromisoformat(start) + timedelta(days=3)).isoformat()
token = subprocess.check_output(['node', '-e', "require('next-auth/jwt').encode({token:{sub:process.argv[1],id:process.argv[1],email:'start-test@test.invalid',ruolo:'super_admin'},secret:'swa-cycle-local-test-only',maxAge:3600}).then(x=>process.stdout.write(x))", ADMIN], cwd=ROOT, text=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1440, 'height': 1100})
    context.add_cookies([{'name': 'next-auth.session-token', 'value': token, 'url': BASE}, {'name': 'active_cliente_id', 'value': CID, 'url': BASE}])
    api = context.request
    endpoint = BASE + '/api/data/calendario/ready-campaign'
    body = {'manifest': manifest, 'start_date': start, 'dry_run': True}
    preview = api.post(endpoint, data=body)
    assert preview.status == 200, preview.text()
    data = preview.json()
    assert data['start_date'] == start and data['end_date'] == end and data['publications'] == 4, data
    assert sql(f"SELECT data_pubblicazione FROM calendario WHERE cliente_id='{CID}'") == '2026-10-01'
    passed('Backend preview translates all dates without writing to SQL')
    page = context.new_page()
    page.route('https://**', lambda route: route.abort())
    page.goto(BASE + '/dashboard/calendario', wait_until='networkidle')
    page.get_by_role('button', name='Ripristina strategia', exact=True).click()
    page.get_by_label('Manifesto campagna').set_input_files({'name': 'swa-ready-campaign.json', 'mimeType': 'application/json', 'buffer': json.dumps(manifest).encode()})
    field = page.get_by_label('Data di inizio pubblicazione', exact=False)
    field.fill(start)
    page.get_by_role('button', name='Anteprima sicura', exact=True).click()
    confirm = page.get_by_role('button', name='Conferma 4 pubblicazioni', exact=True)
    expect(confirm).to_be_visible()
    field.fill((date.fromisoformat(start) + timedelta(days=1)).isoformat())
    expect(confirm).to_have_count(0)
    passed('Changing start date invalidates the prior confirmation in the browser')
    field.fill(start)
    page.get_by_role('button', name='Anteprima sicura', exact=True).click()
    expect(confirm).to_be_visible()
    page.screenshot(path=str(OUT / 'start-date-preview.png'), full_page=True)
    confirm.click()
    expect(page.get_by_text('Tutto è Da approvare; nulla è stato inviato a Blotato.', exact=False)).to_be_visible()
    assert sql(f"SELECT count(*) FROM calendario WHERE cliente_id='{CID}' AND status='DA_APPROVARE' AND blotato_post_id IS NULL") == '4'
    assert sql(f"SELECT ora_pubblicazione FROM calendario WHERE cliente_id='{CID}' AND id_contenuto='START_ORIGINAL'") == '18:15:00'
    assert sql(f"SELECT string_agg(DISTINCT data_pubblicazione::text,',' ORDER BY data_pubblicazione::text) FROM calendario WHERE cliente_id='{CID}'") == f'{start},{end}'
    assert sql(f"SELECT count(DISTINCT canale) FROM calendario WHERE cliente_id='{CID}'") == '2'
    passed('Browser confirmation persists shifted dates, preserves original time and exactly two socials; no sends')
    sql(f"UPDATE calendario SET blotato_status='in-progress' WHERE cliente_id='{CID}' AND id_contenuto='START_ORIGINAL';")
    assert api.post(endpoint, data={**body, 'dry_run': False}).status == 409
    assert sql(f"SELECT blotato_status FROM calendario WHERE cliente_id='{CID}' AND id_contenuto='START_ORIGINAL'") == 'in-progress'
    passed('Ready import refuses protected in-progress records even without a submission ID')
    sql(f"UPDATE calendario SET blotato_status=NULL WHERE cliente_id='{CID}'; INSERT INTO calendario(cliente_id,id_contenuto,canale,formato,status,data_pubblicazione,ora_pubblicazione) VALUES ('{CID}','START_COLLISION','facebook','post','APPROVATO','{start}','20:00');")
    collision = api.post(endpoint, data=body)
    assert collision.status == 422 and any('Slot occupato' in x for x in collision.json()['problems']), collision.text()
    passed('Preview detects collision with another campaign before any import')
    for bad in ['2026-02-30', '2000-01-01']:
        assert api.post(endpoint, data={**body, 'start_date': bad}).status == 400
        generation = api.post(BASE + '/api/generate/plan', data={'cliente_id': CID, 'piattaforme': ['instagram','facebook'], 'start_date': bad})
        assert generation.status == 400, generation.text()
    passed('Both real import and generation endpoints reject impossible/past dates before AI or storage')
    page.goto(BASE + '/dashboard/piano', wait_until='networkidle')
    plan_date = page.get_by_label('Data di inizio pubblicazione', exact=False)
    expect(plan_date).to_be_visible()
    plan_date.fill(start)
    expect(plan_date).to_have_value(start)
    plan_date.screenshot(path=str(OUT / 'folder-start-date.png'))
    passed('Folder upload screen exposes a usable start date field')
    browser.close()
server.shutdown()
(OUT / 'results.json').write_text(json.dumps({'result': 'PASS', 'checks': checks, 'environment': 'real isolated SQL, local synthetic S3; no paid AI, upload or publication'}, indent=2))
