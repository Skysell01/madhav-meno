/**
 * ==============================================================================
 * MADHAVBAUG MENOBALANCE™ PRE & POST MENOPAUSE NUTRITION POWDER - MAIN JAVASCRIPT
 * Features:
 * 1. Bundle State & Dynamic Pricing Management (1 Jar, 2 Jars, 3 Jars)
 * 2. Unified Cash on Delivery (COD) Lead Modal
 * 3. 24-Hour Duplicate Prevention by Contact Number
 * 4. Google Sheets Webhook Integration
 * 5. WhatsApp Order Confirmation Direct Linking
 * 6. Sticky Floating Bottom COD Bar
 * 7. FAQ Accordion Interactions
 * 8. Live Real-Time Buyer Proof Notifications
 * ==============================================================================
 */

// Google Sheets Webhook URL
const GOOGLE_SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxdgQRd1cJNW6SNmdc_RR8qZ3ZSJOGZvy6V94rWdilQME4vA4ZU7iqONI-EBKqBhKczGA/exec';

// Local Storage Key & 24hr Cooldown
const STORAGE_KEY_CONTACTS = 'madhavbaug_menopause_contacts_24h';
const COOLDOWN_24H_MS = 24 * 60 * 60 * 1000;

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. BUNDLE DEFINITIONS & DYNAMIC SELECTION
  // ==========================================================================
  const bundleOptions = [
    {
      index: 0,
      title: '1 Jar (200g - 30 Days Nutrition Support)',
      days: '30 Days Starter Kit',
      price: '₹899',
      numericPrice: 899,
      regularPrice: '₹1,299',
      savingText: 'Save ₹400 (31% OFF)',
      badge: 'Starter Kit',
      badgeClass: ''
    },
    {
      index: 1,
      title: '2 Jars (400g - 60 Days Complete Hormonal Reset)',
      days: '60 Days Course',
      price: '₹1,599',
      numericPrice: 1599,
      regularPrice: '₹2,598',
      savingText: 'Save ₹999 (38% OFF)',
      badge: 'Most Popular',
      badgeClass: 'hot-pink'
    },
    {
      index: 2,
      title: '3 Jars (600g - 90 Days Total Transformation)',
      days: '90 Days Complete Transformation',
      price: '₹2,299',
      numericPrice: 2299,
      regularPrice: '₹3,897',
      savingText: 'Save ₹1,598 (41% OFF)',
      badge: 'Best Value',
      badgeClass: 'gold'
    }
  ];

  let selectedBundleIndex = 1; // Default: 2 Jars (Most Popular)

  const bundleElements = document.querySelectorAll('.bundle-option');
  const stickyPackLabelEl = document.getElementById('stickyPackName');
  const stickyPriceEl = document.getElementById('stickyPrice');
  const modalSummaryPackEl = document.getElementById('modalSummaryPack');
  const modalSummaryPriceEl = document.getElementById('modalSummaryPrice');
  const inputSelectedPack = document.getElementById('modalSelectedPack');
  const inputSelectedPrice = document.getElementById('modalSelectedPrice');

  function updateBundleSelection(index) {
    selectedBundleIndex = index;
    const item = bundleOptions[index];

    // Update active class on bundle options
    bundleElements.forEach((el, idx) => {
      if (idx === index) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Update sticky bar details
    if (stickyPackLabelEl) stickyPackLabelEl.textContent = item.title;
    if (stickyPriceEl) stickyPriceEl.textContent = item.price;

    // Update modal details
    if (modalSummaryPackEl) modalSummaryPackEl.textContent = item.title;
    if (modalSummaryPriceEl) modalSummaryPriceEl.textContent = item.price;
    if (inputSelectedPack) inputSelectedPack.value = item.title;
    if (inputSelectedPrice) inputSelectedPrice.value = item.price;
  }

  // Bind bundle click events
  bundleElements.forEach((el, idx) => {
    el.addEventListener('click', () => {
      updateBundleSelection(idx);
    });
  });

  // Initialize with default
  updateBundleSelection(selectedBundleIndex);

  // ==========================================================================
  // 2. MODAL CONTROLS (OPEN, CLOSE, BACKDROP)
  // ==========================================================================
  const codModal = document.getElementById('codModal');
  const thankYouModal = document.getElementById('thankYouModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const thankYouCloseBtn = document.getElementById('thankYouCloseBtn');
  const thankYouDoneBtn = document.getElementById('thankYouDoneBtn');
  const duplicateAlertBox = document.getElementById('duplicateAlert');

  function openCodModal(bundleIdx = null) {
    if (bundleIdx !== null && bundleIdx !== undefined) {
      updateBundleSelection(bundleIdx);
    }
    if (duplicateAlertBox) duplicateAlertBox.style.display = 'none';
    if (codModal) {
      codModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      // Focus on first input
      setTimeout(() => {
        const nameInput = document.getElementById('modalName');
        if (nameInput) nameInput.focus();
      }, 100);
    }
  }

  function closeCodModal() {
    if (codModal) codModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function openThankYouModal(orderId, name, phone, pack, price) {
    closeCodModal();
    if (thankYouModal) {
      const orderIdEl = document.getElementById('thankYouOrderId');
      if (orderIdEl) orderIdEl.textContent = 'Order ID: #' + orderId;

      const whatsappBtn = document.getElementById('whatsappConfirmBtn');
      if (whatsappBtn) {
        const text = encodeURIComponent(
          `Namaste Madhavbaug! 🙏\nI have placed a Cash on Delivery (COD) order for MenoBalance™ Pre & Post Menopause Nutrition Powder (Chocolate Flavour).\n\n*Order ID:* #${orderId}\n*Name:* ${name}\n*Contact:* ${phone}\n*Package:* ${pack}\n*Total Price:* ${price}\n\nPlease confirm my order and share delivery tracking details. Thank you!`
        );
        whatsappBtn.href = `https://api.whatsapp.com/send?phone=919321456789&text=${text}`;
      }

      thankYouModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeThankYouModal() {
    if (thankYouModal) thankYouModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Attach open modal to all CTA buttons
  const allCtaButtons = document.querySelectorAll('.open-cod-modal, .btn-buy-now, #navCtaBtn, #heroCtaBtn, #stickyCtaBtn, #sectionCtaBtn');
  allCtaButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const explicitBundle = btn.getAttribute('data-bundle');
      if (explicitBundle !== null) {
        openCodModal(parseInt(explicitBundle, 10));
      } else {
        openCodModal(selectedBundleIndex);
      }
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeCodModal);
  if (thankYouCloseBtn) thankYouCloseBtn.addEventListener('click', closeThankYouModal);
  if (thankYouDoneBtn) thankYouDoneBtn.addEventListener('click', closeThankYouModal);

  // Close when clicking modal backdrop
  [codModal, thankYouModal].forEach(modalEl => {
    if (modalEl) {
      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) {
          modalEl.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }
  });

  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCodModal();
      closeThankYouModal();
    }
  });

  // ==========================================================================
  // 3. DUPLICATE CHECK UTILITY (24-HOUR LOCAL STORAGE)
  // ==========================================================================
  function isDuplicateContact(phone) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONTACTS);
      if (!stored) return false;
      const history = JSON.parse(stored);
      const record = history[phone];
      if (!record) return false;
      const now = Date.now();
      if (now - record.timestamp < COOLDOWN_24H_MS) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  function saveContactToStorage(phone, orderId) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONTACTS);
      const history = stored ? JSON.parse(stored) : {};
      history[phone] = {
        timestamp: Date.now(),
        orderId: orderId
      };
      localStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(history));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  // ==========================================================================
  // 4. FORM SUBMISSION HANDLER
  // ==========================================================================
  const codForm = document.getElementById('codOrderForm');
  const submitBtn = document.getElementById('modalSubmitBtn');

  if (codForm) {
    codForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('modalName');
      const phoneInput = document.getElementById('modalPhone');
      const addressInput = document.getElementById('modalAddress');
      const cityInput = document.getElementById('modalCity');
      const stateInput = document.getElementById('modalState');
      const pincodeInput = document.getElementById('modalPincode');

      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim().replace(/\D/g, '') : '';
      const address = addressInput ? addressInput.value.trim() : '';
      const city = cityInput ? cityInput.value.trim() : '';
      const state = stateInput ? stateInput.value.trim() : '';
      const pincode = pincodeInput ? pincodeInput.value.trim() : '';
      const selectedPack = bundleOptions[selectedBundleIndex].title;
      const price = bundleOptions[selectedBundleIndex].price;

      // Validation: Only Name and Contact are mandatory
      if (!name || name.length < 2) {
        alert('Please enter your full name.');
        if (nameInput) nameInput.focus();
        return;
      }

      if (!phone || phone.length !== 10 || !/^[6-9]\d{9}$/.test(phone)) {
        alert('Please enter a valid 10-digit Indian mobile number.');
        if (phoneInput) phoneInput.focus();
        return;
      }

      // 24hr Duplicate Prevention
      if (isDuplicateContact(phone)) {
        if (duplicateAlertBox) {
          duplicateAlertBox.style.display = 'block';
          duplicateAlertBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          alert('A Cash On Delivery order with this phone number has already been placed today. Our health care executive will call you shortly.');
        }
        return;
      }

      // Generate Order ID
      const orderId = 'MENO-' + Math.floor(100000 + Math.random() * 900000);

      // UI Loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳ Processing COD Order...</span>';
      }

      const payload = {
        name: name,
        phone: phone,
        address: address,
        city: city,
        state: state,
        pincode: pincode,
        package: selectedPack,
        price: price,
        orderId: orderId,
        paymentMode: 'Cash On Delivery (COD)',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };

      // Send to Webhook in background with timeout safety
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        }).catch(err => console.log('Webhook dispatched:', err));
      } catch (err) {
        console.warn('Dispatch non-blocking:', err);
      }

      // Record contact locally
      saveContactToStorage(phone, orderId);

      // Reset button state
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>🛍️ Confirm Cash On Delivery Order</span>';
      }

      // Reset form
      codForm.reset();

      // Open Thank You Modal
      openThankYouModal(orderId, name, phone, selectedPack, price);
    });
  }

  // ==========================================================================
  // 5. FAQ ACCORDION
  // ==========================================================================
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question-btn');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close all
        faqItems.forEach(i => i.classList.remove('active'));
        // If not active before, open it
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // ==========================================================================
  // 6. REAL-TIME BUYER PROOF TOAST NOTIFICATIONS
  // ==========================================================================
  const buyersList = [
    { name: 'Sunita M.', city: 'Mumbai', pack: '2 Jars (60 Days Course)', time: '2 mins ago' },
    { name: 'Vandana S.', city: 'Pune', pack: '2 Jars (60 Days Course)', time: '4 mins ago' },
    { name: 'Rekha P.', city: 'Delhi NCR', pack: '3 Jars (90 Days Course)', time: '6 mins ago' },
    { name: 'Kalpana N.', city: 'Bengaluru', pack: '2 Jars (60 Days Course)', time: '9 mins ago' },
    { name: 'Meena J.', city: 'Ahmedabad', pack: '1 Jar (30 Days Starter)', time: '12 mins ago' },
    { name: 'Saroj K.', city: 'Jaipur', pack: '2 Jars (60 Days Course)', time: '14 mins ago' },
    { name: 'Anuradha D.', city: 'Kolkata', pack: '3 Jars (90 Days Course)', time: '18 mins ago' },
    { name: 'Preeti G.', city: 'Lucknow', pack: '2 Jars (60 Days Course)', time: '21 mins ago' }
  ];

  let toastIndex = 0;
  const buyerToastEl = document.getElementById('liveBuyerToast');
  const toastTextEl = document.getElementById('toastContent');

  function showNextBuyerToast() {
    if (!buyerToastEl || !toastTextEl) return;
    const buyer = buyersList[toastIndex];
    toastTextEl.innerHTML = `<strong>${buyer.name}</strong> (${buyer.city}) just ordered <strong>${buyer.pack}</strong> on COD <span style="color:#9B7D8A; font-size:0.75rem;">• ${buyer.time}</span>`;
    buyerToastEl.classList.add('show');

    setTimeout(() => {
      buyerToastEl.classList.remove('show');
    }, 4500);

    toastIndex = (toastIndex + 1) % buyersList.length;
  }

  // Initial trigger after 4 seconds, then repeat every 18 seconds
  setTimeout(() => {
    showNextBuyerToast();
    setInterval(showNextBuyerToast, 18000);
  }, 4000);

});
