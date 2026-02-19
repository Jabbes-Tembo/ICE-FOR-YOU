import { db, COLLECTION_PATH, COLLECTIONS_META_PATH, MEDIA_DOC_PATH, ensureAuth, collection, getDocs, getDoc, setDoc, addDoc, updateDoc, doc, deleteDoc } from './db.js';

// Config
const CLOUD_NAME = "dwgattbka";
const UPLOAD_PRESET = "grc-cms-uploads";

let products = [];
let collectionsList = [];
let isEditing = false;

// --- DOM Elements ---
const listEl = document.getElementById('product-list');
const collectionListEl = document.getElementById('collection-list');
const modal = document.getElementById('product-modal');
const collectionModal = document.getElementById('collection-modal');
const form = document.getElementById('product-form');
const collectionForm = document.getElementById('collection-form');
const saveBtn = document.getElementById('save-btn');
const cSaveBtn = document.getElementById('c-save-btn');
const statusEl = document.getElementById('status-msg');

const mediaForm = document.getElementById('media-form');
const mediaSaveBtn = document.getElementById('media-save-btn');

// --- Initialization ---
window.addEventListener('load', async () => {
    try {
        await ensureAuth();
        await loadCollections(); // Load collections first to populate dropdowns
        await loadProducts();
        await loadMediaSettings();
        feather.replace();
        setupMobileMenu();
    } catch (e) {
        alert("Auth failed: " + e.message);
    }
});

// --- MOBILE MENU LOGIC ---
function setupMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('admin-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const closeBtn = document.getElementById('close-sidebar-btn');

    function toggleSidebar() {
        sidebar.classList.toggle('-translate-x-full');
        backdrop.classList.toggle('hidden');
        // Prevent body scroll when menu is open on mobile
        document.body.classList.toggle('overflow-hidden');
    }

    btn?.addEventListener('click', toggleSidebar);
    closeBtn?.addEventListener('click', toggleSidebar);
    backdrop?.addEventListener('click', toggleSidebar);
}

// --- NAVIGATION ---
const views = ['products', 'collections', 'media'];
const navs = ['nav-products', 'nav-collections', 'nav-media'];

function switchView(viewName) {
    // Hide all views
    views.forEach(v => {
        const el = document.getElementById(`view-${v}`);
        if(v === viewName) el.classList.remove('hidden');
        else el.classList.add('hidden');
    });

    // Update Nav State
    navs.forEach(n => {
        const el = document.getElementById(n);
        if(n === `nav-${viewName}`) {
            el.classList.add('bg-gray-900', 'border-sky-500', 'text-white');
            el.classList.remove('text-gray-400', 'border-transparent');
        } else {
            el.classList.remove('bg-gray-900', 'border-sky-500', 'text-white');
            el.classList.add('text-gray-400', 'border-transparent');
        }
    });
    
    // Close sidebar on mobile after selection
    const sidebar = document.getElementById('admin-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (window.innerWidth < 768 && !sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.add('-translate-x-full');
        backdrop.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }
}

document.getElementById('nav-products').addEventListener('click', () => switchView('products'));
document.getElementById('nav-collections').addEventListener('click', () => switchView('collections'));
document.getElementById('nav-media').addEventListener('click', () => switchView('media'));


// --- DATA LOADING ---

async function loadProducts() {
    listEl.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-gray-400">Loading products...</td></tr>`;
    const snap = await getDocs(collection(db, COLLECTION_PATH));
    products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderTable();
    updateCollectionDropdown();
}

async function loadCollections() {
    collectionListEl.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-gray-400">Loading collections...</td></tr>`;
    const snap = await getDocs(collection(db, COLLECTIONS_META_PATH));
    collectionsList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderCollectionTable();
    updateCollectionDropdown();
}

function updateCollectionDropdown() {
    const select = document.getElementById('p-collection');
    select.innerHTML = `<option value="">None</option>` + 
        collectionsList.map(c => `<option value="${c.id}">${c.title}</option>`).join('');
}


// --- RENDER TABLES ---

function renderTable() {
    if (products.length === 0) {
        listEl.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-gray-500">No products found. Add one!</td></tr>`;
        return;
    }

    listEl.innerHTML = products.map(p => `
        <tr class="hover:bg-gray-50 group border-b border-gray-100 last:border-0">
            <td class="px-5 py-4 bg-white text-sm">
                <div class="flex items-center">
                    <div class="flex-shrink-0 w-12 h-12">
                        <img class="w-full h-full rounded-md object-cover border border-gray-100 shadow-sm" src="${p.image || 'https://placehold.co/100'}" />
                    </div>
                    <div class="ml-3">
                        <p class="text-gray-900 font-bold whitespace-no-wrap">${p.name}</p>
                    </div>
                </div>
            </td>
            <td class="px-5 py-4 bg-white text-sm hidden md:table-cell">
                <span class="px-2 py-1 rounded-full bg-gray-100 text-xs font-bold text-gray-600 uppercase tracking-wide">${p.category}</span>
            </td>
            <td class="px-5 py-4 bg-white text-sm">
                <p class="text-gray-900 whitespace-no-wrap font-mono">K${p.price}</p>
            </td>
            <td class="px-5 py-4 bg-white text-sm text-right">
                <button class="bg-gray-100 hover:bg-sky-50 text-gray-600 hover:text-sky-600 p-2 rounded-full transition edit-btn mx-1" data-id="${p.id}"><i data-feather="edit-2" class="w-4 h-4"></i></button>
                <button class="bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 p-2 rounded-full transition delete-btn mx-1" data-id="${p.id}"><i data-feather="trash" class="w-4 h-4"></i></button>
            </td>
        </tr>
    `).join('');

    document.querySelectorAll('.edit-btn').forEach(btn => 
        btn.addEventListener('click', () => openEdit(btn.dataset.id))
    );
    document.querySelectorAll('.delete-btn').forEach(btn => 
        btn.addEventListener('click', () => deleteProduct(btn.dataset.id))
    );
    feather.replace();
}

function renderCollectionTable() {
    if (collectionsList.length === 0) {
        collectionListEl.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-gray-500">No collections found.</td></tr>`;
        return;
    }

    collectionListEl.innerHTML = collectionsList.map(c => `
        <tr class="hover:bg-gray-50 group border-b border-gray-100 last:border-0">
            <td class="px-5 py-4 bg-white text-sm">
                <div class="flex-shrink-0 w-16 h-10">
                    <img class="w-full h-full rounded-md object-cover border border-gray-100 shadow-sm" src="${c.img || 'https://placehold.co/100'}" />
                </div>
            </td>
            <td class="px-5 py-4 bg-white text-sm">
                <p class="text-gray-900 font-bold whitespace-no-wrap">${c.title}</p>
                <p class="text-gray-400 text-xs truncate max-w-[150px]">${c.description || ''}</p>
            </td>
            <td class="px-5 py-4 bg-white text-sm text-right">
                <button class="bg-gray-100 hover:bg-sky-50 text-gray-600 hover:text-sky-600 p-2 rounded-full transition c-edit-btn mx-1" data-id="${c.id}"><i data-feather="edit-2" class="w-4 h-4"></i></button>
                <button class="bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 p-2 rounded-full transition c-delete-btn mx-1" data-id="${c.id}"><i data-feather="trash" class="w-4 h-4"></i></button>
            </td>
        </tr>
    `).join('');

    document.querySelectorAll('.c-edit-btn').forEach(btn => 
        btn.addEventListener('click', () => openCollectionEdit(btn.dataset.id))
    );
    document.querySelectorAll('.c-delete-btn').forEach(btn => 
        btn.addEventListener('click', () => deleteCollection(btn.dataset.id))
    );
    feather.replace();
}


// --- CLOUDINARY UPLOAD ---

async function uploadFile(file, progressEl, resourceType = 'image') {
    if (!file) return null;
    
    progressEl.classList.remove('hidden');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

    try {
        const res = await fetch(url, { method: 'POST', body: formData });
        const data = await res.json();
        progressEl.classList.add('hidden');
        if (data.error) throw new Error(data.error.message);
        return data.secure_url;
    } catch (err) {
        progressEl.classList.add('hidden');
        console.error(err);
        alert("Upload failed: " + err.message);
        return null;
    }
}

// Product Image
document.getElementById('p-image-file').addEventListener('change', async (e) => {
    const url = await uploadFile(e.target.files[0], document.getElementById('p-upload-progress'), 'image');
    if(url) {
        document.getElementById('p-image-url').value = url;
        document.getElementById('p-img-preview').innerHTML = `<img src="${url}" class="w-full h-full object-cover">`;
    }
});
// Collection Image
document.getElementById('c-image-file').addEventListener('change', async (e) => {
    const url = await uploadFile(e.target.files[0], document.getElementById('c-upload-progress'), 'image');
    if(url) {
        document.getElementById('c-image-url').value = url;
        document.getElementById('c-img-preview').innerHTML = `<img src="${url}" class="w-full h-full object-cover">`;
    }
});


// --- MODAL & FORM LOGIC (PRODUCTS) ---

window.openModal = (type) => {
    isEditing = false;
    if (type === 'product') {
        document.getElementById('modal-title').innerText = "Add Product";
        form.reset();
        document.getElementById('p-id').value = "";
        document.getElementById('p-image-url').value = "";
        document.getElementById('p-img-preview').innerHTML = `<span class="text-[10px] text-gray-400 font-bold">NO IMG</span>`;
        saveBtn.textContent = "Save Product";
        modal.classList.remove('hidden');
    } else if (type === 'collection') {
        document.getElementById('c-modal-title').innerText = "Add Collection";
        collectionForm.reset();
        document.getElementById('c-id').value = "";
        document.getElementById('c-image-url').value = "";
        document.getElementById('c-img-preview').innerHTML = `<span class="text-[10px] text-gray-400 font-bold">NO IMG</span>`;
        cSaveBtn.textContent = "Save Collection";
        collectionModal.classList.remove('hidden');
    }
    // Prevent background scrolling
    document.body.classList.add('overflow-hidden');
};

window.closeModal = () => {
    modal.classList.add('hidden');
    collectionModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
};

function openEdit(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    isEditing = true;
    document.getElementById('modal-title').innerText = "Edit Product";
    document.getElementById('p-id').value = p.id;
    document.getElementById('p-name').value = p.name;
    document.getElementById('p-category').value = p.category;
    document.getElementById('p-price').value = p.price;
    document.getElementById('p-desc').value = p.desc || '';
    document.getElementById('p-image-url').value = p.image;
    document.getElementById('p-collection').value = p.collectionId || '';
    
    if (p.image) document.getElementById('p-img-preview').innerHTML = `<img src="${p.image}" class="w-full h-full object-cover">`;
    else document.getElementById('p-img-preview').innerHTML = `<span class="text-[10px] text-gray-400 font-bold">NO IMG</span>`;
    
    saveBtn.textContent = "Update Product";
    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

function openCollectionEdit(id) {
    const c = collectionsList.find(x => x.id === id);
    if (!c) return;
    isEditing = true;
    document.getElementById('c-modal-title').innerText = "Edit Collection";
    document.getElementById('c-id').value = c.id;
    document.getElementById('c-title').value = c.title;
    document.getElementById('c-desc').value = c.description || '';
    document.getElementById('c-image-url').value = c.img;
    
    if (c.img) document.getElementById('c-img-preview').innerHTML = `<img src="${c.img}" class="w-full h-full object-cover">`;
    else document.getElementById('c-img-preview').innerHTML = `<span class="text-[10px] text-gray-400 font-bold">NO IMG</span>`;
    
    cSaveBtn.textContent = "Update Collection";
    collectionModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

// Save Product
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";
    const data = {
        name: document.getElementById('p-name').value,
        category: document.getElementById('p-category').value,
        price: Number(document.getElementById('p-price').value),
        desc: document.getElementById('p-desc').value,
        image: document.getElementById('p-image-url').value,
        collectionId: document.getElementById('p-collection').value
    };
    try {
        if (isEditing) {
            await updateDoc(doc(db, COLLECTION_PATH, document.getElementById('p-id').value), data);
            showStatus("Product updated!");
        } else {
            await addDoc(collection(db, COLLECTION_PATH), data);
            showStatus("Product added!");
        }
        closeModal();
        await loadProducts();
    } catch (err) { alert(err.message); } 
    finally { saveBtn.disabled = false; }
});

// Save Collection
collectionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    cSaveBtn.disabled = true;
    cSaveBtn.textContent = "Saving...";
    const data = {
        title: document.getElementById('c-title').value,
        description: document.getElementById('c-desc').value,
        img: document.getElementById('c-image-url').value
    };
    try {
        if (isEditing) {
            await updateDoc(doc(db, COLLECTIONS_META_PATH, document.getElementById('c-id').value), data);
            showStatus("Collection updated!");
        } else {
            await addDoc(collection(db, COLLECTIONS_META_PATH), data);
            showStatus("Collection added!");
        }
        closeModal();
        await loadCollections();
    } catch (err) { alert(err.message); } 
    finally { cSaveBtn.disabled = false; }
});

// Delete Logic
async function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;
    try { await deleteDoc(doc(db, COLLECTION_PATH, id)); loadProducts(); } catch (e) { alert(e.message); }
}
async function deleteCollection(id) {
    if (!confirm("Delete this collection? Products in it will NOT be deleted.")) return;
    try { await deleteDoc(doc(db, COLLECTIONS_META_PATH, id)); loadCollections(); } catch (e) { alert(e.message); }
}

// --- MEDIA LOGIC (Same as before but hooked up) ---
async function loadMediaSettings() {
    const snap = await getDoc(doc(db, MEDIA_DOC_PATH));
    if (snap.exists()) {
        const data = snap.data();
        document.getElementById('m-video-title').value = data.videoTitle || '';
        document.getElementById('m-video-subtitle').value = data.videoSubtitle || '';
        document.getElementById('m-video-url').value = data.videoUrl || '';
        document.getElementById('m-poster-url').value = data.videoPoster || '';
        document.getElementById('m-song-title').value = data.songTitle || '';
        document.getElementById('m-artist-name').value = data.artistName || '';
        document.getElementById('m-audio-url').value = data.audioUrl || '';
        if(data.videoPoster) document.getElementById('m-poster-preview').src = data.videoPoster;
        if(data.videoUrl) document.getElementById('m-current-video').textContent = "Current: " + data.videoUrl.split('/').pop();
        if(data.audioUrl) document.getElementById('m-current-audio').textContent = "Current: " + data.audioUrl.split('/').pop();
    }
}

// Media file listeners
document.getElementById('m-poster-file').addEventListener('change', async (e) => {
    const url = await uploadFile(e.target.files[0], document.getElementById('m-poster-progress'), 'image');
    if(url) { document.getElementById('m-poster-url').value = url; document.getElementById('m-poster-preview').src = url; }
});
document.getElementById('m-video-file').addEventListener('change', async (e) => {
    const url = await uploadFile(e.target.files[0], document.getElementById('m-video-progress'), 'video');
    if(url) { document.getElementById('m-video-url').value = url; document.getElementById('m-current-video').textContent = "Uploaded!"; }
});
document.getElementById('m-audio-file').addEventListener('change', async (e) => {
    const url = await uploadFile(e.target.files[0], document.getElementById('m-audio-progress'), 'video');
    if(url) { document.getElementById('m-audio-url').value = url; document.getElementById('m-current-audio').textContent = "Uploaded!"; }
});

mediaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    mediaSaveBtn.disabled = true;
    mediaSaveBtn.textContent = "Updating...";
    const data = {
        videoTitle: document.getElementById('m-video-title').value,
        videoSubtitle: document.getElementById('m-video-subtitle').value,
        videoUrl: document.getElementById('m-video-url').value,
        videoPoster: document.getElementById('m-poster-url').value,
        songTitle: document.getElementById('m-song-title').value,
        artistName: document.getElementById('m-artist-name').value,
        audioUrl: document.getElementById('m-audio-url').value
    };
    try { await setDoc(doc(db, MEDIA_DOC_PATH), data); showStatus("Media updated!"); }
    catch (err) { alert(err.message); }
    finally { mediaSaveBtn.disabled = false; mediaSaveBtn.textContent = "Update Media Settings"; }
});

function showStatus(msg) {
    statusEl.textContent = msg;
    statusEl.classList.remove('hidden');
    setTimeout(() => statusEl.classList.add('hidden'), 3000);
}