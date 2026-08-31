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
    sectionsNav: document.getElementById('sections-nav'),
    groupTabs: document.getElementById('group-tabs'),
    sectionTitle: document.getElementById('section-title'),
    sectionMeta: document.getElementById('section-meta'),
    searchInput: document.getElementById('search-input'),
    addItemBtn: document.getElementById('add-item-btn'),
    itemsTableBody: document.getElementById('items-table-body'),
    emptyState: document.getElementById('empty-state'),
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
    deleteModal: document.getElementById('delete-modal'),
    deleteItemName: document.getElementById('delete-item-name'),
    deleteConfirmBtn: document.getElementById('delete-confirm-btn'),
    deleteCancelBtn: document.getElementById('delete-cancel-btn'),
    deleteModalClose: document.getElementById('delete-modal-close'),
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
  }

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
   * Render Section Navigation Tabs
   */
  function renderSectionsNav() {
    if (!els.sectionsNav) return;
    els.sectionsNav.innerHTML = '';

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

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `section-tab-btn ${isActive ? 'active' : ''}`;
      btn.innerHTML = `
        <span class="tab-num">${escapeHtml(sec.section_number)}</span>
        <span>${escapeHtml(sec.title_plain)}</span>
        <span class="tab-count">${activeItems}/${totalItems}</span>
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
    if (!currentSection) return;

    // Header info
    if (els.sectionTitle) {
      els.sectionTitle.textContent = currentSection.title_plain;
    }
    if (els.sectionMeta) {
      const tag = currentSection.tag ? `[${currentSection.tag}] ` : '';
      const layout = `Layout: ${currentSection.layout_type || 'default'}`;
      els.sectionMeta.textContent = `${tag}Section ${currentSection.section_number} • ${layout}`;
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
      return;
    }

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
   * Render Items Table
   */
  function renderItemsTable(items, currentSection) {
    if (!els.itemsTableBody) return;
    els.itemsTableBody.innerHTML = '';

    if (items.length === 0) {
      if (els.emptyState) els.emptyState.style.display = 'block';
      return;
    }

    if (els.emptyState) els.emptyState.style.display = 'none';

    items.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.className = `item-row ${item.is_active ? 'is-active' : 'is-hidden'}`;

      const priceDisplay = item.price !== null && item.price !== undefined
        ? `<span class="price-text">${escapeHtml(item.price)} ${escapeHtml(item.currency || 'LE')}</span>`
        : `<span class="no-price-pill">No price set</span>`;

      const badgeDisplay = item.badge
        ? `<span class="item-badge-pill">${escapeHtml(item.badge)}</span>`
        : '';

      const descDisplay = item.description
        ? `<span class="item-desc-text">${escapeHtml(item.description)}</span>`
        : '';

      const isFirst = index === 0;
      const isLast = index === items.length - 1;

      tr.innerHTML = `
        <td style="width: 50px; text-align: center;">
          <div class="reorder-controls">
            <button type="button" class="btn-icon-move" data-action="up" title="Move Up" ${isFirst ? 'disabled' : ''}>▲</button>
            <button type="button" class="btn-icon-move" data-action="down" title="Move Down" ${isLast ? 'disabled' : ''}>▼</button>
          </div>
        </td>
        <td style="width: 45px; text-align: center; color: var(--warm-mid); font-size: 0.8rem;">
          #${item.sort_order || (index + 1)}
        </td>
        <td>
          <div class="item-title-cell">
            <span>${escapeHtml(item.name)}</span>
            ${badgeDisplay}
          </div>
          ${descDisplay}
          ${currentSection.groups.length > 1 ? `<div style="font-size: 0.7rem; color: var(--caramel); margin-top: 2px;">📂 ${escapeHtml(item._groupTitle)}</div>` : ''}
        </td>
        <td style="white-space: nowrap;">
          ${priceDisplay}
        </td>
        <td style="width: 90px; text-align: center;">
          <label class="switch" title="${item.is_active ? 'Visible on menu' : 'Hidden from menu'}">
            <input type="checkbox" class="visibility-toggle" ${item.is_active ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </td>
        <td style="width: 140px;">
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

      // Event Listeners for Row Actions
      // 1. Move Up
      const upBtn = tr.querySelector('[data-action="up"]');
      if (upBtn) {
        upBtn.addEventListener('click', () => handleReorder(item, items, -1));
      }

      // 2. Move Down
      const downBtn = tr.querySelector('[data-action="down"]');
      if (downBtn) {
        downBtn.addEventListener('click', () => handleReorder(item, items, 1));
      }

      // 3. Visibility Toggle
      const toggle = tr.querySelector('.visibility-toggle');
      if (toggle) {
        toggle.addEventListener('change', () => handleToggleVisibility(item, toggle.checked));
      }

      // 4. Edit
      const editBtn = tr.querySelector('.edit-btn');
      if (editBtn) {
        editBtn.addEventListener('click', () => openItemModal(item, currentSection));
      }

      // 5. Delete
      const deleteBtn = tr.querySelector('.delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => openDeleteModal(item));
      }

      els.itemsTableBody.appendChild(tr);
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

    els.itemModal.classList.add('show');
    els.itemNameInput.focus();
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
    if (els.itemModal) els.itemModal.classList.remove('show');
    state.editingItem = null;
  }

  if (els.itemModalClose) els.itemModalClose.addEventListener('click', closeItemModal);
  if (els.itemModalCancel) els.itemModalCancel.addEventListener('click', closeItemModal);

  if (els.addItemBtn) {
    els.addItemBtn.addEventListener('click', () => openItemModal(null, null));
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
    if (els.deleteModal) {
      els.deleteModal.classList.add('show');
    }
  }

  function closeDeleteModal() {
    if (els.deleteModal) els.deleteModal.classList.remove('show');
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
    if (els.configModal) {
      const config = window.RollDipSupabase ? window.RollDipSupabase.getConfig() : { url: '', anonKey: '' };
      if (els.configUrlInput) els.configUrlInput.value = config.url || '';
      if (els.configAnonInput) els.configAnonInput.value = config.anonKey || '';
      els.configModal.classList.add('show');
    }
  }

  function closeConfigModal() {
    if (els.configModal) els.configModal.classList.remove('show');
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

  // Initialization
  document.addEventListener('DOMContentLoaded', () => {
    initAuth();
  });
})();
