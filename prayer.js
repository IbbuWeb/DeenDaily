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
    
    // Find current/next prayer
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    let activeIndex = -1;
    
    for (let i = 0; i < prayers.length; i++) {
      const [hours, mins] = prayers[i].time.split(':').map(Number);
      const prayerMinutes = hours * 60 + mins;
      
      if (prayerMinutes > currentTime && !prayers[i].isSunrise) {
        activeIndex = i;
        break;
      }
    }
    
    // If all prayers passed, highlight Fajr (next day)
    if (activeIndex === -1) {
      activeIndex = 0;
    }
    
    // Render prayer list
    prayerList.innerHTML = prayers.map((prayer, index) => {
      if (prayer.isSunrise) return '';
      
      const isActive = index === activeIndex;
      const formattedTime = format12Hour(prayer.time);
      
      return `
        <div class="prayer-item ${isActive ? 'active' : ''}">
          <span class="prayer-item-name">${prayer.name}</span>
          <span class="prayer-item-time">${formattedTime}</span>
        </div>
      `;
    }).join('');
    
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
