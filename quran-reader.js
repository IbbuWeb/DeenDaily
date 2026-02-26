// Quran Reader - Shows Arabic, English, Urdu with localStorage bookmarks

let currentSurahId = null;
let currentSurahName = '';
let bookmarkedVerseNumber = null;
let currentlyPlaying = null;
let audioPlayer = new Audio();
let versesList = [];

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const surahId = urlParams.get('surah');
  
  if (surahId) {
    currentSurahId = parseInt(surahId);
    loadBookmark();
    loadScrollPosition();
    loadSurah(surahId);
    setupScrollPositionSaving();
  } else {
    window.location.href = 'quran.html';
  }
});

function loadBookmark() {
  try {
    const bookmark = JSON.parse(localStorage.getItem('quranBookmark'));
    if (bookmark && bookmark.surahId === currentSurahId) {
      bookmarkedVerseNumber = bookmark.verseNumber;
    }
  } catch (e) {
    bookmarkedVerseNumber = null;
  }
}

function loadScrollPosition() {
  try {
    const scrollPos = localStorage.getItem('quranScrollPosition');
    if (scrollPos) {
      const pos = JSON.parse(scrollPos);
      if (pos.surahId === currentSurahId) {
        setTimeout(() => {
          window.scrollTo(0, pos.scrollY);
        }, 100);
      }
    }
  } catch (e) {}
}

function setupScrollPositionSaving() {
  let saveTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      localStorage.setItem('quranScrollPosition', JSON.stringify({
        surahId: currentSurahId,
        scrollY: window.scrollY
      }));
    }, 500);
  });
}

function saveBookmark(verseNumber) {
  localStorage.setItem('quranBookmark', JSON.stringify({
    surahId: currentSurahId,
    surahName: currentSurahName,
    verseNumber: verseNumber
  }));
  bookmarkedVerseNumber = verseNumber;
}

function removeBookmark() {
  localStorage.removeItem('quranBookmark');
  bookmarkedVerseNumber = null;
}

async function loadSurah(surahId) {
  const loading = document.getElementById('loading');
  const versesContainer = document.getElementById('versesList');
  const surahName = document.getElementById('surahName');
  const surahArabic = document.getElementById('surahArabic');
  
  // Get surah info from localStorage
  const savedSurah = JSON.parse(localStorage.getItem('selectedSurah') || '{}');
  currentSurahName = savedSurah.name || 'Surah';
  surahName.textContent = currentSurahName;
  surahArabic.textContent = savedSurah.arabic || '';
  
  try {
    const arabicRes = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/ar.alafasy`);
    const arabicData = await arabicRes.json();
    
    const englishRes = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/en.asad`);
    const englishData = await englishRes.json();
    
    const urduRes = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/ur.jalandhry`);
    const urduData = await urduRes.json();
    
    if (arabicData.data && englishData.data) {
      const arabicVerses = arabicData.data.ayahs;
      const englishVerses = englishData.data.ayahs;
      const urduVerses = urduData.data ? urduData.data.ayahs : [];
      versesList = arabicVerses;
      
      versesContainer.innerHTML = arabicVerses.map((verse, index) => {
        const englishVerse = englishVerses[index];
        const urduVerse = urduVerses[index];
        const isBookmarked = bookmarkedVerseNumber === verse.numberInSurah;
        const audioUrl = verse.audio || '';
        
        return `
          <div class="verse-card ${isBookmarked ? 'bookmarked' : ''}" data-verse="${verse.numberInSurah}" data-audio="${audioUrl}">
            <div class="verse-header">
              <div class="verse-number">${verse.numberInSurah}</div>
              <div class="verse-actions">
                <button class="verse-share-btn" onclick="shareVerse('${encodeURIComponent(verse.text)}', '${currentSurahName}', ${verse.numberInSurah})" title="Share verse">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                </button>
                ${audioUrl ? `
                  <button class="verse-audio-btn" onclick="playVerseAudio('${audioUrl}', ${verse.numberInSurah})" title="Play recitation">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </button>
                ` : ''}
                <button class="verse-bookmark-btn ${isBookmarked ? 'active' : ''}" onclick="toggleBookmark(${verse.numberInSurah})">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div class="verse-arabic">${verse.text}</div>
            ${englishVerse ? `<div class="verse-translation">${englishVerse.text || ''}</div>` : ''}
            ${urduVerse ? `<div class="verse-urdu">${urduVerse.text || ''}</div>` : ''}
          </div>
        `;
      }).join('');
      
      loading.style.display = 'none';
      
      if (bookmarkedVerseNumber) {
        const bookmarkedEl = document.querySelector(`.verse-card[data-verse="${bookmarkedVerseNumber}"]`);
        if (bookmarkedEl) {
          setTimeout(() => {
            bookmarkedEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }
      }
    }
  } catch (error) {
    console.error('Error loading verses:', error);
    loading.innerHTML = `
      <p style="color: var(--text-tertiary); text-align: center;">Unable to load verses. Please try again.</p>
    `;
  }
}

window.toggleBookmark = function(verseNumber) {
  if (bookmarkedVerseNumber === verseNumber) {
    removeBookmark();
  } else {
    saveBookmark(verseNumber);
  }
  
  // Update UI for the specific verse
  const btn = document.querySelector(`.verse-card[data-verse="${verseNumber}"] .verse-bookmark-btn`);
  const card = document.querySelector(`.verse-card[data-verse="${verseNumber}"]`);
  
  if (btn) {
    btn.classList.toggle('active', bookmarkedVerseNumber === verseNumber);
    btn.querySelector('svg').setAttribute('fill', bookmarkedVerseNumber === verseNumber ? 'currentColor' : 'none');
  }
  if (card) {
    card.classList.toggle('bookmarked', bookmarkedVerseNumber === verseNumber);
  }
};

window.playVerseAudio = function(audioUrl, verseNumber) {
  const verseCard = document.querySelector(`.verse-card[data-verse="${verseNumber}"]`);
  const audioBtn = verseCard?.querySelector('.verse-audio-btn');
  
  if (!audioBtn || !verseCard) return;
  
  // Remove playing class from all verses
  document.querySelectorAll('.verse-card').forEach(card => {
    card.classList.remove('playing');
  });
  
  if (currentlyPlaying === verseNumber && !audioPlayer.paused) {
    // Just pause
    audioPlayer.pause();
    updateAudioButton(audioBtn, false);
    verseCard.classList.remove('playing');
    updateFloatingBar();
    return;
  }
  
  // Stop any currently playing audio
  if (currentlyPlaying !== null) {
    const prevBtn = document.querySelector(`.verse-card[data-verse="${currentlyPlaying}"] .verse-audio-btn`);
    if (prevBtn) updateAudioButton(prevBtn, false);
    audioPlayer.pause();
  }
  
  // Add playing class and scroll to verse
  verseCard.classList.add('playing');
  verseCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  currentlyPlaying = verseNumber;
  
  audioPlayer.src = audioUrl;
  audioPlayer.play().then(() => {
    updateFloatingBar();
  }).catch(e => console.error('Audio play error:', e));
  updateAudioButton(audioBtn, true);
};

function updateFloatingBar() {
  const bar = document.getElementById('audioBar');
  const info = document.getElementById('currentVerseInfo');
  const playPauseBtn = document.getElementById('playPauseBtn');
  
  if (currentlyPlaying !== null) {
    bar.classList.add('active');
    info.textContent = `${currentSurahName} - Verse ${currentlyPlaying}`;
    
    if (audioPlayer.paused) {
      playPauseBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    } else {
      playPauseBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
    }
  } else {
    bar.classList.remove('active');
  }
}

window.togglePlayPause = function() {
  if (currentlyPlaying === null) return;
  
  if (audioPlayer.paused) {
    audioPlayer.play();
  } else {
    audioPlayer.pause();
  }
  updateFloatingBar();
};

window.prevVerse = function() {
  if (currentlyPlaying === null) return;
  
  const currentIndex = versesList.findIndex(v => v.numberInSurah === currentlyPlaying);
  if (currentIndex > 0) {
    const prevVerse = versesList[currentIndex - 1];
    if (prevVerse.audio) {
      playVerseAudio(prevVerse.audio, prevVerse.numberInSurah);
    }
  }
};

window.nextVerse = function() {
  if (currentlyPlaying === null) return;
  
  const currentIndex = versesList.findIndex(v => v.numberInSurah === currentlyPlaying);
  if (currentIndex < versesList.length - 1) {
    const nextVerse = versesList[currentIndex + 1];
    if (nextVerse.audio) {
      playVerseAudio(nextVerse.audio, nextVerse.numberInSurah);
    }
  }
};

function updateAudioButton(btn, isPlaying) {
  if (!btn) return;
  const svg = btn.querySelector('svg');
  if (isPlaying) {
    svg.outerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
        <rect x="6" y="4" width="4" height="16"></rect>
        <rect x="14" y="4" width="4" height="16"></rect>
      </svg>
    `;
  } else {
    svg.outerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
    `;
  }
}

audioPlayer.addEventListener('ended', () => {
  const currentIndex = versesList.findIndex(v => v.numberInSurah === currentlyPlaying);
  
  // Remove playing class from current verse
  const currentCard = document.querySelector(`.verse-card[data-verse="${currentlyPlaying}"]`);
  if (currentCard) currentCard.classList.remove('playing');
  
  if (currentIndex !== -1 && currentIndex < versesList.length - 1) {
    const nextVerse = versesList[currentIndex + 1];
    if (nextVerse.audio) {
      const nextCard = document.querySelector(`.verse-card[data-verse="${nextVerse.numberInSurah}"]`);
      if (nextCard) {
        nextCard.classList.add('playing');
        nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      playVerseAudio(nextVerse.audio, nextVerse.numberInSurah);
      return;
    }
  }
  
  if (currentlyPlaying !== null) {
    const btn = document.querySelector(`.verse-card[data-verse="${currentlyPlaying}"] .verse-audio-btn`);
    if (btn) updateAudioButton(btn, false);
    updateFloatingBar();
  }
});

window.shareVerse = async function(encodedText, surah, ayah) {
  const text = decodeURIComponent(encodedText);
  
  if (window.DeenDaily?.shareContent) {
    const verseData = {
      text: text,
      surah: surah,
      ayah: ayah,
      type: 'quran-verse'
    };
    
    const shareResult = await window.DeenDaily.shareContent(verseData, 'quran');
    
    showQRModal(shareResult, text, surah, ayah);
  } else {
    const shareText = `"${text}"\n\n- ${surah}:${ayah}\n\nShared via Deen Daily`;
    
    if (navigator.share) {
      navigator.share({ title: 'Quran Verse', text: shareText }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        window.DeenDaily?.showToast('Copied to clipboard!', 'success');
      }).catch(() => {});
    }
  }
};

function showQRModal(shareResult, text, surah, ayah) {
  let modal = document.getElementById('qrModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'qrModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Share Verse</h3>
          <button class="modal-close" onclick="closeQRModal()">&times;</button>
        </div>
        <div class="modal-body" id="qrModalBody"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  const modalBody = document.getElementById('qrModalBody');
  modalBody.innerHTML = `
    <div class="qr-share-container">
      <p style="margin-bottom: 10px; color: var(--text-secondary);">${surah}:${ayah}</p>
      <div class="qr-code">
        <img src="${shareResult.qr}" alt="QR Code" />
      </div>
      <div class="share-options">
        <button class="share-btn copy" onclick="copyShareLink('${shareResult.url}')">
          📋 Copy Link
        </button>
        <button class="share-btn whatsapp" onclick="shareViaWhatsApp('${encodeURIComponent(text)}', '${surah}', ${ayah})">
          💬 WhatsApp
        </button>
        <button class="share-btn telegram" onclick="shareViaTelegram('${encodeURIComponent(text)}', '${surah}', ${ayah})">
          ✈️ Telegram
        </button>
      </div>
    </div>
  `;
  
  modal.classList.add('active');
}

function closeQRModal() {
  const modal = document.getElementById('qrModal');
  if (modal) modal.classList.remove('active');
}

window.closeQRModal = closeQRModal;

function copyShareLink(url) {
  navigator.clipboard.writeText(url).then(() => {
    window.DeenDaily?.showToast('Link copied!', 'success');
  });
}

function shareViaWhatsApp(text, surah, ayah) {
  const message = `${text}\n\n- ${surah}:${ayah}\n\nShared via Deen Daily`;
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
}

function shareViaTelegram(text, surah, ayah) {
  const message = `${text}\n\n- ${surah}:${ayah}\n\nShared via Deen Daily`;
  window.open(`https://t.me/share/url?url=${encodeURIComponent(message)}`, '_blank');
}
