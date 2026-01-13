// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxfwmqmC2vETdr4UmUXUSpeWYWUQBqvj0",
  authDomain: "places-to-go-71cc1.firebaseapp.com",
  databaseURL: "https://places-to-go-71cc1-default-rtdb.firebaseio.com",
  projectId: "places-to-go-71cc1",
  storageBucket: "places-to-go-71cc1.firebasestorage.app",
  messagingSenderId: "138677342178",
  appId: "1:138677342178:web:7ee6ac8a9db60be27033bb"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
window.database = firebase.database();
window.placesRef = window.database.ref('places');
window.firebaseReady = true;

console.log('Firebase initialized successfully');
