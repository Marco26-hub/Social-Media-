"""Real Next + isolated PostgreSQL + local Blotato simulator regression.
Requires TEST_DATABASE_URL on localhost and TEST_APP_URL. Never uses live data.
Run with the webapp-testing with_server.py helper and test-only environment.
"""
import concurrent.futures
import json
import os
import re
import subprocess
import threading
from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
from zoneinfo import ZoneInfo
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
DB = os.environ['TEST_DATABASE_URL']
BASE = os.environ.get('TEST_APP_URL', 'http://127.0.0.1:3211')
OUT = Path(os.environ.get('TEST_OUTPUT_DIR', '/private/tmp/swa-cycle-e2e-results'))
assert urlparse(DB).hostname in ('127.0.0.1', 'localhost'), 'Only an isolated local DB is permitted'
assert urlparse(BASE).hostname in ('127.0.0.1', 'localhost'), 'Only a local app is permitted'
assert os.environ.get('DATABASE_URL') == DB, 'App and fixtures must use the same isolated database'
assert urlparse(os.environ.get('BLOTATO_API_URL', '')).hostname in ('127.0.0.1', 'localhost'), 'Live Blotato is forbidden in this test'
assert os.environ.get('AUTH_SECRET') == 'swa-cycle-local-test-only', 'Test-only authentication secret required'
OUT.mkdir(exist_ok=True, parents=True)
CID = '10000000-0000-4000-8000-000000000001'
OTHER = '10000000-0000-4000-8000-000000000002'
ADMIN = '20000000-0000-4000-8000-000000000001'
USER = '20000000-0000-4000-8000-000000000002'
IDS = {key: f'30000000-0000-4000-8000-{i:012d}' for i, key in enumerate(['queued','approved','collision','published','error','pending','recovered','foreign','race1','race2','send'], 1)}
DAY = (datetime.now(ZoneInfo('Europe/Rome')) + timedelta(days=2)).strftime('%Y-%m-%d')
OLD = datetime.fromisoformat(DAY + 'T19:00:00').replace(tzinfo=ZoneInfo('Europe/Rome')).astimezone(ZoneInfo('UTC')).isoformat().replace('+00:00', '.000Z')
STATE = {'mode': 'ok', 'patches': 0, 'posts': 0, 'time': OLD, 'post_status': 'scheduled', 'reads': []}
DRAFT = {'accountId': 'test-ig', 'content': {'platform': 'instagram', 'text': 'Unique queued hook. Caption.', 'mediaUrls': ['https://source.invalid/test.jpg']}, 'target': {'targetType': 'instagram'}}

def sql(statement):
    return subprocess.check_output(['psql', DB, '-X', '-A', '-t', '-v', 'ON_ERROR_STOP=1', '-c', statement], text=True).strip()

def record(name):
    RESULTS['checks'].append(name)
    print('PASS:', name, flush=True)

RESULTS = {'environment': 'local production build, real isolated PostgreSQL, simulated Blotato; no real publication', 'checks': []}

class Blotato(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def answer(self, code, value=None):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        if value is not None:
            self.wfile.write(json.dumps(value).encode())

    def do_GET(self):
        path = self.path.split('?')[0]
        STATE['reads'].append(path)
        schedule = {'id': 'schedule-original', 'scheduledAt': STATE['time'], 'draft': DRAFT}
        if path == '/v2/schedules':
            self.answer(200, {'items': [schedule]})
        elif path == '/v2/schedules/schedule-original':
            self.answer(200, {'schedule': schedule})
        elif path.startswith('/v2/posts/'):
            original = path.rsplit('/', 1)[-1]
            status = 'published' if original == 'submission-recovered' else STATE['post_status']
            self.answer(200, {'postSubmissionId': original, 'status': status, 'scheduledTime': STATE['time'], 'publicUrl': 'https://www.instagram.com/p/test-proof/' if status == 'published' else None})
        elif path == '/v2/users/me/accounts':
            self.answer(200, {'items': [{'id': 'test-fb', 'platform': 'facebook', 'name': 'Isolated Facebook'}, {'id': 'test-ig', 'platform': 'instagram', 'name': 'Isolated Instagram'}]})
        elif path == '/v2/users/me/accounts/test-fb/subaccounts':
            self.answer(200, {'items': [{'id': 'test-page', 'name': 'Isolated Page'}]})
        else:
            self.answer(404, {'error': 'Unexpected simulator endpoint'})

    def do_PATCH(self):
        assert self.path == '/v2/schedules/schedule-original'
        value = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        assert set(value) == {'patch'} and set(value['patch']) == {'scheduledTime'}, value
        STATE['patches'] += 1
        if STATE['mode'] != 'unconfirmed':
            STATE['time'] = value['patch']['scheduledTime']
        self.answer(204)

    def do_POST(self):
        assert self.path == '/v2/posts'
        STATE['posts'] += 1
        json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        # Provider may have accepted despite a 5xx: must not be retried blindly.
        self.answer(503, {'error': 'Simulated uncertain acceptance'})

sql(f"""
INSERT INTO profiles(id,email,password_hash,ruolo_globale,status) VALUES
('{ADMIN}','admin@test.invalid','not-a-real-password','super_admin','active'),
('{USER}','client@test.invalid','not-a-real-password','user','active') ON CONFLICT(id) DO NOTHING;
INSERT INTO clienti(id,nome,slug,timezone) VALUES ('{CID}','Isolated SWA','isolated-cycle','Europe/Rome'),('{OTHER}','Other isolated tenant','isolated-other','Europe/Rome') ON CONFLICT(id) DO NOTHING;
INSERT INTO user_client_access(user_id,cliente_id,ruolo) VALUES ('{ADMIN}','{CID}','owner'),('{USER}','{CID}','viewer') ON CONFLICT DO NOTHING;
INSERT INTO settings(cliente_id,chiave,valore) VALUES ('{CID}','dry_run','FALSE'),('{CID}','blotato_api_key','test-only'),('{CID}','blotato_subaccount_facebook','test-page') ON CONFLICT(cliente_id,chiave) DO UPDATE SET valore=excluded.valore;
""")
for key, ident in IDS.items():
    cid = OTHER if key == 'foreign' else CID
    status = {'queued':'PUBBLICATO', 'published':'PUBBLICATO', 'error':'ERRORE_MANUALE'}.get(key, 'APPROVATO')
    remote_id = {'queued':'submission-original','published':'submission-published'}.get(key)
    remote_status = {'queued':'scheduled','published':'published'}.get(key)
    hour = {'queued':'19:00','collision':'20:00','send':'22:15'}.get(key, f'{8 + list(IDS).index(key):02d}:15')
    vals = [ident,cid,'E2E_'+key,DAY,hour,'facebook' if key=='send' else 'instagram','post', 'Unique queued hook.' if key=='queued' else 'Unique '+key+' hook.',status,remote_id,remote_status,'test-fb' if key=='send' else 'test-ig',None if key=='send' else 'https://source.invalid/test.jpg']
    quoted = ','.join('NULL' if v is None else "'"+str(v).replace("'","''")+"'" for v in vals)
    sql(f"INSERT INTO calendario(id,cliente_id,id_contenuto,data_pubblicazione,ora_pubblicazione,canale,formato,hook,status,blotato_post_id,blotato_status,platform_account_id,link_media_1) VALUES({quoted}) ON CONFLICT(id) DO UPDATE SET data_pubblicazione=excluded.data_pubblicazione,ora_pubblicazione=excluded.ora_pubblicazione,status=excluded.status,blotato_post_id=excluded.blotato_post_id,blotato_status=excluded.blotato_status,blotato_post_url=NULL,publish_lock_id=NULL,errore_tecnico=NULL;")
sql(f"UPDATE calendario SET blotato_scheduled_at='{OLD}' WHERE id='{IDS['queued']}'; DELETE FROM integration_events WHERE cliente_id IN ('{CID}','{OTHER}'); DELETE FROM log_pubblicazioni WHERE cliente_id IN ('{CID}','{OTHER}');")
sql(f"UPDATE calendario SET caption='Contenuto sintetico isolato per verificare il ciclo di invio senza usare account o dati reali.',cta='Scopri il test',checked_copy='SI',checked_media='SI',checked_link='SI' WHERE cliente_id='{CID}';")
sql(f"INSERT INTO integration_events(cliente_id,provider,event_type,direction,status,entity_id,payload) VALUES ('{CID}','blotato','post_submission','outbound','processed','{IDS['recovered']}','{{\"submission_id\":\"submission-recovered\",\"account_id\":\"test-ig\",\"scheduled_time\":\"{OLD}\"}}'), ('{CID}','blotato','post_submission','outbound','processing','{IDS['pending']}','{{}}');")

server = ThreadingHTTPServer(('127.0.0.1', 3212), Blotato)
threading.Thread(target=server.serve_forever, daemon=True).start()

def token(uid, role):
    source = "require('next-auth/jwt').encode({token:{sub:process.argv[1],id:process.argv[1],email:'test@test.invalid',ruolo:process.argv[2]},secret:'swa-cycle-local-test-only',maxAge:3600}).then(x=>process.stdout.write(x))"
    return subprocess.check_output(['node','-e',source,uid,role],cwd=ROOT,text=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width':1440,'height':1000})
    context.add_cookies([{'name':'next-auth.session-token','value':token(ADMIN,'super_admin'),'url':BASE}, {'name':'active_cliente_id','value':CID,'url':BASE}])
    api = context.request

    def edit(key, hour, dry=True, expected=None, endpoint='/api/data/blotato-reschedule'):
        data = {'id':IDS[key],'data_pubblicazione':DAY,'ora_pubblicazione':hour,'dry_run':dry}
        if expected:
            data['expected_schedule'] = expected
        response = api.post(BASE+endpoint,data=data) if endpoint.endswith('reschedule') else api.patch(BASE+endpoint,data=data)
        return response, response.json()

    response, plan = edit('queued','19:30')
    assert response.status == 200 and plan['dry_run'], plan
    assert STATE['patches'] == 0 and sql(f"SELECT ora_pubblicazione FROM calendario WHERE id='{IDS['queued']}'") == '19:00:00'
    record('Preview with actual SQL performs no remote or local time mutation')
    response, saved = edit('queued','19:30',False,plan['expected_schedule'])
    assert response.status == 200 and saved['verified'], saved
    assert STATE['patches'] == 1 and STATE['posts'] == 0
    assert sql(f"SELECT ora_pubblicazione||'|'||blotato_post_id FROM calendario WHERE id='{IDS['queued']}'") == '19:30:00|submission-original'
    record('Confirmation patches same schedule, verifies it and preserves original submission ID')
    assert edit('queued','20:00')[0].status == 409
    assert edit('published','21:00')[0].status == 409
    assert edit('pending','21:00')[0].status == 409
    assert edit('foreign','21:00')[0].status == 404
    assert edit('queued','21:00',False)[0].status == 409
    record('Occupied slots, published records, uncertain submissions, foreign tenants and missing preview are blocked')
    STATE['mode'] = 'unconfirmed'
    _, plan = edit('queued','19:45')
    response, failure = edit('queued','19:45',False,plan['expected_schedule'])
    assert response.status == 502 and failure['verification_pending'], failure
    assert sql(f"SELECT ora_pubblicazione FROM calendario WHERE id='{IDS['queued']}'") == '19:30:00'
    assert sql(f"SELECT count(*) FROM integration_events WHERE entity_id='{IDS['queued']}' AND event_type='schedule_time_update' AND status='processing'") == '1'
    record('Unconfirmed remote change retains old local time and durable audit; no false success')
    # Test-only cleanup permits independent cases. Never used against a real database.
    sql(f"DELETE FROM integration_events WHERE entity_id='{IDS['queued']}' AND event_type='schedule_time_update';")
    STATE['mode'] = 'ok'

    def concurrent_edit(key):
        import urllib.request
        data = json.dumps({'id':IDS[key],'data_pubblicazione':DAY,'ora_pubblicazione':'23:10','dry_run':False}).encode()
        request = urllib.request.Request(BASE+'/api/data/calendario',data=data,method='PATCH',headers={'Content-Type':'application/json','Cookie':f'next-auth.session-token={token(ADMIN,"super_admin")}; active_cliente_id={CID}'})
        try:
            return urllib.request.urlopen(request).status
        except urllib.error.HTTPError as error:
            return error.code
    with concurrent.futures.ThreadPoolExecutor(2) as pool:
        codes = list(pool.map(concurrent_edit,['race1','race2']))
    assert sorted(codes) == [200,409], codes
    record('Concurrent calendar saves to one channel/slot allow exactly one winner')

    response = api.post(BASE+'/api/data/blotato-reconcile',data={})
    assert response.status == 200 and response.json()['checked'] >= 2, response.text()
    assert sql(f"SELECT blotato_post_id||'|'||blotato_status FROM calendario WHERE id='{IDS['recovered']}'") == 'submission-recovered|published'
    record('Actual SQL reconciliation restores accepted ledger ID and confirms publication without resending')
    headers = {'Authorization':'Bearer test-webhook-only'}
    callback = {'postSubmissionId':'submission-original','status':'published','platform':'instagram','post_url':'https://www.instagram.com/p/test-proof/'}
    assert api.post(BASE+'/api/webhook/blotato',data=callback).status == 401
    assert api.post(BASE+'/api/webhook/blotato',data=callback,headers=headers).status == 200
    before = sql(f"SELECT count(*) FROM log_pubblicazioni WHERE blotato_post_id='submission-original'")
    assert api.post(BASE+'/api/webhook/blotato',data=callback,headers=headers).json()['ignored']
    callback['status'] = 'scheduled'
    assert api.post(BASE+'/api/webhook/blotato',data=callback,headers=headers).json()['ignored']
    assert sql(f"SELECT count(*) FROM log_pubblicazioni WHERE blotato_post_id='submission-original'") == before
    assert sql(f"SELECT blotato_status FROM calendario WHERE id='{IDS['queued']}'") == 'published'
    record('Signed callback is idempotent; late queued callback cannot regress a published record')
    assert api.get(BASE+'/api/cron/blotato-reconcile').status == 401
    record('Status-only cron rejects unauthenticated access')
    # Restore queued fixture only inside this isolated database for browser editing.
    sql(f"UPDATE calendario SET blotato_status='scheduled',blotato_post_url=NULL WHERE id='{IDS['queued']}';")
    page = context.new_page()
    page.route('https://**',lambda route:route.abort())
    errors = []
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.goto(BASE+'/dashboard/calendario?filter=tutti')
    page.wait_for_load_state('networkidle')
    expect(page.get_by_role('button',name=re.compile('Mostra Approvati:'))).to_be_visible()
    page.get_by_role('button',name=re.compile('Mostra Approvati:')).click()
    expect(page.get_by_role('button',name='Modifica orario E2E_approved')).to_be_visible()
    expect(page.get_by_role('button',name='Modifica orario E2E_queued')).to_have_count(0)
    page.screenshot(path=str(OUT/'approved-filter.png'),full_page=True)
    page.get_by_role('button',name=re.compile('Mostra Errori:')).click()
    expect(page.get_by_role('button',name='Modifica orario E2E_error')).to_be_visible()
    page.get_by_role('button',name=re.compile('Mostra Pubblicati:')).click()
    expect(page.get_by_role('button',name='Modifica orario E2E_published')).to_be_disabled()
    page.get_by_role('button',name=re.compile('Mostra In coda:')).click()
    page.get_by_role('button',name='Modifica orario E2E_queued').click()
    dialog = page.get_by_role('dialog',name='Modifica data e ora E2E_queued')
    dialog.get_by_label('Ora del post').fill('19:50')
    dialog.get_by_role('button',name='Verifica orario',exact=True).click()
    expect(dialog.get_by_role('status')).to_contain_text('Slot verificato')
    page.screenshot(path=str(OUT/'verified-same-schedule.png'),full_page=True)
    dialog.get_by_role('button',name='Conferma nuovo orario').click()
    expect(dialog).to_have_count(0)
    assert sql(f"SELECT ora_pubblicazione||'|'||blotato_post_id FROM calendario WHERE id='{IDS['queued']}'") == '19:50:00|submission-original'
    assert not errors, errors
    record('Browser cards open correct lists; published editor disabled; two-step editor saves verified same remote job')
    client = browser.new_context()
    client.add_cookies([{'name':'next-auth.session-token','value':token(USER,'user'),'url':BASE},{'name':'active_cliente_id','value':CID,'url':BASE}])
    response = client.request.post(BASE+'/api/data/blotato-reschedule',data={'id':IDS['queued'],'data_pubblicazione':DAY,'ora_pubblicazione':'21:00','dry_run':True})
    assert response.status in (401,403), response.text()
    assert not any(row['id']==IDS['foreign'] for row in client.request.get(BASE+'/api/data/calendario').json())
    record('Client cannot use admin reschedule route or read another tenant calendar')
    # Requires test server PUBLISH_ENABLED=true, but all provider traffic is local.
    if os.environ.get('TEST_PUBLISH_GATE') == 'true':
        response = api.post(BASE+f'/api/data/calendario/{IDS["send"]}/sync-uno')
        assert response.status == 502, response.text()
        first = STATE['posts']
        assert first == 1, response.text()
        response = api.post(BASE+f'/api/data/calendario/{IDS["send"]}/sync-uno')
        assert response.status == 400, response.text()
        sql(f"UPDATE calendario SET status='APPROVATO' WHERE id='{IDS['send']}';")
        response = api.post(BASE+f'/api/data/calendario/{IDS["send"]}/sync-uno')
        assert response.json().get('status') == 'skipped', response.text()
        assert STATE['posts'] == first
        record('Real send pipeline records intent before POST and never retries uncertain 5xx acceptance')
    RESULTS['provider_posts'] = STATE['posts']
    RESULTS['provider_time_patches'] = STATE['patches']
    (OUT/'results.json').write_text(json.dumps(RESULTS,indent=2))
    browser.close()
server.shutdown()
print(json.dumps(RESULTS,indent=2))
