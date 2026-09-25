/**
 * Enterprise HRIS Management System - Employee Profile
 * Interactive Controller & State Management
 */

let isProgrammaticScroll = false;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Feather Icons
  if (window.feather) {
    feather.replace();
  }

  // Initialize ScrollSpy for continuous scrolling
  initScrollSpy();

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
});

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
   3. VIEW MODE VS. EDIT MODE TOGGLE
   ========================================================================== */
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
   4. SLIDE-OVER DRAWER & FORM VALIDATION
   ========================================================================== */
function openDrawer(docOrFeatureName) {
  const drawer = document.getElementById('slide-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  const drawerTitle = document.getElementById('drawer-title');
  const docTypeSelect = document.getElementById('drawer-input-doctype');
  const docNumInput = document.getElementById('drawer-input-docnum');
  const issueDateInput = document.getElementById('drawer-input-issuedate');
  const expiryDateInput = document.getElementById('drawer-input-expirydate');

  if (drawerTitle) {
    drawerTitle.textContent = docOrFeatureName.includes('Add') || docOrFeatureName.includes('Edit') || docOrFeatureName.includes('Upload') 
      ? docOrFeatureName 
      : `Update ${docOrFeatureName}`;
  }

  // Pre-fill contextual dummy values based on document clicked
  if (docTypeSelect && docNumInput) {
    if (docOrFeatureName.includes('National ID')) {
      docTypeSelect.value = 'National ID';
      docNumInput.value = '12345678';
      issueDateInput.value = '2026-07-01';
      expiryDateInput.value = '2026-07-31';
    } else if (docOrFeatureName.includes('Passport')) {
      docTypeSelect.value = 'Passport';
      docNumInput.value = 'N12345678';
      issueDateInput.value = '2026-07-01';
      expiryDateInput.value = '2031-07-27';
    } else if (docOrFeatureName.includes('Driver')) {
      docTypeSelect.value = 'Driver License';
      docNumInput.value = '123456';
      issueDateInput.value = '2026-07-01';
      expiryDateInput.value = '2031-07-31';
    }
  }

  // Reset any error state
  clearDrawerErrors();

  drawer.classList.add('open');
  backdrop.classList.add('open');

  if (window.feather) feather.replace();
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

  closeDrawer();
  triggerToast('Document record updated and submitted for HR review!', 'success');
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
   8. TOAST NOTIFICATION ENGINE
   ========================================================================== */
function triggerToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  if (type === 'danger') iconName = 'alert-triangle';

  toast.innerHTML = `
    <i data-feather="${iconName}" style="width: 16px; height: 16px; flex-shrink: 0;"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  if (window.feather) {
    feather.replace();
  }

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease-out';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3200);
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

