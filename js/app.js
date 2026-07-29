/* ==========================================================================
   app.js — application bootstrap + view router (hash-based navigation)
   ========================================================================== */
(function (global) {
  'use strict';
  const { qs, qsa } = VP.util;

  const VIEWS = ['catalogue', 'builder', 'centre'];
  let currentView = null;

  function switchView(key, opts) {
    opts = opts || {};
    if (VIEWS.indexOf(key) === -1) key = 'catalogue';
    currentView = key;

    VIEWS.forEach((v) => {
      const node = qs('#view-' + v);
      if (!node) return;
      const isTarget = v === key;
      node.classList.toggle('is-active', isTarget && v !== 'builder');
      node.classList.toggle('is-flex-active', isTarget && v === 'builder');
    });

    // The builder owns its own internal scrolling; other views scroll the page.
    const scroller = qs('#mainContent');
    if (scroller) {
      scroller.classList.toggle('no-pad', key === 'builder');
      scroller.scrollTop = 0;
    }

    VP.header.setTitle(key);

    if (key === 'centre') VP.ui.renderCentre();
    if (key === 'catalogue') VP.ui.renderCatalogue();

    if (!opts.skipHash) {
      const hash = '#/' + key;
      if (global.location.hash !== hash) {
        global.history.replaceState(null, '', hash);
      }
    }

    if (window.lucide) window.lucide.createIcons();
  }

  /**
   * Single entry point for "Create Report":
   * resets the wizard, routes to the builder view, and moves the sidebar
   * highlight onto Report Builder > Create Report.
   *
   * @param {{name?: string, datasetName?: string}} [seed]
   *        Optional starting values — used by "Clone" on a catalogue card.
   */
  function goToCreateReport(seed) {
    VP.wizard.startNew(seed);
    switchView('builder');
    VP.sidebar.gotoCreateReport();
    VP.sidebar.closeMobileDrawer();
  }

  function routeFromHash() {
    const key = (global.location.hash || '').replace('#/', '');
    if (VIEWS.indexOf(key) !== -1) {
      switchView(key, { skipHash: true });
      VP.sidebar.setActive(key === 'builder'
        ? qs('.nav-subitem[data-nav-view="builder"]')
        : key);
      return true;
    }
    return false;
  }

  function init() {
    VP.sidebar.init();
    VP.header.init();
    VP.modal.init();
    VP.ui.initCatalogue();
    VP.ui.initCentre();
    VP.wizard.init();

    if (!routeFromHash()) {
      switchView('catalogue');
      VP.sidebar.setActive('catalogue');
    }

    global.addEventListener('hashchange', routeFromHash);

    if (window.lucide) window.lucide.createIcons();
    VP.ui.toast('success', 'Welcome back', 'VPI Lite loaded successfully.');
  }

  document.addEventListener('DOMContentLoaded', init);

  global.VP = global.VP || {};
  global.VP.app = { switchView, goToCreateReport, getView: () => currentView };
})(window);
