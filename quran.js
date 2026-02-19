// Quran Surah List - Using local data for reliability

let bookmarkedSurahId = null;

const surahsData = [
  { id: 1, name: "Al-Fatiha", name_simple: "Al-Fatiha", name_arabic: "ٱلْفَاتِحَة", revelation_place: "Meccan", verses_count: 7 },
  { id: 2, name: "Al-Baqarah", name_simple: "Al-Baqarah", name_arabic: "ٱلْبَقَرَة", revelation_place: "Medinan", verses_count: 286 },
  { id: 3, name: "Al-Imran", name_simple: "Al-Imran", name_arabic: "ٱلْعِمْرَان", revelation_place: "Medinan", verses_count: 200 },
  { id: 4, name: "An-Nisa", name_simple: "An-Nisa", name_arabic: "ٱلنِّسَاء", revelation_place: "Medinan", verses_count: 176 },
  { id: 5, name: "Al-Ma'idah", name_simple: "Al-Ma'idah", name_arabic: "ٱلْمَائِدَة", revelation_place: "Medinan", verses_count: 120 },
  { id: 6, name: "Al-An'am", name_simple: "Al-An'am", name_arabic: "ٱلْأَنْعَام", revelation_place: "Meccan", verses_count: 165 },
  { id: 7, name: "Al-A'raf", name_simple: "Al-A'raf", name_arabic: "ٱلْأَعْرَاف", revelation_place: "Meccan", verses_count: 206 },
  { id: 8, name: "Al-Anfal", name_simple: "Al-Anfal", name_arabic: "ٱلْأَنْفَال", revelation_place: "Medinan", verses_count: 75 },
  { id: 9, name: "At-Tawbah", name_simple: "At-Tawbah", name_arabic: "ٱلتَّوْبَة", revelation_place: "Medinan", verses_count: 129 },
  { id: 10, name: "Yunus", name_simple: "Yunus", name_arabic: "يُونُس", revelation_place: "Meccan", verses_count: 109 },
  { id: 11, name: "Hud", name_simple: "Hud", name_arabic: "هُود", revelation_place: "Meccan", verses_count: 123 },
  { id: 12, name: "Yusuf", name_simple: "Yusuf", name_arabic: "يُوسُف", revelation_place: "Meccan", verses_count: 111 },
  { id: 13, name: "Ar-Ra'd", name_simple: "Ar-Ra'd", name_arabic: "ٱلرَّعْد", revelation_place: "Medinan", verses_count: 43 },
  { id: 14, name: "Ibrahim", name_simple: "Ibrahim", name_arabic: "إِبْرَاهِيم", revelation_place: "Meccan", verses_count: 52 },
  { id: 15, name: "Al-Hijr", name_simple: "Al-Hijr", name_arabic: "ٱلْحِجْر", revelation_place: "Meccan", verses_count: 99 },
  { id: 16, name: "An-Nahl", name_simple: "An-Nahl", name_arabic: "ٱلنَّحْل", revelation_place: "Meccan", verses_count: 128 },
  { id: 17, name: "Al-Isra", name_simple: "Al-Isra", name_arabic: "ٱلْإِسْرَاء", revelation_place: "Meccan", verses_count: 111 },
  { id: 18, name: "Al-Kahf", name_simple: "Al-Kahf", name_arabic: "ٱلْكَهْف", revelation_place: "Meccan", verses_count: 110 },
  { id: 19, name: "Maryam", name_simple: "Maryam", name_arabic: "مَرْيَم", revelation_place: "Meccan", verses_count: 98 },
  { id: 20, name: "Ta-Ha", name_simple: "Ta-Ha", name_arabic: "طٰهٰ", revelation_place: "Meccan", verses_count: 135 },
  { id: 21, name: "Al-Anbiya", name_simple: "Al-Anbiya", name_arabic: "ٱلْأَنْبِيَاء", revelation_place: "Meccan", verses_count: 112 },
  { id: 22, name: "Al-Hajj", name_simple: "Al-Hajj", name_arabic: "ٱلْحَجّ", revelation_place: "Medinan", verses_count: 78 },
  { id: 23, name: "Al-Mu'minun", name_simple: "Al-Mu'minun", name_arabic: "ٱلْمُؤْمِنُون", revelation_place: "Meccan", verses_count: 118 },
  { id: 24, name: "An-Nur", name_simple: "An-Nur", name_arabic: "ٱلنُّور", revelation_place: "Medinan", verses_count: 64 },
  { id: 25, name: "Al-Furqan", name_simple: "Al-Furqan", name_arabic: "ٱلْفُرْقَان", revelation_place: "Meccan", verses_count: 77 },
  { id: 26, name: "Ash-Shu'ara", name_simple: "Ash-Shu'ara", name_arabic: "ٱلشُّعَرَاء", revelation_place: "Meccan", verses_count: 227 },
  { id: 27, name: "An-Naml", name_simple: "An-Naml", name_arabic: "ٱلنَّمْل", revelation_place: "Meccan", verses_count: 93 },
  { id: 28, name: "Al-Qasas", name_simple: "Al-Qasas", name_arabic: "ٱلْقَصَص", revelation_place: "Meccan", verses_count: 88 },
  { id: 29, name: "Al-Ankabut", name_simple: "Al-Ankabut", name_arabic: "ٱلْعَنْكَبُوت", revelation_place: "Meccan", verses_count: 69 },
  { id: 30, name: "Ar-Rum", name_simple: "Ar-Rum", name_arabic: "ٱلرُّوم", revelation_place: "Meccan", verses_count: 60 },
  { id: 31, name: "Luqman", name_simple: "Luqman", name_arabic: "لُقْمَان", revelation_place: "Meccan", verses_count: 34 },
  { id: 32, name: "As-Sajdah", name_simple: "As-Sajdah", name_arabic: "ٱلسَّجْدَة", revelation_place: "Meccan", verses_count: 30 },
  { id: 33, name: "Al-Ahzab", name_simple: "Al-Ahzab", name_arabic: "ٱلْأَحْزَاب", revelation_place: "Medinan", verses_count: 73 },
  { id: 34, name: "Saba", name_simple: "Saba", name_arabic: "سَبَأ", revelation_place: "Meccan", verses_count: 54 },
  { id: 35, name: "Fatir", name_simple: "Fatir", name_arabic: "فَاطِر", revelation_place: "Meccan", verses_count: 45 },
  { id: 36, name: "Ya-Sin", name_simple: "Ya-Sin", name_arabic: "يسٰ", revelation_place: "Meccan", verses_count: 83 },
  { id: 37, name: "As-Saffat", name_simple: "As-Saffat", name_arabic: "ٱلصَّافَّات", revelation_place: "Meccan", verses_count: 182 },
  { id: 38, name: "Sad", name_simple: "Sad", name_arabic: "صٰ", revelation_place: "Meccan", verses_count: 88 },
  { id: 39, name: "Az-Zumar", name_simple: "Az-Zumar", name_arabic: "ٱلزُّمَر", revelation_place: "Meccan", verses_count: 75 },
  { id: 40, name: "Ghafir", name_simple: "Ghafir", name_arabic: "غَافِر", revelation_place: "Meccan", verses_count: 85 },
  { id: 41, name: "Fussilat", name_simple: "Fussilat", name_arabic: "فُصِّلَت", revelation_place: "Meccan", verses_count: 54 },
  { id: 42, name: "Ash-Shura", name_simple: "Ash-Shura", name_arabic: "ٱلشُّورَى", revelation_place: "Meccan", verses_count: 53 },
  { id: 43, name: "Az-Zukhruf", name_simple: "Az-Zukhruf", name_arabic: "ٱلْزُّخْرُف", revelation_place: "Meccan", verses_count: 89 },
  { id: 44, name: "Ad-Dukhan", name_simple: "Ad-Dukhan", name_arabic: "ٱلدُّخَان", revelation_place: "Meccan", verses_count: 59 },
  { id: 45, name: "Al-Jathiyah", name_simple: "Al-Jathiyah", name_arabic: "ٱلْجَاثِيَة", revelation_place: "Meccan", verses_count: 37 },
  { id: 46, name: "Al-Ahqaf", name_simple: "Al-Ahqaf", name_arabic: "ٱلْأَحْقَاف", revelation_place: "Meccan", verses_count: 35 },
  { id: 47, name: "Muhammad", name_simple: "Muhammad", name_arabic: "مُحَمَّد", revelation_place: "Medinan", verses_count: 38 },
  { id: 48, name: "Al-Fath", name_simple: "Al-Fath", name_arabic: "ٱلْفَتْح", revelation_place: "Medinan", verses_count: 29 },
  { id: 49, name: "Al-Hujurat", name_simple: "Al-Hujurat", name_arabic: "ٱلْحُجُرَات", revelation_place: "Medinan", verses_count: 18 },
  { id: 50, name: "Qaf", name_simple: "Qaf", name_arabic: "قٰ", revelation_place: "Meccan", verses_count: 45 },
  { id: 51, name: "Ad-Dhariyat", name_simple: "Ad-Dhariyat", name_arabic: "ٱلذَّارِيَات", revelation_place: "Meccan", verses_count: 60 },
  { id: 52, name: "At-Tur", name_simple: "At-Tur", name_arabic: "ٱلطُّور", revelation_place: "Meccan", verses_count: 49 },
  { id: 53, name: "An-Najm", name_simple: "An-Najm", name_arabic: "ٱلنَّجْم", revelation_place: "Meccan", verses_count: 62 },
  { id: 54, name: "Al-Qamar", name_simple: "Al-Qamar", name_arabic: "ٱلْقَمَر", revelation_place: "Meccan", verses_count: 55 },
  { id: 55, name: "Ar-Rahman", name_simple: "Ar-Rahman", name_arabic: "ٱلرَّحْمَٰن", revelation_place: "Medinan", verses_count: 78 },
  { id: 56, name: "Al-Waqi'ah", name_simple: "Al-Waqi'ah", name_arabic: "ٱلْوَاقِعَة", revelation_place: "Meccan", verses_count: 96 },
  { id: 57, name: "Al-Hadid", name_simple: "Al-Hadid", name_arabic: "ٱلْحَدِيد", revelation_place: "Medinan", verses_count: 29 },
  { id: 58, name: "Al-Mujadila", name_simple: "Al-Mujadila", name_arabic: "ٱلْمُجَادِلَة", revelation_place: "Medinan", verses_count: 22 },
  { id: 59, name: "Al-Hashr", name_simple: "Al-Hashr", name_arabic: "ٱلْحَشْر", revelation_place: "Medinan", verses_count: 24 },
  { id: 60, name: "Al-Mumtahina", name_simple: "Al-Mumtahina", name_arabic: "ٱلْمُمْتَحِنَة", revelation_place: "Medinan", verses_count: 13 },
  { id: 61, name: "As-Saff", name_simple: "As-Saff", name_arabic: "ٱلصَّفّ", revelation_place: "Medinan", verses_count: 14 },
  { id: 62, name: "Al-Jumu'ah", name_simple: "Al-Jumu'ah", name_arabic: "ٱلْجُمُعَة", revelation_place: "Medinan", verses_count: 11 },
  { id: 63, name: "Al-Munafiqun", name_simple: "Al-Munafiqun", name_arabic: "ٱلْمُنَافِقُون", revelation_place: "Medinan", verses_count: 11 },
  { id: 64, name: "At-Taghabun", name_simple: "At-Taghabun", name_arabic: "ٱلتَّغَابُن", revelation_place: "Medinan", verses_count: 18 },
  { id: 65, name: "At-Talaq", name_simple: "At-Talaq", name_arabic: "ٱلطَّلَاق", revelation_place: "Medinan", verses_count: 12 },
  { id: 66, name: "At-Tahrim", name_simple: "At-Tahrim", name_arabic: "ٱلتَّحْرِيم", revelation_place: "Medinan", verses_count: 12 },
  { id: 67, name: "Al-Mulk", name_simple: "Al-Mulk", name_arabic: "ٱلْمُلْك", revelation_place: "Meccan", verses_count: 30 },
  { id: 68, name: "Al-Qalam", name_simple: "Al-Qalam", name_arabic: "ٱلْقَلَم", revelation_place: "Meccan", verses_count: 52 },
  { id: 69, name: "Al-Haqqah", name_simple: "Al-Haqqah", name_arabic: "ٱلْحَاقَّة", revelation_place: "Meccan", verses_count: 52 },
  { id: 70, name: "Al-Ma'arij", name_simple: "Al-Ma'arij", name_arabic: "ٱلْمَعَارِج", revelation_place: "Meccan", verses_count: 44 },
  { id: 71, name: "Nuh", name_simple: "Nuh", name_arabic: "نُوح", revelation_place: "Meccan", verses_count: 28 },
  { id: 72, name: "Al-Jinn", name_simple: "Al-Jinn", name_arabic: "ٱلْجِنّ", revelation_place: "Meccan", verses_count: 28 },
  { id: 73, name: "Al-Muzzammil", name_simple: "Al-Muzzammil", name_arabic: "ٱلْمُزَّمِّل", revelation_place: "Meccan", verses_count: 20 },
  { id: 74, name: "Al-Muddaththir", name_simple: "Al-Muddaththir", name_arabic: "ٱلْمُدَّثِّر", revelation_place: "Meccan", verses_count: 56 },
  { id: 75, name: "Al-Qiyamah", name_simple: "Al-Qiyamah", name_arabic: "ٱلْقِيَامَة", revelation_place: "Meccan", verses_count: 40 },
  { id: 76, name: "Al-Insan", name_simple: "Al-Insan", name_arabic: "ٱلْإِنسَان", revelation_place: "Medinan", verses_count: 31 },
  { id: 77, name: "Al-Mursalat", name_simple: "Al-Mursalat", name_arabic: "ٱلْمُرْسَلَات", revelation_place: "Meccan", verses_count: 50 },
  { id: 78, name: "An-Naba", name_simple: "An-Naba", name_arabic: "ٱلنَّبَأ", revelation_place: "Meccan", verses_count: 40 },
  { id: 79, name: "An-Nazi'at", name_simple: "An-Nazi'at", name_arabic: "ٱلنَّازِعَات", revelation_place: "Meccan", verses_count: 46 },
  { id: 80, name: "Abasa", name_simple: "Abasa", name_arabic: "عَبَسَ", revelation_place: "Meccan", verses_count: 42 },
  { id: 81, name: "At-Takwir", name_simple: "At-Takwir", name_arabic: "ٱلتَّكْوِير", revelation_place: "Meccan", verses_count: 29 },
  { id: 82, name: "Al-Infitar", name_simple: "Al-Infitar", name_arabic: "ٱلْإِنْفِطَار", revelation_place: "Meccan", verses_count: 19 },
  { id: 83, name: "Al-Mutaffifin", name_simple: "Al-Mutaffifin", name_arabic: "ٱلْمُطَفِّفِين", revelation_place: "Meccan", verses_count: 36 },
  { id: 84, name: "Al-Inshiqaq", name_simple: "Al-Inshiqaq", name_arabic: "ٱلْإِنْشِقَاق", revelation_place: "Meccan", verses_count: 25 },
  { id: 85, name: "Al-Buruj", name_simple: "Al-Buruj", name_arabic: "ٱلْبُرُوج", revelation_place: "Meccan", verses_count: 22 },
  { id: 86, name: "At-Tariq", name_simple: "At-Tariq", name_arabic: "ٱلطَّارِق", revelation_place: "Meccan", verses_count: 17 },
  { id: 87, name: "Al-A'la", name_simple: "Al-A'la", name_arabic: "ٱلْأَعْلَى", revelation_place: "Meccan", verses_count: 19 },
  { id: 88, name: "Al-Ghashiyah", name_simple: "Al-Ghashiyah", name_arabic: "ٱلْغَاشِيَة", revelation_place: "Meccan", verses_count: 26 },
  { id: 89, name: "Al-Fajr", name_simple: "Al-Fajr", name_arabic: "ٱلْفَجْر", revelation_place: "Meccan", verses_count: 30 },
  { id: 90, name: "Al-Balad", name_simple: "Al-Balad", name_arabic: "ٱلْبَلَد", revelation_place: "Meccan", verses_count: 20 },
  { id: 91, name: "Ash-Shams", name_simple: "Ash-Shams", name_arabic: "ٱلشَّمْس", revelation_place: "Meccan", verses_count: 15 },
  { id: 92, name: "Al-Layl", name_simple: "Al-Layl", name_arabic: "ٱلَّيل", revelation_place: "Meccan", verses_count: 21 },
  { id: 93, name: "Ad-Duha", name_simple: "Ad-Duha", name_arabic: "ٱلضُّحَى", revelation_place: "Meccan", verses_count: 11 },
  { id: 94, name: "Ash-Sharh", name_simple: "Ash-Sharh", name_arabic: "ٱلشَّرْح", revelation_place: "Meccan", verses_count: 8 },
  { id: 95, name: "At-Tin", name_simple: "At-Tin", name_arabic: "ٱلتِّين", revelation_place: "Meccan", verses_count: 8 },
  { id: 96, name: "Al-Alaq", name_simple: "Al-Alaq", name_arabic: "ٱلْعَلَق", revelation_place: "Meccan", verses_count: 19 },
  { id: 97, name: "Al-Qadr", name_simple: "Al-Qadr", name_arabic: "ٱلْقَدْر", revelation_place: "Meccan", verses_count: 5 },
  { id: 98, name: "Al-Bayyinah", name_simple: "Al-Bayyinah", name_arabic: "ٱلْبَيِّنَة", revelation_place: "Medinan", verses_count: 8 },
  { id: 99, name: "Az-Zalzalah", name_simple: "Az-Zalzalah", name_arabic: "ٱلزَّلْزَلَة", revelation_place: "Medinan", verses_count: 8 },
  { id: 100, name: "Al-Adiyat", name_simple: "Al-Adiyat", name_arabic: "ٱلْعَادِيَات", revelation_place: "Meccan", verses_count: 11 },
  { id: 101, name: "Al-Qari'ah", name_simple: "Al-Qari'ah", name_arabic: "ٱلْقَارِعَة", revelation_place: "Meccan", verses_count: 11 },
  { id: 102, name: "At-Takathur", name_simple: "At-Takathur", name_arabic: "ٱلْتَكَاثُر", revelation_place: "Meccan", verses_count: 8 },
  { id: 103, name: "Al-Asr", name_simple: "Al-Asr", name_arabic: "ٱلْعَصْر", revelation_place: "Meccan", verses_count: 3 },
  { id: 104, name: "Al-Humazah", name_simple: "Al-Humazah", name_arabic: "ٱلْهُمَزَة", revelation_place: "Meccan", verses_count: 9 },
  { id: 105, name: "Al-Fil", name_simple: "Al-Fil", name_arabic: "ٱلْفِيل", revelation_place: "Meccan", verses_count: 5 },
  { id: 106, name: "Quraysh", name_simple: "Quraysh", name_arabic: "قُرَيْش", revelation_place: "Meccan", verses_count: 4 },
  { id: 107, name: "Al-Ma'un", name_simple: "Al-Ma'un", name_arabic: "ٱلْمَاعُون", revelation_place: "Meccan", verses_count: 7 },
  { id: 108, name: "Al-Kawthar", name_simple: "Al-Kawthar", name_arabic: "ٱلْكَوْثَر", revelation_place: "Meccan", verses_count: 3 },
  { id: 109, name: "Al-Kafirun", name_simple: "Al-Kafirun", name_arabic: "ٱلْكَافِرُون", revelation_place: "Meccan", verses_count: 6 },
  { id: 110, name: "An-Nasr", name_simple: "An-Nasr", name_arabic: "ٱلنَّصْر", revelation_place: "Medinan", verses_count: 3 },
  { id: 111, name: "Al-Masad", name_simple: "Al-Masad", name_arabic: "ٱلْمَسَد", revelation_place: "Meccan", verses_count: 5 },
  { id: 112, name: "Al-Ikhlas", name_simple: "Al-Ikhlas", name_arabic: "ٱلْإِخْلَاص", revelation_place: "Meccan", verses_count: 4 },
  { id: 113, name: "Al-Falaq", name_simple: "Al-Falaq", name_arabic: "ٱلْفَلَق", revelation_place: "Meccan", verses_count: 5 },
  { id: 114, name: "An-Nas", name_simple: "An-Nas", name_arabic: "ٱلنَّاس", revelation_place: "Meccan", verses_count: 6 }
];

document.addEventListener('DOMContentLoaded', () => {
  loadBookmark();
  loadSurahs();
});

function loadBookmark() {
  try {
    const bookmark = JSON.parse(localStorage.getItem('quranBookmark'));
    if (bookmark && bookmark.surahId) {
      bookmarkedSurahId = bookmark.surahId;
    }
  } catch (e) {
    bookmarkedSurahId = null;
  }
}

function loadSurahs() {
  const loading = document.getElementById('loading');
  const surahList = document.getElementById('surahList');
  
  surahList.innerHTML = surahsData.map(surah => {
    const isBookmarked = bookmarkedSurahId === surah.id;
    return `
    <div class="surah-item ${isBookmarked ? 'bookmarked' : ''}" onclick="openSurah(${surah.id}, '${surah.name_simple.replace(/'/g, "\\'")}', '${surah.name_arabic}')">
      <div class="surah-info">
        <div class="surah-number">${surah.id}${isBookmarked ? '<span class="bookmark-dot"></span>' : ''}</div>
        <div>
          <div class="surah-name">${surah.name_simple}</div>
          <div class="surah-details">${surah.revelation_place} • ${surah.verses_count} verses</div>
        </div>
      </div>
      <div class="surah-arabic">${surah.name_arabic}</div>
    </div>
  `}).join('');
  
  loading.style.display = 'none';
}

window.openSurah = function(surahId, surahName, surahArabic) {
  localStorage.setItem('selectedSurah', JSON.stringify({
    id: surahId,
    name: surahName,
    arabic: surahArabic
  }));
  window.location.href = `quran-reader.html?surah=${surahId}`;
};
