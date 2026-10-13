export type Lang = 'de' | 'en';
export const LANGS: Lang[] = ['de', 'en'];

/** A value that is either the same in every language or given per language. */
export type Localized<T> = T | { de: T; en: T };

export function localize<T>(o: Localized<T>, lang: Lang): T {
  if (o && typeof o === 'object' && 'de' in o) {
    const per = o as { de: T; en: T };
    return per[lang] !== undefined ? per[lang] : per.de;
  }
  return o as T;
}

export interface Strings {
  title: string;
  tabBlocks: string;
  tabCode: string;
  examples: string;
  party: string;
  profile: string;
  reset: string;
  resetConfirm: string;
  blocks: string;
  paletteHint: string;
  htmlDesc: string;
  cssDesc: string;
  jsDesc: string;
  yourPage: string;
  count: (n: number) => string;
  dropHint: string;
  preview: string;
  fullscreen: string;
  exitFull: string;
  code: string;
  hoverHint: string;
  copy: string;
  copied: string;
  editInCode: string;
  yourCode: string;
  fromBlocks: string;
  starter: string;
  tryThis: string;
  console: string;
  consoleEmpty: string;
  up: string;
  down: string;
  del: string;
  pageTitle: string;
  resize: string;
  tips: string[];
}

export const STR: Record<Lang, Strings> = {
  de: {
    title: 'Web-Spielplatz',
    tabBlocks: '🧩 Bausteine',
    tabCode: '⌨️ Selbst coden',
    examples: 'Beispiele:',
    party: '🎉 Party',
    profile: '🪪 Steckbrief',
    reset: '🗑️ Neu starten',
    resetConfirm: '⚠️ Sicher? Nochmal klicken',
    blocks: 'Bausteine',
    paletteHint: 'ziehen oder klicken',
    htmlDesc: 'Was steht auf der Seite?',
    cssDesc: 'Wie sieht es aus?',
    jsDesc: 'Was passiert, wenn …?',
    yourPage: 'Deine Seite',
    count: (n) => (n === 1 ? '1 Baustein' : n + ' Bausteine'),
    dropHint: 'Zieh Bausteine hierher –<br>oder klick einfach links drauf!',
    preview: 'Vorschau',
    fullscreen: '⛶ Vollbild',
    exitFull: '✕ Vollbild beenden',
    code: 'Der echte Code',
    hoverHint: '· zeig auf einen Baustein',
    copy: '📋 Kopieren',
    copied: '✓ Kopiert!',
    editInCode: '✏️ Selbst weitercoden',
    yourCode: 'Dein Code',
    fromBlocks: '🧩 Aus Bausteinen holen',
    starter: '↺ Startcode',
    tryThis: 'Probier mal:',
    console: 'Konsole',
    consoleEmpty: 'Hier erscheinen console.log()-Ausgaben und Fehler.',
    up: 'Nach oben',
    down: 'Nach unten',
    del: 'Entfernen',
    pageTitle: 'Meine Webseite',
    resize: 'Ziehen, um die Größe zu ändern (Doppelklick: zurücksetzen)',
    tips: [
      'Ändere den Text in <code>&lt;h1&gt;</code>',
      '<code>background: hotpink;</code> in <code>body { }</code>',
      '<code>&lt;marquee&gt;Hallo!&lt;/marquee&gt;</code> 😎',
      '<code>console.log("Hallo!");</code>',
      '<code>button { font-size: 40px; }</code>',
    ],
  },
  en: {
    title: 'Web Playground',
    tabBlocks: '🧩 Blocks',
    tabCode: '⌨️ Write code',
    examples: 'Examples:',
    party: '🎉 Party',
    profile: '🪪 Profile',
    reset: '🗑️ Start over',
    resetConfirm: '⚠️ Sure? Click again',
    blocks: 'Blocks',
    paletteHint: 'drag or click',
    htmlDesc: 'What is on the page?',
    cssDesc: 'What does it look like?',
    jsDesc: 'What happens when …?',
    yourPage: 'Your page',
    count: (n) => (n === 1 ? '1 block' : n + ' blocks'),
    dropHint: 'Drag blocks here –<br>or just click one on the left!',
    preview: 'Preview',
    fullscreen: '⛶ Fullscreen',
    exitFull: '✕ Exit fullscreen',
    code: 'The real code',
    hoverHint: '· hover over a block',
    copy: '📋 Copy',
    copied: '✓ Copied!',
    editInCode: '✏️ Keep coding by hand',
    yourCode: 'Your code',
    fromBlocks: '🧩 Take from blocks',
    starter: '↺ Starter code',
    tryThis: 'Try this:',
    console: 'Console',
    consoleEmpty: 'console.log() output and errors show up here.',
    up: 'Move up',
    down: 'Move down',
    del: 'Remove',
    pageTitle: 'My website',
    resize: 'Drag to resize (double-click to reset)',
    tips: [
      'Change the text inside <code>&lt;h1&gt;</code>',
      '<code>background: hotpink;</code> inside <code>body { }</code>',
      '<code>&lt;marquee&gt;Hello!&lt;/marquee&gt;</code> 😎',
      '<code>console.log("Hello!");</code>',
      '<code>button { font-size: 40px; }</code>',
    ],
  },
};
