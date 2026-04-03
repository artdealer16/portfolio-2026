document.documentElement.classList.add('js-enhanced');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const supportsFinePointer = window.matchMedia('(pointer: fine)').matches;

const mainNav = document.querySelector('#mainNav');
const hamburgerButton = document.querySelector('#hamburgerBtn');
const mobileNav = document.querySelector('#mobileNav');

// ========================
// MOBILE NAV
// ========================

// This function opens the mobile navigation drawer and updates ARIA state for screen readers.
function openMobileNav() {
  if (!hamburgerButton || !mobileNav) return;

  mobileNav.classList.add('is-open');
  hamburgerButton.classList.add('is-open');
  hamburgerButton.setAttribute('aria-expanded', 'true');
  mobileNav.setAttribute('aria-hidden', 'false');
}

// This function closes the mobile navigation drawer after the user navigates or toggles it shut.
function closeMobileNav() {
  if (!hamburgerButton || !mobileNav) return;

  mobileNav.classList.remove('is-open');
  hamburgerButton.classList.remove('is-open');
  hamburgerButton.setAttribute('aria-expanded', 'false');
  mobileNav.setAttribute('aria-hidden', 'true');
}

// This function switches between the open and closed menu states from one place.
function toggleMobileNav() {
  if (!mobileNav) return;

  if (mobileNav.classList.contains('is-open')) {
    closeMobileNav();
  } else {
    openMobileNav();
  }
}

if (hamburgerButton && mobileNav) {
  // This click listener toggles the mobile menu when the hamburger button is pressed.
  hamburgerButton.addEventListener('click', () => {
    toggleMobileNav();
  });
}

// ========================
// CUSTOM CURSOR
// ========================

if (supportsFinePointer && !prefersReducedMotion) {
  document.body.classList.add('has-custom-cursor');

  const cursorDot = document.createElement('div');
  const cursorRing = document.createElement('div');
  const cursorPreview = document.createElement('div');
  const cursorPreviewImg = document.createElement('img');
  const cursorPreviewLabel = document.createElement('span');

  cursorDot.className = 'custom-cursor-dot';
  cursorRing.className = 'custom-cursor-ring';
  cursorPreview.className = 'custom-cursor-preview';
  cursorPreviewImg.className = 'custom-cursor-preview__img';
  cursorPreviewImg.alt = '';
  cursorPreviewLabel.className = 'custom-cursor-preview__label';
  cursorPreviewLabel.textContent = 'Project image placeholder';

  cursorPreview.appendChild(cursorPreviewImg);
  cursorPreview.appendChild(cursorPreviewLabel);
  document.body.appendChild(cursorDot);
  document.body.appendChild(cursorRing);
  document.body.appendChild(cursorPreview);

  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let ringX = pointerX;
  let ringY = pointerY;

  // This function places the small dot directly under the pointer with no lag.
  function updateDotPosition() {
    cursorDot.style.setProperty('--cursor-dot-x', `${pointerX}px`);
    cursorDot.style.setProperty('--cursor-dot-y', `${pointerY}px`);
  }

  // This function moves the ring and preview toward the pointer with a slight delay.
  function animateLaggingCursor() {
    ringX += (pointerX - ringX) * 0.10;
    ringY += (pointerY - ringY) * 0.10;

    cursorRing.style.setProperty('--cursor-ring-x', `${ringX}px`);
    cursorRing.style.setProperty('--cursor-ring-y', `${ringY}px`);
    cursorPreview.style.setProperty('--cursor-ring-x', `${ringX}px`);
    cursorPreview.style.setProperty('--cursor-ring-y', `${ringY}px`);

    window.requestAnimationFrame(animateLaggingCursor);
  }

  // This function flips the cursor color on dark sections so the dot and ring stay visible.
  function updateCursorContrast(targetElement) {
    const isDarkSurface = Boolean(targetElement?.closest('.projects, .cta-banner, footer'));
    document.body.classList.toggle('cursor-contrast', isDarkSurface);
  }

  // This function swaps the lagging ring into a project-image placeholder preview.
  function showProjectCursorPreview(card) {
    cursorPreviewLabel.textContent = card.dataset.previewLabel || 'Project image placeholder';
    document.body.classList.add('cursor-project-preview');
    cursorPreviewImg.src = card.dataset.previewImage || '';
  }

  // This function restores the default dot and ring after leaving a project card.
  function hideProjectCursorPreview() {
    document.body.classList.remove('cursor-project-preview');
  }

  // This pointermove listener keeps the cursor synced to the current pointer position.
  window.addEventListener('pointermove', (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;

    updateDotPosition();
    document.body.classList.add('cursor-visible');
    updateCursorContrast(document.elementFromPoint(event.clientX, event.clientY));
  });

  // This pointerleave listener hides the custom cursor when the pointer exits the browser window.
  document.addEventListener('pointerleave', () => {
    document.body.classList.remove('cursor-visible');
    hideProjectCursorPreview();
  });

  // This pointerenter listener shows the cursor again when the pointer returns to the page.
  document.addEventListener('pointerenter', () => {
    document.body.classList.add('cursor-visible');
  });

  // This scroll listener recalculates cursor contrast while the pointer stays still.
  window.addEventListener('scroll', () => {
    updateCursorContrast(document.elementFromPoint(pointerX, pointerY));
  }, { passive: true });

  const genericHoverTargets = document.querySelectorAll('a, button, .accordion-header');
  const projectCards = document.querySelectorAll('.project-item');

  genericHoverTargets.forEach((target) => {
    // This pointerenter listener slightly enlarges the ring on regular interactive elements.
    target.addEventListener('pointerenter', () => {
      if (target.closest('.project-item')) return;

      document.body.classList.add('cursor-active');
    });

    // This pointerleave listener returns the ring to its resting size after leaving a control.
    target.addEventListener('pointerleave', () => {
      if (target.closest('.project-item')) return;

      document.body.classList.remove('cursor-active');
    });
  });

  projectCards.forEach((card) => {
    // This pointerenter listener turns the lagging ring into a project preview placeholder.
    card.addEventListener('pointerenter', () => {
      document.body.classList.remove('cursor-active');
      showProjectCursorPreview(card);
    });

    // This pointerleave listener restores the default cursor once the card is no longer hovered.
    card.addEventListener('pointerleave', () => {
      hideProjectCursorPreview();
    });
  });

updateDotPosition();
  animateLaggingCursor();
}

// ========================
// TYPOGRAPHY ANIMATIONS
// ========================

// This function wraps heading lines so each line can slide up from a clipped container.
function splitHeadingLines(element, outerClass, innerClass, delayStep) {
  if (!element || element.dataset.splitComplete === 'true') return;

  const lines = element.innerHTML.split(/<br\s*\/?>/i);

  element.innerHTML = lines
    .map((line, index) => {
      return `
        <span class="${outerClass}">
          <span class="${innerClass}" style="--line-delay: ${index * delayStep}ms;">
            ${line.trim()}
          </span>
        </span>
      `;
    })
    .join('');

  element.dataset.splitComplete = 'true';
}

// This function reveals the hero heading and its supporting paragraph after the page loads.
function revealHeroContent() {
  if (prefersReducedMotion) return;

  const heroHeading = document.querySelector('.hero h1');
  const heroCopy = document.querySelector('.hero-copy p');

  splitHeadingLines(heroHeading, 'hero-line', 'hero-line-text', 90);

  if (heroCopy) {
    heroCopy.classList.add('is-reveal');
    heroCopy.style.setProperty('--reveal-delay', '140ms');
  }

  window.requestAnimationFrame(() => {
    heroHeading?.querySelectorAll('.hero-line-text').forEach((line) => {
      line.classList.add('is-revealed');
    });

    window.requestAnimationFrame(() => {
      heroCopy?.classList.add('is-revealed');
    });
  });
}

// This load listener waits for fonts and images, then starts the hero entrance sequence.
window.addEventListener('load', () => {
  revealHeroContent();
});

if (!prefersReducedMotion) {
  document.querySelectorAll('.about h2, .projects h2, .expertise h2, .cta-banner h2').forEach((heading) => {
    splitHeadingLines(heading, 'section-heading-line', 'section-heading-line-text', 55);
  });
}

const sectionHeadingObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    entry.target.querySelectorAll('.section-heading-line-text').forEach((line) => {
      line.classList.add('is-revealed');
    });

    observer.unobserve(entry.target);
  });
}, {
  threshold: 0.2
});

if (!prefersReducedMotion) {
  document.querySelectorAll('.about h2, .projects h2, .expertise h2, .cta-banner h2').forEach((heading) => {
    sectionHeadingObserver.observe(heading);
  });
}

// ========================
// SCROLL REVEALS
// ========================

// This function tags groups of elements so they can fade and slide in as they enter the viewport.
function tagRevealTargets(selector, staggerStep = 0) {
  document.querySelectorAll(selector).forEach((element, index) => {
    element.classList.add('is-reveal');

    if (staggerStep > 0) {
      element.style.setProperty('--reveal-delay', `${index * staggerStep}ms`);
    }
  });
}

tagRevealTargets('.hero-image');
tagRevealTargets('.about-content > *', 120);
tagRevealTargets('.stat-item', 80);
tagRevealTargets('.project-item', 120);
tagRevealTargets('.projects-cta');
tagRevealTargets('.logo-row', 120);
tagRevealTargets('.cta-content .btn', 120);
tagRevealTargets('.footer-top');
tagRevealTargets('.footer-bottom', 120);

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    entry.target.classList.add('is-revealed');
    observer.unobserve(entry.target);
  });
}, {
  threshold: 0.15
});

document.querySelectorAll('.is-reveal').forEach((element) => {
  revealObserver.observe(element);
});

// ========================
// PROJECT CARD STATES
// ========================

document.querySelectorAll('.project-item').forEach((card) => {
  // This pointerenter listener opens the project card so the extra description becomes visible.
  card.addEventListener('pointerenter', () => {
    card.classList.add('is-hovered');
  });

  // This pointerleave listener closes the project card when the pointer leaves the rectangle.
  card.addEventListener('pointerleave', () => {
    card.classList.remove('is-hovered');
  });

  // This focusin listener gives keyboard users the same expanded project state as pointer users.
  card.addEventListener('focusin', () => {
    card.classList.add('is-hovered');
  });

  // This focusout listener removes the expanded state once focus fully leaves the project card.
  card.addEventListener('focusout', (event) => {
    if (card.contains(event.relatedTarget)) return;

    card.classList.remove('is-hovered');
  });
});

// ========================
// SMOOTH SCROLL
// ========================

// This function returns the sticky header height so in-page links do not hide under the nav.
function getScrollOffset() {
  return mainNav ? mainNav.offsetHeight : 0;
}

// This function scrolls to a section with the header offset already removed.
function scrollToSection(targetSection) {
  const offsetTop = targetSection.getBoundingClientRect().top + window.scrollY - getScrollOffset();

  window.scrollTo({
    top: offsetTop,
    behavior: prefersReducedMotion ? 'auto' : 'smooth'
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  // This click listener replaces the default anchor jump with smoother offset-aware scrolling.
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    const targetSection = document.querySelector(href);
    if (!targetSection) return;

    event.preventDefault();
    scrollToSection(targetSection);

    if (mobileNav?.classList.contains('is-open')) {
      closeMobileNav();
    }
  });
});

// ========================
// ACTIVE NAV LINKS
// ========================

// This function marks the nav link that points to the section currently in view.
function setActiveNavLink(sectionId) {
  document.querySelectorAll('nav a[href^="#"], .mobile-nav a[href^="#"]').forEach((link) => {
    const isMatch = link.getAttribute('href') === `#${sectionId}`;
    link.classList.toggle('is-active', isMatch);
  });
}

const activeSectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    setActiveNavLink(entry.target.id);
  });
}, {
  threshold: 0.35,
  rootMargin: '-35% 0px -45% 0px'
});

document.querySelectorAll('section[id], footer[id]').forEach((section) => {
  activeSectionObserver.observe(section);
});
