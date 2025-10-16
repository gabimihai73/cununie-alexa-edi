/* script.js — galerie + upload Cloudinary (automat după taguri, cu lightbox/slider) */

/* CONFIG */
const cloudName = "dwbbhet1h"; // numele tău Cloudinary
const unsignedUploadPreset = "CununieAlexaEdi"; // presetul de upload
const tagsList = ["alexa", "familie"];

// Transformarea cerută de utilizator pentru miniaturi (400x400)
const THUMBNAIL_TRANSFORMATION = 'w_400,h_400,c_fill,g_auto,q_auto,f_auto';

/* Referințe UI */
const galleryModal = document.getElementById('galleryModal'); // Modalul pentru grilă
const imagesGrid = document.getElementById('imagesGrid');
const modalTitle = document.getElementById('modalTitle');
const closeModal = document.getElementById('closeModal');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const uploadStatus = document.getElementById('uploadStatus');
const targetSelect = document.getElementById('targetGallery');

// NOU: Referințe Lightbox
const lightboxModal = document.getElementById('lightboxModal');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxDownloadBtn = document.getElementById('lightboxDownloadBtn');
const closeLightbox = document.getElementById('closeLightbox');
// NOU: Referințe Navigare
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');

/* Variabile de Stare Lightbox */
let activeGalleryKey = null;
let currentImageIndex = 0;

/* Zonă de debug */
const debugBox = document.createElement('div');
debugBox.id = 'debugBox';
debugBox.style.cssText = `
  margin-top: 20px;
  padding: 10px;
  background: rgba(255,255,255,0.8);
  border: 1px solid #ccc;
  border-radius: 8px;
  font-family: monospace;
  font-size: 13px;
  color: #333;
  white-space: pre-line;
`;
document.body.appendChild(debugBox);

/* Structură galerii (va stoca imaginile preluate) */
const galleries = { alexa: [], familie: [] };

/* Funcție: actualizează logul de debug */
function logDebug(message) {
  const now = new Date().toLocaleTimeString();
  debugBox.textContent = `[${now}] ${message}\n` + debugBox.textContent;
}

/**
 * Funcție: cere imagini din Cloudinary după tag.
 */
async function fetchImagesByTag(tag) {
  const endpoint = `https://res.cloudinary.com/${cloudName}/image/list/${tag}.json`;
  try {
    const res = await fetch(endpoint, { cache: "no-store" }); 
    if (!res.ok) throw new Error(`Eroare HTTP ${res.status}. Activează "Resource list" în Cloudinary Security Settings.`);
    const data = await res.json();
    
    const list = (data.resources || []).map(resource => {
      const publicId = resource.public_id;
      const format = resource.format;

      // 1. URL pentru miniatura optimizată (400x400)
      const thumbnailUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${THUMBNAIL_TRANSFORMATION}/${publicId}.${format}`;
      
      // 2. URL original full-size (fără transformare)
      const originalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.${format}`;

      return {
        url: thumbnailUrl,
        originalUrl: originalUrl,
        name: publicId.split('/').pop() + (format ? `.${format}` : ''),
        downloadUrl: originalUrl
      };
    });
    
    logDebug(`Tag "${tag}": ${list.length} imagini găsite.`);
    return list;
  } catch (err) {
    logDebug(`Eroare la preluarea imaginilor pentru tagul "${tag}": ${err.message}`);
    console.error("ERROARE CLOUDINARY:", err.message); 
    return [];
  }
}

/* Funcție: încarcă toate galeriile la inițializarea paginii */
async function loadAllGalleries() {
  logDebug("Încărcare completă a galeriilor din Cloudinary...");
  for (const tag of tagsList) {
    galleries[tag] = await fetchImagesByTag(tag);
  }
  logDebug("Încărcare inițială finalizată.");
}

/**
 * Deschide o galerie (afișează grila de miniaturi)
 */
function openGallery(key) {
  activeGalleryKey = key; // Setează galeria activă
  modalTitle.textContent = key === 'alexa' ? 'Alexa & Edi' : 'Familie & invitați';
  imagesGrid.innerHTML = '<p style="padding:12px;color:#6e5840">Se încarcă galeria...</p>';
  galleryModal.classList.remove('hidden');

  const list = galleries[key] || [];

  imagesGrid.innerHTML = ''; // Golește mesajul de încărcare

  if (!list.length) {
    imagesGrid.innerHTML = '<p style="padding:12px;color:#6e5840">Galeria este goală. Niciun fișier găsit.</p>';
  } else {
    list.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'image-card';
      
      const img = document.createElement('img');
      img.src = item.url; // Folosește miniatura 400x400
      img.alt = item.name;
      
      // NOU: Ataseaza listener pentru Lightbox, trimițând indexul imaginii
      img.addEventListener('click', () => showLightbox(index)); 
      
      const a = document.createElement('a');
      a.className = 'dl-btn';
      a.href = item.downloadUrl; 
      a.download = item.name;
      a.textContent = 'Descarcă';
      
      card.appendChild(img);
      card.appendChild(a);
      imagesGrid.appendChild(card);
    });
  }
}

/**
 * Setează imaginea curentă în lightbox.
 */
function updateLightboxContent(index) {
    const list = galleries[activeGalleryKey];
    if (!list || list.length === 0) return;

    // Asigură-te că indexul rămâne în limitele listei (ciclare)
    if (index < 0) {
        currentImageIndex = list.length - 1;
    } else if (index >= list.length) {
        currentImageIndex = 0;
    } else {
        currentImageIndex = index;
    }

    const item = list[currentImageIndex];
    
    lightboxImage.src = item.originalUrl; // Imagine full-size
    lightboxImage.alt = item.name;
    lightboxDownloadBtn.href = item.downloadUrl;
    lightboxDownloadBtn.download = item.name;

    // Actualizează numărul de poze
    document.getElementById('lightboxCaption').textContent = `${currentImageIndex + 1} / ${list.length}`;
}

/**
 * Deschide imaginea full-size într-un lightbox/slider dedicat.
 */
function showLightbox(startIndex) {
    if (!activeGalleryKey || !galleries[activeGalleryKey].length) return;
    
    galleryModal.classList.add('hidden'); // Ascunde grila de miniaturi
    
    updateLightboxContent(startIndex);
    
    lightboxModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Blochează scroll-ul pe fundal
}

/**
 * Navigare între imagini (Inainte/Inapoi)
 */
function navigate(direction) {
    updateLightboxContent(currentImageIndex + direction);
}

// Navigare: Legare butoane
prevButton.addEventListener('click', () => navigate(-1));
nextButton.addEventListener('click', () => navigate(1));

// Navigare: Legare taste săgeți (pentru o experiență mai bună)
document.addEventListener('keydown', (e) => {
    if (lightboxModal.classList.contains('hidden')) return; // Doar dacă modalul e deschis
    if (e.key === 'ArrowLeft') {
        navigate(-1);
    } else if (e.key === 'ArrowRight') {
        navigate(1);
    } else if (e.key === 'Escape') {
        // Închidere Lightbox la tasta Escape
        lightboxModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
});


// Închidere Lightbox
closeLightbox.addEventListener('click', () => {
    lightboxModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
});
lightboxModal.addEventListener('click', e => { 
    // Închidere doar la click pe fundalul gri, nu pe imagine sau butoane
    if (e.target === lightboxModal) {
        lightboxModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
});

// Închidere modal Grid
closeModal.addEventListener('click', () => galleryModal.classList.add('hidden'));
galleryModal.addEventListener('click', e => { if (e.target === galleryModal) galleryModal.classList.add('hidden'); });

/* Upload imagini noi (cu reîmprospătare galerie) */
uploadBtn.addEventListener('click', async () => {
  const files = fileInput.files;
  if (!files.length) {
    uploadStatus.textContent = 'Selectează fișiere înainte de upload.';
    return;
  }

  const target = targetSelect.value;
  uploadStatus.textContent = 'Încărcare în curs...';
  uploadBtn.disabled = true;

  let successfulUploads = 0;
  
  for (const f of files) {
    const form = new FormData();
    form.append('file', f);
    form.append('upload_preset', unsignedUploadPreset);
    form.append('tags', target);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      
      if (data.secure_url) {
        successfulUploads++;
        logDebug(`Upload reușit (${target}): ${data.original_filename}`);
      } else {
        throw new Error(data.error?.message || 'necunoscut');
      }
    } catch (err) {
      console.error('Upload error', err);
      logDebug(`Eroare upload (${target}): ${f.name} - ${err.message}`);
    }
  }
  
  uploadBtn.disabled = false;
  fileInput.value = '';
  
  // Reîncarcă galeria pentru tagul respectiv pentru a include imaginile noi
  uploadStatus.textContent = `Se reîmprospătează galeria "${target}"...`;
  await loadAllGalleries(); // Reîncarcă toate galeriile pentru consistență
  
  uploadStatus.textContent = `Au fost încărcate cu succes ${successfulUploads} fișiere. Galeria "${target}" este actualizată.`;
  logDebug(`Galeria "${target}" a fost reîmprospătată după upload.`);
});

/* Inițializează la încărcarea paginii */
document.addEventListener('DOMContentLoaded', async () => {
  logDebug("Inițializare pagină...");
  
  await loadAllGalleries();

  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', e => {
      const key = card.getAttribute('data-gallery');
      openGallery(key);
    });
  });

  logDebug("Toate galeriile sunt pregătite pentru afișare.");
});
