#!/usr/bin/env python3
"""Generate level-specific subdomain sites from site.config.json."""

import json
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONFIG = json.loads((ROOT / "site.config.json").read_text())
DOMAIN = CONFIG["domain"]
BRAND = CONFIG["brand"]
LEVELS = CONFIG["levels"]
LEVEL_ORDER = ["a1", "a2", "b1", "b2", "c1", "c2"]

APP_STORE_SVG = '<svg class="app-store-badge__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>'

# Shared articles available on every level blog (paths relative to level blog/)
SHARED_ARTICLES = [
    ("goethe-exam-passing-score.html", "Scoring", "Goethe exam passing score explained", "60/100 overall and skill minimums — applies to all levels."),
    ("goethe-horen-listening-tips.html", "Hören", "Goethe Hören listening tips", "Strategies for the listening section at any level."),
    ("goethe-schreiben-writing-guide.html", "Schreiben", "Goethe Schreiben writing guide", "Writing tasks, word counts, and rubric criteria."),
    ("goethe-exam-study-plan.html", "Study plan", "4, 8 & 12 week study plans", "Structured timelines before test day."),
    ("how-to-prepare-goethe-exam.html", "Preparation", "How to prepare step-by-step", "From level check to full mock exams."),
]

LEVEL_EXTRA_ARTICLES = {
    "a1": [],
    "a2": [],
    "b1": [
        ("goethe-b1-vs-b2.html", "Levels", "Goethe B1 vs B2", "Which exam should you take next?"),
    ],
    "b2": [
        ("goethe-b2-exam-tips.html", "Tips", "Goethe B2 exam tips", "How to pass the Goethe-Zertifikat B2."),
        ("goethe-b1-vs-b2.html", "Levels", "Goethe B1 vs B2", "Compare B1 and B2 difficulty and requirements."),
    ],
    "c1": [],
    "c2": [],
}


def url(level=None, path=""):
    base = f"https://{DOMAIN}" if level is None else f"https://{level}.{DOMAIN}"
    return base + path


def asset_prefix(depth):
    """Depth = number of segments from repo root (sites/b1 → 2, sites/b1/blog → 3)."""
    return "../" * depth


def level_picker(current=None):
    links = []
    main_cls = ' class="level-pill level-pill--active"' if current is None else ' class="level-pill"'
    links.append(f'<a href="{url()}"{main_cls}>All levels</a>')
    for lid in LEVEL_ORDER:
        info = LEVELS[lid]
        cls = ' class="level-pill level-pill--active"' if lid == current else ' class="level-pill"'
        links.append(f'<a href="{url(lid)}"{cls}>{info["code"]}</a>')
    return "\n        ".join(links)


def head(level, title, description, depth=2, canonical_path="/"):
    ap = asset_prefix(depth)
    sub = f"{level}." if level else ""
    canonical = url(level, canonical_path)
    return f"""  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{description}">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="{BRAND}">
  <meta name="theme-color" content="#f5f5f7">
  <link rel="canonical" href="{canonical}">
  <title>{title}</title>
  <link rel="stylesheet" href="{ap}css/styles.css">
  <link rel="stylesheet" href="{ap}css/blog.css">"""


def header_nav(level, depth=2, blog=False):
    ap = asset_prefix(depth)
    if level and blog:
        home = "../index.html"
        blog_href = "index.html"
        features = "../index.html#features"
        download = "../index.html#download"
        logo_href = "../index.html"
    elif level:
        home = "index.html"
        blog_href = "blog/index.html"
        features = "#features"
        download = "#download"
        logo_href = "index.html"
    else:
        home = f"{ap}index.html"
        blog_href = "blog/index.html"
        features = f"{ap}index.html#features"
        download = f"{ap}index.html#download"
        logo_href = "#top"
    return f"""  <header class="site-header" id="top">
    <div class="container header-inner">
      <a href="{logo_href}" class="logo">
        <span class="logo-mark" aria-hidden="true">{LEVELS[level]['code'][0] if level else 'P'}</span>
        <span class="logo-text">{BRAND}<span class="logo-accent">{'' if not level else ' ' + LEVELS[level]['code']}</span></span>
      </a>
      <button class="nav-toggle" id="nav-toggle" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <nav class="site-nav" id="site-nav">
        <a href="{features}">Features</a>
        <a href="{blog_href}">Blog</a>
        <a href="{download}" class="nav-cta">App Store</a>
      </nav>
    </div>
    <div class="container level-picker-wrap">
      <nav class="level-picker" aria-label="Exam level">
        {level_picker(level)}
      </nav>
    </div>
  </header>"""


def footer_block(level, depth=2):
    ap = asset_prefix(depth)
    main_link = f"{ap}index.html"
    tag = f"{LEVELS[level]['name']} exam prep." if level else "Goethe exam prep for every level — A1 to C2."
    return f"""  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-brand-block">
        <p class="footer-brand">{BRAND}<span>{' ' + LEVELS[level]['code'] if level else ''}</span></p>
        <p class="footer-tagline">{tag}</p>
      </div>
      <nav class="footer-nav" aria-label="Footer">
        <a href="{main_link}">All levels</a>
        <a href="blog/index.html" if level else 'blog/index.html'>Blog</a>
      </nav>
      <p class="footer-legal">
        Unofficial — not affiliated with the Goethe-Institut.<br>
        &copy; 2026 {BRAND} · <a href="{url(level if level else None)}" style="color:inherit">{url(level).replace('https://', '') if level else DOMAIN}</a>
      </p>
    </div>
  </footer>"""


def fix_footer(level, depth):
    ap = asset_prefix(depth)
    blog_href = "blog/index.html"
    main = f"{ap}index.html" if level else "index.html"
    tag = f"{LEVELS[level]['name']} exam prep for iPhone & iPad." if level else "Goethe exam prep for every level — A1 to C2."
    sub = f" {LEVELS[level]['code']}" if level else ""
    host = f"{level}.{DOMAIN}" if level else DOMAIN
    return f"""  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-brand-block">
        <p class="footer-brand">{BRAND}<span>{sub}</span></p>
        <p class="footer-tagline">{tag}</p>
      </div>
      <nav class="footer-nav" aria-label="Footer">
        <a href="{main}">All levels</a>
        <a href="{blog_href}">Blog</a>
      </nav>
      <p class="footer-legal">
        Unofficial — not affiliated with the Goethe-Institut.<br>
        &copy; 2026 {BRAND} · {host}
      </p>
    </div>
  </footer>"""


def generate_level_index(level):
    info = LEVELS[level]
    code = info["code"]
    ap = "../../"
    other_levels = [f'<a href="{url(l)}" class="level-link-card"><strong>{LEVELS[l]["code"]}</strong><span>{LEVELS[l]["cefr"]}</span></a>' for l in LEVEL_ORDER if l != level]

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
{head(level, f"{BRAND} {code} — Goethe {code} Exam Prep for iOS", f"Prepare for the {info['name']} on iPhone & iPad. Seven {code}-format practice exams, audio, AI writing review, and stats. Download on the App Store.", 2, "/")}
</head>
<body data-level="{level}">

{header_nav(level, 2)}

  <main>
    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-content reveal">
          <p class="eyebrow">{info['name']} · iPhone &amp; iPad</p>
          <h1>Pass Goethe {code}<br>with confidence</h1>
          <p class="hero-lead">
            {info['tagline']}
            {BRAND} {code} gives you seven full {code}-format Modellprüfungen on iOS —
            with quick drills, exam audio, AI Schreiben feedback, and progress stats.
          </p>
          <div class="hero-actions">
            <a href="#download" class="app-store-badge app-store-badge--lg" aria-label="Download on the App Store">
              {APP_STORE_SVG}
              <span class="app-store-badge__text"><small>Download on the</small><strong>App Store</strong></span>
            </a>
            <a href="blog/index.html" class="btn btn-secondary">{code} exam guides</a>
          </div>
          <p class="ios-requirements">Requires iOS 16+ · {info['examDuration']}</p>
        </div>
        <div class="hero-visual reveal reveal-delay">
          <div class="device-frame device-phone">
            <div class="device-island" aria-hidden="true"></div>
            <figure class="screenshot-placeholder" data-label="{code} home">
              <div class="placeholder-inner"><span>{code}</span><small>App dashboard</small></div>
            </figure>
          </div>
        </div>
      </div>
    </section>

    <section class="trust-strip">
      <div class="container trust-grid">
        <div class="trust-item"><strong>7</strong><span>{code} practice exams</span></div>
        <div class="trust-item"><strong>100</strong><span>points per exam</span></div>
        <div class="trust-item"><strong>{code}</strong><span>official format</span></div>
        <div class="trust-item"><strong>iOS</strong><span>iPhone &amp; iPad</span></div>
      </div>
    </section>

    <section class="section" id="features">
      <div class="container">
        <div class="section-header center reveal">
          <p class="eyebrow">Built for {code}</p>
          <h2>Everything for {info['name']} prep</h2>
          <p>Not a generic app — timing, tasks, and scoring mirror the real {code} exam. {info['useCase']}</p>
        </div>
        <div class="feature-showcase">
          <article class="showcase-row reveal">
            <div class="showcase-copy">
              <span class="showcase-tag">{code} exams</span>
              <h3>7 full {code} Modellprüfungen</h3>
              <p>Complete Lesen, Hören, Schreiben, and Sprechen sessions scored out of 100 — structured exactly like test day for {info['name']} candidates.</p>
            </div>
            <div class="showcase-visual">
              <div class="device-frame device-phone">
                <div class="device-island" aria-hidden="true"></div>
                <figure class="screenshot-placeholder" data-label="{code} exams"><div class="placeholder-inner"><span>Exams</span></div></figure>
              </div>
            </div>
          </article>
          <article class="showcase-row reverse reveal">
            <div class="showcase-copy">
              <span class="showcase-tag">Quick practice</span>
              <h3>{code} drills in minutes</h3>
              <p>Short Teil-by-Teil sessions for each skill — ideal between full {code} mock exams.</p>
            </div>
            <div class="showcase-visual">
              <div class="device-frame device-phone">
                <div class="device-island" aria-hidden="true"></div>
                <figure class="screenshot-placeholder" data-label="Drills"><div class="placeholder-inner"><span>Drill</span></div></figure>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="section section-alt" id="blog">
      <div class="container">
        <div class="section-header center reveal">
          <p class="eyebrow">{code} guides</p>
          <h2>{code} exam tips &amp; preparation</h2>
          <p>Guides written for {info['name']} candidates on {level}.{DOMAIN}.</p>
        </div>
        <div class="blog-preview-grid reveal">
          <a href="blog/goethe-{level}-exam-format.html" class="blog-preview-card">
            <span class="blog-tag">{code} · Format</span>
            <h3>Goethe {code} exam format guide</h3>
            <p>Sections, timing, and scoring for {info['name']}.</p>
          </a>
          <a href="blog/goethe-exam-passing-score.html" class="blog-preview-card">
            <span class="blog-tag">Scoring</span>
            <h3>Passing score for {code}</h3>
            <p>What you need out of 100 to pass {info['name']}.</p>
          </a>
          <a href="blog/how-to-prepare-goethe-exam.html" class="blog-preview-card">
            <span class="blog-tag">Prep</span>
            <h3>How to prepare for {code}</h3>
            <p>Step-by-step plan for {info['cefr'].lower()} learners.</p>
          </a>
        </div>
        <p style="text-align:center;margin-top:1.75rem;"><a href="blog/index.html" class="btn btn-secondary">All {code} articles</a></p>
      </div>
    </section>

    <section class="section" id="faq">
      <div class="container container-narrow">
        <div class="section-header center reveal"><h2>{code} FAQ</h2></div>
        <div class="faq-list reveal">
          <details class="faq-item" open>
            <summary>Is this the right site for Goethe {code}?</summary>
            <p>Yes. {level}.{DOMAIN} is dedicated to {info['name']} preparation. For other levels, visit <a href="{url()}">{DOMAIN}</a> or pick a level above.</p>
          </details>
          <details class="faq-item">
            <summary>How long is the Goethe {code} exam?</summary>
            <p>Typically {info['examDuration']}. The app mirrors official section timing for {code}.</p>
          </details>
          <details class="faq-item">
            <summary>Is the app only on iOS?</summary>
            <p>Yes — {BRAND} is available on the App Store for iPhone and iPad (iOS 16+).</p>
          </details>
        </div>
      </div>
    </section>

    <section class="section cta-section" id="download">
      <div class="container cta-inner reveal">
        <div class="cta-copy">
          <h2>Start your {code} preparation</h2>
          <p>Download {BRAND} and practise seven full {code} exams on your iPhone or iPad.</p>
          <a href="#" class="app-store-badge app-store-badge--lg app-store-badge--light" aria-label="Download on the App Store">
            {APP_STORE_SVG}
            <span class="app-store-badge__text"><small>Download on the</small><strong>App Store</strong></span>
          </a>
        </div>
      </div>
    </section>
  </main>

{fix_footer(level, 2)}

  <script src="{ap}js/main.js"></script>
</body>
</html>
"""
    return html


def generate_format_article(level):
    info = LEVELS[level]
    code = info["code"]
    slug = f"goethe-{level}-exam-format.html"
    ap = "../../../"

    sections = {
        "a1": "<li><strong>Lesen:</strong> short texts, signs, simple forms</li><li><strong>Hören:</strong> short announcements and dialogues</li><li><strong>Schreiben:</strong> fill forms, short messages</li><li><strong>Sprechen:</strong> introduce yourself, ask/answer simple questions</li>",
        "a2": "<li><strong>Lesen:</strong> everyday texts, ads, simple articles</li><li><strong>Hören:</strong> short radio clips and conversations</li><li><strong>Schreiben:</strong> personal letters, short emails (~80 words)</li><li><strong>Sprechen:</strong> describe photos, react to prompts</li>",
        "b1": "<li><strong>Lesen:</strong> 5 Teile — matching, MCQ, gap-fill</li><li><strong>Hören:</strong> 4 Teile — conversations, interviews</li><li><strong>Schreiben:</strong> 2 texts (~80 words each)</li><li><strong>Sprechen:</strong> planning, presentation, discussion</li>",
        "b2": "<li><strong>Lesen:</strong> opinion texts, grammar in context</li><li><strong>Hören:</strong> interviews, discussions at natural speed</li><li><strong>Schreiben:</strong> formal email + ~180-word essay</li><li><strong>Sprechen:</strong> presentation + argument discussion</li>",
        "c1": "<li><strong>Lesen:</strong> complex academic and literary texts</li><li><strong>Hören:</strong> lectures and detailed interviews</li><li><strong>Schreiben:</strong> structured argument (~200+ words)</li><li><strong>Sprechen:</strong> sustained monologue + debate</li>",
        "c2": "<li><strong>Lesen:</strong> literary and abstract texts</li><li><strong>Hören:</strong> extended authentic audio</li><li><strong>Schreiben:</strong> nuanced formal composition</li><li><strong>Sprechen:</strong> complex discussion and rhetoric</li>",
    }

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
{head(level, f"Goethe {code} Exam Format — Complete Guide | {BRAND}", f"Goethe {code} ({info['name']}) exam format: sections, timing ({info['examDuration']}), and 100-point scoring.", 3, f"/blog/{slug}")}
  <script type="application/ld+json">{{"@context":"https://schema.org","@type":"Article","headline":"Goethe {code} Exam Format Guide","datePublished":"2026-06-10","author":{{"@type":"Organization","name":"{BRAND}"}}}}</script>
</head>
<body>
{header_nav(level, 3, blog=True)}
  <main class="article-page">
    <div class="container article-layout">
      <article class="article-main">
        <nav class="breadcrumbs"><a href="../index.html">Home</a><span>/</span><a href="index.html">Blog</a><span>/</span><span aria-current="page">{code} Format</span></nav>
        <header class="article-header">
          <h1>Goethe {code} Exam Format: Complete Guide</h1>
          <div class="article-byline"><time datetime="2026-06-10">June 10, 2026</time><span>·</span><span>{info['name']}</span></div>
        </header>
        <div class="key-takeaways">
          <h2>Key takeaways</h2>
          <ul>
            <li><strong>{info['name']}</strong> certifies CEFR <strong>{code}</strong> ({info['cefr'].lower()}).</li>
            <li>Four skills: Lesen, Hören, Schreiben, Sprechen — <strong>100 points</strong> total.</li>
            <li>Typical duration: {info['examDuration']}.</li>
            <li>This guide lives on <strong>{level}.{DOMAIN}</strong> — the {code} prep site.</li>
          </ul>
        </div>
        <div class="article-content">
          <p>Preparing for <strong>{info['name']}</strong>? This guide on <a href="{url(level)}">{level}.{DOMAIN}</a> explains the official {code} structure. {info['useCase']}</p>
          <h2 id="sections">What the {code} exam tests</h2>
          <ul>{sections[level]}</ul>
          <h2>Scoring</h2>
          <p>Each skill is worth 25 points (100 total). You generally need ≥60 overall with minimums in Schreiben and Sprechen. See our <a href="goethe-exam-passing-score.html">passing score guide</a>.</p>
          <h2>Prepare with the app</h2>
          <p>{BRAND} includes seven {code}-format practice exams with audio, writing review, and stats — <a href="../index.html#download">download on the App Store</a>.</p>
          <p>Studying a different level? Visit <a href="{url()}">{DOMAIN}</a> for A1–C2.</p>
        </div>
        <aside class="article-cta"><h2>Practise Goethe {code} on iOS</h2><a href="../index.html#download" class="btn btn-primary">App Store</a></aside>
      </article>
    </div>
  </main>
{fix_footer(level, 3)}
  <script src="{ap}js/main.js"></script>
</body>
</html>"""


def adapt_shared_article(level, filename):
    """Copy shared article from main blog and inject level context."""
    src = ROOT / "blog" / filename
    if not src.exists():
        return None
    text = src.read_text()
    info = LEVELS[level]
    code = info["code"]
    sub_host = f"{level}.{DOMAIN}"

    # Fix asset paths for sites/LEVEL/blog/
    text = text.replace('href="../css/', 'href="../../../css/')
    text = text.replace('src="../js/', 'src="../../../js/')
    text = text.replace('href="index.html"', 'href="index.html"')
    text = text.replace("GoethePractice", BRAND)
    text = text.replace("goethepractice.app", f"{level}.{DOMAIN}")
    text = text.replace('class="nav-active">Blog', 'class="nav-active">Blog')

    # Insert level picker after header if not present
    if "level-picker" not in text:
        text = text.replace(
            "</header>",
            f"""    <div class="container level-picker-wrap">
      <nav class="level-picker" aria-label="Exam level">
        {level_picker(level)}
      </nav>
    </div>
  </header>""",
            1,
        )

    # Add level banner after body
    banner = f'<div class="level-site-banner container" role="note">{BRAND} <strong>{code}</strong> · {sub_host} · <a href="{url()}">All levels</a></div>\n'
    if "level-site-banner" not in text:
        text = text.replace("<body>", f"<body data-level=\"{level}\">\n  {banner}", 1)

    # Update title if generic
    if "<title>" in text and code not in text.split("<title>")[1].split("</title>")[0]:
        text = re.sub(
            r"<title>([^<]*)</title>",
            lambda m: f"<title>{m.group(1).replace('| GoethePractice', '')} ({code}) | {BRAND} {code}</title>",
            text,
            count=1,
        )

    canonical = url(level, f"/blog/{filename}")
    if 'rel="canonical"' in text:
        text = re.sub(r'<link rel="canonical" href="[^"]*"', f'<link rel="canonical" href="{canonical}"', text)
    else:
        text = text.replace("</head>", f'  <link rel="canonical" href="{canonical}">\n</head>', 1)

    return text


def generate_blog_index(level):
    info = LEVELS[level]
    code = info["code"]
    ap = "../../../"

    cards = f"""
        <article class="blog-card">
          <div class="blog-card-body">
            <div class="blog-card-meta"><span class="blog-tag">{code}</span><span class="blog-tag">Format</span></div>
            <h2><a href="goethe-{level}-exam-format.html">Goethe {code} Exam Format: Complete Guide</a></h2>
            <p>Sections, timing, and scoring for {info['name']} on {level}.{DOMAIN}.</p>
            <a href="goethe-{level}-exam-format.html" class="blog-card-link">Read guide →</a>
          </div>
        </article>"""

    for fname, tag, title, desc in SHARED_ARTICLES:
        cards += f"""
        <article class="blog-card">
          <div class="blog-card-body">
            <div class="blog-card-meta"><span class="blog-tag">{tag}</span><span class="blog-tag">{code}</span></div>
            <h2><a href="{fname}">{title}</a></h2>
            <p>{desc.replace('all levels', code).replace('any level', f'{code} level')}</p>
            <a href="{fname}" class="blog-card-link">Read guide →</a>
          </div>
        </article>"""

    for fname, tag, title, desc in LEVEL_EXTRA_ARTICLES.get(level, []):
        cards += f"""
        <article class="blog-card">
          <div class="blog-card-body">
            <div class="blog-card-meta"><span class="blog-tag">{tag}</span></div>
            <h2><a href="{fname}">{title}</a></h2>
            <p>{desc}</p>
            <a href="{fname}" class="blog-card-link">Read guide →</a>
          </div>
        </article>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
{head(level, f"Goethe {code} Blog — Exam Guides | {BRAND}", f"Free Goethe {code} exam guides: format, passing score, Hören, Schreiben, and study plans on {level}.{DOMAIN}.", 3, "/blog/")}
</head>
<body data-level="{level}">
{header_nav(level, 3, blog=True)}
  <main>
    <header class="blog-hero">
      <div class="container">
        <nav class="breadcrumbs"><a href="../index.html">Home</a><span>/</span><span aria-current="page">{code} Blog</span></nav>
        <h1>Goethe {code} exam guides</h1>
        <p>Preparation articles for <strong>{info['name']}</strong> — hosted on <strong>{level}.{DOMAIN}</strong>. Also see <a href="{url()}/blog/">all-level guides</a> on {DOMAIN}.</p>
      </div>
    </header>
    <div class="container"><div class="blog-grid">{cards}</div></div>
  </main>
{fix_footer(level, 3)}
  <script src="{ap}js/main.js"></script>
</body>
</html>"""


def main():
    sites_dir = ROOT / "sites"
    sites_dir.mkdir(exist_ok=True)

    for level in LEVEL_ORDER:
        site_dir = sites_dir / level
        blog_dir = site_dir / "blog"
        blog_dir.mkdir(parents=True, exist_ok=True)

        (site_dir / "index.html").write_text(generate_level_index(level))
        (blog_dir / "index.html").write_text(generate_blog_index(level))
        (blog_dir / f"goethe-{level}-exam-format.html").write_text(generate_format_article(level))

        for fname, _, _, _ in SHARED_ARTICLES + LEVEL_EXTRA_ARTICLES.get(level, []):
            adapted = adapt_shared_article(level, fname)
            if adapted:
                (blog_dir / fname).write_text(adapted)

        # CNAME for deployment
        (site_dir / "CNAME").write_text(f"{level}.{DOMAIN}\n")

    # Main domain CNAME
    (ROOT / "CNAME").write_text(f"{DOMAIN}\n")

    print(f"Generated {len(LEVEL_ORDER)} level sites under sites/")


if __name__ == "__main__":
    main()
