// Firebase Configuration — EXAMPLE FILE (safe to commit)
// Copy this to firebase-config.js and fill in your real values for local development.
// In CI/CD, firebase-config.js is generated automatically from GitHub Secrets.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
window.database = firebase.database();
window.placesRef = window.database.ref('places');
window.firebaseReady = true;

console.log('Firebase initialized successfully');
