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
/* Four columns, not one. A country field that only knows a name is exactly
   why somebody later hard-codes a dial code inside a component. */
const COUNTRIES = [
  { code: 'EG', name: 'Egypt',                dial: '+20',  currency: 'EGP' },
  { code: 'SA', name: 'Saudi Arabia',         dial: '+966', currency: 'SAR' },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971', currency: 'AED' },
  { code: 'KW', name: 'Kuwait',               dial: '+965', currency: 'KWD' },
  { code: 'QA', name: 'Qatar',                dial: '+974', currency: 'QAR' },
  { code: 'JO', name: 'Jordan',               dial: '+962', currency: 'JOD' },
  { code: 'GB', name: 'United Kingdom',       dial: '+44',  currency: 'GBP' },
  { code: 'DE', name: 'Germany',              dial: '+49',  currency: 'EUR' },
  { code: 'US', name: 'United States',        dial: '+1',   currency: 'USD' },
];

const LOCALES = [
  { code: 'en', label: 'English',  dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
];

/* ---------- the strings the engine itself puts on the screen ----------
   Labels, options and help are the author's content: they come from the
   schema, and a builder that translates those for you is guessing. What it
   owes you is its own copy — every button, every message, in every language
   it claims to support. Dates and plurals go through Intl rather than through
   a hand-written table, because that is what Intl is for. */
const T = {
  en: {
    submit: 'Submit', addRow: '+ Add row', removeRow: 'Remove row', removeFile: 'Remove file',
    rows: (n) => `${n} row${n === 1 ? '' : 's'}`,
    clear: 'Clear', pickDate: 'Pick a date', pickDateTime: 'Pick a date and time',
    pickTime: 'Pick a time', pickPeriod: 'Pick a period',
    hour: 'Hour', minute: 'Minute', ampm: 'AM or PM',
    prevMonth: 'Previous month', nextMonth: 'Next month',
    prevYear: 'Previous year', nextYear: 'Next year',
    required: 'Required.', invalid: 'Not valid.', badFormat: 'Does not match the required format.',
    tooShort: (n) => `At least ${n} characters.`, tooLong: (n) => `At most ${n} characters.`,
    tooSmall: (n) => `Not less than ${n}.`, tooBig: (n) => `Not more than ${n}.`,
    otpAll: (n) => `All ${n} digits.`, leafOnly: 'Pick a node with no children.',
    minSelected: (n) => `Choose at least ${n}.`,
    minRows: (n) => `At least ${n} row${n === 1 ? '' : 's'}.`,
    maxRows: (n) => `No more than ${n} rows.`,
    dupe: (c) => `Two rows share the same ${c}.`,
    mustBeOn: 'This has to be switched on to continue.', atLeast: (n) => `At least ${n}.`,
    noPastStart: 'Cannot start in the past.', periodClosed: 'That period is already closed.',
    noPast: 'Cannot be in the past.', endBeforeStart: 'The end must not precede the start.',
    maxSpan: (n) => `No longer than ${n} days.`,
    minHours: (n) => `At least ${n} hour${n === 1 ? '' : 's'}.`,
    maxDays: (n) => `At most ${n} day${n === 1 ? '' : 's'}.`,
    maxSize: (n) => `Must be under ${n} MB.`,
    qtyMin: (n, u) => `At least ${n} ${u}.`, qtyMax: (n, u) => `No more than ${n} ${u}.`,
    maskAll: (n, m) => `Needs all ${n} characters — ${m}.`,
    pwNeeds: (l) => `Still needs ${l}.`, pwShort: (l) => `needs ${l}`,
    pwScore: ['too easy', 'too easy', 'weak', 'almost there', 'strong'],
    pwLen: '10 characters', pwCase: 'mixed case', pwDigit: 'a digit', pwSymbol: 'a symbol',
    qrSample: 'Paste a sample', qrExpects: (w) => `Expects ${w}.`,
    qrUnread: (w) => `That is not ${w}.`, qrStrict: (w) => `The payload has to be ${w}.`,
    qrUrl: 'a web address', qrGs1: 'a GS1 element string', qrVcard: 'a contact card', qrText: 'any text',
    and: 'and',
  },
  ar: {
    submit: 'إرسال', addRow: '+ إضافة صف', removeRow: 'حذف الصف', removeFile: 'إزالة الملف',
    rows: (n) => (n === 1 ? 'صف واحد' : n === 2 ? 'صفان' : n <= 10 ? `${n} صفوف` : `${n} صفًا`),
    clear: 'مسح', pickDate: 'اختر تاريخًا', pickDateTime: 'اختر تاريخًا ووقتًا',
    pickTime: 'اختر وقتًا', pickPeriod: 'اختر فترة',
    hour: 'الساعة', minute: 'الدقيقة', ampm: 'صباحًا أو مساءً',
    prevMonth: 'الشهر السابق', nextMonth: 'الشهر التالي',
    prevYear: 'السنة السابقة', nextYear: 'السنة التالية',
    required: 'مطلوب.', invalid: 'غير صالح.', badFormat: 'لا يطابق الصيغة المطلوبة.',
    tooShort: (n) => `${n} أحرف على الأقل.`, tooLong: (n) => `${n} حرفًا كحد أقصى.`,
    tooSmall: (n) => `لا يقل عن ${n}.`, tooBig: (n) => `لا يزيد عن ${n}.`,
    otpAll: (n) => `الرمز كاملًا — ${n} أرقام.`, leafOnly: 'اختر عنصرًا ليس له عناصر فرعية.',
    minSelected: (n) => `اختر ${n} على الأقل.`,
    minRows: (n) => `${n} صف على الأقل.`, maxRows: (n) => `${n} صفوف كحد أقصى.`,
    dupe: (c) => `صفّان يحملان نفس الـ ${c}.`,
    mustBeOn: 'لا بد من تفعيل هذا للمتابعة.', atLeast: (n) => `${n} على الأقل.`,
    noPastStart: 'لا يمكن أن تبدأ في الماضي.', periodClosed: 'هذه الفترة مقفلة بالفعل.',
    noPast: 'لا يمكن أن يكون في الماضي.', endBeforeStart: 'النهاية لا يمكن أن تسبق البداية.',
    maxSpan: (n) => `${n} يومًا كحد أقصى.`,
    minHours: (n) => `${n} ساعات على الأقل.`, maxDays: (n) => `${n} أيام كحد أقصى.`,
    maxSize: (n) => `يجب أن يكون أقل من ${n} ميجابايت.`,
    qtyMin: (n, u) => `${n} ${u} على الأقل.`, qtyMax: (n, u) => `${n} ${u} كحد أقصى.`,
    maskAll: (n, m) => `يجب إكمال ${n} خانة — ${m}.`,
    pwNeeds: (l) => `ما زال ينقصها ${l}.`, pwShort: (l) => `ينقصها ${l}`,
    pwScore: ['ضعيفة جدًا', 'ضعيفة جدًا', 'ضعيفة', 'أوشكت', 'قوية'],
    pwLen: '10 خانات', pwCase: 'حروف كبيرة وصغيرة', pwDigit: 'رقم', pwSymbol: 'رمز',
    qrSample: 'الصق عينة', qrExpects: (w) => `بيتوقع ${w}.`,
    qrUnread: (w) => `ده مش ${w}.`, qrStrict: (w) => `المحتوى لازم يكون ${w}.`,
    qrUrl: 'رابط ويب', qrGs1: 'سلسلة GS1', qrVcard: 'كارت تعارف', qrText: 'أي نص',
    and: 'و',
  },
  fr: {
    submit: 'Envoyer', addRow: '+ Ajouter une ligne', removeRow: 'Supprimer la ligne', removeFile: 'Supprimer le fichier',
    rows: (n) => `${n} ligne${n === 1 ? '' : 's'}`,
    clear: 'Effacer', pickDate: 'Choisir une date', pickDateTime: 'Choisir une date et une heure',
    pickTime: 'Choisir une heure', pickPeriod: 'Choisir une période',
    hour: 'Heure', minute: 'Minute', ampm: 'AM ou PM',
    prevMonth: 'Mois précédent', nextMonth: 'Mois suivant',
    prevYear: 'Année précédente', nextYear: 'Année suivante',
    required: 'Obligatoire.', invalid: 'Non valide.', badFormat: 'Ne correspond pas au format demandé.',
    tooShort: (n) => `Au moins ${n} caractères.`, tooLong: (n) => `Au plus ${n} caractères.`,
    tooSmall: (n) => `Pas moins de ${n}.`, tooBig: (n) => `Pas plus de ${n}.`,
    otpAll: (n) => `Les ${n} chiffres.`, leafOnly: 'Choisissez un nœud sans enfants.',
    minSelected: (n) => `Choisissez-en au moins ${n}.`,
    minRows: (n) => `Au moins ${n} ligne${n === 1 ? '' : 's'}.`,
    maxRows: (n) => `Pas plus de ${n} lignes.`,
    dupe: (c) => `Deux lignes ont le même ${c}.`,
    mustBeOn: 'Il faut activer ceci pour continuer.', atLeast: (n) => `Au moins ${n}.`,
    noPastStart: 'Ne peut pas commencer dans le passé.', periodClosed: 'Cette période est déjà clôturée.',
    noPast: 'Ne peut pas être dans le passé.', endBeforeStart: 'La fin ne peut pas précéder le début.',
    maxSpan: (n) => `Pas plus de ${n} jours.`,
    minHours: (n) => `Au moins ${n} heure${n === 1 ? '' : 's'}.`,
    maxDays: (n) => `Au plus ${n} jour${n === 1 ? '' : 's'}.`,
    maxSize: (n) => `Doit faire moins de ${n} Mo.`,
    qtyMin: (n, u) => `Au moins ${n} ${u}.`, qtyMax: (n, u) => `Pas plus de ${n} ${u}.`,
    maskAll: (n, m) => `Il faut les ${n} caractères — ${m}.`,
    pwNeeds: (l) => `Il manque encore ${l}.`, pwShort: (l) => `il manque ${l}`,
    pwScore: ['trop simple', 'trop simple', 'faible', 'presque', 'fort'],
    pwLen: '10 caractères', pwCase: 'majuscules et minuscules', pwDigit: 'un chiffre', pwSymbol: 'un symbole',
    qrSample: 'Coller un exemple', qrExpects: (w) => `Attend ${w}.`,
    qrUnread: (w) => `Ce n'est pas ${w}.`, qrStrict: (w) => `Le contenu doit être ${w}.`,
    qrUrl: 'une adresse web', qrGs1: 'une chaîne GS1', qrVcard: 'une carte de contact', qrText: 'du texte',
    and: 'et',
  },
};

/* ---------- a scan is a payload, not a number ----------
   A barcode carries one identifier. A QR code carries a structured payload,
   and the useful part of that on a counter or in a warehouse is that one scan
   answers several questions at once. So the field declares the shape it
   expects and where each part belongs, and the engine spreads the scan across
   the form. Nothing here touches a camera: a scanner is a keyboard, and this
   is the field that receives what it types. */
const PAYLOADS = {
  url: {
    tkey: 'qrUrl',
    sample: 'https://acme.example/p/1042?ref=shelf',
    parse: (v) => {
      try {
        const u = new URL(String(v).trim());
        return { url: u.href, host: u.host, path: u.pathname };
      } catch { return null; }
    },
  },

  /* A GS1 element string is the one most people have scanned without knowing:
     application identifiers in brackets, each with its own meaning. */
  gs1: {
    tkey: 'qrGs1',
    sample: '(01)06281234567890(10)LOT42(17)261231(21)SER0001',
    parse: (v) => {
      const AI = { '01': 'gtin', '10': 'batch', '17': 'expiry', '21': 'serial' };
      const out = {};
      const re = /\((\d{2})\)([^(]+)/g;
      let m;
      while ((m = re.exec(String(v)))) { const k = AI[m[1]]; if (k) out[k] = m[2].trim(); }
      if (out.expiry && /^\d{6}$/.test(out.expiry))
        out.expiry = `20${out.expiry.slice(0, 2)}-${out.expiry.slice(2, 4)}-${out.expiry.slice(4, 6)}`;
      return Object.keys(out).length ? out : null;
    },
  },

  vcard: {
    tkey: 'qrVcard',
    sample: 'MECARD:N:Ahmed Jab;ORG:Trio Services;TEL:+201501715523;EMAIL:ahmedjab7697@gmail.com;;',
    parse: (v) => {
      const src = String(v).trim();
      const out = {};
      if (/^MECARD:/i.test(src)) {
        src.replace(/^MECARD:/i, '').split(';').forEach((pair) => {
          const at = pair.indexOf(':');
          if (at < 1) return;
          const k = { N: 'name', ORG: 'org', TEL: 'tel', EMAIL: 'email' }[pair.slice(0, at).toUpperCase()];
          if (k) out[k] = pair.slice(at + 1).trim();
        });
      } else {
        src.split(/\r?\n/).forEach((line) => {
          const at = line.indexOf(':');
          if (at < 1) return;
          const tag = line.slice(0, at).split(';')[0].toUpperCase();
          const k = { FN: 'name', ORG: 'org', TEL: 'tel', EMAIL: 'email' }[tag];
          if (k) out[k] = line.slice(at + 1).trim();
        });
      }
      return Object.keys(out).length ? out : null;
    },
  },

  text: {
    tkey: 'qrText',
    sample: 'SHELF-A14',
    parse: (v) => (String(v).trim() ? { text: String(v).trim() } : null),
  },
};
const payloadOf = (f) => PAYLOADS[f && f.payload] || PAYLOADS.text;

/* One rendered form at a time in this demo, so its language lives here rather
   than being threaded through the signature of everything that draws a string.
   Controls that print translated text register a repainter, which is why the
   form re-localises in place instead of being rebuilt and losing what you
   already typed. */
const FORM = { lang: 'en', dir: 'ltr', repaint: [] };

function t(key, ...args) {
  const table = T[FORM.lang] || T.en;
  const v = key in table ? table[key] : T.en[key];
  return typeof v === 'function' ? v(...args) : v;
}

/* Arabic is written with Arabic-Indic digits by default. Inside a form whose
   day cells and amounts are drawn as plain numbers, mixing the two sets looks
   like a bug, so the whole form stays on Latin digits. */
const intlTag = () => (FORM.lang === 'ar' ? 'ar-u-nu-latn' : FORM.lang);
const monthName = (m) => new Intl.DateTimeFormat(intlTag(), { month: 'long' }).format(new Date(2021, m, 1));
const monthShort = (m) => new Intl.DateTimeFormat(intlTag(), { month: 'short' }).format(new Date(2021, m, 1));
const dowNarrow = () => Array.from({ length: 7 }, (_, i) =>
  new Intl.DateTimeFormat(intlTag(), { weekday: 'narrow' }).format(new Date(2021, 1, 1 + i)));   // 1 Feb 2021 was a Monday
const arrow = () => (FORM.dir === 'rtl' ? '←' : '→');

/* A label may be a plain string or a map of translations. Both are the
   author's, so the engine resolves, it never invents. */
const lbl = (v) => (v && typeof v === 'object' ? (v[FORM.lang] || v.en || Object.values(v)[0]) : v);

/* A quantity is a number and the unit it happened to be entered in. The pair
   converts to one base unit on the way out — which is the only reason a total
   over rows in grams, kilos and tonnes can come out right. */
const UNITS = {
  mass:   { base: 'kg', list: [['g', 0.001], ['kg', 1], ['t', 1000]] },
  count:  { base: 'pc', list: [['pc', 1], ['box', 12], ['pallet', 480]] },
  length: { base: 'm',  list: [['mm', 0.001], ['cm', 0.01], ['m', 1], ['km', 1000]] },
  volume: { base: 'L',  list: [['mL', 0.001], ['L', 1], ['m3', 1000]] },
};
const dimOf = (f) => UNITS[f && f.dimension] || UNITS.mass;
const factorOf = (f, u) => { const hit = dimOf(f).list.find(([name]) => name === u); return hit ? hit[1] : 1; };

/* The phone and money controls take their lists from the same table, which is
   the only reason a cascade can ever land: a driven value the target has
   never heard of is a cascade that quietly does nothing. */
const DIALS = [...new Set(COUNTRIES.map((c) => c.dial))];
const CURRENCIES = [...new Set(COUNTRIES.map((c) => c.currency))].sort();

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
    sample: { key: 'phone', label: { en: 'Phone', ar: 'الهاتف', fr: 'Téléphone' },
              type: 'tel', dial: '+20', dials: DIALS, placeholder: '10 1234 5678' } },

  { type: 'password', label: 'Password', group: 'Text', icon: svg('<rect x="4" y="9" width="12" height="7" rx="2"/><path d="M7 9V6.5a3 3 0 0 1 6 0V9"/>'),
    hint: 'Masked input. The value never appears in the rendered markup.',
    sample: { key: 'secret', label: 'API key', type: 'password', placeholder: '••••••••' } },

  /* ---- Numbers ---- */
  { type: 'number', label: 'Number', group: 'Numbers', icon: svg('<path d="M7 4 5.5 16M14 4l-1.5 12M4 8h12M3.5 12h12"/>'),
    hint: 'Numeric only, with optional min and max bounds.',
    sample: { key: 'seats', label: 'Seats', type: 'number', min: 1, max: 500, value: 25 } },

  { type: 'currency', label: 'Currency', group: 'Numbers', icon: svg('<rect x="2.5" y="5.5" width="15" height="9" rx="2"/><circle cx="10" cy="10" r="2.2"/><path d="M5.5 8.5v3M14.5 8.5v3"/>'),
    hint: 'Amount and currency travel together, so the number is never ambiguous.',
    sample: { key: 'budget', label: { en: 'Budget', ar: 'الميزانية', fr: 'Budget' },
              type: 'currency', currency: 'EGP', currencies: CURRENCIES, value: 25000 } },

  { type: 'quantity', label: 'Quantity', group: 'Numbers', icon: svg('<path d="M10 2.8 17 6.2v7.6L10 17.2 3 13.8V6.2z"/><path d="M3 6.2 10 9.6l7-3.4M10 9.6v7.6"/>'),
    hint: 'A number and the unit it was typed in. It converts to one base unit on the way out, so a bound is a bound and a total over mixed units is still a total.',
    sample: { key: 'weight', label: 'Net weight', type: 'quantity', dimension: 'mass', uom: 'kg', value: 25 } },

  { type: 'range', label: 'Slider', group: 'Numbers', icon: svg('<path d="M3 10h14"/><circle cx="12.5" cy="10" r="2.8"/>'),
    hint: 'A bounded number where the range reads faster than the figure.',
    sample: { key: 'progress', label: 'Completion', type: 'range', min: 0, max: 100, step: 5, value: 60 } },

  { type: 'rating', label: 'Rating', group: 'Numbers', icon: svg('<path d="m10 3.2 2.1 4.3 4.7.7-3.4 3.3.8 4.7L10 14l-4.2 2.2.8-4.7-3.4-3.3 4.7-.7z"/>'),
    hint: 'A small integer scale. Submits a number, not a label.',
    sample: { key: 'score', label: 'Satisfaction', type: 'rating', max: 5, value: 4 } },

  { type: 'percent', label: 'Percentage', group: 'Numbers', icon: svg('<path d="M5.5 14.5 14.5 5.5"/><circle cx="6.6" cy="6.6" r="2.3"/><circle cx="13.4" cy="13.4" r="2.3"/>'),
    hint: 'A rate that declares its own scale. 14 and 0.14 are the same discount stored two different ways — the schema says which, so nothing downstream has to guess.',
    sample: { key: 'discount', label: 'Discount', type: 'percent', scale: 1, min: 0, max: 100, value: 10 } },

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

  { type: 'country', label: 'Country', group: 'Choice', icon: svg('<circle cx="10" cy="10" r="7"/><path d="M3.6 7.2h12.8M3.6 12.8h12.8"/><path d="M10 3a11 11 0 0 1 0 14a11 11 0 0 1 0-14"/>'),
    hint: 'One answer that fills in the next. It names the kinds of field it drives, so picking a country sets the currency and the dial code with no component code at all.',
    sample: { key: 'country', label: { en: 'Country', ar: 'الدولة', fr: 'Pays' },
              type: 'country', ref: 'countries', value: 'EG', drives: ['currency', 'tel'] } },

  { type: 'locale', label: 'Language', group: 'Choice', icon: svg('<path d="M3 5.5h7M6.5 3.5v2M8.2 5.5c0 3-2.2 5.4-5.2 6.5M4.5 8.2c1 1.8 2.8 3 5 3.6"/><path d="m10.5 16.5 3-8 3 8M11.6 14h3.8"/>'),
    hint: 'Direction is a value in the form, not a decision taken once in a stylesheet. Pick Arabic and the whole rendered form turns around — layout, dates, and every message the engine owns.',
    sample: { key: 'locale', label: { en: 'Language', ar: 'اللغة', fr: 'Langue' },
              type: 'locale', ref: 'locales', value: 'en', sets: 'dir' } },

  /* ---- Date & time ---- */
  { type: 'date', label: 'Date', group: 'Date & time', icon: svg('<rect x="3" y="5" width="14" height="12" rx="2"/><path d="M3 9h14M7 3v4M13 3v4"/>'),
    hint: 'Calendar picker. Submits an ISO date string.',
    sample: { key: 'golive', label: 'Go-live date', type: 'date' } },

  { type: 'time', label: 'Time', group: 'Date & time', icon: svg('<circle cx="10" cy="10" r="7"/><path d="M10 6v4l2.5 2"/>'),
    hint: 'Clock picker for a time of day.',
    sample: { key: 'slot', label: 'Preferred time', type: 'time' } },

  { type: 'daterange', label: 'Date Range', group: 'Date & time', icon: svg('<rect x="2.5" y="5" width="15" height="12" rx="2"/><path d="M2.5 9h15M6 3v4M14 3v4"/><path d="M7 13h6"/><path d="M11.5 11.5 13 13l-1.5 1.5"/>'),
    hint: 'One field, not two — a range validates as a whole, so the end cannot precede the start.',
    sample: { key: 'period', label: 'Cover period', type: 'daterange' } },

  { type: 'duration', label: 'Duration', group: 'Date & time', icon: svg('<circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 1.5"/><path d="M15.5 4.5 17 3"/>'),
    hint: 'Days, hours and minutes as one value — the units convert, so it is never a bare number.',
    sample: { key: 'leave', label: 'Requested leave', type: 'duration', units: ['d', 'h', 'm'] } },

  { type: 'period', label: 'Period', group: 'Date & time', icon: svg('<rect x="2.5" y="4" width="15" height="13" rx="2"/><path d="M2.5 8h15"/><path d="M6 11.5h3M11 11.5h3M6 14h3"/>'),
    hint: 'A month and a year. Finance and payroll close on a period, never on a day.',
    sample: { key: 'fiscal', label: 'Fiscal period', type: 'period' } },

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
      { key: 'qty', label: 'Qty', type: 'quantity', dimension: 'count', uom: 'pc', value: 1 },
      { key: 'price', label: 'Unit price', type: 'number', value: 0 },
    ], rows: [
      { desc: 'Rack server', qty: 3, price: 250 },
      { desc: 'Switch 48-port', qty: 2, price: 125 },
    ] } },

  { type: 'otp', label: 'One-time Code', group: 'Text', icon: svg('<rect x="2" y="7" width="3.6" height="6" rx="1"/><rect x="7" y="7" width="3.6" height="6" rx="1"/><rect x="12" y="7" width="3.6" height="6" rx="1"/><path d="M17.6 10H18"/>'),
    hint: 'A code split across boxes, so a paste fills them all and a typo is obvious.',
    sample: { key: 'code', label: 'Verification code', type: 'otp', length: 6 } },

  { type: 'barcode', label: 'Barcode', group: 'Text', icon: svg('<path d="M3 4v12M6 4v12M8.5 4v12M11.5 4v9M14 4v12M17 4v12"/>'),
    hint: 'Scanner-first: the field takes a scan or a typed code and normalises both.',
    sample: { key: 'sku', label: 'SKU / Barcode', type: 'barcode', placeholder: 'Scan or type' } },

  { type: 'qrcode', label: 'QR Scan', group: 'Text', icon: svg('<rect x="3" y="3" width="5" height="5" rx="1"/><rect x="12" y="3" width="5" height="5" rx="1"/><rect x="3" y="12" width="5" height="5" rx="1"/><path d="M12 12h2v2h-2zM15.5 15.5h1.5v1.5h-1.5zM12 16.5h1.5M16.5 12h.5"/>'),
    hint: 'A barcode carries one identifier; a QR code carries a payload with a shape. The field declares the shape it expects and where each part belongs, so one scan answers several questions at once — try it with a Barcode and a Date in the form.',
    sample: { key: 'scan', label: 'Pack label', type: 'qrcode', payload: 'gs1',
              fills: { gtin: 'sku', expiry: 'golive' } } },

  { type: 'masked', label: 'Masked', group: 'Text', icon: svg('<rect x="2.5" y="6" width="4" height="8" rx="1"/><path d="M7.8 10h1.4"/><rect x="10.5" y="6" width="4" height="8" rx="1"/><path d="M15.8 10h1.7"/>'),
    hint: 'A format that shapes what you type instead of rejecting it afterwards. The separators are put in for you, and a character that does not belong in the next slot never lands.',
    sample: { key: 'taxid', label: 'Tax registration no.', type: 'masked', mask: '000-000-000' } },

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
  password:  [rule('required', 'required', true), rule('minLength', 'min length', 8), rule('pattern', PATTERNS.password.label, PATTERNS.password.value), rule('strength', 'strong password', 'strong')],
  number:    [rule('required', 'required', true), rule('min', 'min', 1), rule('max', 'max', 500)],
  currency:  [rule('required', 'required', true), rule('min', 'min', 0), rule('max', 'max', 1000000)],
  percent:   [rule('required', 'required', true), rule('max', 'cap at 25 %', 25)],
  quantity:  [rule('required', 'required', true), rule('min', 'min in base units', 1), rule('max', 'max in base units', 1000)],
  range:     [],
  rating:    [rule('required', 'required', true), rule('min', 'at least', 3)],
  select:    [rule('required', 'required', true)],
  multiselect: [rule('required', 'required', true), rule('minSelected', 'min selected', 2)],
  checkbox:  [rule('required', 'required', true), rule('minSelected', 'min selected', 1)],
  radio:     [rule('required', 'required', true)],
  country:   [rule('required', 'required', true)],
  locale:    [rule('required', 'required', true)],
  toggle:    [rule('requiredTrue', 'must be on', true)],
  date:      [rule('required', 'required', true), rule('notPast', 'no past dates', true)],
  time:      [rule('required', 'required', true)],
  daterange: [rule('required', 'required', true), rule('notPast', 'no past dates', true), rule('maxSpan', 'max 30 days', 30)],
  duration:  [rule('required', 'required', true), rule('min', 'at least 1h', 60), rule('max', 'at most 5d', 7200)],
  period:    [rule('required', 'required', true), rule('notPast', 'no closed periods', true)],
  'datetime-local': [rule('required', 'required', true), rule('notPast', 'no past dates', true)],
  file:      [rule('required', 'required', true), rule('accept', 'PDF only', '.pdf'), rule('maxSize', 'max 5 MB', 5)],
  richtext:  [rule('required', 'required', true), rule('maxLength', 'max length', 2000)],
  signature: [rule('required', 'required', true)],
  color:     [],
  otp:       [rule('required', 'required', true), rule('minLength', 'full length', 6)],
  barcode:   [rule('required', 'required', true), rule('pattern', 'alphanumeric', '^[A-Za-z0-9-]{4,}$')],
  masked:    [rule('required', 'required', true), rule('complete', 'every slot filled', true)],
  qrcode:    [rule('required', 'required', true), rule('strict', 'payload must parse', true)],
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
   A field config does not only draw an input. Mark it filterable and the list
   view has to offer a way to filter on it — and a filter is rarely the same
   control as the input. A text box becomes "contains". A number becomes a pair
   of bounds. A date becomes a span. A select becomes "any of".
   Same config, two renderings; that is the whole point of config-driven.

   "filterable", not "searchable": searchable is a property of the control —
   a list of choices long enough to want a search in it — and the two were
   sharing one word, which is how nobody could tell what either of them did. */
const FILTER_KIND = {
  text: 'contains', textarea: 'contains', email: 'contains', url: 'contains',
  tel: 'contains', richtext: 'contains', lookup: 'contains', barcode: 'contains', tree: 'contains',
  country: 'contains', masked: 'contains', locale: 'contains', qrcode: 'contains',
  number: 'range', currency: 'range', range: 'range', rating: 'range', percent: 'range', quantity: 'range',
  date: 'dateRange', 'datetime-local': 'dateRange', time: 'dateRange', period: 'dateRange',
  duration: 'range',
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
  percent: 'Applied to the line total, before tax.',
  quantity: 'Type it in whichever unit is on the label — it is stored in the base one.',
  range: 'Drag to the nearest five per cent.',
  rating: 'One is poor, five is excellent.',
  select: 'You can change plan at any renewal.',
  multiselect: 'Pick every tag that applies.',
  checkbox: 'Modules can be added later without a new contract.',
  radio: 'Annual billing carries a discount.',
  country: 'Sets the currency and the dial code on the rest of this form.',
  locale: 'Everything below re-reads itself in the language you pick.',
  toggle: 'You can review the full terms before you agree.',
  date: 'The first day users will be able to sign in.',
  time: 'Local time at the customer site.',
  'datetime-local': 'We hold the slot for 48 hours.',
  daterange: 'Both ends count as working days.',
  duration: 'Half days are fine — use hours.',
  period: 'The period the invoice will be posted to.',
  file: 'The signed copy, not the draft.',
  richtext: 'These terms appear on every invoice.',
  signature: 'Use a mouse, a trackpad or your finger.',
  color: 'Used on the portal header and on outgoing email.',
  otp: 'Six digits, valid for ten minutes.',
  barcode: 'Scan it, or type the code printed under the bars.',
  masked: 'Exactly as printed on the certificate — the dashes are added for you.',
  qrcode: 'Scan the label on the pack — the rest of the line fills itself in.',
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
  tree: 'w-100', otp: 'w-50', barcode: 'w-50', percent: 'w-33', qrcode: 'w-100',
  daterange: 'w-75', duration: 'w-50', period: 'w-50',
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
  countries: COUNTRIES,
  locales: LOCALES,
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
  locale:   () => `<div class="mk-box">${mkIcon('<path d="M3 5.5h7M6.5 3.5v2M8.2 5.5c0 3-2.2 5.4-5.2 6.5M4.5 8.2c1 1.8 2.8 3 5 3.6"/><path d="m10.5 16.5 3-8 3 8M11.6 14h3.8"/>')}${bar('30%')}<span class="mk-chev"></span></div>
                   <div class="mk-dir"><span class="mk-dir__seg is-on">LTR</span><span class="mk-dir__seg">RTL</span></div>`,
  country:  () => `<div class="mk-box">${mkIcon('<circle cx="10" cy="10" r="7"/><path d="M3.6 7.2h12.8M3.6 12.8h12.8"/><path d="M10 3a11 11 0 0 1 0 14a11 11 0 0 1 0-14"/>')}${bar('34%')}<span class="mk-chev"></span></div>
                   <div class="mk-drive"><span class="mk-arrow"></span><span class="mk-pill">EGP</span><span class="mk-pill">+20</span></div>`,
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
  quantity: () => `<div class="mk-box">${bar('26%')}<span class="mk-pill">kg <i class="mk-caret"></i></span></div>
                   <div class="mk-scale"><span class="mk-scale__seg">g</span><span class="mk-scale__seg is-on">kg</span><span class="mk-scale__seg">t</span></div>`,
  percent:  () => `<div class="mk-box">${bar('24%')}<span class="mk-unit">%</span></div>
                   <div class="mk-scale"><span class="mk-scale__seg">0–100</span><span class="mk-scale__seg is-on">0–1</span></div>`,
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

  /* A stylised module field with three finder blocks — a picture of a QR
     code, drawn from its own coordinates, not an encoding of anything. */
  qrcode:   () => {
    const M = 11;
    let cells = '';
    for (let y = 0; y < M; y++) {
      for (let x = 0; x < M; x++) {
        const finder = (x < 3 && y < 3) || (x > M - 4 && y < 3) || (x < 3 && y > M - 4);
        const on = finder || (x * 7 + y * 5 + ((x * y) % 3)) % 3 === 0;
        cells += `<i class="mk-qr__m${on ? ' is-on' : ''}" style="--t:${(x / (M - 1)).toFixed(3)}"></i>`;
      }
    }
    return `<div class="mk-qr">${cells}</div>
            <div class="mk-mask">(01) (10) (17) (21)</div>`;
  },
  masked:   () => `<div class="mk-box">${bar('30px')}<span class="mk-sep">-</span>${bar('30px')}<span class="mk-sep">-</span>${bar('30px')}</div>
                   <div class="mk-mask">000-000-000</div>`,
  barcode:  () => `<div class="mk-box">${mkIcon('<path d="M3 4v12M6 4v12M8.5 4v12M11.5 4v9M14 4v12M17 4v12"/>')}${bar('34%')}</div>
                   <div class="mk-bars">${[3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2]
                     .map((w, i) => `<i style="--w:${w}px;--t:${(i / 19).toFixed(3)}"></i>`).join('')}</div>`,

  daterange: () => `<div class="mk-box mk-box--split">${mkIcon(I_CAL)}${bar('26%')}
                      <span class="mk-arrow"></span>${mkIcon(I_CAL)}${bar('26%')}</div>
                    ${calendar()}`,

  duration: () => `<div class="mk-dur">
                     <span class="mk-dur__cell">${bar('16px')}<em>d</em></span>
                     <span class="mk-dur__cell">${bar('16px')}<em>h</em></span>
                     <span class="mk-dur__cell">${bar('16px')}<em>m</em></span>
                   </div>`,

  period:   () => `<div class="mk-box">${mkIcon(I_CAL)}${bar('22%')}<span class="mk-chev"></span></div>
                   <div class="mk-months">${Array.from({ length: 12 }, (_, i) =>
                     `<span class="mk-month${i === 8 ? ' is-on' : ''}" style="--t:${((i % 4) / 3).toFixed(3)}">${bar('60%')}</span>`).join('')}</div>`,

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
  /* The palette is the builder, not the built form: it stays in one language
     whatever the form below it is currently speaking. */
  const name = control.sample.label;
  mount.innerHTML =
    `<div class="mk" data-type="${control.type}">
       <span class="mk-label">${typeof name === 'object' ? name.en : name}</span>
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

/* "scale" is the range the stored value lives in: 1 stores a fraction
   (10 % -> 0.1), 100 stores the figure exactly as typed. The divisor falls out
   of it, and the VAT-is-14-or-0.14 argument never has to happen again. */
const pctDiv = (f) => (Number(f && f.scale) === 1 ? 100 : 1);
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
      o[c.key] = c.type === 'number' ? (Number(cell && cell.value) || 0)
        : c.type === 'quantity' ? (Number(cell && cell.value) || 0) * factorOf(c, cell && cell.dataset.uom)
        : (cell ? cell.value : '');
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
    if (!['number', 'range', 'rating', 'currency', 'percent', 'quantity'].includes(f.type)) return;
    const n = form.querySelector(`[name="${f.key}"]`);
    if (!n) return;
    if (f.type === 'quantity') {
      const u = form.querySelector(`[name="${f.key}__uom"]`);
      flat[baseKey(f.key)] = (Number(n.value) || 0) * factorOf(f, u ? u.value : dimOf(f).base);
      return;
    }
    /* A percentage enters an expression the way it will be stored, never the
       way it was typed — otherwise every formula has to remember which of
       the two scales this particular field happened to declare. */
    flat[baseKey(f.key)] = (Number(n.value) || 0) / (f.type === 'percent' ? pctDiv(f) : 1);
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

/* A panel that clips its overflow — for the rounded corner, or because the
   list inside it scrolls — will also clip anything a control opens near its
   bottom edge, and the visitor sees a menu with its legs cut off. Unclipping
   the panel is the wrong trade, so the popover measures instead: it asks the
   nearest clipping ancestor how much room is left and opens upwards when
   there is not enough below and there is enough above. */
function placePopover(anchor, pop) {
  pop.classList.remove('is-up');
  const a = anchor.getBoundingClientRect();
  const h = pop.offsetHeight;
  if (!h) return;

  let bound = window.innerHeight;
  for (let node = anchor.parentElement; node; node = node.parentElement) {
    const cs = getComputedStyle(node);
    if (/hidden|clip|auto|scroll/.test(cs.overflowY + cs.overflow)) {
      bound = Math.min(bound, node.getBoundingClientRect().bottom);
      break;
    }
  }
  if (a.bottom + 8 + h > bound && a.top - 8 >= h) pop.classList.add('is-up');
}

/* Every popover owes the visitor the same two exits: Escape from anywhere
   inside it, and a click somewhere else. Wiring that per component is how
   one of them ends up missing it. */
/* Escape and click-outside listen on the document, not on the wrapper: a click
   inside a popover does not always leave focus there, and the key has to work
   anyway. But one pair of listeners per popover means the form carries a few
   hundred of them after a while, and every one of them keeps its control alive
   in memory long after the control has left the page. So there is exactly one
   pair for the whole document, and the popovers register with it. */
const DISMISS = new Set();

const sweep = () => DISMISS.forEach((d) => { if (!d.wrap.isConnected) DISMISS.delete(d); });

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  sweep();
  DISMISS.forEach((d) => {
    if (!d.isOpen()) return;
    d.close();
    const btn = d.wrap.querySelector('button');
    if (btn) btn.focus();
  });
});

document.addEventListener('pointerdown', (e) => {
  sweep();
  DISMISS.forEach((d) => { if (d.isOpen() && !d.wrap.contains(e.target)) d.close(); });
});

function dismissable(wrap, close, isOpen) {
  DISMISS.add({ wrap, close, isOpen });
}

/* ---------- a listbox, because the native one is not ours to design ----------
   A <select>'s popup is drawn by the operating system: its own font, its own
   highlight colour, its own metrics. Nothing in a design system reaches it.
   So this is a real combobox — button, listbox, hidden input for the value —
   with the keyboard behaviour people expect from the native one. */
function dropdown({ options, value, name, id, label, small, required, search, onChange }) {
  const wrap = el('div', 'fb-select' + (small ? ' fb-select--sm' : ''));
  const hidden = el('input', null, { type: 'hidden', name, required: !!required });
  const btn = el('button', 'fb-select__btn', {
    type: 'button', id, role: 'combobox', 'aria-haspopup': 'listbox',
    'aria-expanded': 'false', 'aria-label': label || name,
  });
  const text = el('span', 'fb-select__value');
  const listId = `fb-list-${name || id || (dropdown.n = (dropdown.n || 0) + 1)}`;
  const list = el('ul', 'fb-select__list', { id: listId, role: 'listbox', 'data-lenis-prevent': true });
  btn.append(text, el('i', 'fb-select__chev'));

  const items = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  let index = Math.max(0, items.findIndex((o) => o.value === value));

  /* With a filter in the popup the arrow keys have to walk what is on screen,
     not what is in the array — so the visible set is kept as it is typed. */
  let view = items.map((_, i) => i);

  /* The popup is the list itself until there is something to put above it. */
  let filter = null;
  let none = null;
  const pop = search ? el('div', 'fb-select__pop') : list;
  if (search) {
    filter = el('input', 'fb-input fb-input--sm fb-select__search', {
      type: 'text', autocomplete: 'off', role: 'combobox',
      'aria-expanded': 'false', 'aria-controls': listId, 'aria-autocomplete': 'list',
      'aria-label': `Search ${label || name || 'options'}`, placeholder: 'Search…',
    });
    none = el('p', 'fb-select__none');
    none.textContent = 'Nothing matches that.';
    none.hidden = true;
    pop.append(filter, list, none);
  }
  pop.hidden = true;

  const paint = () => {
    const chosen = items[index];
    hidden.value = chosen ? chosen.value : '';
    text.textContent = chosen ? chosen.label : '';
    list.querySelectorAll('li').forEach((li, i) => {
      li.setAttribute('aria-selected', String(i === index));
      li.classList.toggle('is-on', i === index);
    });
    if (filter) filter.setAttribute('aria-activedescendant', list.children[index] ? list.children[index].id : '');
  };

  const sift = () => {
    const q = filter.value.trim().toLowerCase();
    view = [];
    list.querySelectorAll('li').forEach((li, i) => {
      const hit = !q || items[i].label.toLowerCase().includes(q);
      li.hidden = !hit;
      if (hit) view.push(i);
    });
    none.hidden = view.length > 0;
    placePopover(btn, pop);
  };

  const close = () => {
    pop.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    if (filter) filter.setAttribute('aria-expanded', 'false');
  };
  const open = () => {
    pop.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    if (filter) {
      filter.value = '';
      sift();
      filter.setAttribute('aria-expanded', 'true');
    }
    placePopover(btn, pop);
    const on = list.querySelector('.is-on');
    if (on) on.scrollIntoView({ block: 'nearest' });
    if (filter) filter.focus();
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
    if (search) li.id = `${listId}-${i}`;
    li.textContent = o.label;
    li.addEventListener('mousedown', (e) => { e.preventDefault(); choose(i); });
    list.appendChild(li);
  });

  /* One step through whatever is currently on screen. */
  const step = (dir) => {
    if (!view.length) return;
    let at = view.indexOf(index);
    at = at < 0 ? (dir > 0 ? 0 : view.length - 1) : (at + dir + view.length) % view.length;
    index = view[at];
    paint();
    const on = list.children[index];
    if (on) on.scrollIntoView({ block: 'nearest' });
  };

  btn.addEventListener('click', () => (pop.hidden ? open() : close()));
  btn.addEventListener('keydown', (e) => {
    const openNow = !pop.hidden;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openNow ? choose(index) : open(); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!openNow) { open(); return; }
      step(e.key === 'ArrowDown' ? 1 : -1);
      return;
    }
    if (e.key === 'Home') { e.preventDefault(); index = view[0]; paint(); return; }
    if (e.key === 'End') { e.preventDefault(); index = view[view.length - 1]; paint(); return; }
    // type-ahead, the one native behaviour people miss when it is gone
    if (e.key.length === 1 && /\S/.test(e.key)) {
      const hits = view.filter((i) => items[i].label.toLowerCase().startsWith(e.key.toLowerCase()));
      if (!hits.length) return;
      const next = hits.find((i) => i > index);
      index = next === undefined ? hits[0] : next;
      paint();
      if (openNow && list.children[index]) list.children[index].scrollIntoView({ block: 'nearest' });
    }
  });

  if (filter) {
    filter.addEventListener('input', sift);
    filter.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); close(); btn.focus(); return; }
      if (e.key === 'Enter') { e.preventDefault(); if (view.includes(index)) choose(index); return; }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); step(e.key === 'ArrowDown' ? 1 : -1); return; }
      if (e.key === 'Tab') close();
    });
  }

  /* A cascade has to be able to set this from outside, and silently: it runs
     inside the form's own input handler, so an event dispatched from here
     comes straight back around. */
  wrap.setValue = (v) => {
    const at = items.findIndex((o) => String(o.value) === String(v));
    if (at < 0 || at === index) return false;
    index = at;
    paint();
    return true;
  };

  dismissable(wrap, close, () => !pop.hidden);

  wrap.append(btn, hidden, pop);
  paint();
  return wrap;
}

/* ---------- date and time, ours as well ----------
   <input type="date"> hands the browser a text format we never chose
   (mm/dd/yyyy on one machine, dd/mm/yyyy on the next) and a calendar drawn
   by the OS. The preview panel already shows the calendar this design wants;
   this is that calendar, made real. */
const pad2 = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const prettyDate = (d) => `${pad2(d.getDate())} ${monthShort(d.getMonth())} ${d.getFullYear()}`;

function datePicker({ name, id, label, withTime, required }) {
  const wrap = el('div', 'fb-date');
  const hidden = el('input', null, { type: 'hidden', name, required: !!required });
  const btn = el('button', 'fb-date__btn', {
    type: 'button', id, 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-label': label || name,
  });
  const text = el('span', 'fb-date__value');
  const placeholder = () => { if (!text.classList.contains('is-set')) text.textContent = t(withTime ? 'pickDateTime' : 'pickDate'); };
  placeholder();
  btn.append(el('i', 'fb-date__icon'), text);

  const pop = el('div', 'fb-date__pop', { role: 'dialog', 'aria-label': label || 'Calendar', 'data-lenis-prevent': true });
  pop.hidden = true;

  const today = new Date();
  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  let picked = null;
  let hh = 9, mm = 0;

  const head = el('div', 'fb-date__head');
  const prev = el('button', 'fb-date__nav', { type: 'button', 'aria-label': t('prevMonth') });
  const next = el('button', 'fb-date__nav fb-date__nav--next', { type: 'button', 'aria-label': t('nextMonth') });
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

  const emit = (silent) => {
    if (!picked) { hidden.value = ''; return; }
    hidden.value = withTime ? `${iso(picked)}T${pad2(hh)}:${pad2(mm)}` : iso(picked);
    text.textContent = withTime
      ? `${prettyDate(picked)} · ${pad2(hh % 12 || 12)}:${pad2(mm)} ${hh < 12 ? 'AM' : 'PM'}`
      : prettyDate(picked);
    text.classList.add('is-set');
    if (!silent) hidden.dispatchEvent(new Event('input', { bubbles: true }));
  };

  /* A date can be the answer to something other than the calendar — a scanned
     expiry, say. Silent for the same reason the dropdown's setter is: whoever
     calls it is already inside the form's own input handler. */
  wrap.setValue = (v) => {
    const d = new Date(String(v));
    if (Number.isNaN(d.getTime())) return false;
    picked = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    view = new Date(picked.getFullYear(), picked.getMonth(), 1);
    emit(true);
    return true;
  };

  const paint = () => {
    title.textContent = `${monthName(view.getMonth())} ${view.getFullYear()}`;
    grid.innerHTML = '';
    dowNarrow().forEach((d) => {
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
  const open = () => { pop.hidden = false; btn.setAttribute('aria-expanded', 'true'); paint(); placePopover(btn, pop); };

  FORM.repaint.push(() => {
    prev.setAttribute('aria-label', t('prevMonth'));
    next.setAttribute('aria-label', t('nextMonth'));
    if (picked) emit(); else placeholder();
    if (!pop.hidden) paint();
  });

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
  const placeholder = () => { if (!text.classList.contains('is-set')) text.textContent = t('pickTime'); };
  placeholder();
  FORM.repaint.push(placeholder);
  btn.append(el('i', 'fb-date__icon fb-date__icon--clock'), text);

  const pop = el('div', 'fb-date__pop fb-date__pop--time', { role: 'dialog', 'data-lenis-prevent': true });
  pop.hidden = true;
  const cols = el('div', 'fb-time__cols');
  const hourList = el('div', 'fb-time__col', { role: 'listbox', 'aria-label': t('hour'), 'data-lenis-prevent': true });
  const minList = el('div', 'fb-time__col', { role: 'listbox', 'aria-label': t('minute'), 'data-lenis-prevent': true });
  const merList = el('div', 'fb-time__col fb-time__col--mer', { role: 'listbox', 'aria-label': t('ampm') });
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
    if (!pop.hidden) placePopover(btn, pop);
  });
  dismissable(wrap, close, () => !pop.hidden);

  wrap.append(btn, hidden, pop);
  return wrap;
}

/* ---------- the engine: one field config -> one DOM control ---------- */
/* ---------- one definition of "strong" ----------
   Not an entropy estimate and not a dictionary. Four things, counted once,
   so the bar the visitor watches and the check that blocks the submit can
   never tell them different stories. */
function strength(value) {
  const v = String(value == null ? '' : value);
  const missing = [];
  if (v.length < 10) missing.push(t('pwLen'));
  if (!/[a-z]/.test(v) || !/[A-Z]/.test(v)) missing.push(t('pwCase'));
  if (!/\d/.test(v)) missing.push(t('pwDigit'));
  if (!/[^A-Za-z0-9]/.test(v)) missing.push(t('pwSymbol'));
  const score = 4 - missing.length;
  return { score, label: t('pwScore')[score], missing };
}

/* Arabic joins the last item with a prefix rather than a separate word, which
   is the sort of thing a template literal with a hard-coded "and" gets wrong. */
const listOf = (a) => {
  if (a.length < 2) return a.join('');
  const head = a.slice(0, -1).join(FORM.lang === 'ar' ? '، ' : ', ');
  const last = a[a.length - 1];
  return FORM.lang === 'ar' ? `${head} ${t('and')}${last}` : `${head} ${t('and')} ${last}`;
};

/* ---------- a mask, which is not a pattern ----------
   A pattern waits until the visitor has finished and then says no. A mask
   shapes the value as it is typed: the separators are put in for them and a
   character that does not belong in the next slot simply never lands. 0 takes
   a digit, A a letter, * either; everything else in the mask is a literal. */
const MASK_TOKEN = { '0': /\d/, A: /[A-Za-z]/, '*': /[A-Za-z0-9]/ };

const maskSlots = (mask) => [...String(mask)].filter((c) => MASK_TOKEN[c]).length;
const maskHint = (mask) => [...String(mask)].map((c) => (MASK_TOKEN[c] ? '_' : c)).join('');

function applyMask(mask, value) {
  const slots = [...String(mask)].map((c) => MASK_TOKEN[c] || null);
  const types = slots.filter(Boolean);

  /* Each character is offered to the next unfilled slot. One that does not fit
     is dropped, which is also how a visitor pasting an already-formatted value
     gets the separators skipped rather than counted. */
  const chars = [];
  for (const c of String(value == null ? '' : value)) {
    if (chars.length >= types.length) break;
    if (types[chars.length].test(c)) chars.push(c);
  }

  let display = '';
  let k = 0;
  for (let i = 0; i < slots.length && k < chars.length; i++) display += slots[i] ? chars[k++] : String(mask)[i];
  return { display, raw: chars.join(''), full: chars.length === types.length };
}

function buildField(f, idx) {
  const id = `fb-${f.key || idx}`;
  const rules = f.rules || {};
  const width = f.width || NATURAL_WIDTH[f.type] || 'w-50';
  const wrap = el('div', `fb-field ${width}`);
  wrap.dataset.field = f.key;

  const label = el('label', 'fb-label', { for: id });
  label.textContent = lbl(f.label) || f.key || `Field ${idx + 1}`;
  if (rules.required || rules.requiredTrue) { const s = el('span', 'fb-req'); s.textContent = '*'; label.appendChild(s); }
  wrap.appendChild(label);

  let input;
  switch (f.type) {
    case 'select':
      input = dropdown({ options: f.options || [], value: f.value, name: f.key,
                         id, label: f.label, required: !!rules.required, search: !!f.searchable });
      break;

    case 'locale':
      input = dropdown({ options: (DATASETS[f.ref] || LOCALES).map((c) => ({ value: c.code, label: c.label })),
                         value: f.value, name: f.key, id, label: lbl(f.label), required: !!rules.required,
                         search: !!f.searchable });
      break;

    case 'country':
      input = dropdown({ options: (DATASETS[f.ref] || COUNTRIES).map((c) => ({ value: c.code, label: c.name })),
                         value: f.value, name: f.key, id, label: f.label, required: !!rules.required,
                         search: !!f.searchable });
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

    case 'password': {
      const box = el('input', 'fb-input', { id, name: f.key, type: 'password',
        required: !!rules.required, placeholder: f.placeholder || '',
        autocomplete: 'new-password' });
      if (!rules.strength) { input = box; break; }

      /* A rule that earns its keep by changing what gets rendered. A strength
         requirement the visitor only meets the bar of at submit time is a rule
         you failed them with, not one you told them about. */
      input = el('div', 'fb-pw');
      const meter = el('div', 'fb-pw__meter', { 'aria-hidden': 'true' });
      for (let i = 0; i < 4; i++) meter.appendChild(el('i'));
      const note = el('span', 'fb-pw__note', { 'aria-live': 'polite' });
      const paint = () => {
        const s = strength(box.value);
        input.dataset.score = box.value ? String(s.score) : '';
        meter.querySelectorAll('i').forEach((seg, i) => seg.classList.toggle('is-on', !!box.value && i < s.score));
        note.textContent = !box.value ? ''
          : s.score === 4 ? s.label
          : `${s.label} — ${t('pwShort', listOf(s.missing.slice(0, 2)))}`;
      };
      box.addEventListener('input', paint);
      FORM.repaint.push(paint);
      input.append(box, meter, note);
      paint();
      break;
    }

    case 'qrcode': {
      const spec = payloadOf(f);
      input = el('div', 'fb-qr');
      const box = el('input', 'fb-input', { id, type: 'text', name: f.key,
        required: !!rules.required, placeholder: f.placeholder || 'Scan, or paste a payload',
        autocomplete: 'off', spellcheck: 'false' });

      /* There is no camera on a portfolio page, and a QR field in production is
         nearly always a keyboard-wedge scanner anyway. So the honest way to let
         a visitor try it is to hand them a real payload of the declared shape. */
      const sample = el('button', 'fb-qr__sample', { type: 'button' });
      const out = el('div', 'fb-qr__out');
      const paint = () => {
        sample.textContent = t('qrSample');
        const raw = box.value.trim();
        const parsed = raw ? spec.parse(raw) : null;
        input.dataset.read = parsed ? 'yes' : raw ? 'no' : '';
        out.innerHTML = '';
        if (!raw) { out.textContent = t('qrExpects', t(spec.tkey)); return; }
        if (!parsed) { out.textContent = t('qrUnread', t(spec.tkey)); return; }
        Object.entries(parsed).forEach(([k, v]) => {
          const chip = el('span', 'fb-qr__part');
          if (f.fills && f.fills[k]) chip.classList.add('is-routed');
          const key = el('em'); key.textContent = k;
          chip.append(key, document.createTextNode(String(v)));
          out.appendChild(chip);
        });
      };
      sample.addEventListener('click', () => {
        box.value = spec.sample;
        box.dispatchEvent(new Event('input', { bubbles: true }));
      });
      box.addEventListener('input', paint);
      FORM.repaint.push(paint);
      input.append(box, sample, out);
      paint();
      break;
    }

    case 'masked': {
      const mask = f.mask || '000-000-000';
      const slots = maskSlots(mask);
      input = el('div', 'fb-mask');
      const box = el('input', 'fb-input', { id, type: 'text', name: f.key,
        required: !!rules.required, placeholder: f.placeholder || maskHint(mask),
        autocomplete: 'off', spellcheck: 'false',
        inputmode: [...mask].every((c) => !MASK_TOKEN[c] || c === '0') ? 'numeric' : 'text' });
      const raw = el('input', null, { type: 'hidden', name: `${f.key}__raw` });
      const note = el('span', 'fb-mask__note');
      const paint = () => {
        const at = box.selectionStart;
        const r = applyMask(mask, box.value);
        if (box.value !== r.display) {
          const delta = r.display.length - box.value.length;
          box.value = r.display;
          const put = Math.max(0, Math.min(r.display.length, (at || 0) + delta));
          try { box.setSelectionRange(put, put); } catch { /* not a caret-bearing input */ }
        }
        raw.value = r.raw;
        input.dataset.full = String(r.full);
        note.textContent = r.raw ? `${mask} · ${r.raw.length}/${slots}` : mask;
      };
      box.addEventListener('input', paint);
      FORM.repaint.push(paint);
      if (f.value != null) { box.value = f.value; }
      input.append(box, raw, note);
      paint();
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

    case 'quantity': {
      input = el('div', 'fb-qty');
      const dim = dimOf(f);
      const num = el('input', 'fb-input', { id, type: 'number', name: f.key,
        step: f.step || 'any', inputmode: 'decimal', placeholder: f.placeholder || '' });
      if (f.value != null) num.value = f.value;
      const uom = dropdown({ options: dim.list.map(([u]) => u), value: f.uom || dim.base,
                             name: `${f.key}__uom`, label: 'Unit', small: true });
      uom.classList.add('fb-select--tight');
      const base = el('span', 'fb-qty__base');
      const paint = () => {
        const u = uom.querySelector('input[type=hidden]').value;
        const typed = Number(num.value);
        base.textContent = num.value === '' || !Number.isFinite(typed)
          ? `${arrow()} — ${dim.base}`
          : `${arrow()} ${Math.round(typed * factorOf(f, u) * 1e6) / 1e6} ${dim.base}`;
      };
      input.addEventListener('input', paint);   // covers the number and the unit alike
      FORM.repaint.push(paint);
      input.append(num, uom, base);
      paint();
      break;
    }

    case 'percent': {
      /* The whole reason this is a type and not a Number with a label: the
         schema states the scale, so what the visitor reads and what the API
         stores stop being the same guess made twice. */
      input = el('div', 'fb-pct');
      const amt = el('input', 'fb-input', { id, type: 'number', name: f.key,
        step: f.step || 0.01, inputmode: 'decimal', required: !!rules.required,
        min: f.min != null ? f.min : 0, max: f.max != null ? f.max : 100 });
      if (f.value != null) amt.value = f.value;
      const sign = el('span', 'fb-pct__sign');
      sign.textContent = '%';
      const stored = el('span', 'fb-pct__stored');
      const paint = () => {
        const typed = Number(amt.value);
        stored.textContent = amt.value === '' || !Number.isFinite(typed)
          ? `${arrow()} —`
          : `${arrow()} ${Math.round((typed / pctDiv(f)) * 1e6) / 1e6}`;
      };
      amt.addEventListener('input', paint);
      FORM.repaint.push(paint);
      input.append(amt, sign, stored);
      paint();
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
      /* No popup to put a search in — the options are already on the page, so
         the filter hides the ones that do not match rather than listing the
         ones that do. A chosen chip stays visible whatever is typed: hiding
         something the user has already picked is how a selection gets lost. */
      if (f.searchable) {
        const sieve = el('input', 'fb-input fb-input--sm fb-tags__search', {
          type: 'text', autocomplete: 'off', placeholder: 'Filter options…',
          'aria-label': `Filter ${lbl(f.label) || f.key} options`,
        });
        sieve.addEventListener('input', () => {
          const q = sieve.value.trim().toLowerCase();
          input.querySelectorAll('.fb-tag').forEach((b) => {
            b.hidden = !!q && !chosen.has(b.textContent) && !b.textContent.toLowerCase().includes(q);
          });
        });
        input.appendChild(sieve);
      }
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
      const body = el('div', 'fb-rt__body', { id, contenteditable: 'true', role: 'textbox',
        'aria-multiline': 'true', 'aria-label': lbl(f.label) || f.key });
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
      clear.textContent = t('clear');
      FORM.repaint.push(() => { clear.textContent = t('clear'); });
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
      const listId = `${id}-list`;
      const search = el('input', 'fb-input', { id, type: 'text', autocomplete: 'off',
        role: 'combobox', 'aria-expanded': 'false', 'aria-controls': listId,
        'aria-autocomplete': 'list', placeholder: `Search ${f.ref}…` });
      const hidden = el('input', null, { type: 'hidden', name: f.key, required: !!rules.required });
      const list = el('ul', 'fb-lookup__list', { id: listId, role: 'listbox', 'data-lenis-prevent': true });
      list.hidden = true;

      const paint = (q) => {
        const t = q.trim().toLowerCase();
        list.innerHTML = '';
        const hits = rows.filter((r) =>
          !t || r.name.toLowerCase().includes(t) || r.id.toLowerCase().includes(t)).slice(0, 5);
        hits.forEach((r) => {
          /* Options in a listbox are not tab stops — the combobox is. Tabbing
             through five results to leave one field is not navigation. */
          const li = el('li', 'fb-lookup__row', { role: 'option', 'aria-selected': 'false' });
          li.innerHTML = `<b></b><small></small>`;
          li.querySelector('b').textContent = r.name;
          li.querySelector('small').textContent = r.id;
          const pick = () => {
            search.value = r.name; hidden.value = r.id;
            list.hidden = true; search.setAttribute('aria-expanded', 'false');
            hidden.dispatchEvent(new Event('input', { bubbles: true }));
          };
          li.addEventListener('mousedown', (e) => { e.preventDefault(); pick(); });
          list.appendChild(li);
        });
        list.hidden = !hits.length;
        if (!list.hidden) placePopover(search, list);
        search.setAttribute('aria-expanded', String(!!hits.length));
      };

      search.addEventListener('focus', () => paint(search.value));
      search.addEventListener('input', () => { hidden.value = ''; paint(search.value); });
      search.addEventListener('keydown', (e) => {
        const opts = [...list.querySelectorAll('.fb-lookup__row')];
        if (!opts.length || list.hidden) return;
        let at = opts.findIndex((o) => o.classList.contains('is-on'));
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          at = (at + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length;
          opts.forEach((o, i) => {
            o.classList.toggle('is-on', i === at);
            o.setAttribute('aria-selected', String(i === at));
          });
          opts[at].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter' && at > -1) {
          e.preventDefault();
          opts[at].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        }
      });

      search.addEventListener('blur', () => setTimeout(() => { list.hidden = true; }, 140));
      input.append(search, hidden, list);
      break;
    }

    case 'lineitems': {
      const cols = f.fields || [];
      input = el('div', 'fb-items');
      input.dataset.items = f.key;
      input.style.setProperty('--cols', cols.length);
      /* A cell that carries a unit needs more room than one that does not, and
         a description needs more than either. On a phone that difference is
         the whole column, so the track sizes come from the sub-schema. */
      const COL_W = { text: 1.5, textarea: 1.5, quantity: 1.3 };
      input.style.setProperty('--tpl', cols.map((c) => `minmax(0, ${COL_W[c.type] || 1}fr)`).join(' '));

      const head = el('div', 'fb-items__row fb-items__row--head');
      cols.forEach((c) => { const h = el('span'); h.textContent = lbl(c.label) || c.key; head.appendChild(h); });
      head.appendChild(el('span'));

      const body = el('div', 'fb-items__body');
      const foot = el('div', 'fb-items__foot');
      const addBtn = el('button', 'fb-items__add', { type: 'button' });
      addBtn.textContent = t('addRow');
      const count = el('span', 'fb-items__count');

      const sync = () => {
        const n = body.children.length;
        count.textContent = t('rows', n);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      };
      const addRow = (vals) => {
        const row = el('div', 'fb-items__row');
        cols.forEach((c) => {
          const cell = el('input', 'fb-input fb-input--sm', {
            type: c.type === 'number' || c.type === 'quantity' ? 'number' : 'text',
            'data-col': c.key, 'aria-label': c.label || c.key, placeholder: c.label || c.key,
          });
          const v = vals && vals[c.key] != null ? vals[c.key] : c.value;
          if (v != null) cell.value = v;
          if (c.type !== 'quantity') { row.appendChild(cell); return; }

          /* Same config, a second rendering. A column this narrow on a phone
             cannot hold a dropdown, so three units become a tag you cycle. */
          const box = el('span', 'fb-qty__cell');
          const list = dimOf(c).list;
          /* A row can carry its own unit, so a rebuild does not quietly turn
             everything back into the column's default. */
          const startU = (vals && vals[`${c.key}__uom`]) || c.uom || dimOf(c).base;
          let ui = Math.max(0, list.findIndex(([name]) => name === startU));
          const tag = el('button', 'fb-qty__unit', { type: 'button', 'aria-label': `Unit for ${c.label || c.key}` });
          const paintU = () => { tag.textContent = list[ui][0]; cell.dataset.uom = list[ui][0]; };
          tag.addEventListener('click', () => {
            ui = (ui + 1) % list.length;
            paintU();
            cell.dispatchEvent(new Event('input', { bubbles: true }));
          });
          paintU();
          box.append(cell, tag);
          row.appendChild(box);
        });
        const del = el('button', 'fb-items__del', { type: 'button', 'aria-label': t('removeRow') });
        del.textContent = '×';
        del.addEventListener('click', () => { row.remove(); sync(); });
        row.appendChild(del);
        body.appendChild(row);
        sync();
      };

      FORM.repaint.push(() => {
        addBtn.textContent = t('addRow');
        sync();
        [...head.children].forEach((h, i) => { if (cols[i]) h.textContent = lbl(cols[i].label) || cols[i].key; });
        body.querySelectorAll('.fb-items__del').forEach((d) => d.setAttribute('aria-label', t('removeRow')));
      });

      addBtn.addEventListener('click', () => addRow());
      foot.append(addBtn, count);
      input.append(head, body, foot);
      /* A repeating group that opens empty makes the total below it read 0.00,
         which is the least interesting thing it will ever say. */
      const seed = Array.isArray(f.rows) && f.rows.length ? f.rows : [null, null];
      seed.forEach((v) => addRow(v));
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
        const drop = el('button', 'fb-file__drop', { type: 'button', 'aria-label': t('removeFile') });
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

    case 'daterange': {
      /* A range is one value. Two date fields side by side cannot say "the end
         must not precede the start" — this can, because it owns both ends. */
      input = el('div', 'fb-range2');
      const hidden = el('input', null, { type: 'hidden', name: f.key });
      const from = datePicker({ name: `${f.key}__from`, id, label: `${f.label} — from` });
      const to = datePicker({ name: `${f.key}__to`, label: `${f.label} — to` });
      const arrow = el('span', 'fb-range2__arrow');
      const note = el('p', 'fb-range2__span');

      const sync = () => {
        const a = from.querySelector('input[type=hidden]').value;
        const bEnd = to.querySelector('input[type=hidden]').value;
        hidden.value = a && bEnd ? `${a}..${bEnd}` : '';
        if (a && bEnd) {
          const days = Math.round((new Date(bEnd) - new Date(a)) / 86400000) + 1;
          note.textContent = days > 0 ? `${days} day${days === 1 ? '' : 's'}` : 'The end is before the start.';
          note.classList.toggle('is-bad', days <= 0);
        } else {
          note.textContent = '';
          note.classList.remove('is-bad');
        }
        // No dispatch here: this listener sits on the wrapper, so a bubbling
        // event fired from inside it would come straight back and recurse.
        // The two pickers already emit their own, and those reach the form.
      };
      input.addEventListener('input', sync);
      input.append(from, arrow, to, hidden, note);
      break;
    }

    case 'duration': {
      input = el('div', 'fb-dur');
      const hidden = el('input', null, { type: 'hidden', name: f.key });
      const PARTS = [{ u: 'd', label: 'days', mins: 1440 },
                     { u: 'h', label: 'hours', mins: 60 },
                     { u: 'm', label: 'minutes', mins: 1 }];
      const boxes = {};

      const sync = () => {
        // the value is minutes, because that is the only unit that adds up
        hidden.value = String(PARTS.reduce((t, p) => t + (Number(boxes[p.u].value) || 0) * p.mins, 0));
        hidden.dispatchEvent(new Event('input', { bubbles: true }));
      };

      PARTS.forEach((p, i) => {
        const cell = el('label', 'fb-dur__cell');
        const box = el('input', 'fb-input fb-input--sm', {
          type: 'number', min: 0, inputmode: 'numeric', 'aria-label': p.label,
        });
        if (i === 0) box.id = id;
        box.placeholder = '0';
        box.addEventListener('input', sync);
        boxes[p.u] = box;
        const unit = el('em'); unit.textContent = p.u;
        cell.append(box, unit);
        input.appendChild(cell);
      });
      input.appendChild(hidden);
      sync();
      break;
    }

    case 'period': {
      const MON = () => Array.from({ length: 12 }, (_, i) => monthShort(i));
      input = el('div', 'fb-date');
      const hidden = el('input', null, { type: 'hidden', name: f.key });
      const btn = el('button', 'fb-date__btn', {
        type: 'button', id, 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-label': f.label,
      });
      const text = el('span', 'fb-date__value');
      const placeholder = () => { if (!text.classList.contains('is-set')) text.textContent = t('pickPeriod'); };
      placeholder();
      btn.append(el('i', 'fb-date__icon'), text);

      const pop = el('div', 'fb-date__pop', { role: 'dialog', 'data-lenis-prevent': true });
      pop.hidden = true;
      const head = el('div', 'fb-date__head');
      const prev = el('button', 'fb-date__nav', { type: 'button', 'aria-label': t('prevYear') });
      const next = el('button', 'fb-date__nav fb-date__nav--next', { type: 'button', 'aria-label': t('nextYear') });
      const title = el('span', 'fb-date__title');
      head.append(prev, title, next);
      const grid = el('div', 'fb-period__grid');
      pop.append(head, grid);

      let year = new Date().getFullYear();
      let month = null;

      const close = () => { pop.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
      const paint = () => {
        title.textContent = year;
        grid.innerHTML = '';
        MON().forEach((m, i) => {
          const b = el('button', 'fb-period__cell', { type: 'button' });
          b.textContent = m;
          if (month && month.y === year && month.m === i) b.classList.add('is-on');
          b.addEventListener('click', () => {
            month = { y: year, m: i };
            hidden.value = `${year}-${pad2(i + 1)}`;
            text.textContent = `${m} ${year}`;
            text.classList.add('is-set');
            hidden.dispatchEvent(new Event('input', { bubbles: true }));
            paint();
            close();
          });
          grid.appendChild(b);
        });
      };
      FORM.repaint.push(() => {
        prev.setAttribute('aria-label', t('prevYear'));
        next.setAttribute('aria-label', t('nextYear'));
        if (month) text.textContent = `${monthShort(month.m)} ${month.y}`; else placeholder();
        if (!pop.hidden) paint();
      });

      prev.addEventListener('click', () => { year -= 1; paint(); });
      next.addEventListener('click', () => { year += 1; paint(); });
      btn.addEventListener('click', () => {
        pop.hidden = !pop.hidden;
        btn.setAttribute('aria-expanded', String(!pop.hidden));
        if (!pop.hidden) { paint(); placePopover(btn, pop); }
      });
      dismissable(input, close, () => !pop.hidden);
      input.append(btn, hidden, pop);
      paint();
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
                     'rating', 'select', 'country', 'locale', 'quantity', 'qrcode', 'date', 'time', 'datetime-local', 'color',
                     'daterange', 'duration', 'period'];
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

  /* A label whose "for" points at nothing looks associated and is not: the
     click does nothing and a screen reader loses the pairing. Composite
     controls keep their id on whichever element actually takes focus. */
  if (input.id !== id && !input.querySelector(`[id="${id}"]`)) {
    const focusable = input.matches('input, select, textarea, button')
      ? input
      : input.querySelector('input:not([type=hidden]), select, textarea, button');
    if (focusable) focusable.id = id;
    else label.removeAttribute('for');
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

  /* The message belongs to whichever single native control carries the
     constraints. Asking the wrapper meant a phone number, an amount, a rate
     and a password with a meter all silently lost their inline error. */
  const native = ['INPUT', 'TEXTAREA', 'SELECT'].includes(input.tagName) ? input : target;
  if (native) {
    /* validationMessage is written by the browser in the browser's language,
       not in the form's. In English we let it through, because it is better
       than anything worth hand-writing; past that the engine says it itself. */
    const message = () => {
      const v = native.validity;
      if (v.valid) return '';
      if (FORM.lang === 'en') return native.validationMessage || t('invalid');
      if (v.valueMissing) return t('required');
      if (v.typeMismatch || v.patternMismatch) return t('badFormat');
      if (v.rangeUnderflow) return t('tooSmall', native.min);
      if (v.rangeOverflow) return t('tooBig', native.max);
      if (v.tooShort) return t('tooShort', native.minLength);
      if (v.tooLong) return t('tooLong', native.maxLength);
      return t('invalid');
    };
    const show = () => { err.textContent = message(); };
    native.addEventListener('invalid', (e) => { e.preventDefault(); show(); wrap.classList.add('is-invalid'); });
    native.addEventListener('input', () => { show(); wrap.classList.toggle('is-invalid', !native.validity.valid); });
    /* Re-translate a message, never introduce one. applyLocale runs the
       repainters once at boot to set the form's direction, and a required
       field is "invalid" from the moment it is drawn — so asking validity
       alone here put "Please fill out this field" under a control nobody had
       touched yet. A message that is not on the screen has nothing to
       translate; a custom one is reissued by applyLocale, which is the thing
       that knows the rules. */
    FORM.repaint.push(() => { if (err.textContent && !native.validity.valid) show(); });
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
    case 'country': {
      const row = COUNTRIES.find((c) => c.code === node.value);
      return row ? { code: row.code, name: row.name } : null;
    }
    case 'locale': {
      const row = LOCALES.find((c) => c.code === node.value);
      return row ? { code: row.code, dir: row.dir } : null;
    }
    case 'masked': {
      const r = applyMask(f.mask || '', node.value);
      return r.raw ? { value: r.raw, display: r.display } : null;
    }
    case 'qrcode': {
      const raw = String(node.value || '').trim();
      if (!raw) return null;
      return { raw, format: f.payload || 'text', parsed: payloadOf(f).parse(raw) };
    }
    case 'computed':
      return Number(node.dataset.value || 0);
    case 'daterange': {
      const [from, to] = String(node.value || '').split('..');
      return from && to ? { from, to } : null;
    }
    case 'duration': {
      const mins = Number(node.value) || 0;
      return { minutes: mins, human: `${Math.floor(mins / 1440)}d ${Math.floor((mins % 1440) / 60)}h ${mins % 60}m` };
    }
    case 'period':
      return node.value || null;
    case 'tree': {
      const picked = node.parentElement.querySelector('[aria-selected="true"]');
      return node.value ? { id: node.value, label: picked ? picked.textContent : '' } : null;
    }
    case 'quantity': {
      if (node.value === '') return null;
      const u = form.querySelector(`[name="${f.key}__uom"]`);
      const unit = u ? u.value : dimOf(f).base;
      const value = Number(node.value) || 0;
      return { value, uom: unit,
               base: Math.round(value * factorOf(f, unit) * 1e6) / 1e6, baseUom: dimOf(f).base };
    }
    case 'percent': {
      const typed = Number(node.value);
      if (node.value === '' || !Number.isFinite(typed)) return null;
      return Math.round((typed / pctDiv(f)) * 1e6) / 1e6;
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
   The step from rendering a form to running one. A field states the condition
   under which it exists, and when that condition is false the field is not
   merely invisible — it is out of the contract: not validated, not submitted.
   Anything less and you get a form that silently refuses to submit because of
   a required field nobody can see.

   The demo no longer offers a way to write one of these by hand: the site
   already makes the config-driven argument where it belongs, in the work, and
   the panel was asking for six steps before anything happened on screen. A
   schema that carries showIf still renders exactly like this. */
/* Several types answer with an object — a country, a lookup row, a tree node,
   an amount with its currency. A condition is written against the part that
   identifies the answer, not against the whole record. */
function norm(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return v;
  for (const k of ['code', 'id', 'amount', 'base', 'minutes', 'number', 'from', 'value']) if (k in v) return v[k];
  return v;
}

function conditionMet(cond, values) {
  if (!cond || !cond.field) return true;
  if (!(cond.field in values)) return true;      // fail open: never hide because of a stale reference
  const v = norm(values[cond.field]);
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

/* ---------- one answer filling in the next ----------
   Not the same thing as showIf. Nothing appears or disappears here; a value
   is written. The field names the kinds of field it drives and the engine
   finds them, so nothing in this function knows the word "country" — a row
   with columns and a list of what to spread them over is the whole contract. */
const CASCADE = {
  currency: { col: 'currency', part: '__cur' },
  tel:      { col: 'dial',     part: '__dial' },
};

function applyCascades(form, fields) {
  const seen = (form.__cascade || (form.__cascade = {}));

  fields.filter((f) => Array.isArray(f.drives) && f.drives.length).forEach((f) => {
    const src = form.querySelector(`[name="${f.key}"]`);
    if (!src) return;
    /* Only on a real change. Running on every keystroke would mean a visitor
       who deliberately picks a different currency loses it the moment they
       type anywhere else in the form. */
    if (seen[f.key] === src.value) return;
    seen[f.key] = src.value;

    const row = (DATASETS[f.ref] || COUNTRIES).find((c) => c.code === src.value);
    if (!row) return;

    f.drives.forEach((kind) => {
      const spec = CASCADE[kind];
      if (!spec) return;
      fields.filter((t) => t.type === kind).forEach((t) => {
        const hidden = form.querySelector(`[name="${t.key}${spec.part}"]`);
        const box = hidden && hidden.closest('.fb-select');
        if (box && box.setValue) box.setValue(row[spec.col]);
      });
    });
  });
}

/* Direction is not styling applied at the end; it is a value the form holds,
   the same way it holds a currency. The field that declares sets: "dir" owns
   it, and everything the engine drew repaints itself in place. */
function applyLocale(form, fields) {
  const src = fields.find((f) => f.sets === 'dir' && f.type === 'locale');
  const node = src && form.querySelector(`[name="${src.key}"]`);
  const row = LOCALES.find((c) => c.code === (node ? node.value : 'en')) || LOCALES[0];
  if (FORM.lang === row.code && form.getAttribute('dir') === row.dir) return;

  FORM.lang = row.code;
  FORM.dir = row.dir;
  form.setAttribute('dir', row.dir);
  form.setAttribute('lang', row.code);

  fields.forEach((f) => {
    const wrap = form.querySelector(`.fb-field[data-field="${f.key}"]`);
    const label = wrap && wrap.querySelector('.fb-label');
    if (!label) return;
    const star = label.querySelector('.fb-req');
    label.textContent = lbl(f.label) || f.key;
    if (star) label.appendChild(star);
  });
  FORM.repaint.forEach((fn) => { try { fn(); } catch { /* one control must not take the form down */ } });

  /* A message already on the screen is part of the form's copy too, so it
     moves language with everything else rather than sitting there in the one
     the visitor just left. */
  if (form.querySelector('.fb-field.is-invalid')) {
    customErrors(form, fields).forEach(([key, msg]) => {
      const w = form.querySelector(`.fb-field[data-field="${key}"]`);
      const p = w && w.classList.contains('is-invalid') && w.querySelector('.fb-error');
      if (p) p.textContent = msg;
    });
  }
}

/* The other half of a scan. A cascade spreads the columns of a row the engine
   already holds; this spreads the parts of a payload that arrived from outside,
   which is why it parses first and writes nothing it could not read. */
function applyScans(form, fields) {
  const seen = (form.__scan || (form.__scan = {}));

  fields.filter((f) => f.type === 'qrcode' && f.fills).forEach((f) => {
    const src = form.querySelector(`[name="${f.key}"]`);
    if (!src) return;
    if (seen[f.key] === src.value) return;      // only on a new scan
    seen[f.key] = src.value;

    const parsed = src.value.trim() ? payloadOf(f).parse(src.value) : null;
    if (!parsed) return;

    Object.entries(f.fills).forEach(([part, key]) => {
      if (parsed[part] == null) return;
      const target = fields.find((x) => x.type !== 'qrcode' && baseKey(x.key) === key);
      if (!target) return;
      const node = form.querySelector(`[name="${target.key}"]`);
      if (!node) return;
      if (node.type === 'hidden') {
        /* Composite controls keep their value in a hidden input and expose a
           setter on their wrapper. Which wrapper that is depends on the type,
           so ask rather than guess. */
        const wrap = node.closest('.fb-field');
        let host = node.parentElement;
        while (host && host !== wrap && typeof host.setValue !== 'function') host = host.parentElement;
        if (host && typeof host.setValue === 'function') host.setValue(parsed[part]);
        return;
      }
      node.value = parsed[part];                // silent: refresh is already running
    });
  });
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
    if (r.required && ['lookup', 'signature', 'multiselect', 'rating', 'richtext', 'otp', 'tree',
                       'daterange', 'period'].includes(f.type) && empty)
      out.push([f.key, t('required')]);

    if (f.type === 'otp' && r.minLength && v && String(v).length < r.minLength)
      out.push([f.key, t('otpAll', r.minLength)]);

    if (f.type === 'tree' && r.leafOnly && v && v.id) {
      const node = form.querySelector(`.fb-tree__node[data-id="${v.id}"]`);
      if (node && node.dataset.leaf !== 'true') out.push([f.key, t('leafOnly')]);
    }

    if (r.required && f.type === 'duration' && (!v || !v.minutes))
      out.push([f.key, t('required')]);

    if (r.minSelected && (!Array.isArray(v) || v.length < r.minSelected))
      out.push([f.key, t('minSelected', r.minSelected)]);

    if (r.minRows && (!Array.isArray(v) || v.length < r.minRows))
      out.push([f.key, t('minRows', r.minRows)]);

    if (r.maxRows && Array.isArray(v) && v.length > r.maxRows)
      out.push([f.key, t('maxRows', r.maxRows)]);

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
      if (dupe) out.push([f.key, t('dupe', r.unique)]);
    }

    if (r.strength && f.type === 'password' && v) {
      const s = strength(v);
      if (s.score < 4) out.push([f.key, t('pwNeeds', listOf(s.missing))]);
    }

    if (f.type === 'quantity') {
      if (r.required && !v) out.push([f.key, t('required')]);
      else if (v && r.min != null && v.base < r.min) out.push([f.key, t('qtyMin', r.min, v.baseUom)]);
      else if (v && r.max != null && v.base > r.max) out.push([f.key, t('qtyMax', r.max, v.baseUom)]);
    }

    if (r.strict && f.type === 'qrcode' && v && !v.parsed)
      out.push([f.key, t('qrStrict', t(payloadOf(f).tkey))]);

    if (r.complete && f.type === 'masked' && v && v.value.length < maskSlots(f.mask || ''))
      out.push([f.key, t('maskAll', maskSlots(f.mask || ''), f.mask)]);

    if (r.requiredTrue && v !== true)
      out.push([f.key, t('mustBeOn')]);

    if (r.min != null && f.type === 'rating' && Number(v) < r.min)
      out.push([f.key, t('atLeast', r.min)]);

    if (r.notPast && v && f.type === 'daterange' && new Date(v.from) < today)
      out.push([f.key, t('noPastStart')]);
    else if (r.notPast && v && f.type === 'period' && new Date(`${v}-01`) < new Date(today.getFullYear(), today.getMonth(), 1))
      out.push([f.key, t('periodClosed')]);
    else if (r.notPast && v && !['daterange', 'period'].includes(f.type) && new Date(v) < today)
      out.push([f.key, t('noPast')]);

    if (f.type === 'daterange' && v) {
      const days = Math.round((new Date(v.to) - new Date(v.from)) / 86400000) + 1;
      if (days <= 0) out.push([f.key, t('endBeforeStart')]);
      else if (r.maxSpan && days > r.maxSpan) out.push([f.key, t('maxSpan', r.maxSpan)]);
    }

    if (f.type === 'duration' && v) {
      if (r.min && v.minutes < r.min) out.push([f.key, t('minHours', Math.round(r.min / 60))]);
      if (r.max && v.minutes > r.max) out.push([f.key, t('maxDays', Math.round(r.max / 1440))]);
    }

    if (r.maxSize && f.type === 'file') {
      const node = form.querySelector(`[name="${f.key}"]`);
      const file = node && node.files && node.files[0];
      if (file && file.size > r.maxSize * 1024 * 1024)
        out.push([f.key, t('maxSize', r.maxSize)]);
    }
  });

  return out;
}

/* Builds the filter bar the list view would get from this same schema, and
   the query object those filters produce. Nothing here knows a field type —
   it asks FILTER_KIND what shape the filter takes. */
export function renderFilters(schema, mount, queryMount) {
  const fields = ((schema && schema.fields) || []).filter((f) => f.filterable && FILTER_KIND[f.type]);
  mount.innerHTML = '';
  if (queryMount) queryMount.textContent = '';

  if (!fields.length) {
    const p = el('p', 'fb-empty');
    p.textContent = 'A field marked filterable in the schema shows the filter it would add to the list view here.';
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
    lab.textContent = (f.label && typeof f.label === 'object' ? f.label.en : f.label) || f.key;
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
  FORM.repaint = [];                 // the old form's repainters die with it
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
  submit.textContent = t('submit');
  FORM.repaint.push(() => { submit.textContent = t('submit'); });
  actions.appendChild(submit);
  const out = el('pre', 'fb-output', { 'aria-live': 'polite' });
  form.append(actions, out);

  // A computed field answers to the whole form, so it re-runs on any change —
  // and so does every condition, because one answer can reveal the next question.
  const refresh = () => {
    applyLocale(form, fields);
    applyCascades(form, fields);
    applyScans(form, fields);
    applyVisibility(form, fields);   // last: a condition judges the values as they now are
    recompute(form, fields);
  };
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
  const queryEl = document.querySelector('[data-fb-query]');
  /* The rendered form and the filter panel are optional mounts: the page can
     show the palette and the schema alone. Everything below still runs when
     they are there, and nothing throws when they are not. */
  const preview = document.querySelector('[data-fb-preview]');
  const schemaEl= document.querySelector('[data-fb-schema]');
  const resetBtn= document.querySelector('[data-fb-reset]');
  const count   = document.querySelector('[data-fb-count]');
  if (!gallery) return;                       // the palette is the one mount this needs
  if (gallery.dataset.ready) return;          // boot() may fall back to bootReduced(); never wire twice
  gallery.dataset.ready = '1';

  /* The palette snaps to a row so it never rests halfway through one. That
     fights the keyboard: the browser scrolls a focused chip into view and the
     snap immediately pulls the list back to the nearest row, which for the
     last two chips put them under the fold again — tabbed to, and invisible.
     Snapping is a pointer nicety, so it stands down while the keyboard is
     inside the palette and comes back when focus leaves. */
  gallery.addEventListener('focusin', () => { gallery.style.scrollSnapType = 'none'; });
  gallery.addEventListener('focusout', (e) => {
    if (!gallery.contains(e.relatedTarget)) gallery.style.scrollSnapType = '';
  });

  /* The form the demo opens with. It used to be a text box and a dropdown,
     which is what every form on earth opens with — nothing here was doing
     anything until the visitor worked out the palette and picked well. So it
     opens mid-sentence instead: the country is already driving the dial code
     and the currency, and the total is already a total. Change the country and
     two other fields move, three seconds in, with nobody explaining anything.
     The thirty-seven controls are still there for whoever wants them.

     It also carries the two things that are not properties of any one control
     and therefore have no button: the section each field sits under, and which
     fields the list view can be filtered by. Both are visible on arrival —
     headings in the form, filters in the panel below it — which is a better
     explanation than a toggle nobody could read. */
  const START = () => ({ fields: [
    { key: 'company', label: { en: 'Company name', ar: 'اسم الشركة', fr: 'Raison sociale' },
      type: 'text', width: 'w-50', section: 'Customer', placeholder: 'Acme Trading',
      rules: { required: true, minLength: 3 }, filterable: true },
    { key: 'country', label: { en: 'Country', ar: 'الدولة', fr: 'Pays' },
      type: 'country', width: 'w-50', section: 'Customer', ref: 'countries', value: 'EG',
      drives: ['currency', 'tel'], searchable: true, filterable: true },
    { key: 'phone', label: { en: 'Phone', ar: 'الهاتف', fr: 'Téléphone' },
      type: 'tel', width: 'w-50', section: 'Customer', dial: '+20', dials: DIALS, placeholder: '10 1234 5678' },
    { key: 'budget', label: { en: 'Budget', ar: 'الميزانية', fr: 'Budget' },
      type: 'currency', width: 'w-50', section: 'Order', currency: 'EGP', currencies: CURRENCIES,
      value: 25000, filterable: true },
    { key: 'items', label: { en: 'Line items', ar: 'البنود', fr: 'Lignes' },
      type: 'lineitems', width: 'w-100', section: 'Order', fields: [
        { key: 'desc', label: 'Description', type: 'text' },
        { key: 'qty', label: 'Qty', type: 'quantity', dimension: 'count', uom: 'pc', value: 1 },
        { key: 'price', label: 'Unit price', type: 'number', value: 0 },
      ], rows: [
        { desc: 'Rack server', qty: 3, price: 250 },
        { desc: 'Switch 48-port', qty: 2, price: 125 },
      ] },
    { key: 'total', label: { en: 'Order total', ar: 'إجمالي الطلب', fr: 'Total' },
      type: 'computed', width: 'w-50', section: 'Order', expr: 'sum(qty * price)', format: 'currency' },
  ]});

  let schema = START();
  let active = CONTROLS[0];
  let seq = 0;
  let width = null;                 // null = whatever the type calls natural
  let rules = {};                   // the rules the visitor has switched on
  let searchable = false;           // does this control get a search box in it?
  let help = false;                 // show a line of guidance under the control

  /* Only a control that holds a list of choices has anything to search. */
  const CAN_SEARCH = new Set(['select', 'multiselect', 'country', 'locale']);

  /* This row used to hold three unrelated things under one word that meant
     "miscellaneous": which section heading the field sat under, whether it
     added a filter to the list view, and whether it showed help. The first two
     are not properties of the control in front of you — they describe the form
     and the list around it — and putting them here is why nobody could read
     the row, including the person who built it. Both still exist in the
     schema; the opening form demonstrates them rather than announcing them. */
  const paintOpts = () => {
    if (!optsEl) return;
    optsEl.innerHTML = '';

    if (CAN_SEARCH.has(active.type)) {
      const b = el('button', 'fb-rule', { type: 'button', 'aria-pressed': String(searchable) });
      b.textContent = 'searchable — type to filter';
      b.addEventListener('click', () => { searchable = !searchable; paintOpts(); });
      optsEl.appendChild(b);
    }

    if (HELP[active.type]) {
      const hb = el('button', 'fb-rule', { type: 'button', 'aria-pressed': String(help) });
      hb.textContent = 'help text';
      hb.addEventListener('click', () => { help = !help; paintOpts(); });
      optsEl.appendChild(hb);
    }

    if (!optsEl.children.length) {
      const note = el('span', 'fb-rules__none');
      note.textContent = 'Nothing to switch on for this one.';
      optsEl.appendChild(note);
    }
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
    gallery.querySelectorAll('.fb-chip').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.type === c.type)));
    paintPreview();
    paintWidth();
    paintRules();
    paintOpts();
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
    if (help && HELP[active.type]) f.help = HELP[active.type];
    /* A computed field is only as good as the fields it can see: if this form
       already carries a rate, the sample expression spends it rather than
       pretending the discount is not there. */
    if (active.type === 'computed') {
      const pct = schema.fields.find((x) => x.type === 'percent');
      if (pct) f.expr = `sum(qty * price) * (1 - ${baseKey(pct.key)})`;
    }
    if (searchable && CAN_SEARCH.has(active.type)) f.searchable = true;
    if (Object.keys(rules).length) f.rules = { ...rules };
    schema.fields.push(f);
    const restore = carry();
    if (preview) renderForm(schema, preview);
    restore();
    if (filtEl) renderFilters(schema, filtEl, queryEl);
    paintSchema(schema.fields.length - 1);
  });

  /* Every value the visitor types lives in the DOM, and adding a control
     rebuilds the form from the schema — so the palette quietly undid whatever
     had just been demonstrated. It went unnoticed while the form opened with
     two empty fields: there was nothing there to lose. Now it opens with a
     country already driving two other fields, so changing one is the first
     thing a visitor does and reaching for the palette is the second.

     Returns the other half of itself: call it after the rebuild. */
  const carry = () => {
    const form = preview && preview.querySelector('.fb-form');
    if (!form) return () => {};

    const single = new Map();                 // name -> value
    const group = new Map();                  // name -> the values currently checked
    form.querySelectorAll('[name]').forEach((n) => {
      if (n.type === 'checkbox' || n.type === 'radio') {
        if (!group.has(n.name)) group.set(n.name, new Set());
        if (n.checked) group.get(n.name).add(n.value);
      } else single.set(n.name, n.value);
    });

    /* Rows are not named inputs, so they travel back in through the same
       seeding path the demo's opening rows use — borrowed for one render and
       handed back, so the schema on screen still reads as a schema. */
    const declared = new Map();
    schema.fields.filter((f) => f.type === 'lineitems').forEach((f) => {
      const body = form.querySelector(`[data-field="${f.key}"] .fb-items__body`);
      if (!body) return;
      declared.set(f.key, f.rows);
      f.rows = [...body.children].map((row) => {
        const vals = {};
        row.querySelectorAll('[data-col]').forEach((c) => {
          vals[c.dataset.col] = c.value;
          if (c.dataset.uom) vals[`${c.dataset.col}__uom`] = c.dataset.uom;
        });
        return vals;
      });
    });

    return () => {
      declared.forEach((rows, key) => {
        const f = schema.fields.find((x) => x.key === key);
        if (!f) return;
        if (rows === undefined) delete f.rows; else f.rows = rows;
      });

      const next = preview && preview.querySelector('.fb-form');
      if (!next) return;

      single.forEach((v, name) => {
        const node = next.querySelector(`[name="${name}"]`);
        if (!node || node.value === v) return;
        if (node.type !== 'hidden') { node.value = v; return; }
        let host = node.parentElement;        // a custom widget owns its hidden input
        while (host && host !== next && typeof host.setValue !== 'function') host = host.parentElement;
        if (host && typeof host.setValue === 'function') host.setValue(v); else node.value = v;
      });
      group.forEach((set, name) => {
        next.querySelectorAll(`[name="${name}"]`).forEach((n) => { n.checked = set.has(n.value); });
      });

      /* A cascade fires when its source changes, and a source the form has
         never seen counts as changed. Tell the new form what it is already
         looking at, or it would re-drive over a currency picked by hand. */
      const memo = (prop, wants) => {
        const seen = (next[prop] = {});
        schema.fields.filter(wants).forEach((f) => {
          const src = next.querySelector(`[name="${f.key}"]`);
          if (src) seen[f.key] = src.value;
        });
      };
      memo('__cascade', (f) => Array.isArray(f.drives) && f.drives.length);
      memo('__scan', (f) => f.type === 'qrcode' && f.fills);

      next.dispatchEvent(new Event('input', { bubbles: true }));
    };
  };

  resetBtn && resetBtn.addEventListener('click', () => {
    schema = START(); seq = 0;
    if (preview) renderForm(schema, preview);
    if (filtEl) renderFilters(schema, filtEl, queryEl);
    paintSchema();
  });

  select(CONTROLS[0]);
  if (preview) renderForm(schema, preview);
  if (filtEl) renderFilters(schema, filtEl, queryEl);
  paintSchema();
}
