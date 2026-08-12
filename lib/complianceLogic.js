// Shared compliance rules & date math.
// Architecture: each client has a `services` array (which lines of work Legacy
// does for them). Setup steps and recurring items each declare which service
// they belong to (`service`, for grouping/display) and which condition makes
// them apply to a given client (`applies`, for filtering logic).

export const SERVICES = [
  { key: 'trucking', label: 'Trucking Compliance' },
  { key: 'bookkeeping', label: 'Bookkeeping' },
  { key: 'payroll', label: 'Payroll' },
  { key: 'excise', label: 'WA Excise Tax' },
  { key: 'immigration', label: 'Immigration & Passport' },
];

export const SETUP_ITEMS = [
  // ================= TRUCKING =================
  { key: 'entity', label: 'Entity formation (WA SOS)', how: 'File articles + registered agent on CCFS; get UBI number.', applies: 'trucking', service: 'trucking' },
  { key: 'ein', label: 'Federal EIN (Form SS-4)', how: 'IRS.gov — needed before anything else below.', applies: 'trucking', service: 'trucking' },
  { key: 'walicense', label: 'WA business license (BLS)', how: 'DOR Business Licensing Service — adds city + employer accounts.', applies: 'trucking', service: 'trucking' },
  { key: 'usdot', label: 'USDOT number (FMCSA URS)', how: 'Free, via Login.gov. Required before operating.', applies: 'trucking', service: 'trucking' },
  { key: 'mc', label: 'MC operating authority', how: 'FMCSA, $300/authority. ~20–25 business days to activate.', applies: 'interbroker', service: 'trucking' },
  { key: 'boc3', label: 'BOC-3 process agent filing', how: 'Filed by a blanket process agent (~$30–50). Authority won\u2019t activate without it.', applies: 'interbroker', service: 'trucking' },
  { key: 'ins91', label: 'Insurance filing (BMC-91)', how: '$750k min liability, $1M typical. Insurer files direct with FMCSA.', applies: 'carrier', service: 'trucking' },
  { key: 'bond84', label: 'BMC-84 broker bond ($75k)', how: 'Surety company files with FMCSA.', applies: 'broker', service: 'trucking' },
  { key: 'ucr', label: 'UCR initial registration', how: 'ucr.gov — fee scales with fleet size.', applies: 'interbroker', service: 'trucking' },
  { key: 'irp', label: 'IRP apportioned plates', how: 'WA DOL Prorate office — needs stamped 2290 Sch 1 for trucks 55k+ lbs.', applies: 'inter', service: 'trucking' },
  { key: 'iftalic', label: 'IFTA license & decals', how: 'WA DOL Taxpayer Access Point (TAP).', applies: 'inter', service: 'trucking' },
  { key: '2290first', label: 'Form 2290 — first filing', how: 'Due end of month after first road use. E-file for a fast stamped Sch 1.', applies: 'carrier', service: 'trucking' },
  { key: 'drug', label: 'Drug/alcohol consortium + Clearinghouse', how: 'Enroll in a C/TPA, register in the Clearinghouse, pre-employment test each driver.', applies: 'carrier', service: 'trucking' },
  { key: 'eld', label: 'ELD / hours-of-service setup', how: 'Install a registered ELD unless short-haul exempt.', applies: 'carrier', service: 'trucking' },
  { key: 'dqfiles', label: 'Driver Qualification (DQ) files', how: 'Application, MVR, road test, medical card, prior-employer checks per driver.', applies: 'carrier', service: 'trucking' },
  { key: 'oregonacct', label: 'Oregon CCD account + weight-mile', how: 'Only if running Oregon — Form 9075 + POA 9654. Mark N/A otherwise.', applies: 'carrier', service: 'trucking' },
  { key: 'auditprep', label: 'New Entrant audit prep', how: 'FMCSA audits within the first 12 months — keep DQ, drug, HOS, maintenance files ready.', applies: 'inter', service: 'trucking' },
  { key: 'safetyrating', label: 'Confirm safety rating on SAFER', how: 'Check safer.fmcsa.dot.gov after the New Entrant audit — should read Satisfactory or unrated.', applies: 'inter', service: 'trucking' },
  { key: 'apportioned_cab', label: 'Cab cards & plates in the truck', how: 'Confirm current IRP cab card and plate are physically in each vehicle before it runs.', applies: 'inter', service: 'trucking' },

  // ================= BOOKKEEPING =================
  { key: 'bk_access', label: 'Get QuickBooks Online access', how: 'Client invites you as accountant user, or you set up a new company file.', applies: 'bookkeeping', service: 'bookkeeping' },
  { key: 'bk_coa', label: 'Build chart of accounts', how: 'Set up categories matching the client\u2019s industry (COGS, per-diem, etc).', applies: 'bookkeeping', service: 'bookkeeping' },
  { key: 'bk_history', label: 'Catch up prior-period transactions', how: 'Import/reconcile bank & card feeds back to the client\u2019s start date.', applies: 'bookkeeping', service: 'bookkeeping' },
  { key: 'bk_bankfeed', label: 'Connect bank & credit card feeds', how: 'Link live feeds in QBO so transactions import automatically each month.', applies: 'bookkeeping', service: 'bookkeeping' },
  { key: 'bk_priorcpa', label: 'Request prior bookkeeper/CPA handoff', how: 'Get last financials, trial balance, and any open items from whoever did this before.', applies: 'bookkeeping', service: 'bookkeeping' },

  // ================= PAYROLL =================
  { key: 'py_account', label: 'Set up payroll account (Patriot Payroll)', how: 'Company profile, bank account for direct deposit/tax payments.', applies: 'payroll', service: 'payroll' },
  { key: 'py_employer', label: 'WA employer accounts (ESD / L&I)', how: 'Opens via BLS when hiring W-2 employees. Set up SAW access. Applies to any client with W-2 employees, including truck drivers.', applies: 'payrollOrTrucking', service: 'payroll' },
  { key: 'py_employees', label: 'Collect W-4 / I-9 per employee', how: 'Required before the first payroll run for each hire.', applies: 'payroll', service: 'payroll' },
  { key: 'py_schedule', label: 'Confirm pay schedule & first run date', how: 'Weekly / biweekly / semi-monthly / monthly — set with the client.', applies: 'payroll', service: 'payroll' },
  { key: 'py_newhire', label: 'WA New Hire Reporting setup', how: 'Employer must report each new hire to WA within 20 days \u2014 confirm process is in place.', applies: 'payroll', service: 'payroll' },
  { key: 'py_workcomp', label: 'L&I workers\u2019 comp risk classification', how: 'Confirm the right risk class code is assigned \u2014 affects the L&I rate paid per employee.', applies: 'payroll', service: 'payroll' },
  { key: 'py_pfml', label: 'WA Paid Family & Medical Leave setup', how: 'Confirm premiums are being withheld and remitted \u2014 separate from L&I/ESD.', applies: 'payroll', service: 'payroll' },

  // ================= EXCISE =================
  { key: 'ex_account', label: 'Register WA DOR excise tax account', how: 'Usually opens automatically with the WA Business License — confirm active.', applies: 'excise', service: 'excise' },
  { key: 'ex_frequency', label: 'Confirm filing frequency with DOR', how: 'DOR assigns monthly/quarterly/annual based on revenue — set it on this client\u2019s profile.', applies: 'excise', service: 'excise' },
  { key: 'ex_citylocal', label: 'Check for city/local B&O filing', how: 'Some WA cities (Tacoma, Seattle, etc.) have their own separate B&O return \u2014 confirm if this client needs one.', applies: 'excise', service: 'excise' },

  // ================= IMMIGRATION & PASSPORT (case-based) =================
  // These are the standard steps for opening a new immigration/passport/OCI
  // case for a client. Each specific case (whose passport, whose OCI, due by
  // when) belongs on that client's Other Tasks list with its own due date —
  // this checklist is the repeatable intake process, not the case itself.
  { key: 'im_poa', label: 'Collect signed POA / authorization', how: 'Needed before acting on the client\u2019s behalf with VFS Global or a consulate.', applies: 'immigration', service: 'immigration' },
  { key: 'im_doclist', label: 'Send document checklist to client', how: 'Varies by case type \u2014 I-90, Indian passport reissue, OCI adult, OCI minor each need a different set.', applies: 'immigration', service: 'immigration' },
  { key: 'im_photos', label: 'Confirm photo specs collected', how: 'Passport/OCI photos have strict size and background requirements \u2014 check before submission, not after rejection.', applies: 'immigration', service: 'immigration' },
  { key: 'im_affidavit', label: 'Prepare affidavit(s) if required', how: 'Common for OCI and passport name-mismatch or address-proof cases.', applies: 'immigration', service: 'immigration' },
  { key: 'im_vfsacct', label: 'Set up / confirm VFS Global account access', how: 'VFS Global handles Indian passport & OCI intake for the SF Consulate jurisdiction.', applies: 'immigration', service: 'immigration' },
  { key: 'im_appointment', label: 'Book consulate/VFS appointment', how: 'If the case type requires in-person biometrics or document drop-off.', applies: 'immigration', service: 'immigration' },
  { key: 'im_fee', label: 'Confirm government/VFS fees collected', how: 'Fees vary by case type and are separate from your service fee.', applies: 'immigration', service: 'immigration' },
];

// ---------- recurring items ----------
export const RECURRING_ITEMS = [
  // ================= TRUCKING =================
  { key: '2290', label: 'Form 2290 (HVUT)', applies: 'carrier', freq: 'yearly', service: 'trucking', due: (c) => nextAnnual(8, 31) },
  { key: 'iftalicense', label: 'IFTA license renewal', applies: 'inter', freq: 'yearly', service: 'trucking', due: (c) => nextAnnual(12, 31) },
  { key: 'iftareturn', label: 'IFTA quarterly return', applies: 'inter', freq: 'quarterly', service: 'trucking', due: (c) => nextQuarter() },
  { key: 'ucr', label: 'UCR registration', applies: 'interbroker', freq: 'yearly', service: 'trucking', due: (c) => nextAnnual(12, 31) },
  { key: 'irp', label: 'IRP renewal', applies: 'inter', freq: 'yearly', service: 'trucking', due: (c) => fixedDate(c.irp), needsField: 'irp', fieldLabel: 'IRP expiration', hasExpiration: true },
  { key: 'mcs150', label: 'MCS-150 biennial update', applies: 'mcs150', freq: 'yearly', service: 'trucking', cadence: 'Every 2 years', due: (c) => mcs150Due(c.usdot) },
  { key: 'ins91', label: 'Insurance renewal (BMC-91)', applies: 'carrier', freq: 'yearly', service: 'trucking', due: (c) => fixedDate(c.ins), needsField: 'ins', fieldLabel: 'insurance renewal date', hasExpiration: true },
  { key: 'bond84', label: 'BMC-84 broker bond renewal', applies: 'broker', freq: 'yearly', service: 'trucking', due: (c) => fixedDate(c.ins), needsField: 'ins', fieldLabel: 'bond renewal date', hasExpiration: true },
  { key: 'clearinghouse', label: 'Clearinghouse annual queries', applies: 'carrier', freq: 'yearly', service: 'trucking', due: (c) => nextAnnual(12, 31) },
  { key: 'sos', label: 'WA SOS annual report', applies: 'trucking', freq: 'yearly', service: 'trucking', due: (c) => sosDue(c.formed), needsField: 'formed', fieldLabel: 'formation date' },
  { key: 'oregon', label: 'Oregon weight-mile tax', applies: 'oregon', freq: 'monthly', service: 'trucking', due: (c) => endOfCurrentMonth() },
  { key: 'randomtest', label: 'Quarterly random drug/alcohol selection', applies: 'carrier', freq: 'quarterly', service: 'trucking', due: (c) => nextQuarter() },
  { key: 'cdlcheck', label: 'CDL / medical card expiration check', how: '', applies: 'carrier', freq: 'quarterly', service: 'trucking', due: (c) => nextQuarter() },
  { key: 'annualinspect', label: 'Annual DOT vehicle inspection', applies: 'carrier', freq: 'yearly', service: 'trucking', due: (c) => nextAnnual(12, 31), hasExpiration: true },

  // ================= BOOKKEEPING =================
  { key: 'bk_close', label: 'Monthly bookkeeping close', applies: 'bookkeeping', freq: 'monthly', service: 'bookkeeping', due: (c) => nextMonthlyByDay(15) },
  { key: 'bk_review', label: 'Quarterly financial review with client', applies: 'bookkeeping', freq: 'quarterly', service: 'bookkeeping', due: (c) => nextQuarter() },
  { key: 'bk_1099vendor', label: 'Annual 1099-NEC issuance to vendors', applies: 'bookkeeping', freq: 'yearly', service: 'bookkeeping', due: (c) => nextAnnual(1, 31) },

  // ================= PAYROLL =================
  { key: 'py_941', label: 'Form 941 — quarterly federal payroll tax', applies: 'payroll', freq: 'quarterly', service: 'payroll', due: (c) => nextQuarter() },
  { key: 'esd', label: 'ESD quarterly wage report', applies: 'payrollOrTrucking', freq: 'quarterly', service: 'payroll', due: (c) => nextQuarter() },
  { key: 'li', label: 'L&I quarterly report', applies: 'payrollOrTrucking', freq: 'quarterly', service: 'payroll', due: (c) => nextQuarter() },
  { key: 'pfmlq', label: 'WA PFML quarterly premium report', applies: 'payroll', freq: 'quarterly', service: 'payroll', due: (c) => nextQuarter() },
  { key: 'w2s', label: 'W-2 / 1099 preparation', applies: 'payroll', freq: 'yearly', service: 'payroll', due: (c) => nextAnnual(1, 31) },
  { key: 'w3', label: 'W-3 transmittal to SSA', applies: 'payroll', freq: 'yearly', service: 'payroll', due: (c) => nextAnnual(1, 31) },
  { key: 'futa', label: 'Form 940 — annual FUTA', applies: 'payroll', freq: 'yearly', service: 'payroll', due: (c) => nextAnnual(1, 31) },

  // Excise — cadence depends on the client's assigned filing frequency
  { key: 'excise', label: 'WA DOR excise tax', applies: 'exciseOrTrucking', freq: (c) => exciseFreqBucket(c), service: 'excise', due: (c) => exciseDue(c) },
];

export const FREQ_META = {
  monthly: { title: 'Monthly Compliance', label: 'Monthly' },
  quarterly: { title: 'Quarterly Compliance', label: 'Quarterly' },
  yearly: { title: 'Yearly Compliance', label: 'Yearly' },
};

// Most items have a fixed freq string; the excise item's freq depends on the
// client's assigned filing frequency, so it's a function instead — resolve
// through this helper everywhere rather than reading item.freq directly.
export function resolveFreq(item, client) {
  return typeof item.freq === 'function' ? item.freq(client) : item.freq;
}

function hasService(client, key) { return Array.isArray(client.services) && client.services.includes(key); }

export function itemApplies(applies, client) {
  const trucking = hasService(client, 'trucking');
  switch (applies) {
    case 'trucking': return trucking;
    case 'carrier': return trucking && client.type.indexOf('Carrier') === 0;
    case 'inter': return trucking && client.type === 'Carrier - Interstate';
    case 'broker': return trucking && client.type === 'Broker';
    case 'interbroker': return trucking && (client.type === 'Carrier - Interstate' || client.type === 'Broker');
    case 'mcs150': return trucking && !!client.usdot;
    case 'oregon': return trucking && client.type.indexOf('Carrier') === 0 && !!client.oregon;
    case 'bookkeeping': return hasService(client, 'bookkeeping');
    case 'payroll': return hasService(client, 'payroll');
    case 'payrollOrTrucking': return hasService(client, 'payroll') || (trucking && client.type.indexOf('Carrier') === 0);
    case 'excise': return hasService(client, 'excise');
    case 'exciseOrTrucking': return hasService(client, 'excise') || trucking;
    case 'immigration': return hasService(client, 'immigration');
    default: return true;
  }
}

// The excise item's frequency/due-date depend on the client's assigned DOR
// filing frequency (defaults to quarterly, same as before, if not set).
function exciseFreqBucket(client) {
  const f = client.exciseFrequency || 'quarterly';
  if (f === 'monthly') return 'monthly';
  if (f === 'annual') return 'yearly';
  return 'quarterly';
}
function exciseDue(client) {
  const f = client.exciseFrequency || 'quarterly';
  if (f === 'monthly') return endOfCurrentMonth();
  if (f === 'annual') return nextAnnual(4, 15); // WA annual excise filers: due Apr 15
  return nextQuarter();
}

/* ---------------- date helpers ---------------- */
export function today0() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
function endOfMonth(y, m) { return new Date(y, m, 0); } // m = 1-12
export function nextAnnual(month, day) {
  const t = today0(); const y = t.getFullYear();
  let d = new Date(y, month - 1, day);
  if (d < t) d = new Date(y + 1, month - 1, day);
  return d;
}
export function nextQuarter() {
  const t = today0(); const y = t.getFullYear();
  const cands = [new Date(y, 0, 31), new Date(y, 3, 30), new Date(y, 6, 31), new Date(y, 9, 31), new Date(y + 1, 0, 31)];
  for (const c of cands) { if (c >= t) return c; }
  return cands[cands.length - 1];
}
export function endOfCurrentMonth() { const t = today0(); return endOfMonth(t.getFullYear(), t.getMonth() + 1); }
export function nextMonthlyByDay(day) {
  const t = today0(); const y = t.getFullYear(); const m = t.getMonth();
  let d = new Date(y, m, day);
  if (d < t) d = new Date(y, m + 1, day);
  return d;
}
export function mcs150Due(usdot) {
  if (!usdot) return null;
  const digits = String(usdot).replace(/\D/g, '');
  if (digits.length < 1) return null;
  const last = parseInt(digits[digits.length - 1], 10);
  const secondLast = digits.length > 1 ? parseInt(digits[digits.length - 2], 10) : 0;
  const month = secondLast === 0 ? 10 : secondLast;
  const t = today0(); const y = t.getFullYear();
  let dueYear = (y % 2 === last % 2) ? y : y + 1;
  let due = endOfMonth(dueYear, month);
  if (due < t) due = endOfMonth(dueYear + 2, month);
  return due;
}
export function sosDue(formedStr) {
  if (!formedStr) return null;
  const fd = new Date(formedStr + 'T00:00:00');
  const t = today0(); const y = t.getFullYear();
  let due = endOfMonth(y, fd.getMonth() + 1);
  if (due < t) due = endOfMonth(y + 1, fd.getMonth() + 1);
  return due;
}
export function fixedDate(str) { return str ? new Date(str + 'T00:00:00') : null; }
export function fmtDate(d) {
  if (!d) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
export function isoKey(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

export function statusOf(due, doneKey, currentKey) {
  if (doneKey === currentKey) return 'done';
  if (!due) return 'setdate';
  const t = today0();
  const diff = Math.round((due - t) / 86400000);
  if (diff < 0) return 'overdue';
  if (diff <= 30) return 'soon';
  return 'ok';
}

// Custom (freeform, one-off) task status — same red/amber/green rules, no
// recurring-period logic since these don't repeat.
export function customTaskStatus(task) {
  if (task.status === 'Complete') return 'done';
  if (!task.due) return 'setdate';
  const due = fixedDate(task.due);
  const t = today0();
  const diff = Math.round((due - t) / 86400000);
  if (diff < 0) return 'overdue';
  if (diff <= 30) return 'soon';
  return 'ok';
}

export function titleCase(s) {
  return s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase())
    .replace(/\bLlc\b/gi, 'LLC').replace(/\bInc\b/gi, 'Inc.');
}
