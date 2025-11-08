import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

async function loadProducts() {
    const featuredGrid = document.querySelector('.product-grid');
    const collectionsGrid = document.querySelector('.collections-grid');

    // Clear existing hardcoded content
    featuredGrid.innerHTML = '';
    collectionsGrid.innerHTML = '';

    const querySnapshot = await getDocs(collection(db, "products"));

    querySnapshot.forEach((doc) => {
        const product = doc.data();
        
        if (product.section === 'featured') {
            const productCard = `
                <div class="product-card">
                    <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-price">K${parseFloat(product.price).toFixed(2)}</p>
                    </div>
                </div>
            `;
            featuredGrid.innerHTML += productCard;
        } 
        
        else if (product.section === 'collection') {
            const collectionCard = `
                 <div class="collection-card">
                    <img src="${product.imageUrl}" alt="${product.name}" class="collection-image">
                    <div class="collection-overlay">
                        <div class="collection-content">
                            <h3 class="collection-title">${product.name}</h3>
                            <a href="#" class="btn btn-light">View Collection</a>
                        </div>
                    </div>
                </div>
            `;
            collectionsGrid.innerHTML += collectionCard;
        }
    });
}