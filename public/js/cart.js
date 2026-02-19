import { products, formatPrice } from './data.js';

class CartStore {
    constructor() {
        this.cart = [];
        this.listeners = [];
        this.init();
    }

    // Initialize with error handling to prevent crashes if localStorage is blocked
    init() {
        try {
            const stored = localStorage.getItem('ify_cart');
            if (stored) {
                this.cart = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('LocalStorage access denied or empty. Starting with empty cart.');
            this.cart = [];
        }
    }

    subscribe(fn) {
        this.listeners.push(fn);
    }

    notify() {
        try {
            localStorage.setItem('ify_cart', JSON.stringify(this.cart));
        } catch (e) {
            // Silently fail if storage is full or blocked
        }
        this.listeners.forEach(fn => fn(this.cart));
    }

    add(productId) {
        // FIX: Compare as strings to handle both Firestore IDs (strings) and Seed IDs (numbers/strings)
        const product = products.find(p => String(p.id) === String(productId));
        
        if (!product) {
            console.error("Product not found for ID:", productId);
            return;
        }

        const existing = this.cart.find(item => String(item.id) === String(productId));
        if(existing) {
            existing.qty++;
        } else {
            this.cart.push({...product, qty: 1});
        }
        this.notify();
    }

    changeQty(productId, delta) {
        // FIX: Compare as strings here too
        const item = this.cart.find(i => String(i.id) === String(productId));
        if(item) {
            item.qty += delta;
            if(item.qty <= 0) {
                this.cart = this.cart.filter(item => String(item.id) !== String(productId));
            }
            this.notify();
        }
    }
}

// Create and export the singleton instance
export const cartStore = new CartStore();

// UI Render Function
export function renderCartUI(cart) {
    const container = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    const badge = document.getElementById('cart-count');

    // Safety check in case elements aren't in the DOM yet
    if (!container || !subtotalEl || !badge) return;

    // Update Badge
    const count = cart.reduce((acc, item) => acc + item.qty, 0);
    badge.innerText = count;
    badge.classList.toggle('opacity-0', count === 0);

    // Update Items
    if(cart.length === 0) {
        container.innerHTML = `<div class="text-center text-gray-500 mt-20">Your cart is empty.</div>`;
        subtotalEl.innerText = formatPrice(0);
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="flex gap-4">
            <img src="${item.image}" class="w-20 h-24 object-cover bg-white border border-gray-100 rounded-sm">
            <div class="flex-1">
                <h4 class="font-bold text-sm text-gray-900">${item.name}</h4>
                <p class="text-xs text-gray-500 mb-2">${item.category}</p>
                <div class="flex justify-between items-center">
                    <div class="flex items-center border border-gray-300">
                        <button class="px-2 py-1 text-gray-600 hover:bg-gray-100 cart-qty-btn" data-id="${item.id}" data-delta="-1">-</button>
                        <span class="px-2 text-sm font-medium text-gray-800">${item.qty}</span>
                        <button class="px-2 py-1 text-gray-600 hover:bg-gray-100 cart-qty-btn" data-id="${item.id}" data-delta="1">+</button>
                    </div>
                    <p class="font-bold text-sm text-gray-900">${formatPrice(item.price * item.qty)}</p>
                </div>
            </div>
        </div>
    `).join('');

    // Update Subtotal
    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    subtotalEl.innerText = formatPrice(total);

    // Re-attach listeners for dynamically created buttons
    document.querySelectorAll('.cart-qty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // FIX: Don't parse ID as int, keep as string
            const id = e.target.dataset.id;
            const delta = parseInt(e.target.dataset.delta);
            cartStore.changeQty(id, delta);
        });
    });
}