// firebase-config.example.js
// Rename this file to firebase-config.js and fill in your actual Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_AUTH_DOMAIN_HERE",
    projectId: "YOUR_PROJECT_ID_HERE",
    storageBucket: "YOUR_STORAGE_BUCKET_HERE",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
    appId: "YOUR_APP_ID_HERE",
    measurementId: "YOUR_MEASUREMENT_ID_HERE",
    databaseURL: "YOUR_DATABASE_URL_HERE"
};

let db = null;
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        console.log("Firebase initialized successfully.");
    } else {
        console.warn("Firebase SDK not loaded. Working in local mode.");
    }
} catch (e) {
    console.error("Firebase init failed:", e);
}
