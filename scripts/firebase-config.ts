// https://github.com/import-js/eslint-plugin-import/issues/1810
// eslint-disable-next-line import/no-unresolved
import { cert, initializeApp, ServiceAccount } from 'firebase-admin/app';
// https://github.com/import-js/eslint-plugin-import/issues/1810
// eslint-disable-next-line import/no-unresolved
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from '../serviceAccount.json';

const credential = cert(serviceAccount as ServiceAccount);
initializeApp({ credential });

// Use specific database ID if provided in environment, otherwise use default
const databaseId = process.env.FIRESTORE_DATABASE_ID || '(default)';
const firestore = getFirestore(databaseId);

export { firestore };
