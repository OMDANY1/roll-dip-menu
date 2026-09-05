/**
 * ROLL & DIP — ADMIN DASHBOARD CONTROLLER
 * Full management of sections, groups, items, pricing, reordering, and visibility.
 */

(function () {
  'use strict';

  // Application State
  const state = {
    user: null,
    sections: [],
    activeSectionId: null,
    activeGroupId: null, // null means 'all' in section
    searchQuery: '',
    isLoading: false,
    editingItem: null,
    deletingItem: null
  };

  // DOM Elements
  const els = {
    toastContainer: document.getElementById('toast-container'),
    authSection: document.getElementById('auth-section'),
    adminSection: document.getElementById('admin-section'),
    loginForm: document.getElementById('login-form'),
    loginEmail: document.getElementById('login-email'),
    loginPassword: document.getElementById('login-password'),
    loginError: document.getElementById('login-error'),
    loginBtn: document.getElementById('login-btn'),
    userEmailDisplay: document.getElementById('user-email-display'),
    logoutBtn: document.getElementById('logout-btn'),
    configBtn: document.getElementById('config-btn'),

    // Mobile Header & Drawer
    mobileMenuToggle: document.getElementById('mobile-menu-toggle'),
    mobileDrawer: document.getElementById('mobile-drawer'),
    mobileEmailDisplay: document.getElementById('mobile-email-display'),
    mobileConfigBtn: document.getElementById('mobile-config-btn'),
    mobileLogoutBtn: document.getElementById('mobile-logout-btn'),

    // Category Sidebar & Navigation
    categoriesCountBadge: document.getElementById('categories-count-badge'),
    sectionsNav: document.getElementById('sections-nav'),
    addCategoryBtn: document.getElementById('add-category-btn'),
    addCategorySidebarBtn: document.getElementById('add-category-sidebar-btn'),

    // Category Header Card & Actions Dropdown
    sectionTitle: document.getElementById('section-title'),
    sectionMeta: document.getElementById('section-meta'),
    sectionStatusPill: document.getElementById('section-status-pill'),
    sectionItemsPill: document.getElementById('section-items-pill'),
    sectionIntro: document.getElementById('section-intro'),
    addItemBtn: document.getElementById('add-item-btn'),
    categoryActionsBtn: document.getElementById('category-actions-btn'),
    categoryActionsMenu: document.getElementById('category-actions-menu'),
    editCategoryBtn: document.getElementById('edit-category-btn'),
    categoryToggleVisBtn: document.getElementById('category-toggle-vis-btn'),
    categoryToggleVisLabel: document.getElementById('category-toggle-vis-label'),
    categoryMoveUpBtn: document.getElementById('category-move-up-btn'),
    categoryMoveDownBtn: document.getElementById('category-move-down-btn'),
    deleteCategoryBtn: document.getElementById('delete-category-btn'),

    // Subsections / Group Tabs
    groupTabs: document.getElementById('group-tabs'),

    // Products Card (Toolbar, Table, Mobile Cards, Empty State)
    searchInput: document.getElementById('search-input'),
    toolbarItemsCount: document.getElementById('toolbar-items-count'),
    itemsTableBody: document.getElementById('items-table-body'),
    itemsCardsMobile: document.getElementById('items-cards-mobile'),
    emptyState: document.getElementById('empty-state'),
    emptyStateTitle: document.getElementById('empty-state-title'),
    emptyStateDesc: document.getElementById('empty-state-desc'),
    emptyAddItemBtn: document.getElementById('empty-add-item-btn'),

    // Item Modal
    itemModal: document.getElementById('item-modal'),
    itemModalTitle: document.getElementById('item-modal-title'),
    itemForm: document.getElementById('item-form'),
    itemSectionSelect: document.getElementById('item-section-select'),
    itemGroupSelect: document.getElementById('item-group-select'),
    itemNameInput: document.getElementById('item-name-input'),
    itemDescInput: document.getElementById('item-desc-input'),
    itemPriceInput: document.getElementById('item-price-input'),
    itemNoPriceCheck: document.getElementById('item-no-price-check'),
    itemBadgeInput: document.getElementById('item-badge-input'),
    itemActiveCheck: document.getElementById('item-active-check'),
    itemModalClose: document.getElementById('item-modal-close'),
    itemModalCancel: document.getElementById('item-modal-cancel'),

    // Delete Item Modal
    deleteModal: document.getElementById('delete-modal'),
    deleteItemName: document.getElementById('delete-item-name'),
    deleteConfirmBtn: document.getElementById('delete-confirm-btn'),
    deleteCancelBtn: document.getElementById('delete-cancel-btn'),
    deleteModalClose: document.getElementById('delete-modal-close'),

    // Add Category Modal
    addCategoryModal: document.getElementById('add-category-modal'),
    addCategoryForm: document.getElementById('add-category-form'),
    newCategoryName: document.getElementById('new-category-name'),
    newCategoryTag: document.getElementById('new-category-tag'),
    newCategoryIntro: document.getElementById('new-category-intro'),
    addCategoryClose: document.getElementById('add-category-close'),
    addCategoryCancel: document.getElementById('add-category-cancel'),

    // Edit Category Modal
    editCategoryModal: document.getElementById('edit-category-modal'),
    editCategoryModalTitle: document.getElementById('edit-category-modal-title'),
    editCategoryForm: document.getElementById('edit-category-form'),
    editCategoryName: document.getElementById('edit-category-name'),
    editCategoryTag: document.getElementById('edit-category-tag'),
    editCategoryIntro: document.getElementById('edit-category-intro'),
    editCategoryClose: document.getElementById('edit-category-close'),
    editCategoryCancel: document.getElementById('edit-category-cancel'),

    // Delete Category Modal
    deleteCategoryModal: document.getElementById('delete-category-modal'),
    deleteCategoryBlocked: document.getElementById('delete-category-blocked'),
    deleteCategoryBlockedMsg: document.getElementById('delete-category-blocked-msg'),
    deleteCategoryAllowed: document.getElementById('delete-category-allowed'),
    deleteCategoryTargetName: document.getElementById('delete-category-target-name'),
    deleteCategoryClose: document.getElementById('delete-category-close'),
    deleteCategoryCancel: document.getElementById('delete-category-cancel'),
    deleteCategoryConfirm: document.getElementById('delete-category-confirm'),

    // Config Modal
    configModal: document.getElementById('config-modal'),
    configUrlInput: document.getElementById('config-url-input'),
    configAnonInput: document.getElementById('config-anon-input'),
    configSaveBtn: document.getElementById('config-save-btn'),
    configModalClose: document.getElementById('config-modal-close'),
    configModalCancel: document.getElementById('config-modal-cancel'),
    configPromptBtn: document.getElementById('config-prompt-btn')
  };

  // Toast notification helper
  function showToast(msg, type = 'info', duration = 3000) {
    if (!els.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    els.toastContainer.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }, duration);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Check Auth and init session
   */
  async function initAuth() {
    const client = window.RollDipSupabase ? window.RollDipSupabase.getClient() : null;

    if (!client) {
      showAuthView();
      return;
    }

    try {
      const { data: { session }, error } = await client.auth.getSession();
      if (error) {
        console.warn('[Admin] Session check error:', error);
        showAuthView();
        return;
      }

      if (session && session.user) {
        state.user = session.user;
        showDashboardView();
        loadMenuData();
      } else {
        showAuthView();
      }

      // Listen for auth events
      client.auth.onAuthStateChange((_event, session) => {
        if (session && session.user) {
          state.user = session.user;
          showDashboardView();
          loadMenuData();
        } else {
          state.user = null;
          showAuthView();
        }
      });
    } catch (err) {
      console.error('[Admin] Auth init error:', err);
      showAuthView();
    }
  }

  function showAuthView() {
    els.authSection.style.display = 'flex';
    els.adminSection.style.display = 'none';
  }

  function showDashboardView() {
    els.authSection.style.display = 'none';
    els.adminSection.style.display = 'flex';
    if (els.userEmailDisplay && state.user) {
      els.userEmailDisplay.textContent = state.user.email || 'Admin';
    }
    if (els.mobileEmailDisplay && state.user) {
      els.mobileEmailDisplay.textContent = state.user.email || 'Admin';
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MODAL UTILITIES (Air-tight hidden state & accessible behavior)
  // ─────────────────────────────────────────────────────────────────────────────

  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.removeAttribute('hidden');
    modalEl.setAttribute('aria-hidden', 'false');
    modalEl.style.display = 'flex';
    requestAnimationFrame(() => {
      modalEl.classList.add('show');
    });
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('show');
    modalEl.setAttribute('aria-hidden', 'true');
    modalEl.setAttribute('hidden', '');
    modalEl.style.display = 'none';
  }

  function closeAllModals() {
    closeItemModal();
    closeDeleteModal();
    closeAddCategoryModal();
    closeEditCategoryModal();
    closeDeleteCategoryModal();
    closeConfigModal();
  }

  // Backdrop click listener on all modals
  [
    els.itemModal,
    els.deleteModal,
    els.addCategoryModal,
    els.editCategoryModal,
    els.deleteCategoryModal,
    els.configModal
  ].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeAllModals();
        }
      });
    }
  });

  // Global Escape key closes modals, dropdowns, and drawers
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
      closeCategoryDropdown();
      closeMobileDrawer();
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // MOBILE DRAWER
  // ─────────────────────────────────────────────────────────────────────────────

  function toggleMobileDrawer(e) {
    if (e) e.stopPropagation();
    if (!els.mobileDrawer) return;
    const isHidden = els.mobileDrawer.hasAttribute('hidden');
    if (isHidden) {
      openMobileDrawer();
    } else {
      closeMobileDrawer();
    }
  }

  function openMobileDrawer() {
    if (!els.mobileDrawer) return;
    els.mobileDrawer.removeAttribute('hidden');
    els.mobileDrawer.setAttribute('aria-hidden', 'false');
    if (els.mobileMenuToggle) {
      els.mobileMenuToggle.setAttribute('aria-expanded', 'true');
      els.mobileMenuToggle.classList.add('is-active');
    }
  }

  function closeMobileDrawer() {
    if (!els.mobileDrawer) return;
    els.mobileDrawer.setAttribute('hidden', '');
    els.mobileDrawer.setAttribute('aria-hidden', 'true');
    if (els.mobileMenuToggle) {
      els.mobileMenuToggle.setAttribute('aria-expanded', 'false');
      els.mobileMenuToggle.classList.remove('is-active');
    }
  }

  if (els.mobileMenuToggle) {
    els.mobileMenuToggle.addEventListener('click', toggleMobileDrawer);
  }
  if (els.mobileConfigBtn) {
    els.mobileConfigBtn.addEventListener('click', () => {
      closeMobileDrawer();
      openConfigModal();
    });
  }
  if (els.mobileLogoutBtn) {
    els.mobileLogoutBtn.addEventListener('click', async () => {
      closeMobileDrawer();
      const client = window.RollDipSupabase ? window.RollDipSupabase.getClient() : null;
      if (client) {
        await client.auth.signOut();
      }
      state.user = null;
      showToast('Signed out successfully', 'info');
      showAuthView();
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CATEGORY ACTIONS DROPDOWN
  // ─────────────────────────────────────────────────────────────────────────────

  function toggleCategoryDropdown(e) {
    if (e) e.stopPropagation();
    if (!els.categoryActionsMenu) return;
    const isHidden = els.categoryActionsMenu.hasAttribute('hidden');
    if (isHidden) {
      openCategoryDropdown();
    } else {
      closeCategoryDropdown();
    }
  }

  function openCategoryDropdown() {
    if (!els.categoryActionsMenu) return;
    els.categoryActionsMenu.removeAttribute('hidden');
    els.categoryActionsMenu.setAttribute('aria-hidden', 'false');
    if (els.categoryActionsBtn) els.categoryActionsBtn.setAttribute('aria-expanded', 'true');
  }

  function closeCategoryDropdown() {
    if (!els.categoryActionsMenu) return;
    els.categoryActionsMenu.setAttribute('hidden', '');
    els.categoryActionsMenu.setAttribute('aria-hidden', 'true');
    if (els.categoryActionsBtn) els.categoryActionsBtn.setAttribute('aria-expanded', 'false');
  }

  if (els.categoryActionsBtn) {
    els.categoryActionsBtn.addEventListener('click', toggleCategoryDropdown);
  }

  // Click outside to dismiss dropdowns and drawers
  document.addEventListener('click', (e) => {
    if (els.categoryActionsMenu && !els.categoryActionsMenu.contains(e.target) && e.target !== els.categoryActionsBtn && !els.categoryActionsBtn?.contains(e.target)) {
      closeCategoryDropdown();
    }
    if (els.mobileDrawer && !els.mobileDrawer.contains(e.target) && e.target !== els.mobileMenuToggle && !els.mobileMenuToggle?.contains(e.target)) {
      closeMobileDrawer();
    }
  });

  /**
   * Login Form Submit
   */
  if (els.loginForm) {
    els.loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = els.loginEmail.value.trim();
      const password = els.loginPassword.value;

      els.loginError.style.display = 'none';
      els.loginBtn.disabled = true;
      els.loginBtn.textContent = 'Signing in...';

      const client = window.RollDipSupabase ? window.RollDipSupabase.getClient() : null;
      if (!client) {
        els.loginError.textContent = 'Supabase is not configured. Please click "API Connection" below to configure your credentials.';
        els.loginError.style.display = 'block';
        els.loginBtn.disabled = false;
        els.loginBtn.textContent = 'Sign In to Dashboard';
        return;
      }

      try {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) {
          els.loginError.textContent = error.message || 'Invalid login credentials.';
          els.loginError.style.display = 'block';
        } else if (data && data.user) {
          state.user = data.user;
          showToast('Welcome back to Roll & Dip Admin', 'success');
          showDashboardView();
          loadMenuData();
        }
      } catch (err) {
        els.loginError.textContent = err.message || 'An unexpected error occurred during login.';
        els.loginError.style.display = 'block';
      } finally {
        els.loginBtn.disabled = false;
        els.loginBtn.textContent = 'Sign In to Dashboard';
      }
    });
  }

  /**
   * Logout
   */
  if (els.logoutBtn) {
    els.logoutBtn.addEventListener('click', async () => {
      const client = window.RollDipSupabase ? window.RollDipSupabase.getClient() : null;
      if (client) {
        await client.auth.signOut();
      }
      state.user = null;
      showToast('Signed out successfully', 'info');
      showAuthView();
    });
  }

  /**
   * Load Menu Data from Supabase
   */
  async function loadMenuData() {
    state.isLoading = true;
    try {
      if (!window.RollDipSupabase || !window.RollDipSupabase.getClient()) {
        // Use seed dataset if Supabase not connected yet
        state.sections = JSON.parse(JSON.stringify(window.ROLL_DIP_SEED_DATA || []));
      } else {
        state.sections = await window.RollDipSupabase.fetchAdminMenu();
      }

      if (!state.activeSectionId && state.sections.length > 0) {
        state.activeSectionId = state.sections[0].id || state.sections[0].slug;
      }

      renderSectionsNav();
      renderCurrentSection();
    } catch (err) {
      console.error('[Admin] Error loading menu data:', err);
      showToast('Failed to load menu data from database', 'error');
    } finally {
      state.isLoading = false;
    }
  }

  /**
   * Render Section Navigation Tabs (Sidebar & Mobile Chips)
   */
  function renderSectionsNav() {
    if (!els.sectionsNav) return;
    els.sectionsNav.innerHTML = '';

    if (els.categoriesCountBadge) {
      els.categoriesCountBadge.textContent = state.sections.length;
    }

    state.sections.forEach(sec => {
      const secKey = sec.id || sec.slug;
      const isActive = secKey === state.activeSectionId;
      
      let totalItems = 0;
      let activeItems = 0;
      (sec.groups || []).forEach(g => {
        (g.items || []).forEach(i => {
          totalItems++;
          if (i.is_active) activeItems++;
        });
      });

      const isVisible = sec.is_active !== false;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `section-tab-btn ${isActive ? 'active' : ''} ${!isVisible ? 'is-inactive' : ''}`;
      btn.setAttribute('data-id', secKey);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      btn.innerHTML = `
        <div class="tab-btn-content">
          <span class="tab-num">${escapeHtml(sec.section_number)}</span>
          <span class="tab-title">${escapeHtml(sec.title_plain)}</span>
        </div>
        <div class="tab-badges">
          ${!isVisible ? '<span class="tab-hidden-badge">Hidden</span>' : ''}
          <span class="tab-count">${activeItems}/${totalItems}</span>
        </div>
      `;

      btn.addEventListener('click', () => {
        state.activeSectionId = secKey;
        state.activeGroupId = null; // Reset group filter
        renderSectionsNav();
        renderCurrentSection();
      });

      els.sectionsNav.appendChild(btn);
    });
  }

  /**
   * Render Active Section, Groups, and Items Table
   */
  function renderCurrentSection() {
    const currentSection = state.sections.find(s => (s.id || s.slug) === state.activeSectionId);
    if (!currentSection) {
      if (els.sectionTitle) els.sectionTitle.textContent = 'No Category Selected';
      if (els.itemsTableBody) els.itemsTableBody.innerHTML = '';
      if (els.itemsCardsMobile) els.itemsCardsMobile.innerHTML = '';
      if (els.emptyState) els.emptyState.style.display = 'flex';
      return;
    }

    // Category Header info
    if (els.sectionTitle) {
      els.sectionTitle.textContent = currentSection.title_plain;
    }
    if (els.sectionMeta) {
      const tag = currentSection.tag ? `${currentSection.tag} • ` : '';
      els.sectionMeta.textContent = `${tag}Section ${currentSection.section_number}`;
    }
    if (els.sectionStatusPill) {
      const isVis = currentSection.is_active !== false;
      els.sectionStatusPill.className = `status-chip ${isVis ? 'is-active' : 'is-hidden'}`;
      els.sectionStatusPill.textContent = isVis ? '● Active' : '● Hidden';
    }

    // Count items in current section
    let totalItemsInSection = 0;
    (currentSection.groups || []).forEach(g => {
      totalItemsInSection += (g.items || []).length;
    });

    if (els.sectionItemsPill) {
      els.sectionItemsPill.textContent = `${totalItemsInSection} Item${totalItemsInSection === 1 ? '' : 's'}`;
    }

    if (els.sectionIntro) {
      if (currentSection.introduction && currentSection.introduction.trim()) {
        els.sectionIntro.textContent = currentSection.introduction;
        els.sectionIntro.style.display = 'block';
      } else {
        els.sectionIntro.textContent = '';
        els.sectionIntro.style.display = 'none';
      }
    }

    // Update Category Visibility dropdown action label
    if (els.categoryToggleVisLabel) {
      const isVis = currentSection.is_active !== false;
      els.categoryToggleVisLabel.textContent = isVis ? 'Hide Category' : 'Show Category';
    }

    // Update Category Reorder buttons (disable if at boundaries)
    const secIdx = state.sections.findIndex(s => (s.id || s.slug) === state.activeSectionId);
    if (els.categoryMoveUpBtn) {
      els.categoryMoveUpBtn.disabled = secIdx <= 0;
      els.categoryMoveUpBtn.style.opacity = secIdx <= 0 ? '0.4' : '1';
    }
    if (els.categoryMoveDownBtn) {
      els.categoryMoveDownBtn.disabled = secIdx >= state.sections.length - 1;
      els.categoryMoveDownBtn.style.opacity = secIdx >= state.sections.length - 1 ? '0.4' : '1';
    }

    // Render Group Sub-tabs
    renderGroupTabs(currentSection);

    // Filter Items
    let itemsToDisplay = [];
    const groups = currentSection.groups || [];

    groups.forEach(g => {
      const groupKey = g.id || g.slug;
      if (!state.activeGroupId || state.activeGroupId === groupKey) {
        (g.items || []).forEach(item => {
          itemsToDisplay.push({
            ...item,
            _groupTitle: g.title,
            _groupId: groupKey,
            _groupObj: g
          });
        });
      }
    });

    // Apply Search Filter if any
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase().trim();
      itemsToDisplay = itemsToDisplay.filter(i => 
        (i.name && i.name.toLowerCase().includes(q)) ||
        (i.description && i.description.toLowerCase().includes(q)) ||
        (i.badge && i.badge.toLowerCase().includes(q))
      );
    }

    if (els.toolbarItemsCount) {
      els.toolbarItemsCount.textContent = `${itemsToDisplay.length} menu item${itemsToDisplay.length === 1 ? '' : 's'}`;
    }

    renderItemsTable(itemsToDisplay, currentSection);
  }

  /**
   * Render Group Sub-tabs
   */
  function renderGroupTabs(section) {
    if (!els.groupTabs) return;
    const groups = section.groups || [];

    if (groups.length <= 1) {
      els.groupTabs.innerHTML = '';
      els.groupTabs.style.display = 'none';
      return;
    }

    els.groupTabs.style.display = 'flex';

    let html = `
      <button type="button" class="group-tab-btn ${state.activeGroupId === null ? 'active' : ''}" data-group="all">
        All Subsections (${groups.reduce((acc, g) => acc + (g.items || []).length, 0)})
      </button>
    `;

    groups.forEach(g => {
      const gKey = g.id || g.slug;
      const isAct = state.activeGroupId === gKey;
      const count = (g.items || []).length;
      html += `
        <button type="button" class="group-tab-btn ${isAct ? 'active' : ''}" data-group="${escapeHtml(gKey)}">
          ${escapeHtml(g.title)} (${count})
        </button>
      `;
    });

    els.groupTabs.innerHTML = html;

    els.groupTabs.querySelectorAll('.group-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetGroup = btn.getAttribute('data-group');
        state.activeGroupId = targetGroup === 'all' ? null : targetGroup;
        renderCurrentSection();
      });
    });
  }

  /**
   * Render Items Table (Desktop Table + Mobile Cards)
   */
  function renderItemsTable(items, currentSection) {
    if (els.itemsTableBody) els.itemsTableBody.innerHTML = '';
    if (els.itemsCardsMobile) els.itemsCardsMobile.innerHTML = '';

    if (items.length === 0) {
      if (els.emptyState) {
        els.emptyState.style.display = 'flex';
        if (state.searchQuery.trim()) {
          if (els.emptyStateTitle) els.emptyStateTitle.textContent = 'No matching items found';
          if (els.emptyStateDesc) els.emptyStateDesc.textContent = `No items found matching "${state.searchQuery}". Try clearing your search keyword.`;
          if (els.emptyAddItemBtn) els.emptyAddItemBtn.style.display = 'none';
        } else {
          if (els.emptyStateTitle) els.emptyStateTitle.textContent = 'No items in this category yet';
          if (els.emptyStateDesc) els.emptyStateDesc.textContent = 'Add your first menu item to start building this category.';
          if (els.emptyAddItemBtn) els.emptyAddItemBtn.style.display = 'inline-flex';
        }
      }
      return;
    }

    if (els.emptyState) els.emptyState.style.display = 'none';

    items.forEach((item, index) => {
      const isFirst = index === 0;
      const isLast = index === items.length - 1;

      const priceDisplay = item.price !== null && item.price !== undefined
        ? `<span class="price-text">${escapeHtml(item.price)} ${escapeHtml(item.currency || 'LE')}</span>`
        : `<span class="no-price-pill">No price set</span>`;

      const badgeDisplay = item.badge
        ? `<span class="item-badge-pill">${escapeHtml(item.badge)}</span>`
        : '';

      const descDisplay = item.description
        ? `<span class="item-desc-text">${escapeHtml(item.description)}</span>`
        : '';

      // ─── 1. Desktop Table Row (>= 768px) ───
      if (els.itemsTableBody) {
        const tr = document.createElement('tr');
        tr.className = `item-row ${item.is_active ? 'is-active' : 'is-hidden'}`;
        tr.innerHTML = `
          <td style="width: 54px; text-align: center;">
            <div class="reorder-controls">
              <button type="button" class="btn-icon-move" data-action="up" title="Move Up" ${isFirst ? 'disabled' : ''}>▲</button>
              <button type="button" class="btn-icon-move" data-action="down" title="Move Down" ${isLast ? 'disabled' : ''}>▼</button>
            </div>
          </td>
          <td style="width: 46px; text-align: center; color: var(--warm-mid); font-size: 0.8rem;">
            #${item.sort_order || (index + 1)}
          </td>
          <td>
            <div class="item-title-cell">
              <span>${escapeHtml(item.name)}</span>
              ${badgeDisplay}
            </div>
            ${descDisplay}
            ${currentSection.groups.length > 1 ? `<div style="font-size: 0.72rem; color: var(--caramel); margin-top: 2px;">📂 ${escapeHtml(item._groupTitle)}</div>` : ''}
          </td>
          <td style="white-space: nowrap;">
            ${priceDisplay}
          </td>
          <td style="width: 110px; text-align: center;">
            <label class="switch" title="${item.is_active ? 'Visible on menu' : 'Hidden from menu'}">
              <input type="checkbox" class="visibility-toggle" ${item.is_active ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
          </td>
          <td style="width: 140px; text-align: right;">
            <div class="row-actions">
              <button type="button" class="btn btn-secondary btn-sm edit-btn" title="Edit Item">
                ✏️ Edit
              </button>
              <button type="button" class="btn btn-danger btn-sm delete-btn" title="Delete Item">
                🗑️
              </button>
            </div>
          </td>
        `;

        // Row listeners
        const upBtn = tr.querySelector('[data-action="up"]');
        if (upBtn) upBtn.addEventListener('click', () => handleReorder(item, items, -1));

        const downBtn = tr.querySelector('[data-action="down"]');
        if (downBtn) downBtn.addEventListener('click', () => handleReorder(item, items, 1));

        const toggle = tr.querySelector('.visibility-toggle');
        if (toggle) toggle.addEventListener('change', () => handleToggleVisibility(item, toggle.checked));

        const editBtn = tr.querySelector('.edit-btn');
        if (editBtn) editBtn.addEventListener('click', () => openItemModal(item, currentSection));

        const deleteBtn = tr.querySelector('.delete-btn');
        if (deleteBtn) deleteBtn.addEventListener('click', () => openDeleteModal(item));

        els.itemsTableBody.appendChild(tr);
      }

      // ─── 2. Mobile Card View (< 768px) ───
      if (els.itemsCardsMobile) {
        const card = document.createElement('div');
        card.className = `item-mobile-card ${item.is_active ? '' : 'is-hidden'}`;
        card.innerHTML = `
          <div class="item-card-top">
            <div>
              <div class="item-card-title-group">
                <span class="item-card-name">${escapeHtml(item.name)}</span>
                ${badgeDisplay}
              </div>
              ${descDisplay ? `<div class="item-card-desc">${escapeHtml(item.description)}</div>` : ''}
              ${currentSection.groups.length > 1 ? `<div class="item-card-subgroup">📂 ${escapeHtml(item._groupTitle)}</div>` : ''}
            </div>
            <div class="item-card-price">
              ${priceDisplay}
            </div>
          </div>

          <div class="item-card-bottom">
            <label class="item-card-toggle" title="${item.is_active ? 'Visible on menu' : 'Hidden from menu'}">
              <input type="checkbox" class="mobile-visibility-toggle" ${item.is_active ? 'checked' : ''}>
              <span class="toggle-slider"></span>
              <span class="toggle-label">${item.is_active ? 'Visible' : 'Hidden'}</span>
            </label>

            <div class="item-card-actions">
              <div class="card-reorder">
                <button type="button" class="btn-icon-move" data-action="up" title="Move Up" ${isFirst ? 'disabled' : ''}>▲</button>
                <button type="button" class="btn-icon-move" data-action="down" title="Move Down" ${isLast ? 'disabled' : ''}>▼</button>
              </div>
              <button type="button" class="btn btn-secondary btn-sm mobile-edit-btn" title="Edit Item">
                ✏️ Edit
              </button>
              <button type="button" class="btn btn-danger btn-sm mobile-delete-btn" title="Delete Item">
                🗑️
              </button>
            </div>
          </div>
        `;

        // Card listeners
        const mUpBtn = card.querySelector('[data-action="up"]');
        if (mUpBtn) mUpBtn.addEventListener('click', () => handleReorder(item, items, -1));

        const mDownBtn = card.querySelector('[data-action="down"]');
        if (mDownBtn) mDownBtn.addEventListener('click', () => handleReorder(item, items, 1));

        const mToggle = card.querySelector('.mobile-visibility-toggle');
        if (mToggle) mToggle.addEventListener('change', () => handleToggleVisibility(item, mToggle.checked));

        const mEditBtn = card.querySelector('.mobile-edit-btn');
        if (mEditBtn) mEditBtn.addEventListener('click', () => openItemModal(item, currentSection));

        const mDeleteBtn = card.querySelector('.mobile-delete-btn');
        if (mDeleteBtn) mDeleteBtn.addEventListener('click', () => openDeleteModal(item));

        els.itemsCardsMobile.appendChild(card);
      }
    });
  }

  /**
   * Visibility Toggle Handler
   */
  async function handleToggleVisibility(item, isChecked) {
    item.is_active = isChecked;
    const client = window.RollDipSupabase ? window.RollDipSupabase.getClient() : null;

    if (!client) {
      showToast(`Item visibility set to ${isChecked ? 'Visible' : 'Hidden'} (local)`, 'info');
      renderCurrentSection();
      return;
    }

    try {
      const { error } = await client
        .from('menu_items')
        .update({ is_active: isChecked })
        .eq('id', item.id);

      if (error) throw error;
      showToast(`"${item.name}" is now ${isChecked ? 'visible' : 'hidden'} on public menu`, 'success');
      renderSectionsNav();
      renderCurrentSection();
    } catch (err) {
      console.error('[Admin] Error updating visibility:', err);
      showToast(`Failed to update visibility: ${err.message}`, 'error');
      // Rollback
      item.is_active = !isChecked;
      renderCurrentSection();
    }
  }

  /**
   * Reorder Handler
   */
  async function handleReorder(item, itemsList, direction) {
    const currentIndex = itemsList.indexOf(item);
    const targetIndex = currentIndex + direction;

    if (targetIndex < 0 || targetIndex >= itemsList.length) return;

    const targetItem = itemsList[targetIndex];

    // Swap sort orders
    const tempOrder = item.sort_order || (currentIndex + 1);
    item.sort_order = targetItem.sort_order || (targetIndex + 1);
    targetItem.sort_order = tempOrder;

    // Swap in array
    itemsList[currentIndex] = targetItem;
    itemsList[targetIndex] = item;

    renderCurrentSection();

    const client = window.RollDipSupabase ? window.RollDipSupabase.getClient() : null;
    if (!client) {
      showToast('Items reordered locally', 'info');
      return;
    }

    try {
      const updates = [
        client.from('menu_items').update({ sort_order: item.sort_order }).eq('id', item.id),
        client.from('menu_items').update({ sort_order: targetItem.sort_order }).eq('id', targetItem.id)
      ];
      const results = await Promise.all(updates);
      for (const res of results) {
        if (res.error) throw res.error;
      }
      showToast('Order saved to database', 'success');
    } catch (err) {
      console.error('[Admin] Error persisting reorder:', err);
      showToast(`Failed to save reorder: ${err.message}`, 'error');
      loadMenuData();
    }
  }

  /**
   * Search Input Handler
   */
  if (els.searchInput) {
    els.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderCurrentSection();
    });
  }

  /**
   * Open Add / Edit Modal
   */
  function openItemModal(item = null, currentSection = null) {
    state.editingItem = item;
    const isEdit = Boolean(item);

    if (els.itemModalTitle) {
      els.itemModalTitle.textContent = isEdit ? `Edit: ${item.name}` : 'Add New Menu Item';
    }

    // Populate Section dropdown
    if (els.itemSectionSelect) {
      els.itemSectionSelect.innerHTML = state.sections.map(s => {
        const sKey = s.id || s.slug;
        const sel = (item && item._groupObj && item._groupObj.section_id === s.id) || (!item && sKey === state.activeSectionId) ? 'selected' : '';
        return `<option value="${escapeHtml(sKey)}" ${sel}>${escapeHtml(s.section_number)} - ${escapeHtml(s.title_plain)}</option>`;
      }).join('');
    }

    updateGroupDropdown();

    if (isEdit) {
      els.itemNameInput.value = item.name || '';
      els.itemDescInput.value = item.description || '';
      if (item.price === null || item.price === undefined) {
        els.itemPriceInput.value = '';
        els.itemPriceInput.disabled = true;
        els.itemNoPriceCheck.checked = true;
      } else {
        els.itemPriceInput.value = item.price;
        els.itemPriceInput.disabled = false;
        els.itemNoPriceCheck.checked = false;
      }
      els.itemBadgeInput.value = item.badge || '';
      els.itemActiveCheck.checked = item.is_active !== false;
    } else {
      els.itemNameInput.value = '';
      els.itemDescInput.value = '';
      els.itemPriceInput.value = '';
      els.itemPriceInput.disabled = false;
      els.itemNoPriceCheck.checked = false;
      els.itemBadgeInput.value = '';
      els.itemActiveCheck.checked = true;
    }

    openModal(els.itemModal);
    setTimeout(() => els.itemNameInput && els.itemNameInput.focus(), 80);
  }

  function updateGroupDropdown() {
    if (!els.itemGroupSelect || !els.itemSectionSelect) return;
    const selectedSecKey = els.itemSectionSelect.value;
    const sec = state.sections.find(s => (s.id || s.slug) === selectedSecKey);
    const groups = (sec && sec.groups) || [];

    els.itemGroupSelect.innerHTML = groups.map(g => {
      const gKey = g.id || g.slug;
      const sel = (state.editingItem && state.editingItem.group_id === g.id) || (gKey === state.activeGroupId) ? 'selected' : '';
      return `<option value="${escapeHtml(gKey)}" ${sel}>${escapeHtml(g.title)}</option>`;
    }).join('');
  }

  if (els.itemSectionSelect) {
    els.itemSectionSelect.addEventListener('change', updateGroupDropdown);
  }

  if (els.itemNoPriceCheck) {
    els.itemNoPriceCheck.addEventListener('change', (e) => {
      if (e.target.checked) {
        els.itemPriceInput.value = '';
        els.itemPriceInput.disabled = true;
      } else {
        els.itemPriceInput.disabled = false;
      }
    });
  }

  function closeItemModal() {
    closeModal(els.itemModal);
    state.editingItem = null;
  }

  if (els.itemModalClose) els.itemModalClose.addEventListener('click', closeItemModal);
  if (els.itemModalCancel) els.itemModalCancel.addEventListener('click', closeItemModal);

  if (els.addItemBtn) {
    els.addItemBtn.addEventListener('click', () => openItemModal(null, null));
  }
  if (els.emptyAddItemBtn) {
    els.emptyAddItemBtn.addEventListener('click', () => openItemModal(null, null));
  }

  /**
   * Item Form Submit (Create / Update)
   */
  if (els.itemForm) {
    els.itemForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = els.itemNameInput.value.trim();
      const description = els.itemDescInput.value.trim() || null;
      const noPrice = els.itemNoPriceCheck.checked;
      const priceRaw = els.itemPriceInput.value.trim();
      const price = noPrice || priceRaw === '' ? null : parseFloat(priceRaw);
      const badge = els.itemBadgeInput.value.trim() || null;
      const isActive = els.itemActiveCheck.checked;
      const groupKey = els.itemGroupSelect.value;

      if (!name) {
        showToast('Please enter an item name', 'error');
        return;
      }

      const isEdit = Boolean(state.editingItem);
      const client = window.RollDipSupabase ? window.RollDipSupabase.getClient() : null;

      if (!client) {
        // Local mode fallback
        if (isEdit) {
          state.editingItem.name = name;
          state.editingItem.description = description;
          state.editingItem.price = price;
          state.editingItem.badge = badge;
          state.editingItem.is_active = isActive;
          showToast(`Updated "${name}" (local)`, 'success');
        } else {
          showToast(`Created "${name}" (local)`, 'success');
        }
        closeItemModal();
        renderCurrentSection();
        return;
      }

      try {
        if (isEdit) {
          const { error } = await client
            .from('menu_items')
            .update({
              name,
              description,
              price,
              badge,
              is_active: isActive,
              group_id: groupKey
            })
            .eq('id', state.editingItem.id);

          if (error) throw error;
          showToast(`"${name}" updated successfully!`, 'success');
        } else {
          // Get max sort_order
          const { data: maxItems } = await client
            .from('menu_items')
            .select('sort_order')
            .eq('group_id', groupKey)
            .order('sort_order', { ascending: false })
            .limit(1);

          const nextOrder = (maxItems && maxItems[0] && maxItems[0].sort_order ? maxItems[0].sort_order + 1 : 1);

          const { error } = await client
            .from('menu_items')
            .insert({
              group_id: groupKey,
              name,
              description,
              price,
              currency: 'LE',
              badge,
              is_active: isActive,
              sort_order: nextOrder
            });

          if (error) throw error;
          showToast(`"${name}" added to menu!`, 'success');
        }

        closeItemModal();
        await loadMenuData();
      } catch (err) {
        console.error('[Admin] Save item error:', err);
        showToast(`Save failed: ${err.message}`, 'error');
      }
    });
  }

  /**
   * Delete Modal
   */
  function openDeleteModal(item) {
    state.deletingItem = item;
    if (els.deleteItemName) {
      els.deleteItemName.textContent = item.name;
    }
    openModal(els.deleteModal);
  }

  function closeDeleteModal() {
    closeModal(els.deleteModal);
    state.deletingItem = null;
  }

  if (els.deleteModalClose) els.deleteModalClose.addEventListener('click', closeDeleteModal);
  if (els.deleteCancelBtn) els.deleteCancelBtn.addEventListener('click', closeDeleteModal);

  if (els.deleteConfirmBtn) {
    els.deleteConfirmBtn.addEventListener('click', async () => {
      if (!state.deletingItem) return;
      const item = state.deletingItem;
      const client = window.RollDipSupabase ? window.RollDipSupabase.getClient() : null;

      if (!client) {
        showToast(`Deleted "${item.name}" (local)`, 'info');
        closeDeleteModal();
        return;
      }

      try {
        const { error } = await client
          .from('menu_items')
          .delete()
          .eq('id', item.id);

        if (error) throw error;
        showToast(`"${item.name}" deleted from menu`, 'success');
        closeDeleteModal();
        await loadMenuData();
      } catch (err) {
        console.error('[Admin] Delete error:', err);
        showToast(`Delete failed: ${err.message}`, 'error');
      }
    });
  }

  /**
   * API Config Modal (Supabase Credentials setup helper)
   */
  function openConfigModal() {
    const config = window.RollDipSupabase ? window.RollDipSupabase.getConfig() : { url: '', anonKey: '' };
    if (els.configUrlInput) els.configUrlInput.value = config.url || '';
    if (els.configAnonInput) els.configAnonInput.value = config.anonKey || '';
    openModal(els.configModal);
  }

  function closeConfigModal() {
    closeModal(els.configModal);
  }

  if (els.configBtn) els.configBtn.addEventListener('click', openConfigModal);
  if (els.configPromptBtn) els.configPromptBtn.addEventListener('click', openConfigModal);
  if (els.configModalClose) els.configModalClose.addEventListener('click', closeConfigModal);
  if (els.configModalCancel) els.configModalCancel.addEventListener('click', closeConfigModal);

  if (els.configSaveBtn) {
    els.configSaveBtn.addEventListener('click', () => {
      const url = els.configUrlInput.value.trim();
      const anonKey = els.configAnonInput.value.trim();
      if (window.RollDipSupabase) {
        window.RollDipSupabase.saveConfig(url, anonKey);
        showToast('Supabase connection settings saved!', 'success');
        closeConfigModal();
        initAuth();
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CATEGORY MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  function generateCategorySlug(name, existingSections = []) {
    let base = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    if (!base) base = 'category';

    const existingSlugs = existingSections.map(s => (s.slug || '').toLowerCase());
    let slug = base;
    let counter = 2;
    while (existingSlugs.includes(slug)) {
      slug = `${base}-${counter}`;
      counter++;
    }
    return slug;
  }

  function getNextSectionNumber(sections = []) {
    let maxNum = 0;
    sections.forEach(s => {
      const num = parseInt(s.section_number, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    });
    const next = maxNum + 1;
    return next < 10 ? `0${next}` : String(next);
  }

  function getNextSortOrder(sections = []) {
    let maxOrder = 0;
    sections.forEach(s => {
      if (typeof s.sort_order === 'number' && s.sort_order > maxOrder) {
        maxOrder = s.sort_order;
      }
    });
    return maxOrder + 1;
  }

  function formatCategoryHeading(name) {
    const trimmed = (name || '').trim();
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) {
      return `<em>${escapeHtml(parts[0])}</em>`;
    }
    const first = parts.slice(0, -1).join(' ');
    const last = parts[parts.length - 1];
    return `${escapeHtml(first)}<br><em>${escapeHtml(last)}</em>`;
  }

  // 1. Add Category
  function openAddCategoryModal() {
    if (els.newCategoryName) els.newCategoryName.value = '';
    if (els.newCategoryTag) els.newCategoryTag.value = '';
    if (els.newCategoryIntro) els.newCategoryIntro.value = '';
    openModal(els.addCategoryModal);
    setTimeout(() => els.newCategoryName && els.newCategoryName.focus(), 80);
  }

  function closeAddCategoryModal() {
    closeModal(els.addCategoryModal);
  }

  if (els.addCategoryBtn) els.addCategoryBtn.addEventListener('click', openAddCategoryModal);
  if (els.addCategorySidebarBtn) els.addCategorySidebarBtn.addEventListener('click', openAddCategoryModal);
  if (els.addCategoryClose) els.addCategoryClose.addEventListener('click', closeAddCategoryModal);
  if (els.addCategoryCancel) els.addCategoryCancel.addEventListener('click', closeAddCategoryModal);

  if (els.addCategoryForm) {
    els.addCategoryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = (els.newCategoryName.value || '').trim();
      if (!name) return;
      const tag = (els.newCategoryTag.value || '').trim();
      const intro = (els.newCategoryIntro.value || '').trim();

      const client = window.RollDipSupabase ? window.RollDipSupabase.getClient() : null;
      if (!client) {
        showToast('Supabase client is not connected', 'error');
        return;
      }

      const submitBtn = els.addCategoryForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';
      }

      try {
        const slug = generateCategorySlug(name, state.sections);
        const sectionNumber = getNextSectionNumber(state.sections);
        const sortOrder = getNextSortOrder(state.sections);
        const heading = formatCategoryHeading(name);

        // 1. Insert section
        const { data: newSec, error: secErr } = await client
          .from('menu_sections')
          .insert({
            slug,
            section_number: sectionNumber,
            tag: tag || null,
            heading,
            title_plain: name,
            introduction: intro || null,
            layout_type: 'layout-balanced',
            card_classes: 'wide',
            sort_order: sortOrder,
            is_active: true
          })
          .select()
          .single();

        if (secErr) throw secErr;

        // 2. Insert default group
        const { data: newGrp, error: grpErr } = await client
          .from('menu_groups')
          .insert({
            section_id: newSec.id,
            slug: `${slug}-main`,
            title: name,
            subtitle: null,
            tag: null,
            display_type: 'regular',
            sort_order: 1,
            is_active: true
          })
          .select()
          .single();

        if (grpErr) throw grpErr;

        newSec.groups = [{ ...newGrp, items: [] }];
        state.sections.push(newSec);
        state.sections.sort((a, b) => a.sort_order - b.sort_order);
        state.activeSectionId = newSec.id;
        state.activeGroupId = null;

        closeAddCategoryModal();
        renderSectionsNav();
        renderCurrentSection();
        showToast(`Category "${name}" created successfully!`, 'success');
      } catch (err) {
        console.error('[Admin] Error creating category:', err);
        showToast(`Failed to create category: ${err.message}`, 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = '+ Create Category';
        }
      }
    });
  }

  // 2. Edit Category
  function openEditCategoryModal() {
    const currentSection = state.sections.find(s => (s.id || s.slug) === state.activeSectionId);
    if (!currentSection) return;

    if (els.editCategoryModalTitle) {
      els.editCategoryModalTitle.textContent = `Edit Category: ${currentSection.title_plain}`;
    }
    if (els.editCategoryName) els.editCategoryName.value = currentSection.title_plain || '';
    if (els.editCategoryTag) els.editCategoryTag.value = currentSection.tag || '';
    if (els.editCategoryIntro) els.editCategoryIntro.value = currentSection.introduction || '';

    openModal(els.editCategoryModal);
    setTimeout(() => els.editCategoryName && els.editCategoryName.focus(), 80);
  }

  function closeEditCategoryModal() {
    closeModal(els.editCategoryModal);
  }

  if (els.editCategoryBtn) {
    els.editCategoryBtn.addEventListener('click', () => {
      closeCategoryDropdown();
      openEditCategoryModal();
    });
  }
  if (els.editCategoryClose) els.editCategoryClose.addEventListener('click', closeEditCategoryModal);
  if (els.editCategoryCancel) els.editCategoryCancel.addEventListener('click', closeEditCategoryModal);

  if (els.editCategoryForm) {
    els.editCategoryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentSection = state.sections.find(s => (s.id || s.slug) === state.activeSectionId);
      if (!currentSection) return;

      const name = (els.editCategoryName.value || '').trim();
      if (!name) return;
      const tag = (els.editCategoryTag.value || '').trim();
      const intro = (els.editCategoryIntro.value || '').trim();

      const client = window.RollDipSupabase ? window.RollDipSupabase.getClient() : null;
      if (!client) {
        showToast('Supabase client is not connected', 'error');
        return;
      }

      const submitBtn = els.editCategoryForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
      }

      try {
        const heading = formatCategoryHeading(name);
        const { error } = await client
          .from('menu_sections')
          .update({
            title_plain: name,
            heading,
            tag: tag || null,
            introduction: intro || null
          })
          .eq('id', currentSection.id);

        if (error) throw error;

        currentSection.title_plain = name;
        currentSection.heading = heading;
        currentSection.tag = tag || null;
        currentSection.introduction = intro || null;

        closeEditCategoryModal();
        renderSectionsNav();
        renderCurrentSection();
        showToast(`Category "${name}" updated successfully!`, 'success');
      } catch (err) {
        console.error('[Admin] Error updating category:', err);
        showToast(`Failed to update category: ${err.message}`, 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Save Changes';
        }
      }
    });
  }

  // 3. Toggle Category Visibility
  if (els.categoryToggleVisBtn) {
    els.categoryToggleVisBtn.addEventListener('click', async () => {
      closeCategoryDropdown();
      const currentSection = state.sections.find(s => (s.id || s.slug) === state.activeSectionId);
      if (!currentSection) return;

      const client = window.RollDipSupabase ? window.RollDipSupabase.getClient() : null;
      if (!client) {
        showToast('Supabase client is not connected', 'error');
        return;
      }

      const newActive = currentSection.is_active === false ? true : false;
      els.categoryToggleVisBtn.disabled = true;

      try {
        const { error } = await client
          .from('menu_sections')
          .update({ is_active: newActive })
          .eq('id', currentSection.id);

        if (error) throw error;

        currentSection.is_active = newActive;
        renderSectionsNav();
        renderCurrentSection();
        showToast(`Category "${currentSection.title_plain}" is now ${newActive ? 'visible' : 'hidden'}`, 'success');
      } catch (err) {
        console.error('[Admin] Visibility toggle error:', err);
        showToast(`Failed to update visibility: ${err.message}`, 'error');
      } finally {
        els.categoryToggleVisBtn.disabled = false;
      }
    });
  }

  // 4. Reorder Category (Move Up / Down)
  async function moveCategory(direction) {
    closeCategoryDropdown();
    const idx = state.sections.findIndex(s => (s.id || s.slug) === state.activeSectionId);
    if (idx === -1) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= state.sections.length) return;

    const client = window.RollDipSupabase ? window.RollDipSupabase.getClient() : null;
    if (!client) {
      showToast('Supabase client is not connected', 'error');
      return;
    }

    const current = state.sections[idx];
    const target = state.sections[targetIdx];

    let currentOrder = current.sort_order;
    let targetOrder = target.sort_order;
    if (currentOrder === targetOrder) {
      currentOrder = direction > 0 ? targetOrder + 1 : targetOrder - 1;
    }

    try {
      if (els.categoryMoveUpBtn) els.categoryMoveUpBtn.disabled = true;
      if (els.categoryMoveDownBtn) els.categoryMoveDownBtn.disabled = true;

      const [res1, res2] = await Promise.all([
        client.from('menu_sections').update({ sort_order: targetOrder }).eq('id', current.id),
        client.from('menu_sections').update({ sort_order: currentOrder }).eq('id', target.id)
      ]);

      if (res1.error) throw res1.error;
      if (res2.error) throw res2.error;

      current.sort_order = targetOrder;
      target.sort_order = currentOrder;

      state.sections.sort((a, b) => a.sort_order - b.sort_order);

      renderSectionsNav();
      renderCurrentSection();
      showToast(`Category order updated`, 'success');
    } catch (err) {
      console.error('[Admin] Reorder error:', err);
      showToast(`Failed to reorder: ${err.message}`, 'error');
    } finally {
      const newIdx = state.sections.findIndex(s => (s.id || s.slug) === state.activeSectionId);
      if (els.categoryMoveUpBtn) {
        els.categoryMoveUpBtn.disabled = newIdx <= 0;
        els.categoryMoveUpBtn.style.opacity = newIdx <= 0 ? '0.4' : '1';
      }
      if (els.categoryMoveDownBtn) {
        els.categoryMoveDownBtn.disabled = newIdx >= state.sections.length - 1;
        els.categoryMoveDownBtn.style.opacity = newIdx >= state.sections.length - 1 ? '0.4' : '1';
      }
    }
  }

  if (els.categoryMoveUpBtn) els.categoryMoveUpBtn.addEventListener('click', () => moveCategory(-1));
  if (els.categoryMoveDownBtn) els.categoryMoveDownBtn.addEventListener('click', () => moveCategory(1));

  // 5. Delete Category
  let categoryPendingDelete = null;

  function openDeleteCategoryModal() {
    closeCategoryDropdown();
    const currentSection = state.sections.find(s => (s.id || s.slug) === state.activeSectionId);
    if (!currentSection) return;

    categoryPendingDelete = currentSection;

    let totalItems = 0;
    (currentSection.groups || []).forEach(g => {
      totalItems += (g.items || []).length;
    });

    if (totalItems > 0) {
      if (els.deleteCategoryBlocked) els.deleteCategoryBlocked.style.display = 'block';
      if (els.deleteCategoryBlockedMsg) {
        els.deleteCategoryBlockedMsg.textContent = `"${currentSection.title_plain}" contains ${totalItems} menu item(s). Remove or move these items before deleting this category.`;
      }
      if (els.deleteCategoryAllowed) els.deleteCategoryAllowed.style.display = 'none';
      if (els.deleteCategoryConfirm) els.deleteCategoryConfirm.style.display = 'none';
    } else {
      if (els.deleteCategoryBlocked) els.deleteCategoryBlocked.style.display = 'none';
      if (els.deleteCategoryAllowed) els.deleteCategoryAllowed.style.display = 'block';
      if (els.deleteCategoryTargetName) {
        els.deleteCategoryTargetName.textContent = `"${currentSection.title_plain}"`;
      }
      if (els.deleteCategoryConfirm) els.deleteCategoryConfirm.style.display = 'inline-block';
    }

    openModal(els.deleteCategoryModal);
  }

  function closeDeleteCategoryModal() {
    closeModal(els.deleteCategoryModal);
    categoryPendingDelete = null;
  }

  if (els.deleteCategoryBtn) els.deleteCategoryBtn.addEventListener('click', openDeleteCategoryModal);
  if (els.deleteCategoryClose) els.deleteCategoryClose.addEventListener('click', closeDeleteCategoryModal);
  if (els.deleteCategoryCancel) els.deleteCategoryCancel.addEventListener('click', closeDeleteCategoryModal);

  if (els.deleteCategoryConfirm) {
    els.deleteCategoryConfirm.addEventListener('click', async () => {
      if (!categoryPendingDelete) return;

      const client = window.RollDipSupabase ? window.RollDipSupabase.getClient() : null;
      if (!client) {
        showToast('Supabase client is not connected', 'error');
        return;
      }

      els.deleteCategoryConfirm.disabled = true;
      els.deleteCategoryConfirm.textContent = 'Deleting...';

      try {
        const { error } = await client
          .from('menu_sections')
          .delete()
          .eq('id', categoryPendingDelete.id);

        if (error) throw error;

        const deletedTitle = categoryPendingDelete.title_plain;
        state.sections = state.sections.filter(s => s.id !== categoryPendingDelete.id);
        closeDeleteCategoryModal();

        if (state.sections.length > 0) {
          state.activeSectionId = state.sections[0].id || state.sections[0].slug;
        } else {
          state.activeSectionId = null;
        }
        state.activeGroupId = null;

        renderSectionsNav();
        renderCurrentSection();
        showToast(`Category "${deletedTitle}" deleted successfully`, 'success');
      } catch (err) {
        console.error('[Admin] Error deleting category:', err);
        showToast(`Failed to delete category: ${err.message}`, 'error');
      } finally {
        if (els.deleteCategoryConfirm) {
          els.deleteCategoryConfirm.disabled = false;
          els.deleteCategoryConfirm.textContent = 'Delete Category';
        }
      }
    });
  }

  // Initialization
  document.addEventListener('DOMContentLoaded', () => {
    initAuth();
  });
})();
