// Generate speaker / previous-speaker detail pages from Firestore data.
// The live SPA's speaker-page does not render on direct URL load (it only
// works via in-app navigation), so these pages are built from data with a
// clean, on-brand template that links to the speaker's sessions.
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { OUT_DIR, DATA_DIR, YEAR } from './config.mjs';
import { localFor } from './asset-path.mjs';

const SITE_TITLE = `DevFest Milano ${YEAR}`;

const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const NAV = [
  ['/', 'Home'],
  ['/speakers', 'Speakers'],
  ['/schedule', 'Schedule'],
  ['/location', 'Location'],
  ['/faq', 'FAQ'],
  ['/team', 'Team'],
];

const STYLE = `
  :root{--indigo:#1f2a63;--blue:#1a73e8;--ink:#202124;--muted:#5f6368;--line:#e3e6ec;--bg:#f5f7fb}
  *{box-sizing:border-box}
  body{margin:0;font-family:'Roboto',system-ui,-apple-system,Segoe UI,sans-serif;color:var(--ink);background:var(--bg)}
  a{color:var(--blue);text-decoration:none}a:hover{text-decoration:underline}
  header.site{display:flex;align-items:center;justify-content:space-between;gap:24px;
    padding:16px 24px;background:#fff;border-bottom:1px solid var(--line);flex-wrap:wrap}
  header.site .logo{display:flex;align-items:center;gap:10px;font-weight:700;color:var(--ink)}
  header.site .logo img{height:32px;width:auto}
  header.site nav a{color:var(--ink);margin-left:20px;font-size:14px;font-weight:500}
  .hero{background:linear-gradient(135deg,var(--indigo),#33408a);color:#fff;padding:48px 24px}
  .hero-in{max-width:920px;margin:0 auto;display:flex;gap:32px;align-items:center;flex-wrap:wrap}
  .hero img.photo{width:160px;height:160px;border-radius:50%;object-fit:cover;border:4px solid rgba(255,255,255,.25);background:#dde}
  .hero h1{margin:0 0 6px;font-size:34px}
  .hero .role{font-size:18px;opacity:.92;margin:0 0 4px}
  .hero .meta{font-size:14px;opacity:.8}
  main{max-width:920px;margin:0 auto;padding:32px 24px 64px}
  section{background:#fff;border:1px solid var(--line);border-radius:12px;padding:24px 28px;margin-bottom:24px}
  section h2{margin:0 0 12px;font-size:18px;color:var(--indigo)}
  .bio{font-size:16px;line-height:1.7;color:#33373d;white-space:pre-line}
  .socials a{display:inline-block;margin-right:16px;font-weight:500}
  ul.talks{list-style:none;margin:0;padding:0}
  ul.talks li{padding:12px 0;border-bottom:1px solid var(--line)}
  ul.talks li:last-child{border-bottom:0}
  .back{display:inline-block;margin-bottom:20px;font-size:14px}
  footer.site{padding:28px 24px;text-align:center;color:var(--muted);font-size:13px;border-top:1px solid var(--line);background:#fff}
`;

function header() {
  return `<header class="site">
  <a class="logo" href="/"><img src="/images/logo.png" alt="${SITE_TITLE}">${SITE_TITLE}</a>
  <nav>${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}</nav>
</header>`;
}

function footer() {
  return `<footer class="site">${SITE_TITLE} · GDG Milano &amp; GDG Cloud Milano · <a href="/coc">Code of Conduct</a></footer>`;
}

function page(sp, photoLocal, sessions) {
  const role = [sp.title, sp.company].filter(Boolean).join(' · ');
  // Some `country` values are polluted with bio text in Firestore — only show
  // clean, short, single-phrase values.
  const cleanCountry = sp.country && sp.country.length < 40 && !sp.country.includes('.') ? sp.country : '';
  const meta = [sp.pronouns, cleanCountry].filter(Boolean).join(' · ');
  const socials = (sp.socials || [])
    .filter((s) => s && s.link)
    .map((s) => `<a href="${esc(s.link)}" target="_blank" rel="noopener noreferrer">${esc(s.name || s.icon || 'Link')}</a>`)
    .join('');
  const talks = sessions
    .map((t) => `<li><a href="/sessions/${esc(t.id)}">${esc(t.title)}</a></li>`)
    .join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(sp.name)} — ${SITE_TITLE}</title>
<meta name="description" content="${esc((sp.shortBio || sp.bio || sp.name).slice(0, 150))}">
<link rel="icon" href="/images/favicon.ico">
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
<style>${STYLE}</style>
</head>
<body>
${header()}
<div class="hero"><div class="hero-in">
  ${photoLocal ? `<img class="photo" src="${esc(photoLocal)}" alt="${esc(sp.name)}">` : ''}
  <div>
    <h1>${esc(sp.name)}</h1>
    ${role ? `<p class="role">${esc(role)}</p>` : ''}
    ${meta ? `<p class="meta">${esc(meta)}</p>` : ''}
  </div>
</div></div>
<main>
  <a class="back" href="/speakers">&larr; All speakers</a>
  ${sp.bio ? `<section><h2>Bio</h2><div class="bio">${esc(sp.bio)}</div></section>` : ''}
  ${socials ? `<section><h2>Links</h2><div class="socials">${socials}</div></section>` : ''}
  ${talks ? `<section><h2>Talks</h2><ul class="talks">${talks}</ul></section>` : ''}
</main>
${footer()}
</body>
</html>`;
}

export async function buildSpeakers() {
  const read = async (f) => JSON.parse(await readFile(join(DATA_DIR, f), 'utf8'));
  const speakers = await read('speakers.json');
  const previous = await read('previousSpeakers.json');
  const sessions = await read('sessions.json');

  // speakerId -> [{id, title}]
  const talksBySpeaker = {};
  for (const s of sessions) {
    for (const sid of s.speakers || []) {
      (talksBySpeaker[sid] = talksBySpeaker[sid] || []).push({ id: s.id, title: s.title });
    }
  }

  const assets = new Map();
  const gen = async (list, base) => {
    for (const sp of list) {
      const orig = sp.photoUrl || sp.photo;
      let photoLocal = null;
      if (orig) {
        const abs = /^https?:/.test(orig) ? orig : `https://devfestmilano.it${orig}`;
        photoLocal = localFor(abs);
        if (photoLocal) assets.set(photoLocal, abs);
      }
      const html = page(sp, photoLocal, talksBySpeaker[sp.id] || []);
      const dir = join(OUT_DIR, base, sp.id);
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, 'index.html'), html);
    }
  };
  await gen(speakers, 'speakers');
  await gen(previous, 'previous-speakers');

  // Merge photos into assets.json.
  const existing = JSON.parse(await readFile(join(DATA_DIR, 'assets.json'), 'utf8'));
  const merged = new Map(existing.map((a) => [a.local, a.url]));
  for (const [local, url] of assets) merged.set(local, url);
  await writeFile(
    join(DATA_DIR, 'assets.json'),
    JSON.stringify(Array.from(merged, ([local, url]) => ({ local, url })), null, 2),
  );

  console.log(`  speakers: ${speakers.length} + ${previous.length} previous detail pages, +${assets.size} photos`);
  return { speakers: speakers.length, previous: previous.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  buildSpeakers().catch((e) => { console.error(e); process.exit(1); });
}
