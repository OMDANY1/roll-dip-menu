/**
 * ROLL & DIP — SUPABASE CLIENT & DATA ACCESS LAYER
 */

(function () {
  'use strict';

  // Config keys
  const STORAGE_KEY_URL = 'ROLL_DIP_SUPABASE_URL';
  const STORAGE_KEY_ANON = 'ROLL_DIP_SUPABASE_ANON_KEY';

  // Retrieve configured URL and Anon key
  function getConfig() {
    const envUrl = window.ENV && window.ENV.SUPABASE_URL;
    const envAnon = window.ENV && window.ENV.SUPABASE_ANON_KEY;

    const storedUrl = localStorage.getItem(STORAGE_KEY_URL);
    const storedAnon = localStorage.getItem(STORAGE_KEY_ANON);

    const url = (envUrl || storedUrl || '').trim();
    const anonKey = (envAnon || storedAnon || '').trim();

    return { url, anonKey, isConfigured: Boolean(url && anonKey) };
  }

  let clientInstance = null;

  function initClient() {
    const config = getConfig();
    if (!config.isConfigured) {
      return null;
    }

    if (window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        clientInstance = window.supabase.createClient(config.url, config.anonKey);
        return clientInstance;
      } catch (err) {
        console.warn('[Roll&Dip] Failed to initialize Supabase client:', err);
        return null;
      }
    }
    return null;
  }

  function getClient() {
    if (!clientInstance) {
      clientInstance = initClient();
    }
    return clientInstance;
  }

  /**
   * Fetch public active menu data from Supabase
   */
  async function fetchPublicMenu() {
    const client = getClient();
    if (!client) {
      // Fall back to embedded seed data
      return window.ROLL_DIP_SEED_DATA || [];
    }

    try {
      // Query sections
      const { data: sections, error: secErr } = await client
        .from('menu_sections')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (secErr || !sections || sections.length === 0) {
        console.warn('[Roll&Dip] Supabase sections query returned empty or error, using fallback:', secErr);
        return window.ROLL_DIP_SEED_DATA || [];
      }

      // Query groups
      const { data: groups, error: grpErr } = await client
        .from('menu_groups')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (grpErr) {
        console.warn('[Roll&Dip] Supabase groups query error, using fallback:', grpErr);
        return window.ROLL_DIP_SEED_DATA || [];
      }

      // Query items
      const { data: items, error: itemErr } = await client
        .from('menu_items')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (itemErr) {
        console.warn('[Roll&Dip] Supabase items query error, using fallback:', itemErr);
        return window.ROLL_DIP_SEED_DATA || [];
      }

      // Assemble nested hierarchy
      const assembled = sections.map(sec => {
        const secGroups = (groups || [])
          .filter(g => g.section_id === sec.id)
          .map(grp => {
            const grpItems = (items || [])
              .filter(i => i.group_id === grp.id);
            return { ...grp, items: grpItems };
          });

        return { ...sec, groups: secGroups };
      });

      return assembled;
    } catch (err) {
      console.error('[Roll&Dip] Error fetching public menu from Supabase:', err);
      return window.ROLL_DIP_SEED_DATA || [];
    }
  }

  /**
   * Fetch complete menu data for Admin Dashboard (includes inactive items/groups/sections)
   */
  async function fetchAdminMenu() {
    const client = getClient();
    if (!client) {
      throw new Error('Supabase client is not configured.');
    }

    const { data: sections, error: secErr } = await client
      .from('menu_sections')
      .select('*')
      .order('sort_order', { ascending: true });

    if (secErr) throw secErr;

    const { data: groups, error: grpErr } = await client
      .from('menu_groups')
      .select('*')
      .order('sort_order', { ascending: true });

    if (grpErr) throw grpErr;

    const { data: items, error: itemErr } = await client
      .from('menu_items')
      .select('*')
      .order('sort_order', { ascending: true });

    if (itemErr) throw itemErr;

    // Assemble nested hierarchy
    return sections.map(sec => {
      const secGroups = (groups || [])
        .filter(g => g.section_id === sec.id)
        .map(grp => {
          const grpItems = (items || [])
            .filter(i => i.group_id === grp.id);
          return { ...grp, items: grpItems };
        });

      return { ...sec, groups: secGroups };
    });
  }

  function saveConfig(url, anonKey) {
    if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
    else localStorage.removeItem(STORAGE_KEY_URL);

    if (anonKey) localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
    else localStorage.removeItem(STORAGE_KEY_ANON);

    clientInstance = null;
    return initClient();
  }

  function clearConfig() {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON);
    clientInstance = null;
  }

  // Export to window
  window.RollDipSupabase = {
    getConfig,
    getClient,
    initClient,
    fetchPublicMenu,
    fetchAdminMenu,
    saveConfig,
    clearConfig
  };
})();
