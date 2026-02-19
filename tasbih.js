// Tasbih Counter Logic

// Dhikr definitions with Arabic text
const dhikrs = {
  'subhanallah': {
    arabic: 'سُبْحَانَ اللَّهِ',
    name: 'SubhanAllah',
    meaning: 'Glory be to Allah'
  },
  'alhampton': {
    arabic: 'الْحَمْدُ لِلَّهِ',
    name: 'Alhampton',
    meaning: 'Praise be to Allah'
  },
  'allahuakbar': {
    arabic: 'اللَّهُ أَكْبَرُ',
    name: 'Allahu Akbar',
    meaning: 'Allah is the Greatest'
  },
  'la ilaha': {
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ',
    name: 'La ilaha illallah',
    meaning: 'There is no god but Allah'
  },
  'astaghfirullah': {
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    name: 'Astaghfirullah',
    meaning: 'I seek forgiveness from Allah'
  },
  'salawat': {
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',
    name: 'Allahumma sali',
    meaning: 'O Allah, send prayers upon Muhammad'
  }
};

// Get current date string for daily tracking
function getTodayString() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Initialize state
let currentDhikr = localStorage.getItem('currentDhikr') || 'subhanallah';
let currentCount = parseInt(localStorage.getItem('tasbihCount')) || 0;
let totalCount = parseInt(localStorage.getItem('tasbihTotal')) || 0;

// Get today's count from storage
function getTodayCount() {
  const todayData = JSON.parse(localStorage.getItem('tasbihTodayData') || '{}');
  const today = getTodayString();
  return todayData[today] || 0;
}

// Update today's count in storage
function updateTodayCount(increment = 0) {
  const todayData = JSON.parse(localStorage.getItem('tasbihTodayData') || '{}');
  const today = getTodayString();
  todayData[today] = (todayData[today] || 0) + increment;
  
  // Keep only last 30 days
  const dates = Object.keys(todayData).sort().reverse();
  if (dates.length > 30) {
    const newData = {};
    dates.slice(0, 30).forEach(date => {
      newData[date] = todayData[date];
    });
    localStorage.setItem('tasbihTodayData', JSON.stringify(newData));
  } else {
    localStorage.setItem('tasbihTodayData', JSON.stringify(todayData));
  }
}

// DOM Elements
const counterEl = document.getElementById('counter');
const countBtn = document.getElementById('countBtn');
const resetBtn = document.getElementById('resetBtn');
const currentDhikrEl = document.getElementById('currentDhikr') || { textContent: '' };
const dhikrSelector = document.getElementById('dhikrSelector') || { querySelectorAll: () => [], addEventListener: () => {} };
const todayCountEl = document.getElementById('todayCount') || { textContent: () => {} };
const totalCountEl = document.getElementById('totalCount') || { textContent: () => {} };

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  updateDisplay();
  updateStats();
  
  // Set active dhikr button
  const buttons = dhikrSelector.querySelectorAll ? dhikrSelector.querySelectorAll('.dhikr-btn') : [];
  buttons.forEach(btn => {
    if (btn.dataset.dhikr === currentDhikr) {
      btn.classList.add('active');
      if (currentDhikrEl) currentDhikrEl.textContent = dhikrs[btn.dataset.dhikr]?.arabic || 'سُبْحَانَ اللَّهِ';
    } else {
      btn.classList.remove('active');
    }
  });
});

// Count button click
if (countBtn) {
countBtn.addEventListener('click', () => {
  currentCount++;
  totalCount++;
  updateTodayCount(1);
  
  // Save to localStorage
  localStorage.setItem('tasbihCount', currentCount);
  localStorage.setItem('tasbihTotal', totalCount);
  
  updateDisplay();
  updateStats();
  
  // Visual feedback
  countBtn.style.transform = 'scale(0.95)';
  setTimeout(() => {
    countBtn.style.transform = '';
  }, 100);
});
}

// Reset button click
if (resetBtn) {
resetBtn.addEventListener('click', () => {
  if (confirm('Reset counter to zero?')) {
    currentCount = 0;
    localStorage.setItem('tasbihCount', 0);
    updateDisplay();
  }
});
}

// Dhikr selector buttons
if (dhikrSelector) {
dhikrSelector.addEventListener('click', (e) => {
  const btn = e.target.closest('.dhikr-btn');
  if (!btn) return;
  
  // Update active state
  dhikrSelector.querySelectorAll('.dhikr-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  // Update current dhikr
  currentDhikr = btn.dataset.dhikr;
  localStorage.setItem('currentDhikr', currentDhikr);
  
  // Update Arabic display
  if (currentDhikrEl) currentDhikrEl.textContent = dhikrs[currentDhikr]?.arabic || 'سُبْحَانَ اللَّهِ';
});
}

// Keyboard support for counting
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && countBtn) {
    e.preventDefault();
    countBtn.click();
  }
});

// Update counter display
function updateDisplay() {
  if (counterEl) counterEl.textContent = currentCount;
}

// Update stats display
function updateStats() {
  if (todayCountEl) todayCountEl.textContent = getTodayCount();
  if (totalCountEl) totalCountEl.textContent = totalCount;
}

// Handle touch events for better mobile experience
if (countBtn) {
  let touchStartTime = 0;
  countBtn.addEventListener('touchstart', () => {
    touchStartTime = Date.now();
  });

  countBtn.addEventListener('touchend', (e) => {
    const touchDuration = Date.now() - touchStartTime;
    if (touchDuration < 300) {
      e.preventDefault();
      countBtn.click();
    }
  });
}
