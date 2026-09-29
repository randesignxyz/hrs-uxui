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

  // Keyboard shortcut listener (Escape to close drawer)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDrawer();
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
    const status = document.getElementById('card-input-email-status')?.value;
    if (email) {
      const elHeader = document.getElementById('header-email-val');
      const elContact = document.getElementById('val-contact-company-email');
      if (elHeader) {
        elHeader.textContent = email;
        elHeader.title = email;
      }
      if (elContact) elContact.textContent = email;
    }
    if (status) {
      const badge = document.getElementById('badge-contact-email-status');
      if (badge) {
        badge.className = status === 'Verified' ? 'badge badge-success' : 'badge badge-neutral';
        badge.textContent = status;
      }
    }
  } else if (cardKey === 'contact-phone') {
    const phone = document.getElementById('card-input-business-phone')?.value.trim();
    const status = document.getElementById('card-input-phone-status')?.value;
    if (phone) {
      const elHeader = document.getElementById('header-phone-val');
      const elContact = document.getElementById('val-contact-business-phone');
      if (elHeader) elHeader.textContent = phone;
      if (elContact) elContact.textContent = phone;
    }
    if (status) {
      const badge = document.getElementById('badge-contact-phone-status');
      if (badge) {
        badge.className = status === 'Active' ? 'badge badge-success' : 'badge badge-neutral';
        badge.textContent = status;
      }
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
    const email = getText('val-contact-company-email', 'admin@local.placeholder');
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
    const email = getText('val-contact-company-email', 'admin@local.placeholder');
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
        render: (val, isDraft) => `<div class="table-cell-title" style="display: flex; align-items: center; gap: 8px;"><span>${val}</span>${isDraft ? '<span class="badge badge-draft">Draft</span>' : ''}</div>`
      },
      { key: 'relationship', label: 'Relationship', type: 'select', options: ['Cousin', 'Child', 'Spouse', 'Parent', 'Sibling', 'Friend', 'Colleague'] },
      { 
        key: 'phone', 
        label: 'Phone Number', 
        type: 'text', 
        placeholder: '012356988',
        render: (val) => `<span style="font-family: monospace; font-weight: 600;">${val}</span> <button class="copy-pill-btn" onclick="copyToClipboard('${val}', 'Emergency Phone')"><i data-feather="copy" style="width: 11px; height: 11px;"></i></button>`
      },
      { key: 'address', label: 'Address', type: 'text', placeholder: '# Street, City' },
      { 
        key: 'status', 
        label: 'Status', 
        type: 'select', 
        options: ['Active', 'Draft', 'Awaiting HR Review'],
        render: (val) => {
          if (val === 'Active') return '<span class="badge badge-success">Active</span>';
          if (val === 'Draft') return '<span class="badge badge-draft">Draft</span>';
          return '<span class="badge badge-warning">Awaiting HR Review</span>';
        }
      }
    ]
  },
  education: {
    sectionId: 'section-education',
    tbodySelector: '#tbody-education',
    cardCountSelector: '#section-education .card-title-count',
    navTab: 'education',
    singular: 'Education',
    columns: [
      { key: 'period', label: 'Period', type: 'text', placeholder: '2021 – 2025', tdClass: 'col-period', render: (val) => `<strong>${val}</strong>` },
      { key: 'degree', label: 'Degree', type: 'select', options: ["Bachelor's Degree", "Master's Degree", "Associate's Degree", "High School", "Doctorate", "Professional Diploma"] },
      { key: 'major', label: 'Major / Subject', type: 'text', placeholder: 'Computer Programming' },
      { key: 'institution', label: 'Institution', type: 'text', placeholder: 'Institution Name' },
      { key: 'country', label: 'Country', type: 'text', placeholder: 'Cambodia', default: 'Cambodia' },
      { key: 'gpa', label: 'GPA', type: 'text', placeholder: '3.7', render: (val) => `<span class="badge badge-info" style="font-weight: 700;">${val || '3.5'}</span>` },
      { 
        key: 'status', 
        label: 'Status', 
        type: 'select', 
        options: ['Graduated', 'In Progress', 'Completed', 'On Hold'],
        render: (val) => `<span class="badge badge-success">${val}</span>`
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
    cardCountSelector: '#section-training .card-header-bar:first-of-type .card-title-count',
    navTab: 'training',
    singular: 'Training Course',
    columns: [
      { key: 'title', label: 'Course Title', type: 'text', placeholder: 'Course Title', class: 'table-cell-title' },
      { key: 'institution', label: 'Institution', type: 'text', placeholder: 'Institution' },
      { key: 'period', label: 'Period', type: 'text', placeholder: '01-Jul-2026 – 31-Jul-2026', tdClass: 'col-period' },
      { key: 'duration', label: 'Duration', type: 'text', placeholder: '50 Hours', render: (val) => `<strong>${val}</strong>` },
      { key: 'description', label: 'Description', type: 'text', placeholder: 'Topics covered', tdClass: 'col-desc' }
    ]
  },
  certification: {
    sectionId: 'section-training',
    tbodySelector: '#tbody-certifications',
    cardCountSelector: '#section-training .card-header-bar:last-of-type .card-title-count',
    navTab: 'training',
    singular: 'Certification',
    columns: [
      { key: 'title', label: 'Certification', type: 'text', placeholder: 'Certification Title', class: 'table-cell-title' },
      { key: 'institution', label: 'Accrediting Institution', type: 'text', placeholder: 'Accrediting Institution' },
      { key: 'issueDate', label: 'Issue Date', type: 'text', placeholder: 'Oct 2026' },
      { key: 'description', label: 'Description', type: 'text', placeholder: 'Domain & specialization', tdClass: 'col-desc' }
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
      { key: 'name', label: 'Document Name', type: 'text', placeholder: 'Document Name', class: 'table-cell-title' },
      { 
        key: 'category', 
        label: 'Category', 
        type: 'select', 
        options: ['Identity', 'Employment', 'Certification', 'Financial', 'Legal', 'Other'],
        render: (val) => `<span class="badge badge-neutral">${val}</span>`
      },
      { key: 'uploadedDate', label: 'Uploaded Date', type: 'text', placeholder: '01 Jul 2026', default: '01 Jul 2026' },
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
        options: ['Valid', 'Expired', 'Expiring Soon', 'Pending'],
        render: (val) => `<span class="badge ${val === 'Valid' ? 'badge-valid' : val === 'Expired' ? 'badge-danger' : 'badge-warning'}">${val}</span>`
      },
      { key: 'uploadedBy', label: 'Uploaded By', type: 'text', placeholder: 'Kauv Seth Pisal', default: 'Kauv Seth Pisal' }
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
  
  // Clean clone to get pure text excluding badges/copy buttons
  const clone = td.cloneNode(true);
  clone.querySelectorAll('.copy-pill-btn, .row-action-btn, i, svg').forEach(el => el.remove());
  return clone.textContent.trim();
}

function startEditTableRow(btnOrElement, tableType) {
  const tr = (btnOrElement && btnOrElement.tagName === 'TR') ? btnOrElement : (btnOrElement ? btnOrElement.closest('tr') : null);
  const schema = TABLE_SCHEMAS[tableType];
  if (!tr || !schema) return;

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
    } else {
      newHtml += `<td${tdClass}><input type="text" class="table-input" data-key="${col.key}" value="${val.replace(/"/g, '&quot;')}" placeholder="${col.placeholder || col.label}"></td>`;
    }
  });

  // Add Action buttons
  newHtml += `
    <td class="table-actions-cell" onclick="event.stopPropagation();">
      <div class="table-row-actions-group">
        <button class="btn-table-action-save" title="Save changes" onclick="saveTableRow(this, '${tableType}')">
          <i data-feather="check" style="width: 13px; height: 13px;"></i> Save
        </button>
        <button class="btn-table-action-cancel" title="Cancel" onclick="cancelEditTableRow(this, '${tableType}')">
          <i data-feather="x" style="width: 13px; height: 13px;"></i> Cancel
        </button>
        <button class="btn-table-action-delete" title="Delete record" onclick="deleteTableRow(this, '${tableType}')">
          <i data-feather="trash-2" style="width: 13px; height: 13px;"></i>
        </button>
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
    } else {
      const defVal = col.default || '';
      cellsHtml += `<td${tdClass}><input type="text" class="table-input" data-key="${col.key}" value="${defVal}" placeholder="${col.placeholder || col.label}"></td>`;
    }
  });

  cellsHtml += `
    <td class="table-actions-cell" onclick="event.stopPropagation();">
      <div class="table-row-actions-group">
        <button class="btn-table-action-save" title="Save new record" onclick="saveTableRow(this, '${tableType}')">
          <i data-feather="check" style="width: 13px; height: 13px;"></i> Save
        </button>
        <button class="btn-table-action-cancel" title="Cancel" onclick="cancelEditTableRow(this, '${tableType}')">
          <i data-feather="x" style="width: 13px; height: 13px;"></i> Cancel
        </button>
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

  // Validation: first column shouldn't be empty
  const firstColKey = schema.columns[0].key;
  if (!rowData[firstColKey]) {
    const firstInput = tr.querySelector(`[data-key="${firstColKey}"]`);
    if (firstInput) {
      firstInput.style.borderColor = '#ef4444';
      firstInput.focus();
    }
    triggerToast(`Please enter a ${schema.columns[0].label}`, 'danger');
    return;
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
      <button class="row-action-btn" title="View Details" onclick="viewTableRowDetails(this, '${tableType}')">
        <i data-feather="eye" style="width: 14px; height: 14px;"></i>
      </button>
      <button class="row-action-btn" title="Edit" onclick="startEditTableRow(this, '${tableType}')">
        <i data-feather="edit-2" style="width: 14px; height: 14px;"></i>
      </button>
      <button class="row-action-btn" title="Delete" onclick="deleteTableRow(this, '${tableType}')">
        <i data-feather="trash-2" style="width: 14px; height: 14px;"></i>
      </button>
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
      } else if (schema.navTab === 'documents') {
        navBadge.textContent = `${count}/${count}`;
      } else {
        navBadge.textContent = count;
      }
    }
  }
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

// Expose table inline editing methods
window.startEditTableRow = startEditTableRow;
window.addNewTableRow = addNewTableRow;
window.saveTableRow = saveTableRow;
window.cancelEditTableRow = cancelEditTableRow;
window.deleteTableRow = deleteTableRow;
window.viewTableRowDetails = viewTableRowDetails;
window.updateTableSectionCounts = updateTableSectionCounts;


