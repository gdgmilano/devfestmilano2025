// Shared configuration for the static site builder.
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Repo root is two levels up from scripts/static/
export const ROOT = resolve(__dirname, '..', '..');
export const OUT_DIR = resolve(ROOT, 'static-site');
export const DATA_DIR = resolve(OUT_DIR, 'data');

// Live site to crawl for rendered markup + assets.
export const LIVE_ORIGIN = 'https://devfestmilano.it';

// Public Firebase web config (read from the live site / repo index.html).
export const FIREBASE = {
  projectId: 'devfest-milano-2025',
  apiKey: 'AIzaSyDT7hHXLQ4tIBD1nhN5VL-WC9ee7cQIT4g',
  databaseId: '(default)',
};

// Firestore collections that are publicly readable via REST.
export const COLLECTIONS = [
  'speakers',
  'sessions',
  'schedule',
  'team',
  'partners',
  'blog',
  'gallery',
  'videos',
  'previousSpeakers',
  'tickets',
];
