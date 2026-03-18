import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

if (!admin.apps.length) {
  let credential;

  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    // Production — Render env vars
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
  } else {
    // Local — use serviceAccountKey.json
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const serviceAccount = JSON.parse(
      readFileSync(resolve(__dirname, './serviceAccountKey.json'), 'utf8')
    );
    credential = admin.credential.cert(serviceAccount);
  }

  admin.initializeApp({ credential });
}

export default admin;