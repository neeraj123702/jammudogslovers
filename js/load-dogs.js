// ========================================
// LOAD DOGS FROM FIRESTORE - dogs.html
// ========================================

import {
    db
} from '../firebase-config.js';

import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Wait for DOM to load and then fetch dogs
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Loading dogs from Firestore...');
    await loadDogsFromFirestore();
});

// Load dogs from Firestore
async function loadDogsFromFirestore() {
    const container = document.getElementById('dogsContainer');
    const loadingDiv = document.getElementById('dogsLoading');
    
    try {
        // Query dogs collection
        const q = query(collection(db, 'dogs'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        // Clear loading state
        loadingDiv.remove();
        
        // Check if dogs exist
        if (snapshot.empty) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">No dogs available at the moment. Please check back soon!</p>';
            console.log('No dogs in Firestore');
            return;
        }
        
        // Clear container
        container.innerHTML = '';
        
        // Render each dog
        snapshot.forEach(docSnapshot => {
            const dog = docSnapshot.data();
            const dogCard = createDogCard(dog);
            container.insertAdjacentHTML('beforeend', dogCard);
        });
        
        console.log('Loaded', snapshot.size, 'dogs from Firestore');
        
    } catch (error) {
        console.error('Error loading dogs from Firestore:', error);
        loadingDiv.innerHTML = '<p style="color: red; text-align: center;">Error loading dogs. Please try again later.</p>';
    }
}

// Create a dog card HTML
function createDogCard(dog) {
    const imageUrl = dog.imageURL || 'images/dog1.jpg';
    const fallbackImage = 'images/dog1.jpg';
    
    return `
        <div class="dog-card">
            <div class="dog-header">
                <h3 class="dog-name">${dog.name}</h3>
                <p class="dog-price">₹${dog.price}</p>
            </div>
            <div class="dog-images-container">
                <div class="dog-image-wrapper">
                    <img src="${imageUrl}" alt="${dog.name}" class="dog-image" onerror="this.src='${fallbackImage}'">
                </div>
                <div class="dog-image-wrapper">
                    <img src="${imageUrl}" alt="${dog.name}" class="dog-image" onerror="this.src='${fallbackImage}'">
                </div>
            </div>
            <div class="dog-info">
                <div class="dog-features">
                    <span class="feature">${dog.vaccination || 'Vaccinated'}</span>
                    <span class="feature">Healthy</span>
                    <span class="feature">Premium</span>
                </div>
                <button class="btn btn-whatsapp" onclick="openEnquiryForm('${dog.name}')">💬 Enquire Now</button>
            </div>
        </div>
    `;
}
