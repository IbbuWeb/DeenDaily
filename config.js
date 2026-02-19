// Deen Daily - Shared Configuration
// This file contains Firebase config and common utilities used across all pages

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAnbSpt2-We658sYnSAZSXYz1WYu-Ioyic",
  authDomain: "deen--daily.firebaseapp.com",
  projectId: "deen--daily",
  storageBucket: "deen--daily.firebasestorage.app",
  messagingSenderId: "189832469044",
  appId: "1:189832469044:web:6e3bebe071cc1acba28861",
  measurementId: "G-Q9YXBD46E4"
};

// Initialize Firebase (returns { app, auth, db } or null if failed)
async function initFirebase() {
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js');
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js');
    const { getFirestore } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
    
    const app = initializeApp(FIREBASE_CONFIG);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    return { app, auth, db };
  } catch (error) {
    console.log('Firebase initialization failed:', error);
    return null;
  }
}

// Show toast notification
function showToast(message, type = 'success') {
  const existingToast = document.getElementById('toast');
  if (!existingToast) return;
  
  const toast = existingToast;
  toast.textContent = message;
  toast.className = 'toast ' + type + ' show';
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Get stored theme
function getTheme() {
  return localStorage.getItem('deen-daily-theme') || 'white';
}

// Apply theme
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('deen-daily-theme', theme);
}

// Update theme UI
function updateThemeUI(theme) {
  document.querySelectorAll('.theme-option').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.theme === theme);
  });
}

// Setup settings panel
function setupSettingsPanel(authInstance) {
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsOverlay = document.getElementById('settingsOverlay');
  const settingsClose = document.getElementById('settingsClose');
  const settingsCityInput = document.getElementById('settingsCityInput');
  const saveLocationBtn = document.getElementById('saveLocationBtn');
  
  if (!settingsBtn || !settingsOverlay) return;
  
  // Open settings
  settingsBtn.addEventListener('click', () => {
    settingsOverlay.classList.add('active');
    if (settingsCityInput) {
      settingsCityInput.value = localStorage.getItem('prayerCity') || 'London';
    }
  });
  
  // Close on overlay click
  settingsOverlay.addEventListener('click', (e) => {
    if (e.target === settingsOverlay) {
      settingsOverlay.classList.remove('active');
    }
  });
  
  // Close button
  if (settingsClose) {
    settingsClose.addEventListener('click', () => {
      settingsOverlay.classList.remove('active');
    });
  }
  
  // Theme options
  document.querySelectorAll('.theme-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const theme = opt.dataset.theme;
      applyTheme(theme);
      updateThemeUI(theme);
    });
  });
  
  // Save location
  if (saveLocationBtn) {
    saveLocationBtn.addEventListener('click', () => {
      const city = settingsCityInput.value.trim();
      if (city) {
        localStorage.setItem('prayerCity', city);
        settingsOverlay.classList.remove('active');
        location.reload();
      }
    });
  }
}

// Setup profile UI
function setupProfileUI(authInstance, updateCallback) {
  const { onAuthStateChanged } = window.firebaseAuth || {};
  
  if (!authInstance || !onAuthStateChanged) return;
  
  onAuthStateChanged(authInstance, (user) => {
    const profileAvatar = document.getElementById('profileAvatar');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (user && user.displayName) {
      if (profileAvatar) profileAvatar.textContent = user.displayName.charAt(0).toUpperCase();
      if (profileName) profileName.textContent = user.displayName;
      if (profileEmail) profileEmail.textContent = user.email || 'Signed in with Google';
      if (loginBtn) loginBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'block';
    } else {
      if (profileAvatar) profileAvatar.textContent = '?';
      if (profileName) profileName.textContent = 'Guest';
      if (profileEmail) profileEmail.textContent = 'Sign in to sync your data';
      if (loginBtn) loginBtn.style.display = 'block';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }
    
    if (updateCallback) updateCallback(user);
  });
}

// Initialize common features
async function initCommon() {
  // Apply theme
  const theme = getTheme();
  applyTheme(theme);
  updateThemeUI(theme);
  
  // Initialize Firebase
  const firebase = await initFirebase();
  
  if (firebase) {
    window.firebaseApp = firebase.app;
    window.firebaseAuth = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js');
    window.firebaseDb = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
    
    setupSettingsPanel(firebase.auth);
    setupProfileUI(firebase.auth);
  }
}

// Export for use in other files
window.DeenDaily = {
  FIREBASE_CONFIG,
  initFirebase,
  showToast,
  getTheme,
  applyTheme,
  updateThemeUI,
  setupSettingsPanel,
  setupProfileUI,
  initCommon
};

// Require authentication - call this on pages that need login
async function requireAuth() {
  document.body.style.display = 'none'; // Hide until auth verified
  
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js');
  const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js');
  
  const app = initializeApp(FIREBASE_CONFIG);
  const auth = getAuth(app);
  
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = 'login.html';
        resolve(null);
        return;
      }
      document.body.style.display = ''; // Show body after auth verified
      resolve(user);
    });
  });
}
