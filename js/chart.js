/* ==========================================================================
   chart.js — tiny dependency-free canvas charts (bar + line), token-colored
   ========================================================================== */
(function (global) {
  'use strict';

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function setupCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, w: rect.width, h: rect.height };
  }

  function barChart(canvasId, labels, values, opts) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const { ctx, w, h } = setupCanvas(canvas);
    const primary = cssVar('--primary') || '#18243E';
    const gold = cssVar('--secondary') || '#BD9A62';
    const grid = cssVar('--border-subtle') || '#D8D8D8';
    const padding = { top: 16, right: 8, bottom: 26, left: 8 };
    const max = Math.max(...values, 1) * 1.15;
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    const barGap = 10;
    const barW = (chartW / values.length) - barGap;

    ctx.clearRect(0, 0, w, h);

    // gridlines
    ctx.strokeStyle = grid;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const y = padding.top + (chartH / 3) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
    }

    values.forEach((v, i) => {
      const barH = (v / max) * chartH;
      const x = padding.left + i * (barW + barGap);
      const y = padding.top + chartH - barH;
      const grd = ctx.createLinearGradient(0, y, 0, y + barH);
      grd.addColorStop(0, gold);
      grd.addColorStop(1, primary);
      ctx.fillStyle = grd;
      const r = 3;
      ctx.beginPath();
      ctx.moveTo(x, y + barH);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.lineTo(x + barW - r, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      ctx.lineTo(x + barW, y + barH);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = cssVar('--mid-grey') || '#575757';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], x + barW / 2, h - 8);
    });
  }

  function lineChart(canvasId, labels, series) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const { ctx, w, h } = setupCanvas(canvas);
    const gold = cssVar('--secondary') || '#BD9A62';
    const primary = cssVar('--primary') || '#18243E';
    const grid = cssVar('--border-subtle') || '#D8D8D8';
    const padding = { top: 14, right: 10, bottom: 22, left: 10 };
    const max = Math.max(...series, 1) * 1.2;
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    const stepX = chartW / (series.length - 1 || 1);

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = grid;
    for (let i = 0; i <= 3; i++) {
      const y = padding.top + (chartH / 3) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
    }

    const points = series.map((v, i) => ({
      x: padding.left + i * stepX,
      y: padding.top + chartH - (v / max) * chartH,
    }));

    // fill area
    ctx.beginPath();
    ctx.moveTo(points[0].x, padding.top + chartH);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
    ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    fillGrad.addColorStop(0, 'rgba(189,154,98,0.35)');
    fillGrad.addColorStop(1, 'rgba(189,154,98,0.02)');
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // line
    ctx.beginPath();
    points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.strokeStyle = primary;
    ctx.lineWidth = 2;
    ctx.stroke();

    // dots
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = gold;
      ctx.fill();
    });

    ctx.fillStyle = cssVar('--mid-grey') || '#575757';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((l, i) => ctx.fillText(l, points[i].x, h - 6));
  }

  global.VP = global.VP || {};
  global.VP.chart = { barChart, lineChart };
})(window);
