/**
 * Enterprise HRIS Management System - Employee Profile
 * Interactive Controller & State Management
 */

let isProgrammaticScroll = false;

function initApp() {
  // Initialize Feather Icons
  if (window.feather) {
    feather.replace();
  }

  // Initialize ScrollSpy for continuous scrolling
  initScrollSpy();

  // Initialize Sticky Sidebar Profile observer
  initStickySidebarProfile();

  // Close dropdowns on outside click
  document.addEventListener('click', (event) => {
    const dropdowns = document.querySelectorAll('.dropdown-wrapper.open');
    dropdowns.forEach(dd => {
      if (!dd.contains(event.target)) {
        dd.classList.remove('open');
      }
    });
  });

  // Keyboard shortcut listener (Escape to close drawer and modals)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDrawer();
      closeAddressModal();
      closeDocumentModal();
      const openDropdowns = document.querySelectorAll('.dropdown-wrapper.open');
      openDropdowns.forEach(dd => dd.classList.remove('open'));
    }
    // Command/Ctrl + K focus search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('global-search-input');
      if (searchInput) searchInput.focus();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

/* ==========================================================================
   1. SCROLLSPY & SECTION NAVIGATION
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('.section-panel');
  const navButtons = document.querySelectorAll('.nav-item-btn');

  const observerOptions = {
    root: null,
    rootMargin: '-10% 0px -55% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    if (isProgrammaticScroll || document.body.classList.contains('single-tab-mode')) {
      return;
    }

    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeId = entry.target.id.replace('section-', '');
        navButtons.forEach(btn => {
          if (btn.getAttribute('data-tab') === activeId) {
            btn.classList.add('active');
            btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          } else {
            btn.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}

function initStickySidebarProfile() {
  const sidebar = document.querySelector('.profile-nav-sidebar');
  const headerCard = document.querySelector('.employee-header-card');
  if (!sidebar || !headerCard) return;

  const updateStickyProfile = () => {
    const rect = headerCard.getBoundingClientRect();
    // When the bottom of the main employee card scrolls past 70px (sticky threshold), show profile in sidebar
    if (rect.bottom <= 75) {
      sidebar.classList.add('has-sticky-profile');
    } else {
      sidebar.classList.remove('has-sticky-profile');
    }
  };

  // Check on initial load
  updateStickyProfile();

  // Listen to scroll events with passive optimization
  window.addEventListener('scroll', updateStickyProfile, { passive: true });
}

function switchSection(sectionId) {
  const isSingleTab = document.body.classList.contains('single-tab-mode');

  // Update sidebar buttons
  const navButtons = document.querySelectorAll('.nav-item-btn');
  navButtons.forEach(btn => {
    if (btn.getAttribute('data-tab') === sectionId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const targetPanel = document.getElementById(`section-${sectionId}`);
  if (!targetPanel) return;

  if (isSingleTab) {
    // Tab mode: show only active section
    const panels = document.querySelectorAll('.section-panel');
    panels.forEach(panel => panel.classList.remove('active'));
    targetPanel.classList.add('active');
    targetPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    // Continuous scroll mode: smooth scroll down to the targeted section
    isProgrammaticScroll = true;
    targetPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });

    setTimeout(() => {
      isProgrammaticScroll = false;
    }, 700);
  }

  // Re-run feather icon replacement for any dynamically displayed icons
  if (window.feather) {
    feather.replace();
  }
}

function setViewMode(mode) {
  const btnScroll = document.getElementById('btn-mode-scroll');
  const btnTab = document.getElementById('btn-mode-tab');
  const panels = document.querySelectorAll('.section-panel');

  if (mode === 'tab') {
    document.body.classList.add('single-tab-mode');
    if (btnTab) btnTab.classList.add('active');
    if (btnScroll) btnScroll.classList.remove('active');

    // Show only the currently active tab
    const activeBtn = document.querySelector('.nav-item-btn.active') || document.querySelector('.nav-item-btn[data-tab="personal"]');
    const tabId = activeBtn ? activeBtn.getAttribute('data-tab') : 'personal';

    panels.forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`section-${tabId}`);
    if (target) target.classList.add('active');

    triggerToast('Switched to Focus Tab View (one section at a time)', 'info');
  } else {
    document.body.classList.remove('single-tab-mode');
    if (btnScroll) btnScroll.classList.add('active');
    if (btnTab) btnTab.classList.remove('active');

    // Make sure all panels are visible in continuous scroll
    panels.forEach(p => p.classList.add('active'));

    triggerToast('Switched to Continuous Scroll View (scroll through all sections)', 'info');
  }

  if (window.feather) feather.replace();
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==========================================================================
   2. COLLAPSIBLE IMPORTANT NOTICE BANNER
   ========================================================================== */
function toggleNoticeDetails() {
  const noticeCard = document.getElementById('important-notice-card');
  const toggleBtn = noticeCard.querySelector('.notice-toggle-btn');
  if (!noticeCard) return;

  const isExpanded = noticeCard.classList.toggle('expanded');
  if (toggleBtn) {
    toggleBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    const labelSpan = toggleBtn.querySelector('span');
    if (labelSpan) {
      labelSpan.textContent = isExpanded ? 'Hide Policy' : 'View Policy';
    }
  }
}

/* ==========================================================================
   3. DIRECT IN-CARD EDITING CONTROLLER
   ========================================================================== */
function getCardElement(cardKey) {
  if (cardKey === 'basic-info') return document.getElementById('card-basic-info');
  if (cardKey === 'address-info') return document.getElementById('card-address-info');
  if (cardKey === 'nid') return document.getElementById('doc-card-nid');
  if (cardKey === 'pass') return document.getElementById('doc-card-pass');
  if (cardKey === 'dl') return document.getElementById('doc-card-dl');
  if (cardKey === 'contact-email') return document.getElementById('card-contact-email');
  if (cardKey === 'contact-phone') return document.getElementById('card-contact-phone');
  if (cardKey === 'contact-personal-phone') return document.getElementById('card-contact-personal-phone');
  if (cardKey === 'contact-personal-email') return document.getElementById('card-contact-personal-email');
  return document.getElementById(cardKey);
}

function getCardLabel(cardKey) {
  if (cardKey === 'basic-info') return 'Basic Information';
  if (cardKey === 'address-info') return 'Address Information';
  if (cardKey === 'nid') return 'National ID';
  if (cardKey === 'pass') return 'Passport';
  if (cardKey === 'dl') return "Driver's License";
  if (cardKey === 'contact-email') return 'Company Email';
  if (cardKey === 'contact-phone') return 'Business Phone';
  if (cardKey === 'contact-personal-phone') return 'Personal Phone Number';
  if (cardKey === 'contact-personal-email') return 'Personal Gmail';
  return 'Card details';
}

function toggleCardEdit(cardKey) {
  const card = getCardElement(cardKey);
  if (!card) return;

  const isEditing = card.classList.contains('is-editing');
  if (isEditing) {
    cancelCardEdit(cardKey);
  } else {
    // Populate form fields with current display values
    populateCardEditFields(cardKey);
    card.classList.add('is-editing');

    // Auto-focus the first input field
    const firstInput = card.querySelector('input, select, textarea');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 50);
    }

    if (window.feather) feather.replace();
    triggerToast(`Editing ${getCardLabel(cardKey)} directly in card`, 'info');
  }
}

function populateCardEditFields(cardKey) {
  const getText = (id, fallback = '') => {
    const el = document.getElementById(id);
    return el ? el.textContent.trim() : fallback;
  };

  if (cardKey === 'basic-info') {
    const khmer = getText('val-khmer-name', 'កូវ សេតពិសាល');
    const en = getText('val-en-name', 'Kauv Seth Pisal');
    const gender = getText('val-gender', 'Male');
    const blood = getText('val-blood-type', 'AB');
    const marital = getText('val-marital-status', 'Single');
    const religion = getText('val-religion', 'Buddhism');
    const nationality = getText('val-nationality', 'Cambodian');

    const inKhmer = document.getElementById('card-input-khmer-name');
    const inEn = document.getElementById('card-input-en-name');
    const inGender = document.getElementById('card-input-gender');
    const inBlood = document.getElementById('card-input-blood');
    const inMarital = document.getElementById('card-input-marital');
    const inReligion = document.getElementById('card-input-religion');
    const inNationality = document.getElementById('card-input-nationality');

    if (inKhmer) inKhmer.value = khmer;
    if (inEn) inEn.value = en;
    if (inGender) inGender.value = gender;
    if (inBlood) inBlood.value = blood;
    if (inMarital) inMarital.value = marital;
    if (inReligion) inReligion.value = religion;
    if (inNationality) inNationality.value = nationality;
  } else if (cardKey === 'address-info') {
    const pob = getText('val-pob');
    const perm = getText('val-perm-address');
    const curr = getText('val-curr-address');

    const inPob = document.getElementById('card-input-pob');
    const inPerm = document.getElementById('card-input-perm-address');
    const inCurr = document.getElementById('card-input-curr-address');

    if (inPob && pob) inPob.value = pob;
    if (inPerm && perm) inPerm.value = perm;
    if (inCurr && curr) inCurr.value = curr;
  } else if (cardKey === 'nid') {
    const num = getText('val-nid-number');
    const inNum = document.getElementById('card-input-nid-number');
    if (inNum && num) inNum.value = num;
  } else if (cardKey === 'pass') {
    const num = getText('val-pass-number');
    const inNum = document.getElementById('card-input-pass-number');
    if (inNum && num) inNum.value = num;
  } else if (cardKey === 'dl') {
    const num = getText('val-dl-number');
    const inNum = document.getElementById('card-input-dl-number');
    if (inNum && num) inNum.value = num;
  } else if (cardKey === 'contact-email') {
    const email = getText('val-contact-company-email');
    const inEmail = document.getElementById('card-input-company-email');
    if (inEmail && email) inEmail.value = email;
  } else if (cardKey === 'contact-phone') {
    const phone = getText('val-contact-business-phone');
    const inPhone = document.getElementById('card-input-business-phone');
    if (inPhone && phone) inPhone.value = phone;
  } else if (cardKey === 'contact-personal-phone') {
    const phone = getText('val-contact-personal-phone');
    const inPhone = document.getElementById('card-input-personal-phone');
    if (inPhone && phone) inPhone.value = phone;
  } else if (cardKey === 'contact-personal-email') {
    const email = getText('val-contact-personal-email');
    const inEmail = document.getElementById('card-input-personal-email');
    if (inEmail && email) inEmail.value = email;
  } else if (cardKey && cardKey.startsWith('contact-custom-')) {
    const card = getCardElement(cardKey);
    if (card) {
      const val = card.querySelector('.val-contact-custom')?.textContent.trim();
      const inVal = card.querySelector('.card-edit-mode input');
      if (inVal && val) inVal.value = val;
    }
  }
}

function copyPermanentToCurrent() {
  const permInput = document.getElementById('card-input-perm-address');
  const currInput = document.getElementById('card-input-curr-address');
  if (permInput && currInput) {
    currInput.value = permInput.value;
    triggerToast('Permanent address copied to current address', 'info');
  }
}

function cancelCardEdit(cardKey) {
  const card = getCardElement(cardKey);
  if (!card) return;
  card.classList.remove('is-editing');
  triggerToast(`Cancelled editing for ${getCardLabel(cardKey)}`, 'info');
}

function saveCardEdit(cardKey) {
  const card = getCardElement(cardKey);
  if (!card) return;

  if (cardKey === 'basic-info') {
    const khmer = document.getElementById('card-input-khmer-name')?.value.trim();
    const en = document.getElementById('card-input-en-name')?.value.trim();
    const dob = document.getElementById('card-input-dob')?.value;
    const gender = document.getElementById('card-input-gender')?.value;
    const blood = document.getElementById('card-input-blood')?.value;
    const marital = document.getElementById('card-input-marital')?.value;
    const religion = document.getElementById('card-input-religion')?.value.trim();
    const nationality = document.getElementById('card-input-nationality')?.value.trim();

    if (khmer) {
      const el = document.getElementById('val-khmer-name');
      if (el) el.textContent = khmer;
      document.querySelectorAll('.employee-name-title').forEach(e => e.textContent = khmer);
      document.querySelectorAll('.sticky-profile-khmer-name').forEach(e => e.textContent = khmer);
    }
    if (en) {
      const el = document.getElementById('val-en-name');
      if (el) el.textContent = en;
      document.querySelectorAll('.employee-en-sub').forEach(e => e.textContent = en);
      document.querySelectorAll('.sticky-profile-name').forEach(e => e.textContent = en);
    }
    if (dob) {
      const el = document.getElementById('val-dob');
      const formattedDob = new Date(dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      if (el) el.textContent = `${formattedDob} (Age 24)`;
    }
    if (gender) {
      const el = document.getElementById('val-gender');
      if (el) el.textContent = gender;
    }
    if (blood) {
      const el = document.getElementById('val-blood-type');
      if (el) el.textContent = blood;
    }
    if (marital) {
      const el = document.getElementById('val-marital-status');
      if (el) el.textContent = marital;
    }
    if (religion) {
      const el = document.getElementById('val-religion');
      if (el) el.textContent = religion;
    }
    if (nationality) {
      const el = document.getElementById('val-nationality');
      if (el) el.textContent = nationality;
    }
  } else if (cardKey === 'address-info') {
    const pob = document.getElementById('card-input-pob')?.value.trim();
    const perm = document.getElementById('card-input-perm-address')?.value.trim();
    const curr = document.getElementById('card-input-curr-address')?.value.trim();

    if (pob) {
      const el = document.getElementById('val-pob');
      if (el) el.textContent = pob;
    }
    if (perm) {
      const el = document.getElementById('val-perm-address');
      if (el) el.textContent = perm;
    }
    if (curr) {
      const el = document.getElementById('val-curr-address');
      if (el) el.textContent = curr;
    }
  } else if (cardKey === 'nid') {
    const num = document.getElementById('card-input-nid-number')?.value.trim();
    const issueDate = document.getElementById('card-input-nid-issuedate')?.value;
    const expiryDate = document.getElementById('card-input-nid-expirydate')?.value;

    if (num) {
      const el = document.getElementById('val-nid-number');
      if (el) el.textContent = num;
    }
    if (issueDate) {
      const el = document.getElementById('val-nid-issuedate');
      if (el) el.textContent = new Date(issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    if (expiryDate) {
      const el = document.getElementById('val-nid-expirydate');
      const badge = document.getElementById('badge-nid-status');
      const isExpired = new Date(expiryDate) < new Date();
      if (el) {
        el.textContent = new Date(expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        el.style.color = isExpired ? '#dc2626' : '#0f172a';
      }
      if (badge) {
        badge.className = isExpired ? 'badge badge-danger' : 'badge badge-valid';
        badge.textContent = isExpired ? 'Expired' : 'Valid';
      }
    }
  } else if (cardKey === 'pass') {
    const num = document.getElementById('card-input-pass-number')?.value.trim();
    const issueDate = document.getElementById('card-input-pass-issuedate')?.value;
    const expiryDate = document.getElementById('card-input-pass-expirydate')?.value;

    if (num) {
      const el = document.getElementById('val-pass-number');
      if (el) el.textContent = num;
    }
    if (issueDate) {
      const el = document.getElementById('val-pass-issuedate');
      if (el) el.textContent = new Date(issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    if (expiryDate) {
      const el = document.getElementById('val-pass-expirydate');
      const badge = document.getElementById('badge-pass-status');
      const isExpired = new Date(expiryDate) < new Date();
      if (el) {
        el.textContent = new Date(expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        el.style.color = isExpired ? '#dc2626' : '#0f172a';
      }
      if (badge) {
        badge.className = isExpired ? 'badge badge-danger' : 'badge badge-valid';
        badge.textContent = isExpired ? 'Expired' : 'Valid';
      }
    }
  } else if (cardKey === 'dl') {
    const num = document.getElementById('card-input-dl-number')?.value.trim();
    const issueDate = document.getElementById('card-input-dl-issuedate')?.value;
    const expiryDate = document.getElementById('card-input-dl-expirydate')?.value;

    if (num) {
      const el = document.getElementById('val-dl-number');
      if (el) el.textContent = num;
    }
    if (issueDate) {
      const el = document.getElementById('val-dl-issuedate');
      if (el) el.textContent = new Date(issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    if (expiryDate) {
      const el = document.getElementById('val-dl-expirydate');
      const badge = document.getElementById('badge-dl-status');
      const isExpired = new Date(expiryDate) < new Date();
      if (el) {
        el.textContent = new Date(expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        el.style.color = isExpired ? '#dc2626' : '#0f172a';
      }
      if (badge) {
        badge.className = isExpired ? 'badge badge-danger' : 'badge badge-valid';
        badge.textContent = isExpired ? 'Expired' : 'Valid';
      }
    }
  } else if (cardKey === 'contact-email') {
    const email = document.getElementById('card-input-company-email')?.value.trim();
    if (email) {
      const elHeader = document.getElementById('header-email-val');
      const elContact = document.getElementById('val-contact-company-email');
      if (elHeader) {
        elHeader.textContent = email;
        elHeader.title = email;
      }
      if (elContact) elContact.textContent = email;
    }
  } else if (cardKey === 'contact-phone') {
    const phone = document.getElementById('card-input-business-phone')?.value.trim();
    if (phone) {
      const elHeader = document.getElementById('header-phone-val');
      const elContact = document.getElementById('val-contact-business-phone');
      if (elHeader) elHeader.textContent = phone;
      if (elContact) elContact.textContent = phone;
    }
  } else if (cardKey === 'contact-personal-phone') {
    const phone = document.getElementById('card-input-personal-phone')?.value.trim();
    if (phone) {
      const elContact = document.getElementById('val-contact-personal-phone');
      if (elContact) elContact.textContent = phone;
    }
  } else if (cardKey === 'contact-personal-email') {
    const email = document.getElementById('card-input-personal-email')?.value.trim();
    const elContact = document.getElementById('val-contact-personal-email');
    const wrapAction = document.getElementById('wrap-copy-personal-email');
    if (email) {
      if (elContact) {
        elContact.textContent = email;
        elContact.style.fontSize = '14.5px';
        elContact.style.color = '#0f172a';
        elContact.style.fontWeight = '600';
        elContact.style.fontStyle = 'normal';
      }
      if (wrapAction) {
        wrapAction.innerHTML = `
          <button class="section-edit-icon-btn" onclick="copyToClipboard('${email.replace(/'/g, "\\'")}', 'Personal Gmail')" title="Copy Email" aria-label="Copy Email">
            <i data-feather="copy" style="width: 13px; height: 13px;"></i>
          </button>
        `;
        if (typeof feather !== 'undefined') feather.replace();
      }
    } else {
      if (elContact) {
        elContact.textContent = 'Not provided';
        elContact.style.fontSize = '13.5px';
        elContact.style.color = '#94a3b8';
        elContact.style.fontWeight = 'normal';
        elContact.style.fontStyle = 'italic';
      }
      if (wrapAction) {
        wrapAction.innerHTML = `
          <button class="btn btn-xs btn-secondary" onclick="toggleCardEdit('contact-personal-email')">
            <i data-feather="plus" style="width: 12px; height: 12px;"></i> Add Gmail
          </button>
        `;
        if (typeof feather !== 'undefined') feather.replace();
      }
    }
  } else if (cardKey && cardKey.startsWith('contact-custom-')) {
    const customVal = card.querySelector('.card-edit-mode input')?.value.trim();
    if (customVal) {
      const valEl = card.querySelector('.val-contact-custom');
      if (valEl) valEl.textContent = customVal;
    }
  }

  card.classList.remove('is-editing');
  triggerToast(`✓ ${getCardLabel(cardKey)} updated successfully!`, 'success');
}

let isEditMode = false;

function toggleEditMode() {
  isEditMode = !isEditMode;
  document.body.classList.toggle('is-edit-mode', isEditMode);

  const editBtnText = document.getElementById('edit-btn-text');
  if (editBtnText) {
    editBtnText.textContent = isEditMode ? 'Editing Profile...' : 'Edit Profile';
  }

  if (isEditMode) {
    triggerToast('Edit mode activated. Editable fields highlighted.', 'info');
  } else {
    triggerToast('Exited edit mode.', 'info');
  }
}

function saveEditMode() {
  isEditMode = false;
  document.body.classList.remove('is-edit-mode');
  const editBtnText = document.getElementById('edit-btn-text');
  if (editBtnText) editBtnText.textContent = 'Edit Profile';
  triggerToast('Profile changes saved successfully!', 'success');
}

function cancelEditMode() {
  isEditMode = false;
  document.body.classList.remove('is-edit-mode');
  const editBtnText = document.getElementById('edit-btn-text');
  if (editBtnText) editBtnText.textContent = 'Edit Profile';
  triggerToast('Changes discarded.', 'info');
}

/* ==========================================================================
   4. SLIDE-OVER DRAWER & DYNAMIC FORM GENERATOR (DISABLED)
   ========================================================================== */
let currentDrawerSection = '';

function openDrawer(docOrFeatureName) {
  const drawer = document.getElementById('slide-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  const drawerTitle = document.getElementById('drawer-title');
  const formContent = document.getElementById('drawer-form-content');

  currentDrawerSection = docOrFeatureName;

  if (drawerTitle) {
    if (docOrFeatureName.includes('Add') || docOrFeatureName.includes('Edit') || docOrFeatureName.includes('Upload')) {
      drawerTitle.textContent = docOrFeatureName;
    } else {
      drawerTitle.textContent = `Update ${docOrFeatureName}`;
    }
  }

  // Render dynamic form tailored to the section clicked
  if (formContent) {
    formContent.innerHTML = generateDrawerFormHTML(docOrFeatureName);
  }

  clearDrawerErrors();

  if (drawer) drawer.classList.add('open');
  if (backdrop) backdrop.classList.add('open');

  if (window.feather) feather.replace();
}

function generateDrawerFormHTML(featureName) {
  const getText = (id, fallback = '') => {
    const el = document.getElementById(id);
    return el ? el.textContent.trim() : fallback;
  };

  if (featureName === 'Basic Information' || featureName === 'Personal Information') {
    const khmerName = getText('val-khmer-name', 'កូវ សេតពិសាល');
    const enName = getText('val-en-name', 'Kauv Seth Pisal');
    const gender = getText('val-gender', 'Male');
    const blood = getText('val-blood-type', 'AB');
    const marital = getText('val-marital-status', 'Single');
    const religion = getText('val-religion', 'Buddhism');
    const nationality = getText('val-nationality', 'Cambodian');

    return `
      <div class="form-group">
        <label class="form-label" for="drawer-input-khmer-name">Khmer Full Name <span class="required">*</span></label>
        <input type="text" class="form-input khmer-font" id="drawer-input-khmer-name" value="${khmerName}" required placeholder="ឈ្មោះជាភាសាខ្មែរ">
      </div>

      <div class="form-group">
        <label class="form-label" for="drawer-input-en-name">English Full Name <span class="required">*</span></label>
        <input type="text" class="form-input" id="drawer-input-en-name" value="${enName}" required placeholder="Full Name in Latin">
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="form-group">
          <label class="form-label" for="drawer-input-dob">Date of Birth <span class="required">*</span></label>
          <input type="date" class="form-input" id="drawer-input-dob" value="2002-07-01" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="drawer-input-gender">Gender <span class="required">*</span></label>
          <select class="form-select" id="drawer-input-gender" required>
            <option value="Male" ${gender === 'Male' ? 'selected' : ''}>Male</option>
            <option value="Female" ${gender === 'Female' ? 'selected' : ''}>Female</option>
            <option value="Other" ${gender === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="form-group">
          <label class="form-label" for="drawer-input-blood">Blood Type</label>
          <select class="form-select" id="drawer-input-blood">
            <option value="A" ${blood === 'A' ? 'selected' : ''}>A</option>
            <option value="B" ${blood === 'B' ? 'selected' : ''}>B</option>
            <option value="AB" ${blood === 'AB' ? 'selected' : ''}>AB</option>
            <option value="O" ${blood === 'O' ? 'selected' : ''}>O</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="drawer-input-marital">Marital Status</label>
          <select class="form-select" id="drawer-input-marital">
            <option value="Single" ${marital === 'Single' ? 'selected' : ''}>Single</option>
            <option value="Married" ${marital === 'Married' ? 'selected' : ''}>Married</option>
            <option value="Divorced" ${marital === 'Divorced' ? 'selected' : ''}>Divorced</option>
            <option value="Widowed" ${marital === 'Widowed' ? 'selected' : ''}>Widowed</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="form-group">
          <label class="form-label" for="drawer-input-religion">Religion</label>
          <input type="text" class="form-input" id="drawer-input-religion" value="${religion}">
        </div>

        <div class="form-group">
          <label class="form-label" for="drawer-input-nationality">Nationality</label>
          <input type="text" class="form-input" id="drawer-input-nationality" value="${nationality}">
        </div>
      </div>
    `;
  }

  if (featureName === 'Address Information') {
    const pob = getText('val-pob', 'Prek Preah Sdach, Battambang Province, Cambodia');
    const perm = getText('val-perm-address', 'Building No. 888K, Sangkat Toul Sangke, 12105, Road 598, Phnom Penh');
    const curr = getText('val-curr-address', 'Building No. 888K, Sangkat Toul Sangke, 12105, Road 598, Phnom Penh');

    return `
      <div class="form-group">
        <label class="form-label" for="drawer-input-pob">Place of Birth <span class="required">*</span></label>
        <textarea class="form-textarea" id="drawer-input-pob" rows="2" required>${pob}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label" for="drawer-input-perm-address">Permanent Address <span class="required">*</span></label>
        <textarea class="form-textarea" id="drawer-input-perm-address" rows="3" required>${perm}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label" for="drawer-input-curr-address">Current Residential Address <span class="required">*</span></label>
        <textarea class="form-textarea" id="drawer-input-curr-address" rows="3" required>${curr}</textarea>
      </div>
    `;
  }

  if (featureName === 'Company Email') {
    const email = getText('val-contact-company-email', 'sethpisal.kauv@vital.com.kh');
    return `
      <div class="form-group">
        <label class="form-label" for="drawer-input-company-email">Company Email <span class="required">*</span></label>
        <input type="email" class="form-input" id="drawer-input-company-email" value="${email}" required placeholder="e.g. employee@company.com">
      </div>
      <div class="form-group">
        <label class="form-label">Email Status</label>
        <select class="form-select" id="drawer-input-email-status">
          <option value="Verified" selected>Verified (Active)</option>
          <option value="Pending">Pending Verification</option>
        </select>
      </div>
    `;
  }

  if (featureName === 'Business Phone') {
    const phone = getText('val-contact-business-phone', '098765434');
    return `
      <div class="form-group">
        <label class="form-label" for="drawer-input-business-phone">Business Phone Number <span class="required">*</span></label>
        <input type="tel" class="form-input" id="drawer-input-business-phone" value="${phone}" required placeholder="e.g. 098765434">
      </div>
      <div class="form-group">
        <label class="form-label">Line Status</label>
        <select class="form-select" id="drawer-input-phone-status">
          <option value="Active" selected>Active Line</option>
          <option value="Inactive">Inactive / Suspended</option>
        </select>
      </div>
    `;
  }

  if (featureName === 'Contact Details' || featureName === 'Contact Information') {
    const email = getText('val-contact-company-email', 'sethpisal.kauv@vital.com.kh');
    const phone = getText('val-contact-business-phone', '098765434');

    return `
      <div class="form-group">
        <label class="form-label" for="drawer-input-company-email">Company Email <span class="required">*</span></label>
        <input type="email" class="form-input" id="drawer-input-company-email" value="${email}" required>
      </div>

      <div class="form-group">
        <label class="form-label" for="drawer-input-business-phone">Business Phone Number <span class="required">*</span></label>
        <input type="tel" class="form-input" id="drawer-input-business-phone" value="${phone}" required>
      </div>

      <div class="form-group">
        <label class="form-label" for="drawer-input-personal-email">Personal Email</label>
        <input type="email" class="form-input" id="drawer-input-personal-email" value="seth.pisal@gmail.com">
      </div>

      <div class="form-group">
        <label class="form-label" for="drawer-input-personal-phone">Personal Phone</label>
        <input type="tel" class="form-input" id="drawer-input-personal-phone" value="012345678">
      </div>
    `;
  }

  if (featureName.includes('National ID')) {
    const num = getText('val-nid-number', '12345678');

    return `
      <div class="form-group">
        <label class="form-label">Document Type</label>
        <input type="text" class="form-input" value="National Identity Card" readonly style="background: #f1f5f9;">
      </div>

      <div class="form-group">
        <label class="form-label" for="drawer-input-docnum">National ID Number <span class="required">*</span></label>
        <input type="text" class="form-input" id="drawer-input-docnum" value="${num}" required>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="form-group" id="group-issue-date">
          <label class="form-label" for="drawer-input-issuedate">Issue Date <span class="required">*</span></label>
          <input type="date" class="form-input" id="drawer-input-issuedate" value="2026-07-01" required onchange="validateDrawerDates()">
        </div>

        <div class="form-group" id="group-expiry-date">
          <label class="form-label" for="drawer-input-expirydate">Expiry Date <span class="required">*</span></label>
          <input type="date" class="form-input" id="drawer-input-expirydate" value="2026-07-31" required onchange="validateDrawerDates()">
          <span class="form-error" id="date-validation-error">Expiry date must be later than issue date.</span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Supporting Document (Scanned Copy)</label>
        <div class="file-dropzone" onclick="triggerToast('Opening file selector...', 'info')">
          <i data-feather="upload-cloud" class="dropzone-icon"></i>
          <div class="dropzone-text">Click or drag National ID PDF/Photo to upload</div>
          <div class="dropzone-sub">Max file size 10MB</div>
        </div>
      </div>
    `;
  }

  if (featureName.includes('Passport')) {
    const num = getText('val-pass-number', 'N12345678');

    return `
      <div class="form-group">
        <label class="form-label">Document Type</label>
        <input type="text" class="form-input" value="Passport" readonly style="background: #f1f5f9;">
      </div>

      <div class="form-group">
        <label class="form-label" for="drawer-input-docnum">Passport Number <span class="required">*</span></label>
        <input type="text" class="form-input" id="drawer-input-docnum" value="${num}" required>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="form-group" id="group-issue-date">
          <label class="form-label" for="drawer-input-issuedate">Issue Date <span class="required">*</span></label>
          <input type="date" class="form-input" id="drawer-input-issuedate" value="2026-07-01" required onchange="validateDrawerDates()">
        </div>

        <div class="form-group" id="group-expiry-date">
          <label class="form-label" for="drawer-input-expirydate">Expiry Date <span class="required">*</span></label>
          <input type="date" class="form-input" id="drawer-input-expirydate" value="2031-07-27" required onchange="validateDrawerDates()">
          <span class="form-error" id="date-validation-error">Expiry date must be later than issue date.</span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Passport Photo / Scanned Pages</label>
        <div class="file-dropzone" onclick="triggerToast('Opening file selector...', 'info')">
          <i data-feather="upload-cloud" class="dropzone-icon"></i>
          <div class="dropzone-text">Click or drag Passport scanned copy to upload</div>
          <div class="dropzone-sub">Max file size 10MB</div>
        </div>
      </div>
    `;
  }

  if (featureName.includes('Driver')) {
    const num = getText('val-dl-number', '123456');

    return `
      <div class="form-group">
        <label class="form-label">Document Type</label>
        <input type="text" class="form-input" value="Driver's License" readonly style="background: #f1f5f9;">
      </div>

      <div class="form-group">
        <label class="form-label" for="drawer-input-docnum">License Number <span class="required">*</span></label>
        <input type="text" class="form-input" id="drawer-input-docnum" value="${num}" required>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="form-group" id="group-issue-date">
          <label class="form-label" for="drawer-input-issuedate">Issue Date <span class="required">*</span></label>
          <input type="date" class="form-input" id="drawer-input-issuedate" value="2026-07-01" required onchange="validateDrawerDates()">
        </div>

        <div class="form-group" id="group-expiry-date">
          <label class="form-label" for="drawer-input-expirydate">Expiry Date <span class="required">*</span></label>
          <input type="date" class="form-input" id="drawer-input-expirydate" value="2031-07-31" required onchange="validateDrawerDates()">
          <span class="form-error" id="date-validation-error">Expiry date must be later than issue date.</span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Driver License Scanned Copy</label>
        <div class="file-dropzone" onclick="triggerToast('Opening file selector...', 'info')">
          <i data-feather="upload-cloud" class="dropzone-icon"></i>
          <div class="dropzone-text">Click or drag Driver's License copy to upload</div>
          <div class="dropzone-sub">Max file size 10MB</div>
        </div>
      </div>
    `;
  }

  // Generic document or module fallback
  return `
    <div class="form-group" id="group-doc-type">
      <label class="form-label" for="drawer-input-doctype">Record / Document Category <span class="required">*</span></label>
      <select class="form-select" id="drawer-input-doctype" required>
        <option value="National ID">National Identity Card</option>
        <option value="Passport">Passport</option>
        <option value="Driver License">Driver's License</option>
        <option value="Degree">Educational Degree / Transcript</option>
        <option value="Certification">Professional Certification</option>
        <option value="Medical">Medical / Health Certificate</option>
      </select>
    </div>

    <div class="form-group" id="group-doc-number">
      <label class="form-label" for="drawer-input-docnum">Reference / Document Number <span class="required">*</span></label>
      <input type="text" class="form-input" id="drawer-input-docnum" placeholder="e.g. REF-109283" value="12345678" required>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
      <div class="form-group" id="group-issue-date">
        <label class="form-label" for="drawer-input-issuedate">Effective / Issue Date <span class="required">*</span></label>
        <input type="date" class="form-input" id="drawer-input-issuedate" value="2026-07-01" required onchange="validateDrawerDates()">
      </div>

      <div class="form-group" id="group-expiry-date">
        <label class="form-label" for="drawer-input-expirydate">Expiry Date</label>
        <input type="date" class="form-input" id="drawer-input-expirydate" value="2028-07-31" onchange="validateDrawerDates()">
        <span class="form-error" id="date-validation-error">Expiry date must be later than issue date.</span>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Supporting Document Attachment</label>
      <div class="file-dropzone" onclick="triggerToast('Opening file selector...', 'info')">
        <i data-feather="upload-cloud" class="dropzone-icon"></i>
        <div class="dropzone-text">Click or drag file to upload</div>
        <div class="dropzone-sub">Supported formats: PDF, JPG, PNG up to 10MB</div>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label" for="drawer-input-notes">Verification Notes</label>
      <textarea class="form-textarea" id="drawer-input-notes" placeholder="Optional comments for HR record auditor..."></textarea>
    </div>
  `;
}

function closeDrawer() {
  const drawer = document.getElementById('slide-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  if (drawer) drawer.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
  clearDrawerErrors();
}

function validateDrawerDates() {
  const issueDateInput = document.getElementById('drawer-input-issuedate');
  const expiryDateInput = document.getElementById('drawer-input-expirydate');
  const expiryGroup = document.getElementById('group-expiry-date');

  if (!issueDateInput || !expiryDateInput || !expiryGroup) return true;
  if (!issueDateInput.value || !expiryDateInput.value) return true;

  const issueDate = new Date(issueDateInput.value);
  const expiryDate = new Date(expiryDateInput.value);

  if (expiryDate <= issueDate) {
    expiryGroup.classList.add('has-error');
    return false;
  } else {
    expiryGroup.classList.remove('has-error');
    return true;
  }
}

function clearDrawerErrors() {
  const errorGroups = document.querySelectorAll('.form-group.has-error');
  errorGroups.forEach(g => g.classList.remove('has-error'));
}

function submitDrawerForm() {
  const isValid = validateDrawerDates();
  if (!isValid) {
    triggerToast('Please correct validation errors before saving.', 'danger');
    return;
  }

  // Update dynamic values based on the section currently being edited
  if (currentDrawerSection === 'Basic Information' || currentDrawerSection === 'Personal Information') {
    const khmerName = document.getElementById('drawer-input-khmer-name')?.value;
    const enName = document.getElementById('drawer-input-en-name')?.value;
    const dob = document.getElementById('drawer-input-dob')?.value;
    const gender = document.getElementById('drawer-input-gender')?.value;
    const blood = document.getElementById('drawer-input-blood')?.value;
    const marital = document.getElementById('drawer-input-marital')?.value;
    const religion = document.getElementById('drawer-input-religion')?.value;
    const nationality = document.getElementById('drawer-input-nationality')?.value;

    if (khmerName) {
      const el = document.getElementById('val-khmer-name');
      if (el) el.textContent = khmerName;
      document.querySelectorAll('.employee-name-title').forEach(e => e.textContent = khmerName);
      document.querySelectorAll('.sticky-profile-khmer-name').forEach(e => e.textContent = khmerName);
    }
    if (enName) {
      const el = document.getElementById('val-en-name');
      if (el) el.textContent = enName;
      document.querySelectorAll('.employee-en-sub').forEach(e => e.textContent = enName);
      document.querySelectorAll('.sticky-profile-name').forEach(e => e.textContent = enName);
    }
    if (dob) {
      const el = document.getElementById('val-dob');
      const formattedDob = new Date(dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      if (el) el.textContent = `${formattedDob} (Age 24)`;
    }
    if (gender) {
      const el = document.getElementById('val-gender');
      if (el) el.textContent = gender;
    }
    if (blood) {
      const el = document.getElementById('val-blood-type');
      if (el) el.textContent = blood;
    }
    if (marital) {
      const el = document.getElementById('val-marital-status');
      if (el) el.textContent = marital;
    }
    if (religion) {
      const el = document.getElementById('val-religion');
      if (el) el.textContent = religion;
    }
    if (nationality) {
      const el = document.getElementById('val-nationality');
      if (el) el.textContent = nationality;
    }
  } else if (currentDrawerSection === 'Address Information') {
    const pob = document.getElementById('drawer-input-pob')?.value;
    const perm = document.getElementById('drawer-input-perm-address')?.value;
    const curr = document.getElementById('drawer-input-curr-address')?.value;

    if (pob) {
      const el = document.getElementById('val-pob');
      if (el) el.textContent = pob;
    }
    if (perm) {
      const el = document.getElementById('val-perm-address');
      if (el) el.textContent = perm;
    }
    if (curr) {
      const el = document.getElementById('val-curr-address');
      if (el) el.textContent = curr;
    }
  } else if (currentDrawerSection.includes('National ID')) {
    const num = document.getElementById('drawer-input-docnum')?.value;
    const issueDate = document.getElementById('drawer-input-issuedate')?.value;
    const expiryDate = document.getElementById('drawer-input-expirydate')?.value;
    const auth = document.getElementById('drawer-input-authority')?.value;

    if (num) {
      const el = document.getElementById('val-nid-number');
      if (el) el.textContent = num;
    }
    if (issueDate) {
      const el = document.getElementById('val-nid-issuedate');
      if (el) el.textContent = new Date(issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    if (expiryDate) {
      const el = document.getElementById('val-nid-expirydate');
      const badge = document.getElementById('badge-nid-status');
      const isExpired = new Date(expiryDate) < new Date();
      if (el) {
        el.textContent = new Date(expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        el.style.color = isExpired ? '#dc2626' : '#0f172a';
      }
      if (badge) {
        badge.className = isExpired ? 'badge badge-danger' : 'badge badge-valid';
        badge.textContent = isExpired ? 'Expired' : 'Valid';
      }
    }
  } else if (currentDrawerSection.includes('Passport')) {
    const num = document.getElementById('drawer-input-docnum')?.value;
    const issueDate = document.getElementById('drawer-input-issuedate')?.value;
    const expiryDate = document.getElementById('drawer-input-expirydate')?.value;

    if (num) {
      const el = document.getElementById('val-pass-number');
      if (el) el.textContent = num;
    }
    if (issueDate) {
      const el = document.getElementById('val-pass-issuedate');
      if (el) el.textContent = new Date(issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    if (expiryDate) {
      const el = document.getElementById('val-pass-expirydate');
      const badge = document.getElementById('badge-pass-status');
      const isExpired = new Date(expiryDate) < new Date();
      if (el) {
        el.textContent = new Date(expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        el.style.color = isExpired ? '#dc2626' : '#0f172a';
      }
      if (badge) {
        badge.className = isExpired ? 'badge badge-danger' : 'badge badge-valid';
        badge.textContent = isExpired ? 'Expired' : 'Valid';
      }
    }
  } else if (currentDrawerSection.includes('Driver')) {
    const num = document.getElementById('drawer-input-docnum')?.value;
    const issueDate = document.getElementById('drawer-input-issuedate')?.value;
    const expiryDate = document.getElementById('drawer-input-expirydate')?.value;

    if (num) {
      const el = document.getElementById('val-dl-number');
      if (el) el.textContent = num;
    }
    if (issueDate) {
      const el = document.getElementById('val-dl-issuedate');
      if (el) el.textContent = new Date(issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    if (expiryDate) {
      const el = document.getElementById('val-dl-expirydate');
      const badge = document.getElementById('badge-dl-status');
      const isExpired = new Date(expiryDate) < new Date();
      if (el) {
        el.textContent = new Date(expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        el.style.color = isExpired ? '#dc2626' : '#0f172a';
      }
      if (badge) {
        badge.className = isExpired ? 'badge badge-danger' : 'badge badge-valid';
        badge.textContent = isExpired ? 'Expired' : 'Valid';
      }
    }
    if (vclass) {
      const el = document.getElementById('val-dl-vehicleclass');
      if (el) el.textContent = vclass;
    }
  } else if (currentDrawerSection === 'Company Email') {
    const compEmail = document.getElementById('drawer-input-company-email')?.value;
    if (compEmail) {
      const elHeader = document.getElementById('header-email-val');
      const elContact = document.getElementById('val-contact-company-email');
      if (elHeader) {
        elHeader.textContent = compEmail;
        elHeader.title = compEmail;
      }
      if (elContact) elContact.textContent = compEmail;
    }
  } else if (currentDrawerSection === 'Business Phone') {
    const busPhone = document.getElementById('drawer-input-business-phone')?.value;
    if (busPhone) {
      const elHeader = document.getElementById('header-phone-val');
      const elContact = document.getElementById('val-contact-business-phone');
      if (elHeader) elHeader.textContent = busPhone;
      if (elContact) elContact.textContent = busPhone;
    }
  } else if (currentDrawerSection.includes('Contact')) {
    const compEmail = document.getElementById('drawer-input-company-email')?.value;
    const busPhone = document.getElementById('drawer-input-business-phone')?.value;

    if (compEmail) {
      const elHeader = document.getElementById('header-email-val');
      const elContact = document.getElementById('val-contact-company-email');
      if (elHeader) {
        elHeader.textContent = compEmail;
        elHeader.title = compEmail;
      }
      if (elContact) elContact.textContent = compEmail;
    }
    if (busPhone) {
      const elHeader = document.getElementById('header-phone-val');
      const elContact = document.getElementById('val-contact-business-phone');
      if (elHeader) elHeader.textContent = busPhone;
      if (elContact) elContact.textContent = busPhone;
    }
  }

  closeDrawer();
  triggerToast(`${currentDrawerSection} record updated and saved!`, 'success');
  if (window.feather) feather.replace();
}

function handleDrawerSubmit(e) {
  e.preventDefault();
  submitDrawerForm();
}

/* ==========================================================================
   5. DOCUMENTS SEARCH & FILTER ENGINE
   ========================================================================== */
function filterDocumentsTable() {
  const searchInput = document.getElementById('doc-search-input');
  const categoryFilter = document.getElementById('doc-category-filter');
  const statusFilter = document.getElementById('doc-status-filter');
  const tableRows = document.querySelectorAll('#documents-table-body tr');

  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedCat = categoryFilter ? categoryFilter.value : 'all';
  const selectedStatus = statusFilter ? statusFilter.value : 'all';

  tableRows.forEach(row => {
    const rowName = (row.getAttribute('data-name') || '').toLowerCase();
    const rowCat = row.getAttribute('data-category') || '';
    const rowStatus = row.getAttribute('data-status') || '';

    const matchesQuery = query === '' || rowName.includes(query);
    const matchesCat = selectedCat === 'all' || rowCat === selectedCat;
    const matchesStatus = selectedStatus === 'all' || rowStatus === selectedStatus;

    if (matchesQuery && matchesCat && matchesStatus) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

/* ==========================================================================
   6. DROPDOWN CONTROLLER
   ========================================================================== */
function toggleDropdownMenu(dropdownTarget) {
  let targetElement;
  if (typeof dropdownTarget === 'string') {
    targetElement = document.getElementById(dropdownTarget);
  } else {
    targetElement = dropdownTarget;
  }

  if (!targetElement) return;

  const isOpen = targetElement.classList.contains('open');

  // Close other open dropdowns first
  document.querySelectorAll('.dropdown-wrapper.open').forEach(el => {
    if (el !== targetElement) el.classList.remove('open');
  });

  targetElement.classList.toggle('open', !isOpen);
}

/* ==========================================================================
   7. 1-CLICK CLIPBOARD UTILITY
   ========================================================================== */
function copyToClipboard(text, label) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      triggerToast(`Copied ${label} (${text}) to clipboard!`, 'success');
    }).catch(() => {
      fallbackCopy(text, label);
    });
  } else {
    fallbackCopy(text, label);
  }
}

function fallbackCopy(text, label) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    triggerToast(`Copied ${label} (${text}) to clipboard!`, 'success');
  } catch (err) {
    triggerToast(`Failed to copy ${label}`, 'danger');
  }
  document.body.removeChild(textArea);
}

/* ==========================================================================
   8. TOAST NOTIFICATIONS
   ========================================================================== */
function triggerToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const iconName = type === 'success' ? 'check-circle' : type === 'danger' ? 'alert-circle' : 'info';
  toast.innerHTML = `
    <i data-feather="${iconName}" style="width: 15px; height: 15px; flex-shrink: 0;"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  if (window.feather) feather.replace();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3500);
}

/* ==========================================================================
   9. INLINE TABLE EDITING & ROW MANAGEMENT CONTROLLER
   ========================================================================== */
function renderAttachmentLinks(val, tableType = 'documents') {
  if (!val || val === '-') return '<span style="color: #94a3b8;">—</span>';
  const files = Array.isArray(val)
    ? val
    : String(val).split(/,\s*|\n+/).map(s => s.trim()).filter(Boolean);
  if (files.length === 0) return '<span style="color: #94a3b8;">—</span>';

  const firstFile = files[0];
  const isImg = firstFile.match(/\.(png|jpg|jpeg|webp)$/i);

  if (files.length === 1) {
    return `<span class="doc-attachment-link" title="${firstFile}"><i data-feather="${isImg ? 'image' : 'paperclip'}" style="width: 12px; height: 12px;"></i> <span>${firstFile}</span></span>`;
  }

  // 2 or more files: show only 1 attachment + non-clickable badge with remaining count
  const remainingCount = files.length - 1;
  const remainingTitles = files.slice(1).join(', ');
  const allFilesAttr = files.join(', ');

  return `<div class="multi-attachment-group" data-all-files="${allFilesAttr}">` +
    `<span class="doc-attachment-link" title="${firstFile}"><i data-feather="${isImg ? 'image' : 'paperclip'}" style="width: 11px; height: 11px;"></i> <span>${firstFile}</span></span>` +
    `<span class="attachment-more-badge" title="${remainingTitles}">+${remainingCount} more</span>` +
    `</div>`;
}

const TABLE_SCHEMAS = {
  family: {
    sectionId: 'section-family',
    tbodySelector: '#tbody-family',
    cardCountSelector: '#section-family .card-title-count',
    navTab: 'family',
    singular: 'Family Member',
    columns: [
      { key: 'name', label: 'Name', type: 'text', placeholder: 'Full Name', class: 'table-cell-title' },
      {
        key: 'relationship',
        label: 'Relationship',
        type: 'select',
        options: ['Cousin', 'Child', 'Spouse', 'Parent', 'Sibling', 'Relative', 'Other'],
        render: (val) => `<span class="badge ${val === 'Child' ? 'badge-info' : val === 'Spouse' ? 'badge-success' : 'badge-neutral'}">${val}</span>`
      },
      { key: 'occupation', label: 'Occupation', type: 'text', placeholder: 'Occupation', default: 'Employee' },
      { key: 'dob', label: 'Date of Birth', type: 'text', placeholder: 'DD Mon YYYY', default: '01 Jan 2000' }
    ]
  },
  emergency: {
    sectionId: 'section-emergency',
    tbodySelector: '#tbody-emergency',
    cardCountSelector: '#section-emergency .card-title-count',
    navTab: 'emergency',
    singular: 'Emergency Contact',
    columns: [
      {
        key: 'name',
        label: 'Contact Name',
        type: 'text',
        placeholder: 'Contact Name',
        render: (val) => `<div class="table-cell-title"><span>${val}</span></div>`
      },
      { key: 'relationship', label: 'Relationship', type: 'select', options: ['Cousin', 'Child', 'Spouse', 'Parent', 'Sibling', 'Friend', 'Colleague'] },
      {
        key: 'phone',
        label: 'Phone Number',
        type: 'text',
        placeholder: '012356988',
        render: (val) => `<span style="font-family: monospace; font-weight: 600;">${val}</span> <button class="copy-pill-btn" onclick="copyToClipboard('${val}', 'Emergency Phone')"><i data-feather="copy" style="width: 11px; height: 11px;"></i></button>`
      },
      { key: 'address', label: 'City/Province', type: 'text', placeholder: 'Phnom Penh, Kampong Cham...' }
    ]
  },
  education: {
    sectionId: 'section-education',
    tbodySelector: '#tbody-education',
    cardCountSelector: '#section-education .card-title-count',
    navTab: 'education',
    singular: 'Education',
    columns: [
      { key: 'period', label: 'Period', type: 'text', placeholder: '2021 – 2025', tdClass: 'col-period', required: true, render: (val) => `<strong>${val}</strong>` },
      { key: 'degree', label: 'Degree', type: 'select', options: ["Bachelor's Degree", "Master's Degree", "Associate's Degree", "High School", "Doctorate", "Professional Diploma"], required: true },
      { key: 'major', label: 'Major / Subject', type: 'text', placeholder: 'Computer Programming', required: true },
      { key: 'institution', label: 'Institution', type: 'text', placeholder: 'Institution Name', required: true },
      { key: 'country', label: 'Country', type: 'text', placeholder: 'Cambodia', default: 'Cambodia', required: true },
      { key: 'gpa', label: 'GPA', type: 'text', placeholder: '3.7', render: (val) => `<span class="badge badge-info" style="font-weight: 700;">${val || '3.5'}</span>` },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: ['Graduated', 'In Progress', 'Completed', 'On Hold'],
        render: (val) => `<span class="badge badge-success">${val}</span>`
      },
      {
        key: 'attachment',
        label: 'Attachment',
        type: 'file',
        required: true,
        placeholder: 'Degree_Certificate_RUPP.pdf',
        default: 'Degree_Certificate_RUPP.pdf',
        render: (val) => renderAttachmentLinks(val, 'education')
      }
    ]
  },
  languages: {
    sectionId: 'section-languages',
    tbodySelector: '#tbody-languages',
    cardCountSelector: '#section-languages .card-title-count',
    navTab: 'languages',
    singular: 'Language',
    columns: [
      {
        key: 'language',
        label: 'Language',
        type: 'text',
        placeholder: 'English',
        render: (val) => {
          const lower = val.toLowerCase();
          const flag = lower.includes('english') ? '🇬🇧' : lower.includes('chinese') ? '🇨🇳' : lower.includes('khmer') || lower.includes('cambodia') ? '🇰🇭' : lower.includes('french') ? '🇫🇷' : lower.includes('japanese') ? '🇯🇵' : '🌐';
          return `<div class="table-cell-title" style="display: flex; align-items: center; gap: 8px;"><span style="font-size: 16px;">${flag}</span><span>${val}</span></div>`;
        }
      },
      { key: 'type', label: 'Type', type: 'select', options: ['Second Language', 'Native / Mother Tongue', 'Foreign Language'] },
      {
        key: 'proficiency',
        label: 'Proficiency Level',
        type: 'select',
        options: ['Advanced (C1)', 'Beginner (A1)', 'Elementary (A2)', 'Intermediate (B1)', 'Upper Intermediate (B2)', 'Mastery (C2)', 'Native'],
        render: (val) => `<span class="badge ${val.includes('Advanced') || val.includes('Native') || val.includes('Mastery') ? 'badge-success' : 'badge-neutral'}">${val}</span>`
      },
      { key: 'description', label: 'Description', type: 'text', placeholder: 'Proficiency description', tdClass: 'col-desc' }
    ]
  },
  'training-course': {
    sectionId: 'section-training',
    tbodySelector: '#tbody-training-courses',
    cardCountSelector: '#count-training-courses',
    navTab: 'training',
    singular: 'Training',
    columns: [
      { key: 'title', label: 'Course Title', type: 'text', placeholder: 'Course Title', class: 'table-cell-title' },
      { key: 'institution', label: 'Institution', type: 'text', placeholder: 'Institution' },
      { key: 'period', label: 'Period', type: 'text', placeholder: '01-Jul-2026 – 31-Jul-2026', tdClass: 'col-period' },
      { key: 'duration', label: 'Duration', type: 'text', placeholder: '50 Hours', render: (val) => `<strong>${val}</strong>` },
      { key: 'description', label: 'Description', type: 'text', placeholder: 'Topics covered', tdClass: 'col-desc' },
      {
        key: 'attachment',
        label: 'Attachment',
        type: 'file',
        placeholder: 'training_cert.pdf',
        default: 'training_course_cert.pdf',
        render: (val) => renderAttachmentLinks(val, 'training-course')
      }
    ]
  },
  certification: {
    sectionId: 'section-training',
    tbodySelector: '#tbody-certifications',
    cardCountSelector: '#count-certifications',
    navTab: 'training',
    singular: 'Certification',
    columns: [
      { key: 'title', label: 'Certification', type: 'text', placeholder: 'Certification Title', class: 'table-cell-title' },
      { key: 'institution', label: 'Accrediting Institution', type: 'text', placeholder: 'Accrediting Institution' },
      { key: 'issueDate', label: 'Issue Date', type: 'text', placeholder: 'Oct 2026' },
      { key: 'description', label: 'Description', type: 'text', placeholder: 'Domain & specialization', tdClass: 'col-desc' },
      {
        key: 'attachment',
        label: 'Attachment',
        type: 'file',
        placeholder: 'certificate.pdf',
        default: 'aws_cloud_cert.pdf',
        render: (val) => renderAttachmentLinks(val, 'certification')
      }
    ]
  },
  experience: {
    sectionId: 'section-experience',
    tbodySelector: '#tbody-experience',
    cardCountSelector: '#section-experience .card-title-count',
    navTab: 'experience',
    singular: 'Work Experience',
    columns: [
      { key: 'company', label: 'Company', type: 'text', placeholder: 'Company Name', class: 'table-cell-title' },
      { key: 'position', label: 'Position Held', type: 'text', placeholder: 'Position Title', class: 'table-cell-title' },
      { key: 'period', label: 'Period', type: 'text', placeholder: '01-Jan-2024 – 30-Jun-2026', tdClass: 'col-period' },
      { key: 'location', label: 'Location', type: 'text', placeholder: 'Phnom Penh, Cambodia' }
    ]
  },
  documents: {
    sectionId: 'section-documents',
    tbodySelector: '#documents-table-body',
    cardCountSelector: '#section-documents .card-title-count',
    navTab: 'documents',
    singular: 'Document',
    columns: [
      {
        key: 'name',
        label: 'Document Name',
        type: 'select',
        options: ['National ID', 'Passport', 'Driver License', 'NSSF Card', 'Employment Contract', 'RUPP Bachelor Degree', 'ITIL v4 Certificate', 'Annual Medical Checkup', 'Other Document'],
        class: 'table-cell-title'
      },
      { key: 'issuedDate', label: 'Issued Date', type: 'text', placeholder: '01 Jul 2026', default: '01 Jul 2026' },
      {
        key: 'expiryDate',
        label: 'Expiry Date',
        type: 'text',
        placeholder: '31 Jul 2026',
        render: (val) => val.includes('Expired') || val.includes('2026') ? `<strong style="color: #ef4444;">${val}</strong>` : val
      },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: ['Valid', 'Expired', 'Expiring Soon', 'Missing', 'Pending'],
        render: (val) => `<span class="badge ${val === 'Valid' ? 'badge-valid' : val === 'Expired' ? 'badge-danger' : val === 'Missing' ? 'badge-draft' : 'badge-warning'}">${val}</span>`
      },
      {
        key: 'attachment',
        label: 'Attachment',
        type: 'file',
        placeholder: 'document.pdf',
        default: '',
        render: (val) => renderAttachmentLinks(val, 'documents')
      }
    ]
  }
};

// Aliases for schema lookups
TABLE_SCHEMAS['language'] = TABLE_SCHEMAS.languages;
TABLE_SCHEMAS['training'] = TABLE_SCHEMAS['training-course'];
TABLE_SCHEMAS['training-courses'] = TABLE_SCHEMAS['training-course'];
TABLE_SCHEMAS['courses'] = TABLE_SCHEMAS['training-course'];
TABLE_SCHEMAS['certifications'] = TABLE_SCHEMAS.certification;
TABLE_SCHEMAS['work-experience'] = TABLE_SCHEMAS.experience;
TABLE_SCHEMAS['document'] = TABLE_SCHEMAS.documents;

function getRowCellRawText(td) {
  if (!td) return '';
  // If there's an input or select, get its value
  const input = td.querySelector('input, select, textarea');
  if (input) return input.value.trim();

  // If cell contains multi-attachment group with dataset
  const multiGroup = td.querySelector('.multi-attachment-group');
  if (multiGroup && multiGroup.dataset.allFiles) {
    return multiGroup.dataset.allFiles.trim();
  }

  // If cell contains attachment links, extract link texts and any remaining files from badge
  const docLinks = td.querySelectorAll('.doc-attachment-link');
  if (docLinks.length > 0) {
    const linkTexts = Array.from(docLinks).map(a => a.querySelector('span')?.textContent.trim() || a.textContent.trim()).filter(Boolean);
    const moreBadge = td.querySelector('.attachment-more-badge');
    if (moreBadge && moreBadge.title) {
      const moreFiles = moreBadge.title.split(/,\s*|\n+/).map(s => s.trim()).filter(Boolean);
      return [...linkTexts, ...moreFiles].join(', ');
    }
    return linkTexts.join(', ');
  }

  // Clean clone to get pure text excluding badges/copy buttons
  const clone = td.cloneNode(true);
  clone.querySelectorAll('.copy-pill-btn, .row-action-btn, i, svg').forEach(el => el.remove());
  return clone.textContent.trim();
}

function startEditTableRow(btnOrElement, tableType) {
  const tr = (btnOrElement && btnOrElement.tagName === 'TR') ? btnOrElement : (btnOrElement ? btnOrElement.closest('tr') : null);
  const schema = TABLE_SCHEMAS[tableType];
  if (!schema) return;

  if (tableType === 'documents' || tableType === 'document') {
    openDocumentModal(tr);
    return;
  }

  // Use Modal dialog for tables with attachments
  const hasAttachment = schema.columns.some(col => col.type === 'file' || col.key === 'attachment');
  if (hasAttachment) {
    openTableRecordModal(tableType, tr);
    return;
  }

  if (tr.classList.contains('is-editing-row')) return;

  // Save current HTML for cancellation
  tr.dataset.originalHtml = tr.innerHTML;
  tr.classList.add('is-editing-row');

  // Extract current cell text values
  const currentTds = Array.from(tr.children);
  const currentValues = schema.columns.map((col, idx) => {
    return getRowCellRawText(currentTds[idx]);
  });

  // Build edit cells
  let newHtml = '';
  schema.columns.forEach((col, idx) => {
    const val = currentValues[idx] || col.default || '';
    const tdClass = col.tdClass ? ` class="${col.tdClass}"` : '';

    if (col.type === 'select') {
      const optionsHtml = col.options.map(opt => {
        const isSelected = val.toLowerCase().includes(opt.toLowerCase()) || opt.toLowerCase().includes(val.toLowerCase());
        return `<option value="${opt}" ${isSelected ? 'selected' : ''}>${opt}</option>`;
      }).join('');
      newHtml += `<td${tdClass}><select class="table-select" data-key="${col.key}">${optionsHtml}</select></td>`;
    } else if (col.type === 'file' || col.key === 'attachment') {
      const displayVal = val && val !== '-' ? val : '';
      newHtml += `
        <td${tdClass}>
          <input type="file" style="display: none;" onchange="handleTableAttachmentSelect(this)" accept=".pdf,.doc,.docx,.png,.jpg">
          <input type="hidden" class="table-input" data-key="${col.key}" value="${displayVal.replace(/"/g, '&quot;')}">
          <button type="button" class="btn btn-xs btn-secondary btn-table-upload" onclick="this.previousElementSibling.previousElementSibling.click()" style="display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; padding: 4px 8px; border-radius: 4px; white-space: nowrap; max-width: 140px;">
            <i data-feather="${displayVal ? 'paperclip' : 'upload-cloud'}" style="width: 12px; height: 12px; flex-shrink: 0;"></i>
            <span class="upload-btn-label" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${displayVal || 'Add Attach'}</span>
          </button>
        </td>
      `;
    } else {
      newHtml += `<td${tdClass}><input type="text" class="table-input" data-key="${col.key}" value="${val.replace(/"/g, '&quot;')}" placeholder="${col.placeholder || col.label}"></td>`;
    }
  });

  // Add Action buttons
  newHtml += `
    <td class="table-actions-cell" onclick="event.stopPropagation();">
      <div class="table-row-actions-group">
        <button class="btn-table-action-save" title="Save changes" onclick="saveTableRow(this, '${tableType}')">Save</button>
        <button class="btn-table-action-cancel" title="Cancel" onclick="cancelEditTableRow(this, '${tableType}')">Cancel</button>
        ${tableType !== 'education' ? `
        <button class="btn-table-action-delete" title="Delete record" onclick="deleteTableRow(this, '${tableType}')">
          <i data-feather="trash-2" style="width: 13px; height: 13px;"></i>
        </button>` : ''}
      </div>
    </td>
  `;

  tr.innerHTML = newHtml;

  // Auto-focus first input
  const firstInput = tr.querySelector('input, select');
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 50);
  }

  if (window.feather) feather.replace();
  triggerToast(`Editing ${schema.singular} inline`, 'info');
}

function addNewTableRow(tableType) {
  const schema = TABLE_SCHEMAS[tableType];
  if (!schema) return;

  if (tableType === 'documents' || tableType === 'document') {
    openDocumentModal(null);
    return;
  }

  // Use Modal dialog for tables with attachments
  const hasAttachment = schema.columns.some(col => col.type === 'file' || col.key === 'attachment');
  if (hasAttachment) {
    openTableRecordModal(tableType, null);
    return;
  }

  const tbody = document.querySelector(schema.tbodySelector);
  if (!tbody) return;

  const newTr = document.createElement('tr');
  newTr.className = 'is-editing-row is-new-row';

  let cellsHtml = '';
  schema.columns.forEach(col => {
    const tdClass = col.tdClass ? ` class="${col.tdClass}"` : '';
    if (col.type === 'select') {
      const optionsHtml = col.options.map((opt, i) => `<option value="${opt}" ${i === 0 ? 'selected' : ''}>${opt}</option>`).join('');
      cellsHtml += `<td${tdClass}><select class="table-select" data-key="${col.key}">${optionsHtml}</select></td>`;
    } else if (col.type === 'file' || col.key === 'attachment') {
      const defVal = col.default || '';
      cellsHtml += `
        <td${tdClass}>
          <input type="file" style="display: none;" onchange="handleTableAttachmentSelect(this)" accept=".pdf,.doc,.docx,.png,.jpg">
          <input type="hidden" class="table-input" data-key="${col.key}" value="${defVal}">
          <button type="button" class="btn btn-xs btn-secondary btn-table-upload" onclick="this.previousElementSibling.previousElementSibling.click()" style="display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; padding: 4px 8px; border-radius: 4px; white-space: nowrap; max-width: 140px;">
            <i data-feather="${defVal ? 'paperclip' : 'upload-cloud'}" style="width: 12px; height: 12px; flex-shrink: 0;"></i>
            <span class="upload-btn-label" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${defVal || 'Add Attach'}</span>
          </button>
        </td>
      `;
    } else {
      const defVal = col.default || '';
      cellsHtml += `<td${tdClass}><input type="text" class="table-input" data-key="${col.key}" value="${defVal}" placeholder="${col.placeholder || col.label}"></td>`;
    }
  });

  cellsHtml += `
    <td class="table-actions-cell" onclick="event.stopPropagation();">
      <div class="table-row-actions-group">
        <button class="btn-table-action-save" title="Save new record" onclick="saveTableRow(this, '${tableType}')">Save</button>
        <button class="btn-table-action-cancel" title="Cancel" onclick="cancelEditTableRow(this, '${tableType}')">Cancel</button>
      </div>
    </td>
  `;

  newTr.innerHTML = cellsHtml;
  tbody.insertBefore(newTr, tbody.firstChild);

  // Auto focus first input
  const firstInput = newTr.querySelector('input, select');
  if (firstInput) {
    setTimeout(() => {
      firstInput.focus();
      firstInput.select();
    }, 50);
  }

  if (window.feather) feather.replace();
  triggerToast(`Adding new row to ${schema.singular}...`, 'info');
}

function saveTableRow(btnOrElement, tableType) {
  const tr = btnOrElement.closest('tr');
  const schema = TABLE_SCHEMAS[tableType];
  if (!tr || !schema) return;

  // Read input values
  const rowData = {};
  schema.columns.forEach(col => {
    const input = tr.querySelector(`[data-key="${col.key}"]`);
    rowData[col.key] = input ? input.value.trim() : (col.default || '');
  });

  // Validation: check required columns
  for (const col of schema.columns) {
    if (col.required && (!rowData[col.key] || rowData[col.key] === '-')) {
      const input = tr.querySelector(`[data-key="${col.key}"]`);
      if (input) {
        input.style.borderColor = '#ef4444';
        input.focus();
      }
      triggerToast(`Please enter ${col.label} (Required)`, 'danger');
      return;
    }
  }

  // Render clean table row
  let rowHtml = '';
  schema.columns.forEach(col => {
    const val = rowData[col.key] || '-';
    const tdClass = col.tdClass ? ` class="${col.tdClass}"` : '';

    if (col.render) {
      rowHtml += `<td${tdClass}>${col.render(val)}</td>`;
    } else if (col.class) {
      rowHtml += `<td${tdClass}><div class="${col.class}">${val}</div></td>`;
    } else {
      rowHtml += `<td${tdClass}>${val}</td>`;
    }
  });

  rowHtml += `
    <td class="table-actions-cell" onclick="event.stopPropagation();">
      <button class="row-action-btn" title="View Details" onclick="previewTableRow(this, '${tableType}')">
        <i data-feather="eye" style="width: 15px; height: 15px;"></i>
      </button>
      <div class="dropdown-wrapper">
        <button class="row-action-btn table-more-btn" title="More Actions" onclick="toggleDropdownMenu(this.parentElement)">
          <i data-feather="more-vertical" style="width: 15px; height: 15px;"></i>
        </button>
        <div class="dropdown-menu">
          <button class="dropdown-item" onclick="previewTableRow(this, '${tableType}')">
            <i data-feather="eye" style="width: 13px; height: 13px;"></i> Preview Details
          </button>
          <button class="dropdown-item" onclick="startEditTableRow(this, '${tableType}')">
            <i data-feather="edit-2" style="width: 13px; height: 13px;"></i> Edit
          </button>
          ${tableType === 'documents' || tableType === 'document' ? `
          <button class="dropdown-item" onclick="triggerToast('Downloading document...', 'info')">
            <i data-feather="download" style="width: 13px; height: 13px;"></i> Download
          </button>` : ''}
          ${tableType !== 'education' ? `
          <div class="dropdown-divider"></div>
          <button class="dropdown-item danger" onclick="deleteTableRow(this, '${tableType}')">
            <i data-feather="trash-2" style="width: 13px; height: 13px;"></i> Delete
          </button>` : ''}
        </div>
      </div>
    </td>
  `;

  tr.innerHTML = rowHtml;
  tr.classList.remove('is-editing-row', 'is-new-row');
  delete tr.dataset.originalHtml;

  // Update section counts
  updateTableSectionCounts(tableType);

  if (window.feather) feather.replace();
  triggerToast(`${schema.singular} saved successfully!`, 'success');
}

function cancelEditTableRow(btnOrElement, tableType) {
  const tr = btnOrElement.closest('tr');
  const schema = TABLE_SCHEMAS[tableType];
  if (!tr) return;

  if (tr.classList.contains('is-new-row')) {
    tr.remove();
  } else if (tr.dataset.originalHtml) {
    tr.innerHTML = tr.dataset.originalHtml;
    tr.classList.remove('is-editing-row');
    delete tr.dataset.originalHtml;
  }

  updateTableSectionCounts(tableType);

  if (window.feather) feather.replace();
  triggerToast('Editing cancelled', 'info');
}

function deleteTableRow(btnOrElement, tableType) {
  const tr = btnOrElement.closest('tr');
  const schema = TABLE_SCHEMAS[tableType];
  if (!tr) return;

  const firstCol = tr.querySelector('.table-cell-title, td');
  const recordName = firstCol ? firstCol.textContent.trim() : 'record';

  tr.style.opacity = '0';
  tr.style.transform = 'scale(0.95)';
  tr.style.transition = 'all 0.25s ease';

  setTimeout(() => {
    tr.remove();
    updateTableSectionCounts(tableType);
    triggerToast(`Removed "${recordName}"`, 'info');
  }, 250);
}

function viewTableRowDetails(btnOrElement, tableType) {
  const tr = btnOrElement.closest('tr');
  const firstCol = tr ? tr.querySelector('.table-cell-title, td') : null;
  const name = firstCol ? firstCol.textContent.trim() : 'Record';
  triggerToast(`Viewing details for ${name}`, 'info');
}

function updateTableSectionCounts(tableType) {
  const schema = TABLE_SCHEMAS[tableType];
  if (!schema) return;

  const tbody = document.querySelector(schema.tbodySelector);
  if (!tbody) return;

  const count = tbody.querySelectorAll('tr').length;

  // Update card header count badge
  if (schema.cardCountSelector) {
    const cardCountEl = document.querySelector(schema.cardCountSelector);
    if (cardCountEl) {
      cardCountEl.textContent = `(${count})`;
    }
  }

  // Update left sidebar nav badge
  if (schema.navTab) {
    const navBadge = document.querySelector(`.nav-item-btn[data-tab="${schema.navTab}"] .nav-badge`);
    if (navBadge) {
      if (schema.navTab === 'training') {
        // Training section contains both courses and certifications
        const totalTraining = (document.querySelector(TABLE_SCHEMAS['training-course'].tbodySelector)?.querySelectorAll('tr').length || 0) +
          (document.querySelector(TABLE_SCHEMAS['certification'].tbodySelector)?.querySelectorAll('tr').length || 0);
        navBadge.textContent = totalTraining;
        const mainCountEl = document.getElementById('count-training-main');
        if (mainCountEl) mainCountEl.textContent = `(${totalTraining})`;
      } else if (schema.navTab === 'documents') {
        navBadge.textContent = `${count}/${count}`;
      } else {
        navBadge.textContent = count;
      }
    }
  }
}

/* ==========================================================================
   11. ADDRESS EDIT MODAL CONTROLLER (Structured 3-Column Fields)
   ========================================================================== */
let currentAddressModalType = 'all';

function parseAddressString(raw) {
  const res = {
    province: 'Phnom Penh',
    district: '',
    commune: '',
    houseNo: '',
    street: '',
    village: ''
  };

  if (!raw) return res;
  const str = raw.trim();

  const provinces = [
    'Banteay Meanchey', 'Battambang', 'Kampong Cham', 'Kampong Chhnang', 'Kampong Speu',
    'Kampong Thom', 'Kampot', 'Kandal', 'Kep', 'Koh Kong', 'Kratie', 'Mondulkiri',
    'Phnom Penh', 'Preah Vihear', 'Preah Sihanouk', 'Prey Veng', 'Pursat', 'Ratanakiri',
    'Siem Reap', 'Stung Treng', 'Svay Rieng', 'Takeo', 'Oddar Meanchey', 'Pailin', 'Tboung Khmum'
  ];

  for (const p of provinces) {
    if (new RegExp('\\b' + p + '\\b', 'i').test(str)) {
      res.province = p;
      break;
    }
  }

  const houseMatch = str.match(/(?:Building No\.?\s*[^\,\;]+|#\s*\d+[a-zA-Z]?|No\.?\s*\d+[a-zA-Z]?|House\s*#?\s*\d+)/i);
  if (houseMatch) {
    res.houseNo = houseMatch[0].trim();
  }

  const streetMatch = str.match(/(?:Road\s*[\d\w\-]+|Street\s*[\d\w\-]+|St\.?\s*[\d\w\-]+)/i);
  if (streetMatch) {
    res.street = streetMatch[0].trim();
  }

  const communeMatch = str.match(/(?:Sangkat\s*[^\,\;]+|Commune\s*[^\,\;]+|Prek Preah Sdach|Spean Sraeng|Toul Sangke)/i);
  if (communeMatch) {
    res.commune = communeMatch[0].trim();
  }

  const districtMatch = str.match(/(?:Khan\s*[^\,\;]+|District\s*[^\,\;]+|Phnum Srok|Russey Keo|Toul Kouk|Chamkar Mon|Doun Penh)/i);
  if (districtMatch) {
    res.district = districtMatch[0].trim();
  }

  const villageMatch = str.match(/(?:Village\s*[\d\w]+|Group\s*[\d\w]+|\b\d{5}\b|Phum\s*[^\,\;]+)/i);
  if (villageMatch) {
    res.village = villageMatch[0].trim();
  }

  // Fallbacks
  const parts = str.split(',').map(s => s.trim().replace(/^Cambodia$/i, '')).filter(Boolean);
  if (!res.houseNo && parts.length > 0 && /[\d#]/.test(parts[0])) {
    res.houseNo = parts[0];
  }
  if (!res.commune && parts.length >= 2) {
    res.commune = parts[0];
  }
  if (!res.district && parts.length >= 3) {
    res.district = parts[1];
  }

  return res;
}

function renderStructuredAddressFields(prefix, values = {}) {
  const provinces = [
    'Banteay Meanchey',
    'Battambang',
    'Kampong Cham',
    'Kampong Chhnang',
    'Kampong Speu',
    'Kampong Thom',
    'Kampot',
    'Kandal',
    'Kep',
    'Koh Kong',
    'Kratie',
    'Mondulkiri',
    'Phnom Penh',
    'Preah Vihear',
    'Preah Sihanouk',
    'Prey Veng',
    'Pursat',
    'Ratanakiri',
    'Siem Reap',
    'Stung Treng',
    'Svay Rieng',
    'Takeo',
    'Oddar Meanchey',
    'Pailin',
    'Tboung Khmum'
  ];

  const provinceOptions = provinces.map(p => {
    const isSel = values.province && values.province.toLowerCase().includes(p.toLowerCase());
    return `<option value="${p}" ${isSel ? 'selected' : ''}>${p}</option>`;
  }).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <!-- Row 1: Province, District, Commune -->
      <div class="grid-3-col" style="gap: 14px 16px;">
        <div class="form-group">
          <label class="form-label" for="${prefix}-province">Province <span class="required" style="color: #ef4444;">*</span></label>
          <select class="form-select" id="${prefix}-province" required style="height: 38px;">
            <option value="" disabled ${!values.province ? 'selected' : ''}>Select Province</option>
            ${provinceOptions}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="${prefix}-district">District <span class="required" style="color: #ef4444;">*</span></label>
          <input type="text" class="form-input" id="${prefix}-district" value="${values.district || ''}" required placeholder="Please enter" style="height: 38px;">
        </div>
        <div class="form-group">
          <label class="form-label" for="${prefix}-commune">Commune <span class="required" style="color: #ef4444;">*</span></label>
          <input type="text" class="form-input" id="${prefix}-commune" value="${values.commune || ''}" required placeholder="Please enter" style="height: 38px;">
        </div>
      </div>

      <!-- Row 2: House No, Street, Group/Village -->
      <div class="grid-3-col" style="gap: 14px 16px;">
        <div class="form-group">
          <label class="form-label" for="${prefix}-houseno">House No <span class="required" style="color: #ef4444;">*</span></label>
          <input type="text" class="form-input" id="${prefix}-houseno" value="${values.houseNo || ''}" required placeholder="Please enter" style="height: 38px;">
        </div>
        <div class="form-group">
          <label class="form-label" for="${prefix}-street">Street</label>
          <input type="text" class="form-input" id="${prefix}-street" value="${values.street || ''}" placeholder="Please enter" style="height: 38px;">
        </div>
        <div class="form-group">
          <label class="form-label" for="${prefix}-village">Group/Village</label>
          <input type="text" class="form-input" id="${prefix}-village" value="${values.village || ''}" placeholder="Please enter" style="height: 38px;">
        </div>
      </div>
    </div>
  `;
}

function formatStructuredAddress(prefix) {
  const province = document.getElementById(`${prefix}-province`)?.value.trim() || '';
  const district = document.getElementById(`${prefix}-district`)?.value.trim() || '';
  const commune = document.getElementById(`${prefix}-commune`)?.value.trim() || '';
  const houseNo = document.getElementById(`${prefix}-houseno`)?.value.trim() || '';
  const street = document.getElementById(`${prefix}-street`)?.value.trim() || '';
  const village = document.getElementById(`${prefix}-village`)?.value.trim() || '';

  const parts = [];
  if (houseNo) parts.push(houseNo);
  if (street) parts.push(street);
  if (village) parts.push(village);
  if (commune) parts.push(commune);
  if (district) parts.push(district);
  if (province) parts.push(province);

  return parts.join(', ');
}

function openAddressModal(addressType = 'all') {
  currentAddressModalType = addressType;
  const backdrop = document.getElementById('address-modal-backdrop');
  const titleEl = document.getElementById('address-modal-title');
  const subtitleEl = document.getElementById('address-modal-subtitle');
  const bodyEl = document.getElementById('address-modal-body');
  if (!backdrop || !bodyEl) return;

  const pobVal = document.getElementById('val-pob')?.textContent.trim() || '';
  const permVal = document.getElementById('val-perm-address')?.textContent.trim() || '';
  const currVal = document.getElementById('val-curr-address')?.textContent.trim() || '';

  if (addressType === 'pob') {
    titleEl.textContent = 'Edit Place of Birth';
    subtitleEl.textContent = 'Update registered birth province, district, commune, and village';
    const parsed = parseAddressString(pobVal);
    if (!parsed.province || parsed.province === 'Phnom Penh') parsed.province = 'Battambang';
    if (!parsed.commune) parsed.commune = 'Prek Preah Sdach';
    bodyEl.innerHTML = renderStructuredAddressFields('addr', parsed);
  } else if (addressType === 'permanent') {
    titleEl.textContent = 'Edit Permanent Address';
    subtitleEl.textContent = 'Update official registered permanent address';
    const parsed = parseAddressString(permVal);
    if (!parsed.houseNo) parsed.houseNo = 'Building No. 888K';
    if (!parsed.street) parsed.street = 'Road 598';
    if (!parsed.commune) parsed.commune = 'Sangkat Toul Sangke';
    if (!parsed.district) parsed.district = 'Russey Keo';
    bodyEl.innerHTML = renderStructuredAddressFields('addr', parsed);
  } else if (addressType === 'current') {
    titleEl.textContent = 'Edit Current Residential Address';
    subtitleEl.textContent = 'Update employee current living residence';
    const parsed = parseAddressString(currVal);
    if (!parsed.houseNo) parsed.houseNo = 'Building No. 888K';
    if (!parsed.street) parsed.street = 'Road 598';
    if (!parsed.commune) parsed.commune = 'Sangkat Toul Sangke';
    if (!parsed.district) parsed.district = 'Russey Keo';
    bodyEl.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; background: #f8fafc; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
        <span style="font-size: 12px; color: #64748b;">Current actual residence for official correspondence</span>
        <button type="button" class="btn-quick-helper" onclick="copyPermToCurrentInModal()" style="font-size: 12px; font-weight: 600;">
          <i data-feather="copy" style="width: 12px; height: 12px;"></i> Same as Permanent
        </button>
      </div>
      ${renderStructuredAddressFields('addr', parsed)}
    `;
  } else {
    titleEl.textContent = 'Edit Address Information';
    subtitleEl.textContent = 'Update employee address details';
    const parsed = parseAddressString(currVal || permVal);
    bodyEl.innerHTML = renderStructuredAddressFields('addr', parsed);
  }

  backdrop.style.display = 'flex';
  setTimeout(() => {
    backdrop.classList.add('open');
    if (window.feather) feather.replace();
    const firstInput = bodyEl.querySelector('input, select');
    if (firstInput) firstInput.focus();
  }, 10);
}

function copyPermToCurrentInModal() {
  const permText = document.getElementById('val-perm-address')?.textContent.trim() || '';
  const parsed = parseAddressString(permText);

  const prov = document.getElementById('addr-province');
  const dist = document.getElementById('addr-district');
  const comm = document.getElementById('addr-commune');
  const house = document.getElementById('addr-houseno');
  const str = document.getElementById('addr-street');
  const vil = document.getElementById('addr-village');

  if (prov && (parsed.province || 'Phnom Penh')) prov.value = parsed.province || 'Phnom Penh';
  if (dist) dist.value = parsed.district || 'Russey Keo';
  if (comm) comm.value = parsed.commune || 'Sangkat Toul Sangke';
  if (house) house.value = parsed.houseNo || 'Building No. 888K';
  if (str) str.value = parsed.street || 'Road 598';
  if (vil) vil.value = parsed.village || '12105';

  triggerToast('Copied Permanent Address fields to Current Address', 'info');
}

function closeAddressModal(e) {
  if (e && e.target && e.target !== document.getElementById('address-modal-backdrop') && !e.currentTarget?.classList.contains('modal-close-btn') && !e.currentTarget?.classList.contains('btn-secondary')) {
    return;
  }
  const backdrop = document.getElementById('address-modal-backdrop');
  if (!backdrop) return;
  backdrop.classList.remove('open');
  setTimeout(() => {
    backdrop.style.display = 'none';
  }, 200);
}

function saveAddressModal(e) {
  if (e) e.preventDefault();

  let label = 'Address';
  const fullAddress = formatStructuredAddress('addr');

  if (!fullAddress) {
    triggerToast('Please fill in the required address fields', 'danger');
    return;
  }

  if (currentAddressModalType === 'pob') {
    const valEl = document.getElementById('val-pob');
    if (valEl) valEl.textContent = fullAddress;
    label = 'Place of Birth';
  } else if (currentAddressModalType === 'permanent') {
    const valEl = document.getElementById('val-perm-address');
    if (valEl) valEl.textContent = fullAddress;
    label = 'Permanent Address';
  } else if (currentAddressModalType === 'current') {
    const valEl = document.getElementById('val-curr-address');
    if (valEl) valEl.textContent = fullAddress;
    label = 'Current Address';
  } else {
    const pobEl = document.getElementById('val-pob');
    const permEl = document.getElementById('val-perm-address');
    const currEl = document.getElementById('val-curr-address');
    if (currEl) currEl.textContent = fullAddress;
    if (permEl && !permEl.textContent) permEl.textContent = fullAddress;
    label = 'Address Information';
  }

  const backdrop = document.getElementById('address-modal-backdrop');
  if (backdrop) {
    backdrop.classList.remove('open');
    setTimeout(() => { backdrop.style.display = 'none'; }, 200);
  }
  triggerToast(`${label} updated successfully!`, 'success');
}

// Expose functions to window for onclick handlers
window.switchSection = switchSection;
window.setViewMode = setViewMode;
window.scrollToTop = scrollToTop;
window.toggleNoticeDetails = toggleNoticeDetails;
window.toggleEditMode = toggleEditMode;
window.saveEditMode = saveEditMode;
window.cancelEditMode = cancelEditMode;
window.openDrawer = openDrawer;
window.closeDrawer = closeDrawer;
window.validateDrawerDates = validateDrawerDates;
window.submitDrawerForm = submitDrawerForm;
window.handleDrawerSubmit = handleDrawerSubmit;
window.filterDocumentsTable = filterDocumentsTable;
window.toggleDropdownMenu = toggleDropdownMenu;
window.copyToClipboard = copyToClipboard;
window.triggerToast = triggerToast;
window.toggleCardEdit = toggleCardEdit;
window.saveCardEdit = saveCardEdit;
window.cancelCardEdit = cancelCardEdit;
window.copyPermanentToCurrent = copyPermanentToCurrent;

// Address modal exports
window.openAddressModal = openAddressModal;
window.closeAddressModal = closeAddressModal;
window.copyPermToCurrentInModal = copyPermToCurrentInModal;
window.saveAddressModal = saveAddressModal;

/* ==========================================================================
   Document Modal Controllers (Upload / Edit Document Modal)
   ========================================================================== */
let currentDocEditingTr = null;
let currentDocAttachments = [];

function renderDocModalAttachmentsUI() {
  const container = document.getElementById('doc-attachments-container');
  const hiddenAttach = document.getElementById('doc-modal-attachment-value');
  if (!container) return;

  if (hiddenAttach) {
    hiddenAttach.value = currentDocAttachments.join(', ');
  }

  if (currentDocAttachments.length === 0) {
    container.innerHTML = `
      <div class="file-dropzone" id="doc-file-dropzone"
        onclick="document.getElementById('doc-modal-file-input').click()"
        ondragover="handleDropzoneDragOver(event, this)"
        ondragleave="handleDropzoneDragLeave(event, this)"
        ondrop="handleDocModalDrop(event)"
        style="padding: 16px 14px; border: 1.5px dashed var(--brand-border, #cbd5e1); border-radius: var(--radius-md, 8px); background: #f8fafc; text-align: center; cursor: pointer; transition: all 0.2s ease;">
        <input type="file" id="doc-modal-file-input" style="display: none;" multiple
          onchange="handleDocFileSelect(this)" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp">
        <i data-feather="upload-cloud" style="width: 28px; height: 28px; margin: 0 auto 6px; color: var(--brand-primary); display: block;"></i>
        <div style="font-size: 13px; font-weight: 600; color: #1e293b;">Click to upload or drag & drop multiple files</div>
        <div style="font-size: 11.5px; color: #64748b; margin-top: 2px;">PDF, PNG, JPG or DOCX (Multiple files supported)</div>
      </div>
    `;
  } else {
    let listHtml = `
      <div class="file-dropzone" id="doc-file-dropzone"
        ondragover="handleDropzoneDragOver(event, this)"
        ondragleave="handleDropzoneDragLeave(event, this)"
        ondrop="handleDocModalDrop(event)"
        style="padding: 12px 14px; border: 1.5px dashed var(--brand-border, #cbd5e1); border-radius: var(--radius-md, 8px); background: #f8fafc; transition: all 0.2s ease;">
        <input type="file" id="doc-modal-file-input" style="display: none;" multiple
          onchange="handleDocFileSelect(this)" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp">
        <div class="modal-attach-list">
    `;

    currentDocAttachments.forEach((filename, idx) => {
      const isImg = filename.match(/\.(png|jpg|jpeg|webp)$/i);
      listHtml += `
        <div class="modal-attach-item">
          <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <i data-feather="${isImg ? 'image' : 'paperclip'}" style="width: 14px; height: 14px; color: var(--brand-primary); flex-shrink: 0;"></i>
            <span style="font-weight: 500; color: #1e293b; font-size: 12.5px; overflow: hidden; text-overflow: ellipsis;">${filename}</span>
            <span style="font-size: 11px; color: #94a3b8; flex-shrink: 0;">(Attached)</span>
          </div>
          <button type="button" class="modal-attach-item-remove" onclick="removeDocModalAttachment(${idx})" title="Remove file">
            <i data-feather="x" style="width: 13px; height: 13px;"></i>
          </button>
        </div>
      `;
    });

    listHtml += `
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px; padding-top: 8px; border-top: 1px dashed #e2e8f0;">
          <span style="font-size: 11.5px; color: #64748b;">${currentDocAttachments.length} file${currentDocAttachments.length > 1 ? 's' : ''} attached</span>
          <button type="button" class="modal-attach-add-btn" onclick="document.getElementById('doc-modal-file-input').click();">
            <i data-feather="plus" style="width: 13px; height: 13px;"></i> Add More Files
          </button>
        </div>
      </div>
    `;
    container.innerHTML = listHtml;
  }

  if (window.feather) feather.replace();
}

function addDocModalFiles(fileList) {
  if (!fileList || fileList.length === 0) return;
  const added = [];
  Array.from(fileList).forEach(file => {
    if (file && file.name && !currentDocAttachments.includes(file.name)) {
      currentDocAttachments.push(file.name);
      added.push(file.name);
    }
  });

  // Auto-detect Document Name if not chosen
  const nameSelect = document.getElementById('doc-modal-name');
  if (nameSelect && !nameSelect.value && added.length > 0) {
    const lowerName = added[0].toLowerCase();
    if (lowerName.includes('national') || lowerName.includes('id_') || lowerName.includes('nid')) nameSelect.value = 'National ID';
    else if (lowerName.includes('pass') || lowerName.includes('passport')) nameSelect.value = 'Passport';
    else if (lowerName.includes('driver') || lowerName.includes('license')) nameSelect.value = 'Driver License';
    else if (lowerName.includes('nssf')) nameSelect.value = 'NSSF Card';
    else if (lowerName.includes('contract')) nameSelect.value = 'Employment Contract';
    else if (lowerName.includes('degree')) nameSelect.value = 'RUPP Bachelor Degree';
    else if (lowerName.includes('cert') || lowerName.includes('itil')) nameSelect.value = 'ITIL v4 Certificate';
    else if (lowerName.includes('medical') || lowerName.includes('health')) nameSelect.value = 'Annual Medical Checkup';
  }

  renderDocModalAttachmentsUI();
  if (added.length > 0) {
    triggerToast(`Attached ${added.length} file${added.length > 1 ? 's' : ''}`, 'info');
  }
}

function handleDocFileSelect(input) {
  if (!input || !input.files || input.files.length === 0) return;
  addDocModalFiles(input.files);
  input.value = '';
}

function removeDocModalAttachment(idx) {
  if (idx >= 0 && idx < currentDocAttachments.length) {
    const removed = currentDocAttachments.splice(idx, 1);
    renderDocModalAttachmentsUI();
    triggerToast(`Removed ${removed[0]}`, 'info');
  }
}

function openDocumentModal(tr = null) {
  const backdrop = document.getElementById('document-modal-backdrop');
  const form = document.getElementById('document-modal-form');
  const titleEl = document.getElementById('doc-modal-title');
  const subtitleEl = document.getElementById('doc-modal-subtitle');
  const submitBtn = document.getElementById('doc-modal-submit-btn');
  if (!backdrop) return;

  currentDocEditingTr = tr;

  if (form) form.reset();

  const isEdit = Boolean(tr);
  if (titleEl) titleEl.textContent = isEdit ? 'Edit Document' : 'Upload Document';
  if (subtitleEl) subtitleEl.textContent = isEdit ? 'Update document details and verification files' : 'Attach employee verification documents, credentials or contracts';
  if (submitBtn) {
    submitBtn.innerHTML = isEdit
      ? `<i data-feather="check" style="width: 14px; height: 14px;"></i> Save Changes`
      : `<i data-feather="upload-cloud" style="width: 14px; height: 14px;"></i> Upload & Attach`;
  }

  if (isEdit && tr) {
    const tds = Array.from(tr.children);
    const docName = getRowCellRawText(tds[0]);
    const issuedDate = getRowCellRawText(tds[1]);
    const expiryDate = getRowCellRawText(tds[2]);
    const status = getRowCellRawText(tds[3]);
    const attachment = getRowCellRawText(tds[4]);

    const nameSelect = document.getElementById('doc-modal-name');
    const statusSelect = document.getElementById('doc-modal-status');
    const issuedInput = document.getElementById('doc-modal-issued-date');
    const expiryInput = document.getElementById('doc-modal-expiry-date');

    if (nameSelect) nameSelect.value = docName || '';
    if (statusSelect) statusSelect.value = status || 'Valid';
    if (issuedInput) issuedInput.value = issuedDate || '01 Jul 2026';
    if (expiryInput) expiryInput.value = expiryDate || '31 Jul 2030';

    currentDocAttachments = (attachment && attachment !== '-')
      ? attachment.split(/,\s*|\n+/).map(s => s.trim()).filter(Boolean)
      : [];
  } else {
    const issuedInput = document.getElementById('doc-modal-issued-date');
    const expiryInput = document.getElementById('doc-modal-expiry-date');
    if (issuedInput) issuedInput.value = '01 Jul 2026';
    if (expiryInput) expiryInput.value = '31 Jul 2030';

    currentDocAttachments = [];
  }

  renderDocModalAttachmentsUI();

  backdrop.style.display = 'flex';
  requestAnimationFrame(() => {
    backdrop.classList.add('open');
    if (window.feather) feather.replace();
    const firstInput = document.getElementById('doc-modal-name');
    if (firstInput) setTimeout(() => firstInput.focus(), 60);
  });
}

function closeDocumentModal(e) {
  if (e && e.target && e.target !== document.getElementById('document-modal-backdrop') && !e.target.closest('.modal-close-btn') && !e.target.classList.contains('btn-secondary')) {
    return;
  }
  const backdrop = document.getElementById('document-modal-backdrop');
  if (!backdrop) return;
  backdrop.classList.remove('open');
  setTimeout(() => {
    backdrop.style.display = 'none';
    currentDocEditingTr = null;
    currentDocAttachments = [];
  }, 200);
}

function saveDocumentModal(e) {
  if (e) e.preventDefault();

  const nameInput = document.getElementById('doc-modal-name');
  const statusInput = document.getElementById('doc-modal-status');
  const issuedInput = document.getElementById('doc-modal-issued-date');
  const expiryInput = document.getElementById('doc-modal-expiry-date');

  const name = nameInput?.value.trim();
  const status = statusInput?.value || 'Valid';
  const issuedDate = issuedInput?.value.trim() || '01 Jul 2026';
  const expiryDate = expiryInput?.value.trim() || '31 Jul 2030';

  if (!name) {
    if (nameInput) {
      nameInput.style.borderColor = '#ef4444';
      nameInput.focus();
    }
    triggerToast('Please select a Document Name', 'danger');
    return;
  }

  if (currentDocAttachments.length === 0) {
    const dropzone = document.getElementById('doc-file-dropzone');
    if (dropzone) dropzone.style.borderColor = '#ef4444';
    triggerToast('Please attach at least one document file (Required)', 'danger');
    return;
  }

  const statusBadgeClass = status === 'Valid' ? 'badge-valid' : status === 'Expired' ? 'badge-danger' : status === 'Missing' ? 'badge-draft' : 'badge-warning';
  const isExpired = status === 'Expired' || expiryDate.includes('Expired');
  const attachmentJoined = currentDocAttachments.join(', ');

  const rowHtml = `
    <td><div class="table-cell-title">${name}</div></td>
    <td>${issuedDate}</td>
    <td>${isExpired ? `<strong style="color: #ef4444;">${expiryDate}</strong>` : expiryDate}</td>
    <td><span class="badge ${statusBadgeClass}">${status}</span></td>
    <td>
      ${renderAttachmentLinks(attachmentJoined, 'documents')}
    </td>
    <td class="table-actions-cell" onclick="event.stopPropagation();">
      <button class="row-action-btn" title="View Details" onclick="previewTableRow(this, 'documents')">
        <i data-feather="eye" style="width: 15px; height: 15px;"></i>
      </button>
      <div class="dropdown-wrapper">
        <button class="row-action-btn table-more-btn" title="More Actions" onclick="toggleDropdownMenu(this.parentElement)">
          <i data-feather="more-vertical" style="width: 15px; height: 15px;"></i>
        </button>
        <div class="dropdown-menu">
          <button class="dropdown-item" onclick="previewTableRow(this, 'documents')">
            <i data-feather="eye" style="width: 13px; height: 13px;"></i> Preview Details
          </button>
          <button class="dropdown-item" onclick="startEditTableRow(this, 'documents')">
            <i data-feather="edit-2" style="width: 13px; height: 13px;"></i> Edit Details
          </button>
          <button class="dropdown-item" onclick="triggerToast('Downloading document...', 'info')">
            <i data-feather="download" style="width: 13px; height: 13px;"></i> Download
          </button>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item danger" onclick="deleteTableRow(this, 'documents')">
            <i data-feather="trash-2" style="width: 13px; height: 13px;"></i> Delete
          </button>
        </div>
      </div>
    </td>
  `;

  if (currentDocEditingTr) {
    currentDocEditingTr.innerHTML = rowHtml;
    currentDocEditingTr.setAttribute('data-name', name);
    currentDocEditingTr.setAttribute('data-status', status);
    currentDocEditingTr.style.animation = 'tableRowHighlight 0.6s ease-out';
  } else {
    const tbody = document.getElementById('documents-table-body');
    if (tbody) {
      const tr = document.createElement('tr');
      tr.setAttribute('data-category', 'Document');
      tr.setAttribute('data-status', status);
      tr.setAttribute('data-name', name);
      tr.innerHTML = rowHtml;
      tbody.insertBefore(tr, tbody.firstChild);
      tr.style.animation = 'tableRowHighlight 0.6s ease-out';
    }
  }

  updateTableSectionCounts('documents');

  if (window.feather) feather.replace();
  triggerToast(`✓ Document saved successfully!`, 'success');
  closeDocumentModal();
}

// Timeline filter
function filterTimeline(type, btn) {
  const items = document.querySelectorAll('#activity-timeline-list .timeline-event-item');
  const buttons = document.querySelectorAll('.timeline-filter-btn');
  buttons.forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  let visibleCount = 0;
  items.forEach(item => {
    const itemType = item.getAttribute('data-type');
    if (type === 'all' || itemType === type) {
      item.style.display = 'flex';
      visibleCount++;
    } else {
      item.style.display = 'none';
    }
  });

  const countEl = document.querySelector('#section-activity .card-title-count');
  if (countEl) {
    countEl.textContent = `(${visibleCount})`;
  }
}

window.filterTimeline = filterTimeline;

// Document modal exports
window.openDocumentModal = openDocumentModal;
window.closeDocumentModal = closeDocumentModal;
window.handleDocFileSelect = handleDocFileSelect;
window.saveDocumentModal = saveDocumentModal;

// Table attachment file selector
function handleTableAttachmentSelect(fileInput) {
  if (fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0];
    const hiddenInput = fileInput.nextElementSibling;
    const button = hiddenInput ? hiddenInput.nextElementSibling : null;
    if (hiddenInput) hiddenInput.value = file.name;
    if (button) {
      button.innerHTML = `<i data-feather="paperclip" style="width: 12px; height: 12px; flex-shrink: 0;"></i> <span class="upload-btn-label" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${file.name}</span>`;
      if (window.feather) feather.replace();
    }
    triggerToast(`File attached: ${file.name}`, 'info');
  }
}

window.handleTableAttachmentSelect = handleTableAttachmentSelect;

// Expose table inline editing methods
window.startEditTableRow = startEditTableRow;
window.addNewTableRow = addNewTableRow;
window.saveTableRow = saveTableRow;
window.cancelEditTableRow = cancelEditTableRow;
window.deleteTableRow = deleteTableRow;
window.viewTableRowDetails = viewTableRowDetails;
window.updateTableSectionCounts = updateTableSectionCounts;

/* ==========================================================================
   RECORD PREVIEW MODAL CONTROLLER
   ========================================================================== */
let currentPreviewTr = null;
let currentPreviewTableType = '';

function previewTableRow(btnOrElement, tableType) {
  const tr = btnOrElement.closest('tr');
  if (!tr) return;

  currentPreviewTr = tr;
  currentPreviewTableType = tableType;

  const schema = TABLE_SCHEMAS[tableType] || TABLE_SCHEMAS['documents'];
  const backdrop = document.getElementById('record-preview-modal-backdrop');
  const titleEl = document.getElementById('preview-modal-title');
  const subtitleEl = document.getElementById('preview-modal-subtitle');
  const statusBadgeEl = document.getElementById('preview-modal-status-badge');
  const iconBadgeEl = document.getElementById('preview-modal-icon-badge');
  const bodyEl = document.getElementById('preview-modal-body');
  if (!backdrop || !bodyEl) return;

  // Extract cell values
  const currentTds = Array.from(tr.children);
  const rowData = [];
  let recordTitle = '';
  let statusVal = '';
  let attachmentVal = '';

  schema.columns.forEach((col, idx) => {
    const rawText = getRowCellRawText(currentTds[idx]);
    const cleanVal = rawText || '-';

    if (idx === 0 || col.key === 'title' || col.key === 'name' || col.key === 'company' || col.key === 'language') {
      if (!recordTitle) recordTitle = cleanVal;
    }

    if (col.key === 'status') {
      statusVal = cleanVal;
    }

    if (col.key === 'attachment' || col.type === 'file') {
      attachmentVal = cleanVal;
    }

    rowData.push({
      label: col.label,
      value: cleanVal,
      key: col.key
    });
  });

  if (!recordTitle) recordTitle = `${schema.singular || 'Record'} Details`;

  titleEl.textContent = recordTitle;
  subtitleEl.textContent = `${schema.singular || 'Record'} Information & Overview`;

  if (statusVal && statusVal !== '-') {
    const statusClass = statusVal === 'Valid' || statusVal === 'Active' || statusVal === 'Graduated' || statusVal.includes('Advanced')
      ? 'badge-success'
      : (statusVal === 'Expired' ? 'badge-danger' : (statusVal === 'Missing' ? 'badge-draft' : 'badge-warning'));
    statusBadgeEl.innerHTML = `<span class="badge ${statusClass}">${statusVal}</span>`;
  } else {
    statusBadgeEl.innerHTML = '';
  }

  // Choose icon based on table type
  const iconName = (tableType === 'documents' || tableType === 'document') ? 'file-text'
    : (tableType === 'education' ? 'book-open'
    : (tableType === 'languages' || tableType === 'language' ? 'globe'
    : (tableType === 'training-course' || tableType === 'training' ? 'book'
    : (tableType === 'certification' ? 'award'
    : (tableType === 'experience' ? 'briefcase' : 'users')))));

  if (iconBadgeEl) {
    iconBadgeEl.innerHTML = `<i data-feather="${iconName}" style="width: 18px; height: 18px; color: var(--brand-primary);"></i>`;
  }

  // Render Key-Value Grid
  let gridHtml = '<div class="grid-2-col" style="gap: 14px 20px; background: #f8fafc; padding: 16px; border-radius: var(--radius-md); border: 1px solid #e2e8f0;">';
  rowData.forEach(item => {
    if (item.key === 'attachment') return;
    gridHtml += `
      <div class="info-field-group">
        <span class="info-label" style="font-size: 11.5px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${item.label}</span>
        <span class="info-val" style="font-size: 13.5px; font-weight: 500; color: #0f172a;">${item.value}</span>
      </div>
    `;
  });
  gridHtml += '</div>';

  // If there's an attachment, render interactive preview card
  let attachmentHtml = '';
  const rawAttach = (attachmentVal && attachmentVal !== '-') ? attachmentVal : (attachLink ? getRowCellRawText(tr.querySelector('td:nth-last-child(2)')) : '');
  const files = rawAttach ? rawAttach.split(/,\s*|\n+/).map(s => s.trim()).filter(Boolean) : [];
  const filename = files[0] || '';

  const isNationalId = recordTitle.toLowerCase().includes('national id') || rawAttach.toLowerCase().includes('national_id');

  if (isNationalId) {
    attachmentHtml = `
      <div class="id-card-scan-container">
        <div class="id-card-scan-header">
          <span class="id-card-scan-title">
            <i data-feather="image" style="width: 14px; height: 14px; color: var(--brand-primary);"></i> Attached ID Card Scans (Cambodian National ID)
          </span>
          <span class="badge badge-success" style="font-size: 11px;">2 Images Verified</span>
        </div>
        <div class="id-card-scan-grid">
          <div class="id-card-preview-box">
            <div class="id-card-preview-box-header">
              <span>FRONT SIDE</span>
              <span style="font-size: 10px; color: #94a3b8;">Chip & Emblem</span>
            </div>
            <div class="id-card-preview-img-wrap" onclick="openImageLightbox('assets/national_id_front.jpg', 'National ID Card - Front Side')">
              <img src="assets/national_id_front.jpg" alt="National ID Front" class="id-card-preview-img">
              <div class="id-card-zoom-overlay">
                <i data-feather="zoom-in" style="width: 14px; height: 14px;"></i> Click to Zoom
              </div>
            </div>
          </div>
          <div class="id-card-preview-box">
            <div class="id-card-preview-box-header">
              <span>BACK SIDE</span>
              <span style="font-size: 10px; color: #94a3b8;">Details & MRZ Scan</span>
            </div>
            <div class="id-card-preview-img-wrap" onclick="openImageLightbox('assets/national_id_back.png', 'National ID Card - Back Side')">
              <img src="assets/national_id_back.png" alt="National ID Back" class="id-card-preview-img">
              <div class="id-card-zoom-overlay">
                <i data-feather="zoom-in" style="width: 14px; height: 14px;"></i> Click to Zoom
              </div>
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 4px;">
          <button type="button" class="btn btn-sm btn-secondary" onclick="openImageLightbox('assets/national_id_front.jpg', 'National ID Card - Front Side')">
            <i data-feather="eye" style="width: 12px; height: 12px;"></i> View Full Front
          </button>
          <button type="button" class="btn btn-sm btn-secondary" onclick="openImageLightbox('assets/national_id_back.png', 'National ID Card - Back Side')">
            <i data-feather="eye" style="width: 12px; height: 12px;"></i> View Full Back
          </button>
          <button type="button" class="btn btn-sm btn-secondary" onclick="triggerToast('Downloading National ID Scans...', 'info')">
            <i data-feather="download" style="width: 12px; height: 12px;"></i> Download All
          </button>
        </div>
      </div>
    `;
  } else if (filename) {
    const pdfData = getPdfDocumentTemplate(filename, recordTitle, rowData, statusVal);
    const multiFilesBar = files.length > 1 ? `
      <div style="display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: #e2e8f0; border-radius: 6px; margin-bottom: 10px; flex-wrap: wrap;">
        <span style="font-size: 11.5px; font-weight: 600; color: #475569; margin-right: 4px;">All Attached Files (${files.length}):</span>
        ${files.map((f, i) => `
          <button type="button" class="badge ${i === 0 ? 'badge-primary' : 'badge-neutral'}" style="cursor: pointer; border: none; padding: 4px 8px; font-size: 11px;" onclick="triggerToast('Viewing ${f}', 'info')">
            <i data-feather="file" style="width: 10px; height: 10px; margin-right: 3px;"></i> ${f}
          </button>
        `).join('')}
      </div>
    ` : '';

    attachmentHtml = `
      <div class="pdf-viewer-container">
        ${multiFilesBar}
        <!-- PDF Viewer Toolbar -->
        <div class="pdf-viewer-toolbar">
          <div class="pdf-toolbar-left">
            <span class="pdf-toolbar-badge">PDF</span>
            <span class="pdf-toolbar-filename">${filename}</span>
            <span style="font-size: 11px; color: #94a3b8; margin-left: 4px;">(${files.length > 1 ? `File 1 of ${files.length}` : 'Page 1 of 1'} • 100%)</span>
          </div>
          <div class="pdf-toolbar-right">
            <button type="button" class="pdf-toolbar-btn" onclick="triggerToast('Printing ${filename}...', 'info')">
              <i data-feather="printer" style="width: 12px; height: 12px;"></i> Print
            </button>
            <button type="button" class="pdf-toolbar-btn" onclick="triggerToast('Downloading ${filename}...', 'info')">
              <i data-feather="download" style="width: 12px; height: 12px;"></i> Download
            </button>
          </div>
        </div>

        <!-- PDF Document A4 Sheet Viewport -->
        <div class="pdf-viewport-stage">
          <div class="pdf-sheet-page">
            <div class="pdf-sheet-watermark">${pdfData.watermark}</div>

            <div>
              <!-- Header with Seal -->
              <div class="pdf-sheet-header">
                <div>
                  <div class="pdf-sheet-org">${pdfData.organization}</div>
                  <div class="pdf-sheet-title">${pdfData.title}</div>
                </div>
                <div class="pdf-sheet-seal">
                  <span>${pdfData.sealText.split(' ')[0] || 'OFFICIAL'}</span>
                  <span style="font-size: 6.5px; opacity: 0.85;">${pdfData.sealText.split(' ').slice(1).join(' ') || 'SEAL'}</span>
                </div>
              </div>

              <!-- Body Document Content -->
              <div class="pdf-sheet-body">
                <p style="margin: 0; font-size: 11.5px; color: #475569;">
                  ${pdfData.introText}
                </p>

                <table class="pdf-sheet-table">
                  <tbody>
                    ${pdfData.rows.map(r => `
                      <tr>
                        <td class="label-cell">${r.label}</td>
                        <td class="val-cell">${r.value}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>

                <p style="margin: 4px 0 0; font-size: 10.5px; color: #64748b; font-style: italic;">
                  ${pdfData.footerNotice}
                </p>
              </div>
            </div>

            <!-- Footer with Signature & QR Code -->
            <div class="pdf-sheet-footer">
              <div class="pdf-sheet-signature-box">
                <div class="pdf-sheet-signature-line">${pdfData.signatureName}</div>
                <div class="pdf-sheet-signer-title">${pdfData.signerTitle}</div>
              </div>
              <div class="pdf-sheet-qr-box">
                <div class="pdf-sheet-qr-code">QR CODE</div>
                <span class="pdf-sheet-cert-id">${pdfData.certId}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;
  }

  bodyEl.innerHTML = gridHtml + attachmentHtml;

  backdrop.style.display = 'flex';
  setTimeout(() => {
    backdrop.classList.add('open');
    if (window.feather) feather.replace();
  }, 10);
}

function getPdfDocumentTemplate(filename, recordTitle, rowData, statusVal) {
  const nameLower = (recordTitle + ' ' + filename).toLowerCase();

  if (nameLower.includes('passport')) {
    return {
      organization: 'Kingdom of Cambodia • Ministry of Foreign Affairs',
      title: 'PASSPORT IDENTIFICATION & VERIFICATION COPY',
      watermark: 'CAMBODIA PASSPORT',
      sealText: 'GOVT CERTIFIED',
      introText: 'This document certifies the official scanned record of the national passport registered under employee credentials.',
      rows: [
        { label: 'Document Type', value: 'Ordinary Kingdom of Cambodia Passport' },
        { label: 'Passport No.', value: 'N01105287' },
        { label: 'Full Name', value: 'TIT SAMOL' },
        { label: 'Nationality', value: 'Cambodian (KHM)' },
        { label: 'Date of Birth', value: '26 Sep 1984' },
        { label: 'Valid Period', value: '01 Jul 2026 – 27 Jul 2031' },
        { label: 'Document Status', value: 'Verified & Active' }
      ],
      footerNotice: 'Electronically verified against Department of Identification registry.',
      signatureName: 'Khim S.',
      signerTitle: 'Director General of Consular Affairs',
      certId: 'DOC-KHM-PASS-8841'
    };
  } else if (nameLower.includes('driver')) {
    return {
      organization: 'Ministry of Public Works and Transport • Cambodia',
      title: 'DRIVER\'S LICENSE OFFICIAL CERTIFICATION',
      watermark: 'DRIVING LICENSE',
      sealText: 'MPWT OFFICIAL',
      introText: 'Official electronic transcript copy of valid Cambodian Driver’s License for vehicle operation qualification.',
      rows: [
        { label: 'License Code', value: 'DL-8890124-KHM' },
        { label: 'License Holder', value: 'TIT SAMOL' },
        { label: 'Vehicle Category', value: 'Type B (Passenger Vehicles & Light Trucks)' },
        { label: 'Effective Period', value: '01 Jul 2026 – 31 Jul 2031' },
        { label: 'Issuing Authority', value: 'Phnom Penh Transport Department' }
      ],
      footerNotice: 'Valid for corporate transportation verification and HR fleet compliance.',
      signatureName: 'Channara P.',
      signerTitle: 'Head of Transport Licensing',
      certId: 'MPWT-DL-2026-904'
    };
  } else if (nameLower.includes('nssf')) {
    return {
      organization: 'Ministry of Labour & Vocational Training • NSSF Cambodia',
      title: 'NATIONAL SOCIAL SECURITY FUND MEMBER CERTIFICATE',
      watermark: 'NSSF CAMBODIA',
      sealText: 'NSSF VERIFIED',
      introText: 'Official proof of social security registration, health insurance, and workplace occupational risk protection.',
      rows: [
        { label: 'NSSF ID Number', value: '101105287-01' },
        { label: 'Employee Name', value: 'TIT SAMOL' },
        { label: 'Registration Date', value: '10 Jan 2018' },
        { label: 'Scheme Coverage', value: 'Health Care + Occupational Risk + Pension' },
        { label: 'Contribution Status', value: 'Active & Compliant (Paid by Employer)' }
      ],
      footerNotice: 'Guaranteed under Cambodian Labour Law and Social Security Framework.',
      signatureName: 'Sok Vichea',
      signerTitle: 'Executive Director of NSSF',
      certId: 'NSSF-KHM-101105'
    };
  } else if (nameLower.includes('contract')) {
    return {
      organization: 'HRS Technologies Enterprise • HR Department',
      title: 'EMPLOYMENT AGREEMENT & CONTRACT SPECIFICATIONS',
      watermark: 'EMPLOYMENT CONTRACT',
      sealText: 'HRS HR SEAL',
      introText: 'Official employment contract summary establishing terms, compensation, and workplace responsibilities.',
      rows: [
        { label: 'Employee Name', value: 'TIT SAMOL (EMP-1029)' },
        { label: 'Job Designation', value: 'IT Senior Specialist' },
        { label: 'Department', value: 'Information Technology / Systems Architecture' },
        { label: 'Contract Type', value: 'Undetermined Duration Contract (UDC)' },
        { label: 'Commencement', value: '30 Nov 2015 – Indefinite' }
      ],
      footerNotice: 'Confidential corporate employment agreement.',
      signatureName: 'Molyka Chan',
      signerTitle: 'Head of Human Resources Management',
      certId: 'HRS-HR-EMP-1029-C'
    };
  } else if (nameLower.includes('degree') || nameLower.includes('rupp') || nameLower.includes('education')) {
    return {
      organization: 'Royal University of Phnom Penh (RUPP) • Faculty of Science',
      title: 'BACHELOR DEGREE CERTIFICATION TRANSCRIPT',
      watermark: 'RUPP GRADUATE',
      sealText: 'RUPP CONFERRED',
      introText: 'Official verification of undergraduate graduation and academic degree conferral.',
      rows: [
        { label: 'Degree Awarded', value: 'Bachelor of Science in Computer Programming' },
        { label: 'Graduate Name', value: 'TIT SAMOL' },
        { label: 'Conferral Date', value: '15 Jan 2015' },
        { label: 'Academic Standing', value: 'Grade Point Average 3.7 / 4.0' },
        { label: 'Accreditation', value: 'Ministry of Education, Youth and Sport' }
      ],
      footerNotice: 'Verified by Office of Academic Affairs and University Registrar.',
      signatureName: 'Dr. Chet Chealy',
      signerTitle: 'Rector, Royal University of Phnom Penh',
      certId: 'RUPP-BSC-2015-772'
    };
  } else if (nameLower.includes('itil') || nameLower.includes('cert')) {
    return {
      organization: 'AXELOS & PeopleCert Global Best Practice',
      title: 'ITIL® 4 MANAGING PROFESSIONAL CERTIFICATE',
      watermark: 'ITIL CERTIFIED',
      sealText: 'ACCREDITED CERT',
      introText: 'Official verification of professional credential certification in IT Service Management.',
      rows: [
        { label: 'Candidate Name', value: 'TIT SAMOL' },
        { label: 'Credential Title', value: 'ITIL 4 Managing Professional (ITIL-MP)' },
        { label: 'Certificate No.', value: 'GR671092301TS' },
        { label: 'Valid Period', value: '10 Oct 2025 – 10 Oct 2026' },
        { label: 'Status', value: 'Expiring Soon (Re-certification in progress)' }
      ],
      footerNotice: 'Verify online at peoplecert.org/verify with certificate ID.',
      signatureName: 'Panos Theodossiou',
      signerTitle: 'Chief Certification Officer',
      certId: 'AXELOS-ITIL-92301'
    };
  } else if (nameLower.includes('aws') || nameLower.includes('cloud')) {
    return {
      organization: 'Amazon Web Services • Training & Certification',
      title: 'AWS CERTIFIED SOLUTIONS ARCHITECT - PROFESSIONAL',
      watermark: 'AWS CERTIFIED',
      sealText: 'AWS VERIFIED',
      introText: 'Official certificate for advanced cloud infrastructure architecture and governance expertise.',
      rows: [
        { label: 'Candidate Name', value: 'TIT SAMOL' },
        { label: 'Certification Tier', value: 'Solutions Architect - Professional' },
        { label: 'Validation Number', value: 'AWS-PSA-990142' },
        { label: 'Issue Date', value: 'Oct 2026' }
      ],
      footerNotice: 'Validated via AWS CertMetrics online portal.',
      signatureName: 'Maureen Lonergan',
      signerTitle: 'VP, AWS Worldwide Training & Certification',
      certId: 'AWS-SAP-990142'
    };
  }

  // Fallback Generic Official Document Template
  return {
    organization: 'HRS Technologies • Electronic Document Registry',
    title: (recordTitle || filename || 'Official Document').toUpperCase(),
    watermark: 'VERIFIED COPY',
    sealText: 'HRS VERIFIED',
    introText: 'This is the official digital archive and validated copy of the attached document record.',
    rows: [
      { label: 'Document Title', value: recordTitle || filename },
      { label: 'Attached File', value: filename },
      { label: 'Employee File', value: 'TIT SAMOL (EMP-1029)' },
      { label: 'Status', value: statusVal || 'Verified Active' }
    ],
    footerNotice: 'Electronically archived and timestamped in HRS Document Management System.',
    signatureName: 'System Archive',
    signerTitle: 'Records & Compliance Administrator',
    certId: 'HRS-DOC-' + Math.floor(100000 + Math.random() * 900000)
  };
}


function openImageLightbox(src, title) {
  const modal = document.getElementById('image-lightbox-modal');
  const img = document.getElementById('lightbox-image-src');
  const titleEl = document.getElementById('lightbox-image-title');
  if (!modal || !img) return;

  img.src = src;
  if (titleEl) titleEl.textContent = title || 'Document Image';
  modal.style.display = 'flex';
  if (window.feather) feather.replace();
}

function closeImageLightbox(e) {
  if (e && e.target && e.target !== document.getElementById('image-lightbox-modal') && !e.currentTarget?.classList.contains('lightbox-close-btn')) {
    return;
  }
  const modal = document.getElementById('image-lightbox-modal');
  if (!modal) return;
  modal.style.display = 'none';
}

function closeRecordPreviewModal(e) {
  if (e && e.target && e.target !== document.getElementById('record-preview-modal-backdrop') && !e.currentTarget?.classList.contains('modal-close-btn') && !e.currentTarget?.classList.contains('btn-secondary')) {
    return;
  }
  const backdrop = document.getElementById('record-preview-modal-backdrop');
  if (!backdrop) return;
  backdrop.classList.remove('open');
  setTimeout(() => {
    backdrop.style.display = 'none';
  }, 200);
}

function editFromPreviewModal() {
  const backdrop = document.getElementById('record-preview-modal-backdrop');
  if (backdrop) {
    backdrop.classList.remove('open');
    setTimeout(() => { backdrop.style.display = 'none'; }, 200);
  }

  if (currentPreviewTr && currentPreviewTableType) {
    setTimeout(() => {
      startEditTableRow(currentPreviewTr, currentPreviewTableType);
    }, 220);
  }
}

/* ==========================================================================
   Add Contact Modal Controllers
   ========================================================================== */
function openAddContactModal() {
  const backdrop = document.getElementById('contact-modal-backdrop');
  const form = document.getElementById('contact-modal-form');
  if (!backdrop) return;

  if (form) form.reset();
  handleContactTypeChange('Personal Email');

  backdrop.style.display = 'flex';
  setTimeout(() => {
    backdrop.classList.add('open');
    const input = document.getElementById('contact-input-value');
    if (input) input.focus();
    if (window.feather) feather.replace();
  }, 10);
}

function closeAddContactModal(e) {
  if (e && e.target && e.target !== document.getElementById('contact-modal-backdrop') && !e.currentTarget?.classList.contains('modal-close-btn') && !e.currentTarget?.classList.contains('btn-secondary')) {
    return;
  }
  const backdrop = document.getElementById('contact-modal-backdrop');
  if (!backdrop) return;
  backdrop.classList.remove('open');
  setTimeout(() => {
    backdrop.style.display = 'none';
  }, 200);
}

function handleContactTypeChange(type) {
  const labelEl = document.getElementById('contact-label-value');
  const inputEl = document.getElementById('contact-input-value');
  if (!inputEl) return;

  if (type === 'Personal Email') {
    if (labelEl) labelEl.innerHTML = 'Email Address <span class="required">*</span>';
    inputEl.placeholder = 'e.g. samol.personal@gmail.com';
    inputEl.type = 'email';
  } else if (type === 'Mobile Phone' || type === 'Alternative Phone') {
    if (labelEl) labelEl.innerHTML = 'Phone Number <span class="required">*</span>';
    inputEl.placeholder = 'e.g. 012 345 678';
    inputEl.type = 'tel';
  } else if (type === 'Telegram') {
    if (labelEl) labelEl.innerHTML = 'Telegram Username / Link <span class="required">*</span>';
    inputEl.placeholder = 'e.g. @titsamol or https://t.me/titsamol';
    inputEl.type = 'text';
  } else if (type === 'WhatsApp') {
    if (labelEl) labelEl.innerHTML = 'WhatsApp Number <span class="required">*</span>';
    inputEl.placeholder = 'e.g. +855 12 345 678';
    inputEl.type = 'tel';
  } else if (type === 'LinkedIn') {
    if (labelEl) labelEl.innerHTML = 'LinkedIn Profile URL / Handle <span class="required">*</span>';
    inputEl.placeholder = 'e.g. linkedin.com/in/titsamol';
    inputEl.type = 'text';
  } else {
    if (labelEl) labelEl.innerHTML = 'Contact Value <span class="required">*</span>';
    inputEl.placeholder = 'e.g. Contact detail / link';
    inputEl.type = 'text';
  }
}

function saveAddContactModal(e) {
  if (e) e.preventDefault();

  const category = document.getElementById('contact-input-category')?.value || 'Personal';
  const type = document.getElementById('contact-input-type')?.value || 'Personal Email';
  const val = document.getElementById('contact-input-value')?.value.trim();
  const status = document.getElementById('contact-input-status')?.value || 'Active';

  const container = category === 'Work'
    ? (document.getElementById('contact-work-cards-container') || document.getElementById('contact-personal-cards-container'))
    : (document.getElementById('contact-personal-cards-container') || document.getElementById('contact-work-cards-container'));

  if (!val) {
    triggerToast('Please enter a valid contact detail', 'warning');
    return;
  }

  const cardId = `card-contact-custom-${Date.now()}`;
  let iconName = 'phone';
  let actionHref = '#';
  let actionTarget = '';
  let actionText = 'Contact';
  let actionIcon = 'send';

  if (type.includes('Email')) {
    iconName = 'mail';
    actionHref = `mailto:${val}`;
    actionText = 'Send Email';
    actionIcon = 'send';
  } else if (type.includes('Mobile') || type.includes('Phone')) {
    iconName = 'smartphone';
    actionHref = `tel:${val.replace(/\s+/g, '')}`;
    actionText = 'Direct Call';
    actionIcon = 'phone-call';
  } else if (type === 'Telegram') {
    iconName = 'send';
    const cleanTg = val.replace('@', '').replace('https://t.me/', '');
    actionHref = `https://t.me/${cleanTg}`;
    actionTarget = ' target="_blank" rel="noopener noreferrer"';
    actionText = 'Open Telegram';
    actionIcon = 'send';
  } else if (type === 'WhatsApp') {
    iconName = 'message-circle';
    const cleanWa = val.replace(/[^0-9]/g, '');
    actionHref = `https://wa.me/${cleanWa}`;
    actionTarget = ' target="_blank" rel="noopener noreferrer"';
    actionText = 'Chat WhatsApp';
    actionIcon = 'message-circle';
  } else if (type === 'LinkedIn') {
    iconName = 'share-2';
    actionHref = val.startsWith('http') ? val : `https://${val}`;
    actionTarget = ' target="_blank" rel="noopener noreferrer"';
    actionText = 'Open Profile';
    actionIcon = 'external-link';
  }

  const cardHtml = `
    <div class="card" id="${cardId}" style="background: #f8fafc; border: 1px solid #e2e8f0; box-shadow: none;">
      <!-- VIEW MODE -->
      <div class="card-view-mode">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <span class="info-label" style="display: flex; align-items: center; gap: 6px;">
            <i data-feather="${iconName}" style="width: 14px; height: 14px; color: #64748b;"></i> ${type}
          </span>
          <div style="display: flex; align-items: center; gap: 6px;">
            <button class="section-edit-icon-btn" onclick="toggleCardEdit('${cardId}')" title="Edit ${type}" aria-label="Edit ${type}">
              <i data-feather="edit-2" style="width: 13px; height: 13px;"></i>
            </button>
            <button class="section-edit-icon-btn" onclick="deleteContactCard('${cardId}', '${type}')" title="Delete ${type}" aria-label="Delete ${type}" style="color: #ef4444;">
              <i data-feather="trash-2" style="width: 13px; height: 13px;"></i>
            </button>
          </div>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
          <div class="val-contact-custom" style="font-size: 14.5px; font-weight: 600; color: #0f172a; word-break: break-all;">
            ${val}
          </div>
          <div style="display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0;">
            <button class="section-edit-icon-btn" onclick="copyToClipboard('${val.replace(/'/g, "\\'")}', '${type}')" title="Copy ${type}" aria-label="Copy ${type}">
              <i data-feather="copy" style="width: 13px; height: 13px;"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- EDIT MODE -->
      <div class="card-edit-mode">
        <div class="card-edit-header">
          <div class="card-edit-title">
            <i data-feather="edit-3" style="width: 14px; height: 14px; color: var(--brand-primary);"></i>
            <span>Edit ${type}</span>
          </div>
          <span class="card-edit-badge">In-Card</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="form-group">
            <label class="form-label">Contact Value <span class="required">*</span></label>
            <input type="text" class="form-input" value="${val.replace(/"/g, '&quot;')}">
          </div>
        </div>
        <div class="card-edit-footer">
          <button type="button" class="btn-card-cancel" onclick="cancelCardEdit('${cardId}')">Cancel</button>
          <button type="button" class="btn-card-save" onclick="saveCardEdit('${cardId}')">Save</button>
        </div>
      </div>
    </div>
  `;

  if (container) {
    container.insertAdjacentHTML('beforeend', cardHtml);
  }

  closeAddContactModal();
  triggerToast(`✓ ${type} added successfully!`, 'success');

  if (window.feather) {
    setTimeout(() => feather.replace(), 20);
  }
}

function deleteContactCard(cardId, label) {
  const card = document.getElementById(cardId);
  if (!card) return;

  card.style.transition = 'all 0.25s ease';
  card.style.opacity = '0';
  card.style.transform = 'scale(0.95)';
  setTimeout(() => {
    card.remove();
    triggerToast(`Removed ${label || 'contact channel'}`, 'info');
  }, 250);
}

/* ==========================================================================
   Table Record Modal Controllers (Add / Edit for tables with attachments)
   ========================================================================== */
let currentModalTableType = null;
let currentModalTr = null;
let currentModalAttachments = [];

function handleDropzoneDragOver(event, el) {
  event.preventDefault();
  event.stopPropagation();
  el.style.borderColor = 'var(--brand-primary)';
  el.style.background = '#f1f5f9';
}

function handleDropzoneDragLeave(event, el) {
  event.preventDefault();
  event.stopPropagation();
  el.style.borderColor = 'var(--brand-border, #cbd5e1)';
  el.style.background = '#f8fafc';
}

function handleTableRecordDrop(event) {
  event.preventDefault();
  event.stopPropagation();
  const dropzone = document.getElementById('table-record-file-dropzone');
  if (dropzone) {
    dropzone.style.borderColor = 'var(--brand-border, #cbd5e1)';
    dropzone.style.background = '#f8fafc';
  }
  if (event.dataTransfer && event.dataTransfer.files) {
    addTableRecordFiles(event.dataTransfer.files);
  }
}

function handleDocModalDrop(event) {
  event.preventDefault();
  event.stopPropagation();
  const dropzone = document.getElementById('doc-file-dropzone');
  if (dropzone) {
    dropzone.style.borderColor = 'var(--brand-border, #cbd5e1)';
    dropzone.style.background = '#f8fafc';
  }
  if (event.dataTransfer && event.dataTransfer.files) {
    addDocModalFiles(event.dataTransfer.files);
  }
}

function renderTableRecordAttachmentsUI() {
  const container = document.getElementById('table-record-attachments-container');
  const hiddenInput = document.getElementById('table-record-attachment-value');
  if (!container) return;

  if (hiddenInput) {
    hiddenInput.value = currentModalAttachments.join(', ');
  }

  if (currentModalAttachments.length === 0) {
    container.innerHTML = `
      <div class="file-dropzone" id="table-record-file-dropzone"
        onclick="document.getElementById('table-record-file-input').click()"
        ondragover="handleDropzoneDragOver(event, this)"
        ondragleave="handleDropzoneDragLeave(event, this)"
        ondrop="handleTableRecordDrop(event)"
        style="padding: 16px 14px; border: 1.5px dashed var(--brand-border, #cbd5e1); border-radius: var(--radius-md, 8px); background: #f8fafc; text-align: center; cursor: pointer; transition: all 0.2s ease;">
        <input type="file" id="table-record-file-input" style="display: none;" multiple
          onchange="handleTableRecordFileSelect(this)" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp">
        <i data-feather="upload-cloud" style="width: 28px; height: 28px; margin: 0 auto 6px; color: var(--brand-primary); display: block;"></i>
        <div style="font-size: 13px; font-weight: 600; color: #1e293b;">Click to upload or drag & drop multiple files</div>
        <div style="font-size: 11.5px; color: #64748b; margin-top: 2px;">PDF, PNG, JPG or DOCX (Multiple files supported)</div>
      </div>
    `;
  } else {
    let listHtml = `
      <div class="file-dropzone" id="table-record-file-dropzone"
        ondragover="handleDropzoneDragOver(event, this)"
        ondragleave="handleDropzoneDragLeave(event, this)"
        ondrop="handleTableRecordDrop(event)"
        style="padding: 12px 14px; border: 1.5px dashed var(--brand-border, #cbd5e1); border-radius: var(--radius-md, 8px); background: #f8fafc; transition: all 0.2s ease;">
        <input type="file" id="table-record-file-input" style="display: none;" multiple
          onchange="handleTableRecordFileSelect(this)" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp">
        <div class="modal-attach-list">
    `;

    currentModalAttachments.forEach((filename, idx) => {
      const isImg = filename.match(/\.(png|jpg|jpeg|webp)$/i);
      listHtml += `
        <div class="modal-attach-item">
          <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <i data-feather="${isImg ? 'image' : 'paperclip'}" style="width: 14px; height: 14px; color: var(--brand-primary); flex-shrink: 0;"></i>
            <span style="font-weight: 500; color: #1e293b; font-size: 12.5px; overflow: hidden; text-overflow: ellipsis;">${filename}</span>
            <span style="font-size: 11px; color: #94a3b8; flex-shrink: 0;">(Attached)</span>
          </div>
          <button type="button" class="modal-attach-item-remove" onclick="removeTableRecordAttachment(${idx})" title="Remove file">
            <i data-feather="x" style="width: 13px; height: 13px;"></i>
          </button>
        </div>
      `;
    });

    listHtml += `
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px; padding-top: 8px; border-top: 1px dashed #e2e8f0;">
          <span style="font-size: 11.5px; color: #64748b;">${currentModalAttachments.length} file${currentModalAttachments.length > 1 ? 's' : ''} attached</span>
          <button type="button" class="modal-attach-add-btn" onclick="document.getElementById('table-record-file-input').click();">
            <i data-feather="plus" style="width: 13px; height: 13px;"></i> Add More Files
          </button>
        </div>
      </div>
    `;
    container.innerHTML = listHtml;
  }

  if (window.feather) feather.replace();
}

function addTableRecordFiles(fileList) {
  if (!fileList || fileList.length === 0) return;
  const added = [];
  Array.from(fileList).forEach(file => {
    if (file && file.name && !currentModalAttachments.includes(file.name)) {
      currentModalAttachments.push(file.name);
      added.push(file.name);
    }
  });

  renderTableRecordAttachmentsUI();
  if (added.length > 0) {
    triggerToast(`Attached ${added.length} file${added.length > 1 ? 's' : ''}`, 'info');
  }
}

function handleTableRecordFileSelect(input) {
  if (!input || !input.files || input.files.length === 0) return;
  addTableRecordFiles(input.files);
  input.value = '';
}

function removeTableRecordAttachment(idx) {
  if (idx >= 0 && idx < currentModalAttachments.length) {
    const removed = currentModalAttachments.splice(idx, 1);
    renderTableRecordAttachmentsUI();
    triggerToast(`Removed ${removed[0]}`, 'info');
  }
}

function openTableRecordModal(tableType, tr) {
  const schema = TABLE_SCHEMAS[tableType];
  if (!schema) return;

  currentModalTableType = tableType;
  currentModalTr = tr;

  const backdrop = document.getElementById('table-record-modal-backdrop');
  const titleEl = document.getElementById('table-record-modal-title');
  const subtitleEl = document.getElementById('table-record-modal-subtitle');
  const iconBadgeEl = document.getElementById('table-record-modal-icon-badge');
  const bodyEl = document.getElementById('table-record-modal-body');
  const submitBtn = document.getElementById('table-record-modal-submit-btn');
  if (!backdrop || !bodyEl) return;

  const isEdit = Boolean(tr);
  const actionText = isEdit ? 'Edit' : 'Add';
  titleEl.textContent = `${actionText} ${schema.singular || 'Record'}`;
  subtitleEl.textContent = isEdit
    ? `Update details and manage attachments for this ${schema.singular.toLowerCase()}.`
    : `Enter details and upload required attachments for new ${schema.singular.toLowerCase()}.`;
  submitBtn.textContent = isEdit ? `Save Changes` : `Add ${schema.singular || 'Record'}`;

  // Choose modal header icon
  let iconName = 'file-text';
  if (tableType.includes('education')) iconName = 'book-open';
  else if (tableType.includes('training') || tableType.includes('course')) iconName = 'book-open';
  else if (tableType.includes('cert')) iconName = 'award';
  else if (tableType.includes('doc')) iconName = 'file-text';
  iconBadgeEl.innerHTML = `<i data-feather="${iconName}" style="width: 18px; height: 18px; color: var(--brand-primary);"></i>`;

  // Read existing cell values if editing
  const existingValues = {};
  if (isEdit) {
    const currentTds = Array.from(tr.children);
    schema.columns.forEach((col, idx) => {
      existingValues[col.key] = getRowCellRawText(currentTds[idx]);
    });
  }

  // Filter columns
  const standardCols = schema.columns.filter(c => c.type !== 'file' && c.key !== 'attachment');
  const fileCol = schema.columns.find(c => c.type === 'file' || c.key === 'attachment');

  const rawAttachment = isEdit ? (existingValues[fileCol?.key] || '') : (fileCol?.default || '');
  currentModalAttachments = (rawAttachment && rawAttachment !== '-')
    ? rawAttachment.split(/,\s*|\n+/).map(s => s.trim()).filter(Boolean)
    : [];

  let formHtml = `<div class="grid-2-col" style="gap: 14px; align-items: start;">`;

  standardCols.forEach(col => {
    const val = isEdit ? (existingValues[col.key] || '') : (col.default || '');
    const reqStar = col.required ? `<span class="required" style="color: #ef4444;">*</span>` : '';
    const isFullWidth = col.tdClass === 'col-desc' || col.key === 'description' || col.key === 'notes' || col.key === 'institution';

    formHtml += `
      <div class="form-group" style="${isFullWidth ? 'grid-column: span 2;' : ''}">
        <label class="form-label" style="font-weight: 600; font-size: 12.5px; margin-bottom: 5px; display: flex; align-items: center; gap: 4px;">
          ${col.label} ${reqStar}
        </label>
    `;

    if (col.type === 'select') {
      const optionsHtml = col.options.map(opt => {
        const isSelected = val && (val.toLowerCase().includes(opt.toLowerCase()) || opt.toLowerCase().includes(val.toLowerCase()));
        return `<option value="${opt}" ${isSelected ? 'selected' : ''}>${opt}</option>`;
      }).join('');
      formHtml += `<select class="form-select modal-field-input" data-key="${col.key}" ${col.required ? 'required' : ''}>${optionsHtml}</select>`;
    } else {
      formHtml += `<input type="text" class="form-input modal-field-input" data-key="${col.key}" value="${val.replace(/"/g, '&quot;')}" placeholder="${col.placeholder || col.label}" ${col.required ? 'required' : ''}>`;
    }

    formHtml += `</div>`;
  });

  formHtml += `</div>`;

  // Multi-Attachment Dropzone
  if (fileCol) {
    const attachReqStar = fileCol.required ? `<span class="required" style="color: #ef4444;">*</span>` : '';

    formHtml += `
      <div class="form-group" style="margin-top: 4px;">
        <label class="form-label" style="font-weight: 600; font-size: 12.5px; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
          ${fileCol.label || 'Attachment Files'} ${attachReqStar}
        </label>
        <input type="hidden" id="table-record-attachment-value" data-key="${fileCol.key}" value="${currentModalAttachments.join(', ')}">
        <div id="table-record-attachments-container">
          <!-- Dynamically populated attachment list and dropzone -->
        </div>
      </div>
    `;
  }

  bodyEl.innerHTML = formHtml;
  renderTableRecordAttachmentsUI();

  backdrop.style.display = 'flex';
  requestAnimationFrame(() => {
    backdrop.classList.add('open');
  });

  if (window.feather) feather.replace();

  const firstInput = bodyEl.querySelector('input, select');
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 80);
  }
}

function closeTableRecordModal(event) {
  if (event && event.target && event.target !== event.currentTarget && !event.target.closest('.modal-close-btn') && !event.target.classList.contains('btn-secondary')) {
    return;
  }
  const backdrop = document.getElementById('table-record-modal-backdrop');
  if (!backdrop) return;
  backdrop.classList.remove('open');
  setTimeout(() => {
    backdrop.style.display = 'none';
    currentModalTableType = null;
    currentModalTr = null;
    currentModalAttachments = [];
  }, 200);
}

function saveTableRecordModal(event) {
  if (event) event.preventDefault();
  const schema = TABLE_SCHEMAS[currentModalTableType];
  if (!schema) return;

  const bodyEl = document.getElementById('table-record-modal-body');
  if (!bodyEl) return;

  const rowData = {};
  schema.columns.forEach(col => {
    if (col.type === 'file' || col.key === 'attachment') {
      rowData[col.key] = currentModalAttachments.join(', ');
    } else {
      const input = bodyEl.querySelector(`[data-key="${col.key}"]`);
      rowData[col.key] = input ? input.value.trim() : (col.default || '');
    }
  });

  // Validation: check required columns
  for (const col of schema.columns) {
    if (col.required) {
      if (col.type === 'file' || col.key === 'attachment') {
        if (currentModalAttachments.length === 0) {
          const dropzone = document.getElementById('table-record-file-dropzone');
          if (dropzone) dropzone.style.borderColor = '#ef4444';
          triggerToast(`Please attach at least one file for ${col.label} (Required)`, 'danger');
          return;
        }
      } else if (!rowData[col.key] || rowData[col.key] === '-') {
        const input = bodyEl.querySelector(`[data-key="${col.key}"]`);
        if (input) {
          input.style.borderColor = '#ef4444';
          input.focus();
        }
        triggerToast(`Please enter ${col.label} (Required)`, 'danger');
        return;
      }
    }
  }

  // Render clean table row
  let rowHtml = '';
  schema.columns.forEach(col => {
    const val = rowData[col.key] || '-';
    const tdClass = col.tdClass ? ` class="${col.tdClass}"` : '';

    if (col.render) {
      rowHtml += `<td${tdClass}>${col.render(val)}</td>`;
    } else if (col.class) {
      rowHtml += `<td${tdClass}><div class="${col.class}">${val}</div></td>`;
    } else {
      rowHtml += `<td${tdClass}>${val}</td>`;
    }
  });

  rowHtml += `
    <td class="table-actions-cell" onclick="event.stopPropagation();">
      <button class="row-action-btn" title="View Details" onclick="previewTableRow(this, '${currentModalTableType}')">
        <i data-feather="eye" style="width: 15px; height: 15px;"></i>
      </button>
      <div class="dropdown-wrapper">
        <button class="row-action-btn table-more-btn" title="More Actions" onclick="toggleDropdownMenu(this.parentElement)">
          <i data-feather="more-vertical" style="width: 15px; height: 15px;"></i>
        </button>
        <div class="dropdown-menu">
          <button class="dropdown-item" onclick="previewTableRow(this, '${currentModalTableType}')">
            <i data-feather="eye" style="width: 13px; height: 13px;"></i> Preview Details
          </button>
          <button class="dropdown-item" onclick="startEditTableRow(this, '${currentModalTableType}')">
            <i data-feather="edit-2" style="width: 13px; height: 13px;"></i> Edit
          </button>
          ${currentModalTableType === 'documents' || currentModalTableType === 'document' ? `
          <button class="dropdown-item" onclick="triggerToast('Downloading document...', 'info')">
            <i data-feather="download" style="width: 13px; height: 13px;"></i> Download
          </button>` : ''}
          ${currentModalTableType !== 'education' ? `
          <div class="dropdown-divider"></div>
          <button class="dropdown-item danger" onclick="deleteTableRow(this, '${currentModalTableType}')">
            <i data-feather="trash-2" style="width: 13px; height: 13px;"></i> Delete
          </button>` : ''}
        </div>
      </div>
    </td>
  `;

  if (currentModalTr) {
    currentModalTr.innerHTML = rowHtml;
    currentModalTr.classList.remove('is-editing-row', 'is-new-row');
    currentModalTr.style.animation = 'tableRowHighlight 0.6s ease-out';
  } else {
    const tbody = document.querySelector(schema.tbodySelector);
    if (tbody) {
      const newTr = document.createElement('tr');
      newTr.innerHTML = rowHtml;
      tbody.insertBefore(newTr, tbody.firstChild);
      newTr.style.animation = 'tableRowHighlight 0.6s ease-out';
    }
  }

  updateTableSectionCounts(currentModalTableType);

  if (window.feather) feather.replace();
  triggerToast(`✓ ${schema.singular || 'Record'} saved successfully!`, 'success');
  closeTableRecordModal();
}

// Window exports
window.previewTableRow = previewTableRow;
window.closeRecordPreviewModal = closeRecordPreviewModal;
window.editFromPreviewModal = editFromPreviewModal;
window.openImageLightbox = openImageLightbox;
window.closeImageLightbox = closeImageLightbox;
window.openAddContactModal = openAddContactModal;
window.closeAddContactModal = closeAddContactModal;
window.handleContactTypeChange = handleContactTypeChange;
window.saveAddContactModal = saveAddContactModal;
window.deleteContactCard = deleteContactCard;
window.openTableRecordModal = openTableRecordModal;
window.closeTableRecordModal = closeTableRecordModal;
window.handleTableRecordFileSelect = handleTableRecordFileSelect;
window.removeTableRecordAttachment = removeTableRecordAttachment;
window.saveTableRecordModal = saveTableRecordModal;
window.handleDropzoneDragOver = handleDropzoneDragOver;
window.handleDropzoneDragLeave = handleDropzoneDragLeave;
window.handleTableRecordDrop = handleTableRecordDrop;
window.handleDocModalDrop = handleDocModalDrop;
window.removeDocModalAttachment = removeDocModalAttachment;





