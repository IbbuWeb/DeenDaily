// Import Firebase functions
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAnbSpt2-We658sYnSAZSXYz1WYu-Ioyic",
  authDomain: "deen--daily.firebaseapp.com",
  projectId: "deen--daily",
  storageBucket: "deen--daily.firebasestorage.app",
  messagingSenderId: "189832469044",
  appId: "1:189832469044:web:6e3bebe071cc1acba28861",
  measurementId: "G-Q9YXBD46E4"
};

// State
let app, auth, db;
let currentUser = null;
let currentTab = 'duas';
let unsubscribeDuas = null;
let unsubscribeAyahs = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Listen for auth changes
    onAuthStateChanged(auth, async (user) => {
      currentUser = user;
      
      if (user) {
        // User is logged in
        document.getElementById('notLoggedIn').style.display = 'none';
        document.getElementById('loading').style.display = 'block';
        loadSavedItems(currentTab);
      } else {
        // User is not logged in
        document.getElementById('loading').style.display = 'none';
        document.getElementById('savedList').innerHTML = '';
        document.getElementById('notLoggedIn').style.display = 'block';
        document.getElementById('emptyState').style.display = 'none';
      }
    });
  } catch (error) {
    console.log('Firebase not configured');
    document.getElementById('loading').style.display = 'none';
    document.getElementById('notLoggedIn').style.display = 'block';
    document.getElementById('notLoggedIn').innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <h3>Firebase not configured</h3>
      <p>Please configure Firebase to use the favorites feature.</p>
      <a href="login.html" class="btn btn-primary" style="margin-top: 16px;">Go to Login</a>
    `;
  }
  
  // Setup tab switching
  setupTabs();
});

function setupTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active state
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update current tab
      currentTab = tab.dataset.tab;
      
      // Load items for this tab
      if (currentUser) {
        loadSavedItems(currentTab);
      }
    });
  });
}

async function loadSavedItems(type) {
  const savedList = document.getElementById('savedList');
  const loading = document.getElementById('loading');
  const emptyState = document.getElementById('emptyState');
  
  loading.style.display = 'block';
  emptyState.style.display = 'none';
  savedList.innerHTML = '';
  
  // Unsubscribe from previous listeners
  if (unsubscribeDuas) {
    unsubscribeDuas();
    unsubscribeDuas = null;
  }
  if (unsubscribeAyahs) {
    unsubscribeAyahs();
    unsubscribeAyahs = null;
  }
  
  if (!currentUser) {
    loading.style.display = 'none';
    document.getElementById('notLoggedIn').style.display = 'block';
    return;
  }
  
  const collectionName = type === 'duas' ? 'saved_duas' : 'saved_ayahs';
  
  try {
    // Real-time listener
    const q = query(collection(db, collectionName), where('userId', '==', currentUser.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      loading.style.display = 'none';
      
      if (snapshot.empty) {
        emptyState.style.display = 'block';
        savedList.innerHTML = '';
        return;
      }
      
      emptyState.style.display = 'none';
      
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by saved date (newest first)
      items.sort((a, b) => {
        const dateA = a.savedAt?.toDate?.() || new Date(a.savedAt);
        const dateB = b.savedAt?.toDate?.() || new Date(b.savedAt);
        return dateB - dateA;
      });
      
      renderSavedItems(items, type);
    });
    
    // Store unsubscribe function
    if (type === 'duas') {
      unsubscribeDuas = unsubscribe;
    } else {
      unsubscribeAyahs = unsubscribe;
    }
    
  } catch (error) {
    console.error('Error loading saved items:', error);
    loading.innerHTML = `
      <p style="color: var(--text-muted);">Unable to load saved items. Please check your internet connection.</p>
    `;
  }
}

function renderSavedItems(items, type) {
  const savedList = document.getElementById('savedList');
  
  savedList.innerHTML = items.map(item => {
    if (type === 'duas') {
      return `
        <div class="card">
          <span class="category-badge">${item.category || 'Dua'}</span>
          <div class="arabic" style="font-family: 'Noto Naskh Arabic', serif; font-size: 1.4rem; direction: rtl; text-align: right; color: var(--deep-green); margin: 12px 0;">${item.arabic}</div>
          <div class="english" style="margin-bottom: 8px;">${item.english}</div>
          <div class="urdu" style="font-family: 'Noto Sans Urdu', sans-serif; direction: rtl; text-align: right; color: var(--text-muted); margin-bottom: 12px;">${item.urdu}</div>
          <div class="source" style="font-size: 0.75rem; color: var(--gold); margin-bottom: 12px;">${item.source}</div>
          <div class="dua-footer">
            <button class="delete-btn" onclick="deleteItem('saved_duas', '${item.id}')">Delete</button>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="card">
          <div class="arabic" style="font-family: 'Noto Naskh Arabic', serif; font-size: 1.4rem; direction: rtl; text-align: right; color: var(--deep-green); margin: 12px 0;">${item.arabic}</div>
          <div class="english" style="margin-bottom: 8px;">${item.english}</div>
          ${item.urdu ? `<div class="urdu" style="font-family: 'Noto Sans Urdu', sans-serif; direction: rtl; text-align: right; color: var(--text-muted); margin-bottom: 12px;">${item.urdu}</div>` : ''}
          <span class="source-ref">${item.surah}:${item.ayah}</span>
          <div class="dua-footer" style="margin-top: 12px;">
            <button class="delete-btn" onclick="deleteItem('saved_ayahs', '${item.id}')">Delete</button>
          </div>
        </div>
      `;
    }
  }).join('');
}

// Global function for delete (needs to be accessible from onclick)
window.deleteItem = async function(collectionName, docId) {
  if (!confirm('Are you sure you want to delete this item?')) {
    return;
  }
  
  if (!db) {
    alert('Database not available. Please refresh the page.');
    return;
  }
  
  try {
    await deleteDoc(doc(db, collectionName, docId));
  } catch (error) {
    console.error('Error deleting item:', error);
    alert('Error deleting item. Please try again.');
  }
};
