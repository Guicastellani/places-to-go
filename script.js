// DOM Elements
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const logoutBtn = document.getElementById('logoutBtn');
const userDisplay = document.getElementById('userDisplay');

const placeInput = document.getElementById('placeInput');
const dateInput = document.getElementById('dateInput');
const addBtn = document.getElementById('addBtn');
const placesList = document.getElementById('placesList');
const filterBtns = document.querySelectorAll('.filter-btn');
const emptyState = document.getElementById('emptyState');

const validUsers = {
    'Cococo': '98fabf9c911e3a39ac527db68a103336b347a316d791f4edfea4574a15c63aec',
    'Capivarinha': '5a5c868f27ca90afd26a36a0dea543d36e89b2797764d868ed54f49e101fc200'
};

// State
let places = [];
let currentFilter = 'active';
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let isFirebaseReady = false;

// Initialize Firebase Listener
function initFirebaseListener() {
    if (typeof window.placesRef === 'undefined') {
        console.log('Firebase not ready yet, retrying...');
        setTimeout(initFirebaseListener, 300);
        return;
    }
    
    window.placesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        places = data ? Object.values(data) : [];
        isFirebaseReady = true;
        if (currentUser) {
            render();
        }
    }, (error) => {
        console.error('Firebase data load error:', error);
        alert('Error loading data. Check your connection or Firebase config.');
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initFirebaseListener();
    
    if (currentUser) {
        showApp();
    } else {
        showLogin();
    }
});

// ==================== LOGIN FUNCTIONS ====================

function showLogin() {
    loginModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    loginForm.reset();
    usernameInput.focus();
}

function showApp() {
    loginModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    userDisplay.textContent = `Olá, ${currentUser}!`;
    render();
    setupEventListeners();
    enableControls();
}

// Função para gerar SHA256 usando SubtleCrypto
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

function handleLogin(e) {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const passwordInput_value = passwordInput.value.trim();

    if (!username || !passwordInput_value) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    // Hash da senha inserida
    sha256(passwordInput_value).then(passwordHash => {
        console.log('Username:', username);
        console.log('Password Hash:', passwordHash);
        console.log('Expected Hash:', validUsers[username]);

        // Validar credenciais
        if (validUsers[username] && validUsers[username] === passwordHash) {
            currentUser = username;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showApp();
        } else {
            alert('Usuário ou senha incorretos!');
            passwordInput.value = '';
            usernameInput.focus();
        }
    });
}

function handleLogout() {
    if (confirm('Tem certeza que quer sair?')) {
        currentUser = null;
        localStorage.removeItem('currentUser');
        disableControls();
        showLogin();
    }
}

loginForm.addEventListener('submit', handleLogin);
logoutBtn.addEventListener('click', handleLogout);

// ==================== CONTROL FUNCTIONS ====================

function disableControls() {
    placeInput.disabled = true;
    dateInput.disabled = true;
    addBtn.disabled = true;
    document.querySelector('.input-section').classList.add('disabled');
    document.querySelector('.filter-section').classList.add('disabled');
    
    filterBtns.forEach(btn => {
        btn.disabled = true;
    });
}

function enableControls() {
    placeInput.disabled = false;
    dateInput.disabled = false;
    addBtn.disabled = false;
    document.querySelector('.input-section').classList.remove('disabled');
    document.querySelector('.filter-section').classList.remove('disabled');
    
    filterBtns.forEach(btn => {
        btn.disabled = false;
    });
}

function setupEventListeners() {
    addBtn.addEventListener('click', addPlace);
    placeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addPlace();
    });
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            render();
        });
    });
}

// ==================== PLACE FUNCTIONS ====================

function addPlace() {
    if (!currentUser) {
        alert('Você precisa estar logado para adicionar um lugar!');
        return;
    }

    const name = placeInput.value.trim();
    const date = dateInput.value;

    if (!name) {
        placeInput.focus();
        return;
    }

    const place = {
        id: Date.now(),
        name,
        date: date || null,
        completed: false,
        createdBy: currentUser
    };

    places.unshift(place);
    savePlaces();
    render();
    
    // Clear inputs
    placeInput.value = '';
    dateInput.value = '';
    placeInput.focus();
}

function deletePlace(id) {
    if (!currentUser) {
        alert('Você precisa estar logado para deletar!');
        return;
    }

    if (confirm('Tem certeza que quer deletar este lugar?')) {
        places = places.filter(place => place.id !== id);
        savePlaces();
        render();
    }
}

function togglePlace(id) {
    if (!currentUser) {
        alert('Você precisa estar logado para marcar como realizado!');
        return;
    }

    const place = places.find(p => p.id === id);
    if (place) {
        place.completed = !place.completed;
        savePlaces();
        render();
    }
}

function savePlaces() {
    if (!isFirebaseReady || !window.placesRef) {
        console.error('Firebase is not ready');
        return;
    }
    
    const placesObj = {};
    places.forEach((place, index) => {
        placesObj[place.id || index] = place;
    });
    
    window.placesRef.set(placesObj).catch((error) => {
        console.error('Error saving to Firebase:', error);
        alert('Error saving. Try again.');
    });
}

function getFilteredPlaces() {
    switch (currentFilter) {
        case 'active':
            return places.filter(p => !p.completed);
        case 'completed':
            return places.filter(p => p.completed);
        default:
            return places;
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function render() {
    const filtered = getFilteredPlaces();
    
    if (filtered.length === 0) {
        placesList.innerHTML = '';
        emptyState.classList.add('show');
    } else {
        emptyState.classList.remove('show');
        placesList.innerHTML = filtered.map(place => {
            const creatorClass = place.createdBy === 'Cococo' ? 'creator-cococo' : 'creator-capivarinha';
            return `
            <li class="place-item ${place.completed ? 'completed' : ''} ${creatorClass}">
                <input 
                    type="checkbox" 
                    class="checkbox" 
                    ${place.completed ? 'checked' : ''}
                    onchange="togglePlace(${place.id})"
                    ${!currentUser ? 'disabled' : ''}
                >
                <div class="place-info">
                    <div class="place-name">${escapeHtml(place.name)}</div>
                    ${place.date ? `<div class="place-date">${formatDate(place.date)}</div>` : ''}
                </div>
                <div class="creator-badge">${place.createdBy}</div>
                <button 
                    class="delete-btn" 
                    onclick="deletePlace(${place.id})"
                    ${!currentUser ? 'disabled' : ''}
                >
                    Delete
                </button>
            </li>
        `;
        }).join('');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
