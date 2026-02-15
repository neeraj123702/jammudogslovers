// ========================================
// S2 KENNEL JAMMU - ADMIN PANEL (SIMPLE)
// Hardcoded Login + Google Sheets Integration
// ========================================

// Hardcoded Credentials
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

const GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQzNPaUcCLd30eqGC4yzQwOeRsIbuQPOA6OuLrN8gk29hnFaEYnCBWs3DvolEgRrmxMje5SjGt7tzcn/pub?output=csv';

// Session Management
let isLoggedIn = false;
let sessionUsername = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Admin] Initializing...');
    
    // Check if user is already logged in
    const savedSession = sessionStorage.getItem('adminSession');
    if (savedSession) {
        isLoggedIn = true;
        sessionUsername = savedSession;
        showDashboard();
        loadDashboardData();
    } else {
        showLogin();
    }
});

// ========================================
// AUTHENTICATION FUNCTIONS
// ========================================

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    const submitBtn = document.getElementById('loginBtn');
    
    // Clear previous errors
    errorDiv.innerHTML = '';
    
    // Validate credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Login successful
        console.log('[Admin] Login successful');
        isLoggedIn = true;
        sessionUsername = username;
        
        // Save session
        sessionStorage.setItem('adminSession', username);
        
        // Show toast and dashboard
        showToast('Login successful!', 'success');
        showDashboard();
        loadDashboardData();
        
        // Clear form
        document.getElementById('loginForm').reset();
    } else {
        // Login failed
        console.log('[Admin] Login failed');
        errorDiv.innerHTML = '❌ Invalid username or password';
        errorDiv.style.display = 'block';
        
        // Reset button
        submitBtn.disabled = false;
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        console.log('[Admin] Logging out...');
        isLoggedIn = false;
        sessionUsername = null;
        
        // Clear session
        sessionStorage.removeItem('adminSession');
        
        // Show login page
        showToast('Logged out successfully', 'success');
        showLogin();
    }
}

function showLogin() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('dashboardPage').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'block';
    document.getElementById('adminUser').textContent = sessionUsername || 'Admin';
}

// ========================================
// NAVIGATION
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
    
    // Load data if navigating to dogs section
    if (sectionId === 'dogs') {
        loadDogsFromGoogleSheets();
    }
}

// ========================================
// DASHBOARD DATA
// ========================================

async function loadDashboardData() {
    try {
        const dogs = await fetchDogsFromGoogleSheets();
        if (dogs && dogs.length > 0) {
            document.getElementById('totalDogs').textContent = dogs.length;
        }
    } catch (error) {
        console.log('[Admin] Error loading dashboard data:', error);
    }
}

// ========================================
// GOOGLE SHEETS INTEGRATION
// ========================================

async function fetchDogsFromGoogleSheets() {
    try {
        console.log('[Admin] Fetching dogs from Google Sheets...');
        
        // Try direct fetch
        const response = await fetch(GOOGLE_SHEETS_URL, {
            method: 'GET',
            headers: { 'Accept': 'text/csv' }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const csvText = await response.text();
        if (!csvText || csvText.length === 0) throw new Error('Empty response');
        
        const dogs = parseCSV(csvText);
        console.log('[Admin] Successfully loaded', dogs.length, 'dogs');
        return dogs;
    } catch (error) {
        console.log('[Admin] Direct fetch failed:', error.message);
        
        // Try with CORS proxy
        try {
            const proxyUrl = 'https://cors.bridged.cc/' + GOOGLE_SHEETS_URL;
            const response = await fetch(proxyUrl);
            
            if (response.ok) {
                const csvText = await response.text();
                const dogs = parseCSV(csvText);
                console.log('[Admin] Proxy fetch successful');
                return dogs;
            }
        } catch (proxyError) {
            console.log('[Admin] Proxy fetch also failed');
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

        return dogs;
    } catch (error) {
        console.log('[Admin] CSV parsing error:', error.message);
        return [];
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

async function loadDogsFromGoogleSheets() {
    const tbody = document.getElementById('dogsTableBody');
    const messageDiv = document.getElementById('dogsTableMessage');
    
    try {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;"><span class="loading">Loading dogs data...</span></td></tr>';
        messageDiv.innerHTML = '';
        
        const dogs = await fetchDogsFromGoogleSheets();
        
        if (!dogs || dogs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: var(--text-muted);">No dogs available</td></tr>';
            return;
        }
        
        // Populate table
        tbody.innerHTML = '';
        dogs.forEach((dog, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><strong>${dog.name || '-'}</strong></td>
                <td>${dog.breed || '-'}</td>
                <td>${dog.age || '-'}</td>
                <td>${dog.price || '-'}</td>
                <td>${dog.image ? '<a href="' + dog.image + '" target="_blank" style="color: var(--primary);">View</a>' : '-'}</td>
                <td style="max-width: 300px;">${dog.description || '-'}</td>
            `;
            tbody.appendChild(row);
        });
        
        messageDiv.innerHTML = `<p style="color: var(--success);">✓ Loaded ${dogs.length} dogs from Google Sheets</p>`;
        
    } catch (error) {
        console.error('[Admin] Error loading dogs:', error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: var(--error);">Error loading dogs data</td></tr>';
        messageDiv.innerHTML = `<p style="color: var(--error);">✗ Failed to load dogs: ${error.message}</p>`;
    }
}

// ========================================
// UI UTILITIES
// ========================================

function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--info)'};
        color: white;
        border-radius: var(--radius);
        z-index: 9999;
        animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add toast animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            transform: translateY(100px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideDown {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(100px);
            opacity: 0;
        }
    }
    
    .loading {
        color: var(--primary);
        font-weight: 600;
    }
`;
document.head.appendChild(style);
