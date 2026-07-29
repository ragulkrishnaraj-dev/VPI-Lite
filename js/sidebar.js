/* ==========================================================================
   sidebar.js — navigation, collapse rail, submenu flyout, mobile drawer
   ========================================================================== */
(function (global) {
  'use strict';
  const { qs, qsa } = VP.util;

  let collapsed = false;

  function init() {
    // Primary nav items
    qsa('[data-nav-view]').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-nav-view');
        if (view === 'builder') {
          // "Create Report" always starts a clean builder session
          VP.app.goToCreateReport();
          return;
        }
        VP.app.switchView(view);
        setActive(item);
        closeMobileDrawer();
      });
    });

    // Expand / collapse the Report Builder group
    qsa('[data-nav-toggle-group]').forEach((toggle) => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        if (collapsed) return; // flyout handles this in rail mode
        toggle.closest('.nav-item-group').classList.toggle('is-open');
      });
    });

    const collapseBtn = qs('#sidebarCollapseBtn');
    if (collapseBtn) collapseBtn.addEventListener('click', toggleCollapse);

    const mobileTrigger = qs('#mobileNavTrigger');
    if (mobileTrigger) mobileTrigger.addEventListener('click', openMobileDrawer);

    const scrim = qs('#sidebarScrim');
    if (scrim) scrim.addEventListener('click', closeMobileDrawer);

    // Close mobile drawer with Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileDrawer();
    });
  }

  function toggleCollapse() {
    collapsed = !collapsed;
    const shell = qs('.app-shell');
    shell.classList.toggle('is-collapsed', collapsed);
    const btn = qs('#sidebarCollapseBtn');
    if (btn) {
      btn.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
      btn.setAttribute('aria-expanded', String(!collapsed));
    }
    const sidebar = qs('.sidebar');
    if (sidebar) sidebar.setAttribute('data-collapsed', String(collapsed));
  }

  /**
   * Highlight a nav destination.
   * Accepts either a DOM node or a view key string ('catalogue' | 'builder' | 'centre').
   */
  function setActive(target) {
    qsa('.nav-item').forEach((n) => n.classList.remove('is-active'));
    qsa('.nav-subitem').forEach((n) => n.classList.remove('is-active'));

    let node = target;
    if (typeof target === 'string') {
      node = qs('[data-nav-view="' + target + '"]');
    }
    if (!node) return;

    node.classList.add('is-active');

    // If the destination lives inside a group (e.g. Report Builder > Create Report),
    // open the group and light up the parent entry too.
    const group = node.closest('.nav-item-group');
    if (group) {
      group.classList.add('is-open');
      const parent = group.querySelector('[data-nav-toggle-group]');
      if (parent) parent.classList.add('is-active');
    }
  }

  /** Navigate to the builder and reflect it in the sidebar. */
  function gotoCreateReport() {
    const subitem = qs('.nav-subitem[data-nav-view="builder"]');
    setActive(subitem || 'builder');
  }

  function openMobileDrawer() {
    qs('.sidebar').classList.add('is-open');
    qs('#sidebarScrim').classList.add('is-open');
  }

  function closeMobileDrawer() {
    const sb = qs('.sidebar');
    const scrim = qs('#sidebarScrim');
    if (sb) sb.classList.remove('is-open');
    if (scrim) scrim.classList.remove('is-open');
  }

  global.VP = global.VP || {};
  global.VP.sidebar = { init, setActive, toggleCollapse, gotoCreateReport, closeMobileDrawer };
})(window);
