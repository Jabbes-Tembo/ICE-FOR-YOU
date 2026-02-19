import { db, COLLECTION_PATH, COLLECTIONS_META_PATH, MEDIA_DOC_PATH, ensureAuth, collection, getDocs, getDoc, doc, addDoc, setDoc } from './db.js';

// --- State ---
export let products = [];
export let collections = []; // Now dynamic
export let mediaSettings = {
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-neon-light-39878-large.mp4",
    videoPoster: "https://images.pexels.com/photos/837140/pexels-photo-837140.jpeg?auto=compress&cs=tinysrgb&w=1600",
    videoTitle: "New Horizons",
    videoSubtitle: "Fall/Winter 2025",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    songTitle: "Lusaka Nights",
    artistName: "Ice For You Sounds"
};

// --- Initial Seed Data ---
const initialProducts = [
    { name: "Minimalist Tee", price: 1150, category: "Apparel", image: "https://res.cloudinary.com/dwgattbka/image/upload/v1756985807/Screenshot_20250904-133240_1_fckdcc.jpg", desc: "Crafted from premium cotton, this tee offers a relaxed fit for everyday luxury." },
    { name: "Silver Chain", price: 3000, category: "Jewelry", image: "https://placehold.co/400x400/cbd5e0/333?text=Jewelry+1", desc: "Sterling silver chain with a high-polish finish. A timeless staple." },
    { name: "Classic Hoodie", price: 2150, category: "Apparel", image: "https://res.cloudinary.com/dwgattbka/image/upload/v1756985836/Screenshot_20250904-133310_1_gg2eif.jpg", desc: "Heavyweight fleece hoodie featuring subtle embroidery and simplified style." },
    { name: "Stone Ring", price: 2400, category: "Jewelry", image: "https://placehold.co/400x400/718096/eee?text=Jewelry+2", desc: "Hand-set stone ring designed to make a statement without saying a word." }
];

const initialCollections = [
    { title: 'Signature Iceforyou', img: 'https://placehold.co/600x400/4a5568/ffffff?text=Signature', description: 'The essential collection.' },
    { title: 'CAN A BIS Collection', img: 'https://placehold.co/600x400/b794f4/ffffff?text=CAN+A+BIS', description: 'Bold and brave styles.' },
    { title: 'God Bless Zambia', img: 'https://placehold.co/600x400/718096/ffffff?text=Zambia', description: 'Celebrating our heritage.' }
];

// --- Actions ---
export async function initData() {
    try {
        await ensureAuth();
        
        // 1. Fetch Products
        const productSnap = await getDocs(collection(db, COLLECTION_PATH));
        if (productSnap.empty) {
            console.log("Seeding Products...");
            await Promise.all(initialProducts.map(p => addDoc(collection(db, COLLECTION_PATH), p)));
            const newSnap = await getDocs(collection(db, COLLECTION_PATH));
            products = newSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } else {
            products = productSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

        // 2. Fetch Collections
        const colSnap = await getDocs(collection(db, COLLECTIONS_META_PATH));
        if (colSnap.empty) {
            console.log("Seeding Collections...");
            await Promise.all(initialCollections.map(c => addDoc(collection(db, COLLECTIONS_META_PATH), c)));
            const newColSnap = await getDocs(collection(db, COLLECTIONS_META_PATH));
            collections = newColSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } else {
            collections = colSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

        // 3. Fetch Media Settings
        const mediaSnap = await getDoc(doc(db, MEDIA_DOC_PATH));
        if (mediaSnap.exists()) {
            mediaSettings = { ...mediaSettings, ...mediaSnap.data() };
        } else {
            await setDoc(doc(db, MEDIA_DOC_PATH), mediaSettings);
        }

        console.log("Data loaded: ", products.length, "products,", collections.length, "collections");
    } catch (e) {
        console.error("Error loading data:", e);
        // Basic fallback
        products = initialProducts.map((p, i) => ({ id: i, ...p }));
        collections = initialCollections.map((c, i) => ({ id: i, ...c }));
    }
}

// --- Helpers ---
export const formatPrice = (price) => {
    const numPrice = Number(price);
    if(isNaN(numPrice)) return 'K0.00';
    return `K${numPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
};