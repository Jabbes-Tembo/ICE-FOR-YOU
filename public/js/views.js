import { products, collections, formatPrice, mediaSettings } from './data.js';
import { cartStore } from './cart.js';

// --- Shared Components ---
function ProductCard(p) {
    return `
        <div class="group cursor-pointer">
            <div class="relative overflow-hidden bg-white aspect-[3/4] mb-4 rounded-sm border border-gray-100" onclick="window.location.hash='#/product/${p.id}'">
                <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
                <button class="add-to-cart-btn absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-black hover:text-white border border-gray-100" data-id="${p.id}">
                    <i data-feather="plus" class="w-5 h-5"></i>
                </button>
            </div>
            <div onclick="window.location.hash='#/product/${p.id}'">
                <h3 class="font-bold text-gray-900 text-lg leading-tight group-hover:text-brand-sky transition">${p.name}</h3>
                <p class="text-gray-500 mt-1">${formatPrice(p.price)}</p>
            </div>
        </div>
    `;
}

// --- Logic Attachments ---
function attachAddHandlers() {
    setTimeout(() => {
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = newBtn.dataset.id;
                cartStore.add(id);
                const cartDrawer = document.getElementById('cart-drawer');
                if(cartDrawer) cartDrawer.classList.remove('translate-x-full'); 
            });
        });
    }, 0);
}

function attachMediaHandlers() {
    setTimeout(() => {
        const video = document.getElementById('brand-video');
        const overlay = document.getElementById('video-overlay');
        if(overlay && video) {
            overlay.addEventListener('click', () => {
                if (video.paused) {
                    video.play();
                    overlay.innerHTML = `<div class="w-20 h-20 rounded-full border-2 border-white flex items-center justify-center hover:bg-white/20 transition backdrop-blur-sm"><i data-feather="pause" class="w-8 h-8 text-white"></i></div>`;
                    overlay.classList.add('opacity-0', 'hover:opacity-100');
                } else {
                    video.pause();
                    overlay.innerHTML = `<div class="w-20 h-20 rounded-full border-2 border-white flex items-center justify-center hover:bg-white/20 transition backdrop-blur-sm"><i data-feather="play" class="w-8 h-8 text-white ml-1"></i></div>`;
                    overlay.classList.remove('opacity-0', 'hover:opacity-100');
                }
                if(window.feather) feather.replace();
            });
        }

        const audio = document.getElementById('brand-audio');
        const audioBtn = document.getElementById('audio-play-btn');
        const visualizer = document.getElementById('visualizer');
        if(audio && audioBtn) {
            audioBtn.addEventListener('click', () => {
                if (audio.paused) {
                    audio.play();
                    audioBtn.innerHTML = `<i data-feather="pause" class="w-5 h-5"></i>`;
                    visualizer?.classList.add('playing');
                } else {
                    audio.pause();
                    audioBtn.innerHTML = `<i data-feather="play" class="w-5 h-5 ml-0.5"></i>`;
                    visualizer?.classList.remove('playing');
                }
                if(window.feather) feather.replace();
            });
        }
    }, 0);
}

// --- Views ---

export function renderHome(container) {
    container.innerHTML = `
        <section class="h-[100vh] w-full flex items-center justify-center relative">
           <div class="absolute bottom-12 w-full text-center animate-bounce text-gray-400 pointer-events-none">
               <i data-feather="chevron-down" class="w-10 h-10 mx-auto drop-shadow-md"></i>
           </div>
        </section>

        <!-- Dynamic Collections Grid -->
        <section class="bg-white py-20 relative z-20">
            <div class="w-full px-6 md:px-12">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    ${collections.map(c => `
                        <div onclick="window.location.hash='#/collection/${c.id}'" class="group relative h-[500px] cursor-pointer overflow-hidden bg-gray-100 border border-gray-100">
                            <img src="${c.img}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                            <div class="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition duration-300 flex items-center justify-center">
                                <h3 class="text-white text-3xl font-black uppercase tracking-widest border-b-2 border-transparent group-hover:border-white pb-1 transition-all drop-shadow-lg text-center px-4">${c.title}</h3>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>

        <section class="min-h-screen w-full glass-panel flex flex-col justify-center py-24 relative z-20">
            <div class="w-full px-6 md:px-12">
                <div class="flex justify-between items-end mb-16 border-b border-gray-900/10 pb-6">
                    <h2 class="text-4xl md:text-7xl font-black tracking-tighter text-gray-900">FEATURED DROPS</h2>
                    <button onclick="window.location.hash='#/collection/All'" class="text-sm font-bold uppercase tracking-widest border-b border-gray-900 pb-1 hover:text-brand-sky hover:border-brand-sky transition">View All</button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    ${products.slice(0, 4).map(p => ProductCard(p)).join('')}
                </div>
            </div>
        </section>

        <!-- MEDIA SECTION -->
        <section class="min-h-screen w-full bg-black text-white relative z-20 flex items-center justify-center py-24">
            <div class="w-full px-6 md:px-12">
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div class="lg:col-span-8 relative">
                        <h2 class="text-sm text-brand-sky font-bold uppercase tracking-widest mb-4">Campaign</h2>
                        <div class="relative w-full aspect-video bg-gray-900 rounded-sm overflow-hidden group">
                            <video id="brand-video" class="w-full h-full object-cover" poster="${mediaSettings.videoPoster}" loop>
                                <source src="${mediaSettings.videoUrl}" type="video/mp4">
                            </video>
                            <div id="video-overlay" class="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 cursor-pointer">
                                <div id="video-icon" class="w-20 h-20 rounded-full border-2 border-white flex items-center justify-center hover:bg-white/20 transition backdrop-blur-sm">
                                    <i data-feather="play" class="w-8 h-8 text-white ml-1"></i>
                                </div>
                            </div>
                            <div class="absolute bottom-6 left-6">
                                <h3 class="text-2xl font-black uppercase tracking-tighter">${mediaSettings.videoTitle}</h3>
                                <p class="text-gray-300 text-sm">${mediaSettings.videoSubtitle}</p>
                            </div>
                        </div>
                    </div>
                    <div class="lg:col-span-4 flex flex-col justify-end">
                        <div class="glass-dark p-8 rounded-sm h-full flex flex-col justify-between">
                            <div>
                                <h2 class="text-sm text-brand-sky font-bold uppercase tracking-widest mb-6">Now Playing</h2>
                                <h4 class="font-bold text-lg leading-none">${mediaSettings.songTitle}</h4>
                                <p class="text-gray-400 text-xs mt-1 uppercase tracking-wide">${mediaSettings.artistName}</p>
                                <div id="visualizer" class="h-12 flex items-center justify-center space-x-1 mb-6 mt-4">
                                    <div class="bar h-[30%]"></div><div class="bar h-[50%]"></div><div class="bar h-[70%]"></div><div class="bar h-[40%]"></div><div class="bar h-[60%]"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between items-center">
                                    <button id="audio-play-btn" class="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:bg-brand-sky hover:text-white transition shadow-lg transform active:scale-95">
                                        <i data-feather="play" class="w-5 h-5 ml-0.5"></i>
                                    </button>
                                </div>
                            </div>
                            <audio id="brand-audio" loop>
                                <source src="${mediaSettings.audioUrl}" type="audio/mpeg">
                            </audio>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;

    attachAddHandlers();
    attachMediaHandlers();
}

export function renderCollection(container, filter) {
    let filteredProducts = [];
    let pageTitle = "";
    let subTitle = "";

    // 1. Check for basic categories
    if (filter === 'All') {
        filteredProducts = products;
        pageTitle = "All Products";
        subTitle = "Full Catalog";
    } else if (filter === 'Apparel' || filter === 'Jewelry') {
        filteredProducts = products.filter(p => p.category === filter);
        pageTitle = filter;
        subTitle = `${filteredProducts.length} Items`;
    } 
    // 2. Check for dynamic collection ID
    else {
        const collection = collections.find(c => c.id === filter);
        if (collection) {
            filteredProducts = products.filter(p => p.collectionId === filter);
            pageTitle = collection.title;
            subTitle = collection.description || "Exclusive Collection";
        } else {
            // Fallback for unknown ID
            filteredProducts = [];
            pageTitle = "Collection Not Found";
        }
    }

    container.innerHTML = `
        <div class="bg-white min-h-screen">
            <div class="pt-32 pb-16 text-center bg-gray-50 border-b border-gray-100">
                <h1 class="text-4xl md:text-7xl font-black uppercase tracking-tighter text-gray-900">${pageTitle}</h1>
                <p class="text-gray-500 mt-4 text-sm font-bold uppercase tracking-widest">${subTitle}</p>
            </div>
            <div class="w-full px-6 md:px-12 py-16">
                ${filteredProducts.length === 0 ? 
                    `<div class="text-center text-gray-400 py-12">No products found in this collection yet.</div>` : 
                    `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                        ${filteredProducts.map(p => ProductCard(p)).join('')}
                    </div>`
                }
            </div>
        </div>
    `;
    attachAddHandlers();
}

export function renderProduct(container, id) {
    const product = products.find(p => String(p.id) === String(id));
    if(!product) return;
    
    container.innerHTML = `
        <div class="bg-white min-h-screen flex items-center pt-24">
            <div class="w-full px-6 md:px-12 py-12">
                <button onclick="window.history.back()" class="mb-8 flex items-center text-sm font-bold text-gray-400 hover:text-black transition">
                    <i data-feather="arrow-left" class="mr-2 w-4 h-4"></i> BACK
                </button>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-start">
                    <div class="bg-white aspect-[4/5] overflow-hidden border border-gray-100 shadow-sm rounded-sm">
                        <img src="${product.image}" class="w-full h-full object-cover object-center">
                    </div>
                    <div class="sticky top-32 space-y-8">
                        <div>
                            <span class="text-brand-sky font-bold uppercase tracking-widest text-xs">${product.category}</span>
                            <h1 class="text-5xl md:text-7xl font-black text-gray-900 mt-2 mb-6 tracking-tighter leading-none">${product.name}</h1>
                            <p class="text-3xl text-gray-800 font-medium">${formatPrice(product.price)}</p>
                        </div>
                        <p class="text-gray-600 leading-relaxed text-lg max-w-md">${product.desc}</p>
                        <div class="space-y-6 pt-8 border-t border-gray-100">
                            <button class="add-to-cart-btn w-full bg-black text-white py-5 font-bold uppercase tracking-widest hover:bg-gray-800 transition shadow-lg transform active:scale-[0.99] duration-100 rounded-sm" data-id="${product.id}">
                                Add to Cart
                            </button>
                            <div class="grid grid-cols-3 gap-4 text-center text-xs text-gray-400">
                                <div class="flex flex-col items-center"><i data-feather="truck" class="mb-2 text-gray-900"></i><span>Fast Delivery</span></div>
                                <div class="flex flex-col items-center"><i data-feather="shield" class="mb-2 text-gray-900"></i><span>Secure Payment</span></div>
                                <div class="flex flex-col items-center"><i data-feather="refresh-cw" class="mb-2 text-gray-900"></i><span>Easy Returns</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    attachAddHandlers();
}