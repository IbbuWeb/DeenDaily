// Deen Daily - Main Application Logic
// Home page with daily duas, prayer times countdown, and daily ayah

// Firebase imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAnbSpt2-We658sYnSAZSXYz1WYu-Ioyic",
  authDomain: "deen--daily.firebaseapp.com",
  projectId: "deen--daily",
  storageBucket: "deen--daily.firebasestorage.app",
  messagingSenderId: "189832469044",
  appId: "1:189832469044:web:6e3bebe071cc1acba28861",
  measurementId: "G-Q9YXBD46E4"
};

// Application state
let app, auth, db;
let currentUser = null;
let currentAyah = null;
let duas = [];
let displayedCount = 0;

const INITIAL_LOAD = 6;
const LOAD_MORE = 4;

// Pages that require authentication for full functionality
const authRequiredPages = ['favorites.html'];
const currentPage = window.location.pathname.split('/').pop();
const requiresAuth = authRequiredPages.includes(currentPage);

// Initialize app on load
document.addEventListener('DOMContentLoaded', async () => {
  // Apply saved theme
  const savedTheme = localStorage.getItem('deen-daily-theme') || 'white';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    onAuthStateChanged(auth, (user) => {
      currentUser = user;
      
      // Only redirect if page specifically requires auth (not all pages)
      if (requiresAuth && !user) {
        window.location.href = 'login.html';
        return;
      }
      
      // Redirect to home if logged in and on login page
      if (currentPage === 'login.html' && user) {
        window.location.href = 'index.html';
      }
    });
  } catch (error) {
    console.log('Firebase not configured, running in offline mode');
    if (requiresAuth) {
      window.location.href = 'login.html';
    }
  }
  
  // Set header date
  setHeaderDate();
  
  // Load data
  await loadDuaData();
  loadDailyAyah();
  setupInfiniteScroll();
  setupScrollCountdown();
});

// ==================== DATE FUNCTIONS ====================
async function setHeaderDate() {
  const now = new Date();
  
  // Try to get accurate Islamic date from AlAdhan API
  let islamicDate = null;
  
  try {
    const city = localStorage.getItem('prayerCity') || 'London';
    const country = localStorage.getItem('prayerCountry') || 'GB';
    
    const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${country}&method=2`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.hijri) {
        const hijri = data.data.hijri;
        islamicDate = `${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
      }
    }
  } catch (error) {
    console.log('Could not fetch Islamic date from API');
  }
  
  // Fallback to local calculation if API fails
  if (!islamicDate) {
    islamicDate = getIslamicDateLocal(now);
  }
  
  // Format Gregorian date
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const gregorian = now.toLocaleDateString('en-US', options);
  
  document.getElementById('headerDate').innerHTML = `${islamicDate}<br>${gregorian}`;
}

function getIslamicDateLocal(date) {
  const hijriMonths = ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 
                        'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
                        'Ramadan', 'Shawwal', 'Dhu al-Qidah', 'Dhu al-Hijjah'];
  
  // Reference: Ramadan 1447 started February 19, 2026
  const refDate = new Date(2026, 1, 19);
  const refHijriYear = 1447;
  const refMonth = 8; // Ramadan (0-indexed)
  
  const diff = date - refDate;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // Each Hijri month is ~29 or 30 days
  const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
  
  let totalDays = days;
  let month = refMonth;
  let year = refHijriYear;
  
  // Go back if date is before reference
  while (totalDays < 0) {
    month--;
    if (month < 0) {
      month = 11;
      year--;
    }
    totalDays += monthLengths[month];
  }
  
  // Calculate day of month
  let day = 1 + totalDays;
  while (day > monthLengths[month]) {
    day -= monthLengths[month];
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }
  
  return `${day} ${hijriMonths[month]} ${year} AH`;
}

// ==================== PRAYER TIMES FUNCTIONS ====================
let prayerTimes = null;

async function setupScrollCountdown() {
  const savedCity = localStorage.getItem('prayerCity') || 'London';
  const savedCountry = localStorage.getItem('prayerCountry') || '';
  
  try {
    // Use saved country if available
    if (savedCountry && savedCity) {
      const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(savedCity)}&country=${savedCountry}&method=2`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        prayerTimes = data.data.timings;
        updateNextPrayer();
        setInterval(updateNextPrayer, 1000);
        return;
      }
    }
    
    // Fallback: try multiple country codes
    const countries = ['GB', 'US', 'AE', 'SA', 'IN', 'PK', 'CA', 'AU'];
    
    for (const country of countries) {
      const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(savedCity)}&country=${country}&method=2`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        prayerTimes = data.data.timings;
        updateNextPrayer();
        setInterval(updateNextPrayer, 1000);
        return;
      }
    }
    
    console.log('Using default prayer times');
    prayerTimes = {
      'Fajr': '05:30',
      'Sunrise': '06:30',
      'Dhuhr': '12:30',
      'Asr': '15:45',
      'Maghrib': '18:30',
      'Isha': '20:00'
    };
    updateNextPrayer();
    setInterval(updateNextPrayer, 1000);
  } catch (error) {
    console.error('Error loading prayer times:', error);
    prayerTimes = {
      'Fajr': '05:30',
      'Sunrise': '06:30',
      'Dhuhr': '12:30',
      'Asr': '15:45',
      'Maghrib': '18:30',
      'Isha': '20:00'
    };
    updateNextPrayer();
    setInterval(updateNextPrayer, 1000);
  }
}

function updateNextPrayer() {
  if (!prayerTimes) return;
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const prayers = [
    { name: 'Fajr', time: prayerTimes['Fajr'] },
    { name: 'Sunrise', time: prayerTimes['Sunrise'] },
    { name: 'Dhuhr', time: prayerTimes['Dhuhr'] },
    { name: 'Asr', time: prayerTimes['Asr'] },
    { name: 'Maghrib', time: prayerTimes['Maghrib'] },
    { name: 'Isha', time: prayerTimes['Isha'] }
  ];
  
  let nextPrayer = null;
  let nextPrayerTime = null;
  
  for (const prayer of prayers) {
    const [hours, mins] = prayer.time.split(':').map(Number);
    const prayerMinutes = hours * 60 + mins;
    
    if (prayerMinutes > currentTime && prayer.name !== 'Sunrise') {
      nextPrayer = prayer.name;
      nextPrayerTime = prayer.time;
      break;
    }
  }
  
  // If no prayer found today, show Fajr tomorrow
  if (!nextPrayer) {
    nextPrayer = 'Fajr';
    nextPrayerTime = prayerTimes['Fajr'];
  }
  
  // Update UI
  document.getElementById('nextPrayerName').textContent = nextPrayer;
  document.getElementById('nextPrayerTime').textContent = format12Hour(nextPrayerTime);
  
  // Calculate countdown
  const [hours, mins] = nextPrayerTime.split(':').map(Number);
  const targetMinutes = hours * 60 + mins;
  let diffMinutes = targetMinutes - currentTime;
  
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60; // Add 24 hours
  }
  
  const diffHours = Math.floor(diffMinutes / 60);
  const diffMins = diffMinutes % 60;
  const diffSecs = 60 - now.getSeconds();
  
  document.getElementById('hours').textContent = String(diffHours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(diffMins).padStart(2, '0');
  document.getElementById('seconds').textContent = String(diffSecs).padStart(2, '0');
}

function format12Hour(time) {
  const [hours, mins] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(mins).padStart(2, '0')} ${period}`;
}

// ==================== DAILY AYAH FUNCTIONS ====================
async function loadDailyAyah() {
  const ayahCard = document.getElementById('dailyAyah');
  
  try {
    // Using alquran.cloud - get a random verse
    const randomSurah = [1, 2, 3, 18, 36, 67, 87, 93][Math.floor(Math.random() * 8)];
    const randomAyah = Math.floor(Math.random() * 10) + 1;
    
    const response = await fetch(`https://api.alquran.cloud/v1/ayah/${randomSurah}:${randomAyah}`);
    
    if (!response.ok) throw new Error('Failed to fetch');
    
    const data = await response.json();
    
    if (data.data) {
      const verse = data.data;
      currentAyah = {
        id: verse.number,
        surahId: verse.surah.number,
        arabic: verse.text,
        english: verse.translation || 'Translation not available',
        surah: verse.surah.nameEnglish,
        ayah: verse.numberInSurah
      };
      
      // Try to get Urdu translation
      try {
        const urduResponse = await fetch(`https://api.alquran.cloud/v1/ayah/${randomSurah}:${randomAyah}/ur.jalandhry`);
        const urduData = await urduResponse.json();
        if (urduData.data) {
          currentAyah.urdu = urduData.data.text;
        }
      } catch (e) {
        currentAyah.urdu = '';
      }
      
      renderDailyAyah(currentAyah);
    }
  } catch (error) {
    console.error('Error loading ayah:', error);
    ayahCard.innerHTML = `
      <div class="card-header">
        <span class="card-title">Daily Ayah</span>
      </div>
      <p style="color: var(--text-tertiary);">Unable to load ayah. Please check your internet connection.</p>
    `;
  }
}

function renderDailyAyah(ayah) {
  const ayahCard = document.getElementById('dailyAyah');
  
  ayahCard.innerHTML = `
    <div class="card-header">
      <span class="card-title">Daily Ayah</span>
      <button class="btn-icon" id="saveAyahBtn" title="Save Ayah">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
    </div>
    <div class="arabic-text">${ayah.arabic}</div>
    <div class="translation">${ayah.english}</div>
    ${ayah.urdu ? `<div class="urdu-text">${ayah.urdu}</div>` : ''}
    <span class="source-ref">${ayah.surah}:${ayah.ayah}</span>
  `;
  
  document.getElementById('saveAyahBtn').addEventListener('click', () => saveAyah(ayah));
}

// ==================== DUA FEED FUNCTIONS ====================
// Fallback duas in case JSON fails to load
const fallbackDuas = [
  { id: 1, arabic: "رَبِّ اشْرَحْ لِي صَدْرِي", english: "My Lord, expand for me my chest", urdu: "اے میرے رب! میری سینے کو وسیع کر", category: "Morning", source: "Surah Taha 20:25-28" },
  { id: 2, arabic: "رَبِّ يَسِّرْ لِي أَمْرِي", english: "My Lord, ease for me my affair", urdu: "اے میرے رب! میرے کام کو آسان کر", category: "Morning", source: "Surah Taha 20:26" },
  { id: 3, arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالسَّدَادَ", english: "O Allah, I ask You for guidance and rightness", urdu: "اے اللہ! میں تیری ہدایت اور سداد کا سوال کرتا ہوں", category: "Morning", source: "Hadith" },
  { id: 4, arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ", english: "O Allah, help me to remember You, thank You, and worship You excellently", urdu: "اے اللہ! تجھے یاد کرنے، تیری شکریہ ادا کرنے اور عبادت کی خوبی میں مرا مدد کر", category: "Morning", source: "Hadith" },
  { id: 5, arabic: "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ فَمِنْكَ وَحْدَكَ", english: "O Allah, whatever blessing has come to me in the morning is from You alone", urdu: "اے اللہ! جو بھی نعمت مجھے صبح کو ملی ہے وہ صرف تیری طرف سے ہے", category: "Morning", source: "Hadith" },
  { id: 6, arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ", english: "We have reached the morning and all sovereignty belongs to Allah", urdu: "ہم صبح کو پہنچ گئے اور ساری بادشاہی اللہ کی ہے", category: "Morning", source: "Hadith" }
];

async function loadDuaData() {
  try {
    const response = await fetch('duas.json');
    if (response.ok) {
      duas = await response.json();
    } else {
      console.log('Using fallback duas');
      duas = fallbackDuas;
    }
  } catch (error) {
    console.log('Using fallback duas:', error);
    duas = fallbackDuas;
  }
  
  // Shuffle duas randomly
  shuffleArray(duas);
  
  // Render initial duas
  renderInitialDuas();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function renderInitialDuas() {
  const duaFeed = document.getElementById('duaFeed');
  const initialDuas = duas.slice(0, INITIAL_LOAD);
  
  initialDuas.forEach((dua, index) => {
    const card = createDuaCard(dua, index);
    duaFeed.appendChild(card);
  });
  
  displayedCount = INITIAL_LOAD;
  
  // Hide loading if all loaded
  if (displayedCount >= duas.length) {
    document.getElementById('loadingMore').style.display = 'none';
    document.getElementById('endMessage').style.display = 'block';
  }
}

function createDuaCard(dua, index) {
  const card = document.createElement('div');
  card.className = 'card dua-card';
  card.style.animationDelay = `${index * 0.1}s`;
  
  card.innerHTML = `
    <span class="category-badge">${dua.category}</span>
    <div class="arabic">${dua.arabic}</div>
    <div class="english">${dua.english}</div>
    <div class="urdu">${dua.urdu}</div>
    <div class="source">${dua.source}</div>
    <div class="dua-footer">
      <button class="btn-icon" id="saveDuaBtn${dua.id}" title="Save Dua">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
    </div>
  `;
  
  card.querySelector(`#saveDuaBtn${dua.id}`).addEventListener('click', () => saveDua(dua));
  
  return card;
}

function loadMoreDuas() {
  if (displayedCount >= duas.length) return;
  
  const nextDuas = duas.slice(displayedCount, displayedCount + LOAD_MORE);
  const duaFeed = document.getElementById('duaFeed');
  
  nextDuas.forEach((dua, index) => {
    const card = createDuaCard(dua, index);
    duaFeed.appendChild(card);
  });
  
  displayedCount += LOAD_MORE;
  
  if (displayedCount >= duas.length) {
    document.getElementById('loadingMore').style.display = 'none';
    document.getElementById('endMessage').style.display = 'block';
  }
}

function setupInfiniteScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && displayedCount < duas.length) {
        loadMoreDuas();
      }
    });
  }, { rootMargin: '100px' });
  
  observer.observe(document.getElementById('loadingMore'));
}

// ==================== SAVE FUNCTIONS ====================
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast ' + type + ' show';
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

async function saveAyah(ayah) {
  if (!currentUser) {
    showToast('Please sign in to save ayahs', 'error');
    window.location.href = 'login.html';
    return;
  }
  
  try {
    await addDoc(collection(db, 'saved_ayahs'), {
      userId: currentUser.uid,
      surahId: ayah.surahId,
      surahName: ayah.surah,
      arabic: ayah.arabic,
      english: ayah.english,
      urdu: ayah.urdu || '',
      surah: ayah.surah,
      ayah: ayah.ayah,
      savedAt: new Date()
    });
    
    showToast('Ayah saved!');
  } catch (error) {
    console.error('Error saving ayah:', error);
    showToast('Please sign in to save', 'error');
  }
}

async function saveDua(dua) {
  if (!currentUser) {
    showToast('Please sign in to save duas', 'error');
    window.location.href = 'login.html';
    return;
  }
  
  try {
    await addDoc(collection(db, 'saved_duas'), {
      userId: currentUser.uid,
      duaId: dua.id,
      arabic: dua.arabic,
      english: dua.english,
      urdu: dua.urdu,
      category: dua.category,
      source: dua.source,
      savedAt: new Date()
    });
    
    showToast('Dua saved!');
  } catch (error) {
    console.error('Error saving dua:', error);
    showToast('Please sign in to save', 'error');
  }
}
