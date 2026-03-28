#!/usr/bin/env python3
"""
Fetcht SBZ + SHK-Journal RSS-Feeds und schreibt DeployNow/news.json
Laeuft als GitHub Actions Cron-Job (stuendlich)
"""

import json
import re
import urllib.request
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from xml.etree import ElementTree as ET

FEEDS = [
    {"url": "https://www.sbz-online.de/rss_feed/sbz-rss-feed-meldungen", "source": "SBZ Monteur"},
    {"url": "https://www.shk-journal.de/news/rss.xml",                    "source": "SHK Journal"},
]

CATEGORIES = {
    "Heizung":    r"heizung|waerme|waermepumpe|fernwaerme|kessel|brennwert|pellet|biomasse|gas|oel",
    "Sanitaer":   r"sanitaer|bad|dusche|wanne|waschtisch|armatur|rohr|leitung|wasser|abwasser",
    "Foerderung": r"foerderung|bafa|kfw|zuschuss|subvention|bundesfoerderung",
    "Smart Home": r"smart.?home|digital|steuerung|automation|app|sensor|vernetzt",
    "Branche":    r"handwerk|betrieb|markt|unternehmen|verband|innung|messe|zvshk|hwk",
}

# Unicode-Varianten fuer deutsche Umlaute im Regex
CATEGORIES_UNICODE = {
    "Heizung":    r"heizung|w[äa]rme|w[äa]rmepumpe|fernw[äa]rme|kessel|brennwert|pellet|biomasse|gas|[öo]l",
    "Sanitär":    r"sanit[äa]r|bad|dusche|wanne|waschtisch|armatur|rohr|leitung|wasser|abwasser",
    "Förderung":  r"f[öo]rderung|bafa|kfw|zuschuss|subvention|bundesf[öo]rderung",
    "Smart Home": r"smart.?home|digital|steuerung|automation|app|sensor|vernetzt",
    "Branche":    r"handwerk|betrieb|markt|unternehmen|verband|innung|messe|zvshk|hwk",
}


def detect_category(text: str) -> str:
    t = text.lower()
    for cat, pattern in CATEGORIES_UNICODE.items():
        if re.search(pattern, t):
            return cat
    return "Aktuell"


def format_date_de(dt: datetime) -> str:
    months = ["Jan.", "Feb.", "M\u00e4r.", "Apr.", "Mai", "Jun.",
              "Jul.", "Aug.", "Sep.", "Okt.", "Nov.", "Dez."]
    return f"{dt.day}. {months[dt.month - 1]} {dt.year}"


def strip_html(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text or "").strip()


def fetch_feed(feed: dict) -> list:
    req = urllib.request.Request(
        feed["url"],
        headers={"User-Agent": "Mozilla/5.0 (compatible; RuppertNewsBot/1.0)"}
    )
    ctx = urllib.request.ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = urllib.request.ssl.CERT_NONE

    with urllib.request.urlopen(req, timeout=15, context=ctx) as r:
        root = ET.fromstring(r.read())

    articles = []
    for item in root.findall(".//item"):
        title = (item.findtext("title") or "").strip()
        link  = (item.findtext("link")  or "").strip()
        desc  = strip_html(item.findtext("description") or "")[:220]
        pub   = item.findtext("pubDate") or ""

        try:
            dt = parsedate_to_datetime(pub)
        except Exception:
            dt = datetime.now(timezone.utc)

        articles.append({
            "title":    title,
            "excerpt":  desc,
            "link":     link,
            "date":     int(dt.timestamp()),
            "dateStr":  format_date_de(dt),
            "source":   feed["source"],
            "category": detect_category(title + " " + desc),
        })
    return articles


def main():
    all_articles = []
    for feed in FEEDS:
        try:
            items = fetch_feed(feed)
            all_articles.extend(items)
            print(f"OK  {feed['source']}: {len(items)} Artikel")
        except Exception as e:
            print(f"ERR {feed['source']}: {e}")

    all_articles.sort(key=lambda a: a["date"], reverse=True)

    output = {
        "ok":       True,
        "articles": all_articles,
        "fetched":  int(datetime.now(timezone.utc).timestamp()),
    }

    out_path = "news.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\nFertig: {len(all_articles)} Artikel -> {out_path}")


if __name__ == "__main__":
    import urllib.request
    import ssl as _ssl
    urllib.request.ssl = _ssl
    main()
