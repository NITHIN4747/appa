/* ════════════════════════════════════════════
   DAD'S ROYAL BIRTHDAY SITE — main.js
   Handles: scroll progress, particle shimmer,
   IntersectionObserver reveals, lightbox
   ════════════════════════════════════════════ */

'use strict';

// ── 1. SCROLL PROGRESS BAR ────────────────────
const progressBar = document.getElementById('progressBar');

function updateProgress() {
  const scrolled = window.scrollY;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const pct = total > 0 ? (scrolled / total) * 100 : 0;
  progressBar.style.width = pct + '%';
}

window.addEventListener('scroll', updateProgress, { passive: true });

// ── 2. INTERSECTION OBSERVER — REVEAL ────────
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // stagger siblings inside the same parent
      const siblings = [...entry.target.parentElement.querySelectorAll('.reveal, .reveal-left, .reveal-right')];
      const idx = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = (idx * 0.1) + 's';
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => revealObserver.observe(el));

// ── 3. PARTICLE SHIMMER ───────────────────────
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

let particles = [];
let W, H;

function resizeCanvas() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function createParticle() {
  return {
    x: randomBetween(0, W),
    y: randomBetween(H * 0.6, H),
    size: randomBetween(0.6, 2),
    speedY: randomBetween(0.2, 0.7),
    speedX: randomBetween(-0.15, 0.15),
    opacity: 0,
    maxOpacity: randomBetween(0.3, 0.8),
    life: 0,
    maxLife: randomBetween(120, 260),
  };
}

function initParticles() {
  particles = [];
  const count = Math.min(60, Math.floor(W / 20));
  for (let i = 0; i < count; i++) {
    const p = createParticle();
    p.life = Math.floor(Math.random() * p.maxLife); // stagger starts
    particles.push(p);
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, W, H);

  for (const p of particles) {
    p.life++;
    p.y -= p.speedY;
    p.x += p.speedX;

    const progress = p.life / p.maxLife;
    if (progress < 0.2) {
      p.opacity = (progress / 0.2) * p.maxOpacity;
    } else if (progress > 0.75) {
      p.opacity = ((1 - progress) / 0.25) * p.maxOpacity;
    } else {
      p.opacity = p.maxOpacity;
    }

    // Draw as subtle round golden stardust (no diamonds)
    ctx.save();
    ctx.globalAlpha = p.opacity * 0.7;
    ctx.fillStyle = '#d4a24c';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Reset when done
    if (p.life >= p.maxLife) {
      Object.assign(p, createParticle());
      p.life = 0;
    }
  }

  requestAnimationFrame(drawParticles);
}

window.addEventListener('resize', () => {
  resizeCanvas();
  initParticles();
});

resizeCanvas();
initParticles();
drawParticles();

// ── 4. STICKY HERO SCROLLYTELLING ─────────────
const heroTrack = document.getElementById('heroTrack');
const heroImg = document.querySelector('.hero-img');
const stepCards = [
  document.getElementById('step1'),
  document.getElementById('step2'),
  document.getElementById('step3')
];
const storyDots = document.querySelectorAll('.story-progress-indicator .dot');

let currentActiveStep = 0;

function updateHeroStory() {
  if (!heroTrack) return;
  const rect = heroTrack.getBoundingClientRect();
  const trackHeight = heroTrack.offsetHeight - window.innerHeight;
  if (trackHeight <= 0) return;

  // Normalized scroll progress inside the track (0.0 to 1.0)
  const progress = Math.min(Math.max(-rect.top / trackHeight, 0), 1);

  // Active step calculation
  let activeIndex = 0;
  if (progress < 0.28) {
    activeIndex = 0;
  } else if (progress < 0.68) {
    activeIndex = 1;
  } else {
    activeIndex = 2;
  }

  currentActiveStep = activeIndex;

  // Continuous subtle depth parallax for Dad's portrait
  if (heroImg && rect.top <= 0 && rect.bottom >= window.innerHeight) {
    const subtleParallax = progress * 24;
    heroImg.style.transform = `translateY(${subtleParallax}px)`;
  }

  stepCards.forEach((card, i) => {
    if (!card) return;
    if (i === activeIndex) {
      card.classList.add('is-active');
      card.classList.remove('is-exited-up', 'is-exited-down');
    } else if (i < activeIndex) {
      card.classList.remove('is-active', 'is-exited-down');
      card.classList.add('is-exited-up');
    } else {
      card.classList.remove('is-active', 'is-exited-up');
      card.classList.add('is-exited-down');
    }
  });

  storyDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === activeIndex);
  });
}

// Click on dots to jump smoothly to that chapter
storyDots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    if (!heroTrack) return;
    const trackHeight = heroTrack.offsetHeight - window.innerHeight;
    const targetFractions = [0.02, 0.45, 0.90];
    const targetScroll = heroTrack.offsetTop + (trackHeight * targetFractions[i]);
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  });
});

// Clickable Scroll Hint buttons
const hintStep1 = document.getElementById('heroScrollHint1');
const hintStep2 = document.getElementById('heroScrollHint2');
const hintStep3 = document.getElementById('heroScrollHint3');

if (hintStep1) {
  hintStep1.addEventListener('click', () => {
    if (!heroTrack) return;
    const trackHeight = heroTrack.offsetHeight - window.innerHeight;
    window.scrollTo({ top: heroTrack.offsetTop + (trackHeight * 0.45), behavior: 'smooth' });
  });
}

if (hintStep2) {
  hintStep2.addEventListener('click', () => {
    if (!heroTrack) return;
    const trackHeight = heroTrack.offsetHeight - window.innerHeight;
    window.scrollTo({ top: heroTrack.offsetTop + (trackHeight * 0.90), behavior: 'smooth' });
  });
}

if (hintStep3) {
  hintStep3.addEventListener('click', () => {
    const kavSection = document.getElementById('kavithai');
    if (kavSection) {
      kavSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

// Wheel navigation helper for silky-smooth progression
let isWheelNavigating = false;
window.addEventListener('wheel', (e) => {
  if (!heroTrack) return;
  const rect = heroTrack.getBoundingClientRect();
  const trackHeight = heroTrack.offsetHeight - window.innerHeight;
  if (trackHeight <= 0) return;

  // Only assist when hero stage is pinned in viewport
  const isHeroInView = rect.top <= 10 && rect.bottom >= (window.innerHeight - 10);
  if (!isHeroInView || isWheelNavigating) return;

  // Ignore tiny jitter
  if (Math.abs(e.deltaY) < 30) return;

  const targetFractions = [0.02, 0.45, 0.90];

  if (e.deltaY > 0) {
    // Scrolling down
    if (currentActiveStep === 0) {
      e.preventDefault();
      isWheelNavigating = true;
      window.scrollTo({ top: heroTrack.offsetTop + (trackHeight * targetFractions[1]), behavior: 'smooth' });
      setTimeout(() => { isWheelNavigating = false; }, 600);
    } else if (currentActiveStep === 1) {
      e.preventDefault();
      isWheelNavigating = true;
      window.scrollTo({ top: heroTrack.offsetTop + (trackHeight * targetFractions[2]), behavior: 'smooth' });
      setTimeout(() => { isWheelNavigating = false; }, 600);
    } else if (currentActiveStep === 2 && rect.bottom > window.innerHeight + 15) {
      e.preventDefault();
      isWheelNavigating = true;
      const kavSection = document.getElementById('kavithai');
      if (kavSection) kavSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => { isWheelNavigating = false; }, 600);
    }
  } else {
    // Scrolling up
    if (currentActiveStep === 2) {
      e.preventDefault();
      isWheelNavigating = true;
      window.scrollTo({ top: heroTrack.offsetTop + (trackHeight * targetFractions[1]), behavior: 'smooth' });
      setTimeout(() => { isWheelNavigating = false; }, 600);
    } else if (currentActiveStep === 1) {
      e.preventDefault();
      isWheelNavigating = true;
      window.scrollTo({ top: heroTrack.offsetTop + (trackHeight * targetFractions[0]), behavior: 'smooth' });
      setTimeout(() => { isWheelNavigating = false; }, 600);
    }
  }
}, { passive: false });

// Mobile touch swipe gesture navigation helper
let touchStartY = 0;
let touchStartX = 0;
let isTouchNavigating = false;

if (heroTrack) {
  heroTrack.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    }
  }, { passive: true });

  heroTrack.addEventListener('touchend', (e) => {
    if (isTouchNavigating || e.changedTouches.length === 0) return;
    const rect = heroTrack.getBoundingClientRect();
    const trackHeight = heroTrack.offsetHeight - window.innerHeight;
    if (trackHeight <= 0) return;

    // Only assist if hero stage is in view
    const isHeroInView = rect.top <= 10 && rect.bottom >= (window.innerHeight - 10);
    if (!isHeroInView) return;

    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    const diffY = touchEndY - touchStartY;
    const diffX = touchEndX - touchStartX;

    // Trigger only on distinct vertical swipe
    if (Math.abs(diffY) > 50 && Math.abs(diffY) > Math.abs(diffX) * 1.2) {
      const targetFractions = [0.02, 0.45, 0.90];
      if (diffY < 0) {
        // Swiped UP (Advance to next step)
        if (currentActiveStep === 0) {
          isTouchNavigating = true;
          window.scrollTo({ top: heroTrack.offsetTop + (trackHeight * targetFractions[1]), behavior: 'smooth' });
          setTimeout(() => { isTouchNavigating = false; }, 550);
        } else if (currentActiveStep === 1) {
          isTouchNavigating = true;
          window.scrollTo({ top: heroTrack.offsetTop + (trackHeight * targetFractions[2]), behavior: 'smooth' });
          setTimeout(() => { isTouchNavigating = false; }, 550);
        } else if (currentActiveStep === 2 && rect.bottom > window.innerHeight + 15) {
          isTouchNavigating = true;
          const kavSection = document.getElementById('kavithai');
          if (kavSection) kavSection.scrollIntoView({ behavior: 'smooth' });
          setTimeout(() => { isTouchNavigating = false; }, 550);
        }
      } else {
        // Swiped DOWN (Go back to previous step)
        if (currentActiveStep === 2) {
          isTouchNavigating = true;
          window.scrollTo({ top: heroTrack.offsetTop + (trackHeight * targetFractions[1]), behavior: 'smooth' });
          setTimeout(() => { isTouchNavigating = false; }, 550);
        } else if (currentActiveStep === 1) {
          isTouchNavigating = true;
          window.scrollTo({ top: heroTrack.offsetTop + (trackHeight * targetFractions[0]), behavior: 'smooth' });
          setTimeout(() => { isTouchNavigating = false; }, 550);
        }
      }
    }
  }, { passive: true });
}

window.addEventListener('scroll', updateHeroStory, { passive: true });
updateHeroStory();

// ── 5. SMOOTH SCROLL for any nav links ────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── 7. DYNAMIC LIFETIME STATS CALCULATOR ───────
// Birthdate: October 15, 1974 (1974-10-15 00:00:00)
const birthDate = new Date(1974, 9, 15, 0, 0, 0);

function updateDynamicAge() {
  const now = new Date();
  const diffMs = now - birthDate;
  if (diffMs < 0) return;

  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);
  const totalWeeks = Math.floor(totalDays / 7);
  const remainingDaysInWeek = totalDays % 7;

  // Exact Years, Months, Days calculation
  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();
  let days = now.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalMonths = (years * 12) + months;

  // Number formatting with commas
  const formatNum = (num) => num.toLocaleString('en-IN');

  const elYears = document.getElementById('dynYears');
  const elYMD = document.getElementById('dynYMD');
  const elMonths = document.getElementById('dynMonths');
  const elMD = document.getElementById('dynMD');
  const elWeeks = document.getElementById('dynWeeks');
  const elWD = document.getElementById('dynWD');
  const elDays = document.getElementById('dynDays');
  const elHours = document.getElementById('dynHours');
  const elMinutes = document.getElementById('dynMinutes');
  const elSeconds = document.getElementById('dynSeconds');

  if (elYears) elYears.textContent = years;
  if (elYMD) elYMD.textContent = `ஆண்டுகள் ${months} மாதங்கள் ${days} நாட்கள்`;
  if (elMonths) elMonths.textContent = formatNum(totalMonths);
  if (elMD) elMD.textContent = `மாதங்கள் ${days} நாட்கள்`;
  if (elWeeks) elWeeks.textContent = formatNum(totalWeeks);
  if (elWD) elWD.textContent = `வாரங்கள் ${remainingDaysInWeek} நாட்கள்`;
  if (elDays) elDays.textContent = formatNum(totalDays);
  if (elHours) elHours.textContent = formatNum(totalHours);
  if (elMinutes) elMinutes.textContent = formatNum(totalMinutes);
  if (elSeconds) elSeconds.textContent = formatNum(totalSeconds);
}

// Initial calculation & live ticker every second
updateDynamicAge();
setInterval(updateDynamicAge, 1000);

// ── 8. KAVITHAI INTERACTION & CELEBRATION BURST ─
const greetBtn = document.getElementById('kavithaiGreetBtn');

function createConfettiBurst(originX, originY) {
  const colors = ['#e4b862', '#c9973e', '#ffffff', '#f7a8b8', '#ffd166'];
  for (let i = 0; i < 40; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-burst-particle';
    el.style.left = originX + 'px';
    el.style.top = originY + 'px';
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 140;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance - 50;

    el.style.setProperty('--destX', destX + 'px');
    el.style.setProperty('--destY', destY + 'px');

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }
}

if (greetBtn) {
  greetBtn.addEventListener('click', () => {
    const rect = greetBtn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2 + window.scrollY;
    createConfettiBurst(x, y);

    greetBtn.style.transform = 'scale(1.12)';
    setTimeout(() => {
      greetBtn.style.transform = '';
    }, 220);
  });
}

// ── 8. KAVITHAI PHOTO POPUP & PREVIEW SYSTEM ──
const hoverPreview = document.getElementById('kavithaiHoverPreview');
const hoverImg = document.getElementById('kavithaiHoverImg');
const hoverCaption = document.getElementById('kavithaiHoverCaption');

const photoModal = document.getElementById('kavithaiPhotoModal');
const modalImg = document.getElementById('kavithaiModalImg');
const modalCaption = document.getElementById('kavithaiModalCaption');
const modalClose = document.getElementById('kavithaiModalClose');
const modalBackdrop = document.getElementById('kavithaiModalBackdrop');

const photoPills = document.querySelectorAll('.kav-photo-trigger');

function positionHoverPreview(pill) {
  if (!hoverPreview) return;
  const pillRect = pill.getBoundingClientRect();
  const previewWidth = Math.min(280, window.innerWidth - 30);
  const previewHeight = 220; // approximate estimate
  
  // Center horizontally relative to pill
  let left = pillRect.left + (pillRect.width / 2) - (previewWidth / 2);
  // Default position: above the pill
  let top = pillRect.top - previewHeight - 16;

  // If clipping at top of viewport, position cleanly below the pill
  if (top < 15) {
    top = pillRect.bottom + 16;
  }

  // Constrain left/right inside screen
  if (left < 15) left = 15;
  if (left + previewWidth > window.innerWidth - 15) {
    left = window.innerWidth - previewWidth - 15;
  }

  hoverPreview.style.left = `${left}px`;
  hoverPreview.style.top = `${top}px`;
}

photoPills.forEach(pill => {
  const imgSrc = pill.getAttribute('data-img');
  const captionText = pill.getAttribute('data-caption') || pill.textContent;

  // 1. Smooth Floating Hover Pop-up: Never disturbs the kavithai text layout
  pill.addEventListener('mouseenter', () => {
    if (!imgSrc || !hoverPreview) return;
    hoverImg.src = imgSrc;
    hoverCaption.textContent = captionText;
    positionHoverPreview(pill);
    hoverPreview.classList.add('is-visible');
  });

  pill.addEventListener('mousemove', () => {
    if (hoverPreview && hoverPreview.classList.contains('is-visible')) {
      positionHoverPreview(pill);
    }
  });

  pill.addEventListener('mouseleave', () => {
    if (hoverPreview) {
      hoverPreview.classList.remove('is-visible');
    }
  });

  // 2. Click Pop-up: Opens Grand Royal Photo Modal
  pill.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!imgSrc || !photoModal) return;
    if (hoverPreview) hoverPreview.classList.remove('is-visible');

    modalImg.src = imgSrc;
    modalCaption.textContent = captionText;
    photoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
});

function closePhotoModal() {
  if (!photoModal) return;
  photoModal.classList.remove('active');
  document.body.style.overflow = '';
  setTimeout(() => {
    if (modalImg) modalImg.src = '';
  }, 350);
}

if (modalClose) modalClose.addEventListener('click', closePhotoModal);
if (modalBackdrop) modalBackdrop.addEventListener('click', closePhotoModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && photoModal && photoModal.classList.contains('active')) {
    closePhotoModal();
  }
});

// ── 9. ROYAL ENTRY GATE & BACKGROUND BGM ──────
const royalEntryOverlay = document.getElementById('royalEntryOverlay');
const royalEnterBtn = document.getElementById('royalEnterBtn');
const audioToggleBtn = document.getElementById('audioToggleBtn');
const audioLabel = document.getElementById('audioLabel');
const bgMusic = document.getElementById('bgMusic');

function playMusic() {
  if (!bgMusic) return;
  bgMusic.play().then(() => {
    if (audioToggleBtn) audioToggleBtn.classList.add('is-playing');
    if (audioLabel) audioLabel.textContent = 'இசை ஒலிக்கிறது';
  }).catch(err => {
    console.log('Audio playback interaction required:', err);
  });
}

function pauseMusic() {
  if (!bgMusic) return;
  bgMusic.pause();
  if (audioToggleBtn) audioToggleBtn.classList.remove('is-playing');
  if (audioLabel) audioLabel.textContent = 'இசையை இயக்க';
}

if (royalEnterBtn) {
  royalEnterBtn.addEventListener('click', () => {
    playMusic();
    if (royalEntryOverlay) {
      royalEntryOverlay.classList.add('is-entered');
    }
  });
}

if (audioToggleBtn) {
  audioToggleBtn.addEventListener('click', () => {
    if (!bgMusic) return;
    if (bgMusic.paused) {
      playMusic();
    } else {
      pauseMusic();
    }
  });
}

// ── 10. POSTAL ENVELOPE & LINE-BY-LINE SCROLL REVEAL ──
const postalStage = document.getElementById('postalStage');
const envelopeFlap = document.getElementById('envelopeFlap');
const waxSeal = document.getElementById('waxSeal');
const scrollRevealLines = document.querySelectorAll('.scroll-reveal-line');

// 1. Envelope Unsealing & Letter Emerge Trigger
if (postalStage) {
  const envelopeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        postalStage.classList.add('is-open');
        if (scrollRevealLines.length > 0) {
          scrollRevealLines[0].classList.add('is-revealed');
        }
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -20px 0px'
  });

  envelopeObserver.observe(postalStage);

  // Click on wax seal or post cover also opens/toggles with tactile response
  if (waxSeal) {
    waxSeal.addEventListener('click', (e) => {
      e.stopPropagation();
      postalStage.classList.toggle('is-open');
      if (scrollRevealLines.length > 0) {
        scrollRevealLines[0].classList.add('is-revealed');
      }
    });
  }
}

// 2. Line-by-Line Scroll Reveal for Kavithai Verses
if (scrollRevealLines.length > 0) {
  const lineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -5% 0px'
  });

  scrollRevealLines.forEach(line => lineObserver.observe(line));

  // Dynamic scroll listener ensures lines illuminate smoothly as user reads down
  let lineScrollTicking = false;
  function updateLinesOnScroll() {
    const vh = window.innerHeight;
    scrollRevealLines.forEach(line => {
      const rect = line.getBoundingClientRect();
      if (rect.top < vh * 0.90) {
        line.classList.add('is-revealed');
      }
    });
    lineScrollTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!lineScrollTicking) {
      requestAnimationFrame(updateLinesOnScroll);
      lineScrollTicking = true;
    }
  }, { passive: true });

  // Initial check
  setTimeout(updateLinesOnScroll, 100);
}
