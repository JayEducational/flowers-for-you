/**
 * Flowers For You — Main JavaScript
 * Accessible, modular, event-driven vanilla ES6+ script.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. Theme Toggle (Light / Dark Mode with Persistence)
  // =========================================================================
  const themeToggleBtn = document.getElementById('theme-toggle');
  const storedTheme = localStorage.getItem('theme-preference');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme-preference', theme);
    if (themeToggleBtn) {
      const isDark = theme === 'dark';
      themeToggleBtn.setAttribute('aria-pressed', isDark.toString());
      themeToggleBtn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
  };

  if (storedTheme) {
    applyTheme(storedTheme);
  } else if (prefersDark) {
    applyTheme('dark');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }

  // =========================================================================
  // 2. Mobile Navigation Hamburger Menu
  // =========================================================================
  const menuToggleBtn = document.getElementById('menu-toggle');
  const primaryNav = document.getElementById('primary-navigation');
  const navLinks = document.querySelectorAll('.nav-link');

  if (menuToggleBtn && primaryNav) {
    const toggleMenu = (forceState) => {
      const isExpanded = menuToggleBtn.getAttribute('aria-expanded') === 'true';
      const nextState = typeof forceState === 'boolean' ? forceState : !isExpanded;

      menuToggleBtn.setAttribute('aria-expanded', nextState.toString());
      primaryNav.classList.toggle('open', nextState);
    };

    menuToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // Close when clicking nav links
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        toggleMenu(false);
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!primaryNav.contains(e.target) && !menuToggleBtn.contains(e.target)) {
        toggleMenu(false);
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && primaryNav.classList.contains('open')) {
        toggleMenu(false);
        menuToggleBtn.focus();
      }
    });
  }

  // Active navigation link highlighting on scroll
  const sections = document.querySelectorAll('main section[id]');
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
          } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => navObserver.observe(section));

  // =========================================================================
  // 3. Interactive Category Filter
  // =========================================================================
  const filterChips = document.querySelectorAll('.filter-chip');
  const productCards = document.querySelectorAll('.product-card');
  const filterStatusMsg = document.getElementById('filter-status');

  if (filterChips.length && productCards.length) {
    filterChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const filterVal = chip.getAttribute('data-filter');

        // Update active states
        filterChips.forEach((c) => {
          c.classList.remove('active');
          c.setAttribute('aria-pressed', 'false');
        });
        chip.classList.add('active');
        chip.setAttribute('aria-pressed', 'true');

        let visibleCount = 0;
        productCards.forEach((card) => {
          const category = card.getAttribute('data-category');
          if (filterVal === 'all' || category === filterVal) {
            card.style.display = 'flex';
            visibleCount++;
          } else {
            card.style.display = 'none';
          }
        });

        // Update live region status for screen readers
        if (filterStatusMsg) {
          const label = chip.textContent.trim();
          filterStatusMsg.textContent = `Showing ${visibleCount} items for ${label}.`;
        }
      });
    });
  }

  // =========================================================================
  // 4. Interactive Plant Matcher Tool
  // =========================================================================
  const matcherForm = document.getElementById('plant-matcher-form');
  const matcherResultBox = document.getElementById('matcher-result');

  const matchKnowledgeBase = {
    'full-sun_garden-bed_pollinators': {
      title: 'Sunburst Wildflower Meadow Seed Packet',
      badge: 'Perfect Match for Meadows',
      text: 'Your open garden bed with 6+ hours of full sunlight is the ideal habitat for our Sunburst Wildflower mix. Poppies, cosmos, and coreopsis will germinate quickly and provide nectar for bees all season long.',
      tip: 'Sow directly into loosened garden soil in early spring after the last frost date.'
    },
    'partial-sun_balcony-pots_fragrance': {
      title: 'Pastel Cottage Garden Heirloom Seed Packet',
      badge: 'Fragrant Balcony Favorite',
      text: 'Our Pastel Cottage Sweet Pea and Larkspur blend flourishes beautifully in deep patio planters with partial afternoon sun. The gentle shelter promotes lush climbing vines and highly fragrant blooms.',
      tip: 'Provide a small bamboo trellis or railing twine for the sweet peas to climb.'
    },
    'indirect-light_indoor-sill_starter': {
      title: 'Botanical Cultivator Gift Box',
      badge: 'Ideal Indoor Starter Kit',
      text: 'Our complete beginner kit includes peat starter pots and coir pellets that allow you to germinate seedlings indoors on bright windowsills before transferring them outdoors.',
      tip: 'Keep the peat pellets evenly moist using a gentle water mister for best germination.'
    }
  };

  const fallbackMatch = {
    title: 'Sunburst Wildflower Meadow & Cultivator Bundle',
    badge: 'Versatile Grower Choice',
    text: 'Based on your selections, our heirloom seeds offer robust vigor and adapt readily to diverse soil types and sunlight conditions.',
    tip: 'Seeds can be started indoors in pots 4-6 weeks before moving outside, or directly sown outdoors.'
  };

  if (matcherForm && matcherResultBox) {
    matcherForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const sunlight = document.getElementById('matcher-sunlight').value;
      const space = document.getElementById('matcher-space').value;
      const goal = document.getElementById('matcher-goal').value;

      if (!sunlight || !space || !goal) {
        matcherResultBox.innerHTML = `
          <div class="result-placeholder" style="color: var(--color-accent);">
            <span class="placeholder-icon" aria-hidden="true">⚠️</span>
            <p>Please select an option for Sunlight, Space, and Goal to receive your match.</p>
          </div>
        `;
        return;
      }

      const key = `${sunlight}_${space}_${goal}`;
      const match = matchKnowledgeBase[key] || fallbackMatch;

      matcherResultBox.innerHTML = `
        <div class="match-card-result">
          <div class="match-header">
            <span class="product-badge bestseller" style="display:inline-block;">${match.badge}</span>
            <h4 class="match-title">${match.title}</h4>
          </div>
          <p class="match-recommendation">${match.text}</p>
          <div class="match-tips">
            <strong>Grower's Pro Tip:</strong> ${match.tip}
          </div>
          <div style="margin-top: 0.5rem;">
            <a href="#products" class="btn btn-sm btn-primary">View in Seed Catalog</a>
          </div>
        </div>
      `;
    });

    matcherForm.addEventListener('reset', () => {
      setTimeout(() => {
        matcherResultBox.innerHTML = `
          <div class="result-placeholder">
            <span class="placeholder-icon" aria-hidden="true">🌱</span>
            <p>Select your planting conditions and click <strong>"Find My Botanical Match"</strong> to generate a custom growing recommendation!</p>
          </div>
        `;
      }, 50);
    });
  }

  // =========================================================================
  // 5. Interactive FAQ Accordion
  // =========================================================================
  const accordionTriggers = document.querySelectorAll('.accordion-trigger');

  accordionTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      const targetPanelId = trigger.getAttribute('aria-controls');
      const targetPanel = document.getElementById(targetPanelId);

      // Close all other panels (accordion pattern)
      accordionTriggers.forEach((otherTrigger) => {
        if (otherTrigger !== trigger) {
          otherTrigger.setAttribute('aria-expanded', 'false');
          const otherPanelId = otherTrigger.getAttribute('aria-controls');
          const otherPanel = document.getElementById(otherPanelId);
          if (otherPanel) {
            otherPanel.hidden = true;
          }
        }
      });

      // Toggle clicked panel
      trigger.setAttribute('aria-expanded', (!isExpanded).toString());
      if (targetPanel) {
        targetPanel.hidden = isExpanded;
      }
    });
  });

  // =========================================================================
  // 6. Quick View Dialog / Modal Component
  // =========================================================================
  const dialog = document.getElementById('quick-view-dialog');
  const closeDialogBtn = document.getElementById('close-dialog-btn');
  const closeSecondaryBtn = document.getElementById('dialog-close-secondary');
  const quickViewButtons = document.querySelectorAll('.quick-view-btn');

  const productData = {
    'seed-packet-1': {
      title: 'Sunburst Wildflower Meadow Seed Packet',
      category: 'Heirloom Seed Mix',
      price: '$8.50',
      imgSrc: './assets/seed-packet1.jpg',
      imgAlt: 'Sunburst Wildflower Meadow Heirloom Seed Packet',
      desc: 'Tested for superior germination rates (>90%). Packed with pollinator favorites including California poppy, bright cosmos, and blue cornflowers. Non-GMO and open-pollinated.',
      specs: 'Coverage: 150 sq. ft. | Sowing Depth: 1/8 inch | Days to Bloom: 55-70 days'
    },
    'seed-packet-2': {
      title: 'Pastel Cottage Garden Heirloom Seed Packet',
      category: 'Climbers & Cut Flowers',
      price: '$9.00',
      imgSrc: './assets/seed-packet2.webp',
      imgAlt: 'Pastel Cottage Garden Sweet Pea and Botanical Seed Packet',
      desc: 'Charming heritage floral seeds designed for cottage borders, fences, and cut stem vases. Features highly scented Lathyrus odoratus and tall majestic larkspur spikes.',
      specs: 'Coverage: 100 sq. ft. | Sowing Depth: 1/4 inch | Days to Bloom: 65-80 days'
    },
    'rose-bouquet': {
      title: 'Velvet Rose & Silver Dollar Eucalyptus',
      category: 'Fresh Floral Bouquet',
      price: '$48.00',
      imgSrc: './assets/rose-icon.webp',
      imgAlt: 'Velvet Rose and Eucalyptus Hand-Tied Bouquet',
      desc: 'Carefully harvested at dawn and hand-tied by our resident floral designers. Wrapped in recyclable kraft paper and backed with compostable hydration stems.',
      specs: 'Vase Life: 7–10 Days | Stems: 18-20 mixed stems | Care Packet Included'
    },
    'starter-kit': {
      title: 'Botanical Cultivator Gift Box',
      category: 'Cultivation Kit',
      price: '$26.50',
      imgSrc: './assets/Icon.webp',
      imgAlt: 'Flowers For You Botanical Cultivator Gift Box',
      desc: 'The ultimate botanical gift set. Features both signature heirloom seed packets, biodegradable planting pots, organic coir disks, and an engraved bamboo plant marker.',
      specs: 'Includes: 2 Seed Packets, 6 Peat Pots, Coir Discs, Planting Booklet'
    }
  };

  const openProductDialog = (productId) => {
    if (!dialog) return;
    const data = productData[productId];
    if (!data) return;

    document.getElementById('dialog-title').textContent = data.title;
    document.getElementById('dialog-category').textContent = data.category;
    document.getElementById('dialog-price').textContent = data.price;
    document.getElementById('dialog-description').textContent = data.desc;
    document.getElementById('dialog-specs').textContent = data.specs;

    const imgEl = document.getElementById('dialog-img');
    imgEl.src = data.imgSrc;
    imgEl.alt = data.imgAlt;

    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  };

  const closeProductDialog = () => {
    if (!dialog) return;
    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }
  };

  quickViewButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const pId = btn.getAttribute('data-product-id');
      openProductDialog(pId);
    });
  });

  if (closeDialogBtn) closeDialogBtn.addEventListener('click', closeProductDialog);
  if (closeSecondaryBtn) closeSecondaryBtn.addEventListener('click', closeProductDialog);

  // Close dialog on clicking outside backdrop
  if (dialog) {
    dialog.addEventListener('click', (e) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        closeProductDialog();
      }
    });
  }

  // =========================================================================
  // 7. Accessible Contact Form Validation & Feedback
  // =========================================================================
  const contactForm = document.getElementById('contact-form');
  const contactStatus = document.getElementById('contact-form-status');

  if (contactForm && contactStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;
      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const messageInput = document.getElementById('contact-message');

      const nameError = document.getElementById('name-error');
      const emailError = document.getElementById('email-error');
      const messageError = document.getElementById('message-error');

      // Clear previous error messages
      [nameError, emailError, messageError].forEach((el) => {
        if (el) el.textContent = '';
      });
      contactStatus.className = 'form-status-alert';
      contactStatus.style.display = 'none';

      // Validate Name
      if (!nameInput.value.trim()) {
        nameError.textContent = 'Please provide your full name.';
        isValid = false;
        nameInput.focus();
      }

      // Validate Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value.trim()) {
        emailError.textContent = 'Please enter your email address.';
        if (isValid) emailInput.focus();
        isValid = false;
      } else if (!emailRegex.test(emailInput.value.trim())) {
        emailError.textContent = 'Please enter a valid email format (e.g., name@example.com).';
        if (isValid) emailInput.focus();
        isValid = false;
      }

      // Validate Message
      if (!messageInput.value.trim()) {
        messageError.textContent = 'Please write your message or inquiry.';
        if (isValid) messageInput.focus();
        isValid = false;
      }

      if (isValid) {
        const senderName = nameInput.value.trim();
        contactStatus.className = 'form-status-alert success';
        contactStatus.textContent = `Thank you, ${senderName}! Your message has been received. Our floral team will reply within 24 hours.`;
        contactForm.reset();
      } else {
        contactStatus.className = 'form-status-alert error';
        contactStatus.textContent = 'Please correct the highlighted fields above.';
      }
    });
  }

  // =========================================================================
  // 8. Newsletter Form Submission
  // =========================================================================
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterStatus = document.getElementById('newsletter-status');

  if (newsletterForm && newsletterStatus) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletter-email');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
        newsletterStatus.className = 'newsletter-status';
        newsletterStatus.style.color = 'var(--color-accent)';
        newsletterStatus.textContent = 'Please enter a valid email address.';
        return;
      }

      newsletterStatus.className = 'newsletter-status success';
      newsletterStatus.textContent = 'Welcome to the Garden Club! Check your inbox for your 10% coupon.';
      newsletterForm.reset();
    });
  }
});
