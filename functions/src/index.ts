// https://github.com/import-js/eslint-plugin-import/issues/1810
// eslint-disable-next-line import/no-unresolved
import { initializeApp } from 'firebase-admin/app';
import {
  scheduleWrite2025,
  sessionsWrite2025,
  speakersWrite2025,
} from './generate-sessions-speakers-schedule.js';
import { mailchimpSubscribe2025 } from './mailchimp-subscribe.js';
import { sendGeneralNotification2025 } from './notifications.js';
import { optimizeImages2025 } from './optimize-images.js';
import { prerender2025 } from './prerender.js';
import { scheduleNotifications2025 } from './schedule-notifications.js';

// TODO: Update `tsconfig.json`
// - "noImplicitReturns": true,
// - "strict": true,

initializeApp();

// Export only 2025 functions
export {
  sendGeneralNotification2025,
  scheduleNotifications2025,
  optimizeImages2025,
  mailchimpSubscribe2025,
  prerender2025,
  scheduleWrite2025,
  sessionsWrite2025,
  speakersWrite2025,
};
