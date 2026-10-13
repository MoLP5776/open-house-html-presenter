import { Lang, Localized, localize } from './i18n';
import { esc, jsStr } from './text-utils';

export type Category = 'html' | 'css' | 'js';

export type FieldKey =
  | 'text'
  | 'emoji'
  | 'size'
  | 'label'
  | 'items'
  | 'url'
  | 'color'
  | 'c1'
  | 'c2'
  | 'font'
  | 'target'
  | 'anim'
  | 'msg'
  | 'placeholder'
  | 'hello';

export type Values = Partial<Record<FieldKey, string>>;

export interface FieldOption {
  v: string;
  label: Localized<string>;
}

export interface FieldDef {
  k: FieldKey;
  type: 'text' | 'color' | 'range' | 'select';
  label: Localized<string>;
  def: Localized<string>;
  small?: boolean;
  min?: number;
  max?: number;
  unit?: string;
  options?: FieldOption[];
}

export interface GenOut {
  html?: string;
  css?: string;
  js?: string;
}

export interface BlockDef {
  cat: Category;
  icon: string;
  name: Localized<string>;
  tip?: Localized<string>;
  fields: FieldDef[];
  gen: (v: Values, id: number, lang: Lang) => GenOut;
}

const cm = (o: Localized<string>, lang: Lang) => '// ' + localize(o, lang);

/** Block definitions — each block produces real HTML / CSS / JS. */
export const BLOCKS = {
  /* ---------------- HTML ---------------- */
  heading: {
    cat: 'html',
    icon: 'H1',
    name: { de: 'Überschrift', en: 'Heading' },
    fields: [
      { k: 'text', type: 'text', label: 'Text', def: { de: 'Meine erste Webseite 🚀', en: 'My first website 🚀' } },
    ],
    gen: (v) => ({ html: `<h1>${esc(v.text)}</h1>` }),
  },
  paragraph: {
    cat: 'html',
    icon: '¶',
    name: { de: 'Text', en: 'Paragraph' },
    fields: [
      { k: 'text', type: 'text', label: 'Text', def: { de: 'Das hier ist ganz normaler Text.', en: 'This is just normal text.' } },
    ],
    gen: (v) => ({ html: `<p>${esc(v.text)}</p>` }),
  },
  emoji: {
    cat: 'html',
    icon: '😀',
    name: { de: 'Emoji-Sticker', en: 'Emoji sticker' },
    fields: [
      { k: 'emoji', type: 'text', small: true, label: 'Emoji', def: '🦄' },
      { k: 'size', type: 'range', min: 20, max: 220, unit: 'px', label: { de: 'Größe', en: 'Size' }, def: '90' },
    ],
    gen: (v) => ({ html: `<div style="font-size: ${v.size}px">${esc(v.emoji)}</div>` }),
  },
  button: {
    cat: 'html',
    icon: '▭',
    name: { de: 'Button', en: 'Button' },
    tip: { de: 'Tut noch nichts – dafür braucht es JavaScript!', en: 'Does nothing yet – that needs JavaScript!' },
    fields: [
      { k: 'label', type: 'text', label: { de: 'Beschriftung', en: 'Label' }, def: { de: 'Klick mich!', en: 'Click me!' } },
    ],
    gen: (v) => ({ html: `<button>${esc(v.label)}</button>` }),
  },
  list: {
    cat: 'html',
    icon: '☰',
    name: { de: 'Liste', en: 'List' },
    fields: [
      {
        k: 'items',
        type: 'text',
        label: { de: 'Punkte (mit Komma)', en: 'Items (commas)' },
        def: { de: 'Pizza, Gaming, Programmieren', en: 'Pizza, Gaming, Coding' },
      },
    ],
    gen: (v) => {
      const items = String(v.items ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      return { html: '<ul>\n' + items.map((i) => `  <li>${esc(i)}</li>`).join('\n') + '\n</ul>' };
    },
  },
  link: {
    cat: 'html',
    icon: '🔗',
    name: { de: 'Link', en: 'Link' },
    fields: [
      { k: 'text', type: 'text', label: 'Text', def: { de: 'Mehr über HTML lernen', en: 'Learn more about HTML' } },
      { k: 'url', type: 'text', label: { de: 'Adresse', en: 'Address' }, def: 'https://developer.mozilla.org' },
    ],
    gen: (v) => ({ html: `<p><a href="${esc(v.url)}" target="_blank">${esc(v.text)}</a></p>` }),
  },
  hr: {
    cat: 'html',
    icon: '—',
    name: { de: 'Trennlinie', en: 'Divider' },
    fields: [],
    gen: () => ({ html: '<hr>' }),
  },

  /* ---------------- CSS ---------------- */
  bg: {
    cat: 'css',
    icon: '🎨',
    name: { de: 'Hintergrundfarbe', en: 'Background colour' },
    fields: [{ k: 'color', type: 'color', label: { de: 'Farbe', en: 'Colour' }, def: '#ffe4f1' }],
    gen: (v) => ({ css: `body {\n  background: ${v.color};\n}` }),
  },
  gradient: {
    cat: 'css',
    icon: '🌈',
    name: { de: 'Farbverlauf', en: 'Gradient' },
    fields: [
      { k: 'c1', type: 'color', label: { de: 'Farbe 1', en: 'Colour 1' }, def: '#7c3aed' },
      { k: 'c2', type: 'color', label: { de: 'Farbe 2', en: 'Colour 2' }, def: '#ec4899' },
    ],
    gen: (v) => ({ css: `body {\n  background: linear-gradient(135deg, ${v.c1}, ${v.c2});\n}` }),
  },
  textColor: {
    cat: 'css',
    icon: 'A',
    name: { de: 'Textfarbe', en: 'Text colour' },
    fields: [{ k: 'color', type: 'color', label: { de: 'Farbe', en: 'Colour' }, def: '#1e293b' }],
    gen: (v) => ({ css: `body {\n  color: ${v.color};\n}` }),
  },
  font: {
    cat: 'css',
    icon: 'Aa',
    name: { de: 'Schriftart', en: 'Font' },
    fields: [
      {
        k: 'font',
        type: 'select',
        label: { de: 'Schrift', en: 'Font' },
        def: 'Comic Sans MS',
        options: ['Comic Sans MS', 'Georgia', 'Courier New', 'Impact', 'Trebuchet MS', 'Arial'].map((f) => ({
          v: f,
          label: f,
        })),
      },
    ],
    gen: (v) => ({ css: `body {\n  font-family: '${v.font}', sans-serif;\n}` }),
  },
  center: {
    cat: 'css',
    icon: '≡',
    name: { de: 'Alles zentrieren', en: 'Center everything' },
    fields: [],
    gen: () => ({ css: 'body {\n  text-align: center;\n}' }),
  },
  bigHeading: {
    cat: 'css',
    icon: '🔠',
    name: { de: 'Überschrift-Stil', en: 'Heading style' },
    fields: [
      { k: 'size', type: 'range', min: 16, max: 140, unit: 'px', label: { de: 'Größe', en: 'Size' }, def: '64' },
      { k: 'color', type: 'color', label: { de: 'Farbe', en: 'Colour' }, def: '#ffffff' },
    ],
    gen: (v) => ({ css: `h1 {\n  font-size: ${v.size}px;\n  color: ${v.color};\n}` }),
  },
  fancyButtons: {
    cat: 'css',
    icon: '💊',
    name: { de: 'Coole Buttons', en: 'Cool buttons' },
    fields: [{ k: 'color', type: 'color', label: { de: 'Farbe', en: 'Colour' }, def: '#f43f5e' }],
    gen: (v) => ({
      css: `button {\n  background: ${v.color};\n  color: white;\n  border: none;\n  padding: 12px 28px;\n  margin: 6px;\n  font-size: 18px;\n  font-family: inherit;\n  border-radius: 999px;\n  cursor: pointer;\n  transition: transform 0.2s;\n}\nbutton:hover {\n  transform: scale(1.1);\n}`,
    }),
  },
  cards: {
    cat: 'css',
    icon: '🃏',
    name: { de: 'Karten-Look', en: 'Card look' },
    fields: [],
    gen: () => ({
      css: 'p, ul {\n  background: rgba(255, 255, 255, 0.85);\n  color: #222;\n  padding: 16px 24px;\n  border-radius: 16px;\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);\n}',
    }),
  },
  animate: {
    cat: 'css',
    icon: '🌀',
    name: { de: 'Animation', en: 'Animation' },
    fields: [
      {
        k: 'target',
        type: 'select',
        label: { de: 'Was?', en: 'What?' },
        def: 'h1',
        options: [
          { v: 'h1', label: { de: 'Überschriften', en: 'Headings' } },
          { v: 'p', label: { de: 'Texte', en: 'Paragraphs' } },
          { v: 'button', label: 'Buttons' },
          { v: 'div', label: 'Emojis' },
        ],
      },
      {
        k: 'anim',
        type: 'select',
        label: { de: 'Wie?', en: 'How?' },
        def: 'bounce',
        options: [
          { v: 'bounce', label: { de: 'Hüpfen', en: 'Bounce' } },
          { v: 'wiggle', label: { de: 'Wackeln', en: 'Wiggle' } },
          { v: 'spin', label: { de: 'Drehen', en: 'Spin' } },
          { v: 'pulse', label: { de: 'Pulsieren', en: 'Pulse' } },
        ],
      },
    ],
    gen: (v) => {
      const frames: Record<string, string> = {
        bounce: '  0%, 100% { transform: translateY(0); }\n  50% { transform: translateY(-20px); }',
        wiggle: '  0%, 100% { transform: rotate(0deg); }\n  25% { transform: rotate(-8deg); }\n  75% { transform: rotate(8deg); }',
        spin: '  from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }',
        pulse: '  0%, 100% { transform: scale(1); }\n  50% { transform: scale(1.15); }',
      };
      const anim = v.anim ?? 'bounce';
      const timing = anim === 'spin' ? '2s linear' : '1s ease-in-out';
      return {
        css: `@keyframes ${anim} {\n${frames[anim] || frames['bounce']}\n}\n${v.target} {\n  display: inline-block;\n  animation: ${anim} ${timing} infinite;\n}`,
      };
    },
  },

  /* ---------------- JavaScript ---------------- */
  alert: {
    cat: 'js',
    icon: '💬',
    name: { de: 'Popup-Nachricht', en: 'Popup message' },
    fields: [
      { k: 'label', type: 'text', label: 'Button', def: { de: 'Geheimer Button', en: 'Secret button' } },
      {
        k: 'msg',
        type: 'text',
        label: { de: 'Nachricht', en: 'Message' },
        def: { de: 'Du hast den geheimen Button gefunden! 🕵️', en: 'You found the secret button! 🕵️' },
      },
    ],
    gen: (v, id, lang) => ({
      html: `<button id="popup-${id}">${esc(v.label)}</button>`,
      js: `${cm({ de: 'Klick → Popup anzeigen', en: 'Click → show a popup' }, lang)}\ndocument.getElementById('popup-${id}').addEventListener('click', () => {\n  alert(${jsStr(v.msg)});\n});`,
    }),
  },
  randomColor: {
    cat: 'js',
    icon: '🎲',
    name: { de: 'Zufallsfarbe', en: 'Random colour' },
    fields: [{ k: 'label', type: 'text', label: 'Button', def: { de: '🎨 Neue Farbe', en: '🎨 New colour' } }],
    gen: (v, id, lang) => ({
      html: `<button id="color-${id}">${esc(v.label)}</button>`,
      js: `${cm({ de: 'Klick → zufällige Hintergrundfarbe', en: 'Click → random background colour' }, lang)}\ndocument.getElementById('color-${id}').addEventListener('click', () => {\n  const hue = Math.floor(Math.random() * 360);\n  document.body.style.background = 'hsl(' + hue + ', 80%, 70%)';\n});`,
    }),
  },
  counter: {
    cat: 'js',
    icon: '🔢',
    name: { de: 'Klick-Zähler', en: 'Click counter' },
    fields: [{ k: 'label', type: 'text', label: 'Text', def: { de: 'Klicks', en: 'Clicks' } }],
    gen: (v, id, lang) => ({
      html: `<button id="counter-${id}">${esc(v.label)}: 0</button>`,
      js: `${cm({ de: 'Zählt jeden Klick mit', en: 'Counts every click' }, lang)}\n{\n  let count = 0;\n  const button = document.getElementById('counter-${id}');\n  button.addEventListener('click', () => {\n    count = count + 1;\n    button.textContent = ${jsStr(v.label + ': ')} + count;\n  });\n}`,
    }),
  },
  greet: {
    cat: 'js',
    icon: '👋',
    name: { de: 'Begrüßung', en: 'Greeting' },
    fields: [
      {
        k: 'placeholder',
        type: 'text',
        label: { de: 'Eingabefeld', en: 'Input field' },
        def: { de: 'Wie heißt du?', en: "What's your name?" },
      },
      { k: 'hello', type: 'text', label: { de: 'Gruß', en: 'Greeting' }, def: { de: 'Hallo', en: 'Hello' } },
    ],
    gen: (v, id, lang) => ({
      html: `<input id="name-${id}" placeholder="${esc(v.placeholder)}">\n<button id="hello-${id}">${esc(v.hello)}!</button>\n<p id="answer-${id}"></p>`,
      js: `${cm({ de: 'Liest den Namen aus dem Eingabefeld', en: 'Reads the name from the input field' }, lang)}\ndocument.getElementById('hello-${id}').addEventListener('click', () => {\n  const name = document.getElementById('name-${id}').value;\n  document.getElementById('answer-${id}').textContent = ${jsStr(v.hello + ' ')} + name + '! 👋';\n});`,
    }),
  },
  clock: {
    cat: 'js',
    icon: '⏰',
    name: { de: 'Live-Uhr', en: 'Live clock' },
    fields: [
      { k: 'size', type: 'range', min: 16, max: 120, unit: 'px', label: { de: 'Größe', en: 'Size' }, def: '48' },
    ],
    gen: (v, id, lang) => ({
      html: `<p id="clock-${id}" style="font-size: ${v.size}px; font-weight: bold"></p>`,
      js: `${cm({ de: 'Jede Sekunde die Uhrzeit neu anzeigen', en: 'Show the time again every second' }, lang)}\n{\n  const clock = document.getElementById('clock-${id}');\n  const tick = () => {\n    clock.textContent = '⏰ ' + new Date().toLocaleTimeString();\n  };\n  tick();\n  setInterval(tick, 1000);\n}`,
    }),
  },
  changeHeading: {
    cat: 'js',
    icon: '✏️',
    name: { de: 'Überschrift ändern', en: 'Change heading' },
    fields: [
      { k: 'label', type: 'text', label: 'Button', def: { de: 'Zaubern 🪄', en: 'Magic 🪄' } },
      {
        k: 'text',
        type: 'text',
        label: { de: 'Neuer Text', en: 'New text' },
        def: { de: 'Simsalabim! ✨', en: 'Abracadabra! ✨' },
      },
    ],
    gen: (v, id, lang) => ({
      html: `<button id="change-${id}">${esc(v.label)}</button>`,
      js: `${cm({ de: 'Sucht die <h1> und tauscht ihren Text aus', en: 'Finds the <h1> and swaps its text' }, lang)}\ndocument.getElementById('change-${id}').addEventListener('click', () => {\n  const heading = document.querySelector('h1');\n  if (heading) {\n    heading.textContent = ${jsStr(v.text)};\n  }\n});`,
    }),
  },
  darkMode: {
    cat: 'js',
    icon: '🌙',
    name: { de: 'Dark-Mode-Schalter', en: 'Dark mode switch' },
    fields: [{ k: 'label', type: 'text', label: 'Button', def: '🌙 Dark Mode' }],
    gen: (v, id, lang) => ({
      html: `<button id="dark-${id}">${esc(v.label)}</button>`,
      css: '.dark {\n  background: #111 !important;\n  color: #eee !important;\n}',
      js: `${cm({ de: 'Schaltet die Klasse "dark" ein und aus', en: 'Turns the "dark" class on and off' }, lang)}\ndocument.getElementById('dark-${id}').addEventListener('click', () => {\n  document.body.classList.toggle('dark');\n});`,
    }),
  },
  confetti: {
    cat: 'js',
    icon: '🎉',
    name: { de: 'Konfetti-Kanone', en: 'Confetti cannon' },
    fields: [
      { k: 'label', type: 'text', label: 'Button', def: { de: '🎉 Party!', en: '🎉 Party!' } },
      { k: 'emoji', type: 'text', small: true, label: 'Emoji', def: '🎉' },
    ],
    gen: (v, id, lang) => ({
      html: `<button id="party-${id}">${esc(v.label)}</button>`,
      js: `${cm({ de: '40 Emojis vom Himmel fallen lassen', en: 'Drop 40 emojis from the sky' }, lang)}\ndocument.getElementById('party-${id}').addEventListener('click', () => {\n  for (let i = 0; i < 40; i++) {\n    const piece = document.createElement('div');\n    piece.textContent = ${jsStr(v.emoji)};\n    piece.style.position = 'fixed';\n    piece.style.left = Math.random() * 100 + 'vw';\n    piece.style.top = '-60px';\n    piece.style.fontSize = (20 + Math.random() * 30) + 'px';\n    piece.style.pointerEvents = 'none';\n    document.body.appendChild(piece);\n    const fall = piece.animate(\n      [{ transform: 'translateY(0) rotate(0deg)' }, { transform: 'translateY(110vh) rotate(720deg)' }],\n      { duration: 1500 + Math.random() * 2000, easing: 'ease-in' }\n    );\n    fall.onfinish = () => piece.remove();\n  }\n});`,
    }),
  },
  mouseTrail: {
    cat: 'js',
    icon: '✨',
    name: { de: 'Maus-Glitzer', en: 'Mouse sparkles' },
    fields: [{ k: 'emoji', type: 'text', small: true, label: 'Emoji', def: '✨' }],
    gen: (v, _id, lang) => ({
      js: `${cm({ de: 'Bei jeder Mausbewegung ein Emoji erzeugen', en: 'Create an emoji on every mouse move' }, lang)}\ndocument.addEventListener('mousemove', (event) => {\n  const spark = document.createElement('div');\n  spark.textContent = ${jsStr(v.emoji)};\n  spark.style.position = 'fixed';\n  spark.style.left = event.clientX + 'px';\n  spark.style.top = event.clientY + 'px';\n  spark.style.pointerEvents = 'none';\n  document.body.appendChild(spark);\n  const fade = spark.animate(\n    [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(0.2) translateY(30px)' }],\n    { duration: 800 }\n  );\n  fade.onfinish = () => spark.remove();\n});`,
    }),
  },
} satisfies Record<string, BlockDef>;

export type BlockType = keyof typeof BLOCKS;

export const BLOCK_TYPES = Object.keys(BLOCKS) as BlockType[];

export const blockDef = (type: BlockType): BlockDef => BLOCKS[type];

export const isBlockType = (type: unknown): type is BlockType =>
  typeof type === 'string' && Object.prototype.hasOwnProperty.call(BLOCKS, type);

export interface Block {
  id: number;
  type: BlockType;
  values: Values;
}

export type PresetName = 'party' | 'profile';
export type PresetEntry = [BlockType, Partial<Record<FieldKey, Localized<string>>>?];

export const PRESETS: Record<PresetName, PresetEntry[]> = {
  party: [
    ['gradient', { c1: '#7c3aed', c2: '#ec4899' }],
    ['textColor', { color: '#ffffff' }],
    ['center'],
    ['font', { font: 'Comic Sans MS' }],
    ['heading', { text: { de: 'Willkommen zur Party! 🥳', en: 'Welcome to the party! 🥳' } }],
    ['bigHeading', { size: '60', color: '#fde047' }],
    ['animate', { target: 'h1', anim: 'bounce' }],
    ['emoji', { emoji: '🦄', size: '120' }],
    ['animate', { target: 'div', anim: 'wiggle' }],
    ['fancyButtons', { color: '#f59e0b' }],
    ['confetti'],
    ['counter'],
    ['randomColor'],
    ['mouseTrail'],
  ],
  profile: [
    ['bg', { color: '#e0f2fe' }],
    ['font', { font: 'Trebuchet MS' }],
    ['cards'],
    ['bigHeading', { size: '52', color: '#0369a1' }],
    ['heading', { text: { de: 'Hi, ich bin Moritz 👋', en: "Hi, I'm Moritz 👋" } }],
    [
      'paragraph',
      {
        text: {
          de: 'Ich bin 19 und interessiere mich für Technik und Games.',
          en: "I'm 19 and I'm into tech and games.",
        },
      },
    ],
    ['list'],
    ['fancyButtons', { color: '#0ea5e9' }],
    ['greet'],
    ['darkMode'],
    ['clock', { size: '32' }],
  ],
};

export const BASE_CSS =
  '* {\n  box-sizing: border-box;\n}\nbody {\n  margin: 0;\n  padding: 24px;\n  min-height: 100vh;\n  font-family: sans-serif;\n}';
