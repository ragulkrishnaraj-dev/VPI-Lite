/* ==========================================================================
   wizard.js — Report Builder: multi-step wizard state + rendering
   Steps: 1 Select Fields, 3 Filters, 4 Conditions, 6 Calculations,
          7 Scheduling, 8 Preview  →  then the Generated Report success state.
   ========================================================================== */
(function (global) {
  'use strict';
  const { qs, qsa, el, escapeHtml } = VP.util;

  const STEPS = [1, 3, 4, 6, 7, 8];
  const STEP_LABELS = {
    1: 'Select Fields (DB)',
    3: 'Filters',
    4: 'Conditions',
    6: 'Summary & Calculations',
    7: 'Scheduling',
    8: 'Preview',
  };

  /* ---------------- Inline icon set ---------------- */
  const ICON = {
    database: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  };

  let builder = freshBuilder();

  function freshBuilder() {
    return {
      mode: 'core',
      currentStep: 1,
      reportName: '',
      access: 'private',
      sources: [],       // [{id, name, allFields, fields:[selected names]}]
      filters: [],       // [{field, operator, value}]
      conditions: [],    // [{field, operator, value}]
      calculations: [],  // [{label, type, field}]
      schedule: { type: 'Ad Hoc', frequency: 'Daily', format: 'PDF', delivery: 'Download', retention: '30 days' },
    };
  }

  /**
   * Reset the builder to a clean slate.
   * @param {{name?: string, datasetName?: string}} [seed] optional starting values (used by Clone)
   */
  function startNew(seed) {
    builder = freshBuilder();
    showWizard();

    if (seed && seed.datasetName) {
      const match = VP.data.DATA_SOURCES.find((d) => d.name === seed.datasetName);
      if (match) addSourceSilently(match.id);
    }
    if (seed && seed.name) builder.reportName = seed.name;

    const nameInput = qs('#reportNameInput');
    if (nameInput) nameInput.value = builder.reportName;
    const accessSelect = qs('#reportAccessSelect');
    if (accessSelect) accessSelect.value = builder.access;

    renderStepRail();
    setStep(1);

    if (!seed) {
      VP.ui.toast('info', 'New report started', 'Pick a data source to begin building your report.');
    }
  }

  function totalSelectedFields() {
    return builder.sources.reduce((sum, s) => sum + s.fields.length, 0);
  }

  function allSelectedFields() {
    return builder.sources.flatMap((s) => s.fields);
  }

  /* ---------------- Wizard vs. success panel ---------------- */

  function showWizard() {
    const body = qs('#builderBody');
    const success = qs('#builderSuccess');
    const bottom = qs('#builderBottomBar');
    const top = qs('#builderTop');
    if (body) body.style.display = 'flex';
    if (top) top.style.display = 'flex';
    if (bottom) bottom.style.display = 'flex';
    if (success) success.style.display = 'none';
  }

  function showSuccess(reportName) {
    const body = qs('#builderBody');
    const success = qs('#builderSuccess');
    const bottom = qs('#builderBottomBar');
    const top = qs('#builderTop');
    if (body) body.style.display = 'none';
    if (top) top.style.display = 'none';
    if (bottom) bottom.style.display = 'none';
    if (!success) return;
    success.style.display = 'flex';
    const nameEl = qs('#successReportName');
    if (nameEl) nameEl.textContent = reportName;
  }

  /* ---------------- Step rail + navigation ---------------- */

  function renderStepRail() {
    const rail = qs('#stepRail');
    if (!rail) return;
    const activeIdx = STEPS.indexOf(builder.currentStep);
    rail.innerHTML = STEPS.map((step, i) => `
      <li class="step-rail-item ${builder.currentStep === step ? 'is-active' : ''} ${activeIdx > i ? 'is-complete' : ''}"
          data-step="${step}" role="button" tabindex="0">
        <span class="step-index">${activeIdx > i ? '✓' : i + 1}</span>
        <span class="nav-label">${STEP_LABELS[step]}</span>
      </li>
    `).join('');
    qsa('.step-rail-item', rail).forEach((item) => {
      const go = () => setStep(Number(item.getAttribute('data-step')));
      item.addEventListener('click', go);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
      });
    });
  }

  function setStep(step) {
    builder.currentStep = step;
    qsa('.wizard-panel').forEach((panel) => { panel.style.display = 'none'; });
    const active = qs('#step-' + step + '-panel');
    if (active) active.style.display = 'flex';

    renderStepRail();
    renderStepContent(step);
    updateBottomBar();

    const badge = qs('#builderModeBadge');
    if (badge) badge.textContent = STEP_LABELS[step];

    const isLast = STEPS.indexOf(step) === STEPS.length - 1;
    const prevBtn = qs('#btnPrevStep');
    const nextBtn = qs('#btnNextStep');
    const genBtn = qs('#btnGenerateReport');

    if (prevBtn) prevBtn.disabled = STEPS.indexOf(step) === 0;
    if (nextBtn) nextBtn.style.display = isLast ? 'none' : 'inline-flex';
    // The Generate Report action only appears once every step has been visited.
    if (genBtn) genBtn.style.display = isLast ? 'inline-flex' : 'none';
  }

  function nextStep() {
    const idx = STEPS.indexOf(builder.currentStep);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  }

  function prevStep() {
    const idx = STEPS.indexOf(builder.currentStep);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }

  function renderStepContent(step) {
    if (step === 1) renderStep1();
    if (step === 3) renderStep3();
    if (step === 4) renderStep4();
    if (step === 6) renderStep6();
    if (step === 7) renderStep7();
    if (step === 8) renderStep8();
  }

  /* ---------------- Step 1: Select Fields ---------------- */

  function addSourceSilently(sourceId) {
    const def = VP.data.DATA_SOURCES.find((d) => d.id === sourceId);
    if (!def || builder.sources.find((s) => s.id === sourceId)) return;
    builder.sources.push({ id: def.id, name: def.name, allFields: def.fields, fields: [] });
  }

  function addSource(sourceId) {
    addSourceSilently(sourceId);
    renderStep1();
  }

  function removeSource(sourceId) {
    const source = builder.sources.find((s) => s.id === sourceId);
    builder.sources = builder.sources.filter((s) => s.id !== sourceId);
    renderStep1();
    if (source) VP.ui.toast('info', 'Data source removed', source.name + ' and its fields were cleared.');
  }

  function toggleField(sourceId, field) {
    const source = builder.sources.find((s) => s.id === sourceId);
    if (!source) return;
    const idx = source.fields.indexOf(field);
    if (idx >= 0) source.fields.splice(idx, 1); else source.fields.push(field);
    renderStep1();
  }

  function clearAllFields() {
    builder.sources.forEach((s) => { s.fields = []; });
    renderStep1();
    VP.ui.toast('info', 'Selection cleared', 'All selected fields were removed.');
  }

  function renderStep1() {
    const picker = qs('#dataSourcePicker');
    const selectedWrap = qs('#selectedFieldsList');
    const countEl = qs('#selectedFieldsCount');
    if (!picker || !selectedWrap) return;

    const unadded = VP.data.DATA_SOURCES.filter((d) => !builder.sources.find((s) => s.id === d.id));

    const sourceMarkup = builder.sources.map((s) => `
      <section class="source-card" data-source="${s.id}">
        <header class="source-card-head">
          <span class="source-card-title">
            <span class="source-card-icon" aria-hidden="true">${ICON.database}</span>
            ${escapeHtml(s.name)}
          </span>
          <span class="source-card-tools">
            <span class="source-card-count">${s.fields.length}/${s.allFields.length}</span>
            <button type="button" class="icon-action is-danger" data-remove-source="${s.id}"
                    data-tooltip="Remove data source" aria-label="Remove data source ${escapeHtml(s.name)}">
              ${ICON.trash}
            </button>
          </span>
        </header>
        <ul class="field-pill-list">
          ${s.allFields.map((f) => {
            const on = s.fields.includes(f);
            return `
            <li>
              <button type="button" class="field-pill ${on ? 'is-selected' : ''}"
                      data-toggle-field="${s.id}::${escapeHtml(f)}"
                      aria-pressed="${on}">
                <span class="field-pill-state" aria-hidden="true">${on ? ICON.check : ICON.plus}</span>
                <span class="field-pill-name">${escapeHtml(f)}</span>
              </button>
            </li>`;
          }).join('')}
        </ul>
      </section>
    `).join('');

    const adderMarkup = unadded.length ? `
      <div class="field-group" style="margin-bottom:0;">
        <label class="field-label" for="addSourceSelect">Add a data source</label>
        <select class="input" id="addSourceSelect">
          <option value="">Choose data source…</option>
          ${unadded.map((d) => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join('')}
        </select>
        <span class="field-help">Sources contribute their own set of selectable fields.</span>
      </div>
    ` : '<p class="field-help">All available data sources have been added.</p>';

    picker.innerHTML = sourceMarkup + adderMarkup;

    qsa('[data-remove-source]', picker).forEach((b) => {
      b.addEventListener('click', () => removeSource(b.getAttribute('data-remove-source')));
    });
    qsa('[data-toggle-field]', picker).forEach((b) => {
      b.addEventListener('click', () => {
        const raw = b.getAttribute('data-toggle-field');
        const sep = raw.indexOf('::');
        toggleField(raw.slice(0, sep), raw.slice(sep + 2));
      });
    });
    const addSel = qs('#addSourceSelect', picker);
    if (addSel) addSel.addEventListener('change', () => { if (addSel.value) addSource(addSel.value); });

    // Right pane: the running selection
    const flat = builder.sources.flatMap((s) => s.fields.map((f) => ({ source: s.name, field: f, sourceId: s.id })));
    if (countEl) countEl.textContent = flat.length;

    selectedWrap.innerHTML = flat.length ? flat.map((f) => `
      <div class="selected-field-row">
        <span class="drag-handle" aria-hidden="true">⋮⋮</span>
        <span class="selected-field-name">${escapeHtml(f.field)}</span>
        <span class="badge badge-neutral">${escapeHtml(f.source)}</span>
        <button type="button" class="icon-action is-danger" data-unselect="${f.sourceId}::${escapeHtml(f.field)}"
                data-tooltip="Remove field" aria-label="Remove field ${escapeHtml(f.field)}">${ICON.trash}</button>
      </div>
    `).join('') : `
      <div class="empty-state" style="padding:40px 16px;">
        <div class="empty-state-icon">${ICON.database}</div>
        <h3>No fields selected</h3>
        <p>Add a data source, then tap a field to include it in your report.</p>
      </div>`;

    qsa('[data-unselect]', selectedWrap).forEach((b) => {
      b.addEventListener('click', () => {
        const raw = b.getAttribute('data-unselect');
        const sep = raw.indexOf('::');
        toggleField(raw.slice(0, sep), raw.slice(sep + 2));
      });
    });

    updateBottomBar();
  }

  /* ---------------- Step 3: Filters ---------------- */

  function renderStep3() {
    const wrap = qs('#filtersPanel');
    if (!wrap) return;
    const fields = allSelectedFields();

    if (!fields.length) {
      wrap.innerHTML = '';
      wrap.appendChild(VP.ui.emptyState('inbox', 'Select fields first', 'Filters operate on the fields you picked in Step 1.'));
      return;
    }
    if (!builder.filters.length) builder.filters.push({ field: fields[0], operator: 'equals', value: '' });

    wrap.innerHTML = builder.filters.map((f, i) => `
      <div class="rule-card">
        <div class="rule-card-index">${i + 1}</div>
        <div class="rule-card-body">
          <div class="field-row">
            <div class="field-group">
              <label class="field-label">Field</label>
              <select class="input" data-filter="field" data-idx="${i}">
                ${fields.map((fld) => `<option value="${escapeHtml(fld)}" ${f.field === fld ? 'selected' : ''}>${escapeHtml(fld)}</option>`).join('')}
              </select>
            </div>
            <div class="field-group">
              <label class="field-label">Operator</label>
              <select class="input" data-filter="operator" data-idx="${i}">
                ${['equals', 'not equals', 'contains', 'greater than', 'less than', 'between'].map((op) => `<option value="${op}" ${f.operator === op ? 'selected' : ''}>${VP.util.titleCase(op)}</option>`).join('')}
              </select>
            </div>
            <div class="field-group">
              <label class="field-label">Value</label>
              <input class="input" type="text" data-filter="value" data-idx="${i}" value="${escapeHtml(f.value)}" placeholder="Enter value…">
            </div>
          </div>
        </div>
        <button type="button" class="icon-action is-danger" data-remove-filter="${i}" data-tooltip="Remove filter" aria-label="Remove filter ${i + 1}">${ICON.trash}</button>
      </div>
    `).join('') + `<button class="btn btn-secondary" id="btnAddFilter">${ICON.plus} Add Filter</button>`;

    qsa('[data-filter]', wrap).forEach((input) => input.addEventListener('change', () => {
      builder.filters[Number(input.getAttribute('data-idx'))][input.getAttribute('data-filter')] = input.value;
      updateBottomBar();
    }));
    qsa('[data-remove-filter]', wrap).forEach((b) => b.addEventListener('click', () => {
      builder.filters.splice(Number(b.getAttribute('data-remove-filter')), 1);
      renderStep3();
    }));
    qs('#btnAddFilter', wrap).addEventListener('click', () => {
      builder.filters.push({ field: fields[0], operator: 'equals', value: '' });
      renderStep3();
    });
    updateBottomBar();
  }

  /* ---------------- Step 4: Conditions ---------------- */

  function renderStep4() {
    const wrap = qs('#conditionsPanel');
    if (!wrap) return;
    const fields = allSelectedFields();

    if (!fields.length) {
      wrap.innerHTML = '';
      wrap.appendChild(VP.ui.emptyState('inbox', 'Select fields first', 'Conditions flag rows based on the fields you picked in Step 1.'));
      return;
    }

    if (!builder.conditions.length) {
      wrap.innerHTML = '';
      wrap.appendChild(VP.ui.emptyState('inbox', 'No conditional rules yet', 'Conditions highlight rows that need attention — for example, flagging SLA breaches.'));
      wrap.appendChild(el('button', { class: 'btn btn-secondary', onClick: addCondition }, ['Add Condition']));
      return;
    }

    wrap.innerHTML = builder.conditions.map((c, i) => `
      <div class="rule-card">
        <div class="rule-card-index">${i + 1}</div>
        <div class="rule-card-body">
          <div class="field-row">
            <div class="field-group">
              <label class="field-label">If field</label>
              <select class="input" data-cond="field" data-idx="${i}">
                ${fields.map((fld) => `<option value="${escapeHtml(fld)}" ${c.field === fld ? 'selected' : ''}>${escapeHtml(fld)}</option>`).join('')}
              </select>
            </div>
            <div class="field-group">
              <label class="field-label">Is</label>
              <select class="input" data-cond="operator" data-idx="${i}">
                ${['equal to', 'not equal to', 'above', 'below'].map((op) => `<option ${c.operator === op ? 'selected' : ''}>${op}</option>`).join('')}
              </select>
            </div>
            <div class="field-group">
              <label class="field-label">Value</label>
              <input class="input" data-cond="value" data-idx="${i}" value="${escapeHtml(c.value || '')}" placeholder="Enter value…">
            </div>
          </div>
        </div>
        <button type="button" class="icon-action is-danger" data-remove-cond="${i}" data-tooltip="Remove condition" aria-label="Remove condition ${i + 1}">${ICON.trash}</button>
      </div>
    `).join('') + `<button class="btn btn-secondary" id="btnAddCondition">${ICON.plus} Add Condition</button>`;

    qsa('[data-cond]', wrap).forEach((input) => input.addEventListener('change', () => {
      builder.conditions[Number(input.getAttribute('data-idx'))][input.getAttribute('data-cond')] = input.value;
    }));
    qsa('[data-remove-cond]', wrap).forEach((b) => b.addEventListener('click', () => {
      builder.conditions.splice(Number(b.getAttribute('data-remove-cond')), 1);
      renderStep4();
    }));
    qs('#btnAddCondition', wrap).addEventListener('click', addCondition);
  }

  function addCondition() {
    builder.conditions.push({ field: allSelectedFields()[0] || '', operator: 'equal to', value: '' });
    renderStep4();
  }

  /* ---------------- Step 6: Calculations + live preview ---------------- */

  function renderStep6() {
    const configWrap = qs('#calcConfigPanel');
    const previewHead = qs('#calcPreviewHead');
    const previewBody = qs('#calcPreviewBody');
    if (!configWrap) return;

    const fields = allSelectedFields();

    configWrap.innerHTML = `
      <button class="btn btn-secondary btn-block" id="btnAddCalc" ${fields.length ? '' : 'disabled'}>
        ${ICON.plus} Add Calculation
      </button>
      ${builder.calculations.map((c, i) => `
        <div class="calc-card">
          <div class="calc-card-head">
            <span class="badge badge-navy">Calculation ${i + 1}</span>
            <button type="button" class="icon-action is-danger" data-remove-calc="${i}" data-tooltip="Remove" aria-label="Remove calculation ${i + 1}">${ICON.trash}</button>
          </div>
          <div class="field-group">
            <label class="field-label">Label</label>
            <input class="input" data-calc="label" data-idx="${i}" value="${escapeHtml(c.label)}" placeholder="e.g. Total Amount">
          </div>
          <div class="field-group">
            <label class="field-label">Type</label>
            <select class="input" data-calc="type" data-idx="${i}">
              ${['Sum', 'Average', 'Count', 'Min', 'Max'].map((t) => `<option ${c.type === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </div>
          <div class="field-group" style="margin-bottom:0;">
            <label class="field-label">On field</label>
            <select class="input" data-calc="field" data-idx="${i}">
              ${fields.map((f) => `<option value="${escapeHtml(f)}" ${c.field === f ? 'selected' : ''}>${escapeHtml(f)}</option>`).join('')}
            </select>
          </div>
        </div>
      `).join('')}
    `;

    const addCalcBtn = qs('#btnAddCalc', configWrap);
    if (addCalcBtn) addCalcBtn.addEventListener('click', () => {
      builder.calculations.push({ label: 'New Summary', type: 'Sum', field: fields[0] || '' });
      renderStep6();
    });
    qsa('[data-calc]', configWrap).forEach((input) => input.addEventListener('change', () => {
      builder.calculations[Number(input.getAttribute('data-idx'))][input.getAttribute('data-calc')] = input.value;
      renderStep6();
    }));
    qsa('[data-remove-calc]', configWrap).forEach((b) => b.addEventListener('click', () => {
      builder.calculations.splice(Number(b.getAttribute('data-remove-calc')), 1);
      renderStep6();
    }));

    if (previewHead && previewBody) {
      if (!fields.length) {
        previewHead.innerHTML = '';
        previewBody.innerHTML = '<tr><td style="padding:32px; text-align:center; color:var(--text-muted);">Select fields in Step 1 to preview data.</td></tr>';
        return;
      }
      const sample = VP.data.buildSampleRows(builder.sources[0] && builder.sources[0].name, fields, 6);
      previewHead.innerHTML = fields.map((f) => `<th>${escapeHtml(f)}</th>`).join('');
      previewBody.innerHTML = sample.map((row) => `<tr>${fields.map((f) => `<td>${escapeHtml(row[f])}</td>`).join('')}</tr>`).join('');
    }
  }

  /* ---------------- Step 7: Scheduling ---------------- */

  function renderStep7() {
    const wrap = qs('#schedulePanel');
    if (!wrap) return;
    const s = builder.schedule;

    wrap.innerHTML = `
      <div class="form-section" style="max-width:660px;">
        <div class="field-group">
          <label class="field-label" for="scheduleType">Report Type</label>
          <select class="input" id="scheduleType">
            <option ${s.type === 'Ad Hoc' ? 'selected' : ''}>Ad Hoc</option>
            <option ${s.type === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
          </select>
        </div>

        <div id="scheduleFrequencyWrap" class="nested-section" style="${s.type === 'Scheduled' ? '' : 'display:none;'}">
          <div class="field-group">
            <label class="field-label" for="scheduleFrequency">Frequency</label>
            <select class="input" id="scheduleFrequency">
              ${['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'].map((f) => `<option ${s.frequency === f ? 'selected' : ''}>${f}</option>`).join('')}
            </select>
          </div>
          <div class="field-row">
            <div class="field-group"><label class="field-label" for="scheduleStart">Start Date</label><input class="input" type="date" id="scheduleStart"></div>
            <div class="field-group" style="margin-bottom:0;"><label class="field-label" for="scheduleEnd">End Date (optional)</label><input class="input" type="date" id="scheduleEnd"></div>
          </div>
        </div>

        <div class="field-row">
          <div class="field-group">
            <label class="field-label" for="scheduleFormat">Output Format</label>
            <select class="input" id="scheduleFormat"><option>PDF</option></select>
          </div>
          <div class="field-group">
            <label class="field-label" for="scheduleDelivery">Delivery Method</label>
            <select class="input" id="scheduleDelivery">
              <option ${s.delivery === 'Download' ? 'selected' : ''}>Download</option>
              <option ${s.delivery === 'Save to Report Center' ? 'selected' : ''}>Save to Report Center</option>
            </select>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label" for="scheduleRetention">Retention</label>
          <select class="input" id="scheduleRetention">
            ${['30 days', '60 days', '90 days', 'Forever'].map((r) => `<option ${s.retention === r ? 'selected' : ''}>${r}</option>`).join('')}
          </select>
        </div>

        <div class="alert alert-info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span id="scheduleSummary">${s.type === 'Ad Hoc'
            ? 'Generated on demand.'
            : 'Runs ' + s.frequency.toLowerCase() + ', delivered via ' + s.delivery + '.'}</span>
        </div>
      </div>
    `;

    qs('#scheduleType').addEventListener('change', (e) => {
      s.type = e.target.value;
      renderStep7();
    });
    [['scheduleFrequency', 'frequency'], ['scheduleDelivery', 'delivery'], ['scheduleRetention', 'retention']].forEach(([id, key]) => {
      const node = qs('#' + id);
      if (node) node.addEventListener('change', (e) => { s[key] = e.target.value; renderStep7(); });
    });
  }

  /* ---------------- Step 8: Final preview ---------------- */

  function renderStep8() {
    const wrap = qs('#finalPreviewPanel');
    if (!wrap) return;
    const fields = allSelectedFields();

    if (!fields.length) {
      wrap.innerHTML = '';
      wrap.appendChild(VP.ui.emptyState('inbox', 'Nothing to preview yet', 'Select at least one field in Step 1 to generate a preview.'));
      return;
    }

    const sample = VP.data.buildSampleRows('preview', fields, 8);
    wrap.innerHTML = `
      <div class="preview-summary">
        <div><span class="builder-stat-label">Report</span><strong>${escapeHtml(builder.reportName || 'Untitled report')}</strong></div>
        <div><span class="builder-stat-label">Fields</span><strong>${fields.length}</strong></div>
        <div><span class="builder-stat-label">Filters</span><strong>${builder.filters.filter((f) => f.value).length}</strong></div>
        <div><span class="builder-stat-label">Delivery</span><strong>${escapeHtml(builder.schedule.delivery)}</strong></div>
      </div>
      <div class="table-wrap">
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr>${fields.map((f) => `<th>${escapeHtml(f)}</th>`).join('')}</tr></thead>
            <tbody>${sample.map((row) => `<tr>${fields.map((f) => `<td>${escapeHtml(row[f])}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  /* ---------------- Bottom bar / save / generate ---------------- */

  function updateBottomBar() {
    const dataset = qs('#summaryDataset');
    const fieldsC = qs('#summaryFieldsCount');
    const filtersC = qs('#summaryFiltersCount');
    if (dataset) dataset.textContent = builder.sources.map((s) => s.name).join(', ') || 'None';
    if (fieldsC) fieldsC.textContent = totalSelectedFields();
    if (filtersC) filtersC.textContent = builder.filters.filter((f) => f.value).length;
  }

  function save() {
    const nameInput = qs('#reportNameInput');
    builder.reportName = nameInput ? nameInput.value.trim() : builder.reportName;
    if (!builder.reportName) {
      VP.ui.toast('error', 'Report name required', 'Give your report a name before saving.');
      if (nameInput) { nameInput.classList.add('has-error'); nameInput.focus(); }
      return;
    }
    if (nameInput) nameInput.classList.remove('has-error');
    VP.ui.toast('success', 'Report saved', '"' + builder.reportName + '" was saved as ' + (builder.access === 'private' ? 'a private draft' : 'a shared report') + '.');
  }

  /** Builds and downloads the PDF. Returns true on success. */
  function downloadPdf(reportName, fields) {
    try {
      const jsPDFCtor = window.jspdf && window.jspdf.jsPDF;
      if (!jsPDFCtor) throw new Error('jsPDF unavailable');
      const doc = new jsPDFCtor();
      doc.setFontSize(15);
      doc.text(reportName, 14, 16);
      doc.setFontSize(9);
      doc.text('VPI Lite · generated ' + new Date().toLocaleString(), 14, 22);
      const sample = VP.data.buildSampleRows('export', fields, 12);
      doc.autoTable({
        startY: 28,
        head: [fields],
        body: sample.map((row) => fields.map((f) => String(row[f]))),
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [24, 36, 62], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [239, 239, 239] },
      });
      doc.save(reportName.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.pdf');
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Final action: download the report, clear the builder, and swap the
   * workspace over to the "generated successfully" landing state.
   */
  function generateReport() {
    const fields = allSelectedFields();
    if (!fields.length) {
      VP.ui.toast('error', 'No fields selected', 'Select at least one field before generating a report.');
      setStep(1);
      return;
    }

    const nameInput = qs('#reportNameInput');
    if (nameInput && nameInput.value.trim()) builder.reportName = nameInput.value.trim();
    const reportName = builder.reportName || 'Untitled Report';

    const ok = downloadPdf(reportName, fields);
    if (ok) {
      VP.ui.toast('success', 'Report generated', 'Your PDF has downloaded.');
    } else {
      VP.ui.toast('error', 'Download unavailable', 'The report was generated but the PDF could not be saved here.');
    }

    // Clear every value in the builder, then show the success landing state.
    builder = freshBuilder();
    if (nameInput) { nameInput.value = ''; nameInput.classList.remove('has-error'); }
    const accessSelect = qs('#reportAccessSelect');
    if (accessSelect) accessSelect.value = 'private';
    renderStepRail();
    updateBottomBar();
    showSuccess(reportName);
  }

  /* ---------------- Init ---------------- */

  function init() {
    const nameInput = qs('#reportNameInput');
    if (nameInput) nameInput.addEventListener('input', (e) => {
      builder.reportName = e.target.value;
      e.target.classList.remove('has-error');
    });

    const accessSelect = qs('#reportAccessSelect');
    if (accessSelect) accessSelect.addEventListener('change', (e) => { builder.access = e.target.value; });

    const bind = (id, fn) => { const n = qs('#' + id); if (n) n.addEventListener('click', fn); };
    bind('btnNextStep', nextStep);
    bind('btnPrevStep', prevStep);
    bind('btnSaveReport', save);
    bind('btnGenerateReport', generateReport);
    bind('btnResetBuilder', () => startNew());
    bind('btnPreviewData', () => setStep(8));
    bind('btnClearFields', clearAllFields);
    bind('successCreateAnother', (e) => { e.preventDefault(); startNew(); });
    bind('successGoCatalogue', (e) => {
      e.preventDefault();
      showWizard();
      VP.app.switchView('catalogue');
      VP.sidebar.setActive('catalogue');
    });

    startNew();
  }

  global.VP = global.VP || {};
  global.VP.wizard = { init, startNew, setStep, nextStep, prevStep, addSource, generateReport };
})(window);
