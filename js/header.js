/* ==========================================================================
   header.js — page title sync, user switcher, notification menu
   ========================================================================== */
(function (global) {
  'use strict';
  const { qs, qsa, initials } = VP.util;

  const TITLES = {
    catalogue: { eyebrow: 'Reports', title: 'Report Catalogue' },
    builder: { eyebrow: 'Report Builder', title: 'Create New Report' },
    centre: { eyebrow: 'Operations', title: 'Reports Centre' },
  };

  function setTitle(viewKey) {
    const meta = TITLES[viewKey] || { eyebrow: '', title: '' };
    const eyebrowEl = qs('#headerEyebrow');
    const titleEl = qs('#headerTitle');
    if (eyebrowEl) eyebrowEl.textContent = meta.eyebrow;
    if (titleEl) titleEl.textContent = meta.title;
  }

  function init() {
    const userSelect = qs('#currentUserSelect');
    if (userSelect) {
      VP.data.USERS.forEach((u) => {
        const opt = document.createElement('option');
        opt.value = u; opt.textContent = u;
        userSelect.appendChild(opt);
      });
      userSelect.value = 'Ragul K';
      userSelect.addEventListener('change', () => setCurrentUser(userSelect.value));
    }
    setCurrentUser('Ragul K', { silent: true });

    const notifBtn = qs('#notifBtn');
    if (notifBtn) {
      notifBtn.addEventListener('click', () => {
        VP.ui.toast('info', 'Notifications', 'You are caught up — no new alerts.');
      });
    }

    const signOutBtn = qs('#signOutBtn');
    if (signOutBtn && VP.auth) {
      signOutBtn.addEventListener('click', () => VP.auth.signOut());
    }

    const mobileTrigger = qs('#mobileNavTrigger');
    if (mobileTrigger) {
      mobileTrigger.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>';
    }
  }

  function setCurrentUser(name, opts) {
    const avatar = qs('#profileAvatar');
    const nameEl = qs('#profileName');
    if (avatar) avatar.textContent = initials(name);
    if (nameEl) nameEl.textContent = name;
    if (!(opts && opts.silent)) {
      VP.ui.toast('success', 'Switched user', 'Now acting as ' + name + '.');
    }
  }

  global.VP = global.VP || {};
  global.VP.header = { init, setTitle, setCurrentUser };
})(window);
