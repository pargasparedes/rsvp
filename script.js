/* ═══════════════════════════════════════════════════════════════
   DANIELA Y ALEX — Wedding RSVP
   script.js
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── DOM References ────────────────────────────────────────── */
const screenHome    = document.getElementById('screen-home');
const screenDetails = document.getElementById('screen-details');
const enterBtn      = document.getElementById('enter-btn');
const backBtn       = document.getElementById('back-btn');
const rsvpForm      = document.getElementById('rsvp-form');
const formSuccess   = document.getElementById('form-success');
const formError     = document.getElementById('form-error');
const guestCountGrp = document.getElementById('guest-count-group');

// ── Countdown ─────────────────────────────────────────────────
(function () {
  const pad = n => String(n).padStart(2, '0');
  const dEl = document.getElementById('cd-d');
  const hEl = document.getElementById('cd-h');
  const mEl = document.getElementById('cd-m');
  const sEl = document.getElementById('cd-s');
  if (!dEl) return; // countdown not on page

  // ✏️ Set your wedding date and time here
  const target = new Date('2026-12-10T16:00:00');
  let prev = { d: '', h: '', m: '', s: '' };

  function flip(el) {
    el.classList.add('flip');
    setTimeout(() => el.classList.remove('flip'), 250);
  }

  function tick() {
    const diff = target - new Date();
    if (diff <= 0) {
      [dEl, hEl, mEl, sEl].forEach(e => e.textContent = '00');
      return;
    }
    const d = pad(Math.floor(diff / 86400000));
    const h = pad(Math.floor((diff % 86400000) / 3600000));
    const m = pad(Math.floor((diff % 3600000) / 60000));
    const s = pad(Math.floor((diff % 60000) / 1000));
    if (d !== prev.d) { flip(dEl); dEl.textContent = d; prev.d = d; }
    if (h !== prev.h) { flip(hEl); hEl.textContent = h; prev.h = h; }
    if (m !== prev.m) { flip(mEl); mEl.textContent = m; prev.m = m; }
    if (s !== prev.s) { flip(sEl); sEl.textContent = s; prev.s = s; }
  }

  tick();
  setInterval(tick, 1000);
})();


/* ═══════════════════════════════════════════════════════════════
   SCREEN TRANSITIONS
   ═══════════════════════════════════════════════════════════════ */

/**
 * Transition from HOME → DETAILS
 * Fades home out, then makes details active.
 */
function goToDetails() {
  // Prevent double-click
  enterBtn.style.pointerEvents = 'none';

  // Fade out home
  screenHome.classList.add('fade-out');
  screenHome.classList.remove('active');
  screenHome.setAttribute('aria-hidden', 'true');

  // Short delay so the fade-out is visible, then reveal details
  setTimeout(() => {
    screenHome.classList.remove('fade-out');
    screenHome.style.display = 'none'; // pull out of layout

    screenDetails.style.display = '';  // restore
    screenDetails.classList.add('active');
    screenDetails.removeAttribute('aria-hidden');

    // Scroll to top of details screen
    screenDetails.scrollTo({ top: 0, behavior: 'instant' });
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Trigger scroll-reveal for section blocks
    revealOnScroll();

    // Re-enable button
    enterBtn.style.pointerEvents = '';
  }, 700); // matches CSS transition duration
}

/**
 * Transition from DETAILS → HOME
 */
function goToHome() {
  backBtn.style.pointerEvents = 'none';

  screenDetails.classList.add('fade-out');
  screenDetails.classList.remove('active');
  screenDetails.setAttribute('aria-hidden', 'true');

  setTimeout(() => {
    screenDetails.classList.remove('fade-out');
    screenDetails.style.display = 'none';

    screenHome.style.display = '';
    screenHome.classList.add('active');
    screenHome.removeAttribute('aria-hidden');

    window.scrollTo({ top: 0, behavior: 'instant' });
    backBtn.style.pointerEvents = '';
  }, 700);
}

/* ─── Event Listeners for navigation ────────────────────────── */

// Click on names
enterBtn.addEventListener('click', goToDetails);

// Keyboard: Enter or Space on names
enterBtn.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    goToDetails();
  }
});

// Back button
backBtn.addEventListener('click', goToHome);

// Initial state: hide details screen from layout
screenDetails.style.display = 'none';


/* ═══════════════════════════════════════════════════════════════
   SCROLL-REVEAL FOR SECTION BLOCKS
   ═══════════════════════════════════════════════════════════════ */

const sectionBlocks = document.querySelectorAll('.section-block');

function revealOnScroll() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger each block slightly
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, i * 80);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  sectionBlocks.forEach((block) => {
    block.classList.remove('visible');
    observer.observe(block);
  });
}

// Trigger immediately for any blocks already in view
// (called again in goToDetails each time screen shows)
revealOnScroll();


/* ═══════════════════════════════════════════════════════════════
   ATTENDANCE RADIO — show/hide guest count
   ═══════════════════════════════════════════════════════════════ */

const attendanceRadios = document.querySelectorAll('input[name="attendance"]');

attendanceRadios.forEach((radio) => {
  radio.addEventListener('change', () => {
    if (radio.value === 'Joyfully Attending') {
      guestCountGrp.classList.add('visible');
    } else {
      guestCountGrp.classList.remove('visible');
    }
  });
});


/* ═══════════════════════════════════════════════════════════════
   RSVP FORM SUBMISSION
   ═══════════════════════════════════════════════════════════════ */

rsvpForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // ── Basic validation ──────────────────────────────────────────
  let valid = true;
  const requiredFields = rsvpForm.querySelectorAll('[required]');

  requiredFields.forEach((field) => {
    if (field.type === 'radio') return; // handled separately
    field.classList.remove('error');
    if (!field.value.trim()) {
      field.classList.add('error');
      valid = false;
    }
  });

  // Check radio group
  const attendanceChecked = rsvpForm.querySelector('input[name="attendance"]:checked');
  if (!attendanceChecked) {
    valid = false;
    // Highlight radio group
    rsvpForm.querySelector('.radio-group').style.outline =
      '1.5px solid #c0705a';
  } else {
    rsvpForm.querySelector('.radio-group').style.outline = '';
  }

  if (!valid) return;

  // ── Show loading state ────────────────────────────────────────
  const submitBtn = rsvpForm.querySelector('.submit-btn');
  const submitText = submitBtn.querySelector('.submit-text');
  submitBtn.classList.add('loading');
  submitText.textContent = 'Sending…';

  // Hide previous feedback
  formSuccess.hidden = true;
  formError.hidden   = true;

  // ── Submit to Web3Forms / Formspree ──────────────────────────
  try {
    const formData = new FormData(rsvpForm);
    const response = await fetch(rsvpForm.action, {
      method:  'POST',
      body:    formData,
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      // Success
      formSuccess.hidden = false;
      rsvpForm.reset();
      guestCountGrp.classList.remove('visible');
      rsvpForm.querySelector('.radio-group').style.outline = '';

      // Smooth scroll to success message
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      // Server responded with error
      const data = await response.json().catch(() => ({}));
      console.error('Form submission error:', data);
      formError.hidden = false;
      formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  } catch (err) {
    // Network error
    console.error('Network error:', err);
    formError.hidden = false;
    formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } finally {
    submitBtn.classList.remove('loading');
    submitText.textContent = 'Send RSVP';
  }
});


/* ═══════════════════════════════════════════════════════════════
   INPUT — remove error styling on user interaction
   ═══════════════════════════════════════════════════════════════ */

rsvpForm.querySelectorAll('.form-input').forEach((input) => {
  input.addEventListener('input', () => {
    input.classList.remove('error');
  });
});


/* ═══════════════════════════════════════════════════════════════
   GALLERY — lazy load & subtle entrance
   ═══════════════════════════════════════════════════════════════ */

const galleryItems = document.querySelectorAll('.gallery-item');

const galleryObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 60);
        galleryObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.05 }
);

galleryItems.forEach((item) => {
  item.style.opacity    = '0';
  item.style.transform  = 'translateY(20px)';
  item.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  galleryObserver.observe(item);
});


