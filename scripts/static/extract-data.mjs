// Stage 1: extract every public Firestore collection to JSON and derive the
// complete list of routes to pre-render.
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { COLLECTIONS, DATA_DIR } from './config.mjs';
import { fetchCollection } from './firestore.mjs';

// Static (non-data-driven) routes, taken from src/router.ts.
// Note: there is no /blog or /post route in the router, and the `blog`
// collection holds leftover Hoverboard template demo content (DevFest Ukraine
// / Lviv), so blog pages are intentionally excluded.
const STATIC_ROUTES = [
  '/',
  '/schedule',
  '/speakers',
  '/previous-speakers',
  '/team',
  '/faq',
  '/coc',
  '/location',
  '/speakers-info',
];

export async function extractData() {
  await mkdir(DATA_DIR, { recursive: true });

  const data = {};
  for (const col of COLLECTIONS) {
    try {
      const docs = await fetchCollection(col);
      data[col] = docs;
      await writeFile(join(DATA_DIR, `${col}.json`), JSON.stringify(docs, null, 2));
      console.log(`  data: ${col} -> ${docs.length} docs`);
    } catch (err) {
      console.warn(`  data: ${col} SKIPPED (${err.message.split('\n')[0]})`);
      data[col] = [];
    }
  }

  // Derive detail routes from the collection ids (router has no blog/post).
  const detail = [
    ...(data.sessions || []).map((d) => `/sessions/${d.id}`),
    ...(data.speakers || []).map((d) => `/speakers/${d.id}`),
    ...(data.previousSpeakers || []).map((d) => `/previous-speakers/${d.id}`),
  ];

  const routes = [...STATIC_ROUTES, ...detail];
  await writeFile(join(DATA_DIR, 'routes.json'), JSON.stringify(routes, null, 2));
  console.log(`  routes: ${routes.length} total (${STATIC_ROUTES.length} static + ${detail.length} detail)`);

  return { data, routes };
}

// Allow running standalone: `node extract-data.mjs`
if (import.meta.url === `file://${process.argv[1]}`) {
  extractData().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
