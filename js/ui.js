/* ==========================================================================
   ui.js — view renderers: Report Catalogue, Reports Centre
   ========================================================================== */
(function (global) {
  'use strict';
  const { qs, qsa, el, escapeHtml, initials, formatDate, formatDateTime, formatNumber } = VP.util;

  const state = {
    catalogueTab: 'public',
    catalogueSearch: '',
    filters: { rail: '', category: '', region: '', frequency: '', author: '' },
    centrePage: { core: 1, template: 1 },
    pageSize: 6,
  };

  /* ---------------- Report Catalogue ---------------- */

  function initCatalogue() {
    const search = qs('#catalogueSearch');
    if (search) search.addEventListener('input', VP.util.debounce(() => { state.catalogueSearch = search.value.toLowerCase(); renderCatalogue(); }, 150));

    ['rail', 'category', 'region', 'frequency', 'author'].forEach((key) => {
      const sel = qs('#filter-' + key);
      if (sel) sel.addEventListener('change', () => { state.filters[key] = sel.value; renderCatalogue(); });
    });

    qsa('.tab-btn[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.catalogueTab = btn.getAttribute('data-tab');
        qsa('.tab-btn[data-tab]').forEach((b) => {
          const on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', String(on));
        });
        renderCatalogue();
      });
    });

    const clearBtn = qs('#btnClearFilters');
    if (clearBtn) clearBtn.addEventListener('click', () => {
      state.filters = { rail: '', category: '', region: '', frequency: '', author: '' };
      state.catalogueSearch = '';
      if (search) search.value = '';
      Object.keys(state.filters).forEach((key) => {
        const sel = qs('#filter-' + key);
        if (sel) sel.value = '';
      });
      renderCatalogue();
      VP.ui.toast('info', 'Filters cleared', 'Showing all reports in this tab.');
    });

    const createBtn = qs('#btnCreateReport');
    if (createBtn) createBtn.addEventListener('click', () => VP.app.goToCreateReport());

    // Dismiss any open card menu on outside click or Escape
    document.addEventListener('click', closeAllCardMenus);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllCardMenus();
    });

    renderCatalogue();
  }

  function reportMatches(r) {
    const f = state.filters;
    if (state.catalogueTab === 'public' && r.visibility !== 'public') return false;
    if (state.catalogueTab === 'private' && r.visibility !== 'private') return false;
    if (state.catalogueSearch && !(r.reportName.toLowerCase().includes(state.catalogueSearch) || r.id.toLowerCase().includes(state.catalogueSearch))) return false;
    if (f.rail && r.paymentRail !== f.rail) return false;
    if (f.category && r.category !== f.category) return false;
    if (f.region && r.region !== f.region) return false;
    if (f.frequency && r.frequency !== f.frequency) return false;
    if (f.author && r.author !== f.author) return false;
    return true;
  }

  function statusBadge(status) {
    const map = { published: 'badge-success', draft: 'badge-neutral' };
    return `<span class="badge ${map[status] || 'badge-neutral'}">${escapeHtml(status)}</span>`;
  }

  function renderCatalogue() {
    const grid = qs('#catalogueGrid');
    if (!grid) return;
    const results = VP.data.REPORTS.filter(reportMatches);
    const countEl = qs('#catalogueResultCount');
    if (countEl) countEl.textContent = results.length + (results.length === 1 ? ' report' : ' reports');

    if (!results.length) {
      grid.innerHTML = '';
      grid.appendChild(emptyState('search', 'No reports match your filters', 'Try adjusting the rail, category, or search term — or create a new report from scratch.'));
      return;
    }

    grid.innerHTML = results.map((r) => `
      <article class="report-card" tabindex="0" role="button" aria-label="Open ${escapeHtml(r.reportName)}" data-report-id="${r.id}">
        <div class="report-card-top">
          <span class="report-card-id">${escapeHtml(r.id)}</span>
          <div class="report-card-top-right">
            ${statusBadge(r.reportStatus)}
            <button class="card-kebab" type="button" aria-haspopup="menu" aria-expanded="false"
                    aria-label="More actions for ${escapeHtml(r.reportName)}" data-kebab="${r.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>
            </button>
            <div class="menu card-menu" role="menu" data-menu-for="${r.id}">
              <button class="menu-item" role="menuitem" data-action="clone" data-report-id="${r.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Clone
              </button>
              <button class="menu-item" role="menuitem" data-action="export" data-report-id="${r.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export JSON
              </button>
              <div class="menu-divider"></div>
              <button class="menu-item is-danger" role="menuitem" data-action="delete" data-report-id="${r.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Delete
              </button>
            </div>
          </div>
        </div>
        <div class="report-card-title">${escapeHtml(r.reportName)}</div>
        <div class="report-card-desc">${escapeHtml(r.description)}</div>
        <dl class="report-card-specs">
          <div><dt>Rail</dt><dd>${escapeHtml(r.paymentRail)}</dd></div>
           <div><dt>Region</dt><dd>${escapeHtml(r.region)}</dd></div>
        </dl>
        <div class="report-card-meta">
          <span class="badge badge-gold">${escapeHtml(r.category)}</span>
        </div>
        <div class="report-card-footer">
          <span class="report-card-author"><span class="author-chip">${initials(r.author)}</span>${escapeHtml(r.author)}</span>
          <span class="report-card-version">v${escapeHtml(r.version)} · ${formatDate(r.updatedAt)}</span>
        </div>
        <span class="report-card-cta" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </span>
      </article>
    `).join('');

    qsa('.report-card', grid).forEach((card) => {
      const openCard = () => {
        const report = VP.data.REPORTS.find((r) => r.id === card.getAttribute('data-report-id'));
        if (!report) return;
        qs('#runModalReportName').textContent = report.reportName;
        VP.modal.open('runReportModal');
      };
      card.addEventListener('click', (e) => {
        // Clicks inside the kebab menu must not trigger the card itself
        if (e.target.closest('.card-kebab') || e.target.closest('.card-menu')) return;
        openCard();
      });
      card.addEventListener('keydown', (e) => {
        if (e.target !== card) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCard(); }
      });
    });

    wireCardMenus(grid);
  }

  /* ---------------- Card kebab menus ---------------- */

  function closeAllCardMenus() {
    qsa('.card-menu.is-open').forEach((m) => m.classList.remove('is-open'));
    qsa('.card-kebab[aria-expanded="true"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    qsa('.report-card.has-open-menu').forEach((c) => c.classList.remove('has-open-menu'));
  }

  function wireCardMenus(scope) {
    qsa('[data-kebab]', scope).forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.report-card');
        const menu = card.querySelector('.card-menu');
        const wasOpen = menu.classList.contains('is-open');
        closeAllCardMenus();
        if (!wasOpen) {
          menu.classList.add('is-open');
          card.classList.add('has-open-menu');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    qsa('.card-menu [data-action]', scope).forEach((item) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = item.getAttribute('data-action');
        const report = VP.data.REPORTS.find((r) => r.id === item.getAttribute('data-report-id'));
        closeAllCardMenus();
        if (!report) return;
        if (action === 'clone') cloneReport(report);
        if (action === 'export') exportReportJson(report);
        if (action === 'delete') deleteReport(report);
      });
    });
  }

  /** Clone opens the builder pre-seeded from the source report. */
  function cloneReport(report) {
    VP.app.goToCreateReport({
      name: 'Copy of ' + report.reportName,
      datasetName: report.dataset,
    });
    VP.ui.toast('success', 'Report cloned', 'Editing a copy of "' + report.reportName + '".');
  }

  function exportReportJson(report) {
    try {
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = report.id + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      VP.ui.toast('success', 'Exported', report.id + '.json has downloaded.');
    } catch (err) {
      VP.ui.toast('error', 'Export failed', 'Could not export this report definition.');
    }
  }

  function deleteReport(report) {
    const idx = VP.data.REPORTS.findIndex((r) => r.id === report.id);
    if (idx === -1) return;
    VP.data.REPORTS.splice(idx, 1);
    renderCatalogue();
    VP.ui.toast('error', 'Report deleted', '"' + report.reportName + '" was removed from the catalogue.');
  }

  function emptyState(iconKey, title, desc) {
    const icons = {
      search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
      inbox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
    };
    return el('div', { class: 'empty-state' }, [
      el('div', { class: 'empty-state-icon', html: icons[iconKey] || icons.inbox }),
      el('h3', {}, [title]),
      el('p', {}, [desc]),
    ]);
  }

  /* ---------------- Reports Centre ---------------- */

  function initCentre() {
    const refreshBtn = qs('#btnRefreshCentre');
    if (refreshBtn) refreshBtn.addEventListener('click', () => {
      refreshBtn.querySelector('svg')?.classList.add('spin');
      setTimeout(() => {
        refreshBtn.querySelector('svg')?.classList.remove('spin');
        renderCentre();
        VP.ui.toast('success', 'Refreshed', 'Execution list updated.');
      }, 500);
    });
    qsa('[data-accordion-toggle]').forEach((header) => {
      header.addEventListener('click', () => header.closest('.accordion-item').classList.toggle('is-open'));
    });
    renderCentre();
  }

  function statusPill(status) {
    return `<span class="status-pill status-${status}">${escapeHtml(VP.util.titleCase(status))}</span>`;
  }

  function renderExecTable(tbodyId, rows, page, onPage) {
    const tbody = qs('#' + tbodyId);
    if (!tbody) return;
    const pageRows = VP.util.paginate(rows, page, state.pageSize);
    if (!pageRows.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state" style="padding:32px 0;"><div class="empty-state-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-6l-2 3h-4l-2-3H2"/></svg></div><h3>No executions</h3><p>Runs will appear here once a report is executed.</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = pageRows.map((r) => `
      <tr>
        <td class="cell-mono">${escapeHtml(r.jobId)}</td>
        <td class="cell-strong">${escapeHtml(r.reportName)}</td>
        <td>${statusPill(r.status)}</td>
        <td><div class="mini-progress"><span style="width:${r.progress}%"></span></div></td>
        <td>${formatDateTime(r.startedAt)}</td>
        <td>${r.durationSec}s</td>
       <td>
                            <div style="display: flex; gap: 8px;">
                                <button class="icon-btn" onclick="window.appToast.show('Downloading CSV...', 'info')" title="Download CSV" fdprocessedid="ak9xab"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="download" aria-hidden="true" class="lucide lucide-download"><path d="M12 15V3"></path><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m7 10 5 5 5-5"></path></svg></button>
                                <button class="icon-btn" fdprocessedid="1ivtjp"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="file-text" aria-hidden="true" class="lucide lucide-file-text"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path><path d="M14 2v5a1 1 0 0 0 1 1h5"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg></button>
                            </div>
                        </td>
      </tr>
    `).join('');
  }

  function renderCentre() {
    const core = VP.data.EXECUTIONS_CORE;
    const tmpl = VP.data.EXECUTIONS_TEMPLATE;
    const all = core.concat(tmpl);
    const counts = {
      running: all.filter((r) => r.status === 'running').length,
      queued: all.filter((r) => r.status === 'queued').length,
      completed: all.filter((r) => r.status === 'completed').length,
      failed: all.filter((r) => r.status === 'failed').length,
    };
    ['running', 'queued', 'completed', 'failed'].forEach((k) => {
      const node = qs('#stat-' + k);
      if (node) node.textContent = formatNumber(counts[k]);
    });

    renderExecTable('centreCoreBody', core, state.centrePage.core);
    renderExecTable('centreTemplateBody', tmpl, state.centrePage.template);

    if (global.VP.chart) {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const runsPerDay = days.map((_, i) => 4 + Math.floor(((i * 37 + 11) % 13)));
      VP.chart.barChart('centreVolumeChart', days, runsPerDay);
      VP.chart.lineChart('centreSlaChart', days, days.map((_, i) => 92 + ((i * 3) % 8)));
    }
  }

  global.VP = global.VP || {};
  global.VP.ui = Object.assign(global.VP.ui || {}, {
    initCatalogue, renderCatalogue, initCentre, renderCentre, emptyState, statusPill,
  });
})(window);
