import { db } from './firebase-config.js';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- CLOUDINARY CONFIGURATION ---
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dwgattbka/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'grc-cms-uploads';

// DOM Elements
const form = document.getElementById('product-form');
const productNameInput = document.getElementById('productName');
const productPriceInput = document.getElementById('productPrice');
const productSectionInput = document.getElementById('productSection');
const productImageInput = document.getElementById('productImage');
const productIdInput = document.getElementById('productId');
const tableBody = document.getElementById('products-table-body');
const clearFormBtn = document.getElementById('clear-form-btn');

const productsCollectionRef = collection(db, "products");

// --- FUNCTIONS ---

// Function to upload image to Cloudinary
async function uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        return data.secure_url; // Returns the URL of the uploaded image
    } catch (error) {
        console.error('Error uploading image:', error);
        return null;
    }
}

// Function to render products in the table
async function renderProducts() {
    tableBody.innerHTML = ''; // Clear table
    const querySnapshot = await getDocs(productsCollectionRef);
    querySnapshot.forEach(doc => {
        const product = doc.data();
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${product.imageUrl}" alt="${product.name}"></td>
            <td>${product.name}</td>
            <td>K${parseFloat(product.price).toFixed(2)}</td>
            <td>${product.section}</td>
            <td class="actions">
                <button class="edit-btn" data-id="${doc.id}">Edit</button>
                <button class="delete-btn" data-id="${doc.id}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to populate form for editing
async function populateFormForEdit(id) {
    const productDoc = await getDoc(doc(db, "products", id));
    if (productDoc.exists()) {
        const product = productDoc.data();
        productNameInput.value = product.name;
        productPriceInput.value = product.price;
        productSectionInput.value = product.section;
        productIdInput.value = id; // Set the hidden ID field
        form.querySelector('button[type="submit"]').textContent = 'Update Product';
    }
}

// Clear form to add new product
function clearForm() {
    form.reset();
    productIdInput.value = '';
    form.querySelector('button[type="submit"]').textContent = 'Save Product';
}


// --- EVENT LISTENERS ---

// Form submission (for both creating and updating)
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = productNameInput.value;
    const price = parseFloat(productPriceInput.value);
    const section = productSectionInput.value;
    const imageFile = productImageInput.files[0];
    const id = productIdInput.value;

    let imageUrl = '';

    if (imageFile) {
        // If a new image is uploaded, upload it to Cloudinary
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
            alert('Image upload failed. Please try again.');
            return;
        }
    }

    const productData = { name, price, section };
    
    if (id) { // UPDATE existing product
        const productDocRef = doc(db, "products", id);
        if (imageUrl) {
             productData.imageUrl = imageUrl; // Only update image if a new one was uploaded
        }
        await updateDoc(productDocRef, productData);
        alert('Product updated successfully!');
    } else { // CREATE new product
        if (!imageUrl) {
            alert('Please select an image for the new product.');
            return;
        }
        productData.imageUrl = imageUrl;
        await addDoc(productsCollectionRef, productData);
        alert('Product added successfully!');
    }

    clearForm();
    renderProducts();
});

// Event delegation for Edit and Delete buttons
tableBody.addEventListener('click', async (e) => {
    const id = e.target.dataset.id;
    if (e.target.classList.contains('edit-btn')) {
        populateFormForEdit(id);
    }
    if (e.target.classList.contains('delete-btn')) {
        if (confirm('Are you sure you want to delete this product?')) {
            await deleteDoc(doc(db, "products", id));
            alert('Product deleted successfully!');
            renderProducts();
        }
    }
});

// Clear form button
clearFormBtn.addEventListener('click', clearForm);

// Initial render
renderProducts();