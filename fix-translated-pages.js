const fs = require('fs');
const path = require('path');

const BASE = __dirname;
const LANGS = ['es', 'fr', 'de', 'it', 'pt', 'nl', 'ar', 'ja', 'ko', 'zh', 'ru', 'pl', 'tr', 'uk', 'id', 'vi'];

let totalFixed = 0;

for (const lang of LANGS) {
  const filePath = path.join(BASE, lang, 'index.html');
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${lang}/index.html — file not found`);
    continue;
  }

  let html = fs.readFileSync(filePath, 'utf8');
  const original = html;
  let changes = [];

  // 1. Fix CSS paths: relative → absolute
  // Match href="css/..." that are NOT already href="/css/..."
  html = html.replace(/href="css\//g, 'href="/css/');
  
  // 2. Fix JS paths: relative → absolute
  // Match src="js/..." that are NOT already src="/js/..."
  html = html.replace(/src="js\//g, 'src="/js/');

  // 3. Fix blog links: relative → absolute
  // Match href="blog/..." that are NOT already href="/blog/..."
  html = html.replace(/href="blog\//g, 'href="/blog/');

  // 4. Add lang-selector CSS before </head> if not already present
  if (!html.includes('lang-selector.css')) {
    html = html.replace('</head>', '  <link rel="stylesheet" href="/shared/lang-selector.css">\n</head>');
    changes.push('+ lang-selector.css');
  }

  // 5. Add lang-selector JS before </body> if not already present
  if (!html.includes('lang-selector.js')) {
    html = html.replace('</body>', '  <script src="/shared/lang-selector.js" defer></script>\n</body>');
    changes.push('+ lang-selector.js');
  }

  if (html !== original) {
    fs.writeFileSync(filePath, html, 'utf8');
    totalFixed++;
    
    // Summarize what changed
    const cssFixed = original.includes('href="css/') && !html.includes('href="css/');
    const jsFixed = original.includes('src="js/') && !html.includes('src="js/');
    const blogFixed = original.includes('href="blog/') && !html.includes('href="blog/');
    
    if (cssFixed) changes.push('css paths → absolute');
    if (jsFixed) changes.push('js paths → absolute');
    if (blogFixed) changes.push('blog links → absolute');
    
    console.log(`✅ ${lang}/index.html — ${changes.join(', ')}`);
  } else {
    console.log(`— ${lang}/index.html — no changes needed`);
  }
}

console.log(`\nDone. Fixed ${totalFixed}/${LANGS.length} files.`);
