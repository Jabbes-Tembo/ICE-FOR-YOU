import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyDWLxmpt8_MxbdowzF2AGYa__3ZMgzFzdA",
  authDomain: "ice-for-you-d8484.firebaseapp.com",
  projectId: "ice-for-you-d8484",
  storageBucket: "ice-for-you-d8484.firebasestorage.app",
  messagingSenderId: "722326142413",
  appId: "1:722326142413:web:c61abef266924832f09884",
  measurementId: "G-D7P111KYJQ"
};

// --- Config Logic ---
const finalConfig = firebaseConfig.apiKey !== "PASTE_YOUR_API_KEY_HERE" 
    ? firebaseConfig 
    : JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');

// --- Initialize ---
const app = initializeApp(finalConfig);
const db = getFirestore(app);

// Use a specific path for your app's data
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-ify-app';

// Paths
const COLLECTION_PATH = `artifacts/${appId}/public/data/products`;
const COLLECTIONS_META_PATH = `artifacts/${appId}/public/data/collections`; // New path for collections
const MEDIA_DOC_PATH = `artifacts/${appId}/public/data/media_config/settings`;

// --- Auth Helper (DISABLED) ---
export async function ensureAuth() {
    return Promise.resolve(null);
}

// --- Database Exports ---
export { db, COLLECTION_PATH, COLLECTIONS_META_PATH, MEDIA_DOC_PATH, collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, orderBy };