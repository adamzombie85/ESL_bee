// firebase-config.js
const firebaseConfig = {
    apiKey: "YOUR_API_KEY", // 請填入您的 API Key
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "838722993256",
    appId: "1:838722993256:web:8ff2dfe06c37fdc6248fdd"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
