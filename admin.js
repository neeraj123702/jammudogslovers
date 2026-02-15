// ========================================
// S2 KENNEL JAMMU - ADMIN PANEL JAVASCRIPT
// Pure JavaScript with localStorage (No Firebase)
// Premium Version with Fixed Password System
// ========================================

// ========================================
// CONFIGURATION
// ========================================

// Default credentials (only used for first-time setup)
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin123';

// Google Sheets URL for reading
const GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQzNPaUcCLd30eqGC4yzQwOeRsIbuQPOA6OuLrN8gk29hnFaEYnCBWs3DvolEgRrmxMje5SjGt7tzcn/pub?output=csv';

// Googl  e Apps Script Web App URL
const APPS_SCRIPT_URL = '';

// localStorage keys
const STORAGE_KEYS = {
    USERNAME: 's2kennel_admin_username',
    PASSWORD: 's2kennel_admin_password',
    DOGS: 's2kennel_dogs',
    SESSION: 's2kennel_session'
};

// ========================================
// INITIALIZE CREDENTIALS ON FIRST LOAD
// ========================================

function initializeCredentials() {
    // Initialize password in localStorage if not exists (first-time setup)
    if (!localStorage.getItem(STORAGE_KEYS.PASSWORD)) {
        localStorage.setItem(STORAGE_KEYS.PASSWORD, DEFAULT_PASSWORD);
        console.log('[Admin] Default password initialized in localStorage');
    }

    // Initialize username if not exists
    if (!localStorage.getItem(STORAGE_KEYS.USERNAME)) {
        localStorage.setItem(STORAGE_KEYS.USERNAME, DEFAULT_USERNAME);
    }
}

// ========================================
// INITIALIZE ON PAGE LOAD
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin panel loading...');
    initializeCredentials();
    checkAuth();
});

// ========================================
// AUTHENTICATION FUNCTIONS
// ========================================

function checkAuth() {
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (session) {
        const sessionData = JSON.parse(session);
        if (sessionData.authenticated) {
            showDashboard();
            loadDashboardData();
            return;
        }
    }
    showLogin();
}

function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    const submitBtn = document.getElementById('loginBtn');

    // Show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Logging in...';
    errorDiv.innerHTML = '';

    // Get stored credentials (always from localStorage now)
    const storedUsername = localStorage.getItem(STORAGE_KEYS.USERNAME) || DEFAULT_USERNAME;
    const storedPassword = localStorage.getItem(STORAGE_KEYS.PASSWORD) || DEFAULT_PASSWORD;

    // Validate credentials
    setTimeout(() => {
        if (username === storedUsername && password === storedPassword) {
            // Login successful
            const session = {
                authenticated: true,
                username: username,
                loginTime: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));

            console.log('Login successful');
            showToast('Login successful!', 'success');
            showDashboard();
            loadDashboardData();
        } else {
            // Login failed
            let errorMessage = 'Invalid username or password.';
            errorDiv.innerHTML = errorMessage;
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Login';
        }
    }, 500);
}

function handleLogout() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    console.log('Logout successful');
    showToast('Logged out successfully', 'success');
    showLogin();
}

function showLogin() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('dashboardPage').style.display = 'none';
    document.getElementById('loginForm').reset();
    document.getElementById('loginError').innerHTML = '';
    document.getElementById('loginBtn').disabled = false;
    document.getElementById('loginBtn').innerHTML = 'Login';
}

function showDashboard() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'block';

    const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || '{}');
    const username = session.username || 'Admin';
    document.getElementById('adminUsername').textContent = username;
}

// ========================================
// CHANGE PASSWORD - FIXED
// ========================================

function handleChangePassword(event) {
    event.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Get stored password - ALWAYS from localStorage
    const storedPassword = localStorage.getItem(STORAGE_KEYS.PASSWORD);

    console.log('[Password Change] Stored password:', storedPassword);
    console.log('[Password Change] Current password entered:', currentPassword);

    // Validate current password
    if (currentPassword !== storedPassword) {
        showToast('Current password is incorrect', 'error');
        return;
    }

    // Validate new password match
    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }

    // Validate password length
    if (newPassword.length < 4) {
        showToast('Password must be at least 4 characters', 'error');
        return;
    }

    // Save new password to localStorage IMMEDIATELY
    localStorage.setItem(STORAGE_KEYS.PASSWORD, newPassword);

    console.log('[Password Change] New password saved:', newPassword);

    showToast('Password changed successfully! Use new password on next login.', 'success');

    // Reset form
    document.getElementById('changePasswordForm').reset();
}

// ========================================
// DASHBOARD NAVIGATION
// ========================================

function navigateToSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => section.classList.remove('active'));

    // Remove active from nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }

    // Mark nav item as active
    const navItem = document.querySelector(`[data-section="${sectionId}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }

    // Load data based on section
    if (sectionId === 'manageDogs') {
        loadManageDogs();
    } else if (sectionId === 'dashboard') {
        loadDashboardData();
    } else if (sectionId === 'analytics') {
        loadAnalytics();
    }
}

// ========================================
// ANIMATED COUNTER
// ========================================

function animateCounter(elementId, targetValue, prefix = '', suffix = '', duration = 1000) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const startValue = 0;
    const startTime = performance.now();

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);

        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOut);

        if (suffix) {
            element.textContent = prefix + currentValue.toLocaleString('en-IN') + suffix;
        } else {
            element.textContent = prefix + currentValue;
        }

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }

    requestAnimationFrame(updateCounter);
}

// ========================================
// LOAD DASHBOARD DATA
// ========================================

async function loadDashboardData() {
    try {
        const dogs = getDogsFromStorage();

        // Calculate stats
        const totalDogs = dogs.length;
        const availableDogs = dogs.filter(d => d.status === 'Available').length;
        const soldDogs = dogs.filter(d => d.status === 'Sold').length;

        // Calculate average price
        let avgPrice = 0;
        if (dogs.length > 0) {
            const prices = dogs.map(d => parsePrice(d.price));
            const validPrices = prices.filter(p => !isNaN(p) && p > 0);
            if (validPrices.length > 0) {
                avgPrice = validPrices.reduce((a, b) => a + b, 0) / validPrices.length;
            }
        }

        // Animate counters
        animateCounter('totalDogs', totalDogs);
        animateCounter('availableDogs', availableDogs);
        animateCounter('soldDogs', soldDogs);
        animateCounter('avgPrice', Math.round(avgPrice), '₹', '', 1500);

        // Load last added dog
        loadLastAddedDog(dogs);

        console.log('Dashboard loaded:', totalDogs, 'dogs');
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// ========================================
// LAST ADDED DOG
// ========================================

function loadLastAddedDog(dogs) {
    const lastDogCard = document.getElementById('lastAddedDog');
    if (!lastDogCard) return;

    if (dogs.length === 0) {
        lastDogCard.innerHTML = `
            <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                    <path d="M4.5 12c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5-3.5-1.57-3.5-3.5zm7 0c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5-3.5-1.57-3.5-3.5zm-7-7c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5-3.5-1.57-3.5-3.5zm7 0c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5-3.5-1.57-3.5-3.5z"/>
                </svg>
            </div>
            <div class="stat-info">
                <p style="color: var(--text-muted); font-size: 13px;">No dogs added yet</p>
            </div>
        `;
        return;
    }

    // Get the most recently added dog
    const lastDog = dogs[0];
    const price = parsePrice(lastDog.price);

    lastDogCard.innerHTML = `
        <div class="stat-icon" style="background: rgba(212, 175, 55, 0.15); color: var(--primary);">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                <path d="M4.5 12c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5-3.5-1.57-3.5-3.5zm7 0c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5-3.5-1.57-3.5-3.5zm-7-7c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5-3.5-1.57-3.5-3.5zm7 0c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5-3.5-1.57-3.5-3.5z"/>
            </svg>
        </div>
        <div class="stat-info">
            <h3 style="font-size: 16px; color: var(--primary);">${lastDog.name}</h3>
            <p style="font-size: 12px; color: var(--text-light);">${lastDog.breed} • ₹${price.toLocaleString('en-IN')}</p>
        </div>
    `;
}

function parsePrice(priceStr) {
    if (!priceStr) return 0;
    const cleaned = priceStr.replace(/[₹,\s]/g, '').trim();
    return parseFloat(cleaned) || 0;
}

// ========================================
// ANALYTICS SECTION
// ========================================

function loadAnalytics() {
    const dogs = getDogsFromStorage();

    // Calculate analytics
    const totalRevenue = dogs
        .filter(d => d.status === 'Sold')
        .reduce((sum, d) => sum + parsePrice(d.price), 0);

    const availableDogs = dogs.filter(d => d.status === 'Available').length;
    const soldDogs = dogs.filter(d => d.status === 'Sold').length;

    // Breed distribution
    const breedCount = {};
    dogs.forEach(dog => {
        const breed = dog.breed || 'Unknown';
        breedCount[breed] = (breedCount[breed] || 0) + 1;
    });

    // Sort breeds by count
    const topBreeds = Object.entries(breedCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Monthly additions (based on createdAt)
    const monthlyCount = {};
    dogs.forEach(dog => {
        if (dog.createdAt) {
            const date = new Date(dog.createdAt);
            const month = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
            monthlyCount[month] = (monthlyCount[month] || 0) + 1;
        }
    });

    // Update analytics UI
    const analyticsContainer = document.getElementById('analyticsContent');
    if (!analyticsContainer) return;

    let breedBars = topBreeds.map(([breed, count]) => {
        const percentage = dogs.length > 0 ? (count / dogs.length * 100) : 0;
        return `
            <div class="analytics-breed-item">
                <div class="analytics-breed-label">
                    <span>${breed}</span>
                    <span>${count} (${percentage.toFixed(1)}%)</span>
                </div>
                <div class="analytics-breed-bar">
                    <div class="analytics-breed-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');

    if (topBreeds.length === 0) {
        breedBars = '<p style="color: var(--text-muted);">No breed data available</p>';
    }

    let monthlyBars = Object.entries(monthlyCount)
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .slice(-6)
        .map(([month, count]) => {
            const maxCount = Math.max(...Object.values(monthlyCount));
            const percentage = maxCount > 0 ? (count / maxCount * 100) : 0;
            return `
                <div class="analytics-month-item">
                    <div class="analytics-month-bar">
                        <div class="analytics-month-fill" style="height: ${percentage}%"></div>
                    </div>
                    <div class="analytics-month-label">${month}</div>
                    <div class="analytics-month-value">${count}</div>
                </div>
            `;
        }).join('');

    if (Object.keys(monthlyCount).length === 0) {
        monthlyBars = '<p style="color: var(--text-muted);">No monthly data available</p>';
    }

    analyticsContainer.innerHTML = `
        <div class="analytics-grid">
            <div class="analytics-card">
                <h3>💰 Total Revenue (Sold)</h3>
                <p class="analytics-value">₹${totalRevenue.toLocaleString('en-IN')}</p>
            </div>
            <div class="analytics-card">
                <h3>📊 Available</h3>
                <p class="analytics-value">${availableDogs}</p>
            </div>
            <div class="analytics-card">
                <h3>✅ Sold</h3>
                <p class="analytics-value">${soldDogs}</p>
            </div>
            <div class="analytics-card">
                <h3>🐕 Total Dogs</h3>
                <p class="analytics-value">${dogs.length}</p>
            </div>
        </div>
        
        <div class="analytics-charts">
            <div class="analytics-chart">
                <h3>Top Breeds</h3>
                <div class="analytics-breeds">${breedBars}</div>
            </div>
            <div class="analytics-chart">
                <h3>Monthly Additions</h3>
                <div class="analytics-months">${monthlyBars}</div>
            </div>
        </div>
    `;
}

// ========================================
// DOGS MANAGEMENT - localStorage
// ========================================

function getDogsFromStorage() {
    const dogsJson = localStorage.getItem(STORAGE_KEYS.DOGS);
    return dogsJson ? JSON.parse(dogsJson) : [];
}

function saveDogsToStorage(dogs) {
    localStorage.setItem(STORAGE_KEYS.DOGS, JSON.stringify(dogs));
    notifyDogsPage('dog_update');
}

function generateDogId() {
    return 'dog_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ========================================
// ADD DOG FUNCTION
// ========================================

async function handleAddDog(event) {
    event.preventDefault();

    const name = document.getElementById('dogName').value.trim();
    const breed = document.getElementById('dogBreed').value.trim();
    const age = document.getElementById('dogAge').value.trim();
    const gender = document.getElementById('dogGender').value;
    const price = document.getElementById('dogPrice').value.trim();
    const status = document.getElementById('dogStatus').value;
    const image = document.getElementById('dogImage').value.trim();
    const description = document.getElementById('dogDescription').value.trim();

    if (!name || !breed || !age || !price) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Adding Dog...';

    try {
        const dog = {
            id: generateDogId(),
            name: name,
            breed: breed,
            age: age,
            gender: gender,
            price: price,
            status: status,
            image: image,
            description: description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const dogs = getDogsFromStorage();

        // Check for duplicates
        const isDuplicate = dogs.some(d =>
            d.name.toLowerCase() === dog.name.toLowerCase() &&
            d.breed.toLowerCase() === dog.breed.toLowerCase()
        );

        if (isDuplicate) {
            showToast('This dog already exists!', 'warning');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Add Dog';
            return;
        }

        dogs.unshift(dog);
        saveDogsToStorage(dogs);

        await syncDogToGoogleSheets(dog, 'add');

        console.log('Dog added:', dog.name);
        showToast(`${dog.name} added successfully!`, 'success');

        document.getElementById('addDogForm').reset();
        loadDashboardData();

        // Also refresh the dogs page
        notifyDogsPage('dog_added');

    } catch (error) {
        console.error('Error adding dog:', error);
        showToast('Error adding dog: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Add Dog';
    }
}

// ========================================
// GOOGLE SHEETS SYNC
// ========================================

async function syncDogToGoogleSheets(dog, action) {
    if (!APPS_SCRIPT_URL) {
        console.log('Google Apps Script not configured. Dog saved locally only.');
        return;
    }

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: action, dog: dog })
        });

        if (response.ok) {
            console.log('Synced with Google Sheets:', action);
        }
    } catch (error) {
        console.error('Google Sheets sync error:', error);
    }
}

// ========================================
// MANAGE DOGS - LOAD AND DISPLAY
// ========================================

function loadManageDogs() {
    const tbody = document.getElementById('dogsTableBody');
    const dogs = getDogsFromStorage();

    if (dogs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center" style="padding: 40px;">
                    No dogs found. <a href="#" onclick="navigateToSection('addDog'); return false;" style="color: var(--primary);">Add a dog</a> to get started.
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    dogs.forEach(dog => {
        const price = dog.price || 'N/A';
        const statusClass = dog.status === 'Available' ? 'status-available' : 'status-sold';

        html += `
            <tr>
                <td><strong>${dog.name}</strong></td>
                <td>${dog.breed}</td>
                <td>${dog.age}</td>
                <td>₹${parsePrice(price).toLocaleString('en-IN')}</td>
                <td><span class="status-badge ${statusClass}">${dog.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="openEditDogModal('${dog.id}')">✏️ Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteDog('${dog.id}')">🗑️ Delete</button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// ========================================
// EDIT DOG MODAL
// ========================================

function openEditDogModal(dogId) {
    const dogs = getDogsFromStorage();
    const dog = dogs.find(d => d.id === dogId);

    if (!dog) {
        showToast('Dog not found', 'error');
        return;
    }

    document.getElementById('editDogId').value = dog.id;
    document.getElementById('editDogName').value = dog.name || '';
    document.getElementById('editDogBreed').value = dog.breed || '';
    document.getElementById('editDogAge').value = dog.age || '';
    document.getElementById('editDogGender').value = dog.gender || 'Male';
    document.getElementById('editDogPrice').value = dog.price || '';
    document.getElementById('editDogStatus').value = dog.status || 'Available';
    document.getElementById('editDogImage').value = dog.image || '';
    document.getElementById('editDogDescription').value = dog.description || '';

    document.getElementById('editDogModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editDogModal').style.display = 'none';
}

function handleEditDog(event) {
    event.preventDefault();

    const dogId = document.getElementById('editDogId').value;
    const name = document.getElementById('editDogName').value.trim();
    const breed = document.getElementById('editDogBreed').value.trim();
    const age = document.getElementById('editDogAge').value.trim();
    const gender = document.getElementById('editDogGender').value;
    const price = document.getElementById('editDogPrice').value.trim();
    const status = document.getElementById('editDogStatus').value;
    const image = document.getElementById('editDogImage').value.trim();
    const description = document.getElementById('editDogDescription').value.trim();

    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Saving...';

    try {
        const dogs = getDogsFromStorage();
        const index = dogs.findIndex(d => d.id === dogId);

        if (index === -1) {
            throw new Error('Dog not found');
        }

        dogs[index] = {
            ...dogs[index],
            name: name,
            breed: breed,
            age: age,
            gender: gender,
            price: price,
            status: status,
            image: image,
            description: description,
            updatedAt: new Date().toISOString()
        };

        saveDogsToStorage(dogs);
        syncDogToGoogleSheets(dogs[index], 'update');

        console.log('Dog updated:', dogId);
        showToast('Dog updated successfully!', 'success');
        closeEditModal();
        loadManageDogs();
        loadDashboardData();
        notifyDogsPage('dog_updated');

    } catch (error) {
        console.error('Error updating dog:', error);
        showToast('Error updating dog: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Save Changes';
    }
}

function deleteDog(dogId) {
    if (!confirm('Are you sure you want to delete this dog?')) {
        return;
    }

    try {
        let dogs = getDogsFromStorage();
        const dogToDelete = dogs.find(d => d.id === dogId);

        dogs = dogs.filter(d => d.id !== dogId);
        saveDogsToStorage(dogs);

        if (dogToDelete) {
            syncDogToGoogleSheets(dogToDelete, 'delete');
        }

        console.log('Dog deleted:', dogId);
        showToast('Dog deleted successfully!', 'success');
        loadManageDogs();
        loadDashboardData();
        notifyDogsPage('dog_deleted');
    } catch (error) {
        console.error('Error deleting dog:', error);
        showToast('Error deleting dog: ' + error.message, 'error');
    }
}

// ========================================
// NOTIFY DOGS PAGE OF UPDATES
// ========================================

function notifyDogsPage(action) {
    try {
        // Method 1: BroadcastChannel (works across tabs)
        if (BroadcastChannel) {
            const channel = new BroadcastChannel('admin_updates');
            channel.postMessage({
                type: 'dog_update',
                action: action,
                timestamp: Date.now()
            });
            console.log('[Admin] BroadcastChannel notification sent');
        }

        // Method 2: localStorage
        localStorage.setItem('admin_last_update', JSON.stringify({
            type: 'dog_update',
            action: action,
            timestamp: Date.now()
        }));

        // Method 3: Dispatch custom event
        window.dispatchEvent(new CustomEvent('adminDogUpdate', {
            detail: { type: 'dog_update', action: action }
        }));

    } catch (error) {
        console.error('Error notifying dogs page:', error);
    }
}

// ========================================
// TOAST NOTIFICATIONS
// ========================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = '';
    if (type === 'success') icon = '✅ ';
    else if (type === 'error') icon = '❌ ';
    else if (type === 'warning') icon = '⚠️ ';
    else icon = 'ℹ️ ';

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ========================================
// MODAL CLOSE
// ========================================

window.addEventListener('click', function(event) {
    const modal = document.getElementById('editDogModal');
    if (event.target === modal) {
        closeEditModal();
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeEditModal();
    }
});