// Ramadan Tracker Logic

const citiesByCountry = {
  'GB': ['London', 'Birmingham', 'Manchester'],
  'US': ['New York', 'Los Angeles', 'Chicago'],
  'AE': ['Dubai', 'Abu Dhabi', 'Sharjah'],
  'SA': ['Riyadh', 'Jeddah', 'Mecca', 'Medina'],
  'IN': ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'],
  'PK': ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi'],
  'CA': ['Toronto', 'Vancouver', 'Montreal'],
  'AU': ['Sydney', 'Melbourne', 'Brisbane'],
  'DE': ['Berlin', 'Hamburg', 'Munich'],
  'FR': ['Paris', 'Marseille', 'Lyon'],
  'EG': ['Cairo', 'Alexandria', 'Giza'],
  'MA': ['Casablanca', 'Rabat', 'Marrakech'],
  'ID': ['Jakarta', 'Surabaya', 'Bandung'],
  'MY': ['Kuala Lumpur', 'Penang'],
  'TR': ['Istanbul', 'Ankara', 'Izmir']
};

const countryNames = {
  'GB': 'United Kingdom', 'US': 'United States', 'AE': 'UAE', 'SA': 'Saudi Arabia',
  'IN': 'India', 'PK': 'Pakistan', 'CA': 'Canada', 'AU': 'Australia',
  'DE': 'Germany', 'FR': 'France', 'EG': 'Egypt', 'MA': 'Morocco',
  'ID': 'Indonesia', 'MY': 'Malaysia', 'TR': 'Turkey'
};

const RAMADAN_2026 = {
  start: new Date('2026-02-18'),
  end: new Date('2026-03-19'),
  days: 30
};

function getRamadanDay() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(RAMADAN_2026.start);
  start.setHours(0, 0, 0, 0);
  
  const diffTime = today - start;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { day: null, message: 'Ramadan hasn\'t started yet', isRamadan: false };
  if (diffDays >= RAMADAN_2026.days) return { day: null, message: 'Ramadan has ended', isRamadan: false };
  
  return { day: diffDays + 1, message: '', isRamadan: true };
}

function getHijriDate() {
  const today = new Date();
  const hijriMonth = ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal', 
                      'Jumada al-Thani', 'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 
                      'Dhu al-Qidah', 'Dhu al-Hijjah'];
  
  const base = new Date('2026-02-18');
  const diffDays = Math.floor((today - base) / (1000 * 60 * 60 * 24));
  
  let month = 8 + diffDays;
  let year = 1447;
  
  if (month > 11) {
    month = month - 12;
    year = 1448;
  }
  
  const day = ((today.getDate() + 10) % 30) + 1;
  
  return `${day} ${hijriMonth[month]} ${year}`;
}

async function getPrayerTimes(city, country) {
  try {
    const response = await fetch(
      `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=2`
    );
    const data = await response.json();
    return data.data.timings;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return null;
  }
}

function calculateSehriIftar(prayerTimes) {
  if (!prayerTimes) return { sehri: null, iftar: null };
  
  const sehri = prayerTimes.Fajr;
  const iftar = prayerTimes.Maghrib;
  
  return {
    sehri: sehri,
    iftar: iftar,
    sehriDate: new Date(`${new Date().toDateString()} ${sehri}`),
    iftarDate: new Date(`${new Date().toDateString()} ${iftar}`)
  };
}

function updateTimeRemaining() {
  const now = new Date();
  const times = window.ramadanTimes;
  
  if (!times) return;
  
  const sehriRemaining = document.getElementById('sehriRemaining');
  const iftarRemaining = document.getElementById('iftarRemaining');
  
  if (times.sehriDate && now < times.sehriDate) {
    const diff = times.sehriDate - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (sehriRemaining) sehriRemaining.textContent = `${hours}h ${mins}m until Sehri ends`;
  } else if (sehriRemaining) {
    sehriRemaining.textContent = 'Sehri has ended';
  }
  
  if (times.iftarDate) {
    const diff = times.iftarDate - now;
    if (diff > 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (iftarRemaining) iftarRemaining.textContent = `${hours}h ${mins}m until Iftar`;
    } else if (iftarRemaining) {
      iftarRemaining.textContent = 'Iftar time passed';
    }
  }
}

function loadCities(country) {
  const cityInput = document.getElementById('cityInput');
  if (!cityInput) return;
  
  const cities = citiesByCountry[country] || [];
  cityInput.innerHTML = '<option value="">Select City</option>' +
    cities.map(city => `<option value="${city}">${city}</option>`).join('');
  cityInput.disabled = false;
}

async function loadTimes() {
  const country = localStorage.getItem('prayerCountry');
  const city = localStorage.getItem('prayerCity');
  
  if (!country || !city) return;
  
  const times = await getPrayerTimes(city, country);
  if (times) {
    window.ramadanTimes = calculateSehriIftar(times);
    
    if (window.ramadanTimes.sehri) {
      document.getElementById('sehriTime').textContent = window.ramadanTimes.sehri;
    }
    if (window.ramadanTimes.iftar) {
      document.getElementById('iftarTime').textContent = window.ramadanTimes.iftar;
    }
  }
}

function getFastHistory() {
  const history = JSON.parse(localStorage.getItem('fastHistory') || '[]');
  return history;
}

function saveFastRecord(record) {
  const history = getFastHistory();
  history.push(record);
  localStorage.setItem('fastHistory', JSON.stringify(history));
}

function updateFastHistory() {
  const history = getFastHistory();
  const container = document.getElementById('fastHistory');
  
  if (!container) return;
  
  if (history.length === 0) {
    container.innerHTML = '<div class="history-empty">No fasting data yet</div>';
    return;
  }
  
  container.innerHTML = history.slice(-7).reverse().map(record => `
    <div class="history-item">
      <span class="history-date">${record.date}</span>
      <span class="history-duration">${record.duration || 'Incomplete'}</span>
      <span class="history-status ${record.completed ? 'completed' : 'incomplete'}">
        ${record.completed ? '✓' : '✗'}
      </span>
    </div>
  `).join('');
}

function updateStats() {
  const history = getFastHistory();
  const completed = history.filter(f => f.completed).length;
  
  let streak = 0;
  const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] && sorted[i].completed) {
      streak++;
    } else {
      break;
    }
  }
  
  document.getElementById('totalFasts').textContent = completed;
  document.getElementById('currentStreak').textContent = streak;
}

let fastStartTime = null;
let fastTimerInterval = null;

function startFast() {
  fastStartTime = new Date();
  localStorage.setItem('fastStartTime', fastStartTime.toISOString());
  updateFastUI(true);
}

function endFast() {
  if (!fastStartTime) return;
  
  const endTime = new Date();
  const duration = endTime - fastStartTime;
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const mins = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  
  const record = {
    date: new Date().toDateString(),
    startTime: fastStartTime.toISOString(),
    endTime: endTime.toISOString(),
    duration: `${hours}h ${mins}m`,
    completed: true
  };
  
  saveFastRecord(record);
  
  fastStartTime = null;
  localStorage.removeItem('fastStartTime');
  
  if (fastTimerInterval) {
    clearInterval(fastTimerInterval);
    fastTimerInterval = null;
  }
  
  updateFastUI(false);
  updateFastHistory();
  updateStats();
  
  window.DeenDaily?.showToast('MashAllah! Fast completed!', 'success');
}

function updateFastUI(isFasting) {
  const btn = document.getElementById('toggleFastBtn');
  const status = document.getElementById('fastStatus');
  
  if (isFasting) {
    btn.textContent = 'End Fast';
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-danger');
    status.classList.add('active');
    
    fastTimerInterval = setInterval(() => {
      const now = new Date();
      const diff = now - fastStartTime;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      
      document.getElementById('fastTimer').textContent = 
        `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
  } else {
    btn.textContent = 'Start Fast';
    btn.classList.add('btn-primary');
    btn.classList.remove('btn-danger');
    status.classList.remove('active');
    document.getElementById('fastTimer').textContent = '00:00:00';
  }
}

function checkActiveFast() {
  const savedStart = localStorage.getItem('fastStartTime');
  if (savedStart) {
    fastStartTime = new Date(savedStart);
    updateFastUI(true);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const countryInput = document.getElementById('countryInput');
  const cityInput = document.getElementById('cityInput');
  const saveLocationBtn = document.getElementById('saveLocationBtn');
  const toggleFastBtn = document.getElementById('toggleFastBtn');
  
  // Load Ramadan day info
  const ramadanInfo = getRamadanDay();
  const dayEl = document.getElementById('ramadanDay');
  const dateEl = document.getElementById('ramadanDate');
  const statusCard = document.querySelector('.ramadan-status-card');
  
  if (ramadanInfo.isRamadan) {
    dayEl.textContent = ramadanInfo.day;
    statusCard.classList.add('active');
  } else {
    dayEl.textContent = ramadanInfo.message;
    statusCard.classList.add('inactive');
  }
  
  dateEl.textContent = getHijriDate();
  
  // Load countries
  countryInput.innerHTML = '<option value="">Select Country</option>' +
    Object.entries(countryNames).map(([code, name]) => 
      `<option value="${code}">${name}</option>`
    ).join('');
  
  // Load saved location
  const savedCountry = localStorage.getItem('prayerCountry');
  const savedCity = localStorage.getItem('prayerCity');
  
  if (savedCountry) {
    countryInput.value = savedCountry;
    loadCities(savedCountry);
    cityInput.disabled = false;
    if (savedCity) {
      cityInput.value = savedCity;
      loadTimes();
    }
  }
  
  // Country change
  countryInput.addEventListener('change', () => {
    const country = countryInput.value;
    if (country) {
      loadCities(country);
      localStorage.setItem('prayerCountry', country);
    }
  });
  
  // City change
  cityInput.addEventListener('change', () => {
    const city = cityInput.value;
    const country = countryInput.value;
    if (city && country) {
      localStorage.setItem('prayerCity', city);
      loadTimes();
    }
  });
  
  // Save location
  saveLocationBtn?.addEventListener('click', () => {
    window.DeenDaily?.showToast('Location saved!', 'success');
    loadTimes();
  });
  
  // Toggle fast
  toggleFastBtn?.addEventListener('click', () => {
    if (fastStartTime) {
      endFast();
    } else {
      startFast();
    }
  });
  
  // Check for active fast
  checkActiveFast();
  
  // Update time remaining
  setInterval(updateTimeRemaining, 60000);
  updateTimeRemaining();
  
  // Load stats
  updateFastHistory();
  updateStats();
});
