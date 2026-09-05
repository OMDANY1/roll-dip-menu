/**
 * ROLL & DIP — PUBLIC MENU APPLICATION
 * Handles dynamic rendering, layout templates, and scroll animations.
 */

(function () {
  'use strict';

  const menuContainer = document.getElementById('main-menu');
  let sectionObserver = null;
  let listObserver = null;
  let navObserver = null;

  /**
   * Escape HTML entities to prevent XSS
   */
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
   * Render single item
   */
  function renderItem(item, isPairing) {
    if (isPairing) {
      const priceHtml = item.price !== null ? `<span class="item-price">${escapeHtml(item.price)} ${escapeHtml(item.currency || 'LE')}</span>` : '';
      const symbol = item.badge || '♡';
      return `
        <div class="pairing-card">
          <span class="pairing-symbol" aria-hidden="true">${escapeHtml(symbol)}</span>
          <span class="pairing-name">${escapeHtml(item.name)} ${priceHtml}</span>
        </div>
      `;
    }

    const priceHtml = item.price !== null ? `<span class="item-price">${escapeHtml(item.price)} ${escapeHtml(item.currency || 'LE')}</span>` : '';
    const badgeHtml = item.badge ? `<span class="item-tag">${escapeHtml(item.badge)}</span>` : '';
    const descHtml = item.description ? `<span class="item-desc">${escapeHtml(item.description)}</span>` : '';

    return `
      <li>
        <span class="item-name-group">
          ${escapeHtml(item.name)}${badgeHtml}${descHtml}
        </span>
        ${priceHtml}
      </li>
    `;
  }

  /**
   * Render Section HTML
   */
  function renderSection(section) {
    const layout = section.layout_type || 'layout-left';
    const cardClasses = section.card_classes ? ` ${section.card_classes}` : ' wide';
    const sectionNum = section.section_number || '';
    const tag = section.tag || '';
    const heading = section.heading || escapeHtml(section.title_plain);
    const intro = section.introduction || '';

    let contentHtml = '';

    if (layout === 'layout-split') {
      // Split layout: Group 1 on left, Group 2 on right
      const leftGroup = (section.groups && section.groups[0]) || { items: [] };
      const rightGroup = (section.groups && section.groups[1]) || { items: [] };

      const leftItemsHtml = leftGroup.items.map(i => renderItem(i, false)).join('');
      const rightItemsHtml = rightGroup.items.map(i => renderItem(i, false)).join('');

      contentHtml = `
        <div class="panel-left">
          <div class="section-meta">
            ${tag ? `<span class="section-tag">${escapeHtml(tag)}</span>` : ''}
            ${sectionNum ? `<span class="section-number">${escapeHtml(sectionNum)}</span>` : ''}
          </div>
          <h2 class="section-heading" id="heading-${escapeHtml(section.slug)}">${heading}</h2>
          ${intro ? `<p class="menu-intro">${escapeHtml(intro)}</p>` : ''}
          <div class="divider" aria-hidden="true">
            <div class="divider-line"></div>
            <div class="divider-dot"></div>
            <div class="divider-line" style="max-width:20px"></div>
          </div>
          <ul class="item-list">
            ${leftItemsHtml}
          </ul>
        </div>
        <div class="panel-right">
          ${rightGroup.tag ? `<span class="section-tag">${escapeHtml(rightGroup.tag)}</span>` : ''}
          ${rightGroup.subtitle || rightGroup.title ? `<p class="split-heading">${escapeHtml(rightGroup.subtitle || rightGroup.title)}</p>` : ''}
          <ul class="item-list">
            ${rightItemsHtml}
          </ul>
        </div>
      `;
    } else if (layout === 'layout-right') {
      // Pairing layout (Better Together)
      const group = (section.groups && section.groups[0]) || { items: [] };
      const pairingsHtml = group.items.map(i => renderItem(i, true)).join('');

      contentHtml = `
        <div class="section-meta">
          ${tag ? `<span class="section-tag">${escapeHtml(tag)}</span>` : ''}
          ${sectionNum ? `<span class="section-number">${escapeHtml(sectionNum)}</span>` : ''}
        </div>
        <h2 class="section-heading" id="heading-${escapeHtml(section.slug)}">${heading}</h2>
        ${intro ? `<p class="menu-intro">${escapeHtml(intro)}</p>` : ''}
        <div class="divider" aria-hidden="true">
          <div class="divider-line"></div>
          <div class="divider-dot"></div>
          <div class="divider-line" style="max-width:30px"></div>
        </div>
        ${pairingsHtml}
      `;
    } else if (layout === 'layout-center') {
      // Center cards layout (Mini Rolls, Warm Cups)
      const group = (section.groups && section.groups[0]) || { items: [] };
      const itemsHtml = group.items.map(i => renderItem(i, false)).join('');

      contentHtml = `
        <div class="section-meta">
          ${tag ? `<span class="section-tag">${escapeHtml(tag)}</span>` : ''}
          ${sectionNum ? `<span class="section-number">${escapeHtml(sectionNum)}</span>` : ''}
        </div>
        <h2 class="section-heading" id="heading-${escapeHtml(section.slug)}">${heading}</h2>
        ${intro ? `<p class="menu-intro">${escapeHtml(intro)}</p>` : ''}
        <div class="divider" aria-hidden="true">
          <div class="divider-line"></div>
          <div class="divider-dot"></div>
          <div class="divider-dot" style="opacity:0.4"></div>
          <div class="divider-dot"></div>
          <div class="divider-line"></div>
        </div>
        <ul class="item-list">
          ${itemsHtml}
        </ul>
      `;
    } else {
      // layout-left or layout-balanced
      const groups = section.groups || [];
      const mainGroup = groups[0] || { items: [], display_type: 'two-column' };
      const subGroup = groups[1]; // e.g. Frappes in Cold Cups

      const isTwoCol = mainGroup.display_type === 'two-column' ? ' two-column' : '';
      const itemsHtml = mainGroup.items.map(i => renderItem(i, false)).join('');

      let subGroupHtml = '';
      if (subGroup && subGroup.items && subGroup.items.length > 0) {
        const subItemsSpans = subGroup.items.map(i => {
          const priceHtml = i.price !== null ? `<span class="item-price">${escapeHtml(i.price)} ${escapeHtml(i.currency || 'LE')}</span>` : '';
          return `<span>${escapeHtml(i.name)} ${priceHtml}</span>`;
        }).join('');

        subGroupHtml = `
          <div class="sub-group">
            <span class="sub-group-label">${escapeHtml(subGroup.title)}</span>
            <div class="sub-items">
              ${subItemsSpans}
            </div>
          </div>
        `;
      }

      contentHtml = `
        <div class="section-meta">
          ${tag ? `<span class="section-tag">${escapeHtml(tag)}</span>` : ''}
          ${sectionNum ? `<span class="section-number">${escapeHtml(sectionNum)}</span>` : ''}
        </div>
        <h2 class="section-heading" id="heading-${escapeHtml(section.slug)}">${heading}</h2>
        ${intro ? `<p class="menu-intro">${escapeHtml(intro)}</p>` : ''}
        <div class="divider" aria-hidden="true">
          <div class="divider-line"></div>
          <div class="divider-dot"></div>
          <div class="divider-line" style="max-width:20px"></div>
          <div class="divider-dot"></div>
        </div>
        <ul class="item-list${isTwoCol}">
          ${itemsHtml}
        </ul>
        ${subGroupHtml}
      `;
    }

    return `
      <section id="${escapeHtml(section.slug)}" class="menu-section ${escapeHtml(layout)}" aria-labelledby="heading-${escapeHtml(section.slug)}">
        <div class="arch-panel${cardClasses}">
          ${contentHtml}
        </div>
      </section>
    `;
  }

  /**
   * Navigation label mapping for signature sections with clean fallback for new categories
   */
  const NAV_LABELS = {
    'freshly-rolled': 'Rolls',
    'mini-rolls': 'Mini Rolls',
    'sweet-bites': 'Bites & Extras',
    'better-together': 'Pairings',
    'warm-cups': 'Warm Cups',
    'sparkling-cups': 'Sparkling',
    'cold-cups': 'Cold Cups',
    'milkshakes': 'Shakes'
  };

  function getNavLabel(section) {
    if (NAV_LABELS[section.slug]) return NAV_LABELS[section.slug];
    return section.title_plain || (section.heading ? section.heading.replace(/<[^>]+>/g, '').trim() : section.slug);
  }

  /**
   * Render dynamic navigation links
   */
  function renderNav(sections) {
    const navLinksContainer = document.querySelector('.nav-links');
    if (!navLinksContainer || !sections || sections.length === 0) return;

    const navHtml = sections
      .filter(s => s.is_active !== false)
      .map(s => `<li><a href="#${escapeHtml(s.slug)}">${escapeHtml(getNavLabel(s))}</a></li>`)
      .join('');
    navLinksContainer.innerHTML = navHtml;
  }

  /**
   * Render all menu sections into DOM
   */
  function renderMenu(sections) {
    if (!menuContainer || !sections || sections.length === 0) return;

    const activeSections = sections.filter(s => s.is_active !== false);
    const html = activeSections.map(renderSection).join('');
    menuContainer.innerHTML = html;

    // Render dynamic navigation matching current active categories & order
    renderNav(activeSections);

    // Attach animations & scroll observer tracking
    attachObservers();
  }

  /**
   * Attach IntersectionObservers for smooth reveal & nav tracking
   */
  function attachObservers() {
    // Clean up previous observers if any
    if (sectionObserver) sectionObserver.disconnect();
    if (listObserver) listObserver.disconnect();
    if (navObserver) navObserver.disconnect();

    const sections = document.querySelectorAll('.menu-section');

    // 1. Section reveal
    sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          sectionObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    sections.forEach(s => sectionObserver.observe(s));

    // 2. Stagger child list items on reveal
    listObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const items = entry.target.querySelectorAll('.item-list li, .pairing-card');
          items.forEach((item, i) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(10px)';
            item.style.transition = `opacity 0.5s ${i * 0.06}s ease, transform 0.5s ${i * 0.06}s ease`;
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'translateY(0)';
            }, 80 + i * 60);
          });
          listObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    sections.forEach(s => listObserver.observe(s));

    // 3. Smooth active nav highlight
    const navLinks = document.querySelectorAll('.nav-links a');
    navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => link.removeAttribute('style'));
          const id = entry.target.id;
          const active = document.querySelector(`.nav-links a[href="#${id}"]`);
          if (active) active.style.color = 'var(--chocolate)';
        }
      });
    }, { threshold: 0.35 });

    sections.forEach(s => navObserver.observe(s));
  }

  /**
   * Main Initialization
   */
  async function init() {
    // 1. Render immediate fallback dataset (zero flash/shift)
    const initialData = window.ROLL_DIP_SEED_DATA || [];
    renderMenu(initialData);

    // 2. In background, fetch fresh data from Supabase if connected
    if (window.RollDipSupabase) {
      try {
        const liveData = await window.RollDipSupabase.fetchPublicMenu();
        if (liveData && liveData.length > 0) {
          renderMenu(liveData);
        }
      } catch (err) {
        console.warn('[Roll&Dip] Using cached menu dataset:', err);
      }
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
