/* =========================================================
   Live control gallery + form builder
   A miniature of the config-driven engine described in Selected Work:
   pick a control type, see it render instantly, add it to a schema,
   and the whole form rebuilds from that schema. No framework.
   ========================================================= */

const svg = (paths) =>
  `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor"
        stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true" focusable="false">${paths}</svg>`;

/* Each entry is one control the engine knows how to render. Adding a type here
   is the only change needed — nothing downstream knows about specific types. */
export const CONTROLS = [
  /* ---- Text ---- */
  { type: 'text', label: 'Text', group: 'Text', icon: svg('<path d="M4 6h12M10 6v9"/>'),
    hint: 'A single line of plain text. Use Text Area when the answer runs long.',
    sample: { key: 'title', label: 'Job title', type: 'text', placeholder: 'Frontend Engineer' } },

  { type: 'textarea', label: 'Text Area', group: 'Text', icon: svg('<rect x="3" y="5" width="14" height="11" rx="2"/><path d="M6 9h8M6 12h5"/>'),
    hint: 'Multi-line input for notes, descriptions and free-form answers.',
    sample: { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Anything we should know?' } },

  { type: 'email', label: 'Email', group: 'Text', icon: svg('<rect x="3" y="5" width="14" height="10" rx="2"/><path d="M3.5 6.5 10 11l6.5-4.5"/>'),
    hint: 'Validated against an email pattern before the form will submit.',
    sample: { key: 'email', label: 'Work email', type: 'email', required: true, placeholder: 'you@company.com' } },

  { type: 'url', label: 'URL', group: 'Text', icon: svg('<circle cx="10" cy="10" r="7"/><path d="M3 10h14M10 3a13 13 0 0 1 0 14a13 13 0 0 1 0-14"/>'),
    hint: 'Expects a full address including the protocol.',
    sample: { key: 'site', label: 'Website', type: 'url', placeholder: 'https://example.com' } },

  { type: 'tel', label: 'Phone', group: 'Text', icon: svg('<path d="M5 3h2.6l1.3 3.6-1.8 1.3a10.5 10.5 0 0 0 4 4l1.3-1.8L16 11.4V14a2 2 0 0 1-2.2 2A13 13 0 0 1 3 5.2 2 2 0 0 1 5 3z"/>'),
    hint: 'Dial code and number stay separate, so the value keeps its country.',
    sample: { key: 'phone', label: 'Phone', type: 'tel', dial: '+20', dials: ['+20', '+966', '+971', '+44', '+1'], placeholder: '10 1234 5678' } },

  { type: 'password', label: 'Password', group: 'Text', icon: svg('<rect x="4" y="9" width="12" height="7" rx="2"/><path d="M7 9V6.5a3 3 0 0 1 6 0V9"/>'),
    hint: 'Masked input. The value never appears in the rendered markup.',
    sample: { key: 'secret', label: 'API key', type: 'password', placeholder: '••••••••' } },

  /* ---- Numbers ---- */
  { type: 'number', label: 'Number', group: 'Numbers', icon: svg('<path d="M7 4 5.5 16M14 4l-1.5 12M4 8h12M3.5 12h12"/>'),
    hint: 'Numeric only, with optional min and max bounds.',
    sample: { key: 'seats', label: 'Seats', type: 'number', min: 1, max: 500, value: 25 } },

  { type: 'currency', label: 'Currency', group: 'Numbers', icon: svg('<rect x="2.5" y="5.5" width="15" height="9" rx="2"/><circle cx="10" cy="10" r="2.2"/><path d="M5.5 8.5v3M14.5 8.5v3"/>'),
    hint: 'Amount and currency travel together, so the number is never ambiguous.',
    sample: { key: 'budget', label: 'Budget', type: 'currency', currency: 'EGP', currencies: ['EGP', 'USD', 'EUR', 'SAR'], value: 25000 } },

  { type: 'range', label: 'Slider', group: 'Numbers', icon: svg('<path d="M3 10h14"/><circle cx="12.5" cy="10" r="2.8"/>'),
    hint: 'A bounded number where the range reads faster than the figure.',
    sample: { key: 'progress', label: 'Completion', type: 'range', min: 0, max: 100, step: 5, value: 60 } },

  { type: 'rating', label: 'Rating', group: 'Numbers', icon: svg('<path d="m10 3.2 2.1 4.3 4.7.7-3.4 3.3.8 4.7L10 14l-4.2 2.2.8-4.7-3.4-3.3 4.7-.7z"/>'),
    hint: 'A small integer scale. Submits a number, not a label.',
    sample: { key: 'score', label: 'Satisfaction', type: 'rating', max: 5, value: 4 } },

  /* ---- Choice ---- */
  { type: 'select', label: 'Select', group: 'Choice', icon: svg('<rect x="3" y="6" width="14" height="8" rx="2"/><path d="m11 9 2 2 2-2"/>'),
    hint: 'One choice from a list. Options come from the schema, not the code.',
    sample: { key: 'plan', label: 'Plan', type: 'select', options: ['Starter', 'Growth', 'Enterprise'], value: 'Growth' } },

  { type: 'multiselect', label: 'Multi-select', group: 'Choice', icon: svg('<path d="m3 5.8 1.6 1.6L7.6 4.4M3 13.8l1.6 1.6 3-3M10.5 6h6.5M10.5 14H17"/>'),
    hint: 'Several options at once, shown back as chips you can drop.',
    sample: { key: 'tags', label: 'Tags', type: 'multiselect', options: ['Priority', 'Renewal', 'Onboarding', 'Churn risk', 'VIP'], value: ['Priority', 'VIP'] } },

  { type: 'checkbox', label: 'Checkbox', group: 'Choice', icon: svg('<rect x="3.5" y="3.5" width="13" height="13" rx="3"/><path d="m6.5 10 2.5 2.5 4.5-5"/>'),
    hint: 'Any number of options at once. Submits as an array.',
    sample: { key: 'modules', label: 'Modules', type: 'checkbox', options: ['HRM', 'Payroll', 'Finance'], value: ['HRM'] } },

  { type: 'radio', label: 'Radio', group: 'Choice', icon: svg('<circle cx="10" cy="10" r="7"/><circle cx="10" cy="10" r="2.8" fill="currentColor" stroke="none"/>'),
    hint: 'Exactly one option, all visible at once.',
    sample: { key: 'billing', label: 'Billing', type: 'radio', options: ['Monthly', 'Annual'], value: 'Annual' } },

  { type: 'toggle', label: 'True / False', group: 'Choice', icon: svg('<rect x="2.5" y="6.5" width="15" height="7" rx="3.5"/><circle cx="13.5" cy="10" r="2.2" fill="currentColor" stroke="none"/>'),
    hint: 'A single boolean, rendered as a switch rather than a checkbox.',
    sample: { key: 'terms', label: 'I accept the terms', type: 'toggle', value: false } },

  /* ---- Date & time ---- */
  { type: 'date', label: 'Date', group: 'Date & time', icon: svg('<rect x="3" y="5" width="14" height="12" rx="2"/><path d="M3 9h14M7 3v4M13 3v4"/>'),
    hint: 'Calendar picker. Submits an ISO date string.',
    sample: { key: 'golive', label: 'Go-live date', type: 'date' } },

  { type: 'time', label: 'Time', group: 'Date & time', icon: svg('<circle cx="10" cy="10" r="7"/><path d="M10 6v4l2.5 2"/>'),
    hint: 'Clock picker for a time of day.',
    sample: { key: 'slot', label: 'Preferred time', type: 'time' } },

  { type: 'datetime-local', label: 'Date & Time', group: 'Date & time', icon: svg('<rect x="3" y="4" width="14" height="13" rx="2"/><path d="M3 8h14M7 2v4"/><path d="M10.5 11v2l1.5 1"/>'),
    hint: 'Both at once, for scheduling.',
    sample: { key: 'starts', label: 'Starts at', type: 'datetime-local' } },

  /* ---- Files & rich ---- */
  { type: 'file', label: 'File', group: 'Files & rich', icon: svg('<path d="M11 3H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8z"/><path d="M11 3v5h5"/>'),
    hint: 'Upload control. Accepted types are set in the schema.',
    sample: { key: 'doc', label: 'Contract', type: 'file' } },

  { type: 'richtext', label: 'Rich Text', group: 'Files & rich', icon: svg('<rect x="2.5" y="3.5" width="15" height="13" rx="2"/><path d="M2.5 7.5h15M5.5 11h7M5.5 13.5h4"/>'),
    hint: 'Formatted copy for terms and descriptions. Submits HTML.',
    sample: { key: 'terms', label: 'Terms', type: 'richtext', value: '<p>Net 30 from the invoice date.</p>' } },

  { type: 'signature', label: 'Signature', group: 'Files & rich', icon: svg('<path d="M3 13.5c3 0 2.6-6.5 4.8-6.5 1.9 0 1.6 5 3.4 5 1.6 0 1.8-3 5.8-3"/><path d="M3 17h14"/>'),
    hint: 'Drawn once, submitted as a data URL. Approvals and delivery notes.',
    sample: { key: 'sign', label: 'Signature', type: 'signature' } },

  { type: 'color', label: 'Color', group: 'Files & rich', icon: svg('<path d="M10 3s5 5.3 5 8a5 5 0 0 1-10 0c0-2.7 5-8 5-8z"/>'),
    hint: 'A hex value, for anything a customer brands themselves.',
    sample: { key: 'brand', label: 'Brand colour', type: 'color', value: '#e9b872' } },

  /* ---- Business ---- */
  { type: 'lookup', label: 'Lookup', group: 'Business', icon: svg('<circle cx="9" cy="9" r="5.2"/><path d="m12.8 12.8 4.2 4.2"/>'),
    hint: 'Points at a record in another module. The schema names the source, never the rows.',
    sample: { key: 'customer', label: 'Customer', type: 'lookup', ref: 'customers', display: 'name', required: true } },

  { type: 'lineitems', label: 'Line Items', group: 'Business', icon: svg('<rect x="2.5" y="4.5" width="15" height="11" rx="2"/><path d="M2.5 8h15M2.5 12h15M8 8v7.5"/>'),
    hint: 'A schema inside a schema — rows the user adds, each one rendered by the same engine.',
    sample: { key: 'items', label: 'Line items', type: 'lineitems', fields: [
      { key: 'desc', label: 'Description', type: 'text' },
      { key: 'qty', label: 'Qty', type: 'number', value: 1 },
      { key: 'price', label: 'Unit price', type: 'number', value: 0 },
    ] } },

  { type: 'otp', label: 'One-time Code', group: 'Text', icon: svg('<rect x="2" y="7" width="3.6" height="6" rx="1"/><rect x="7" y="7" width="3.6" height="6" rx="1"/><rect x="12" y="7" width="3.6" height="6" rx="1"/><path d="M17.6 10H18"/>'),
    hint: 'A code split across boxes, so a paste fills them all and a typo is obvious.',
    sample: { key: 'code', label: 'Verification code', type: 'otp', length: 6 } },

  { type: 'barcode', label: 'Barcode', group: 'Text', icon: svg('<path d="M3 4v12M6 4v12M8.5 4v12M11.5 4v9M14 4v12M17 4v12"/>'),
    hint: 'Scanner-first: the field takes a scan or a typed code and normalises both.',
    sample: { key: 'sku', label: 'SKU / Barcode', type: 'barcode', placeholder: 'Scan or type' } },

  { type: 'tree', label: 'Tree Select', group: 'Business', icon: svg('<rect x="3" y="3" width="5" height="4" rx="1"/><rect x="12" y="8" width="5" height="4" rx="1"/><rect x="12" y="14" width="5" height="3.5" rx="1"/><path d="M5.5 7v7.5h6.5M5.5 10h6.5"/>'),
    hint: 'One node out of a hierarchy — categories, cost centres, an org chart.',
    sample: { key: 'category', label: 'Category', type: 'tree', ref: 'categories' } },

  { type: 'computed', label: 'Computed', group: 'Business', icon: svg('<rect x="3" y="3" width="14" height="14" rx="3"/><path d="M6.5 8h7M6.5 12h7"/>'),
    hint: 'Never typed into — re-evaluated from the other fields every time one changes.',
    sample: { key: 'total', label: 'Order total', type: 'computed', expr: 'sum(qty * price)', format: 'currency' } },
];

/* ---------- what each type may be constrained by ----------
   A rule catalogue, not an if-tree. The engine never asks "is this an
   email?" — it asks the type which rules it accepts, and a type that
   accepts none says so out loud. */
const PATTERNS = {
  email:    { label: 'email format',   value: '^[^@\\s]+@[^@\\s]+\\.[a-z]{2,}$' },
  url:      { label: 'https only',     value: '^https://.+' },
  tel:      { label: 'digits only',    value: '^[0-9 ]{7,15}$' },
  password: { label: 'letters + digit', value: '^(?=.*[A-Za-z])(?=.*\\d).{8,}$' },
  text:     { label: 'letters only',   value: '^[A-Za-z .-]+$' },
};

const rule = (key, label, value) => ({ key, label, value });

const RULES = {
  text:      [rule('required', 'required', true), rule('minLength', 'min length', 3), rule('maxLength', 'max length', 60), rule('pattern', PATTERNS.text.label, PATTERNS.text.value)],
  textarea:  [rule('required', 'required', true), rule('minLength', 'min length', 20), rule('maxLength', 'max length', 500)],
  email:     [rule('required', 'required', true), rule('pattern', PATTERNS.email.label, PATTERNS.email.value)],
  url:       [rule('required', 'required', true), rule('pattern', PATTERNS.url.label, PATTERNS.url.value)],
  tel:       [rule('required', 'required', true), rule('pattern', PATTERNS.tel.label, PATTERNS.tel.value)],
  password:  [rule('required', 'required', true), rule('minLength', 'min length', 8), rule('pattern', PATTERNS.password.label, PATTERNS.password.value)],
  number:    [rule('required', 'required', true), rule('min', 'min', 1), rule('max', 'max', 500)],
  currency:  [rule('required', 'required', true), rule('min', 'min', 0), rule('max', 'max', 1000000)],
  range:     [],
  rating:    [rule('required', 'required', true), rule('min', 'at least', 3)],
  select:    [rule('required', 'required', true)],
  multiselect: [rule('required', 'required', true), rule('minSelected', 'min selected', 2)],
  checkbox:  [rule('required', 'required', true), rule('minSelected', 'min selected', 1)],
  radio:     [rule('required', 'required', true)],
  toggle:    [rule('requiredTrue', 'must be on', true)],
  date:      [rule('required', 'required', true), rule('notPast', 'no past dates', true)],
  time:      [rule('required', 'required', true)],
  'datetime-local': [rule('required', 'required', true), rule('notPast', 'no past dates', true)],
  file:      [rule('required', 'required', true), rule('accept', 'PDF only', '.pdf'), rule('maxSize', 'max 5 MB', 5)],
  richtext:  [rule('required', 'required', true), rule('maxLength', 'max length', 2000)],
  signature: [rule('required', 'required', true)],
  color:     [],
  otp:       [rule('required', 'required', true), rule('minLength', 'full length', 6)],
  barcode:   [rule('required', 'required', true), rule('pattern', 'alphanumeric', '^[A-Za-z0-9-]{4,}$')],
  tree:      [rule('required', 'required', true), rule('leafOnly', 'leaf nodes only', true)],
  lookup:    [rule('required', 'required', true)],
  lineitems: [rule('minRows', 'min rows', 2), rule('maxRows', 'max rows', 5), rule('unique', 'no duplicate rows', 'desc')],
  computed:  [],
};

/* Why a type has nothing to validate — worth saying, because it is a
   decision rather than an oversight. */
const NO_RULES = {
  range: 'A slider always holds a value inside its own bounds.',
  color: 'Any hex the picker returns is already valid.',
  computed: 'Never typed into, so there is nothing to reject.',
};

/* ---------- the other half of a field's job ----------
   A field config does not only draw an input. Mark it searchable and the
   list view has to offer a way to filter on it — and a filter is rarely the
   same control as the input. A text box becomes "contains". A number becomes
   a pair of bounds. A date becomes a span. A select becomes "any of".
   Same config, two renderings; that is the whole point of config-driven. */
const FILTER_KIND = {
  text: 'contains', textarea: 'contains', email: 'contains', url: 'contains',
  tel: 'contains', richtext: 'contains', lookup: 'contains', barcode: 'contains', tree: 'contains',
  number: 'range', currency: 'range', range: 'range', rating: 'range',
  date: 'dateRange', 'datetime-local': 'dateRange', time: 'dateRange',
  select: 'anyOf', radio: 'anyOf', multiselect: 'anyOf', checkbox: 'anyOf',
  toggle: 'bool',
};
/* password, file, signature, color, lineitems and computed are absent on
   purpose — there is nothing sensible to filter a list by. */

/* Help is written for whoever fills the form in, not for whoever builds it —
   so it is a sentence about this field, not a description of the type. */
const HELP = {
  text: 'Exactly as it appears on the contract.',
  textarea: 'Anything the delivery team should know before they start.',
  email: 'Invoices and the licence key are sent here.',
  url: 'Include https:// — we check the domain resolves.',
  tel: 'Only used if the delivery team needs to reach you.',
  password: 'Rotated every 90 days; you can change it later.',
  number: 'Named users, not concurrent sessions.',
  currency: 'Excluding VAT.',
  range: 'Drag to the nearest five per cent.',
  rating: 'One is poor, five is excellent.',
  select: 'You can change plan at any renewal.',
  multiselect: 'Pick every tag that applies.',
  checkbox: 'Modules can be added later without a new contract.',
  radio: 'Annual billing carries a discount.',
  toggle: 'You can review the full terms before you agree.',
  date: 'The first day users will be able to sign in.',
  time: 'Local time at the customer site.',
  'datetime-local': 'We hold the slot for 48 hours.',
  file: 'The signed copy, not the draft.',
  richtext: 'These terms appear on every invoice.',
  signature: 'Use a mouse, a trackpad or your finger.',
  color: 'Used on the portal header and on outgoing email.',
  otp: 'Six digits, valid for ten minutes.',
  barcode: 'Scan it, or type the code printed under the bars.',
  tree: 'Pick the most specific node that applies.',
  lookup: 'Start typing a name or a customer code.',
  lineitems: 'One row per item — the total updates as you type.',
  computed: 'Calculated for you; there is nothing to fill in.',
};

const WIDTHS = ['w-25', 'w-33', 'w-50', 'w-75', 'w-100'];

/* Some controls are the wrong shape for half a row; that is a property of
   the control, so it ships as the type's starting width, not a hard rule. */
const NATURAL_WIDTH = {
  textarea: 'w-100', checkbox: 'w-100', radio: 'w-100', multiselect: 'w-100',
  richtext: 'w-100', signature: 'w-100', lineitems: 'w-100', lookup: 'w-100', file: 'w-100',
  tree: 'w-100', otp: 'w-50', barcode: 'w-50',
};

/* The group order the palette renders in. */
export const GROUPS = ['Text', 'Numbers', 'Choice', 'Date & time', 'Files & rich', 'Business'];

/* A lookup points at a module, not at rows. The rows live here, the way they
   would live in a table the engine has never heard of. */
const TREE = [
  { id: 'HW', label: 'Hardware', children: [
    { id: 'HW-SRV', label: 'Servers', children: [
      { id: 'HW-SRV-RACK', label: 'Rack units' },
      { id: 'HW-SRV-BLADE', label: 'Blade chassis' },
    ]},
    { id: 'HW-NET', label: 'Networking' },
  ]},
  { id: 'SW', label: 'Software', children: [
    { id: 'SW-LIC', label: 'Licences' },
    { id: 'SW-SUB', label: 'Subscriptions' },
  ]},
  { id: 'SVC', label: 'Services' },
];

const DATASETS = {
  customers: [
    { id: 'CUS-1042', name: 'Acme Trading' },
    { id: 'CUS-1187', name: 'Nile Logistics' },
    { id: 'CUS-1203', name: 'Delta Foods' },
    { id: 'CUS-1288', name: 'Cairo Steel' },
    { id: 'CUS-1349', name: 'Orbit Telecom' },
    { id: 'CUS-1401', name: 'Sunrise Pharma' },
  ],
};


/* ---------- designed preview: a stylised mock of each control ----------
   Deliberately NOT a live input. A preview should read as a picture of the
   control — shape, affordance, icon — without inviting the visitor to type
   into something that goes nowhere. Skeleton bars stand in for content. */
const bar = (w) => `<span class="mk-bar" style="width:${w}"></span>`;
const mkIcon = (paths) =>
  `<span class="mk-icon"><svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor"
     stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg></span>`;

/* Date / time previews stay in the same skeleton language as the other
   controls: no digits anywhere, just dots and bars. The month grid is still
   built from today's real date, so the number of leading blanks and rows is
   an honest shape rather than a hand-drawn rectangle. */
const I_CAL   = '<rect x="3" y="5" width="14" height="12" rx="2"/><path d="M3 9h14M7 3v4M13 3v4"/>';
const I_CLOCK = '<circle cx="10" cy="10" r="7"/><path d="M10 6v4l2.5 2"/>';
const I_DT    = '<rect x="3" y="4" width="14" height="13" rx="2"/><path d="M3 8h14M7 2v4"/><path d="M12.5 12v1.6l1.2.9"/>';

function calendar(foot = '') {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const lead = (new Date(y, m, 1).getDay() + 6) % 7;        // Monday-first
  const len = new Date(y, m + 1, 0).getDate();
  const today = now.getDate();
  const sel = today + 3 > len ? Math.max(1, today - 3) : today + 3;

  /* Each cell carries its column position, so the grid fades left to right in
     exactly the same direction the skeleton bars do. Same material, larger
     canvas — nothing moves. */
  const tint = (i) => ((i % 7) / 6).toFixed(3);

  let cells = '';
  let i = 0;
  for (; i < lead; i++) cells += '<span class="mk-day is-out"></span>';
  for (let d = 1; d <= len; d++, i++) {
    const state = d === sel ? ' is-sel' : d === today ? ' is-today' : '';
    cells += `<span class="mk-day${state}" style="--t:${tint(i)}"><i class="mk-dot"></i></span>`;
  }
  const trail = (7 - (lead + len) % 7) % 7;
  for (let t = 0; t < trail; t++) cells += '<span class="mk-day is-out"></span>';

  const dows = Array.from({ length: 7 }, (_, c) =>
    `<span class="mk-dow" style="--t:${(c / 6).toFixed(3)}"><i></i></span>`).join('');

  return `<div class="mk-cal">
            <div class="mk-cal__head">
              <span class="mk-nav mk-nav--prev"></span>
              <span class="mk-bar mk-bar--title"></span>
              <span class="mk-nav mk-nav--next"></span>
            </div>
            <div class="mk-grid">${dows}${cells}</div>
            ${foot ? `<div class="mk-cal__foot">${foot}</div>` : ''}
          </div>`;
}

/* HH : MM as two separate segments — the focused one tinted, AM/PM as a
   two-state switch instead of a dropdown, so the whole value reads at once. */
const clockBars = () =>
  `<span class="mk-bar mk-bar--seg"></span><span class="mk-colon">:</span><span class="mk-bar mk-bar--seg"></span>`;

const timeStrip = (flat = false) => `
  <div class="mk-time${flat ? ' mk-time--flat' : ''}">
    <span class="mk-seg is-on"><span class="mk-bar mk-bar--seg"></span></span>
    <span class="mk-colon">:</span>
    <span class="mk-seg"><span class="mk-bar mk-bar--seg"></span></span>
    <span class="mk-ampm"><i class="is-on">AM</i><i>PM</i></span>
  </div>`;

/* The same dot the calendar grid uses, laid out in a row and carrying the
   same left-to-right falloff — one material, two shapes. */
const dotRow = (n) => Array.from({ length: n }, (_, i) =>
  `<i class="mk-dot" style="--t:${(i / (n - 1)).toFixed(3)}"></i>`).join('');

const star = (on, t) =>
  `<span class="mk-star${on ? ' is-on' : ''}" style="--t:${t}"><svg viewBox="0 0 20 20" width="18" height="18"
     fill="${on ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.3"
     stroke-linejoin="round" aria-hidden="true"><path d="m10 3.2 2.1 4.3 4.7.7-3.4 3.3.8 4.7L10 14l-4.2 2.2.8-4.7-3.4-3.3 4.7-.7z"/></svg></span>`;

const MOCKS = {
  text:     () => `<div class="mk-box">${bar('44%')}</div>`,
  textarea: () => `<div class="mk-box mk-box--tall">${bar('82%')}${bar('64%')}${bar('38%')}</div>`,
  email:    () => `<div class="mk-box">${mkIcon('<rect x="3" y="5" width="14" height="10" rx="2"/><path d="M3.5 6.5 10 11l6.5-4.5"/>')}${bar('26%')}<span class="mk-at">@</span>${bar('30%')}<span class="mk-tld">.com</span></div>`,
  url:      () => `<div class="mk-box">${mkIcon('<circle cx="10" cy="10" r="7"/><path d="M3 10h14M10 3a13 13 0 0 1 0 14a13 13 0 0 1 0-14"/>')}<span class="mk-tld">https://</span>${bar('38%')}</div>`,
  number:   () => `<div class="mk-box">${bar('22%')}<span class="mk-step"><i></i><i></i></span></div>`,
  password: () => `<div class="mk-box">${mkIcon('<rect x="4" y="9" width="12" height="7" rx="2"/><path d="M7 9V6.5a3 3 0 0 1 6 0V9"/>')}<span class="mk-dots">${dotRow(8)}</span></div>`,
  select:   () => `<div class="mk-box">${bar('34%')}<span class="mk-chev"></span></div>
                   <div class="mk-menu"><span class="mk-opt is-on">${bar('46%')}</span><span class="mk-opt">${bar('34%')}</span><span class="mk-opt">${bar('52%')}</span></div>`,
  checkbox: () => `<div class="mk-list">
                     <span class="mk-row"><i class="mk-check is-on"></i>${bar('30%')}</span>
                     <span class="mk-row"><i class="mk-check is-on"></i>${bar('22%')}</span>
                     <span class="mk-row"><i class="mk-check"></i>${bar('34%')}</span></div>`,
  radio:    () => `<div class="mk-list">
                     <span class="mk-row"><i class="mk-radio is-on"></i>${bar('26%')}</span>
                     <span class="mk-row"><i class="mk-radio"></i>${bar('32%')}</span></div>`,
  toggle:   () => `<div class="mk-row mk-row--switch"><span class="mk-switch"><i></i></span>${bar('28%')}</div>`,
  date:     () => `<div class="mk-box">${mkIcon(I_CAL)}${bar('34%')}<span class="mk-chev"></span></div>${calendar()}`,
  time:     () => `<div class="mk-box">${mkIcon(I_CLOCK)}${clockBars()}<em class="mk-mer">AM</em><span class="mk-chev"></span></div>
                   <div class="mk-panel">${timeStrip()}</div>`,
  'datetime-local': () => `<div class="mk-box">${mkIcon(I_DT)}${bar('26%')}<span class="mk-pip"></span>${clockBars()}<em class="mk-mer">AM</em></div>${calendar(timeStrip(true))}`,
  file:     () => `<div class="mk-drop">${mkIcon('<path d="M10 14V5m0 0L6.5 8.5M10 5l3.5 3.5M4 15h12"/>')}
                     <span class="mk-stack mk-stack--mid">${bar('128px')}${bar('76px')}</span></div>
                   <div class="mk-file"><i class="mk-page"></i>
                     <span class="mk-stack">${bar('104px')}${bar('46px')}</span>
                     <i class="mk-x mk-x--mute"></i></div>`,

  tel:      () => `<div class="mk-box"><span class="mk-pill">+20 <i class="mk-caret"></i></span>${bar('40%')}</div>`,
  currency: () => `<div class="mk-box"><span class="mk-pill">EGP <i class="mk-caret"></i></span>${bar('30%')}</div>`,
  range:    () => `<div class="mk-track"><span class="mk-fill"></span><span class="mk-knob"></span></div>`,
  rating:   () => { const filled = [1, 1, 1, 1, 0];
                    return `<div class="mk-stars">${filled
                      .map((on, i) => star(on, (i / (filled.length - 1)).toFixed(3)))
                      .join('')}</div>`; },

  multiselect: () => `<div class="mk-box">${bar('26%')}<span class="mk-chev"></span></div>
                      <div class="mk-tags"><span class="mk-tag is-on">${bar('34px')}<i class="mk-x"></i></span>
                        <span class="mk-tag is-on">${bar('22px')}<i class="mk-x"></i></span>
                        <span class="mk-tag">${bar('40px')}</span><span class="mk-tag">${bar('28px')}</span></div>`,

  richtext: () => `<div class="mk-rt">
                     <div class="mk-rt__bar"><b>B</b><em>I</em><span class="mk-rt__ul"><i></i><i></i><i></i></span></div>
                     <div class="mk-rt__body">${bar('88%')}${bar('72%')}${bar('46%')}</div>
                   </div>`,

  signature: () => `<div class="mk-sign"><svg viewBox="0 0 160 46" preserveAspectRatio="none" aria-hidden="true">
                      <path d="M6 34C22 34 20 12 32 12s10 22 22 22 12-18 26-18 10 16 22 16 14-10 26-10"
                            fill="none" stroke="currentColor" stroke-width="2.2"
                            stroke-linecap="round" stroke-linejoin="round"/></svg>
                    <span class="mk-sign__rule"></span></div>`,

  color:    () => `<div class="mk-box"><span class="mk-swatch"></span>${bar('26%')}</div>`,

  lookup:   () => `<div class="mk-box">${mkIcon('<circle cx="9" cy="9" r="5.2"/><path d="m12.8 12.8 4.2 4.2"/>')}${bar('34%')}<span class="mk-chev"></span></div>
                   <div class="mk-menu">
                     <span class="mk-opt is-on"><i class="mk-avatar"></i><span class="mk-stack">${bar('58px')}${bar('34px')}</span></span>
                     <span class="mk-opt"><i class="mk-avatar"></i><span class="mk-stack">${bar('46px')}${bar('34px')}</span></span>
                     <span class="mk-opt"><i class="mk-avatar"></i><span class="mk-stack">${bar('66px')}${bar('34px')}</span></span>
                   </div>`,

  lineitems: () => `<div class="mk-tbl">
                      <div class="mk-tr mk-tr--head">${bar('54px')}${bar('20px')}${bar('34px')}</div>
                      <div class="mk-tr">${bar('76px')}${bar('16px')}${bar('40px')}</div>
                      <div class="mk-tr">${bar('58px')}${bar('16px')}${bar('40px')}</div>
                      <div class="mk-tr mk-tr--add"><span class="mk-plus"></span>${bar('44px')}</div>
                    </div>`,

  computed: () => `<div class="mk-box mk-box--ro"><span class="mk-fx">=</span>${bar('28%')}</div>
                   <div class="mk-expr">${bar('18px')}<span class="mk-op">×</span>${bar('24px')}</div>`,

  otp:      () => `<div class="mk-otp">${Array.from({ length: 6 }, (_, i) =>
                     `<span class="mk-otp__cell${i < 3 ? ' is-on' : ''}" style="--t:${(i / 5).toFixed(3)}">${
                       i < 3 ? '<i class="mk-dot"></i>' : ''}</span>`).join('')}</div>`,

  barcode:  () => `<div class="mk-box">${mkIcon('<path d="M3 4v12M6 4v12M8.5 4v12M11.5 4v9M14 4v12M17 4v12"/>')}${bar('34%')}</div>
                   <div class="mk-bars">${[3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2]
                     .map((w, i) => `<i style="--w:${w}px;--t:${(i / 19).toFixed(3)}"></i>`).join('')}</div>`,

  tree:     () => `<div class="mk-box">${bar('30%')}<span class="mk-chev"></span></div>
                   <div class="mk-tree">
                     <span class="mk-node" style="--d:0"><i class="mk-twist"></i>${bar('62px')}</span>
                     <span class="mk-node" style="--d:1"><i class="mk-twist"></i>${bar('50px')}</span>
                     <span class="mk-node is-on" style="--d:2"><i class="mk-leaf"></i>${bar('68px')}</span>
                     <span class="mk-node" style="--d:2"><i class="mk-leaf"></i>${bar('54px')}</span>
                     <span class="mk-node" style="--d:1"><i class="mk-leaf"></i>${bar('44px')}</span>
                   </div>`,
};

export function renderMock(control, mount) {
  const build = MOCKS[control.type] || MOCKS.text;
  mount.innerHTML =
    `<div class="mk" data-type="${control.type}">
       <span class="mk-label">${control.sample.label}</span>
       ${build()}
     </div>`;
}

const el = (tag, cls, attrs = {}) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  for (const [k, v] of Object.entries(attrs)) {
    if (v === true) n.setAttribute(k, '');
    else if (v !== false && v != null) n.setAttribute(k, v);
  }
  return n;
};

const STAR = `<svg viewBox="0 0 20 20" width="19" height="19" fill="none" stroke="currentColor"
  stroke-width="1.3" stroke-linejoin="round" aria-hidden="true"><path d="m10 3.2 2.1 4.3 4.7.7-3.4
  3.3.8 4.7L10 14l-4.2 2.2.8-4.7-3.4-3.3 4.7-.7z"/></svg>`;

/* ---------- a deliberately tiny expression language ----------
   Numbers, field keys, + - * / ( ) and sum(...) over the rows of a Line Items
   field. Hand-written, because eval() and new Function() have no business
   running a string that came out of a config file. */
const baseKey = (k) => String(k).replace(/_\d+$/, '');
const tokenize = (src) => String(src).match(/[A-Za-z_]\w*|\d+(?:\.\d+)?|[()+\-*/]/g) || [];

function evalTokens(tokens, scope) {
  let i = 0;
  const peek = () => tokens[i];
  const take = () => tokens[i++];

  function primary() {
    const t = take();
    if (t === undefined) return 0;
    if (t === '(') { const v = sum(); if (peek() === ')') take(); return v; }
    if (t === '-') return -primary();
    if (/^\d/.test(t)) return parseFloat(t);
    if (peek() === '(') {                      // a call, e.g. sum(qty * price)
      take();
      const inner = [];
      let depth = 1;
      while (i < tokens.length) {
        const n = tokens[i];
        if (n === '(') depth += 1;
        if (n === ')') { depth -= 1; if (!depth) { i += 1; break; } }
        inner.push(tokens[i]); i += 1;
      }
      return scope.call(t, inner);
    }
    return scope.get(t);
  }
  function product() {
    let v = primary();
    while (peek() === '*' || peek() === '/') {
      const op = take(); const r = primary();
      v = op === '*' ? v * r : (r ? v / r : 0);
    }
    return v;
  }
  function sum() {
    let v = product();
    while (peek() === '+' || peek() === '-') {
      const op = take(); const r = product();
      v = op === '+' ? v + r : v - r;
    }
    return v;
  }
  const out = sum();
  return Number.isFinite(out) ? out : 0;
}

function readLineItems(form, f) {
  const host = form.querySelector(`[data-items="${f.key}"]`);
  if (!host) return [];
  return [...host.querySelectorAll('.fb-items__body > .fb-items__row')].map((row) => {
    const o = {};
    (f.fields || []).forEach((c) => {
      const cell = row.querySelector(`[data-col="${c.key}"]`);
      o[c.key] = c.type === 'number' ? (Number(cell && cell.value) || 0) : (cell ? cell.value : '');
    });
    return o;
  });
}

/* Runs on every input event: a computed field is never typed into, it is
   always the answer to its own expression. */
function recompute(form, fields) {
  const items = fields.find((f) => f.type === 'lineitems');
  const rows = items ? readLineItems(form, items) : [];

  const flat = {};
  fields.forEach((f) => {
    if (!['number', 'range', 'rating', 'currency'].includes(f.type)) return;
    const n = form.querySelector(`[name="${f.key}"]`);
    if (n) flat[baseKey(f.key)] = Number(n.value) || 0;
  });

  const scope = {
    get: (k) => flat[baseKey(k)] || 0,
    call: (name, inner) => {
      if (name !== 'sum') return 0;
      return rows.reduce((acc, row) => acc + evalTokens(inner, {
        get: (k) => Number(row[baseKey(k)] != null ? row[baseKey(k)] : flat[baseKey(k)]) || 0,
        call: () => 0,
      }), 0);
    },
  };

  fields.filter((f) => f.type === 'computed').forEach((f) => {
    const host = form.querySelector(`[data-computed="${f.key}"]`);
    if (!host) return;
    const out = host.querySelector('input');
    let v = 0;
    try { v = evalTokens(tokenize(f.expr || '0'), scope); } catch { v = 0; }
    out.value = f.format === 'currency'
      ? v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : String(Math.round(v * 1000) / 1000);
    out.dataset.value = String(v);
  });
}

/* Every popover owes the visitor the same two exits: Escape from anywhere
   inside it, and a click somewhere else. Wiring that per component is how
   one of them ends up missing it. */
function dismissable(wrap, close, isOpen) {
  // Escape listens on the document, not on the wrapper: a click inside a
  // popover does not always leave focus there, and the key has to work anyway.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !isOpen()) return;
    close();
    const btn = wrap.querySelector('button');
    if (btn) btn.focus();
  });
  document.addEventListener('pointerdown', (e) => {
    if (isOpen() && !wrap.contains(e.target)) close();
  });
}

/* ---------- a listbox, because the native one is not ours to design ----------
   A <select>'s popup is drawn by the operating system: its own font, its own
   highlight colour, its own metrics. Nothing in a design system reaches it.
   So this is a real combobox — button, listbox, hidden input for the value —
   with the keyboard behaviour people expect from the native one. */
function dropdown({ options, value, name, id, label, small, required, onChange }) {
  const wrap = el('div', 'fb-select' + (small ? ' fb-select--sm' : ''));
  const hidden = el('input', null, { type: 'hidden', name, required: !!required });
  const btn = el('button', 'fb-select__btn', {
    type: 'button', id, role: 'combobox', 'aria-haspopup': 'listbox',
    'aria-expanded': 'false', 'aria-label': label || name,
  });
  const text = el('span', 'fb-select__value');
  const list = el('ul', 'fb-select__list', { role: 'listbox', 'data-lenis-prevent': true });
  list.hidden = true;
  btn.append(text, el('i', 'fb-select__chev'));

  const items = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  let index = Math.max(0, items.findIndex((o) => o.value === value));

  const paint = () => {
    const chosen = items[index];
    hidden.value = chosen ? chosen.value : '';
    text.textContent = chosen ? chosen.label : '';
    list.querySelectorAll('li').forEach((li, i) => {
      li.setAttribute('aria-selected', String(i === index));
      li.classList.toggle('is-on', i === index);
    });
  };

  const close = () => {
    list.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  };
  const open = () => {
    list.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    const on = list.querySelector('.is-on');
    if (on) on.scrollIntoView({ block: 'nearest' });
  };
  const choose = (i) => {
    index = i;
    paint();
    close();
    btn.focus();
    hidden.dispatchEvent(new Event('input', { bubbles: true }));
    if (onChange) onChange(items[i]);
  };

  items.forEach((o, i) => {
    const li = el('li', 'fb-select__opt', { role: 'option', 'aria-selected': 'false' });
    li.textContent = o.label;
    li.addEventListener('mousedown', (e) => { e.preventDefault(); choose(i); });
    list.appendChild(li);
  });

  btn.addEventListener('click', () => (list.hidden ? open() : close()));
  btn.addEventListener('keydown', (e) => {
    const openNow = !list.hidden;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openNow ? choose(index) : open(); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!openNow) { open(); return; }
      index = (index + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      paint();
      list.querySelector('.is-on').scrollIntoView({ block: 'nearest' });
      return;
    }
    if (e.key === 'Home') { e.preventDefault(); index = 0; paint(); return; }
    if (e.key === 'End') { e.preventDefault(); index = items.length - 1; paint(); return; }
    // type-ahead, the one native behaviour people miss when it is gone
    if (e.key.length === 1 && /\S/.test(e.key)) {
      const from = items.findIndex((o, i) => i > index && o.label.toLowerCase().startsWith(e.key.toLowerCase()));
      const at = from > -1 ? from : items.findIndex((o) => o.label.toLowerCase().startsWith(e.key.toLowerCase()));
      if (at > -1) { index = at; paint(); if (openNow) list.querySelector('.is-on').scrollIntoView({ block: 'nearest' }); }
    }
  });
  dismissable(wrap, close, () => !list.hidden);

  wrap.append(btn, hidden, list);
  paint();
  return wrap;
}

/* ---------- date and time, ours as well ----------
   <input type="date"> hands the browser a text format we never chose
   (mm/dd/yyyy on one machine, dd/mm/yyyy on the next) and a calendar drawn
   by the OS. The preview panel already shows the calendar this design wants;
   this is that calendar, made real. */
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                     'August', 'September', 'October', 'November', 'December'];
const pad2 = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const prettyDate = (d) => `${pad2(d.getDate())} ${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;

function datePicker({ name, id, label, withTime, required }) {
  const wrap = el('div', 'fb-date');
  const hidden = el('input', null, { type: 'hidden', name, required: !!required });
  const btn = el('button', 'fb-date__btn', {
    type: 'button', id, 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-label': label || name,
  });
  const text = el('span', 'fb-date__value');
  text.textContent = withTime ? 'Pick a date and time' : 'Pick a date';
  btn.append(el('i', 'fb-date__icon'), text);

  const pop = el('div', 'fb-date__pop', { role: 'dialog', 'aria-label': label || 'Calendar', 'data-lenis-prevent': true });
  pop.hidden = true;

  const today = new Date();
  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  let picked = null;
  let hh = 9, mm = 0;

  const head = el('div', 'fb-date__head');
  const prev = el('button', 'fb-date__nav', { type: 'button', 'aria-label': 'Previous month' });
  const next = el('button', 'fb-date__nav fb-date__nav--next', { type: 'button', 'aria-label': 'Next month' });
  const title = el('span', 'fb-date__title');
  head.append(prev, title, next);

  const grid = el('div', 'fb-date__grid');
  pop.append(head, grid);

  let timeRow = null, hourEl = null, minEl = null, merEl = null;
  if (withTime) {
    timeRow = el('div', 'fb-date__time');
    hourEl = el('button', 'fb-date__seg', { type: 'button', 'aria-label': 'Hour' });
    minEl = el('button', 'fb-date__seg', { type: 'button', 'aria-label': 'Minute' });
    const colon = el('span', 'fb-date__colon'); colon.textContent = ':';
    merEl = el('span', 'fb-date__mer');
    ['AM', 'PM'].forEach((m) => {
      const b = el('button', 'fb-date__merbtn', { type: 'button', 'aria-pressed': String(m === 'AM') });
      b.textContent = m;
      b.addEventListener('click', () => {
        const isPm = m === 'PM';
        hh = (hh % 12) + (isPm ? 12 : 0);
        paint();
      });
      merEl.appendChild(b);
    });
    hourEl.addEventListener('click', () => { hh = (hh + 1) % 24; paint(); });
    minEl.addEventListener('click', () => { mm = (mm + 15) % 60; paint(); });
    timeRow.append(hourEl, colon, minEl, merEl);
    pop.appendChild(timeRow);
  }

  const emit = () => {
    if (!picked) { hidden.value = ''; return; }
    hidden.value = withTime ? `${iso(picked)}T${pad2(hh)}:${pad2(mm)}` : iso(picked);
    text.textContent = withTime
      ? `${prettyDate(picked)} · ${pad2(hh % 12 || 12)}:${pad2(mm)} ${hh < 12 ? 'AM' : 'PM'}`
      : prettyDate(picked);
    text.classList.add('is-set');
    hidden.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const paint = () => {
    title.textContent = `${MONTH_NAMES[view.getMonth()]} ${view.getFullYear()}`;
    grid.innerHTML = '';
    ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach((d) => {
      const h = el('span', 'fb-date__dow'); h.textContent = d; grid.appendChild(h);
    });
    const lead = (new Date(view.getFullYear(), view.getMonth(), 1).getDay() + 6) % 7;
    const len = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    for (let i = 0; i < lead; i++) grid.appendChild(el('span', 'fb-date__pad'));
    for (let d = 1; d <= len; d++) {
      const cell = new Date(view.getFullYear(), view.getMonth(), d);
      const b = el('button', 'fb-date__day', { type: 'button' });
      b.textContent = d;
      if (iso(cell) === iso(today)) b.classList.add('is-today');
      if (picked && iso(cell) === iso(picked)) { b.classList.add('is-sel'); b.setAttribute('aria-pressed', 'true'); }
      b.addEventListener('click', () => { picked = cell; paint(); emit(); if (!withTime) close(); });
      grid.appendChild(b);
    }
    if (withTime) {
      hourEl.textContent = pad2(hh % 12 || 12);
      minEl.textContent = pad2(mm);
      [...merEl.children].forEach((c) => c.setAttribute('aria-pressed', String((c.textContent === 'PM') === hh >= 12)));
      if (picked) emit();
    }
  };

  const close = () => { pop.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
  const open = () => { pop.hidden = false; btn.setAttribute('aria-expanded', 'true'); paint(); };

  prev.addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); paint(); });
  next.addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); paint(); });
  btn.addEventListener('click', () => (pop.hidden ? open() : close()));
  dismissable(wrap, close, () => !pop.hidden);

  wrap.append(btn, hidden, pop);
  paint();
  return wrap;
}

/* A time on its own: no calendar, just the clock the preview draws. */
function timePicker({ name, id, label, required }) {
  const wrap = el('div', 'fb-date');
  const hidden = el('input', null, { type: 'hidden', name, required: !!required });
  const btn = el('button', 'fb-date__btn', {
    type: 'button', id, 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-label': label || name,
  });
  const text = el('span', 'fb-date__value');
  text.textContent = 'Pick a time';
  btn.append(el('i', 'fb-date__icon fb-date__icon--clock'), text);

  const pop = el('div', 'fb-date__pop fb-date__pop--time', { role: 'dialog', 'data-lenis-prevent': true });
  pop.hidden = true;
  const cols = el('div', 'fb-time__cols');
  const hourList = el('div', 'fb-time__col', { role: 'listbox', 'aria-label': 'Hour', 'data-lenis-prevent': true });
  const minList = el('div', 'fb-time__col', { role: 'listbox', 'aria-label': 'Minute', 'data-lenis-prevent': true });
  const merList = el('div', 'fb-time__col fb-time__col--mer', { role: 'listbox', 'aria-label': 'AM or PM' });
  cols.append(hourList, minList, merList);
  pop.appendChild(cols);

  let h12 = null, mm = null, mer = 'AM';

  const emit = () => {
    if (h12 == null || mm == null) return;
    const h24 = (h12 % 12) + (mer === 'PM' ? 12 : 0);
    hidden.value = `${pad2(h24)}:${pad2(mm)}`;
    text.textContent = `${pad2(h12)}:${pad2(mm)} ${mer}`;
    text.classList.add('is-set');
    hidden.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const mark = (list, value) => list.querySelectorAll('button').forEach((b) => {
    const on = b.dataset.v === String(value);
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-selected', String(on));
  });

  for (let h = 1; h <= 12; h++) {
    const b = el('button', 'fb-time__opt', { type: 'button', role: 'option', 'aria-selected': 'false' });
    b.textContent = pad2(h); b.dataset.v = h;
    b.addEventListener('click', () => { h12 = h; mark(hourList, h); emit(); });
    hourList.appendChild(b);
  }
  for (let m = 0; m < 60; m += 5) {
    const b = el('button', 'fb-time__opt', { type: 'button', role: 'option', 'aria-selected': 'false' });
    b.textContent = pad2(m); b.dataset.v = m;
    b.addEventListener('click', () => { mm = m; mark(minList, m); emit(); });
    minList.appendChild(b);
  }
  ['AM', 'PM'].forEach((x) => {
    const b = el('button', 'fb-time__opt', { type: 'button', role: 'option', 'aria-selected': String(x === 'AM') });
    b.textContent = x; b.dataset.v = x;
    if (x === 'AM') b.classList.add('is-on');
    b.addEventListener('click', () => { mer = x; mark(merList, x); emit(); });
    merList.appendChild(b);
  });

  const close = () => { pop.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
  btn.addEventListener('click', () => {
    pop.hidden = !pop.hidden;
    btn.setAttribute('aria-expanded', String(!pop.hidden));
  });
  dismissable(wrap, close, () => !pop.hidden);

  wrap.append(btn, hidden, pop);
  return wrap;
}

/* ---------- the engine: one field config -> one DOM control ---------- */
function buildField(f, idx) {
  const id = `fb-${f.key || idx}`;
  const rules = f.rules || {};
  const width = f.width || NATURAL_WIDTH[f.type] || 'w-50';
  const wrap = el('div', `fb-field ${width}`);
  wrap.dataset.field = f.key;

  const label = el('label', 'fb-label', { for: id });
  label.textContent = f.label || f.key || `Field ${idx + 1}`;
  if (rules.required || rules.requiredTrue) { const s = el('span', 'fb-req'); s.textContent = '*'; label.appendChild(s); }
  wrap.appendChild(label);

  let input;
  switch (f.type) {
    case 'select':
      input = dropdown({ options: f.options || [], value: f.value, name: f.key,
                         id, label: f.label, required: !!rules.required });
      break;

    case 'checkbox':
    case 'radio': {
      input = el('div', 'fb-choices', { id, role: 'group' });
      const chosen = Array.isArray(f.value) ? f.value : [f.value];
      (f.options || []).forEach((o) => {
        const lab = el('label', `fb-choice fb-choice--${f.type}`);
        const box = el('input', null, { type: f.type, name: f.key, value: o });
        box.checked = chosen.includes(o);
        const mark = el('i', 'fb-choice__mark');
        lab.append(box, mark, document.createTextNode(o));
        input.appendChild(lab);
      });
      break;
    }

    case 'toggle': {
      input = el('label', 'fb-switch');
      const box = el('input', null, { type: 'checkbox', name: f.key, id });
      box.checked = !!f.value;
      const track = el('span', 'fb-switch__track');
      input.append(box, track);
      break;
    }

    case 'textarea':
      input = el('textarea', 'fb-input', { id, name: f.key, rows: 3, required: !!rules.required, placeholder: f.placeholder || '' });
      if (f.value) input.value = f.value;
      break;

    case 'tel': {
      input = el('div', 'fb-tel');
      const dial = dropdown({ options: f.dials || [f.dial || '+20'], value: f.dial,
                              name: `${f.key}__dial`, label: 'Dial code', small: true });
      dial.classList.add('fb-select--tight');
      const num = el('input', 'fb-input', { id, type: 'tel', name: f.key, inputmode: 'tel',
        required: !!rules.required, placeholder: f.placeholder || '' });
      input.append(dial, num);
      break;
    }

    case 'currency': {
      input = el('div', 'fb-money');
      const cur = dropdown({ options: f.currencies || [f.currency || 'USD'], value: f.currency,
                             name: `${f.key}__cur`, label: 'Currency', small: true });
      cur.classList.add('fb-select--tight');
      const amt = el('input', 'fb-input', { id, type: 'number', name: f.key, step: '0.01', min: 0, required: !!rules.required });
      if (f.value != null) amt.value = f.value;
      input.append(cur, amt);
      break;
    }

    case 'range': {
      input = el('div', 'fb-range');
      const r = el('input', 'fb-range__input', { id, type: 'range', name: f.key,
        min: f.min != null ? f.min : 0, max: f.max != null ? f.max : 100, step: f.step || 1 });
      r.value = f.value != null ? f.value : (f.min || 0);
      const out = el('output', 'fb-range__out');
      const paint = () => {
        out.textContent = r.value;
        const span = Number(r.max) - Number(r.min) || 1;
        r.style.setProperty('--pct', `${((Number(r.value) - Number(r.min)) / span) * 100}%`);
      };
      r.addEventListener('input', paint);
      input.append(r, out);
      paint();
      break;
    }

    case 'rating': {
      const max = f.max || 5;
      input = el('div', 'fb-rating', { role: 'group', 'aria-label': f.label || 'Rating' });
      const hidden = el('input', null, { type: 'hidden', name: f.key });
      hidden.value = f.value != null ? String(f.value) : '0';
      const paint = () => input.querySelectorAll('.fb-star').forEach((b, i) =>
        b.classList.toggle('is-on', i < Number(hidden.value)));
      for (let n = 1; n <= max; n++) {
        const btn = el('button', 'fb-star', { type: 'button', 'aria-label': `${n} of ${max}` });
        btn.innerHTML = STAR;
        btn.addEventListener('click', () => {
          hidden.value = String(n); paint();
          hidden.dispatchEvent(new Event('input', { bubbles: true }));
        });
        input.appendChild(btn);
      }
      input.appendChild(hidden);
      paint();
      break;
    }

    case 'multiselect': {
      input = el('div', 'fb-tags', { role: 'group', 'aria-label': f.label || 'Tags' });
      const chosen = new Set(Array.isArray(f.value) ? f.value : []);
      const hidden = el('input', null, { type: 'hidden', name: f.key });
      const sync = () => { hidden.value = [...chosen].join('|'); };
      (f.options || []).forEach((o) => {
        const b = el('button', 'fb-tag', { type: 'button', 'aria-pressed': String(chosen.has(o)) });
        b.textContent = o;
        b.addEventListener('click', () => {
          chosen.has(o) ? chosen.delete(o) : chosen.add(o);
          b.setAttribute('aria-pressed', String(chosen.has(o)));
          sync();
          hidden.dispatchEvent(new Event('input', { bubbles: true }));
        });
        input.appendChild(b);
      });
      input.appendChild(hidden);
      sync();
      break;
    }

    case 'richtext': {
      input = el('div', 'fb-rt');
      const tools = el('div', 'fb-rt__bar');
      const body = el('div', 'fb-rt__body', { id, contenteditable: 'true', role: 'textbox', 'aria-multiline': 'true' });
      body.innerHTML = f.value || '';
      const hidden = el('input', null, { type: 'hidden', name: f.key });
      const sync = () => { hidden.value = body.innerHTML; };
      [['bold', 'B'], ['italic', 'I'], ['insertUnorderedList', '•']].forEach(([cmd, txt]) => {
        const b = el('button', 'fb-rt__btn', { type: 'button', 'aria-label': cmd });
        b.textContent = txt;
        b.addEventListener('mousedown', (e) => { e.preventDefault(); body.focus(); document.execCommand(cmd); sync(); });
        tools.appendChild(b);
      });
      body.addEventListener('input', sync);
      input.append(tools, body, hidden);
      sync();
      break;
    }

    case 'signature': {
      input = el('div', 'fb-sign');
      const pad = el('canvas', 'fb-sign__pad', { id });
      const hidden = el('input', null, { type: 'hidden', name: f.key });
      const clear = el('button', 'fb-sign__clear', { type: 'button' });
      clear.textContent = 'Clear';
      input.append(pad, clear, hidden);
      // the canvas has to be laid out before it can be sized
      requestAnimationFrame(() => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = pad.clientWidth || 320, h = 108;
        pad.width = w * dpr; pad.height = h * dpr; pad.style.height = `${h}px`;
        const ctx = pad.getContext('2d');
        ctx.scale(dpr, dpr);
        ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#e9b872';
        let drawing = false, empty = true;
        const at = (e) => { const r = pad.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
        pad.addEventListener('pointerdown', (e) => {
          drawing = true; pad.setPointerCapture(e.pointerId);
          const [x, y] = at(e); ctx.beginPath(); ctx.moveTo(x, y);
        });
        pad.addEventListener('pointermove', (e) => {
          if (!drawing) return;
          const [x, y] = at(e); ctx.lineTo(x, y); ctx.stroke(); empty = false;
        });
        const stop = () => {
          if (!drawing) return;
          drawing = false;
          if (!empty) { hidden.value = pad.toDataURL('image/png'); hidden.dispatchEvent(new Event('input', { bubbles: true })); }
        };
        pad.addEventListener('pointerup', stop);
        pad.addEventListener('pointerleave', stop);
        clear.addEventListener('click', () => {
          ctx.clearRect(0, 0, pad.width, pad.height); empty = true; hidden.value = '';
        });
      });
      break;
    }

    case 'color': {
      /* The OS colour panel is a whole application and none of it is ours.
         A brand colour is picked from a short list far more often than it is
         dialled in, so: swatches, plus a hex field for the exact one. */
      const SWATCHES = ['#e9b872', '#c8924a', '#7fb3a0', '#6f8fd6', '#b57fd6',
                        '#d67f8f', '#4f5a6b', '#f3f0ea', '#0a0a0b'];
      input = el('div', 'fb-color');
      const hidden = el('input', null, { type: 'hidden', name: f.key });
      const chips = el('div', 'fb-color__row', { role: 'radiogroup', 'aria-label': f.label || 'Colour' });
      const hex = el('input', 'fb-input fb-input--sm fb-color__hex', {
        id, type: 'text', maxlength: 7, spellcheck: 'false', 'aria-label': 'Hex value',
      });
      const bead = el('span', 'fb-color__bead');

      const apply = (v, fromHex) => {
        hidden.value = v;
        bead.style.background = v;
        if (!fromHex) hex.value = v;
        chips.querySelectorAll('button').forEach((b) =>
          b.setAttribute('aria-checked', String(b.dataset.v.toLowerCase() === v.toLowerCase())));
        hidden.dispatchEvent(new Event('input', { bubbles: true }));
      };

      SWATCHES.forEach((v) => {
        const b = el('button', 'fb-color__chip', { type: 'button', role: 'radio', 'aria-checked': 'false', 'aria-label': v });
        b.dataset.v = v;
        b.style.background = v;
        b.addEventListener('click', () => apply(v));
        chips.appendChild(b);
      });

      hex.addEventListener('input', () => {
        let v = hex.value.trim();
        if (v && v[0] !== '#') v = `#${v}`;
        if (/^#[0-9a-fA-F]{6}$/.test(v)) apply(v, true);
      });

      const field = el('div', 'fb-color__field');
      field.append(bead, hex);
      input.append(chips, field, hidden);   // the value has to be in the form, not just in scope
      apply(f.value || SWATCHES[0]);
      break;
    }

    case 'lookup': {
      const rows = DATASETS[f.ref] || [];
      input = el('div', 'fb-lookup');
      const search = el('input', 'fb-input', { id, type: 'text', autocomplete: 'off',
        role: 'combobox', 'aria-expanded': 'false', placeholder: `Search ${f.ref}…` });
      const hidden = el('input', null, { type: 'hidden', name: f.key, required: !!rules.required });
      const list = el('ul', 'fb-lookup__list', { role: 'listbox', 'data-lenis-prevent': true });
      list.hidden = true;

      const paint = (q) => {
        const t = q.trim().toLowerCase();
        list.innerHTML = '';
        const hits = rows.filter((r) =>
          !t || r.name.toLowerCase().includes(t) || r.id.toLowerCase().includes(t)).slice(0, 5);
        hits.forEach((r) => {
          const li = el('li', 'fb-lookup__row', { role: 'option', tabindex: '0' });
          li.innerHTML = `<b></b><small></small>`;
          li.querySelector('b').textContent = r.name;
          li.querySelector('small').textContent = r.id;
          const pick = () => {
            search.value = r.name; hidden.value = r.id;
            list.hidden = true; search.setAttribute('aria-expanded', 'false');
            hidden.dispatchEvent(new Event('input', { bubbles: true }));
          };
          li.addEventListener('mousedown', (e) => { e.preventDefault(); pick(); });
          li.addEventListener('keydown', (e) => { if (e.key === 'Enter') pick(); });
          list.appendChild(li);
        });
        list.hidden = !hits.length;
        search.setAttribute('aria-expanded', String(!!hits.length));
      };

      search.addEventListener('focus', () => paint(search.value));
      search.addEventListener('input', () => { hidden.value = ''; paint(search.value); });
      search.addEventListener('blur', () => setTimeout(() => { list.hidden = true; }, 140));
      input.append(search, hidden, list);
      break;
    }

    case 'lineitems': {
      const cols = f.fields || [];
      input = el('div', 'fb-items');
      input.dataset.items = f.key;
      input.style.setProperty('--cols', cols.length);

      const head = el('div', 'fb-items__row fb-items__row--head');
      cols.forEach((c) => { const h = el('span'); h.textContent = c.label || c.key; head.appendChild(h); });
      head.appendChild(el('span'));

      const body = el('div', 'fb-items__body');
      const foot = el('div', 'fb-items__foot');
      const addBtn = el('button', 'fb-items__add', { type: 'button' });
      addBtn.textContent = '+ Add row';
      const count = el('span', 'fb-items__count');

      const sync = () => {
        const n = body.children.length;
        count.textContent = `${n} row${n === 1 ? '' : 's'}`;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      };
      const addRow = (vals) => {
        const row = el('div', 'fb-items__row');
        cols.forEach((c) => {
          const cell = el('input', 'fb-input fb-input--sm', {
            type: c.type === 'number' ? 'number' : 'text',
            'data-col': c.key, 'aria-label': c.label || c.key, placeholder: c.label || c.key,
          });
          const v = vals && vals[c.key] != null ? vals[c.key] : c.value;
          if (v != null) cell.value = v;
          row.appendChild(cell);
        });
        const del = el('button', 'fb-items__del', { type: 'button', 'aria-label': 'Remove row' });
        del.textContent = '×';
        del.addEventListener('click', () => { row.remove(); sync(); });
        row.appendChild(del);
        body.appendChild(row);
        sync();
      };

      addBtn.addEventListener('click', () => addRow());
      foot.append(addBtn, count);
      input.append(head, body, foot);
      addRow(); addRow();
      break;
    }

    case 'otp': {
      const n = f.length || 6;
      input = el('div', 'fb-otp', { role: 'group', 'aria-label': f.label || 'One-time code' });
      const hidden = el('input', null, { type: 'hidden', name: f.key });
      const cells = [];
      const sync = () => { hidden.value = cells.map((c) => c.value).join(''); };

      for (let i = 0; i < n; i++) {
        const c = el('input', 'fb-otp__cell', {
          type: 'text', inputmode: 'numeric', maxlength: 1, 'aria-label': `Digit ${i + 1} of ${n}`,
        });
        if (i === 0) c.id = id;
        c.addEventListener('input', () => {
          c.value = c.value.replace(/\D/g, '').slice(0, 1);
          if (c.value && cells[i + 1]) cells[i + 1].focus();
          sync();
          hidden.dispatchEvent(new Event('input', { bubbles: true }));
        });
        c.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && !c.value && cells[i - 1]) cells[i - 1].focus();
          if (e.key === 'ArrowLeft' && cells[i - 1]) cells[i - 1].focus();
          if (e.key === 'ArrowRight' && cells[i + 1]) cells[i + 1].focus();
        });
        // one paste fills the row, which is how people actually enter these
        c.addEventListener('paste', (e) => {
          e.preventDefault();
          const digits = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, n - i);
          [...digits].forEach((d, k) => { if (cells[i + k]) cells[i + k].value = d; });
          const last = Math.min(i + digits.length, n - 1);
          cells[last].focus();
          sync();
          hidden.dispatchEvent(new Event('input', { bubbles: true }));
        });
        cells.push(c);
        input.appendChild(c);
      }
      input.appendChild(hidden);
      break;
    }

    case 'barcode': {
      input = el('div', 'fb-barcode');
      const box = el('input', 'fb-input', { id, type: 'text', name: f.key,
        placeholder: f.placeholder || 'Scan or type', autocomplete: 'off', spellcheck: 'false' });
      const strip = el('div', 'fb-barcode__strip', { 'aria-hidden': 'true' });

      // a real symbology would encode this; here the bars are drawn from the
      // characters so the strip changes with the value instead of being decor
      const draw = () => {
        const v = box.value.trim();
        strip.innerHTML = '';
        if (!v) { strip.classList.remove('is-on'); return; }
        strip.classList.add('is-on');
        [...v].slice(0, 22).forEach((ch) => {
          const code = ch.charCodeAt(0);
          [1, 2, 3].forEach((k) => {
            const i2 = el('i');
            i2.style.setProperty('--w', `${1 + ((code >> k) & 3)}px`);
            i2.style.opacity = 0.35 + (((code >> (k + 2)) & 3) / 6);
            strip.appendChild(i2);
          });
        });
      };
      box.addEventListener('input', () => { box.value = box.value.toUpperCase(); draw(); });
      input.append(box, strip);
      draw();
      break;
    }

    case 'tree': {
      input = el('div', 'fb-tree');
      const hidden = el('input', null, { type: 'hidden', name: f.key });
      const list = el('div', 'fb-tree__list', { role: 'tree' });

      const walk = (nodes, depth) => nodes.forEach((n) => {
        const leaf = !n.children || !n.children.length;
        const row = el('button', 'fb-tree__node', {
          type: 'button', role: 'treeitem', 'aria-selected': 'false',
        });
        row.style.setProperty('--d', depth);
        row.dataset.id = n.id;
        row.dataset.leaf = String(leaf);
        row.innerHTML = `<i class="${leaf ? 'fb-tree__leaf' : 'fb-tree__twist'}"></i>`;
        row.append(document.createTextNode(n.label));
        row.addEventListener('click', () => {
          list.querySelectorAll('.fb-tree__node').forEach((x) => x.setAttribute('aria-selected', 'false'));
          row.setAttribute('aria-selected', 'true');
          hidden.value = n.id;
          hidden.dispatchEvent(new Event('input', { bubbles: true }));
        });
        list.appendChild(row);
        if (!leaf) walk(n.children.map((c) => ({ ...c, parent: n.id })), depth + 1);
      });

      walk(TREE, 0);
      input.append(list, hidden);
      break;
    }

    case 'date':
      input = datePicker({ name: f.key, id, label: f.label, required: !!rules.required });
      break;

    case 'datetime-local':
      input = datePicker({ name: f.key, id, label: f.label, withTime: true, required: !!rules.required });
      break;

    case 'time':
      input = timePicker({ name: f.key, id, label: f.label, required: !!rules.required });
      break;

    case 'file': {
      input = el('div', 'fb-file');
      const real = el('input', 'fb-file__real', { id, type: 'file', name: f.key,
        required: !!rules.required, accept: rules.accept || null });
      const zone = el('button', 'fb-file__zone', { type: 'button' });
      const zoneText = el('span', 'fb-file__hint');
      zoneText.textContent = rules.accept ? `Drop a ${rules.accept} file, or browse` : 'Drop a file, or browse';
      zone.append(el('i', 'fb-file__arrow'), zoneText);
      const chosen = el('div', 'fb-file__chosen');
      chosen.hidden = true;

      const show = () => {
        const file = real.files && real.files[0];
        chosen.innerHTML = '';
        chosen.hidden = !file;
        if (!file) return;
        const page = el('i', 'fb-file__page');
        const meta = el('span', 'fb-file__meta');
        const nameEl = el('b'); nameEl.textContent = file.name;
        const sizeEl = el('small');
        sizeEl.textContent = file.size > 1048576
          ? `${(file.size / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;
        meta.append(nameEl, sizeEl);
        const drop = el('button', 'fb-file__drop', { type: 'button', 'aria-label': 'Remove file' });
        drop.textContent = '×';
        drop.addEventListener('click', () => {
          real.value = '';
          show();
          real.dispatchEvent(new Event('input', { bubbles: true }));
        });
        chosen.append(page, meta, drop);
      };

      zone.addEventListener('click', () => real.click());
      real.addEventListener('change', () => { show(); real.dispatchEvent(new Event('input', { bubbles: true })); });
      ['dragenter', 'dragover'].forEach((ev) => zone.addEventListener(ev, (e) => {
        e.preventDefault(); zone.classList.add('is-over');
      }));
      ['dragleave', 'drop'].forEach((ev) => zone.addEventListener(ev, (e) => {
        e.preventDefault(); zone.classList.remove('is-over');
      }));
      zone.addEventListener('drop', (e) => {
        if (!e.dataTransfer.files.length) return;
        real.files = e.dataTransfer.files;
        show();
        real.dispatchEvent(new Event('input', { bubbles: true }));
      });

      input.append(real, zone, chosen);
      break;
    }

    case 'computed': {
      input = el('div', 'fb-computed');
      input.dataset.computed = f.key;
      const out = el('input', 'fb-input fb-input--ro', { id, name: f.key, readonly: true, tabindex: '-1' });
      const note = el('code', 'fb-computed__expr');
      note.textContent = f.expr || '';
      input.append(out, note);
      break;
    }

    default:
      input = el('input', 'fb-input', {
        id, name: f.key, type: f.type || 'text',
        required: !!rules.required, placeholder: f.placeholder || '',
        min: f.min, max: f.max,
      });
      if (f.value != null) input.value = f.value;
  }

  /* Native constraints, but only where a single input *is* the value. A
     composite control keeps its value in a hidden input and is checked in
     customErrors instead — pushing minLength onto one cell of a six-box code
     is both wrong and, since it exceeds that cell's maxlength, fatal. */
  const COMPOSITE = ['otp', 'tree', 'lookup', 'multiselect', 'signature', 'richtext', 'lineitems',
                     'rating', 'select', 'date', 'time', 'datetime-local', 'color'];
  const target = COMPOSITE.includes(f.type) ? null
               : input.matches('input, select, textarea') ? input
               : input.querySelector('input:not([type=hidden]), select, textarea');
  if (target) {
    // one bad pairing must never be able to take the whole form down with it
    const set = (fn) => { try { fn(); } catch (err) { console.warn('rule skipped:', err.message); } };
    if (rules.maxLength) set(() => { target.maxLength = rules.maxLength; });
    if (rules.minLength && !(target.maxLength > 0 && rules.minLength > target.maxLength))
      set(() => { target.minLength = rules.minLength; });
    if (rules.min != null && target.type !== 'text') set(() => { target.min = rules.min; });
    if (rules.max != null && target.type !== 'text') set(() => { target.max = rules.max; });
    if (rules.pattern && ['text', 'tel', 'email', 'url', 'password', 'search'].includes(target.type)) {
      set(() => { target.pattern = rules.pattern; });
      target.title = 'Must match the pattern set in the schema';
    }
    if (rules.accept && target.type === 'file') set(() => { target.accept = rules.accept; });
  }

  wrap.appendChild(input);

  if (f.help) {
    const h = el('p', 'fb-help', { id: `${id}-help` });
    h.textContent = f.help;
    wrap.appendChild(h);
    const described = document.getElementById(id) || target;
    if (described) described.setAttribute('aria-describedby', `${id}-help`);
  }

  const err = el('p', 'fb-error', { 'aria-live': 'polite' });
  wrap.appendChild(err);

  if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA' || input.tagName === 'SELECT') {
    const show = () => { err.textContent = input.validity.valid ? '' : (input.validationMessage || 'Invalid'); };
    input.addEventListener('invalid', (e) => { e.preventDefault(); show(); wrap.classList.add('is-invalid'); });
    input.addEventListener('input', () => { show(); wrap.classList.toggle('is-invalid', !input.validity.valid); });
  }
  return wrap;
}

function readValue(form, f) {
  if (f.type === 'checkbox') return [...form.querySelectorAll(`input[name="${f.key}"]:checked`)].map((c) => c.value);
  if (f.type === 'radio') { const r = form.querySelector(`input[name="${f.key}"]:checked`); return r ? r.value : null; }
  if (f.type === 'toggle') { const t = form.querySelector(`input[name="${f.key}"]`); return !!(t && t.checked); }
  if (f.type === 'lineitems') return readLineItems(form, f);

  const node = form.querySelector(`[name="${f.key}"]`);
  if (!node) return null;

  switch (f.type) {
    case 'multiselect':
      return node.value ? node.value.split('|') : [];
    case 'tel': {
      const dial = form.querySelector(`[name="${f.key}__dial"]`);
      return { dial: dial ? dial.value : null, number: node.value };
    }
    case 'currency': {
      const cur = form.querySelector(`[name="${f.key}__cur"]`);
      return { amount: Number(node.value) || 0, currency: cur ? cur.value : null };
    }
    case 'lookup': {
      const shown = node.parentElement.querySelector('input[type="text"]');
      return node.value ? { id: node.value, [f.display || 'name']: shown ? shown.value : '' } : null;
    }
    case 'computed':
      return Number(node.dataset.value || 0);
    case 'tree': {
      const picked = node.parentElement.querySelector('[aria-selected="true"]');
      return node.value ? { id: node.value, label: picked ? picked.textContent : '' } : null;
    }
    case 'number':
    case 'range':
    case 'rating':
      return Number(node.value);
    default:
      return node.value;
  }
}

/* ---------- conditional visibility ----------
   The step from rendering a form to running one. A field states the
   condition under which it exists, and when that condition is false the
   field is not merely invisible — it is out of the contract: not validated,
   not submitted. Anything less and you get a form that silently refuses to
   submit because of a required field nobody can see. */
const OPERATORS = {
  equals:    { label: 'is', needsValue: true },
  notEquals: { label: 'is not', needsValue: true },
  anyOf:     { label: 'is any of', needsValue: true },
  gt:        { label: 'is more than', needsValue: true },
  lt:        { label: 'is less than', needsValue: true },
  isSet:     { label: 'has any value', needsValue: false },
};

function operatorsFor(type) {
  if (['select', 'radio'].includes(type)) return ['equals', 'notEquals', 'isSet'];
  if (['toggle'].includes(type)) return ['equals'];
  if (['number', 'currency', 'range', 'rating'].includes(type)) return ['equals', 'gt', 'lt', 'isSet'];
  if (['multiselect', 'checkbox'].includes(type)) return ['anyOf', 'isSet'];
  return ['equals', 'notEquals', 'isSet'];
}

function conditionMet(cond, values) {
  if (!cond || !cond.field) return true;
  if (!(cond.field in values)) return true;      // fail open: never hide because of a stale reference
  const v = values[cond.field];
  const want = cond.value;

  switch (cond.op) {
    case 'isSet':
      return Array.isArray(v) ? v.length > 0 : v !== '' && v != null && v !== false;
    case 'notEquals':
      return String(v) !== String(want);
    case 'anyOf':
      return Array.isArray(v) && v.map(String).includes(String(want));
    case 'gt':
      return Number(v) > Number(want);
    case 'lt':
      return Number(v) < Number(want);
    case 'equals':
    default:
      if (typeof v === 'boolean') return v === (want === true || want === 'true');
      return String(v) === String(want);
  }
}

/* The values every condition is judged against — read straight off the DOM,
   so a condition can depend on something the visitor changed a moment ago. */
function currentValues(form, fields) {
  const out = {};
  fields.forEach((f) => {
    const wrap = form.querySelector(`.fb-field[data-field="${f.key}"]`);
    if (wrap && wrap.hidden) return;             // a hidden field cannot drive another
    try { out[f.key] = readValue(form, f); } catch { out[f.key] = null; }
  });
  return out;
}

function applyVisibility(form, fields) {
  const values = currentValues(form, fields);
  fields.forEach((f) => {
    const wrap = form.querySelector(`.fb-field[data-field="${f.key}"]`);
    if (!wrap) return;
    const show = conditionMet(f.showIf, values);
    if (wrap.hidden === !show) return;
    wrap.hidden = !show;
    wrap.classList.toggle('is-hidden', !show);

    /* Hiding is not enough. A required input inside a display:none wrapper is
       still validated — reportValidity() fails on a control it cannot even
       show, and the form refuses to submit with no visible reason. Disabling
       is the mechanism that actually takes a control out of validation and
       out of the submitted data. */
    wrap.querySelectorAll('input, select, textarea, button').forEach((n) => { n.disabled = !show; });

    if (!show) {
      wrap.classList.remove('is-invalid');
      const err = wrap.querySelector('.fb-error');
      if (err) err.textContent = '';
    }
  });
}

/* Rules the browser has no attribute for. Kept in one place so the field
   builder never grows a special case per type. */
function customErrors(form, fields) {
  const today = new Date(new Date().toDateString());
  const out = [];

  fields.forEach((f) => {
    const wrap = form.querySelector(`.fb-field[data-field="${f.key}"]`);
    if (wrap && wrap.hidden) return;             // not shown, not asked for
    const r = f.rules || {};
    const v = readValue(form, f);
    const empty = v == null || v === '' || (Array.isArray(v) && !v.length) ||
                  (f.type === 'rating' && !v);

    // hidden inputs are barred from constraint validation, so these ask here
    if (r.required && ['lookup', 'signature', 'multiselect', 'rating', 'richtext', 'otp', 'tree'].includes(f.type) && empty)
      out.push([f.key, 'Required.']);

    if (f.type === 'otp' && r.minLength && v && String(v).length < r.minLength)
      out.push([f.key, `All ${r.minLength} digits.`]);

    if (f.type === 'tree' && r.leafOnly && v && v.id) {
      const node = form.querySelector(`.fb-tree__node[data-id="${v.id}"]`);
      if (node && node.dataset.leaf !== 'true') out.push([f.key, 'Pick a node with no children.']);
    }

    if (r.minSelected && (!Array.isArray(v) || v.length < r.minSelected))
      out.push([f.key, `Choose at least ${r.minSelected}.`]);

    if (r.minRows && (!Array.isArray(v) || v.length < r.minRows))
      out.push([f.key, `At least ${r.minRows} row${r.minRows === 1 ? '' : 's'}.`]);

    if (r.maxRows && Array.isArray(v) && v.length > r.maxRows)
      out.push([f.key, `No more than ${r.maxRows} rows.`]);

    // a rule that only means anything on a repeating group
    if (r.unique && Array.isArray(v)) {
      const seen = new Set();
      const dupe = v.some((row) => {
        const key = String(row[r.unique] ?? '').trim().toLowerCase();
        if (!key) return false;
        if (seen.has(key)) return true;
        seen.add(key);
        return false;
      });
      if (dupe) out.push([f.key, `Two rows share the same ${r.unique}.`]);
    }

    if (r.requiredTrue && v !== true)
      out.push([f.key, 'This has to be switched on to continue.']);

    if (r.min != null && f.type === 'rating' && Number(v) < r.min)
      out.push([f.key, `At least ${r.min}.`]);

    if (r.notPast && v && new Date(v) < today)
      out.push([f.key, 'Cannot be in the past.']);

    if (r.maxSize && f.type === 'file') {
      const node = form.querySelector(`[name="${f.key}"]`);
      const file = node && node.files && node.files[0];
      if (file && file.size > r.maxSize * 1024 * 1024)
        out.push([f.key, `Must be under ${r.maxSize} MB.`]);
    }
  });

  return out;
}

/* Builds the filter bar the list view would get from this same schema, and
   the query object those filters produce. Nothing here knows a field type —
   it asks FILTER_KIND what shape the filter takes. */
export function renderFilters(schema, mount, queryMount) {
  const fields = ((schema && schema.fields) || []).filter((f) => f.searchable && FILTER_KIND[f.type]);
  mount.innerHTML = '';
  if (queryMount) queryMount.textContent = '';

  if (!fields.length) {
    const p = el('p', 'fb-empty');
    p.textContent = 'Mark a control searchable and the filters it would add to the list view appear here.';
    mount.appendChild(p);
    return;
  }

  const readQuery = () => {
    const q = {};
    fields.forEach((f) => {
      const kind = FILTER_KIND[f.type];
      const box = mount.querySelector(`[data-filter="${f.key}"]`);
      if (!box) return;
      const val = (sel) => { const n = box.querySelector(sel); return n ? n.value.trim() : ''; };

      if (kind === 'contains' && val('input')) q[f.key] = { contains: val('input') };
      if (kind === 'range') {
        const lo = val('[data-lo]'), hi = val('[data-hi]');
        if (lo || hi) q[f.key] = { ...(lo && { min: Number(lo) }), ...(hi && { max: Number(hi) }) };
      }
      if (kind === 'dateRange') {
        const lo = val('[data-lo]'), hi = val('[data-hi]');
        if (lo || hi) q[f.key] = { ...(lo && { from: lo }), ...(hi && { to: hi }) };
      }
      if (kind === 'anyOf') {
        const picked = [...box.querySelectorAll('.fb-tag[aria-pressed="true"]')].map((b) => b.textContent);
        if (picked.length) q[f.key] = { anyOf: picked };
      }
      if (kind === 'bool' && val('input[type=hidden]')) q[f.key] = { equals: val('input[type=hidden]') === 'yes' };
    });
    if (queryMount) {
      queryMount.textContent = Object.keys(q).length
        ? JSON.stringify(q, null, 2)
        : '// no filter applied yet';
    }
  };

  fields.forEach((f) => {
    const kind = FILTER_KIND[f.type];
    const box = el('div', 'fb-filter');
    box.dataset.filter = f.key;

    const lab = el('span', 'fb-filter__label');
    lab.textContent = f.label || f.key;
    const kindTag = el('em', 'fb-filter__kind');
    kindTag.textContent = kind === 'dateRange' ? 'from – to'
      : kind === 'range' ? 'min – max'
      : kind === 'anyOf' ? 'any of'
      : kind === 'bool' ? 'yes / no' : 'contains';
    lab.appendChild(kindTag);
    box.appendChild(lab);

    const row = el('div', 'fb-filter__row');
    if (kind === 'contains') {
      const i = el('input', 'fb-input fb-input--sm', { type: 'search', placeholder: 'contains…' });
      row.appendChild(i);
    } else if (kind === 'range' || kind === 'dateRange') {
      const t = kind === 'range' ? 'number' : (f.type === 'time' ? 'time' : 'date');
      const lo = el('input', 'fb-input fb-input--sm', { type: t, 'data-lo': true, 'aria-label': 'from' });
      const hi = el('input', 'fb-input fb-input--sm', { type: t, 'data-hi': true, 'aria-label': 'to' });
      const dash = el('span', 'fb-filter__dash'); dash.textContent = '–';
      row.append(lo, dash, hi);
    } else if (kind === 'anyOf') {
      (f.options || []).forEach((o) => {
        const b = el('button', 'fb-tag', { type: 'button', 'aria-pressed': 'false' });
        b.textContent = o;
        b.addEventListener('click', () => {
          b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
          readQuery();
        });
        row.appendChild(b);
      });
    } else if (kind === 'bool') {
      const sel = dropdown({
        options: [{ value: '', label: 'Any' }, { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }],
        value: '', name: `${f.key}__bool`, label: f.label, small: true, onChange: readQuery,
      });
      row.appendChild(sel);
    }
    box.appendChild(row);
    mount.appendChild(box);
  });

  mount.addEventListener('input', readQuery);
  readQuery();
}

export function renderForm(schema, mount) {
  mount.innerHTML = '';
  const fields = (schema && schema.fields) || [];

  if (!fields.length) {
    const p = el('p', 'fb-empty');
    p.textContent = 'No controls yet — pick one on the left and add it.';
    mount.appendChild(p);
    return;
  }

  const form = el('form', 'fb-form');

  /* A section is not a container in the schema — it is a label a field
     carries. Consecutive fields naming the same section share one heading,
     which means reordering fields reorganises the form with no nesting to
     keep in sync. */
  let grid = null;
  let current = Symbol('none');
  fields.forEach((f, i) => {
    const section = f.section || null;
    if (!grid || section !== current) {
      if (section) {
        const h = el('p', 'fb-section');
        h.textContent = section;
        form.appendChild(h);
      }
      grid = el('div', 'fb-grid');
      form.appendChild(grid);
      current = section;
    }
    grid.appendChild(buildField(f, i));
  });

  const actions = el('div', 'fb-actions');
  const submit = el('button', 'fb-submit', { type: 'submit' });
  submit.textContent = 'Submit';
  actions.appendChild(submit);
  const out = el('pre', 'fb-output', { 'aria-live': 'polite' });
  form.append(actions, out);

  // A computed field answers to the whole form, so it re-runs on any change —
  // and so does every condition, because one answer can reveal the next question.
  const refresh = () => { applyVisibility(form, fields); recompute(form, fields); };
  form.addEventListener('input', refresh);
  form.addEventListener('change', refresh);
  refresh();

  // A signature is a data URL thousands of characters long; printing it whole
  // would bury every other answer.
  const short = (_k, v) =>
    (typeof v === 'string' && v.length > 72) ? `${v.slice(0, 48)}… (${v.length} chars)` : v;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    form.querySelectorAll('.fb-field').forEach((w) => {
      w.classList.remove('is-invalid');
      const p = w.querySelector('.fb-error');
      if (p && !w.querySelector(':invalid')) p.textContent = '';
    });
    const problems = customErrors(form, fields);
    if (problems.length) {
      problems.forEach(([key, msg]) => {
        const w = form.querySelector(`.fb-field[data-field="${key}"]`);
        if (!w) return;
        w.classList.add('is-invalid');
        w.querySelector('.fb-error').textContent = msg;
      });
      const first = form.querySelector('.fb-field.is-invalid');
      if (first) first.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      out.classList.remove('is-visible');
      return;
    }

    const data = {};
    fields.forEach((f) => {
      const wrap = form.querySelector(`.fb-field[data-field="${f.key}"]`);
      if (wrap && wrap.hidden) return;           // never submit an answer nobody was asked for
      data[f.key] = readValue(form, f);
    });
    out.textContent = JSON.stringify(data, short, 2);
    out.classList.add('is-visible');
  });

  mount.appendChild(form);
}

/* ---------- wiring ---------- */
export function initFormBuilder() {
  const gallery = document.querySelector('[data-fb-gallery]');
  const single  = document.querySelector('[data-fb-single]');
  const hint    = document.querySelector('[data-fb-hint]');
  const addBtn  = document.querySelector('[data-fb-add]');
  const widthEl = document.querySelector('[data-fb-width]');
  const rulesEl = document.querySelector('[data-fb-rules]');
  const optsEl  = document.querySelector('[data-fb-opts]');
  const filtEl  = document.querySelector('[data-fb-filters]');
  const condEl  = document.querySelector('[data-fb-cond]');
  const queryEl = document.querySelector('[data-fb-query]');
  const preview = document.querySelector('[data-fb-preview]');
  const schemaEl= document.querySelector('[data-fb-schema]');
  const resetBtn= document.querySelector('[data-fb-reset]');
  const count   = document.querySelector('[data-fb-count]');
  if (!gallery || !preview) return;
  if (gallery.dataset.ready) return;          // boot() may fall back to bootReduced(); never wire twice
  gallery.dataset.ready = '1';

  const START = () => ({ fields: [
    { key: 'company', label: 'Company name', type: 'text', width: 'w-50',
      placeholder: 'Acme Trading', rules: { required: true, minLength: 3 } },
    { key: 'plan', label: 'Plan', type: 'select', width: 'w-50',
      options: ['Starter', 'Growth', 'Enterprise'], value: 'Growth' },
  ]});

  let schema = START();
  let active = CONTROLS[0];
  let seq = 0;
  let width = null;                 // null = whatever the type calls natural
  let rules = {};                   // the rules the visitor has switched on
  let searchable = false;           // does the list view get a filter for this?
  let section = null;               // the heading this field sits under
  let help = false;                 // show a line of guidance under the control
  let cond = null;                  // { field, op, value } — when this field exists at all

  const SECTIONS = [null, 'Company', 'Contact', 'Commercial terms'];

  /* The condition can only point at a field that is already in the form, so
     this row is rebuilt from the schema rather than from the control list. */
  const paintCond = () => {
    if (!condEl) return;
    condEl.innerHTML = '';

    const targets = schema.fields.filter((f) => !['computed', 'signature', 'file', 'lineitems'].includes(f.type));
    if (!targets.length) {
      const note = el('p', 'fb-rules__none');
      note.textContent = 'Add a field first — a condition needs something to point at.';
      condEl.appendChild(note);
      return;
    }

    const fieldOpts = [{ value: '', label: 'always shown' }]
      .concat(targets.map((f) => ({ value: f.key, label: f.label || f.key })));

    condEl.appendChild(dropdown({
      options: fieldOpts, value: cond ? cond.field : '', name: '__cond_field',
      label: 'Depends on', small: true,
      onChange: (o) => {
        cond = o.value ? { field: o.value, op: 'equals', value: '' } : null;
        paintCond();
      },
    }));
    if (!cond) return;

    const target = targets.find((f) => f.key === cond.field);
    const ops = operatorsFor(target ? target.type : 'text');
    if (!ops.includes(cond.op)) cond.op = ops[0];

    condEl.appendChild(dropdown({
      options: ops.map((o) => ({ value: o, label: OPERATORS[o].label })),
      value: cond.op, name: '__cond_op', label: 'Condition', small: true,
      onChange: (o) => { cond.op = o.value; paintCond(); },
    }));

    if (!OPERATORS[cond.op].needsValue) return;

    if (target && target.type === 'toggle') {
      condEl.appendChild(dropdown({
        options: [{ value: 'true', label: 'on' }, { value: 'false', label: 'off' }],
        value: String(cond.value || 'true'), name: '__cond_val', label: 'Value', small: true,
        onChange: (o) => { cond.value = o.value; },
      }));
    } else if (target && target.options) {
      if (!cond.value) cond.value = target.options[0];
      condEl.appendChild(dropdown({
        options: target.options, value: cond.value, name: '__cond_val',
        label: 'Value', small: true, onChange: (o) => { cond.value = o.value; },
      }));
    } else {
      const box = el('input', 'fb-input fb-input--sm fb-cond__val', {
        type: 'text', placeholder: 'value…', 'aria-label': 'Value',
      });
      box.value = cond.value || '';
      box.addEventListener('input', () => { cond.value = box.value; });
      condEl.appendChild(box);
    }
  };

  const paintOpts = () => {
    if (!optsEl) return;
    optsEl.innerHTML = '';

    const secWrap = el('span', 'fb-sect');
    SECTIONS.forEach((name) => {
      const b = el('button', 'fb-rule fb-rule--sect', { type: 'button', 'aria-pressed': String(section === name) });
      b.textContent = name || 'no section';
      b.addEventListener('click', () => { section = name; paintOpts(); });
      secWrap.appendChild(b);
    });
    optsEl.appendChild(secWrap);

    const kind = FILTER_KIND[active.type];
    if (!kind) {
      const note = el('span', 'fb-rules__none');
      note.textContent = 'Not filterable.';
      optsEl.appendChild(note);
    }
    if (kind) {
      const b = el('button', 'fb-rule', { type: 'button', 'aria-pressed': String(searchable) });
      b.textContent = `searchable — ${kind === 'dateRange' ? 'from – to' : kind === 'range' ? 'min – max' : kind === 'anyOf' ? 'any of' : kind === 'bool' ? 'yes / no' : 'contains'}`;
      b.addEventListener('click', () => { searchable = !searchable; paintOpts(); });
      optsEl.appendChild(b);
    }

    const hb = el('button', 'fb-rule', { type: 'button', 'aria-pressed': String(help) });
    hb.textContent = 'help text';
    hb.addEventListener('click', () => { help = !help; paintOpts(); });
    optsEl.appendChild(hb);
  };

  const paintWidth = () => {
    if (!widthEl) return;
    const current = width || NATURAL_WIDTH[active.type] || 'w-50';
    widthEl.innerHTML = '';
    WIDTHS.forEach((w) => {
      const b = el('button', 'fb-w', { type: 'button', 'aria-pressed': String(w === current) });
      b.textContent = w.replace('w-', '') + '%';
      b.addEventListener('click', () => { width = w; paintWidth(); });
      widthEl.appendChild(b);
    });
  };

  const paintRules = () => {
    if (!rulesEl) return;
    rulesEl.innerHTML = '';
    const list = RULES[active.type] || [];
    if (!list.length) {
      const note = el('p', 'fb-rules__none');
      note.textContent = NO_RULES[active.type] || 'Nothing to validate on this type.';
      rulesEl.appendChild(note);
      return;
    }
    list.forEach((r) => {
      const on = rules[r.key] !== undefined;
      const b = el('button', 'fb-rule', { type: 'button', 'aria-pressed': String(on) });
      b.textContent = r.label;
      b.addEventListener('click', () => {
        if (rules[r.key] !== undefined) delete rules[r.key];
        else rules[r.key] = r.value;
        paintRules();
      });
      rulesEl.appendChild(b);
    });
  };

  /* The schema is the point of the whole demo, so it is never hidden behind a
     toggle. Every add rewrites it in place and flashes the lines it just wrote,
     so the cause (a click on the left) and the effect (config, then a real
     field) are visible in the same glance. */
  const esc = (t) => t.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  const paintSchema = (flash = -1) => {
    if (count) count.textContent = `${schema.fields.length} control${schema.fields.length === 1 ? '' : 's'}`;
    if (!schemaEl) return;

    const bodies = schema.fields.map((f) =>
      JSON.stringify(f, null, 2).split('\n').map((l) => '    ' + l).join('\n'));

    let html = '{\n  "fields": [\n';
    bodies.forEach((bodyText, i) => {
      const chunk = esc(bodyText) + (i < bodies.length - 1 ? ',' : '') + '\n';
      html += i === flash ? `<mark class="fb__new">${chunk}</mark>` : chunk;
    });
    html += '  ]\n}';
    schemaEl.innerHTML = html;

    const mark = schemaEl.querySelector('.fb__new');
    if (!mark) { schemaEl.scrollTop = 0; return; }
    const top = mark.offsetTop - schemaEl.clientHeight / 2 + mark.offsetHeight / 2;
    schemaEl.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  };

  const paintPreview = () => {
    renderMock(active, single);
    hint.textContent = active.hint;
  };

  const select = (c) => {
    active = c;
    width = null;                                        // back to the type's own shape
    rules = c.sample.required ? { required: true } : {}; // rules belong to a type, not to the session
    searchable = false;
    help = false;
    // section deliberately persists: you group several fields in a row
    gallery.querySelectorAll('.fb-chip').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.type === c.type)));
    paintPreview();
    paintWidth();
    paintRules();
    paintOpts();
    paintCond();
  };

  /* 25 chips in one wall is a wall. Grouped, it reads as a palette. */
  GROUPS.forEach((g) => {
    const members = CONTROLS.filter((c) => c.group === g);
    if (!members.length) return;

    const head = el('p', 'fb-group');
    head.textContent = g;
    gallery.appendChild(head);

    const row = el('div', 'fb-group__grid');
    members.forEach((c) => {
      const b = el('button', 'fb-chip', { type: 'button', 'aria-pressed': 'false' });
      b.dataset.type = c.type;
      b.innerHTML = `<span class="fb-chip__icon">${c.icon}</span><span class="fb-chip__label">${c.label}</span>`;
      b.addEventListener('click', () => select(c));
      row.appendChild(b);
    });
    gallery.appendChild(row);
  });

  addBtn && addBtn.addEventListener('click', () => {
    seq += 1;
    const f = { ...active.sample, key: `${active.sample.key}_${seq}` };
    delete f.required;                       // required is a rule now, like every other constraint
    f.width = width || NATURAL_WIDTH[active.type] || 'w-50';
    if (section) f.section = section;
    if (help && HELP[active.type]) f.help = HELP[active.type];
    if (cond && cond.field) f.showIf = { ...cond };
    if (searchable && FILTER_KIND[active.type]) f.searchable = true;
    if (Object.keys(rules).length) f.rules = { ...rules };
    schema.fields.push(f);
    cond = null;                                 // a condition belongs to one field, not to the session
    renderForm(schema, preview);
    if (filtEl) renderFilters(schema, filtEl, queryEl);
    paintSchema(schema.fields.length - 1);
    paintCond();
  });

  resetBtn && resetBtn.addEventListener('click', () => {
    schema = START(); seq = 0;
    cond = null;
    renderForm(schema, preview);
    if (filtEl) renderFilters(schema, filtEl, queryEl);
    paintSchema();
    paintCond();
  });

  select(CONTROLS[0]);
  renderForm(schema, preview);
  if (filtEl) renderFilters(schema, filtEl, queryEl);
  paintSchema();
}
