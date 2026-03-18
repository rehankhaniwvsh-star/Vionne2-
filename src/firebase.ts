import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Import the Firebase configuration from the applet config file
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (check for support to avoid errors in non-browser environments)
let analytics: any;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// Initialize Auth and Firestore
// Note: We use the firestoreDatabaseId from the config to ensure we connect to the correct database instance
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export { analytics };
