from pathlib import Path
import textwrap

from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader


OUT = Path("output/pdf/SWA-Presentazione-migliorata.pdf")
LOGO = Path("public/brand/swa-logo-official.png")
W, H = 960, 540

INK = colors.HexColor("#151812")
FOREST = colors.HexColor("#223F2C")
GOLD = colors.HexColor("#D6A839")
CREAM = colors.HexColor("#FFFAF0")
MUTED = colors.HexColor("#566050")
WHITE = colors.white


def wrapped(c, text, x, y, width, size=18, leading=25, font="Helvetica", color=INK, max_lines=8):
    c.setFont(font, size)
    c.setFillColor(color)
    chars = max(18, int(width / (size * 0.48)))
    for line in textwrap.wrap(text, chars)[:max_lines]:
        c.drawString(x, y, line)
        y -= leading
    return y


def draw_logo(c, x, y, w):
    if LOGO.exists():
        img = ImageReader(str(LOGO))
        iw, ih = img.getSize()
        c.drawImage(img, x, y, w, w * ih / iw, mask="auto")
    else:
        c.setFont("Helvetica-Bold", 24)
        c.drawString(x, y, "SWA")


def bg(c, dark=False):
    c.setFillColor(FOREST if dark else CREAM)
    c.rect(0, 0, W, H, fill=1, stroke=0)


def footer(c, page, dark=False):
    if not dark:
        c.setFillColor(FOREST)
        c.roundRect(48, 16, 96, 42, 6, fill=1, stroke=0)
    draw_logo(c, 58, 26, 72)
    c.setFont("Helvetica", 12)
    c.setFillColor(colors.HexColor("#D8D2BD") if dark else MUTED)
    c.drawString(145, 30, "Social Web Automation")
    c.drawRightString(W - 52, 30, f"{page:02d}")


def heading(c, eyebrow, title, subtitle="", page=1, dark=False):
    bg(c, dark)
    c.setFillColor(GOLD)
    c.rect(52, H - 78, 118, 6, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 14)
    c.setFillColor(GOLD if dark else FOREST)
    c.drawString(52, H - 110, eyebrow.upper())
    c.setFont("Helvetica-Bold", 39)
    c.setFillColor(CREAM if dark else FOREST)
    c.drawString(52, H - 166, title)
    if subtitle:
        wrapped(c, subtitle, 52, H - 208, 800, 20, 28, color=colors.HexColor("#E8E0C8") if dark else MUTED, max_lines=3)
    footer(c, page, dark)


def block(c, x, y, w, h, title, body="", badge=None, bullets=None):
    c.setFillColor(WHITE)
    c.roundRect(x, y, w, h, 8, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(x, y + h - 7, w, 7, fill=1, stroke=0)
    top = y + h - 44
    if badge:
        c.setFont("Helvetica-Bold", 20)
        c.setFillColor(FOREST)
        c.drawString(x + 26, top, badge)
        top -= 40
    c.setFont("Helvetica-Bold", 18)
    c.setFillColor(INK)
    c.drawString(x + 26, top, title)
    if bullets:
        yy = top - 30
        c.setFont("Helvetica", 13)
        for item in bullets[:5]:
            c.drawString(x + 26, yy, f"- {item}")
            yy -= 20
    else:
        wrapped(c, body, x + 26, top - 42, w - 52, 16, 23, max_lines=6)


def cover(c):
    bg(c, True)
    draw_logo(c, 52, H - 150, 245)
    c.setFillColor(GOLD)
    c.rect(52, H - 188, 150, 7, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 58)
    c.setFillColor(CREAM)
    c.drawString(52, H - 268, "Una sola regia")
    c.drawString(52, H - 334, "digitale")
    wrapped(c, "Social, siti web, blog, ricerca clienti, automazioni e AI compliance per PMI e professionisti italiani.", 52, 148, 660, 23, 32, color=colors.HexColor("#E8E0C8"), max_lines=3)
    c.setFont("Helvetica-Bold", 16)
    c.setFillColor(GOLD)
    c.drawString(52, 62, "SOCIALAUTOMATION.APP  -  @SOCIALWEBAUTOMATION")


def divider(c, n, title, subtitle, page):
    heading(c, n, title, subtitle, page, True)


def toc(c, page):
    heading(c, "Sommario", "Dentro la presentazione", "Versione estesa: identità, metodo, servizi, web, piani e garanzie di processo.", page)
    rows = [
        ("01", "Identità", "Perché una regia sola semplifica il lavoro."),
        ("02", "Team e ruoli", "Marco, specialisti, AI supervisionata e compliance."),
        ("03", "Metodo", "Dal punto di partenza reale al report."),
        ("04", "Servizi", "Social, Blog, SEO/GEO, Web, B2B, voce e sistemi."),
        ("05", "Web", "Landing da 19,90 €/mese; e-commerce su preventivo."),
        ("06", "Piani", "Presenza, Crescita e configurazioni su misura."),
        ("07", "Fiducia", "Cosa garantiamo davvero e cosa non promettiamo."),
    ]
    y = 300
    for n, t, d in rows:
        c.setFont("Helvetica-Bold", 24)
        c.setFillColor(GOLD)
        c.drawString(78, y, n)
        c.setFont("Helvetica-Bold", 20)
        c.setFillColor(INK)
        c.drawString(140, y, t)
        c.setFont("Helvetica", 16)
        c.setFillColor(MUTED)
        c.drawString(310, y, d)
        y -= 42


def identity(c, page):
    heading(c, "01 - Identità", "Nove cose, una regia sola", "SWA sta per Social Web Automation: più competenze digitali coordinate da una direzione unica.", page)
    block(c, 52, 92, 260, 198, "Per chi", "PMI, attività locali, studi professionali, negozi, e-commerce e realtà B2B che vogliono comunicare con continuità senza seguire ogni giorno tutti i canali.")
    block(c, 350, 92, 260, 198, "Il problema", "Social, sito, SEO, campagne, dati e telefono spesso viaggiano separati. Il coordinamento ricade sul titolare.")
    block(c, 648, 92, 260, 198, "La risposta", "SWA tiene insieme strategia, produzione, pubblicazione, controllo qualità e report. Tu porti informazioni vere e approvi; noi coordiniamo.", "1 regia")


def team(c, page):
    heading(c, "02 - Team e ruoli", "Chi decide, chi produce", "Le competenze sono diverse, la direzione è una sola: il cliente ha un interlocutore chiaro.", page)
    block(c, 52, 232, 405, 145, "Regia - Marco Dibenedetto", "Segue strategia, standard qualitativi e rapporto con il cliente. È il punto di riferimento su priorità, tono e perimetro.")
    block(c, 502, 232, 405, 145, "Competenze specialistiche", "Contenuti social, SEO/GEO, web, ricerca B2B, automazioni e sistemi AI lavorano su aree diverse, dentro lo stesso impianto.")
    block(c, 52, 78, 405, 150, "Compliance legale", "L'Avv. Vincenzo Sapone, Cassazionista dello Studio Legale BCS, segue GDPR, AI Act e diritto delle nuove tecnologie.")
    block(c, 502, 78, 405, 150, "AI supervisionata", "L'AI accelera analisi e produzione. Non sostituisce direzione, verifica o responsabilità: prima della pubblicazione passa sempre un controllo umano.")


def method(c, page):
    heading(c, "03 - Metodo", "Un flusso unico", "Ogni passaggio lascia un risultato verificabile e prepara quello successivo.", page)
    steps = [
        ("01", "Analisi", "Canali, sito, offerta, pubblico, tempo, materiali, concorrenti."),
        ("02", "Architettura", "Messaggi, pagine, contenuti, CTA, priorità e calendario."),
        ("03", "Produzione", "Copy, grafiche, video, articoli, pagine web o automazioni."),
        ("04", "Approvazione", "Niente viene pubblicato senza il tuo sì."),
        ("05", "Pubblicazione", "Social, blog, sito o flussi operativi secondo il piano."),
        ("06", "Report", "Cosa è uscito, cosa ha funzionato, cosa si corregge."),
    ]
    for i, (num, title, body) in enumerate(steps):
        block(c, 52 + (i % 3) * 298, 220 if i < 3 else 78, 260, 120, title, body, num)


def services_a(c, page):
    heading(c, "04 - Servizi", "Contenuti e visibilità", "La prima area serve a farti riconoscere e trovare: social, blog e struttura organica.", page)
    block(c, 52, 118, 260, 185, "Gestione social", "", "da 490 €/mese", ["Piano editoriale mensile", "Copy, grafiche, Reel/Stories", "Approvazione e pubblicazione", "Solo crescita organica"])
    block(c, 350, 118, 260, 185, "Blog SEO + GEO", "", "29,90 €/mese", ["12 articoli al mese", "FAQ e dati strutturati", "Revisione umana", "Blog o export CMS"])
    block(c, 648, 118, 260, 185, "SEO + GEO", "", "strategia", ["Audit e architettura", "Keyword intent ed entità", "Pagine servizio", "Nessuna citazione garantita"])


def services_b(c, page):
    heading(c, "04 - Servizi", "Azioni, dati e operatività", "La seconda area serve a trasformare attenzione in richieste e a ridurre lavoro manuale.", page)
    block(c, 52, 118, 260, 185, "Siti web", "", "da 19,90 €/mese", ["Landing semplice", "Sito base mobile-first", "Moduli e analytics", "E-commerce escluso"])
    block(c, 350, 118, 260, 185, "Ricerca B2B", "", "149 € una tantum", ["Profilo cliente ideale", "Fino a 30 aziende", "Fonti verificabili", "Nessun invio automatico"])
    block(c, 648, 118, 260, 185, "Automazioni", "", "su misura", ["CRM e gestionali", "Notifiche e report", "Processi ripetitivi", "Costi approvati prima"])


def web(c, page):
    heading(c, "05 - Web", "19,90 €/mese non è e-commerce", "Il prezzo base riguarda una landing page semplice o un sito web essenziale. Da lì il prezzo sale.", page)
    block(c, 52, 220, 260, 175, "Landing semplice", "Una pagina focalizzata: spiega l'offerta, raccoglie contatti e si collega a campagne, social o WhatsApp.", "19,90 €/mese")
    block(c, 350, 220, 260, 175, "Sito aziendale", "Più pagine, testi, immagini, servizi, moduli e percorsi richiedono una valutazione del progetto.", "su preventivo")
    block(c, 648, 220, 260, 175, "E-commerce", "Catalogo, varianti, pagamenti, ordini, email, privacy, logistica e tracking sono un progetto separato.", "non incluso")
    wrapped(c, "Nel lavoro web curiamo struttura, gerarchie, leggibilità mobile, CTA, moduli, SEO tecnica essenziale, analytics e collegamento con contenuti e campagne. Dominio, servizi esterni e funzioni non comprese vengono indicati prima dell'avvio. Dopo 12 mesi di canone, il sito diventa di proprietà del cliente.", 72, 110, 820, 19, 27, color=INK, max_lines=4)


def voice(c, page):
    heading(c, "06 - Voce e agenda", "Quando il cliente chiama", "Due servizi per chi lavora su appuntamento: risposta telefonica AI e recupero clienti via agenda/WhatsApp.", page)
    block(c, 52, 210, 405, 190, "Segretaria telefonica AI", "", "da 199 €/mese", ["Voce Base: 300 minuti", "Voce Attività: 700 minuti", "Voce Azienda: 1500 minuti", "Avvio indicato prima"])
    block(c, 502, 210, 405, 190, "Agenda, clienti e WhatsApp", "", "da 390 €/mese", ["Spazi liberi in agenda", "Clienti da ricontattare", "Messaggi pronti da approvare", "Tutto in uno: 569 €/mese"])
    wrapped(c, "Le informazioni usate dall'assistente sono quelle approvate dal cliente: servizi, prezzi, orari, regole e casi da passare a una persona.", 86, 126, 760, 22, 31, color=INK, max_lines=2)


def plans(c, page):
    heading(c, "07 - Piani social", "Presenza o Crescita", "I volumi sono per ogni social. Con due canali attivi, le pubblicazioni raddoppiano.", page)
    block(c, 52, 210, 260, 190, "Presenza", "", "490 €/mese", ["16 contenuti per social", "12 post/caroselli", "4 Reel o Stories", "fino a 32 pubblicazioni"])
    block(c, 350, 210, 260, 190, "Crescita", "", "990 €/mese", ["24 contenuti per social", "18 post/caroselli", "6 Reel o Short", "fino a 48 pubblicazioni"])
    block(c, 648, 210, 260, 190, "Su misura", "", "da definire", ["E-commerce e più brand", "Campagne a pagamento", "Automazioni e integrazioni", "Budget ADV separato"])
    wrapped(c, "Setup incluso nei piani social. Prezzi IVA esclusa, rinnovo mensile. I piani standard lavorano sulla crescita organica; le campagne a pagamento vengono concordate a parte.", 72, 112, 820, 19, 27, color=INK, max_lines=3)


def trust(c, page):
    heading(c, "08 - Fiducia", "Cosa garantiamo davvero", "Processo controllabile, approvazioni chiare e nessuna promessa che non dipende solo da noi.", page)
    block(c, 52, 240, 260, 160, "Il tuo sì", "Prima vedi, poi decidi, poi si pubblica. L'approvazione è una fase del metodo, non una formalità.")
    block(c, 350, 240, 260, 160, "Trasparenza AI", "Dichiariamo dove l'AI aiuta e dove serve controllo umano. Niente contenuti pubblicati automaticamente alle tue spalle.")
    block(c, 648, 240, 260, 160, "Limiti chiari", "Nessun primo posto garantito, nessuna citazione AI garantita, nessun numero di lead o vendite promesso.")
    wrapped(c, "La serietà sta anche nel dire cosa non possiamo garantire. Possiamo costruire contenuti più chiari, processi migliori e punti di conversione più ordinati; il mercato resta il mercato.", 86, 142, 780, 23, 32, color=INK, max_lines=3)


def contacts(c, page):
    bg(c, True)
    draw_logo(c, 52, H - 150, 220)
    c.setFillColor(GOLD)
    c.rect(52, H - 184, 150, 7, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 48)
    c.setFillColor(CREAM)
    c.drawString(52, H - 260, "Prima verifichi,")
    c.drawString(52, H - 315, "poi decidi")
    wrapped(c, "Raccontaci il punto di partenza reale: canali, obiettivi, materiali e risorse disponibili. Da lì definiamo servizio, perimetro e costi.", 52, 160, 650, 22, 31, color=colors.HexColor("#E8E0C8"), max_lines=3)
    c.setFont("Helvetica-Bold", 17)
    c.setFillColor(GOLD)
    c.drawString(52, 70, "socialautomation.app")
    c.drawString(330, 70, "socialautomation.app")
    c.drawString(610, 70, "@socialwebautomation")
    footer(c, page, True)


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=(W, H))
    pages = [
        cover,
        toc,
        lambda cc, p: divider(cc, "01", "Identità", "Da più fornitori scollegati a una regia sola.", p),
        identity,
        team,
        method,
        lambda cc, p: divider(cc, "04", "Servizi", "Ogni area ha un compito preciso e un perimetro dichiarato.", p),
        services_a,
        services_b,
        web,
        voice,
        plans,
        trust,
        contacts,
    ]
    for page, fn in enumerate(pages, 1):
        if fn is cover:
            fn(c)
        else:
            fn(c, page)
        c.showPage()
    c.save()
    print(OUT)


if __name__ == "__main__":
    main()
