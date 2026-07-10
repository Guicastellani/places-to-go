// DOM Elements
const loginModal = document.getElementById("loginModal");
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const logoutBtn = document.getElementById("logoutBtn");
const userDisplay = document.getElementById("userDisplay");

const placeInput = document.getElementById("placeInput");
const dateInput = document.getElementById("dateInput");
const addBtn = document.getElementById("addBtn");
const placesList = document.getElementById("placesList");
const filterBtns = document.querySelectorAll(".filter-btn");
const emptyState = document.getElementById("emptyState");

// State
let places = [];
let currentFilter = "active";
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let isFirebaseReady = false;

// Initialize Firebase Listener
function initFirebaseListener() {
  if (typeof window.firebaseReady === "undefined") {
    console.log("Firebase not ready yet, retrying...");
    setTimeout(initFirebaseListener, 300);
    return;
  }

  window.placesRef = window.database.ref('places');
  window.usersRef = window.database.ref('users');

  window.placesRef.on(
    "value",
    (snapshot) => {
      const data = snapshot.val();
      places = data ? Object.values(data) : [];
      isFirebaseReady = true;
      if (currentUser) {
        render();
      }
    },
    (error) => {
      console.error("Firebase data load error:", error);
      alert("Error loading data. Check your connection or Firebase config.");
    }
  );
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  initFirebaseListener();

  if (currentUser) {
    showApp();
  } else {
    showLogin();
  }
});

// ==================== LOGIN FUNCTIONS ====================

function showLogin() {
  loginModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  loginForm.reset();
  usernameInput.focus();
}

function showApp() {
  loginModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
  userDisplay.textContent = `Olá, ${currentUser}!`;
  render();
  setupEventListeners();
  enableControls();
}

function handleLogin(e) {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    alert("Por favor, preencha todos os campos!");
    return;
  }

  if (!window.usersRef) {
    alert("Conectando ao servidor, tente novamente em instantes.");
    return;
  }

  const loginBtn = loginForm.querySelector("button[type=submit]");
  loginBtn.disabled = true;
  loginBtn.textContent = "Entrando...";

  const bcryptLib = typeof dcodeIO !== "undefined" && typeof dcodeIO === "object"
    ? dcodeIO.bcrypt
    : (typeof bcrypt !== "undefined" ? bcrypt : null);

  if (!bcryptLib) {
    alert("Erro ao carregar biblioteca de segurança. Tente recarregar a página.");
    loginBtn.disabled = false;
    loginBtn.textContent = "Entrar";
    return;
  }

  // Look up the user record in Firebase, then verify with bcrypt
  window.usersRef.child(username).once("value")
    .then((snapshot) => {
      const user = snapshot.val();
      if (!user || !user.passwordHash) {
        throw new Error("not_found");
      }
      return bcryptLib.compare(password, user.passwordHash);
    })
    .then((match) => {
      if (match) {
        currentUser = username;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        showApp();
      } else {
        throw new Error("wrong_password");
      }
    })
    .catch(() => {
      alert("Usuário ou senha incorretos!");
      passwordInput.value = "";
      usernameInput.focus();
    })
    .finally(() => {
      loginBtn.disabled = false;
      loginBtn.textContent = "Entrar";
    });
}

function handleLogout() {
  if (confirm("Tem certeza que quer sair?")) {
    currentUser = null;
    localStorage.removeItem("currentUser");
    disableControls();
    showLogin();
  }
}

loginForm.addEventListener("submit", handleLogin);
logoutBtn.addEventListener("click", handleLogout);

// ==================== CONTROL FUNCTIONS ====================

function disableControls() {
  placeInput.disabled = true;
  dateInput.disabled = true;
  addBtn.disabled = true;
  document.querySelector(".input-section").classList.add("disabled");
  document.querySelector(".filter-section").classList.add("disabled");

  filterBtns.forEach((btn) => {
    btn.disabled = true;
  });
}

function enableControls() {
  placeInput.disabled = false;
  dateInput.disabled = false;
  addBtn.disabled = false;
  document.querySelector(".input-section").classList.remove("disabled");
  document.querySelector(".filter-section").classList.remove("disabled");

  filterBtns.forEach((btn) => {
    btn.disabled = false;
  });
}

function setupEventListeners() {
  addBtn.addEventListener("click", addPlace);
  placeInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addPlace();
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      render();
    });
  });
}

// ==================== PLACE FUNCTIONS ====================

function addPlace() {
  if (!currentUser) {
    alert("Você precisa estar logado para adicionar um lugar!");
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
    createdBy: currentUser,
  };

  places.unshift(place);
  savePlaces();
  render();

  // Clear inputs
  placeInput.value = "";
  dateInput.value = "";
  placeInput.focus();
}

function deletePlace(id) {
  if (!currentUser) {
    alert("Você precisa estar logado para deletar!");
    return;
  }

  if (confirm("Tem certeza que quer deletar este lugar?")) {
    places = places.filter((place) => place.id !== id);
    savePlaces();
    render();
  }
}

function togglePlace(id) {
  if (!currentUser) {
    alert("Você precisa estar logado para marcar como realizado!");
    return;
  }

  const place = places.find((p) => p.id === id);
  if (place) {
    place.completed = !place.completed;
    savePlaces();
    render();
  }
}

function savePlaces() {
  if (!isFirebaseReady || !window.placesRef) {
    console.error("Firebase is not ready");
    return;
  }

  const placesObj = {};
  places.forEach((place, index) => {
    placesObj[place.id || index] = place;
  });

  window.placesRef.set(placesObj).catch((error) => {
    console.error("Error saving to Firebase:", error);
    alert("Error saving. Try again.");
  });
}

function getFilteredPlaces() {
  let filtered = [];

  switch (currentFilter) {
    case "active":
      filtered = places.filter((p) => !p.completed);
      break;
    case "completed":
      filtered = places.filter((p) => p.completed);
      break;
    default:
      filtered = places;
  }

  // Ordenar: primeiro sem data, depois por data crescente
  return filtered.sort((a, b) => {
    // Se não tem data, vem primeiro
    if (!a.date && !b.date) return 0;
    if (!a.date) return -1;
    if (!b.date) return 1;

    // Ambos têm data, ordena da mais próxima para a mais distante
    return new Date(a.date) - new Date(b.date);
  });
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString + "T00:00:00");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function render() {
  const filtered = getFilteredPlaces();

  if (filtered.length === 0) {
    placesList.innerHTML = "";
    emptyState.classList.add("show");
  } else {
    emptyState.classList.remove("show");
    placesList.innerHTML = filtered
      .map((place) => {
        const creatorClass =
          place.createdBy === "Cococo"
            ? "creator-cococo"
            : "creator-capivarinha";
        return `
            <li class="place-item ${
              place.completed ? "completed" : ""
            } ${creatorClass}">
                <input 
                    type="checkbox" 
                    class="checkbox" 
                    ${place.completed ? "checked" : ""}
                    onchange="togglePlace(${place.id})"
                    ${!currentUser ? "disabled" : ""}
                >
                <div class="place-info">
                    <div class="place-name">${escapeHtml(place.name)}</div>
                    ${
                      place.date
                        ? `<div class="place-date">${formatDate(
                            place.date
                          )}</div>`
                        : ""
                    }
                </div>
                <div class="creator-badge">${place.createdBy}</div>
                <button 
                    class="delete-btn" 
                    onclick="deletePlace(${place.id})"
                    ${!currentUser ? "disabled" : ""}
                >
                    Delete
                </button>
            </li>
        `;
      })
      .join("");
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
