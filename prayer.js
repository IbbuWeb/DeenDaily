// Prayer Times Page Logic

const citiesByCountry = {
  'GB': ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Edinburgh'],
  'US': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
  'AE': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Al Ain', 'Ajman'],
  'SA': ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Taif'],
  'IN': ['Mumbai', 'Delhi', 'Kolkata', 'Chennai', 'Hyderabad', 'Bangalore', 'Ahmedabad', 'Pune', 'Vellore', 'Jaipur', 'Lucknow', 'Chandigarh'],
  'PK': ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta'],
  'CA': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg'],
  'AU': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Canberra'],
  'DE': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart'],
  'FR': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes'],
  'EG': ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan'],
  'MA': ['Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tangier'],
  'ID': ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang'],
  'MY': ['Kuala Lumpur', 'Penang', 'Johor Bahru', 'Kuala Terengganu', 'Ipoh'],
  'TR': ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya']
};

const countryNames = {
  'GB': 'United Kingdom', 'US': 'United States', 'AE': 'UAE', 'SA': 'Saudi Arabia',
  'IN': 'India', 'PK': 'Pakistan', 'CA': 'Canada', 'AU': 'Australia',
  'DE': 'Germany', 'FR': 'France', 'EG': 'Egypt', 'MA': 'Morocco',
  'ID': 'Indonesia', 'MY': 'Malaysia', 'TR': 'Turkey'
};

document.addEventListener('DOMContentLoaded', () => {
  const countryInput = document.getElementById('countryInput');
  const cityInput = document.getElementById('cityInput');
  
  // Notification setup
  setupNotifications();
  
  // Load saved settings
  const savedCountry = localStorage.getItem('prayerCountry') || '';
  const savedCity = localStorage.getItem('prayerCity') || '';
  
  if (savedCountry && citiesByCountry[savedCountry]) {
    countryInput.value = savedCountry;
    loadCities(savedCountry);
    cityInput.disabled = false;
    cityInput.value = savedCity;
    if (savedCity) {
      loadPrayerTimes(savedCity, savedCountry);
    }
  }
  
  // Country selection - load cities
  countryInput.addEventListener('change', () => {
    const country = countryInput.value;
    if (country && citiesByCountry[country]) {
      loadCities(country);
      cityInput.disabled = false;
      cityInput.value = citiesByCountry[country][0];
      localStorage.setItem('prayerCountry', country);
      localStorage.setItem('prayerCity', cityInput.value);
      loadPrayerTimes(cityInput.value, country);
    } else {
      cityInput.innerHTML = '<option value="">Select City</option>';
      cityInput.disabled = true;
    }
  });
  
  // City selection - load prayer times
  cityInput.addEventListener('change', () => {
    const country = countryInput.value;
    const city = cityInput.value;
    if (city && country) {
      localStorage.setItem('prayerCity', city);
      localStorage.setItem('prayerCountry', country);
      loadPrayerTimes(city, country);
    }
  });
});

function setupNotifications() {
  const notificationBtn = document.getElementById('notificationBtn');
  const notificationText = document.getElementById('notificationText');
  
  if (!notificationBtn) return;
  
  const notificationsEnabled = localStorage.getItem('prayerNotifications') === 'enabled';
  
  if (notificationsEnabled) {
    notificationBtn.classList.add('active');
    notificationText.textContent = 'Alerts On';
    requestNotificationPermission();
    schedulePrayerNotifications();
  }
  
  notificationBtn.addEventListener('click', async () => {
    const enabled = localStorage.getItem('prayerNotifications') === 'enabled';
    
    if (enabled) {
      localStorage.setItem('prayerNotifications', 'disabled');
      notificationBtn.classList.remove('active');
      notificationText.textContent = 'Enable Alerts';
    } else {
      const granted = await requestNotificationPermission();
      if (granted) {
        localStorage.setItem('prayerNotifications', 'enabled');
        notificationBtn.classList.add('active');
        notificationText.textContent = 'Alerts On';
        schedulePrayerNotifications();
      }
    }
  });
}

async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}

function schedulePrayerNotifications() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  
  const savedCountry = localStorage.getItem('prayerCountry') || 'GB';
  const savedCity = localStorage.getItem('prayerCity') || 'London';
  
  fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(savedCity)}&country=${savedCountry}&method=2`)
    .then(res => res.json())
    .then(data => {
      if (data.data && data.data.timings) {
        const timings = data.data.timings;
        scheduleNotification('Fajr', timings.Fajr, 'Time for Fajr prayer');
        scheduleNotification('Dhuhr', timings.Dhuhr, 'Time for Dhuhr prayer');
        scheduleNotification('Asr', timings.Asr, 'Time for Asr prayer');
        scheduleNotification('Maghrib', timings.Maghrib, 'Time for Maghrib prayer');
        scheduleNotification('Isha', timings.Isha, 'Time for Isha prayer');
      }
    })
    .catch(() => {});
}

function scheduleNotification(prayerName, time, message) {
  const [hours, mins] = time.split(':').map(Number);
  const now = new Date();
  const prayerTime = new Date();
  prayerTime.setHours(hours, mins, 0, 0);
  
  if (prayerTime <= now) {
    prayerTime.setDate(prayerTime.getDate() + 1);
  }
  
  const delay = prayerTime.getTime() - now.getTime();
  
  if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
    setTimeout(() => {
      if (localStorage.getItem('prayerNotifications') === 'enabled') {
        new Notification(`Deen Daily - ${prayerName}`, {
          body: message,
          icon: '/icons/logo.svg',
          tag: `prayer-${prayerName}`,
          requireInteraction: true
        });
      }
      scheduleNotification(prayerName, time, message);
    }, delay);
  }
}

function loadCities(country) {
  const cityInput = document.getElementById('cityInput');
  const cities = citiesByCountry[country] || [];
  
  cityInput.innerHTML = cities.map(city => 
    `<option value="${city}">${city}</option>`
  ).join('');
}

async function loadPrayerTimes(city, country) {
  const loading = document.getElementById('loading');
  const prayerList = document.getElementById('prayerList');
  const locationDisplay = document.getElementById('currentLocation');
  
  if (!city || !country) {
    loading.style.display = 'none';
    prayerList.style.display = 'none';
    return;
  }
  
  loading.style.display = 'block';
  prayerList.style.display = 'none';
  
  try {
    const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${country}&method=2`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch prayer times');
    }
    
    const data = await response.json();
    
    if (data.code !== 200) {
      throw new Error('City not found');
    }
    
    const timings = data.data.timings;
    const date = data.data.date.readable;
    const countryName = countryNames[country] || '';
    
    locationDisplay.textContent = `${city}, ${countryName} - ${date}`;
    
    // Define prayer order
    const prayers = [
      { name: 'Fajr', time: timings.Fajr },
      { name: 'Sunrise', time: timings.Sunrise, isSunrise: true },
      { name: 'Dhuhr', time: timings.Dhuhr },
      { name: 'Asr', time: timings.Asr },
      { name: 'Maghrib', time: timings.Maghrib },
      { name: 'Isha', time: timings.Isha }
    ];
    
    // Find current/next prayer (excluding sunrise)
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Filter out sunrise for display and index calculation
    const displayPrayers = prayers.filter(p => !p.isSunrise);
    
    let activeIndex = -1;
    
    for (let i = 0; i < displayPrayers.length; i++) {
      const [hours, mins] = displayPrayers[i].time.split(':').map(Number);
      const prayerMinutes = hours * 60 + mins;
      
      if (prayerMinutes > currentTime) {
        activeIndex = i;
        break;
      }
    }
    
    // If all prayers passed, highlight Fajr (next day)
    if (activeIndex === -1) {
      activeIndex = 0;
    }
    
    // Render prayer list
    prayerList.innerHTML = displayPrayers.map((prayer, index) => {
      const isActive = index === activeIndex;
      const formattedTime = format12Hour(prayer.time);
      const notificationKey = `notify_${prayer.name}`;
      const isNotified = localStorage.getItem(notificationKey) === 'true';
      
      return `
        <div class="prayer-item ${isActive ? 'active' : ''}">
          <span class="prayer-item-name">${prayer.name}</span>
          <span class="prayer-item-time">${formattedTime}</span>
          <button class="prayer-notify-btn ${isNotified ? 'active' : ''}" 
                  data-prayer="${prayer.name}" 
                  data-time="${prayer.time}"
                  title="${isNotified ? 'Disable notification' : 'Enable notification'}">
            ${isNotified ? '🔔' : '🔕'}
          </button>
        </div>
      `;
    }).join('');
    
    // Add click handlers for notification buttons
    document.querySelectorAll('.prayer-notify-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const prayerName = btn.dataset.prayer;
        const prayerTime = btn.dataset.time;
        const isNotified = localStorage.getItem(`notify_${prayerName}`) === 'true';
        
        if (isNotified) {
          localStorage.removeItem(`notify_${prayerName}`);
          btn.classList.remove('active');
          btn.innerHTML = '🔕';
          btn.title = 'Enable notification';
          window.DeenDaily?.disablePrayerNotification(prayerName);
          window.DeenDaily?.showToast(`${prayerName} notifications disabled`);
        } else {
          const result = await window.DeenDaily?.requestNotificationPermission();
          if (result?.granted) {
            localStorage.setItem(`notify_${prayerName}`, 'true');
            btn.classList.add('active');
            btn.innerHTML = '🔔';
            btn.title = 'Disable notification';
            const city = localStorage.getItem('prayerCity') || '';
            window.DeenDaily?.enablePrayerNotification(prayerName, prayerTime, city);
            window.DeenDaily?.showToast(`${prayerName} notifications enabled`);
          }
        }
      });
    });
    
    loading.style.display = 'none';
    prayerList.style.display = 'flex';
  } catch (error) {
    console.error('Error loading prayer times:', error);
    loading.innerHTML = `
      <p style="color: var(--text-muted);">Unable to load prayer times. Please try another city.</p>
    `;
  }
}

function format12Hour(time) {
  const [hours, mins] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(mins).padStart(2, '0')} ${period}`;
}
