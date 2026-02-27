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

function attachContactHandlers() {
    setTimeout(() => {
        const form = document.getElementById('contact-form');
        if(form) {
            form.addEventListener('submit', function(event) {
                event.preventDefault();
                const btn = document.getElementById('contact-submit-btn');
                const originalText = btn.innerHTML;
                btn.innerHTML = 'Sending...';
                btn.disabled = true;

                if(typeof emailjs !== 'undefined') {
                    // NOTE: Replace these with your actual EmailJS credentials
                    emailjs.sendForm('service_qoq9vy3', 'template_7o3m6dt', this, '2pRB_WKcxo0H26KzK')
                        .then(() => {
                            btn.innerHTML = 'Message Sent Successfully!';
                            btn.classList.add('bg-green-600');
                            btn.classList.remove('bg-black');
                            form.reset();
                            setTimeout(() => {
                                btn.innerHTML = originalText;
                                btn.classList.add('bg-black');
                                btn.classList.remove('bg-green-600');
                                btn.disabled = false;
                            }, 3000);
                        }, (error) => {
                            btn.innerHTML = 'Failed to Send';
                            btn.classList.add('bg-red-600');
                            btn.classList.remove('bg-black');
                            console.error('EmailJS Error:', error);
                            setTimeout(() => {
                                btn.innerHTML = originalText;
                                btn.classList.add('bg-black');
                                btn.classList.remove('bg-red-600');
                                btn.disabled = false;
                            }, 3000);
                        });
                } else {
                    alert("EmailJS SDK not loaded.");
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            });
        }
    }, 0);
}

function attachMediaHandlers() {
    setTimeout(() => {
        // Universal time formatter for Audio and Video
        const formatMediaTime = (seconds) => {
            if(isNaN(seconds)) return "0:00";
            const m = Math.floor(seconds / 60);
            const s = Math.floor(seconds % 60);
            return `${m}:${s.toString().padStart(2, '0')}`;
        };

        // --- YOUTUBE-STYLE VIDEO PLAYER SETUP (For Immersive Player Page) ---
        const video = document.getElementById('brand-video');
        const overlay = document.getElementById('video-overlay'); // Center play anim
        const videoContainer = document.getElementById('video-container');
        const videoProgressContainer = document.getElementById('video-progress-container');
        const videoProgressBar = document.getElementById('video-progress-bar');
        const videoScrubber = document.getElementById('video-scrubber');
        const fsBtn = document.getElementById('video-fs-btn');
        const shareBtn = document.getElementById('video-share-btn');
        const videoBottomPlay = document.getElementById('video-bottom-play-btn');
        const videoMuteBtn = document.getElementById('video-mute-btn');
        const videoCurrentTime = document.getElementById('video-current-time');
        const videoDuration = document.getElementById('video-duration');

        if (video) {
            // Load duration metadata
            video.addEventListener('loadedmetadata', () => {
                if(videoDuration) videoDuration.innerText = formatMediaTime(video.duration);
            });

            const togglePlay = () => {
                if (video.paused) video.play();
                else video.pause();
            };

            const toggleMute = (e) => {
                if(e) e.stopPropagation();
                video.muted = !video.muted;
                if(videoMuteBtn) {
                    if(video.muted) {
                        videoMuteBtn.innerHTML = `<i data-feather="volume-x" class="w-5 h-5"></i>`;
                    } else {
                        videoMuteBtn.innerHTML = `<i data-feather="volume-2" class="w-5 h-5"></i>`;
                    }
                    if(window.feather) feather.replace();
                }
            };

            const updateVideoUI = () => {
                if (video.paused) {
                    // Show center play button
                    overlay?.classList.remove('opacity-0', 'scale-150');
                    overlay?.classList.add('opacity-100', 'scale-100');
                    // Update bottom controls to play
                    if(videoBottomPlay) videoBottomPlay.innerHTML = `<i data-feather="play" class="w-5 h-5 fill-white"></i>`;
                } else {
                    // Hide & scale up center play button (YouTube style anim)
                    overlay?.classList.remove('opacity-100', 'scale-100');
                    overlay?.classList.add('opacity-0', 'scale-150');
                    // Update bottom controls to pause
                    if(videoBottomPlay) videoBottomPlay.innerHTML = `<i data-feather="pause" class="w-5 h-5 fill-white"></i>`;
                }
                if(window.feather) feather.replace();
            };

            // Event Listeners for UI sync
            video.addEventListener('play', updateVideoUI);
            video.addEventListener('pause', updateVideoUI);
            video.addEventListener('ended', updateVideoUI);

            // Click triggers
            video.addEventListener('click', togglePlay);
            overlay?.addEventListener('click', togglePlay);
            videoBottomPlay?.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePlay();
            });
            videoMuteBtn?.addEventListener('click', toggleMute);

            // Time and Progress Updates
            video.addEventListener('timeupdate', () => {
                if(videoProgressBar && videoScrubber) {
                    const percent = (video.currentTime / video.duration) * 100;
                    videoProgressBar.style.width = `${percent}%`;
                    videoScrubber.style.left = `${percent}%`;
                }
                if(videoCurrentTime) videoCurrentTime.innerText = formatMediaTime(video.currentTime);
            });

            // Seek logic on the progress bar
            videoProgressContainer?.addEventListener('click', (e) => {
                e.stopPropagation();
                const rect = videoProgressContainer.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                video.currentTime = pos * video.duration;
            });

            // Fullscreen logic
            fsBtn?.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (!document.fullscreenElement) {
                    const el = videoContainer || video;
                    if (el.requestFullscreen) await el.requestFullscreen();
                    else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
                    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
                    
                    try {
                        if (screen.orientation && screen.orientation.lock) await screen.orientation.lock("landscape");
                    } catch (err) {}
                } else {
                    if (document.exitFullscreen) await document.exitFullscreen();
                    else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
                    
                    try {
                        if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
                    } catch (err) {}
                }
            });

            // Share logic
            shareBtn?.addEventListener('click', (e) => {
                e.stopPropagation();
                const url = window.location.href;
                navigator.clipboard.writeText(url).then(() => {
                    const originalHTML = shareBtn.innerHTML;
                    shareBtn.innerHTML = `<i data-feather="check" class="w-5 h-5 text-green-400"></i>`;
                    if(window.feather) feather.replace();
                    setTimeout(() => {
                        shareBtn.innerHTML = originalHTML;
                        if(window.feather) feather.replace();
                    }, 2000);
                });
            });
        }

        // --- AUDIO PLAYER SETUP ---
        const audio = document.getElementById('brand-audio');
        const audioBtn = document.getElementById('audio-play-btn');
        const audioPrevBtn = document.getElementById('audio-prev-btn');
        const audioNextBtn = document.getElementById('audio-next-btn');
        const visualizer = document.getElementById('visualizer');
        const audioProgressContainer = document.getElementById('audio-progress-container');
        const audioProgressBar = document.getElementById('audio-progress-bar');
        const audioCurrentTime = document.getElementById('audio-current-time');
        const audioDuration = document.getElementById('audio-duration');

        if (audio) {
            audio.addEventListener('loadedmetadata', () => {
                if(audioDuration) audioDuration.innerText = formatMediaTime(audio.duration);
            });

            const updateAudioUI = () => {
                if(audioBtn) {
                    if (audio.paused) {
                        audioBtn.innerHTML = `<i data-feather="play" class="w-6 h-6 ml-1"></i>`;
                        visualizer?.classList.remove('playing');
                    } else {
                        audioBtn.innerHTML = `<i data-feather="pause" class="w-6 h-6"></i>`;
                        visualizer?.classList.add('playing');
                    }
                }
                if(window.feather) feather.replace();
            };

            audio.addEventListener('play', updateAudioUI);
            audio.addEventListener('pause', updateAudioUI);
            audio.addEventListener('ended', updateAudioUI);

            audioBtn?.addEventListener('click', () => {
                if (audio.paused) audio.play();
                else audio.pause();
            });

            audioPrevBtn?.addEventListener('click', () => {
                audio.currentTime = Math.max(0, audio.currentTime - 10);
            });

            audioNextBtn?.addEventListener('click', () => {
                audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
            });

            audio.addEventListener('timeupdate', () => {
                if(audioProgressBar) {
                    const percent = (audio.currentTime / audio.duration) * 100;
                    audioProgressBar.style.width = `${percent}%`;
                }
                if(audioCurrentTime) audioCurrentTime.innerText = formatMediaTime(audio.currentTime);
            });

            audioProgressContainer?.addEventListener('click', (e) => {
                const rect = audioProgressContainer.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                audio.currentTime = pos * audio.duration;
            });
        }
        
        if(window.feather) feather.replace();
    }, 200);
}

// --- Views ---

export function renderHome(container) {
    container.innerHTML = `
        <section class="h-[100vh] w-full flex items-center justify-center relative">
           <div class="absolute bottom-12 w-full text-center animate-bounce text-gray-400 pointer-events-none">
               <i data-feather="chevron-down" class="w-10 h-10 mx-auto drop-shadow-md"></i>
           </div>
        </section>

        <!-- Dynamic Collections Grid (Fixed Header Placement) -->
        <section class="bg-white py-24 relative z-20">
            <div class="w-full px-6 md:px-12">
                
                <!-- Collections Header placed properly ABOVE the grid -->
                <div class="mb-12 border-b border-gray-900/10 pb-6 flex justify-between items-end">
                    <h2 class="text-4xl md:text-7xl font-black tracking-tighter text-gray-900 uppercase">Collections</h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    ${collections.map(c => `
                        <div onclick="window.location.hash='#/collection/${c.id}'" class="group relative h-[400px] md:h-[500px] cursor-pointer overflow-hidden bg-gray-100 border border-gray-100 rounded-sm">
                            <img src="${c.img}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                            <div class="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition duration-300 flex items-center justify-center">
                                <h3 class="text-white text-3xl font-black uppercase tracking-widest border-b-2 border-transparent group-hover:border-white pb-1 transition-all drop-shadow-lg text-center px-4">${c.title}</h3>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>

        <!-- Featured Drops -->
        <section class="min-h-screen w-full glass-panel flex flex-col justify-center py-24 relative z-20">
            <div class="w-full px-6 md:px-12">
                <div class="flex justify-between items-end mb-16 border-b border-gray-900/10 pb-6">
                    <h2 class="text-4xl md:text-7xl font-black tracking-tighter text-gray-900 uppercase">Featured Drops</h2>
                    <button onclick="window.location.hash='#/collection/All'" class="text-sm font-bold uppercase tracking-widest border-b border-gray-900 pb-1 hover:text-brand-sky hover:border-brand-sky transition">View All</button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    ${products.slice(0, 4).map(p => ProductCard(p)).join('')}
                </div>
            </div>
        </section>

        <!-- AUDIO SECTION -->
        <section class="min-h-[60vh] w-full bg-black text-white relative z-20 flex items-center justify-center py-24">
            <div class="w-full px-6 md:px-12 max-w-4xl mx-auto flex flex-col items-center">
                <h2 class="text-sm text-brand-sky font-bold uppercase tracking-widest mb-12 text-center">Featured Soundtrack</h2>
                
                <div class="w-full glass-dark p-8 md:p-12 rounded-3xl flex flex-col md:flex-row items-center gap-10 shadow-[0_0_50px_rgba(0,0,0,0.6)] border border-white/10">
                    
                    <!-- Visualizer / Image -->
                    <div class="w-40 h-40 md:w-48 md:h-48 rounded-full border border-white/10 overflow-hidden shadow-2xl relative group bg-gray-900 shrink-0">
                        <img src="${mediaSettings.videoPoster || 'https://placehold.co/400x400/111/fff?text=Audio'}" class="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition duration-500 blur-sm group-hover:blur-0">
                        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div id="visualizer" class="h-12 flex items-center justify-center space-x-1.5 opacity-90 mix-blend-screen">
                                <div class="bar w-1.5 h-[30%] bg-white rounded-full"></div>
                                <div class="bar w-1.5 h-[60%] bg-brand-sky rounded-full"></div>
                                <div class="bar w-1.5 h-[100%] bg-white rounded-full shadow-[0_0_10px_#fff]"></div>
                                <div class="bar w-1.5 h-[50%] bg-brand-sky rounded-full"></div>
                                <div class="bar w-1.5 h-[80%] bg-white rounded-full"></div>
                            </div>
                        </div>
                        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-black rounded-full border border-white/20 shadow-inner"></div>
                    </div>

                    <!-- Info and Controls -->
                    <div class="flex-1 w-full text-center md:text-left flex flex-col justify-center">
                        <h4 class="font-black text-2xl md:text-4xl tracking-tighter text-white mb-2 truncate drop-shadow-md">${mediaSettings.songTitle}</h4>
                        <p class="text-brand-sky text-sm md:text-base font-bold uppercase tracking-widest mb-8 drop-shadow-sm">${mediaSettings.artistName}</p>
                        
                        <div class="w-full">
                            <div id="audio-progress-container" class="w-full bg-white/10 h-2 rounded-full mb-3 cursor-pointer overflow-hidden relative group/audio">
                                <div id="audio-progress-bar" class="bg-brand-sky h-full w-0 rounded-full relative transition-all duration-100 shadow-[0_0_10px_#0ea5e9]"></div>
                            </div>
                            <div class="flex justify-between items-center text-xs font-mono font-bold text-gray-400 mb-6">
                                <span id="audio-current-time">0:00</span>
                                <span id="audio-duration">--:--</span>
                            </div>

                            <div class="flex justify-center md:justify-start items-center space-x-6">
                                <button id="audio-prev-btn" class="text-gray-400 hover:text-white transition hover:scale-110 active:scale-95" title="Skip Back 10s"><i data-feather="skip-back" class="w-6 h-6"></i></button>
                                
                                <button id="audio-play-btn" class="w-16 h-16 bg-brand-sky text-white rounded-full flex items-center justify-center hover:bg-sky-400 transition shadow-[0_0_20px_rgba(14,165,233,0.3)] transform active:scale-95 hover:scale-105 border-2 border-sky-300/30">
                                    <i data-feather="play" class="w-6 h-6 ml-1"></i>
                                </button>
                                
                                <button id="audio-next-btn" class="text-gray-400 hover:text-white transition hover:scale-110 active:scale-95" title="Skip Forward 10s"><i data-feather="skip-forward" class="w-6 h-6"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <audio id="brand-audio" loop>
                    <source src="${mediaSettings.audioUrl}" type="audio/mpeg">
                </audio>

                <div class="mt-12 w-full flex justify-center">
                    <a href="#/player" class="inline-flex justify-center items-center px-8 py-4 bg-white/5 text-brand-sky font-bold uppercase tracking-widest rounded-full hover:bg-white/10 transition shadow-lg hover:scale-105 duration-300 border border-white/10 hover:border-brand-sky w-full md:w-auto backdrop-blur-sm">
                        Open Immersive Player <i data-feather="external-link" class="ml-2 w-5 h-5"></i>
                    </a>
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

    if (filter === 'All') {
        filteredProducts = products;
        pageTitle = "All Products";
        subTitle = "Full Catalog";
    } else if (filter === 'Apparel' || filter === 'Jewelry') {
        filteredProducts = products.filter(p => p.category === filter);
        pageTitle = filter;
        subTitle = `${filteredProducts.length} Items`;
    } 
    else {
        const collection = collections.find(c => c.id === filter);
        if (collection) {
            filteredProducts = products.filter(p => p.collectionId === filter);
            pageTitle = collection.title;
            subTitle = collection.description || "Exclusive Collection";
        } else {
            filteredProducts = [];
            pageTitle = "Collection Not Found";
        }
    }

    container.innerHTML = `
        <div class="bg-white min-h-screen">
            <div class="pt-32 pb-16 text-center bg-gray-50 border-b border-gray-100 relative">
                <button onclick="window.history.back()" class="absolute left-6 md:left-12 top-24 flex items-center text-sm font-bold text-gray-400 hover:text-black transition">
                    <i data-feather="arrow-left" class="mr-2 w-4 h-4"></i> BACK
                </button>
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

export function renderPlayer(container) {
    window.scrollTo(0, 0);
    
    container.innerHTML = `
        <div class="bg-black min-h-screen w-full flex flex-col pt-20 pb-12">
            
            <div class="px-6 md:px-12 py-6 flex-shrink-0 flex items-center justify-between border-b border-white/10 relative z-20">
                <button onclick="window.history.back()" class="text-gray-400 hover:text-white transition flex items-center font-bold tracking-widest text-xs uppercase bg-white/5 p-3 rounded-md hover:bg-white/10 backdrop-blur-sm shadow-sm">
                    <i data-feather="arrow-left" class="mr-2 w-4 h-4"></i> Return to Shop
                </button>
                <span class="text-brand-sky font-black tracking-widest uppercase text-sm md:text-xl drop-shadow-[0_0_10px_rgba(14,165,233,0.5)] hidden md:block">Immersive Experience</span>
            </div>
            
            <div class="flex-1 flex flex-col lg:flex-row overflow-hidden relative min-h-[80vh]">
                <div class="absolute inset-0 z-0 opacity-20 blur-3xl pointer-events-none" style="background-image: url('${mediaSettings.videoPoster}'); background-size: cover; background-position: center;"></div>
                <div class="absolute inset-0 z-0 bg-black/60 pointer-events-none"></div>

                <div class="w-full lg:w-2/3 p-4 md:p-8 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/10 z-10">
                    
                    <!-- YOUTUBE STYLE VIDEO PLAYER -->
                    <div id="video-container" class="relative w-full aspect-video bg-black rounded-xl overflow-hidden group shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-white/5">
                        <video id="brand-video" class="w-full h-full object-contain bg-black cursor-pointer" poster="${mediaSettings.videoPoster}" loop playsinline webkit-playsinline>
                            <source src="${mediaSettings.videoUrl}" type="video/mp4">
                        </video>
                        
                        <!-- Top Info Overlay (Fades out when playing, shows on hover/pause) -->
                        <div class="absolute top-0 left-0 w-full bg-gradient-to-b from-black/80 to-transparent p-6 pt-6 pb-12 transition-opacity duration-300 opacity-0 group-hover:opacity-100 z-20 flex justify-between items-start pointer-events-none">
                            <div class="pointer-events-auto max-w-[80%]">
                                <h3 class="text-lg md:text-2xl font-bold text-white leading-tight drop-shadow-md truncate">${mediaSettings.videoTitle}</h3>
                                <p class="text-gray-300 text-xs mt-1 drop-shadow-sm truncate">${mediaSettings.videoSubtitle}</p>
                            </div>
                            <button id="video-share-btn" class="pointer-events-auto p-2 hover:bg-white/20 rounded-full text-white transition backdrop-blur-md" title="Share Link">
                                <i data-feather="share-2" class="w-5 h-5"></i>
                            </button>
                        </div>

                        <!-- Center Play Button Overlay (YouTube Style Pulse Animation) -->
                        <div id="video-overlay" class="absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none z-10 opacity-100 scale-100">
                            <div id="video-icon" class="w-20 h-20 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-transform hover:scale-110 pointer-events-auto cursor-pointer">
                                <i data-feather="play" class="w-8 h-8 text-white ml-1 fill-white"></i>
                            </div>
                        </div>
                        
                        <!-- Bottom YouTube-Style Control Bar -->
                        <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12 transition-all duration-300 opacity-0 group-hover:opacity-100 z-20 flex flex-col">
                            
                            <!-- Full-width Scrubber/Progress Timeline -->
                            <div class="w-full px-4 mb-2">
                                <div id="video-progress-container" class="relative w-full h-1 bg-white/30 cursor-pointer group/progress transition-all hover:h-1.5">
                                    <div id="video-progress-bar" class="absolute top-0 left-0 h-full bg-brand-sky w-0 pointer-events-none"></div>
                                    <!-- Scrubber Dot -->
                                    <div id="video-scrubber" class="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-brand-sky rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none shadow-[0_0_10px_#0ea5e9]" style="left: 0%;"></div>
                                </div>
                            </div>

                            <!-- Controls Layout -->
                            <div class="flex justify-between items-center px-4 pb-3">
                                
                                <!-- Left side controls: Play, Vol, Time -->
                                <div class="flex items-center space-x-4 md:space-x-6">
                                    <button id="video-bottom-play-btn" class="text-white hover:text-brand-sky transition focus:outline-none" title="Play">
                                        <i data-feather="play" class="w-5 h-5 fill-white"></i>
                                    </button>
                                    
                                    <button id="video-mute-btn" class="text-white hover:text-brand-sky transition focus:outline-none hidden sm:block" title="Mute">
                                        <i data-feather="volume-2" class="w-5 h-5"></i>
                                    </button>

                                    <div class="text-white text-xs font-mono font-medium tracking-wide select-none opacity-90 hidden sm:block">
                                        <span id="video-current-time">0:00</span> <span class="mx-1 opacity-50">/</span> <span id="video-duration">0:00</span>
                                    </div>
                                </div>
                                
                                <!-- Right side controls: Fullscreen -->
                                <div class="flex items-center space-x-3">
                                    <button id="video-fs-btn" class="text-white hover:text-brand-sky transition focus:outline-none" title="Fullscreen">
                                        <i data-feather="maximize" class="w-5 h-5"></i>
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <div class="w-full lg:w-1/3 p-6 md:p-12 flex flex-col justify-center z-10 bg-gradient-to-t lg:bg-gradient-to-l from-black/80 to-transparent">
                    <div class="w-full max-w-sm mx-auto flex flex-col items-center">
                        
                        <div class="w-56 h-56 md:w-64 md:h-64 rounded-full border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] mb-8 relative group bg-gray-900 p-1">
                            <div class="w-full h-full rounded-full overflow-hidden relative">
                                <img src="${mediaSettings.videoPoster || 'https://placehold.co/400x400/111/fff?text=Audio'}" class="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition duration-500 blur-sm group-hover:blur-0">
                                <div class="absolute inset-0 bg-gradient-to-tr from-brand-sky/30 to-transparent pointer-events-none"></div>
                                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div id="visualizer" class="h-16 flex items-center justify-center space-x-1.5 opacity-90 mix-blend-screen">
                                        <div class="bar w-2 h-[30%] bg-white rounded-full"></div>
                                        <div class="bar w-2 h-[60%] bg-brand-sky rounded-full"></div>
                                        <div class="bar w-2 h-[100%] bg-white rounded-full shadow-[0_0_15px_#fff]"></div>
                                        <div class="bar w-2 h-[50%] bg-brand-sky rounded-full"></div>
                                        <div class="bar w-2 h-[80%] bg-white rounded-full"></div>
                                    </div>
                                </div>
                                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-black rounded-full border-2 border-white/10 shadow-inner"></div>
                            </div>
                        </div>

                        <div class="text-center w-full mb-10">
                            <h4 class="font-black text-2xl md:text-3xl tracking-tighter text-white mb-2 truncate drop-shadow-md">${mediaSettings.songTitle}</h4>
                            <p class="text-brand-sky text-sm font-bold uppercase tracking-widest truncate drop-shadow-sm">${mediaSettings.artistName}</p>
                        </div>

                        <div class="w-full bg-white/5 p-6 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl">
                            
                            <div id="audio-progress-container" class="w-full bg-black/60 h-2.5 rounded-full mb-3 cursor-pointer overflow-hidden relative group/audio">
                                <div id="audio-progress-bar" class="bg-brand-sky h-full w-0 rounded-full relative transition-all duration-100 shadow-[0_0_10px_#0ea5e9]"></div>
                            </div>
                            
                            <div class="flex justify-between items-center text-xs font-mono font-bold text-gray-400 mb-6 px-1 tracking-wider">
                                <span id="audio-current-time">0:00</span>
                                <span id="audio-duration">--:--</span>
                            </div>

                            <div class="flex justify-center items-center space-x-6">
                                <button id="audio-prev-btn" class="text-gray-400 hover:text-white transition hover:scale-110 active:scale-95" title="Skip Back 10s"><i data-feather="skip-back" class="w-6 h-6"></i></button>
                                
                                <button id="audio-play-btn" class="w-16 h-16 bg-brand-sky text-white rounded-full flex items-center justify-center hover:bg-sky-400 transition shadow-[0_0_20px_rgba(14,165,233,0.3)] transform active:scale-95 hover:scale-105 border-2 border-sky-300/30">
                                    <i data-feather="play" class="w-6 h-6 ml-1"></i>
                                </button>
                                
                                <button id="audio-next-btn" class="text-gray-400 hover:text-white transition hover:scale-110 active:scale-95" title="Skip Forward 10s"><i data-feather="skip-forward" class="w-6 h-6"></i></button>
                            </div>
                        </div>
                        
                        <audio id="brand-audio" loop>
                            <source src="${mediaSettings.audioUrl}" type="audio/mpeg">
                        </audio>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    attachMediaHandlers();
}

export function renderDeliveryReturns(container) {
    window.scrollTo(0, 0);
    container.innerHTML = `
        <div class="bg-white min-h-screen pt-32 pb-24">
            <div class="max-w-3xl mx-auto px-6 md:px-12">
                <button onclick="window.history.back()" class="mb-8 flex items-center text-sm font-bold text-gray-400 hover:text-black transition">
                    <i data-feather="arrow-left" class="mr-2 w-4 h-4"></i> BACK
                </button>
                <h1 class="text-4xl md:text-6xl font-black uppercase tracking-tighter text-gray-900 mb-8">Delivery & Returns</h1>
                <div class="space-y-8 text-gray-600 leading-relaxed text-lg">
                    <section>
                        <h3 class="text-xl font-bold text-black mb-4 uppercase tracking-widest">Shipping Information</h3>
                        <p>We offer fast and reliable shipping across Zambia. All orders are processed within 1-2 business days. Standard delivery typically takes 3-5 business days. You will receive a tracking link via email once your order is dispatched.</p>
                    </section>
                    <section>
                        <h3 class="text-xl font-bold text-black mb-4 uppercase tracking-widest">Returns Policy</h3>
                        <p>We accept returns within 14 days of delivery. Items must be unworn, unwashed, and in their original condition with all tags attached. Jewelry must be returned in its original packaging. To initiate a return, please contact our support team via the Contact Us page.</p>
                    </section>
                    <section>
                        <h3 class="text-xl font-bold text-black mb-4 uppercase tracking-widest">Refunds</h3>
                        <p>Once we receive and inspect your returned item, we will notify you of the approval or rejection of your refund. Approved refunds will be processed and automatically applied to your original method of payment within 5-7 business days.</p>
                    </section>
                </div>
            </div>
        </div>
    `;
    if(window.feather) feather.replace();
}

export function renderConditions(container) {
    window.scrollTo(0, 0);
    container.innerHTML = `
        <div class="bg-white min-h-screen pt-32 pb-24">
            <div class="max-w-3xl mx-auto px-6 md:px-12">
                <button onclick="window.history.back()" class="mb-8 flex items-center text-sm font-bold text-gray-400 hover:text-black transition">
                    <i data-feather="arrow-left" class="mr-2 w-4 h-4"></i> BACK
                </button>
                <h1 class="text-4xl md:text-6xl font-black uppercase tracking-tighter text-gray-900 mb-8">Conditions of Service</h1>
                <div class="space-y-8 text-gray-600 leading-relaxed text-lg">
                    <section>
                        <h3 class="text-xl font-bold text-black mb-4 uppercase tracking-widest">1. General Overview</h3>
                        <p>By accessing and using the ICE FOR YOU website, you agree to be bound by these Conditions of Service. We reserve the right to update or modify these terms at any time without prior notice.</p>
                    </section>
                    <section>
                        <h3 class="text-xl font-bold text-black mb-4 uppercase tracking-widest">2. Products & Pricing</h3>
                        <p>All prices are listed in Zambian Kwacha (ZMW). We make every effort to display as accurately as possible the colors and images of our products. However, we cannot guarantee that your device's display of any color will be accurate. Prices are subject to change without notice.</p>
                    </section>
                    <section>
                        <h3 class="text-xl font-bold text-black mb-4 uppercase tracking-widest">3. Privacy Policy</h3>
                        <p>Your submission of personal information through the store is governed by our Privacy Policy. We do not sell your personal data to third parties. Our full privacy policy is available upon request.</p>
                    </section>
                </div>
            </div>
        </div>
    `;
    if(window.feather) feather.replace();
}

export function renderContactUs(container) {
    window.scrollTo(0, 0);
    container.innerHTML = `
        <div class="bg-gray-50 min-h-screen pt-32 pb-24">
            <div class="max-w-5xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-16">
                <div>
                    <button onclick="window.history.back()" class="mb-8 flex items-center text-sm font-bold text-gray-400 hover:text-black transition">
                        <i data-feather="arrow-left" class="mr-2 w-4 h-4"></i> BACK
                    </button>
                    <h1 class="text-4xl md:text-6xl font-black uppercase tracking-tighter text-gray-900 mb-6">Contact Us</h1>
                    <p class="text-gray-600 mb-10 leading-relaxed text-lg">Have a question about an order, styling advice, or just want to say hello? Fill out the form or use our direct contact info below. We'll get back to you within 24 hours.</p>
                    
                    <div class="space-y-8">
                        <div class="flex items-start">
                            <i data-feather="map-pin" class="w-6 h-6 text-brand-sky mr-4 mt-1"></i>
                            <div>
                                <h4 class="font-bold text-black uppercase tracking-widest text-sm mb-1">Headquarters</h4>
                                <p class="text-gray-500">Lusaka, Zambia</p>
                            </div>
                        </div>
                        <div class="flex items-start">
                            <i data-feather="mail" class="w-6 h-6 text-brand-sky mr-4 mt-1"></i>
                            <div>
                                <h4 class="font-bold text-black uppercase tracking-widest text-sm mb-1">Email</h4>
                                <p class="text-gray-500">iceforyou@gmail.com</p>
                            </div>
                        </div>
                        <div class="flex items-start">
                            <i data-feather="phone" class="w-6 h-6 text-brand-sky mr-4 mt-1"></i>
                            <div>
                                <h4 class="font-bold text-black uppercase tracking-widest text-sm mb-1">Phone</h4>
                                <p class="text-gray-500">+260 97 729 8815</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-8 md:p-10 rounded-xl shadow-lg border border-gray-100">
                    <h3 class="text-2xl font-black uppercase tracking-tighter text-gray-900 mb-6">Send a Message</h3>
                    <form id="contact-form" class="space-y-6">
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Name</label>
                            <input type="text" name="user_name" required class="block w-full border-gray-200 bg-gray-50 rounded-md p-3 focus:ring-black focus:border-black transition">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email Address</label>
                            <input type="email" name="user_email" required class="block w-full border-gray-200 bg-gray-50 rounded-md p-3 focus:ring-black focus:border-black transition">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Message</label>
                            <textarea name="message" rows="4" required class="block w-full border-gray-200 bg-gray-50 rounded-md p-3 focus:ring-black focus:border-black transition"></textarea>
                        </div>
                        <button type="submit" id="contact-submit-btn" class="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-800 transition shadow-md rounded-md transform active:scale-95 duration-100">
                            Send Message
                        </button>
                        <p class="text-[10px] text-gray-400 text-center mt-4">Powered by EmailJS</p>
                    </form>
                </div>
            </div>
        </div>
    `;
    attachContactHandlers();
    if(window.feather) feather.replace();
}