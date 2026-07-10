// Firebase Configuration
// This file is overwritten by CI with real values from GitHub Secrets.
// For local development, replace the placeholder values below with your real Firebase config.
const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  databaseURL: "REPLACE_WITH_YOUR_DATABASE_URL",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
window.database = firebase.database();
window.firebaseReady = true;

console.log('Firebase initialized successfully');
