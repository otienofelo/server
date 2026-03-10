import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Load the service account JSON
const serviceAccountPath = path.resolve('./config/serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;