/* ==========================================================================
   auth.js — demo session guard
   Runs before the app boots. Fails open if storage is unavailable so the
   app is never unreachable (e.g. restrictive file:// contexts).
   ========================================================================== */
(function (global) {
  'use strict';

  const KEY = 'vpi.session';

  function read() {
    try {
      const raw = sessionStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return undefined; // storage unavailable — treat as "cannot determine"
    }
  }

  function requireSession() {
    const session = read();
    if (session === undefined) return null;   // storage blocked: allow through
    if (!session) {
      global.location.replace('login.html');
      return null;
    }
    return session;
  }

  function signOut() {
    try { sessionStorage.removeItem(KEY); } catch (err) { /* no-op */ }
    global.location.href = 'login.html';
  }

  const session = requireSession();

  global.VP = global.VP || {};
  global.VP.auth = { session, signOut, read };
})(window);
