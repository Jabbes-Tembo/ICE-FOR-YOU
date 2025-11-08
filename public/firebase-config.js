// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDWLxmpt8_MxbdowzF2AGYa__3ZMgzFzdA",
  authDomain: "ice-for-you-d8484.firebaseapp.com",
  projectId: "ice-for-you-d8484",
  storageBucket: "ice-for-you-d8484.firebasestorage.app",
  messagingSenderId: "722326142413",
  appId: "1:722326142413:web:c61abef266924832f09884",
  measurementId: "G-D7P111KYJQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);