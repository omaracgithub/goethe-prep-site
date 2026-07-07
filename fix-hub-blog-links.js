#!/usr/bin/env node
/**
 * Fix goetheprep.com hub issues:
 * 1. Fix nav links in translated pages: /blog/ → /{lang}/blog/
 * 2. Create /{lang}/blog/index.html for all languages
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const LANGS = ['ar','de','es','fr','id','it','ja','ko','nl','pl','pt','ru','tr','uk','vi','zh'];

// ─── Issue 1: Fix /blog/ links in translated index.html pages ───

console.log('=== Fixing nav/blog links in translated pages ===\n');

for (const lang of LANGS) {
  const filePath = path.join(ROOT, lang, 'index.html');
  if (!fs.existsSync(filePath)) {
    console.log(`  SKIP ${lang}/index.html (not found)`);
    continue;
  }

  let html = fs.readFileSync(filePath, 'utf-8');
  let changes = 0;

  // Replace href="/blog/..." with href="/{lang}/blog/..."
  // But NOT if already prefixed with a language code
  const blogLinkRegex = /href="\/blog\//g;
  const replacement = `href="/${lang}/blog/`;
  const matches = html.match(blogLinkRegex);
  if (matches) {
    changes = matches.length;
    html = html.replace(blogLinkRegex, replacement);
  }

  if (changes > 0) {
    fs.writeFileSync(filePath, html, 'utf-8');
    console.log(`  ✓ ${lang}/index.html — fixed ${changes} blog link(s)`);
  } else {
    console.log(`  · ${lang}/index.html — no /blog/ links found`);
  }
}

// ─── Issue 2: Create /{lang}/blog/index.html for each language ───

console.log('\n=== Creating translated blog index pages ===\n');

// Read the English blog index as template
const englishBlog = fs.readFileSync(path.join(ROOT, 'blog', 'index.html'), 'utf-8');

// Blog page translations (minimal — just the hero heading + subhead and nav)
const translations = {
  ar: { title: 'مدونة امتحان غوته — أدلة ونصائح | GoethePrep', h1: 'أدلة التحضير لامتحان غوته', subtitle: 'كل ما تحتاج معرفته عن Goethe-Zertifikat — الشكل والتقييم والمهارات واستراتيجيات الدراسة لكل مستوى.', dir: 'rtl' },
  de: { title: 'Goethe-Prüfung Blog — Leitfäden & Tipps | GoethePrep', h1: 'Goethe-Prüfung Vorbereitungsguides', subtitle: 'Alles über das Goethe-Zertifikat — Format, Bewertung, Fertigkeiten und Lernstrategien für jedes Niveau.' },
  es: { title: 'Blog Examen Goethe — Guías y Consejos | GoethePrep', h1: 'Guías de preparación para el examen Goethe', subtitle: 'Todo sobre el Goethe-Zertifikat — formato, puntuación, destrezas y estrategias de estudio para cada nivel.' },
  fr: { title: 'Blog Examen Goethe — Guides et Conseils | GoethePrep', h1: 'Guides de préparation à l\'examen Goethe', subtitle: 'Tout sur le Goethe-Zertifikat — format, notation, compétences et stratégies d\'étude pour chaque niveau.' },
  id: { title: 'Blog Ujian Goethe — Panduan & Tips | GoethePrep', h1: 'Panduan persiapan ujian Goethe', subtitle: 'Semua yang perlu Anda ketahui tentang Goethe-Zertifikat — format, penilaian, keterampilan, dan strategi belajar untuk setiap level.' },
  it: { title: 'Blog Esame Goethe — Guide e Consigli | GoethePrep', h1: 'Guide di preparazione all\'esame Goethe', subtitle: 'Tutto sul Goethe-Zertifikat — formato, punteggio, competenze e strategie di studio per ogni livello.' },
  ja: { title: 'ゲーテ試験ブログ — ガイド＆ヒント | GoethePrep', h1: 'ゲーテ試験準備ガイド', subtitle: 'Goethe-Zertifikatについて知っておくべきこと — 形式、採点、スキル、全レベルの学習戦略。' },
  ko: { title: '괴테 시험 블로그 — 가이드 & 팁 | GoethePrep', h1: '괴테 시험 준비 가이드', subtitle: 'Goethe-Zertifikat에 대해 알아야 할 모든 것 — 형식, 채점, 기술 및 모든 레벨의 학습 전략.' },
  nl: { title: 'Goethe Examen Blog — Gidsen & Tips | GoethePrep', h1: 'Goethe examen voorbereidingsgidsen', subtitle: 'Alles over het Goethe-Zertifikat — format, scoring, vaardigheden en studiestrategieën voor elk niveau.' },
  pl: { title: 'Blog Egzamin Goethe — Poradniki i Wskazówki | GoethePrep', h1: 'Poradniki przygotowania do egzaminu Goethe', subtitle: 'Wszystko o Goethe-Zertifikat — format, punktacja, umiejętności i strategie nauki na każdym poziomie.' },
  pt: { title: 'Blog Exame Goethe — Guias e Dicas | GoethePrep', h1: 'Guias de preparação para o exame Goethe', subtitle: 'Tudo sobre o Goethe-Zertifikat — formato, pontuação, competências e estratégias de estudo para cada nível.' },
  ru: { title: 'Блог экзамена Гёте — Руководства и советы | GoethePrep', h1: 'Руководства по подготовке к экзамену Гёте', subtitle: 'Всё о Goethe-Zertifikat — формат, оценка, навыки и стратегии подготовки для каждого уровня.' },
  tr: { title: 'Goethe Sınavı Blog — Rehberler ve İpuçları | GoethePrep', h1: 'Goethe sınavı hazırlık rehberleri', subtitle: 'Goethe-Zertifikat hakkında bilmeniz gereken her şey — format, puanlama, beceriler ve her seviye için çalışma stratejileri.' },
  uk: { title: 'Блог іспиту Гете — Посібники та поради | GoethePrep', h1: 'Посібники з підготовки до іспиту Гете', subtitle: 'Все про Goethe-Zertifikat — формат, оцінювання, навички та стратегії підготовки для кожного рівня.' },
  vi: { title: 'Blog Kỳ thi Goethe — Hướng dẫn & Mẹo | GoethePrep', h1: 'Hướng dẫn ôn thi Goethe', subtitle: 'Tất cả những gì bạn cần biết về Goethe-Zertifikat — cấu trúc, chấm điểm, kỹ năng và chiến lược học tập cho mọi trình độ.' },
  zh: { title: '歌德考试博客 — 指南与技巧 | GoethePrep', h1: '歌德考试备考指南', subtitle: '关于Goethe-Zertifikat您需要了解的一切 — 格式、评分、技能以及各级别的学习策略。' },
};

for (const lang of LANGS) {
  const blogDir = path.join(ROOT, lang, 'blog');
  const t = translations[lang];
  if (!t) continue;

  // Create blog directory
  fs.mkdirSync(blogDir, { recursive: true });

  // Build the translated blog index
  let html = `<!DOCTYPE html>
<html lang="${lang}"${t.dir === 'rtl' ? ' dir="rtl"' : ''}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.title}</title>
  <meta name="description" content="${t.subtitle}">
  <link rel="canonical" href="https://goetheprep.com/${lang}/blog/">
  <link rel="icon" href="/assets/images/app-icon.jpg">
  <link rel="apple-touch-icon" href="/assets/images/app-icon.jpg">
  <meta name="theme-color" content="#f5f5f7">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/styles.css?v=20260611e">
  <link rel="stylesheet" href="/css/blog.css?v=20260611e">
  <link rel="stylesheet" href="/shared/lang-selector.css">${t.dir === 'rtl' ? '\n  <link rel="stylesheet" href="/shared/rtl.css">' : ''}
  <!-- GA4 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-YB13BHW7X5"><\/script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag("js", new Date());
    gtag("config", "G-YB13BHW7X5", { anonymize_ip: true });
  <\/script>
</head>
<body>

  <header class="site-header" id="top">
    <div class="container header-inner">
      <a href="/${lang}/" class="logo">
        <img src="/assets/images/app-icon.jpg" alt="" width="56" height="56" style="border-radius:12px;vertical-align:middle;margin-right:10px;">
        <span class="logo-text">Goethe<span class="logo-accent">Prep</span></span>
      </a>
      <button class="nav-toggle" id="nav-toggle" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
      <nav class="site-nav" id="site-nav">
        <a href="/${lang}/#levels">Levels</a>
        <a href="/${lang}/#features">Features</a>
        <a href="/${lang}/blog/" class="nav-active">Blog</a>
        <a href="/${lang}/#faq">FAQ</a>
        <a href="/${lang}/#download" class="nav-cta">App Store</a>
      </nav>
    </div>
  </header>

  <main>
    <header class="blog-hero">
      <div class="container">
        <h1>${t.h1}</h1>
        <p>${t.subtitle}</p>
      </div>
    </header>

    <div class="container">
      <div class="blog-grid">

        <article class="blog-card">
          <div class="blog-card-body">
            <div class="blog-card-meta"><span class="blog-tag">B1</span><span class="blog-tag">Format</span></div>
            <h2><a href="/blog/goethe-b1-exam-format.html">Goethe B1 exam format: complete guide</a></h2>
            <p>Everything about the B1 structure — Reading, Listening, Writing, and Speaking — with timing per part, item counts, and the 100-point scoring scale.</p>
            <a href="/blog/goethe-b1-exam-format.html" class="blog-card-link">Read →</a>
          </div>
        </article>

        <article class="blog-card">
          <div class="blog-card-body">
            <div class="blog-card-meta"><span class="blog-tag">B2</span><span class="blog-tag">Tips</span></div>
            <h2><a href="/blog/goethe-b2-exam-tips.html">Goethe B2 exam tips: how to pass every section</a></h2>
            <p>Section-by-section strategies for B2, key vocabulary domains, time management across 3.5 hours, and a last-week checklist.</p>
            <a href="/blog/goethe-b2-exam-tips.html" class="blog-card-link">Read →</a>
          </div>
        </article>

        <article class="blog-card">
          <div class="blog-card-body">
            <div class="blog-card-meta"><span class="blog-tag">All levels</span></div>
            <h2><a href="/blog/how-to-prepare-goethe-exam.html">How to prepare for the Goethe exam</a></h2>
            <p>Complete step-by-step guide from assessing your level to registration, resources, mock exams, and what to expect on exam day.</p>
            <a href="/blog/how-to-prepare-goethe-exam.html" class="blog-card-link">Read →</a>
          </div>
        </article>

        <article class="blog-card">
          <div class="blog-card-body">
            <div class="blog-card-meta"><span class="blog-tag">Scoring</span><span class="blog-tag">A1–C2</span></div>
            <h2><a href="/blog/goethe-exam-passing-score.html">Goethe exam passing score: all levels explained</a></h2>
            <p>How the 0–100 scale works at every level, modular vs combined scoring (C1), retake rules, and tips to maximize your points.</p>
            <a href="/blog/goethe-exam-passing-score.html" class="blog-card-link">Read →</a>
          </div>
        </article>

        <article class="blog-card">
          <div class="blog-card-body">
            <div class="blog-card-meta"><span class="blog-tag">Listening</span><span class="blog-tag">B1–C1</span></div>
            <h2><a href="/blog/goethe-horen-listening-tips.html">Goethe Hören tips: master the listening exam</a></h2>
            <p>Strategies per part for B1 and B2, how to handle single-play audio, note-taking techniques, common distractors, and daily practice resources.</p>
            <a href="/blog/goethe-horen-listening-tips.html" class="blog-card-link">Read →</a>
          </div>
        </article>

        <article class="blog-card">
          <div class="blog-card-body">
            <div class="blog-card-meta"><span class="blog-tag">Writing</span><span class="blog-tag">B1–C1</span></div>
            <h2><a href="/blog/goethe-schreiben-writing-guide.html">Goethe Schreiben guide: score high on writing</a></h2>
            <p>Task types and word counts per level, what examiners actually mark, high-scoring connectors, common mistakes, and time management strategies.</p>
            <a href="/blog/goethe-schreiben-writing-guide.html" class="blog-card-link">Read →</a>
          </div>
        </article>

        <article class="blog-card">
          <div class="blog-card-body">
            <div class="blog-card-meta"><span class="blog-tag">B1 vs B2</span><span class="blog-tag">Levels</span></div>
            <h2><a href="/blog/goethe-b1-vs-b2.html">Goethe B1 vs B2: which level should you take?</a></h2>
            <p>Difficulty comparison with concrete examples, study time needed, exam costs, and which certificate you need for citizenship, university, or work.</p>
            <a href="/blog/goethe-b1-vs-b2.html" class="blog-card-link">Read →</a>
          </div>
        </article>

        <article class="blog-card">
          <div class="blog-card-body">
            <div class="blog-card-meta"><span class="blog-tag">Study plan</span><span class="blog-tag">12 weeks</span></div>
            <h2><a href="/blog/goethe-exam-study-plan.html">Goethe exam study plan: 12-week schedule</a></h2>
            <p>Week-by-week plan for B1 with hours per day, resource recommendations per phase, and how to adapt the schedule for A1 through C2.</p>
            <a href="/blog/goethe-exam-study-plan.html" class="blog-card-link">Read →</a>
          </div>
        </article>

      </div>
    </div>
  </main>

  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-brand-block">
        <p class="footer-brand">Goethe<span>Prep</span></p>
        <p class="footer-tagline">Goethe A1–C2 exam prep for iPhone &amp; iPad.</p>
      </div>
      <nav class="footer-nav" aria-label="Footer">
        <a href="/${lang}/#features">Features</a>
        <a href="/${lang}/blog/">Blog</a>
        <a href="/${lang}/#faq">FAQ</a>
      </nav>
      <p class="footer-legal">
        Unofficial practice tool — not affiliated with the Goethe-Institut.<br>
        &copy; 2026 GoethePrep · goetheprep.com
      </p>
    </div>
  </footer>
  <script src="/js/main.js?v=20260611f"><\/script>
  <script src="/shared/lang-selector.js" defer><\/script>
</body>
</html>`;

  const outputPath = path.join(blogDir, 'index.html');
  fs.writeFileSync(outputPath, html, 'utf-8');
  console.log(`  ✓ ${lang}/blog/index.html created`);
}

console.log('\n=== Done! ===');
