/* ==========================================================================
   data.js — mock data layer (report catalogue, data sources, executions)
   Freshly written data/generation logic for the redesigned application.
   ========================================================================== */
(function (global) {
  'use strict';

  const USERS = ['Ragul K', 'Ananya Sharma', 'Sundar S', 'Emma Wilson', 'David Johnson'];

  const REPORTS = [
    { id: 'RPT-FEDNOW-001', reportName: 'FedNow Immediate Funds Availability Evidence Report', description: 'Continuous evidence report produced on request during Federal Reserve or examiner review. Validates that beneficiary funds were made available immediately after FedNow receipt and settlement.', author: 'Sundar S', visibility: 'public', category: 'Availability Reports', paymentRail: 'FedNow', region: 'United States', frequency: 'Continuous', reportStatus: 'published', version: '2.1', createdAt: '2026-02-10', updatedAt: '2026-06-18', dataset: 'Payment Transactions' },
    { id: 'RPT-FEDNOW-002', reportName: 'FedNow 24x7x365 Service Availability Report', description: 'Continuous monitoring report showing whether the bank’s FedNow receive/send capability was continuously available. Quantifies payment impact of planned and unplanned downtime.', author: 'Ananya Sharma', visibility: 'public', category: 'Availability Reports', paymentRail: 'FedNow', region: 'United States', frequency: 'Monthly', reportStatus: 'published', version: '1.2', createdAt: '2026-01-15', updatedAt: '2026-05-20', dataset: 'System Availability' },
    { id: 'RPT-FEDNOW-003', reportName: 'FedNow Payment Status / Operational Processing Report', description: 'Continuous operational record providing a transaction-level view of each FedNow payment’s processing state and lifecycle from initiation to settlement and posting.', author: 'Ragul K', visibility: 'public', category: 'Operational Reports', paymentRail: 'FedNow', region: 'United States', frequency: 'Continuous', reportStatus: 'draft', version: '1.0', createdAt: '2026-03-01', updatedAt: '2026-04-12', dataset: 'Payment Transactions' },
    { id: 'RPT-FEDNOW-004', reportName: 'FedNow Settlement and Master Account Posting Reconciliation Report', description: 'Daily internal reconciliation report to reconcile FedNow settlement entries with bank ledger and customer postings, identifying unmatched items, suspense items, and adjustment references.', author: 'Emma Wilson', visibility: 'public', category: 'Reconciliation Reports', paymentRail: 'FedNow', region: 'United States', frequency: 'Daily', reportStatus: 'published', version: '1.5', createdAt: '2026-02-20', updatedAt: '2026-07-05', dataset: 'Settlement Entries' },
    { id: 'RPT-FEDNOW-005', reportName: 'FedNow Participant Limit / Risk Control Breach Report', description: 'Continuous monitoring report detailing payments blocked, rejected, or delayed due to participant, customer, account, or transaction limits. Includes limit override flags.', author: 'David Johnson', visibility: 'public', category: 'Risk Reports', paymentRail: 'FedNow', region: 'United States', frequency: 'Continuous', reportStatus: 'published', version: '2.0', createdAt: '2026-04-10', updatedAt: '2026-06-25', dataset: 'Entitlements' },
    { id: 'RPT-FEDNOW-006', reportName: 'FedNow Return / Request for Return Processing Report', description: 'Event-based operational evidence tracking the original payment, return request, response timestamp, settlement, and customer adjustment status for all FedNow returns.', author: 'Ananya Sharma', visibility: 'public', category: 'Exception Reports', paymentRail: 'FedNow', region: 'United States', frequency: 'Daily', reportStatus: 'published', version: '1.3', createdAt: '2026-01-22', updatedAt: '2026-05-30', dataset: 'Exceptions' },
    { id: 'RPT-FEDNOW-007', reportName: 'FedNow ISO 20022 Message Validation Report', description: 'Continuous validation report identifying FedNow ISO 20022 message validation failures, missing mandatory fields, and repaired/rejected messages during scheme processing.', author: 'Ragul K', visibility: 'public', category: 'Compliance Reports', paymentRail: 'FedNow', region: 'United States', frequency: 'Continuous', reportStatus: 'draft', version: '1.1', createdAt: '2026-05-05', updatedAt: '2026-07-15', dataset: 'ISO Messages' },
    { id: 'RPT-FEDWIRE-008', reportName: 'Fedwire Funds Transfer Message Audit Report', description: 'Continuous recordkeeping report providing transaction-level Fedwire message evidence, including IMAD, OMAD, input timestamps, and final settlement status.', author: 'Sundar S', visibility: 'public', category: 'Audit Reports', paymentRail: 'Fedwire', region: 'United States', frequency: 'Continuous', reportStatus: 'published', version: '3.0', createdAt: '2025-11-12', updatedAt: '2026-07-01', dataset: 'Payment Transactions' },
    { id: 'RPT-FEDWIRE-009', reportName: 'Fedwire ISO 20022 Message Format Compliance Report', description: 'Continuous validation report monitoring Fedwire ISO 20022 (pacs) message completeness, validation errors, and data-quality exceptions to ensure format compliance.', author: 'Emma Wilson', visibility: 'public', category: 'Compliance Reports', paymentRail: 'Fedwire', region: 'United States', frequency: 'Continuous', reportStatus: 'published', version: '1.0', createdAt: '2026-03-14', updatedAt: '2026-06-25', dataset: 'ISO Messages' },
    { id: 'RPT-FEDWIRE-010', reportName: 'Fedwire Cut-off / Operating Window Compliance Report', description: 'Daily operational evidence report proving whether Fedwire payments were submitted, processed, and settled within the applicable operating windows and cut-offs.', author: 'David Johnson', visibility: 'public', category: 'Operational Reports', paymentRail: 'Fedwire', region: 'United States', frequency: 'Daily', reportStatus: 'draft', version: '0.8', createdAt: '2026-06-10', updatedAt: '2026-07-10', dataset: 'Payment Transactions' },
    { id: 'RPT-FEDWIRE-011', reportName: 'Fedwire Settlement Finality / Posting Reconciliation Report', description: 'Daily internal reconciliation report verifying Fedwire settlement finality against posting references, GL references, and resolving unmatched or suspense items.', author: 'Ananya Sharma', visibility: 'public', category: 'Reconciliation Reports', paymentRail: 'Fedwire', region: 'United States', frequency: 'Daily', reportStatus: 'published', version: '2.5', createdAt: '2025-10-22', updatedAt: '2026-06-30', dataset: 'Settlement Entries' },
    { id: 'RPT-FEDWIRE-012', reportName: 'Fedwire Payment Rejection / Return Operational Report', description: 'Daily/monthly operational evidence detailing Fedwire rejection and return reasons, original payment IDs, resubmission status, and operator actions.', author: 'Ragul K', visibility: 'public', category: 'Exception Reports', paymentRail: 'Fedwire', region: 'United States', frequency: 'Daily', reportStatus: 'published', version: '1.4', createdAt: '2026-02-28', updatedAt: '2026-07-18', dataset: 'Exceptions' },
    { id: 'RPT-ACH-013', reportName: 'ACH Return & Exception Report', description: 'Weekly breakdown of ACH return codes, NOC (Notification of Change) entries, and unauthorized return disputes, segmented by originating financial institution for compliance review.', author: 'Ananya Sharma', visibility: 'public', category: 'Exception Reports', paymentRail: 'ACH', region: 'United States', frequency: 'Weekly', reportStatus: 'published', version: '1.4', createdAt: '2026-01-22', updatedAt: '2026-05-30', dataset: 'Exceptions' },
    { id: 'RPT-CROSS-US-014', reportName: 'US Payment Service Availability Impact Report', description: 'Event-driven report produced during service disruptions detailing affected rails (FedNow, Fedwire, ACH), downtime windows, payments delayed, and customer impact.', author: 'Sundar S', visibility: 'public', category: 'Availability Reports', paymentRail: 'Cross-Rail (US)', region: 'United States', frequency: 'Event-driven', reportStatus: 'draft', version: '1.0', createdAt: '2026-05-15', updatedAt: '2026-07-20', dataset: 'System Availability' },
    { id: 'RPT-CROSS-US-015', reportName: 'US Computer-Security Incident - Payment Impact Report', description: 'Event-driven report to notify regulators within 36 hours of a security incident, detailing payment initiation, clearing, and settlement impact across all US channels.', author: 'Emma Wilson', visibility: 'public', category: 'Risk Reports', paymentRail: 'Cross-Rail (US)', region: 'United States', frequency: 'Event-driven', reportStatus: 'published', version: '2.0', createdAt: '2026-01-05', updatedAt: '2026-04-18', dataset: 'System Availability' },
    { id: 'RPT-CROSS-US-016', reportName: 'Cross-US Payment Turnaround Time Report', description: 'Continuous evidence report measuring total processing time, internal processing time, and SLA status for FedNow, Fedwire, and ACH payments.', author: 'David Johnson', visibility: 'public', category: 'Operational Reports', paymentRail: 'Cross-Rail (US)', region: 'United States', frequency: 'Continuous', reportStatus: 'published', version: '1.8', createdAt: '2025-12-10', updatedAt: '2026-06-15', dataset: 'Payment Transactions' },
    { id: 'RPT-CROSS-US-017', reportName: 'Cross-US Ancillary Service Latency Report for Payment Execution', description: 'Continuous evidence report capturing response times, latency, and timeouts for ancillary services like validation, core posting, and clearing adapters across US payment rails.', author: 'Ragul K', visibility: 'public', category: 'Operational Reports', paymentRail: 'Cross-Rail (US)', region: 'United States', frequency: 'Continuous', reportStatus: 'published', version: '1.2', createdAt: '2026-03-22', updatedAt: '2026-07-02', dataset: 'System Availability' },
    { id: 'RPT-CROSS-US-018', reportName: 'Cross-US Settlement and Reconciliation Break Report', description: 'Daily internal report detailing settlement references, posting statuses, reconciliation break types, and resolution owners across FedNow, Fedwire, and ACH rails.', author: 'Emma Wilson', visibility: 'public', category: 'Reconciliation Reports', paymentRail: 'Cross-Rail (US)', region: 'United States', frequency: 'Daily', reportStatus: 'draft', version: '0.9', createdAt: '2026-07-01', updatedAt: '2026-07-22', dataset: 'Settlement Entries' },
    { id: 'RPT-CROSS-US-019', reportName: 'Cross-US Liquidity / Limit Breach Report', description: 'Daily and continuous monitoring report tracking available balances, reserved balances, payment outflows, and limit breaches across FedNow and Fedwire services.', author: 'David Johnson', visibility: 'public', category: 'Risk Reports', paymentRail: 'Cross-Rail (US)', region: 'United States', frequency: 'Daily', reportStatus: 'published', version: '1.1', createdAt: '2026-04-15', updatedAt: '2026-06-28', dataset: 'Entitlements' },
    { id: 'RPT-CROSS-US-020', reportName: 'Cross-US Payment Rejection Root-Cause Report', description: 'Periodic internal report aggregating rejection codes, validation failures, and limit failures to determine root causes for payment rejections across all US rails.', author: 'Sundar S', visibility: 'public', category: 'Exception Reports', paymentRail: 'Cross-Rail (US)', region: 'United States', frequency: 'Monthly', reportStatus: 'published', version: '1.6', createdAt: '2026-02-05', updatedAt: '2026-07-10', dataset: 'Exceptions' },
  ];

  // A few private (per-user) drafts so the "My Private Reports" tab has content.
  const PRIVATE_REPORTS = [
    { id: 'RPT-PRIV-101', reportName: 'Weekly SWIFT Outbound Draft', description: 'Personal working draft for a weekly outbound SWIFT summary, not yet shared with the team.', author: 'Ragul K', visibility: 'private', category: 'Operational Reports', paymentRail: 'Cross-Rail (US)', region: 'Global', frequency: 'Weekly', reportStatus: 'draft', version: '0.3', createdAt: '2026-07-10', updatedAt: '2026-07-24', dataset: 'Payment Transactions' },
    { id: 'RPT-PRIV-102', reportName: 'SEPA Instant Exception Sandbox', description: 'Experimental exception report for SCT Inst rejections, used to validate a new filter combination before publishing.', author: 'Ragul K', visibility: 'private', category: 'Exception Reports', paymentRail: 'SCT Inst', region: 'Europe', frequency: 'Daily', reportStatus: 'draft', version: '0.1', createdAt: '2026-07-20', updatedAt: '2026-07-27', dataset: 'Exceptions' },
  ];

  const DATA_SOURCES = [
    { id: 'ds-txn', name: 'Payment Transactions', description: 'Core transaction ledger across all rails.', fields: ['transaction_id', 'amount', 'currency', 'status', 'rail', 'lifecycle_stage', 'processing_time', 'sla_status', 'submission_time'] },
    { id: 'ds-sys', name: 'System Availability', description: 'Uptime, downtime windows and service health telemetry.', fields: ['uptime_percentage', 'downtime_minutes', 'impacted_transactions', 'downtime_start', 'downtime_end', 'latency_ms', 'timeout_count'] },
    { id: 'ds-settle', name: 'Settlement Entries', description: 'Settlement postings and ledger reconciliation records.', fields: ['settlement_id', 'amount', 'ledger_status', 'gl_reference', 'reconciliation_status', 'break_id'] },
    { id: 'ds-entitle', name: 'Entitlements', description: 'Limits, thresholds and breach evidence.', fields: ['limit_id', 'account_id', 'available_balance', 'breach_amount', 'breach_reason'] },
    { id: 'ds-exceptions', name: 'Exceptions', description: 'Returns, rejections and dispute tracking.', fields: ['exception_id', 'return_id', 'return_code', 'reason_code', 'operator_action', 'dispute_status'] },
    { id: 'ds-iso', name: 'ISO Messages', description: 'ISO 20022 message validation and format records.', fields: ['message_id', 'validation_error', 'format_error', 'pacs_type', 'field_name'] },
  ];

  function seededRandom(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }
  const rand = seededRandom(42);

  const STATUSES = ['completed', 'completed', 'completed', 'running', 'queued', 'failed'];

  function buildExecutions(count, source) {
    const rows = [];
    for (let i = 0; i < count; i++) {
      const report = REPORTS[Math.floor(rand() * REPORTS.length)];
      const status = STATUSES[Math.floor(rand() * STATUSES.length)];
      const started = new Date(Date.now() - Math.floor(rand() * 1000 * 60 * 60 * 72));
      const durationSec = Math.floor(rand() * 480) + 5;
      rows.push({
        jobId: 'JOB-' + (10000 + i) + '-' + source.slice(0, 2).toUpperCase(),
        reportName: report.reportName,
        reportId: report.id,
        status,
        progress: status === 'completed' ? 100 : status === 'failed' ? Math.floor(rand() * 60) : status === 'running' ? Math.floor(rand() * 90) + 5 : 0,
        startedAt: started.toISOString(),
        durationSec,
        source,
      });
    }
    return rows.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
  }

  const EXECUTIONS_CORE = buildExecutions(14, 'core');
  const EXECUTIONS_TEMPLATE = buildExecutions(9, 'template');

  function buildSampleRows(datasetName, fields, count) {
    const rows = [];
    for (let i = 0; i < count; i++) {
      const row = {};
      fields.forEach((f) => { row[f] = sampleValueFor(f, i); });
      rows.push(row);
    }
    return rows;
  }

  function sampleValueFor(field, i) {
    if (/amount|balance/.test(field)) return (Math.round((rand() * 950000 + 50) * 100) / 100).toFixed(2);
    if (/id$/.test(field)) return field.replace('_id', '').toUpperCase() + '-' + (100000 + i);
    if (/status/.test(field)) return ['Settled', 'Pending', 'Matched', 'Unmatched', 'Rejected'][i % 5];
    if (/time|_at$|timestamp/.test(field)) return new Date(Date.now() - i * 3600 * 1000).toISOString();
    if (/percentage/.test(field)) return (99 + rand()).toFixed(3) + '%';
    if (/minutes|count|ms$/.test(field)) return Math.floor(rand() * 500);
    if (/currency/.test(field)) return ['USD', 'EUR', 'GBP'][i % 3];
    if (/rail/.test(field)) return ['FedNow', 'Fedwire', 'ACH', 'SEPA SCT'][i % 4];
    return 'Sample ' + field.replace(/_/g, ' ') + ' #' + (i + 1);
  }

  global.VP = global.VP || {};
  global.VP.data = {
    USERS,
    REPORTS: REPORTS.concat(PRIVATE_REPORTS),
    DATA_SOURCES,
    EXECUTIONS_CORE,
    EXECUTIONS_TEMPLATE,
    buildSampleRows,
  };
})(window);
