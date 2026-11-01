const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const langSwitch = document.querySelector('.lang-switch');
const langOptions = document.querySelectorAll('.lang-option');
const imageModal = document.createElement('div');
let currentGallery = [];
let currentIndex = 0;
let translations = {};
let currentLanguage = 'en';

navToggle?.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  siteNav?.classList.toggle('nav-open');
});

function updateLanguageSelection(lang) {
  currentLanguage = lang;
  langSwitch?.setAttribute('data-language', currentLanguage);
  langOptions.forEach((option) => {
    const optionLang = option.getAttribute('data-lang');
    option.classList.toggle('active', optionLang === currentLanguage);
  });
  applyTranslations();
}

langSwitch?.addEventListener('click', () => {
  const nextLanguage = currentLanguage === 'tr' ? 'en' : 'tr';
  updateLanguageSelection(nextLanguage);
});

langOptions.forEach((button) => {
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    const selectedLang = button.getAttribute('data-lang');
    if (!selectedLang) return;
    const nextLanguage = selectedLang === currentLanguage ? (currentLanguage === 'tr' ? 'en' : 'tr') : selectedLang;
    updateLanguageSelection(nextLanguage);
  });
});

async function loadTranslations() {
  try {
    const response = await fetch('translations.json');
    if (!response.ok) throw new Error('Çeviri dosyası yüklenemedi');
    translations = await response.json();
    applyTranslations();
  } catch (error) {
    console.warn('Çeviri dosyası yüklenirken hata oluştu:', error);
  }
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    const translation = translations[key]?.[currentLanguage];
    element.textContent = translation || '';
  });

  const cvButton = document.querySelector('.contact-cv-button');
  if (cvButton) {
    const cvLanguage = currentLanguage === 'tr' ? 'TR' : 'EN';
    const cvFile = `static/about/EcemOzdogan_CV_${cvLanguage}.pdf`;
    cvButton.setAttribute('href', cvFile);
    cvButton.setAttribute('download', `EcemOzdogan_CV_${cvLanguage}.pdf`);
  }

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription && translations.page_description?.[currentLanguage]) {
    metaDescription.setAttribute('content', translations.page_description[currentLanguage]);
  }

  document.documentElement.lang = currentLanguage;
}

loadTranslations();

function createImageModal() {
  imageModal.className = 'image-modal';
  imageModal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-content">
      <button type="button" class="modal-close" aria-label="Kapat">×</button>
      <button type="button" class="modal-arrow modal-prev" aria-label="Önceki">‹</button>
      <button type="button" class="modal-arrow modal-next" aria-label="Sonraki">›</button>
      <img src="" alt="" />
    </div>
  `;
  document.body.appendChild(imageModal);

  const closeButton = imageModal.querySelector('.modal-close');
  const backdrop = imageModal.querySelector('.modal-backdrop');
  const prevButton = imageModal.querySelector('.modal-prev');
  const nextButton = imageModal.querySelector('.modal-next');

  closeButton?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);
  prevButton?.addEventListener('click', showPreviousImage);
  nextButton?.addEventListener('click', showNextImage);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
    if (event.key === 'ArrowLeft') showPreviousImage();
    if (event.key === 'ArrowRight') showNextImage();
  });
}

function openModal(index, gallery) {
  if (!imageModal.parentElement) createImageModal();
  currentGallery = gallery;
  currentIndex = index;
  updateModalImage();
  imageModal.classList.add('open');
}

function closeModal() {
  imageModal.classList.remove('open');
}

function updateModalImage() {
  const modalImage = imageModal.querySelector('img');
  const item = currentGallery[currentIndex];
  if (modalImage && item) {
    modalImage.src = item.src;
    modalImage.alt = item.alt;
  }
}

function fitPortraitGalleryCards() {
  document.querySelectorAll('.project-card .gallery-block .image-card, .skill-card .skill-gallery .image-card').forEach((card) => {
    if (card.closest('.mobile-full-slide-gallery') && window.matchMedia('(max-width: 900px)').matches) {
      card.style.aspectRatio = '';
      card.style.height = '';
      card.style.width = '';
      card.style.flex = '';
      card.style.minWidth = '';
      card.style.maxWidth = '';
      return;
    }

    const image = card.querySelector('img');
    if (!image?.naturalWidth || !image.naturalHeight) return;

    card.style.aspectRatio = '';
    card.style.height = '';
    card.style.width = '';
    card.style.flex = '';
    card.style.minWidth = '';
    card.style.maxWidth = '';

    const imageRatio = image.naturalWidth / image.naturalHeight;
    const cardHeight = card.getBoundingClientRect().height;
    card.style.aspectRatio = 'auto';
    card.style.height = `${cardHeight}px`;
    card.style.width = `${cardHeight * imageRatio}px`;
    card.style.flex = '0 0 auto';
    card.style.minWidth = '0';
    card.style.maxWidth = 'none';
  });
}

function showPreviousImage() {
  if (!currentGallery.length) return;
  currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
  updateModalImage();
}

function showNextImage() {
  if (!currentGallery.length) return;
  currentIndex = (currentIndex + 1) % currentGallery.length;
  updateModalImage();
}

const galleryContainers = document.querySelectorAll('.project-card, .skill-card');
galleryContainers.forEach((container) => {
  const cards = Array.from(container.querySelectorAll('.image-card'));
  const gallery = cards.map((card) => {
    const image = card.querySelector('img');
    return {
      src: card.getAttribute('data-full') || '',
      alt: (image && image.alt) || 'Ekran görüntüsü',
    };
  });

  cards.forEach((card, index) => {
    card.querySelector('img')?.addEventListener('load', fitPortraitGalleryCards);
    card.addEventListener('click', () => {
      openModal(index, gallery);
    });
  });
});

fitPortraitGalleryCards();
window.addEventListener('resize', fitPortraitGalleryCards);

const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
const sections = Array.from(navLinks).map((link) => {
  const targetId = link.getAttribute('href')?.slice(1);
  return targetId ? document.getElementById(targetId) : null;
}).filter(Boolean);

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

const topScrollTargets = [
  document.querySelector('.brand'),
  document.querySelector('.site-nav a[href="#about"]')
].filter(Boolean);

topScrollTargets.forEach((target) => {
  target.addEventListener('click', (event) => {
    event.preventDefault();
    scrollToTop();
  });
});

function updateActiveNav() {
  const scrollPosition = window.scrollY + window.innerHeight / 3;

  let activeLink = navLinks[0];

  for (const link of navLinks) {
    const targetId = link.getAttribute('href')?.slice(1);
    if (!targetId) continue;
    const section = document.getElementById(targetId);
    if (!section) continue;
    const sectionTop = section.offsetTop;
    if (scrollPosition >= sectionTop) {
      activeLink = link;
    }
  }

  navLinks.forEach((link) => {
    link.classList.toggle('active', link === activeLink);
  });
}

window.addEventListener('scroll', updateActiveNav);
window.addEventListener('resize', updateActiveNav);
updateActiveNav();

const experienceTrack = document.querySelector('.experience-track');
const experienceSlider = document.querySelector('.experience-slider');
const experienceWrapper = document.querySelector('.experience-slider-wrapper');
const prevBtn = document.querySelector('.experience-nav-prev');
const nextBtn = document.querySelector('.experience-nav-next');
const mobileExperienceToggle = document.querySelector('.experience-mobile-toggle');

const experienceScene = { state: 'start', shift: 0, index: 0 };

function getExperienceGap() {
  if (!experienceTrack) return 0;
  return parseFloat(getComputedStyle(experienceTrack).gap) || 0;
}

function isMediumExperienceLayout() {
  return window.matchMedia('(min-width: 721px) and (max-width: 900px)').matches;
}

function getExperienceCards() {
  return experienceTrack ? Array.from(experienceTrack.children) : [];
}

function getMediumExperienceEndIndex() {
  return Math.max(0, getExperienceCards().length - 2);
}

function updateExperienceButtons() {
  if (!experienceTrack) return;
  const isAtEnd = isMediumExperienceLayout()
    ? experienceScene.index >= getMediumExperienceEndIndex()
    : experienceScene.state === 'shifted';
  prevBtn?.toggleAttribute('hidden', experienceScene.state === 'start');
  nextBtn?.toggleAttribute('hidden', isAtEnd);
  experienceWrapper?.classList.toggle('start-state', experienceScene.state === 'start');
  experienceWrapper?.classList.toggle('shifted-state', experienceScene.state === 'shifted');
}

function resetExperienceView() {
  if (!experienceTrack) return;
  experienceScene.state = 'start';
  experienceScene.shift = 0;
  experienceScene.index = 0;
  experienceTrack.style.transform = 'translateX(0)';
  experienceTrack.style.marginLeft = '0';
  updateExperienceButtons();
}

function setMediumExperienceIndex(index) {
  if (!experienceTrack || !experienceSlider) return;
  const cards = getExperienceCards();
  const nextIndex = Math.min(Math.max(index, 0), getMediumExperienceEndIndex());
  const gap = getExperienceGap();
  const shift = cards.slice(0, nextIndex).reduce((sum, card) => (
    sum + card.getBoundingClientRect().width + gap
  ), 0);

  experienceScene.state = nextIndex === 0 ? 'start' : 'shifted';
  experienceScene.index = nextIndex;
  experienceScene.shift = shift;
  experienceTrack.style.transform = `translateX(-${shift}px)`;
  experienceTrack.style.marginLeft = '0';
  updateExperienceButtons();
}

function setShiftedExperience() {
  if (!experienceTrack || !experienceSlider) return;
  if (isMediumExperienceLayout()) {
    setMediumExperienceIndex(experienceScene.index + 1);
    return;
  }

  const gap = getExperienceGap();
  const firstThree = Array.from(experienceTrack.children).slice(0, 3);
  const remainingTwo = Array.from(experienceTrack.children).slice(3, 5);
  const shift = firstThree.reduce((sum, card, index) => {
    const width = card.getBoundingClientRect().width;
    return sum + width + (index < firstThree.length - 1 ? gap : 0);
  }, 0);
  const remainingWidth = remainingTwo.reduce((sum, card, index) => {
    const width = card.getBoundingClientRect().width;
    return sum + width + (index < remainingTwo.length - 1 ? gap : 0);
  }, 0);
  const marginLeft = 0;

  experienceScene.state = 'shifted';
  experienceScene.shift = shift;
  experienceTrack.style.transform = `translateX(-${shift}px)`;
  experienceTrack.style.marginLeft = `${marginLeft}px`;
  updateExperienceButtons();
}

nextBtn?.addEventListener('click', () => {
  if (isMediumExperienceLayout()) {
    setMediumExperienceIndex(experienceScene.index + 1);
    return;
  }
  if (experienceScene.state === 'start') {
    setShiftedExperience();
  }
});

prevBtn?.addEventListener('click', () => {
  if (isMediumExperienceLayout()) {
    setMediumExperienceIndex(experienceScene.index - 1);
    return;
  }
  resetExperienceView();
});

mobileExperienceToggle?.addEventListener('click', () => {
  const expanded = mobileExperienceToggle.getAttribute('aria-expanded') !== 'true';
  experienceWrapper?.classList.toggle('experience-mobile-expanded', expanded);
  mobileExperienceToggle.setAttribute('aria-expanded', String(expanded));
  mobileExperienceToggle.setAttribute('aria-label', expanded ? 'Daha az deneyim göster' : 'Daha fazla deneyim göster');
  mobileExperienceToggle.textContent = expanded ? '↑' : '↓';
});

window.addEventListener('resize', () => {
  const isMobileExperience = window.matchMedia('(max-width: 700px)').matches;
  if (isMobileExperience) {
    resetExperienceView();
  } else if (isMediumExperienceLayout()) {
    setMediumExperienceIndex(experienceScene.index);
  } else if (experienceScene.state === 'shifted') {
    setShiftedExperience();
  }
  if (!isMobileExperience) {
    experienceWrapper?.classList.remove('experience-mobile-expanded');
    mobileExperienceToggle?.setAttribute('aria-expanded', 'false');
    mobileExperienceToggle?.setAttribute('aria-label', 'Daha fazla deneyim göster');
    if (mobileExperienceToggle) mobileExperienceToggle.textContent = '↓';
  }
  updateExperienceButtons();
});

updateExperienceButtons();
