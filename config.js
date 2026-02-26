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
  initCommon,
  // Prayer Notifications
  requestNotificationPermission,
  initPrayerNotifications,
  enablePrayerNotification,
  disablePrayerNotification,
  getNotificationStatus,
  // P2P Sharing
  shareContent,
  shareViaQR,
  parseSharedData
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

// Prayer Notification System
const PRAYER_NAMES = {
  Fajr: 'Fajr',
  Sunrise: 'Sunrise',
  Dhuhr: 'Dhuhr',
  Asr: 'Asr',
  Maghrib: 'Maghrib',
  Isha: 'Isha'
};

async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return { granted: false, reason: 'not_supported' };
  }
  
  if (Notification.permission === 'granted') {
    return { granted: true };
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return { granted: permission === 'granted', reason: permission === 'denied' ? 'denied' : 'default' };
  }
  
  return { granted: false, reason: 'denied' };
}

function schedulePrayerNotification(prayerName, time, city) {
  const notifications = getScheduledNotifications();
  
  if (!notifications[prayerName]) {
    notifications[prayerName] = {
      enabled: true,
      time: time,
      city: city
    };
    saveScheduledNotifications(notifications);
  }
}

function getScheduledNotifications() {
  return JSON.parse(localStorage.getItem('prayerNotifications') || '{}');
}

function saveScheduledNotifications(notifications) {
  localStorage.setItem('prayerNotifications', JSON.stringify(notifications));
}

async function initPrayerNotifications() {
  const result = await requestNotificationPermission();
  
  if (result.granted) {
    localStorage.setItem('notificationPermission', 'granted');
    checkAndNotify();
    setInterval(checkAndNotify, 60000);
  } else {
    localStorage.setItem('notificationPermission', result.reason || 'denied');
  }
  
  return result;
}

function checkAndNotify() {
  const notifications = getScheduledNotifications();
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  
  for (const [prayerName, config] of Object.entries(notifications)) {
    if (config.enabled && config.time === currentTime) {
      showPrayerNotification(prayerName, config.city);
    }
  }
}

function showPrayerNotification(prayerName, city) {
  const cityText = city ? ` in ${city}` : '';
  
  if (Notification.permission === 'granted') {
    const notification = new Notification('Prayer Time', {
      body: `${PRAYER_NAMES[prayerName] || prayerName} time is now${cityText}`,
      icon: 'icons/logo.svg',
      badge: 'icons/logo.svg',
      tag: 'prayer-notification',
      requireInteraction: true
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
  
  if ('vibrate' in navigator) {
    navigator.vibrate([200, 100, 200]);
  }
}

function enablePrayerNotification(prayerName, time, city) {
  const notifications = getScheduledNotifications();
  notifications[prayerName] = {
    enabled: true,
    time: time,
    city: city
  };
  saveScheduledNotifications(notifications);
}

function disablePrayerNotification(prayerName) {
  const notifications = getScheduledNotifications();
  if (notifications[prayerName]) {
    notifications[prayerName].enabled = false;
    saveScheduledNotifications(notifications);
  }
}

function getNotificationStatus() {
  return {
    permission: Notification.permission,
    scheduled: getScheduledNotifications()
  };
}

// P2P Sharing - QR Code Generation
function generateQRCode(text) {
  return new Promise((resolve, reject) => {
    const qrCanvas = document.createElement('canvas');
    
    if (window.QRCode) {
      new QRCode(qrCanvas, {
        text: text,
        width: 200,
        height: 200,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
      setTimeout(() => resolve(qrCanvas.toDataURL()), 100);
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js';
      script.onload = () => {
        QRCode.toCanvas(qrCanvas, text, { width: 200 }, (error) => {
          if (error) reject(error);
          else resolve(qrCanvas.toDataURL());
        });
      };
      script.onerror = reject;
      document.head.appendChild(script);
    }
  });
}

async function shareViaQR(data, type = 'verse') {
  const shareData = {
    type: type,
    data: data,
    app: 'DeenDaily',
    timestamp: Date.now()
  };
  
  const encoded = btoa(encodeURIComponent(JSON.stringify(shareData)));
  const shareUrl = `${window.location.origin}${window.location.pathname}?shared=${encoded}`;
  
  const qrDataUrl = await generateQRCode(shareUrl);
  return { url: shareUrl, qr: qrDataUrl };
}

function parseSharedData(encoded) {
  try {
    const decoded = decodeURIComponent(atob(encoded));
    const data = JSON.parse(decoded);
    
    if (data.app === 'DeenDaily') {
      return data;
    }
  } catch (e) {
    console.error('Failed to parse shared data:', e);
  }
  return null;
}

async function shareContent(data, type = 'verse') {
  const { url, qr } = await shareViaQR(data, type);
  
  return {
    url: url,
    qr: qr,
    copyToClipboard: async () => {
      try {
        await navigator.clipboard.writeText(url);
        return true;
      } catch {
        return false;
      }
    },
    shareViaApi: async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'DeenDaily',
            text: `Shared from DeenDaily: ${data.text || data.dua || ''}`,
            url: url
          });
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  };
}
