import { computed, effect, Injectable, signal } from '@angular/core';
import { Block, BLOCKS, BlockType, BASE_CSS, FieldKey, isBlockType, PRESETS, PresetName, Values } from './blocks';
import { buildDoc, CodeParts, generate, injectHook } from './codegen';
import { Lang, Localized, localize, STR } from './i18n';

export type Mode = 'blocks' | 'code';

/** What is currently being dragged: a new block from the palette or an existing one. */
export type Drag = { kind: 'new'; type: BlockType } | { kind: 'move'; id: number };

/** Panel sizes the user dragged: px for the block columns, percentages for the rest. */
export interface Layout {
  palette: number;
  stack: number;
  blocksSplit: number;
  editors: number;
  codeSplit: number;
}
export const DEFAULT_LAYOUT: Layout = { palette: 240, stack: 380, blocksSplit: 58, editors: 50, codeSplit: 75 };

const STORAGE_KEY = 'web-spielplatz-v1';
const EMPTY_CODE: CodeParts = { html: '', css: '', js: '' };

/** Single source of truth for the playground; everything is persisted to localStorage. */
@Injectable({ providedIn: 'root' })
export class PlaygroundStore {
  readonly lang = signal<Lang>('de');
  readonly mode = signal<Mode>('blocks');
  readonly blocks = signal<Block[]>([]);
  readonly code = signal<CodeParts>(EMPTY_CODE);
  readonly layout = signal<Layout>(DEFAULT_LAYOUT);

  /** Block under the mouse / keyboard focus in the stack. */
  readonly hoverId = signal<number | null>(null);
  /** Block that was just added; highlighted briefly. */
  readonly flashId = signal<number | null>(null);
  readonly highlightId = computed(() => this.hoverId() ?? this.flashId());

  /** Block currently being dragged out of the stack (for the faded look). */
  readonly draggingId = signal<number | null>(null);
  drag: Drag | null = null;

  /** UI texts in the current language. */
  readonly s = computed(() => STR[this.lang()]);

  readonly generated = computed(() => generate(this.blocks(), this.lang()));
  readonly blocksDoc = computed(() => injectHook(this.generated().doc));
  readonly codeDoc = computed(() => injectHook(buildDoc(this.code(), this.lang())));

  private nextId = 1;
  private flashTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    if (!this.load()) this.blocks.set([this.makeBlock('heading'), this.makeBlock('paragraph')]);
    if (this.mode() === 'code') this.ensureCode();

    effect(() => {
      document.documentElement.lang = this.lang();
      document.title = this.s().title;
    });
    effect(() => this.save());
  }

  localize<T>(o: Localized<T>): T {
    return localize(o, this.lang());
  }

  /* ---------- general ---------- */

  setLang(lang: Lang) {
    this.lang.set(lang);
  }

  setMode(mode: Mode) {
    if (mode === 'code') this.ensureCode();
    this.mode.set(mode);
  }

  hoverTo(id: number | null) {
    this.hoverId.set(id);
  }

  loadPreset(name: PresetName) {
    this.blocks.set(PRESETS[name].map(([type, over]) => this.makeBlock(type, over)));
    this.setMode('blocks');
  }

  reset() {
    this.blocks.set([this.makeBlock('heading')]);
    this.hoverId.set(null);
    this.flashId.set(null);
    this.starterCode();
  }

  setLayout(patch: Partial<Layout>) {
    this.layout.update((l) => ({ ...l, ...patch }));
  }

  resetLayout(key: keyof Layout) {
    this.setLayout({ [key]: DEFAULT_LAYOUT[key] });
  }

  /* ---------- blocks ---------- */

  addBlock(type: BlockType, index?: number) {
    const b = this.makeBlock(type);
    this.blocks.update((bs) => {
      const at = index == null || index > bs.length ? bs.length : index;
      return [...bs.slice(0, at), b, ...bs.slice(at)];
    });
    this.flashId.set(b.id);
    clearTimeout(this.flashTimer);
    this.flashTimer = setTimeout(() => {
      if (this.flashId() === b.id) this.flashId.set(null);
    }, 1800);
  }

  removeBlock(id: number) {
    this.blocks.update((bs) => bs.filter((b) => b.id !== id));
    if (this.hoverId() === id) this.hoverId.set(null);
  }

  /** Moves a block one step up (-1) or down (+1). */
  shiftBlock(id: number, dir: -1 | 1) {
    this.blocks.update((bs) => {
      const i = bs.findIndex((b) => b.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= bs.length) return bs;
      const next = [...bs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  /** Moves a block so it ends up before the block currently at `index`. */
  moveBlock(id: number, index: number) {
    this.blocks.update((bs) => {
      const from = bs.findIndex((b) => b.id === id);
      if (from < 0) return bs;
      const next = [...bs];
      const [b] = next.splice(from, 1);
      next.splice(from < index ? index - 1 : index, 0, b);
      return next;
    });
  }

  setValue(id: number, k: FieldKey, value: string) {
    this.blocks.update((bs) => bs.map((b) => (b.id === id ? { ...b, values: { ...b.values, [k]: value } } : b)));
  }

  endDrag() {
    this.drag = null;
    this.draggingId.set(null);
  }

  /* ---------- code mode ---------- */

  setCode(part: keyof CodeParts, value: string) {
    this.code.update((c) => ({ ...c, [part]: value }));
  }

  importFromBlocks() {
    this.code.set(this.generated().parts);
  }

  starterCode() {
    const de = this.lang() === 'de';
    this.code.set({
      html: de
        ? '<h1>Hallo Welt! 👋</h1>\n<p>Ändere diesen Text!</p>\n<button id="knopf">Klick mich</button>'
        : '<h1>Hello world! 👋</h1>\n<p>Change this text!</p>\n<button id="knopf">Click me</button>',
      css: BASE_CSS + '\n\nh1 {\n  color: rebeccapurple;\n}',
      js:
        "document.getElementById('knopf').addEventListener('click', () => {\n  alert('" +
        (de ? 'Du hast geklickt!' : 'You clicked!') +
        "');\n});",
    });
  }

  /** Fills the editors when they are completely empty. */
  private ensureCode() {
    const c = this.code();
    if (c.html.trim() || c.css.trim() || c.js.trim()) return;
    if (this.blocks().length) this.importFromBlocks();
    else this.starterCode();
  }

  /* ---------- helpers ---------- */

  private makeBlock(type: BlockType, over?: Partial<Record<FieldKey, Localized<string>>>): Block {
    const values: Values = {};
    for (const f of BLOCKS[type].fields) {
      const o = over?.[f.k];
      values[f.k] = this.localize(o !== undefined ? o : f.def);
    }
    return { id: this.nextId++, type, values };
  }

  /* ---------- save / load (survives a page refresh) ---------- */

  private save() {
    const data = { lang: this.lang(), mode: this.mode(), blocks: this.blocks(), code: this.code(), layout: this.layout() };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage full or unavailable */
    }
  }

  private load(): boolean {
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
      if (!s) return false;
      if (s.lang === 'de' || s.lang === 'en') this.lang.set(s.lang);
      this.mode.set(s.mode === 'code' ? 'code' : 'blocks');
      const blocks: Block[] = (Array.isArray(s.blocks) ? s.blocks : []).filter(
        (b: Block) => b && isBlockType(b.type) && typeof b.id === 'number' && b.values,
      );
      this.blocks.set(blocks);
      this.nextId = blocks.reduce((m, b) => Math.max(m, b.id), 0) + 1;
      if (s.code) {
        this.code.set({ html: s.code.html || '', css: s.code.css || '', js: s.code.js || '' });
      }
      if (s.layout && typeof s.layout === 'object') {
        const l = { ...DEFAULT_LAYOUT };
        for (const k of Object.keys(DEFAULT_LAYOUT) as (keyof Layout)[]) {
          if (typeof s.layout[k] === 'number' && isFinite(s.layout[k])) l[k] = s.layout[k];
        }
        this.layout.set(l);
      }
      return true;
    } catch {
      return false;
    }
  }
}
