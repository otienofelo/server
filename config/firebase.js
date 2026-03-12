import admin from 'firebase-admin';
import { createRequire } from 'module';

if (!admin.apps.length) {
  const require = createRequire(import.meta.url);
  const serviceAccount = require('./serviceAccountKey.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;