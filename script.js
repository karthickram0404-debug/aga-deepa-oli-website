/* =========================================
   AGA DEEPA OLI — Tamil Poetry Website
   JavaScript: Navigation, Poetry CRUD,
   Accessibility, Animations
   ========================================= */

// ---- State ----
const STATE = {
  poems: [],
  currentSection: 'home',
  highContrast: false,
  largeFont: false,
  speaking: false
};

// ---- Sample Poems (pre-loaded) ----
const SAMPLE_POEMS = [
  {
    id: 1,
    title: 'காலை வணக்கம்',
    body: 'காலை எழும் கதிரவனே\nகனவுகளை நனவாக்கு\nபூமி மீது ஒளி பரப்பி\nபுத்துணர்ச்சி அளிப்பாயே',
    author: 'சந்திரசேகர் P',
    date: '2026-02-20',
    type: 'kavithai'
  },
  {
    id: 2,
    title: 'தமிழ் வாழ்க',
    body: 'தமிழ் என்றால் தேன் என்று\nதரணி எல்லாம் சொல்லும்\nஅமிழ்தமென ஊற்றெடுக்கும்\nஅழகிய செந்தமிழே',
    author: 'சந்திரசேகர் P',
    date: '2026-02-19',
    type: 'kavithai'
  },
  {
    id: 3,
    title: 'ஒளியின் பாதை',
    body: 'இருளில் ஒரு சிறு விளக்கு\nஎரிந்தால் போதும் உலகமே\nவிரிந்து காணும் வெளிச்சத்தை\nவிழிகள் இல்லா நாங்களும்\nஉணர்வோம் அன்பின் ஒளியினை',
    author: 'சந்திரசேகர் P',
    date: '2026-02-18',
    type: 'kavithai'
  },
  {
    id: 4,
    title: 'அன்பின் வலிமை',
    body: 'அன்பு என்பது ஒளி\nஅது இருளை அகற்றும்\nஇன்பம் தரும் நிலவு\nஇதயத்தில் ஒளிரும்\nபண்பு நிறை வாழ்வில்\nபரிவு மிகும் அன்பே',
    author: 'சந்திரசேகர் P',
    date: '2026-02-17',
    type: 'kavithai'
  },
  {
    id: 5,
    title: 'இயற்கையின் அழகு — ஒரு கட்டுரை',
    body: 'இயற்கை என்பது கடவுளின் கொடை. மரங்கள், நதிகள், மலைகள் அனைத்தும் நமக்கு வாழ்வின் அர்த்தத்தை கற்றுத்தருகின்றன. இயற்கையோடு இணைந்து வாழ்வதே உண்மையான வாழ்க்கை.\n\nநம் முன்னோர்கள் இயற்கையை மதித்து வாழ்ந்தனர். ஆனால் இன்று நாம் இயற்கையை அழிக்கிறோம். இதை நிறுத்தி, இயற்கையை காப்போம்.',
    author: 'சந்திரசேகர் P',
    date: '2026-02-16',
    type: 'katurai'
  }
];

// ---- Initialize ----
document.addEventListener('DOMContentLoaded', async () => {
  await loadPoems();
  renderPoems('kavithai');
  renderPoems('katurai');
  setupNavigation();
  setupForm();
  setupAccessibility();
  createParticles();
  setupScrollEffects();
  setupTrustGallery();
  await loadGalleryImages();
  setupSearch();
});

// ---- Poem Storage (Server API) ----
async function loadPoems() {
  try {
    const res = await fetch('/api/poems');
    if (res.ok) {
      STATE.poems = await res.json();
    } else {
      console.error('Failed to load poems from server');
      STATE.poems = [...SAMPLE_POEMS];
    }
  } catch (err) {
    console.error('Server not available, using sample poems:', err);
    STATE.poems = [...SAMPLE_POEMS];
  }
}

// ---- Render Poems ----
function renderPoems(type) {
  const containerId = type === 'kavithai' ? 'kavithai-grid' : 'katurai-grid';
  const container = document.getElementById(containerId);
  if (!container) return;

  const poems = STATE.poems.filter(p => p.type === type);

  if (poems.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px; color: var(--text-secondary); grid-column: 1/-1;">
        <p style="font-size:3rem; margin-bottom:12px;">📝</p>
        <p>இன்னும் ${type === 'kavithai' ? 'கவிதைகள்' : 'கட்டுரைகள்'} எதுவும் இல்லை. முதல் ${type === 'kavithai' ? 'கவிதையை' : 'கட்டுரையை'} எழுதுங்கள்!</p>
      </div>`;
    return;
  }

  container.innerHTML = poems.map(poem => `
    <article class="poetry-card" role="article" aria-label="${poem.title}">
      <h3 class="poetry-card-title">${escapeHTML(poem.title)}</h3>
      <div class="poetry-card-body">${escapeHTML(poem.body)}</div>
      <div class="poetry-card-meta">
        <span>✍ ${escapeHTML(poem.author)} · ${formatDate(poem.date)}</span>
        <div class="poetry-card-actions">
          <button class="poetry-action-btn" onclick="speakText('${escapeAttr(poem.title + '. ' + poem.body)}')" 
                  aria-label="Read aloud ${escapeAttr(poem.title)}" title="படிக்கவும்">
            🔊
          </button>
          <button class="poetry-action-btn" onclick="deletePoem(${poem.id})" 
                  aria-label="Delete ${escapeAttr(poem.title)}" title="நீக்கு">
            🗑️
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

// ---- Navigation ----
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-section');
      navigateTo(target);

      // Close mobile menu
      document.querySelector('.nav-menu').classList.remove('open');
      document.querySelector('.hamburger').classList.remove('active');
    });
  });

  // Hamburger toggle
  const hamburger = document.querySelector('.hamburger');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    document.querySelector('.nav-menu').classList.toggle('open');
  });

  // Handle CTA buttons
  document.querySelectorAll('[data-navigate]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(btn.getAttribute('data-navigate'));
    });
  });
}

function navigateTo(sectionId) {
  STATE.currentSection = sectionId;

  // Update active nav
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector(`.nav-link[data-section="${sectionId}"]`)?.classList.add('active');

  // Show/Hide sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(sectionId)?.classList.add('active');

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Focus management for accessibility
  const section = document.getElementById(sectionId);
  if (section) {
    const heading = section.querySelector('h2, h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus();
    }
  }
}

// ---- Poetry Form (Server API) ----
function setupForm() {
  const form = document.getElementById('poetry-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('poem-title').value.trim();
    const body = document.getElementById('poem-body').value.trim();
    const type = document.getElementById('poem-type').value;

    if (!title || !body) {
      showToast('தலைப்பு மற்றும் உள்ளடக்கத்தை நிரப்பவும்! ❌');
      return;
    }

    try {
      const res = await fetch('/api/poems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body,
          author: 'சந்திரசேகர் P',
          date: new Date().toISOString().split('T')[0],
          type
        })
      });

      if (res.ok) {
        const savedPoem = await res.json();
        STATE.poems.unshift(savedPoem);
        renderPoems('kavithai');
        renderPoems('katurai');
        form.reset();
        showToast('படைப்பு வெற்றிகரமாக பதிவேற்றப்பட்டது! ✅');
      } else {
        showToast('பதிவேற்றம் தோல்வி! மீண்டும் முயற்சிக்கவும் ❌');
      }
    } catch (err) {
      console.error('Error saving poem:', err);
      showToast('சேவையக பிழை! மீண்டும் முயற்சிக்கவும் ❌');
    }
  });
}

async function deletePoem(id) {
  if (confirm('இந்த படைப்பை நீக்க விரும்புகிறீர்களா?')) {
    try {
      const res = await fetch(`/api/poems/${id}`, { method: 'DELETE' });
      if (res.ok) {
        STATE.poems = STATE.poems.filter(p => p.id !== id);
        renderPoems('kavithai');
        renderPoems('katurai');
        showToast('படைப்பு நீக்கப்பட்டது 🗑️');
      } else {
        showToast('நீக்கம் தோல்வி! ❌');
      }
    } catch (err) {
      console.error('Error deleting poem:', err);
      showToast('சேவையக பிழை! ❌');
    }
  }
}

// ---- Accessibility ----
function setupAccessibility() {
  // High contrast toggle
  const contrastBtn = document.getElementById('toggle-contrast');
  if (contrastBtn) {
    contrastBtn.addEventListener('click', () => {
      STATE.highContrast = !STATE.highContrast;
      document.body.classList.toggle('high-contrast', STATE.highContrast);
      contrastBtn.setAttribute('aria-pressed', STATE.highContrast);
      showToast(STATE.highContrast ? 'உயர் மாறுபாடு இயக்கப்பட்டது ✅' : 'உயர் மாறுபாடு முடக்கப்பட்டது');
    });
  }

  // Font size controls
  const fontUpBtn = document.getElementById('font-increase');
  const fontDownBtn = document.getElementById('font-decrease');

  if (fontUpBtn) {
    fontUpBtn.addEventListener('click', () => {
      let size = parseFloat(getComputedStyle(document.documentElement).fontSize);
      if (size < 28) {
        document.documentElement.style.fontSize = (size + 2) + 'px';
        showToast('எழுத்து அளவு பெரிதாக்கப்பட்டது 🔍');
      }
    });
  }

  if (fontDownBtn) {
    fontDownBtn.addEventListener('click', () => {
      let size = parseFloat(getComputedStyle(document.documentElement).fontSize);
      if (size > 12) {
        document.documentElement.style.fontSize = (size - 2) + 'px';
        showToast('எழுத்து அளவு சிறிதாக்கப்பட்டது 🔎');
      }
    });
  }

  // Text-to-speech for page content
  const ttsBtn = document.getElementById('toggle-tts');
  if (ttsBtn) {
    ttsBtn.addEventListener('click', () => {
      if (STATE.speaking) {
        stopSpeaking();
        return;
      }
      const activeSection = document.querySelector('.section.active');
      if (activeSection) {
        const text = activeSection.innerText.substring(0, 1000);
        speakText(text);
      } else {
        speakText('அக தீப ஒளி, பார்வையற்றோர் நல அறக்கட்டளை மற்றும் இல்லம். தமிழ் கவிதைகளின் அழகிய தொகுப்பு.');
      }
    });
  }
}

// ---- Text-to-Speech Engine (Web Speech API) ----
// Works on Desktop and Mobile (Android/iOS)

let googleTamilVoice = null;
let speechChunks = [];
let speechIndex = 0;
let speakingInterval = null;

// Pre-load Tamil voice
function loadGoogleVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return;
  googleTamilVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('ta'))
    || voices.find(v => v.lang === 'ta-IN')
    || voices.find(v => v.lang.startsWith('ta'))
    || voices.find(v => v.name.toLowerCase().includes('tamil'))
    || voices[0];
  console.log('TTS Voice:', googleTamilVoice ? googleTamilVoice.name : 'none');
}

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = loadGoogleVoice;
  setTimeout(loadGoogleVoice, 500);
}

function stopSpeaking() {
  STATE.speaking = false;
  speechChunks = [];
  speechIndex = 0;
  clearInterval(speakingInterval);
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  showToast('வாசிப்பு நிறுத்தப்பட்டது ⏹️');
}

function cleanTextForSpeech(text) {
  return text
    .replace(/[\u{1F600}-\u{1FAFF}]/gu, '') // Remove emojis
    .replace(/[*#_\-=|↑→←]/g, ' ')
    .replace(/A\+|A\-/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Split into small chunks to prevent Speech API from silently stopping (Chrome bug)
function splitIntoSmallChunks(text) {
  const chunks = [];
  const parts = text.split(/([.!?,;:\n।]+\s*)/);
  let current = '';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (!part) continue;

    if (current.length + part.length > 80) {
      if (current.trim()) chunks.push(current.trim());
      current = part;
    } else {
      current += ' ' + part;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(c => c.length > 0);
}

function speakText(text) {
  if (!('speechSynthesis' in window)) {
    showToast('குரல் வாசிப்பு உங்கள் உலாவியில் ஆதரிக்கப்படவில்லை ❌');
    return;
  }

  if (STATE.speaking) {
    stopSpeaking();
    return;
  }

  let cleanText = cleanTextForSpeech(text);
  if (!cleanText || cleanText.length < 3) {
    showToast('வாசிக்க உரை இல்லை');
    return;
  }

  STATE.speaking = true;
  showToast('வாசிக்கிறது... 🔊');

  if (!googleTamilVoice) loadGoogleVoice();
  window.speechSynthesis.cancel();

  speechChunks = splitIntoSmallChunks(cleanText);
  speechIndex = 0;
  speakNextChunk();

  // Keep-alive interval for Android Chrome which might pause synthesis
  clearInterval(speakingInterval);
  speakingInterval = setInterval(() => {
    if (!STATE.speaking) {
      clearInterval(speakingInterval);
      return;
    }
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }
  }, 10000);
}

function speakNextChunk() {
  if (speechIndex >= speechChunks.length || !STATE.speaking) {
    stopSpeaking();
    showToast('வாசிப்பு முடிந்தது ✅');
    return;
  }

  const chunk = speechChunks[speechIndex++];
  const utterance = new SpeechSynthesisUtterance(chunk);

  if (googleTamilVoice) {
    utterance.voice = googleTamilVoice;
    utterance.lang = googleTamilVoice.lang;
  } else {
    utterance.lang = 'ta-IN';
  }

  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  utterance.onend = () => {
    if (STATE.speaking) setTimeout(speakNextChunk, 100);
  };

  utterance.onerror = (e) => {
    console.error('TTS Error:', e);
    if (e.error !== 'canceled' && STATE.speaking) {
      setTimeout(speakNextChunk, 150);
    }
  };

  window.speechSynthesis.speak(utterance);
}


// ---- Particles ----
function createParticles() {
  const container = document.querySelector('.bg-animation');
  if (!container) return;

  const colors = ['#DAA520', '#FFD700', '#FF6F00', '#C0392B', '#7B2D8E'];

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const size = Math.random() * 4 + 2;
    particle.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${Math.random() * 15 + 10}s;
      animation-delay: ${Math.random() * 10}s;
    `;
    container.appendChild(particle);
  }
}

// ---- Scroll Effects ----
function setupScrollEffects() {
  const header = document.querySelector('.header');
  const scrollTopBtn = document.querySelector('.scroll-top');

  window.addEventListener('scroll', () => {
    // Header shadow
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }

    // Scroll to top button
    if (scrollTopBtn) {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    }
  });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// ---- Utilities ----
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return str.replace(/'/g, "\\'").replace(/\n/g, ' ');
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ta-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ---- Contact Form Submission ----
function handleContactForm(e) {
  e.preventDefault();
  showToast('உங்கள் செய்தி அனுப்பப்பட்டது! நன்றி 📩');
  e.target.reset();
}

// ---- Trust Gallery Image Upload (Server API) ----
function setupTrustGallery() {
  const uploadInput = document.getElementById('trust-image-upload');
  const galleryGrid = document.getElementById('trust-gallery-grid');
  if (!uploadInput || !galleryGrid) return;

  uploadInput.addEventListener('change', async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of files) {
      if (
        !file.type.startsWith('image/') &&
        !file.type.startsWith('video/') &&
        file.type !== 'application/pdf'
      ) continue;

      try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('alt', file.name);

        const res = await fetch('/api/images', {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          const savedImage = await res.json();
          addGalleryImageToGrid(savedImage, galleryGrid);
          showToast('படம் சேர்க்கப்பட்டது! 📸');
        } else {
          showToast('படம் பதிவேற்றம் தோல்வி! ❌');
        }
      } catch (err) {
        console.error('Error uploading image:', err);
        showToast('சேவையக பிழை! ❌');
      }
    }
    uploadInput.value = '';
  });
}

// ---- Load Gallery Images from Server ----
async function loadGalleryImages() {
  const galleryGrid = document.getElementById('trust-gallery-grid');
  if (!galleryGrid) return;

  try {
    const res = await fetch('/api/images');
    if (res.ok) {
      const images = await res.json();
      // Clear any static placeholder images
      galleryGrid.innerHTML = '';
      images.forEach(img => addGalleryImageToGrid(img, galleryGrid));
    }
  } catch (err) {
    console.error('Could not load gallery images:', err);
  }
}

// ---- Add Single Image/Video/PDF to Gallery Grid ----
function addGalleryImageToGrid(itemData, galleryGrid) {
  const item = document.createElement('div');
  item.className = 'trust-gallery-item';
  item.setAttribute('data-gallery-id', itemData.id);

  let mediaContent = '';

  if (itemData.mimetype && itemData.mimetype.startsWith('video/')) {
    mediaContent = `<video src="${itemData.url}" controls style="width:100%;height:100%;object-fit:cover;border-radius:12px;"></video>`;
  } else if (itemData.mimetype === 'application/pdf') {
    mediaContent = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;background:#f0f4f8;border-radius:12px;color:var(--primary);">
        <span style="font-size:3rem;margin-bottom:8px;">📄</span>
        <a href="${itemData.url}" target="_blank" style="color:var(--primary);font-weight:bold;text-decoration:none;background:var(--secondary);color:white;padding:4px 12px;border-radius:20px;font-size:0.9rem;">PDF படிக்கவும்</a>
      </div>`;
  } else {
    mediaContent = `<img src="${itemData.url}" alt="${itemData.alt || 'அறக்கட்டளை நிகழ்வு'}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`;
  }

  item.innerHTML = `${mediaContent}
    <button class="gallery-delete-btn" onclick="deleteGalleryImage(this)" aria-label="நீக்கு" title="நீக்கு">✕</button>`;
  galleryGrid.appendChild(item);
}

// ---- Delete Gallery Image (Server API) ----
async function deleteGalleryImage(btn) {
  if (confirm('இந்த படத்தை நீக்க விரும்புகிறீர்களா? (Delete this image?)')) {
    const item = btn.closest('.trust-gallery-item');
    if (!item) return;

    const imageId = item.getAttribute('data-gallery-id');

    try {
      const res = await fetch(`/api/images/${imageId}`, { method: 'DELETE' });
      if (res.ok) {
        item.style.transition = 'all 0.3s ease';
        item.style.transform = 'scale(0)';
        item.style.opacity = '0';
        setTimeout(() => item.remove(), 300);
        showToast('படம் நீக்கப்பட்டது 🗑️');
      } else {
        showToast('படம் நீக்கம் தோல்வி! ❌');
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      showToast('சேவையக பிழை! ❌');
    }
  }
}

// ---- Search Functionality ----
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const searchClear = document.getElementById('search-clear');
  if (!searchInput || !searchResults) return;

  // Searchable content database
  const searchData = [
    // Poems
    ...STATE.poems.map(p => ({
      title: p.title,
      desc: p.body.substring(0, 80) + '...',
      icon: p.type === 'kavithai' ? '✍' : '📜',
      section: p.type === 'kavithai' ? 'padaipukal' : 'katuraikal',
      type: p.type === 'kavithai' ? 'கவிதை' : 'கட்டுரை'
    })),
    // Trust topics
    { title: 'அக தீப ஒளி அறக்கட்டளை', desc: 'Aga Deepa Oli Blind Welfare Trust And Home - Thirunindravur, Chennai', icon: '🏛️', section: 'trust', type: 'அறக்கட்டளை' },
    { title: 'தங்கும் வசதி', desc: 'பார்வையற்றோருக்கு பாதுகாப்பான தங்கும் இல்லம்', icon: '🏠', section: 'trust', type: 'சேவை' },
    { title: 'பிரெயில் கல்வி', desc: 'பிரெயில் கல்வி மற்றும் தொழில்நுட்ப பயிற்சி', icon: '📚', section: 'trust', type: 'சேவை' },
    { title: 'வேலைவாய்ப்பு உதவி', desc: 'தொழில் பயிற்சி மற்றும் வேலை வாய்ப்புகள்', icon: '💼', section: 'trust', type: 'சேவை' },
    { title: 'கண் சிகிச்சை', desc: 'கண் சிகிச்சை மற்றும் ஆலோசனை சேவைகள்', icon: '🩺', section: 'trust', type: 'சேவை' },
    { title: 'கலை மற்றும் கலாச்சாரம்', desc: 'இசை, நாடகம் மற்றும் கலை பயிற்சிகள்', icon: '🎭', section: 'trust', type: 'சேவை' },
    { title: 'யூடியூப் சேனல்', desc: 'Aga Deepa Oli YouTube Channel - நிகழ்வு வீடியோக்கள்', icon: '📺', section: 'trust', type: 'அறக்கட்டளை' },
    { title: 'நிகழ்வு படங்கள்', desc: 'அறக்கட்டளை நிகழ்வுகள் படத் தொகுப்பு', icon: '📸', section: 'trust', type: 'அறக்கட்டளை' },
    // Inspirational figures
    { title: 'திருவள்ளுவர்', desc: 'திருக்குறள் ஆசிரியர் — 133 அதிகாரங்கள், 1330 குறள்கள்', icon: '📜', section: 'home', type: 'கவிஞர்' },
    { title: 'பாரதியார்', desc: 'மகாகவி — புரட்சிக் கவிஞர், சுதந்திரப் போராட்ட வீரர்', icon: '🔥', section: 'home', type: 'கவிஞர்' },
    { title: 'ஹெலன் கெல்லர் (Helen Keller)', desc: 'பார்வையற்ற, செவிடு அமெரிக்க எழுத்தாளர் மற்றும் சமூக ஆர்வலர்', icon: '🌟', section: 'home', type: 'ஊக்குவிப்பாளர்' },
    { title: 'லூயி பிரெயில் (Louis Braille)', desc: 'பிரெயில் எழுத்து முறையை கண்டுபிடித்தவர்', icon: '⠿', section: 'home', type: 'ஊக்குவிப்பாளர்' },
    { title: 'அந்தகக்கவி வீரராகவ முதலியார்', desc: 'புகழ்பெற்ற பார்வையற்ற தமிழ் கவிஞர்', icon: '🎭', section: 'home', type: 'கவிஞர்' },
    // About
    { title: 'சந்திரசேகர் P', desc: 'முதுகலை தமிழ் ஆசிரியர் — BA, MA, B.Ed, M.Phil Tamil', icon: '👤', section: 'about', type: 'ஆசிரியர்' },
    // Contact
    { title: 'தொடர்பு கொள்ள', desc: 'தொலைபேசி: +91 99405 12193, Google Maps இடம்', icon: '📞', section: 'contact', type: 'தொடர்பு' },
  ];

  let debounceTimer;

  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = searchInput.value.trim().toLowerCase();

    searchClear.style.display = query ? 'flex' : 'none';

    if (query.length < 2) {
      searchResults.style.display = 'none';
      return;
    }

    debounceTimer = setTimeout(() => {
      const results = searchData.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.desc.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
      );

      if (results.length > 0) {
        searchResults.innerHTML = results.map(r => `
          <div class="search-result-item" data-section="${r.section}">
            <span class="result-icon">${r.icon}</span>
            <div class="result-text">
              <div class="result-title">${r.title}</div>
              <div class="result-desc">${r.type} — ${r.desc}</div>
            </div>
          </div>
        `).join('');
      } else {
        searchResults.innerHTML = '<div class="search-no-results">🔍 முடிவுகள் இல்லை (No results found)</div>';
      }
      searchResults.style.display = 'block';

      // Click on result to navigate
      searchResults.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const section = item.getAttribute('data-section');
          navigateTo(section);
          searchInput.value = '';
          searchResults.style.display = 'none';
          searchClear.style.display = 'none';
        });
      });
    }, 200);
  });

  // Clear button
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchResults.style.display = 'none';
    searchClear.style.display = 'none';
    searchInput.focus();
  });

  // Close results when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
      searchResults.style.display = 'none';
    }
  });

  // ---- Voice Search (Speech Recognition) ----
  const voiceBtn = document.getElementById('search-voice');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (voiceBtn && SpeechRecognition) {
    let recognition = null;
    let isListening = false;
    let voiceTimeout = null;
    let finalText = '';

    function stopVoiceSearch() {
      isListening = false;
      clearTimeout(voiceTimeout);
      voiceBtn.classList.remove('voice-active');
      voiceBtn.textContent = '🎤';
      if (recognition) {
        try { recognition.stop(); } catch (e) { }
        recognition = null;
      }
    }

    function startVoiceSearch() {
      finalText = '';
      recognition = new SpeechRecognition();

      // Accept both Tamil and English
      recognition.lang = 'ta-IN';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 5;

      isListening = true;
      voiceBtn.classList.add('voice-active');
      voiceBtn.textContent = '⏺';
      showToast('பேசுங்கள்... 🎤 தமிழ் / English');

      // Auto-stop after 15 seconds
      voiceTimeout = setTimeout(() => {
        if (isListening) {
          stopVoiceSearch();
          if (searchInput.value.trim()) {
            showToast('குரல் தேடல் முடிந்தது ✅');
          } else {
            showToast('எந்த குரலும் கேட்கவில்லை. மீண்டும் முயற்சிக்கவும்');
          }
        }
      }, 15000);

      recognition.onresult = function (event) {
        let interim = '';
        finalText = '';

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript + ' ';
          } else {
            interim += result[0].transcript;
          }
        }

        // Show final + interim text in search box
        const displayText = (finalText + interim).trim();
        if (displayText) {
          searchInput.value = displayText;
          searchClear.style.display = 'flex';
          // Trigger search with final text only
          if (finalText.trim()) {
            searchInput.dispatchEvent(new Event('input'));
          }
        }
      };

      recognition.onend = function () {
        // On mobile, recognition ends after each phrase
        // If still in listening mode, restart
        if (isListening && !finalText.trim()) {
          // Try English if Tamil didn't work
          try {
            recognition = new SpeechRecognition();
            recognition.lang = 'en-IN';
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.maxAlternatives = 5;
            recognition.onresult = arguments.callee; // reuse same handler
            recognition.onresult = function (event) {
              let text = '';
              for (let i = 0; i < event.results.length; i++) {
                text += event.results[i][0].transcript;
              }
              if (text.trim()) {
                searchInput.value = text.trim();
                searchClear.style.display = 'flex';
                searchInput.dispatchEvent(new Event('input'));
              }
            };
            recognition.onend = function () { stopVoiceSearch(); };
            recognition.onerror = function () { stopVoiceSearch(); };
            recognition.start();
            showToast('English-ல் முயற்சிக்கிறது... 🎤');
            return;
          } catch (e) {
            stopVoiceSearch();
          }
        } else {
          stopVoiceSearch();
          if (finalText.trim()) {
            searchInput.value = finalText.trim();
            searchInput.dispatchEvent(new Event('input'));
            showToast('குரல் தேடல் முடிந்தது ✅');
          }
        }
      };

      recognition.onerror = function (e) {
        console.log('Voice error:', e.error);
        if (e.error === 'no-speech') {
          // No speech detected — try English
          stopVoiceSearch();
          showToast('குரல் கேட்கவில்லை. சத்தமாக பேசுங்கள் 🔊');
        } else if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          stopVoiceSearch();
          showToast('மைக் அனுமதி வேண்டும். Browser settings → Microphone → Allow ❌');
        } else if (e.error === 'network') {
          stopVoiceSearch();
          showToast('இணைய இணைப்பு தேவை (Internet required) ❌');
        } else if (e.error !== 'aborted') {
          stopVoiceSearch();
          showToast('குரல் தேடல் பிழை. மீண்டும் முயற்சிக்கவும் ❌');
        }
      };

      try {
        recognition.start();
      } catch (e) {
        stopVoiceSearch();
        showToast('குரல் தேடல் தொடங்க இயலவில்லை ❌');
      }
    }

    voiceBtn.addEventListener('click', () => {
      if (isListening) {
        stopVoiceSearch();
        if (searchInput.value.trim()) {
          showToast('குரல் தேடல் முடிந்தது ✅');
        }
      } else {
        startVoiceSearch();
      }
    });

  } else if (voiceBtn) {
    voiceBtn.style.display = 'none';
  }

  // ---- Search Bar: Hide on Scroll Down, Show on Scroll Up / Touch ----
  const searchContainer = document.getElementById('search-container');
  let lastScrollY = window.scrollY;
  let scrollTicking = false;

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 150) {
          // Scrolling DOWN — hide search
          searchContainer.classList.add('search-hidden');
        } else {
          // Scrolling UP — show search
          searchContainer.classList.remove('search-hidden');
        }
        lastScrollY = currentScrollY;
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  });

  // Show search on touch/click anywhere on the page
  document.addEventListener('touchstart', () => {
    searchContainer.classList.remove('search-hidden');
  }, { passive: true });
}
