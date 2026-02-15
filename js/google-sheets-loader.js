// ========================================
// GOOGLE SHEETS DOG DATA LOADER
// Fetches from Google Sheets with fallback
// Works on GitHub Pages & all browsers
// Premium Version with Instant Updates
// ========================================

const GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQzNPaUcCLd30eqGC4yzQwOeRsIbuQPOA6OuLrN8gk29hnFaEYnCBWs3DvolEgRrmxMje5SjGt7tzcn/pub?output=csv';

// localStorage key for admin dogs
const ADMIN_DOGS_KEY = 's2kennel_dogs';

let dogsLoaded = false;

// Fallback dog data (if Google Sheets fails)
const FALLBACK_DOGS = [
    { name: 'Shihtzu', breed: 'Shih Tzu', age: '2 years', price: '₹18,000 to ₹22,000', image: 'images/Shihtzu 1.jpeg', description: 'Small, affectionate companion dog' },
    { name: 'Tibetan Mastiff', breed: 'Mastiff', age: '3 years', price: '₹85,000 to ₹1,00,000', image: 'images/Tibetian mastiff1.jpg.jpeg', description: 'Large protective breed' },
    { name: 'Golden Labrador', breed: 'Labrador', age: '1 year', price: '₹14,000 to ₹18,000', image: 'images/Golden labrador1.jpeg', description: 'Friendly and energetic' },
    { name: 'Pakistani Bully', breed: 'Bully', age: '2 years', price: '₹25,000 to ₹30,000', image: 'images/Pakistani bully1.jpeg', description: 'Strong and loyal' },
    { name: 'Rottweiler', breed: 'Rottweiler', age: '2 years', price: '₹25,000 to ₹35,000', image: 'images/Rottweiller1.jpeg', description: 'Confident guard dog' },
    { name: 'Toy Pom', breed: 'Pomeranian', age: '1 year', price: '₹50,000 to ₹70,000', image: 'images/Toy Pom1.jpeg', description: 'Small fluffy companion' },
    { name: 'Black Labrador (High Quality)', breed: 'Labrador', age: '1.5 years', price: '₹35,000 to ₹45,000', image: 'images/Black labrador 1.jpeg', description: 'Premium quality dog' },
    { name: 'Labrador', breed: 'Labrador', age: '1 year', price: '₹14,000 to ₹18,000', image: 'images/Labrador 1.jpeg', description: 'Popular family dog' },
    { name: 'French Bulldog', breed: 'Bulldog', age: '1.5 years', price: '₹20,000 to ₹25,000', image: 'images/French bulldog .jpeg', description: 'Compact and playful' },
    { name: 'Cane Corso', breed: 'Mastiff', age: '2 years', price: '₹70,000 to ₹1,00,000', image: 'images/Cane corso1.jpeg', description: 'Large and powerful' },
    { name: 'Chow Chow (Cream)', breed: 'Chow Chow', age: '2 years', price: '₹22,000 to ₹30,000', image: 'images/chow chow  1.jpeg', description: 'Fluffy and loyal' },
    { name: 'Golden Retriever', breed: 'Retriever', age: '1.5 years', price: '₹20,000 to ₹35,000', image: 'images/Golden retriever .jpeg', description: 'Intelligent and gentle' },
    { name: 'Chow Chow (Black)', breed: 'Chow Chow', age: '2.5 years', price: '₹35,000 to ₹50,000', image: 'images/chow chow black.jpeg', description: 'Majestic bear-like dog' },
    { name: 'Doberman', breed: 'Doberman', age: '2 years', price: '₹22,000 to ₹35,000', image: 'images/Doberman.jpeg', description: 'Alert and fearless' },
    { name: 'Siberian Husky', breed: 'Husky', age: '1.5 years', price: '₹25,000 to ₹45,000', image: 'images/Siberian husky.jpeg', description: 'Energetic and friendly' },
    { name: 'German Shepherd', breed: 'Shepherd', age: '2 years', price: '₹25,000 to ₹50,000', image: 'images/German shepherd1.jpeg', description: 'Intelligent working dog' },
    { name: 'Pug', breed: 'Pug', age: '1 year', price: '₹12,000 to ₹15,000', image: 'images/pug2.jpeg', description: 'Small and charming' }
];

document.addEventListener('DOMContentLoaded', async function() {
    await loadDogs();
    initializeLiveSync();
});

// ========================================
// LIVE SYNC WITH ADMIN DASHBOARD
// ========================================

function initializeLiveSync() {
    // Method 1: Listen for BroadcastChannel messages (cross-tab)
    try {
        if (BroadcastChannel) {
            const channel = new BroadcastChannel('admin_updates');
            channel.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'dog_update') {
                    console.log('[Dogs Loader] Received BroadcastChannel update:', event.data.action);
                    refreshDogsData();
                }
            });
            console.log('[Dogs Loader] BroadcastChannel sync initialized');
        }
    } catch (e) {
        console.log('[Dogs Loader] BroadcastChannel not supported');
    }

    // Method 2: Listen for localStorage changes (cross-tab)
    window.addEventListener('storage', (event) => {
        if (event.key === 'admin_last_update') {
            try {
                const update = JSON.parse(event.newValue);
                if (update && update.type === 'dog_update') {
                    console.log('[Dogs Loader] Received localStorage update:', update.action);
                    refreshDogsData();
                }
            } catch (e) {
                console.log('[Dogs Loader] Error parsing localStorage update');
            }
        }
    });

    // Method 3: Listen for custom event "dogsUpdated" from admin
    window.addEventListener('dogsUpdated', (event) => {
        console.log('[Dogs Loader] Received dogsUpdated custom event');
        refreshDogsData();
    });

    // Method 4: Listen for custom event "adminDogUpdate" from admin
    window.addEventListener('adminDogUpdate', (event) => {
        console.log('[Dogs Loader] Received adminDogUpdate custom event:', event.detail);
        refreshDogsData();
    });

    console.log('[Dogs Loader] All live sync methods initialized');
}

// Refresh dogs data with cache-busting
function refreshDogsData() {
    console.log('[Dogs Loader] Refreshing dogs data...');
    dogsLoaded = false;
    loadDogs();
}

async function refreshDogsFromGoogleSheets() {
    console.log('[Dogs Loader] Refreshing dogs from Google Sheets');
    refreshDogsData();
}

async function loadDogs() {
    if (dogsLoaded) return;

    const dogsGrid = document.querySelector('.dogs-grid');
    if (!dogsGrid) return;

    try {
        console.log('[Dogs Loader] Attempting to fetch from Google Sheets...');
        let dogs = await fetchFromGoogleSheets();

        if (!dogs || dogs.length === 0) {
            console.log('[Dogs Loader] Google Sheets empty or failed, using fallback data');
            dogs = FALLBACK_DOGS;
        } else {
            console.log('[Dogs Loader] Successfully loaded', dogs.length, 'dogs from Google Sheets');
        }

        // Merge with admin localStorage dogs
        dogs = mergeWithAdminDogs(dogs);

        renderDogs(dogs, dogsGrid);
        dogsLoaded = true;

        if (window.observeElements) {
            observeElements();
        }
    } catch (error) {
        console.log('[Dogs Loader] Google Sheets fetch failed:', error.message);
        console.log('[Dogs Loader] Using fallback hardcoded data');

        // Still try to merge with admin dogs even on fallback
        let dogs = mergeWithAdminDogs(FALLBACK_DOGS);
        renderDogs(dogs, dogsGrid);
        dogsLoaded = true;

        if (window.observeElements) {
            observeElements();
        }
    }
}

// Merge admin localStorage dogs with Google Sheets/fallback data
function mergeWithAdminDogs(googleSheetsDogs) {
    try {
        const adminDogsJson = localStorage.getItem(ADMIN_DOGS_KEY);
        if (!adminDogsJson) return googleSheetsDogs;

        const adminDogs = JSON.parse(adminDogsJson);
        if (!adminDogs || adminDogs.length === 0) return googleSheetsDogs;

        console.log('[Dogs Loader] Merging', adminDogs.length, 'admin dogs with Google Sheets data');

        // Admin dogs are more recent, put them first
        // Then add Google Sheets dogs that are not duplicates
        const allDogs = [...adminDogs];

        googleSheetsDogs.forEach(dog => {
            const isDuplicate = adminDogs.some(adminDog =>
                adminDog.name && dog.name &&
                adminDog.name.toLowerCase() === dog.name.toLowerCase() &&
                adminDog.breed && dog.breed &&
                adminDog.breed.toLowerCase() === dog.breed.toLowerCase()
            );
            if (!isDuplicate) {
                allDogs.push(dog);
            }
        });

        console.log('[Dogs Loader] Total dogs after merge:', allDogs.length);
        return allDogs;
    } catch (e) {
        console.log('[Dogs Loader] Error merging admin dogs:', e.message);
        return googleSheetsDogs;
    }
}

// Fetch from Google Sheets with cache-busting
async function fetchFromGoogleSheets() {
    try {
        // Try direct fetch with cache-busting
        const cacheBuster = '&t=' + Date.now();
        const response = await fetch(GOOGLE_SHEETS_URL + cacheBuster, {
            method: 'GET',
            headers: { 'Accept': 'text/csv' }
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const csvText = await response.text();
        if (!csvText || csvText.length === 0) throw new Error('Empty response');

        return parseCSV(csvText);
    } catch (error) {
        console.log('[Dogs Loader] Direct fetch failed:', error.message);

        // Try with CORS proxy and cache-busting
        try {
            const cacheBuster = '?t=' + Date.now();
            const proxyUrl = 'https://cors.bridged.cc/' + GOOGLE_SHEETS_URL + cacheBuster;
            const response = await fetch(proxyUrl);

            if (response.ok) {
                const csvText = await response.text();
                return parseCSV(csvText);
            }
        } catch (proxyError) {
            console.log('[Dogs Loader] Proxy fetch also failed');
            throw proxyError;
        }
    }
}

function parseCSV(csvText) {
    try {
        const lines = csvText.trim().split('\n').filter(line => line.trim());
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const dogs = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = parseCSVLine(line);
            if (values.length === 0) continue;

            const dog = {};
            headers.forEach((header, index) => {
                dog[header] = values[index] ? values[index].trim() : '';
            });

            if (dog.name && dog.name.length > 0) {
                dogs.push(dog);
            }
        }

        return dogs.length > 0 ? dogs : null;
    } catch (error) {
        console.log('[Dogs Loader] CSV parsing error:', error.message);
        return null;
    }
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    if (current || result.length > 0) {
        result.push(current);
    }

    return result;
}

function renderDogs(dogs, dogsGrid) {
    if (!dogs || dogs.length === 0) {
        dogsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">No dogs available.</p>';
        return;
    }

    dogsGrid.innerHTML = '';

    dogs.forEach(dog => {
        const card = createDogCard(dog);
        dogsGrid.appendChild(card);
    });
}

function createDogCard(dog) {
    const card = document.createElement('div');
    card.className = 'dog-card';

    // Header
    const header = document.createElement('div');
    header.className = 'dog-header';

    const name = document.createElement('h3');
    name.className = 'dog-name';
    name.textContent = dog.name || 'Premium Dog';

    const price = document.createElement('p');
    price.className = 'dog-price';
    price.textContent = dog.price || 'Contact for Price';

    header.appendChild(name);
    header.appendChild(price);

    // Images container
    const imagesContainer = document.createElement('div');
    imagesContainer.className = 'dog-images-container';

    const imageUrl = dog.image || 'images/dog-placeholder.jpg';

    // Image 1
    const wrapper1 = document.createElement('div');
    wrapper1.className = 'dog-image-wrapper';
    const img1 = document.createElement('img');
    img1.className = 'dog-image';
    img1.alt = dog.name || 'Dog';
    img1.src = imageUrl;
    img1.onerror = function() { this.src = 'images/dog-placeholder.jpg'; };
    wrapper1.appendChild(img1);
    imagesContainer.appendChild(wrapper1);

    // Image 2
    const wrapper2 = document.createElement('div');
    wrapper2.className = 'dog-image-wrapper';
    const img2 = document.createElement('img');
    img2.className = 'dog-image';
    img2.alt = dog.name || 'Dog';
    img2.src = imageUrl;
    img2.onerror = function() { this.src = 'images/dog-placeholder.jpg'; };
    wrapper2.appendChild(img2);
    imagesContainer.appendChild(wrapper2);

    // Info section
    const info = document.createElement('div');
    info.className = 'dog-info';

    // Features
    const features = document.createElement('div');
    features.className = 'dog-features';

    const featuresList = [
        dog.breed ? `Breed: ${dog.breed}` : 'Premium',
        dog.age ? `Age: ${dog.age}` : 'Healthy',
        'Vaccinated'
    ];

    featuresList.forEach(feat => {
        const span = document.createElement('span');
        span.className = 'feature';
        span.textContent = feat;
        features.appendChild(span);
    });

    // Enquiry button
    const btn = document.createElement('button');
    btn.className = 'btn btn-whatsapp';
    btn.textContent = '💬 Enquire Now';
    btn.onclick = function() {
        openEnquiryForm(dog.name);
    };

    info.appendChild(features);
    info.appendChild(btn);

    // Assemble
    card.appendChild(header);
    card.appendChild(imagesContainer);
    card.appendChild(info);

    return card;
}