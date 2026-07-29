/* ==========================================================================
   modal.js — accessible modal/dialog controller + toast notifications
   ========================================================================== */
(function (global) {
  'use strict';
  const { qs, qsa, el } = VP.util;

  let lastFocused = null;

  function open(id) {
    const overlay = qs('#' + id);
    if (!overlay) return;
    lastFocused = document.activeElement;
    overlay.classList.add('is-open');
    const dialog = overlay.querySelector('.modal');
    if (dialog) {
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      const focusable = dialog.querySelector('input, select, textarea, button');
      if (focusable) focusable.focus();
    }
    document.addEventListener('keydown', escHandler);
  }

  function close(id) {
    const overlay = qs('#' + id);
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.removeEventListener('keydown', escHandler);
    if (lastFocused) lastFocused.focus();
  }

  function escHandler(e) {
    if (e.key === 'Escape') {
      qsa('.modal-overlay.is-open').forEach((o) => close(o.id));
    }
  }

  function init() {
    qsa('.modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close(overlay.id);
      });
    });
    qsa('[data-modal-close]').forEach((btn) => {
      btn.addEventListener('click', () => close(btn.getAttribute('data-modal-close') || btn.closest('.modal-overlay').id));
    });
    qsa('[data-modal-open]').forEach((btn) => {
      btn.addEventListener('click', () => open(btn.getAttribute('data-modal-open')));
    });
  }

  /* ---------------- Toasts ---------------- */
  const ICONS = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  };

  function toast(type, title, message) {
    let stack = qs('#toastStack');
    if (!stack) {
      stack = el('div', { id: 'toastStack', class: 'toast-stack', role: 'status', 'aria-live': 'polite' });
      document.body.appendChild(stack);
    }
    const node = el('div', { class: 'toast is-' + type }, [
      el('span', { class: 'toast-icon', html: ICONS[type] || ICONS.info }),
      el('div', { class: 'toast-body' }, [
        el('div', { class: 'toast-title' }, [title]),
        message ? el('div', { class: 'toast-msg' }, [message]) : null,
      ]),
      el('button', { class: 'toast-close', 'aria-label': 'Dismiss notification', onClick: () => node.remove() }, ['×']),
    ]);
    stack.appendChild(node);
    setTimeout(() => { if (node.parentNode) node.remove(); }, 5000);
  }

  global.VP = global.VP || {};
  global.VP.modal = { init, open, close };
  global.VP.ui = global.VP.ui || {};
  global.VP.ui.toast = toast;
})(window);
