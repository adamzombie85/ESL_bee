// firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyAAHbfwLcqeXEk32Oc7q9kUFf9rLCn5I6c",
    authDomain: "pingkipquiz.firebaseapp.com",
    projectId: "pingkipquiz",
    storageBucket: "pingkipquiz.firebasestorage.app",
    messagingSenderId: "838722993256",
    appId: "1:838722993256:web:8ff2dfe06c37fdc6248fdd",
    measurementId: "G-K6M8PC6951",
    databaseURL: "https://pingkipquiz-default-rtdb.firebaseio.com"
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
