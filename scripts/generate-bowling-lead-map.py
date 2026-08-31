from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


ROOT = Path('/Users/md/SWA/Social-Media-')
OUT = ROOT / 'output/pdf/Mappa-Regia-Bowling-SWA.pdf'
PHOTO = Path('/Users/md/Documents/SWA/CASO_STUDIO_BOWLING_MASTER_98/029_MASTER.png')
LOGO = ROOT / 'public/brand/swa-logo-official.png'

W, H = A4
INK = colors.HexColor('#10120E')
FOREST = colors.HexColor('#223F2C')
GOLD = colors.HexColor('#D6A839')
RUST = colors.HexColor('#A8532D')
CREAM = colors.HexColor('#FFFAF0')
MIST = colors.HexColor('#E7E9E2')
WHITE = colors.white


def draw_cover_image(c, image_path):
    image = ImageReader(str(image_path))
    iw, ih = image.getSize()
    scale = max(W / iw, H / ih)
    rw, rh = iw * scale, ih * scale
    c.drawImage(image, (W - rw) / 2, (H - rh) / 2, rw, rh, mask='auto')
    c.setFillColor(colors.Color(0.04, 0.05, 0.04, alpha=0.72))
    c.rect(0, 0, W, H, fill=1, stroke=0)


def draw_logo(c, x=42, y=None, width=92):
    if y is None:
        y = H - 62
    image = ImageReader(str(LOGO))
    iw, ih = image.getSize()
    c.drawImage(image, x, y, width, width * ih / iw, mask='auto')


def text_lines(c, text, x, y, max_width, font='Helvetica', size=10, leading=14, color=INK):
    words = text.split()
    lines = []
    current = ''
    for word in words:
        candidate = word if not current else f'{current} {word}'
        if stringWidth(candidate, font, size) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    c.setFillColor(color)
    c.setFont(font, size)
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def heading(c, eyebrow, title, subtitle=None):
    c.setFillColor(INK)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    draw_logo(c)
    c.setFillColor(GOLD)
    c.setFont('Helvetica-Bold', 8)
    c.drawString(42, H - 104, eyebrow.upper())
    c.setFillColor(RUST)
    c.rect(42, H - 116, 45, 3, fill=1, stroke=0)
    c.setFillColor(CREAM)
    c.setFont('Helvetica-Bold', 27)
    c.drawString(42, H - 157, title)
    if subtitle:
        text_lines(c, subtitle, 42, H - 181, W - 84, size=10.5, leading=15, color=MIST)


def footer(c, page):
    c.setStrokeColor(colors.Color(1, 1, 1, alpha=0.16))
    c.line(42, 36, W - 42, 36)
    c.setFillColor(colors.Color(1, 1, 1, alpha=0.62))
    c.setFont('Helvetica', 7.5)
    c.drawString(42, 23, 'SOCIAL WEB AUTOMATION  |  MAPPA REGIA BOWLING')
    c.drawRightString(W - 42, 23, f'{page:02d}')


def panel(c, x, y, width, height, number, title, body, accent=GOLD):
    c.setFillColor(colors.Color(1, 1, 1, alpha=0.055))
    c.roundRect(x, y, width, height, 5, fill=1, stroke=0)
    c.setFillColor(accent)
    c.rect(x, y + height - 4, width, 4, fill=1, stroke=0)
    c.setFont('Helvetica-Bold', 19)
    c.drawString(x + 16, y + height - 34, number)
    c.setFillColor(CREAM)
    c.setFont('Helvetica-Bold', 12)
    c.drawString(x + 54, y + height - 31, title)
    text_lines(c, body, x + 16, y + height - 55, width - 32, size=9, leading=13, color=MIST)


def page_cover(c):
    draw_cover_image(c, PHOTO)
    draw_logo(c, 42, H - 88, 112)
    c.setFillColor(GOLD)
    c.setFont('Helvetica-Bold', 9)
    c.drawString(42, H - 145, 'SWA  |  CASO STUDIO BOWLING')
    c.setFillColor(RUST)
    c.rect(42, H - 158, 58, 4, fill=1, stroke=0)
    c.setFillColor(CREAM)
    c.setFont('Helvetica-Bold', 35)
    c.drawString(42, H - 215, 'MAPPA REGIA')
    c.drawString(42, H - 255, 'BOWLING')
    text_lines(
        c,
        'La direzione strategica per trasformare serate, persone e momenti reali in una comunicazione riconoscibile che accompagna il pubblico verso una scelta.',
        42,
        H - 292,
        W - 140,
        size=11,
        leading=16,
        color=CREAM,
    )
    c.setFillColor(colors.Color(0.04, 0.05, 0.04, alpha=0.72))
    c.roundRect(42, 68, W - 84, 72, 5, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.setFont('Helvetica-Bold', 9)
    c.drawString(58, 116, 'PER CHI GESTISCE UN BOWLING')
    text_lines(c, 'Diagnosi, priorita e percorso di conversione per il tuo bowling.', 58, 95, W - 116, size=10, color=CREAM)
    c.setFillColor(CREAM)
    c.setFont('Helvetica-Bold', 8)
    c.drawString(42, 34, '@SOCIALWEBAUTOMATION')
    c.showPage()


def page_problem(c):
    heading(c, '01 / Punto di partenza', 'Cosa vediamo nel tuo bowling', 'Momenti, persone e offerte esistono gia. La regia serve a trasformarli in una storia chiara per il pubblico.')
    items = [
        ('01', 'Hai gia materiale', 'Serate, staff, clienti, piste ed eventi offrono molte storie, ma non tutte meritano di diventare un contenuto.'),
        ('02', 'Manca un filo comune', 'Se ogni uscita parla di qualcosa di diverso, il pubblico non capisce perche scegliere proprio il tuo bowling.'),
        ('03', 'Ogni formato deve avere un compito', 'Il Reel attira, il carosello spiega, il post posiziona e la Story avvicina alla richiesta.'),
        ('04', 'Serve un passo successivo', 'Ogni contenuto deve accompagnare verso una richiesta, una prenotazione, un evento o una conversazione utile.'),
    ]
    y = H - 295
    for idx, (number, title, body) in enumerate(items):
        panel(c, 42, y, W - 84, 92, number, title, body, GOLD if idx < 2 else RUST)
        y -= 108
    footer(c, 2)
    c.showPage()


def page_direction(c):
    heading(c, '02 / Metodo', 'Come lavora SWA sul tuo bowling', 'Dalla prima analisi alla lettura dei risultati: un processo controllato e approvabile.')
    steps = [
        ('AUDIT', 'Leggiamo profilo, offerta, pubblico e materiali disponibili', 'Individuiamo cosa tenere e cosa manca', 'PRIORITA CHIARE'),
        ('REGIA', 'Definiamo il messaggio del mese e il ruolo di ogni formato', 'Ordiniamo contenuti e percorso', 'PIANO LEGGIBILE'),
        ('PRODUZIONE', 'Creiamo gli asset necessari e li sottoponiamo alla tua approvazione', 'Foto, Reel, caroselli, post e Story', 'CONTROLLO PRIMA DI USCIRE'),
        ('DISTRIBUZIONE', 'Pubblichiamo, osserviamo i segnali e correggiamo il ciclo successivo', 'Continuita e lettura dei risultati', 'MIGLIORAMENTO CONTINUO'),
    ]
    y = H - 260
    for i, (name, goal, formats, metric) in enumerate(steps, start=1):
        c.setFillColor(colors.Color(1, 1, 1, alpha=0.05))
        c.roundRect(42, y - 82, W - 84, 88, 5, fill=1, stroke=0)
        c.setFillColor(GOLD if i < 3 else RUST)
        c.circle(66, y - 18, 15, fill=1, stroke=0)
        c.setFillColor(INK)
        c.setFont('Helvetica-Bold', 10)
        c.drawCentredString(66, y - 21, str(i))
        c.setFillColor(CREAM)
        c.setFont('Helvetica-Bold', 11)
        c.drawString(92, y - 8, name)
        text_lines(c, goal, 92, y - 27, W - 150, size=9, leading=12, color=MIST)
        c.setFont('Helvetica', 7.5)
        c.setFillColor(GOLD)
        c.drawString(92, y - 60, f'RUOLO: {formats}')
        c.setFillColor(colors.Color(1, 1, 1, alpha=0.6))
        c.drawRightString(W - 56, y - 60, metric.upper())
        y -= 105
    footer(c, 3)
    c.showPage()


def page_conversion(c):
    heading(c, '03 / Percorso', 'Dal contenuto a una scelta reale', 'Non pubblichiamo file isolati: costruiamo una sequenza che aiuta il cliente a capire e agire.')
    nodes = [
        ('1', 'SCOPRE', 'Un Reel ferma lo sguardo con un momento reale del bowling.'),
        ('2', 'CAPISCE', 'Caroselli e post spiegano esperienza, differenze e valore.'),
        ('3', 'SI FIDA', 'Story, persone e backstage rendono il servizio concreto.'),
        ('4', 'AGISCE', 'Una CTA chiara porta a richiesta, evento o prenotazione.'),
    ]
    y = H - 270
    for i, (number, title, body) in enumerate(nodes):
        c.setFillColor(GOLD if i < 2 else RUST)
        c.circle(68, y, 17, fill=1, stroke=0)
        c.setFillColor(INK)
        c.setFont('Helvetica-Bold', 11)
        c.drawCentredString(68, y - 4, number)
        c.setFillColor(CREAM)
        c.setFont('Helvetica-Bold', 12)
        c.drawString(105, y + 8, title)
        text_lines(c, body, 105, y - 12, W - 165, size=9.5, leading=13, color=MIST)
        if i < len(nodes) - 1:
            c.setStrokeColor(colors.Color(1, 1, 1, alpha=0.25))
            c.setLineWidth(2)
            c.line(68, y - 25, 68, y - 72)
        y -= 105
    c.setFillColor(colors.Color(0.84, 0.66, 0.22, alpha=0.12))
    c.roundRect(42, 88, W - 84, 90, 5, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.setFont('Helvetica-Bold', 10)
    c.drawString(58, 151, 'LA REGOLA DI REGIA')
    text_lines(c, 'Ogni uscita deve rispondere a una domanda: cosa deve capire o fare il cliente dopo aver visto questo contenuto?', 58, 130, W - 116, size=9, leading=13, color=CREAM)
    footer(c, 4)
    c.showPage()


def page_priorities(c):
    heading(c, '04 / Mappa', 'Le cinque decisioni del mese', 'Prima di produrre, SWA rende chiare queste scelte insieme al gestore.')
    priorities = [
        ('OBIETTIVO', 'Una priorita concreta per il mese: richieste, eventi, gruppi, ritorno o notorieta locale.'),
        ('PUBBLICO', 'Le persone a cui parlare e il motivo per cui dovrebbero scegliere il bowling.'),
        ('STORIE REALI', 'I momenti, i dettagli e le persone che dimostrano il valore dell esperienza.'),
        ('OFFERTA', 'Il servizio o evento da preparare prima di invitarlo, senza promozioni improvvise.'),
        ('AZIONE', 'Un passo semplice e verificabile: scrivere, chiedere informazioni o prenotare.'),
    ]
    y = H - 255
    for i, (title, body) in enumerate(priorities):
        c.setFillColor(colors.Color(1, 1, 1, alpha=0.045))
        c.roundRect(42, y - 65, W - 84, 72, 5, fill=1, stroke=0)
        c.setFillColor(GOLD if i % 2 == 0 else RUST)
        c.rect(42, y - 65, 5, 72, fill=1, stroke=0)
        c.setFont('Helvetica-Bold', 9)
        c.drawString(60, y - 15, title)
        text_lines(c, body, 60, y - 36, W - 130, size=9, leading=12, color=MIST)
        y -= 88
    footer(c, 5)
    c.showPage()


def page_close(c):
    draw_cover_image(c, PHOTO)
    c.setFillColor(colors.Color(0.04, 0.05, 0.04, alpha=0.80))
    c.rect(0, 0, W, H, fill=1, stroke=0)
    draw_logo(c, 42, H - 88, 112)
    c.setFillColor(GOLD)
    c.setFont('Helvetica-Bold', 9)
    c.drawString(42, H - 155, 'IL PROSSIMO PASSO')
    c.setFillColor(CREAM)
    c.setFont('Helvetica-Bold', 31)
    c.drawString(42, H - 207, 'DALLA MAPPA')
    c.drawString(42, H - 244, 'ALLA REGIA REALE')
    text_lines(c, 'La call di regia serve a validare priorita, offerta, materiali e obiettivo. Solo dopo SWA costruisce il piano editoriale e produce i contenuti.', 42, H - 285, W - 110, size=11, leading=16, color=CREAM)
    c.setFillColor(GOLD)
    c.roundRect(42, 160, W - 84, 68, 5, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont('Helvetica-Bold', 13)
    c.drawString(60, 200, 'SCRIVI BOWLING')
    c.setFont('Helvetica', 9.5)
    c.drawString(60, 181, 'Ricevi la tua Mappa Regia e prenota il confronto con SWA.')
    c.setFillColor(CREAM)
    c.setFont('Helvetica-Bold', 9)
    c.drawString(42, 96, '@SOCIALWEBAUTOMATION')
    c.setFont('Helvetica', 9)
    c.drawString(42, 78, 'www.socialautomation.app')
    c.showPage()


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=A4, pageCompression=1)
    c.setTitle('Mappa Regia Bowling SWA')
    c.setAuthor('Social Web Automation')
    c.setSubject('Direzione strategica premium per la comunicazione social di un bowling')
    page_cover(c)
    page_problem(c)
    page_direction(c)
    page_conversion(c)
    page_priorities(c)
    page_close(c)
    c.save()
    print(OUT)


if __name__ == '__main__':
    main()
