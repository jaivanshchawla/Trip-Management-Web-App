// utils/firebaseAdmin.ts
import * as admin from 'firebase-admin';

// Check if the environment variable exists
if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  throw new Error('The FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.');
}

// Parse the environment variable as a JSON object
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

// Initialize the app if it's not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// Export the services you need
export const auth = admin.auth();
export const messaging = admin.messaging();
