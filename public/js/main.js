import { initData, products } from './data.js';
import { cartStore, renderCartUI } from './cart.js';
import { initRouter } from './router.js';

// --- UI Toggle Logic ---
function toggleDrawer(id) {
    const drawer = document.getElementById(id);
    if (!drawer) return;
    
    if (drawer.classList.contains('-translate-x-full')) {
        drawer.classList.remove('-translate-x-full');
    } else if (drawer.classList.contains('translate-x-full')) {
        drawer.classList.remove('translate-x-full');
    } else {
        if (id === 'menu-drawer') drawer.classList.add('-translate-x-full');
        if (id === 'cart-drawer') drawer.classList.add('translate-x-full');
    }
}

function toggleSearch() {
    const overlay = document.getElementById('search-overlay');
    const input = document.getElementById('search-input');
    
    if (overlay.classList.contains('opacity-0')) {
        overlay.classList.remove('opacity-0', 'pointer-events-none');
        setTimeout(() => input.focus(), 100);
    } else {
        overlay.classList.add('opacity-0', 'pointer-events-none');
    }
}

// --- Setup Event Listeners ---
function setupGlobalEvents() {
    document.getElementById('menu-toggle')?.addEventListener('click', () => toggleDrawer('menu-drawer'));
    document.getElementById('cart-toggle')?.addEventListener('click', () => toggleDrawer('cart-drawer'));
    document.getElementById('search-toggle')?.addEventListener('click', () => toggleSearch());
    document.getElementById('search-close')?.addEventListener('click', () => toggleSearch());
    
    document.querySelectorAll('.drawer-backdrop, .close-drawer').forEach(el => {
        el.addEventListener('click', (e) => {
            const drawer = e.target.closest('.drawer');
            if(drawer) toggleDrawer(drawer.id);
        });
    });
    
    document.querySelectorAll('.drawer-link').forEach(link => {
        link.addEventListener('click', () => toggleDrawer('menu-drawer'));
    });

    document.getElementById('search-input')?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const resultsContainer = document.getElementById('search-results');
        
        if (query.length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }

        const hits = products.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.category.toLowerCase().includes(query)
        );

        const formatPrice = (price) => `K${parseInt(price).toLocaleString(undefined, {minimumFractionDigits: 2})}`;

        resultsContainer.innerHTML = hits.map(p => `
            <div class="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded" onclick="window.location.hash='#/product/${p.id}'; document.getElementById('search-close').click();">
                <img src="${p.image}" class="w-16 h-16 object-cover rounded border border-gray-100">
                <div>
                    <h4 class="font-bold text-sm text-gray-900">${p.name}</h4>
                    <p class="text-xs text-gray-500">${formatPrice(p.price)}</p>
                </div>
            </div>
        `).join('');
        
        if (hits.length === 0) resultsContainer.innerHTML = '<p class="text-center text-gray-500 col-span-4">No results found.</p>';
    });
}

// --- Init App ---
window.addEventListener('load', async () => {
    console.log('App Initializing...');
    
    // 0. LOAD DATA FIRST
    await initData();
    
    // 1. Remove Splash Screen with fade effect
    const splash = document.getElementById('splash-screen');
    if (splash) {
        // Add opacity-0 to trigger transition
        splash.classList.add('opacity-0', 'pointer-events-none');
        // Remove from DOM after transition completes (700ms matches css duration)
        setTimeout(() => {
            splash.remove();
        }, 800);
    }
    
    // 2. Subscribe UI to Store updates
    cartStore.subscribe(renderCartUI);
    // 3. Initial render of cart state
    renderCartUI(cartStore.cart);
    
    // 4. Setup global click listeners
    setupGlobalEvents();
    
    // 5. Start Router
    const appElement = document.getElementById('app');
    initRouter(appElement);
    
    // 6. Icons
    if(window.feather) feather.replace();
});