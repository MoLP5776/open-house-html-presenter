import { afterRenderEffect, Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { highlight } from '../../playground/highlight';
import { PlaygroundStore } from '../../playground/playground-store';

/** Read-only view of the generated code; lines of the hovered block are highlighted. */
@Component({
  selector: 'app-code-panel',
  templateUrl: './code-panel.html',
  styleUrl: './code-panel.css',
  host: { class: 'board', '[class.collapsed]': 'collapsed()' },
})
export class CodePanel {
  protected readonly store = inject(PlaygroundStore);
  protected readonly s = this.store.s;
  protected readonly collapsed = signal(false);
  protected readonly copied = signal(false);

  protected readonly lines = computed(() =>
    this.store.generated().lines.map((l) => ({ bid: l.bid, html: l.text ? highlight(l.text, l.lg) : ' ' })),
  );

  private readonly body = viewChild.required<ElementRef<HTMLElement>>('body');

  constructor() {
    // Scroll the highlighted lines into view whenever the highlighted block changes
    afterRenderEffect(() => {
      if (this.store.highlightId() == null) return;
      const body = this.body().nativeElement;
      const first = body.querySelector<HTMLElement>('.ln.hl');
      if (!first) return;
      body.scrollTo({ top: Math.max(0, first.offsetTop - body.clientHeight / 3), behavior: 'smooth' });
    });
  }

  protected copy() {
    const doc = this.store.generated().doc;
    const done = () => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1400);
    };
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = doc;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch {
        /* nothing we can do */
      }
      ta.remove();
      done();
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(doc).then(done, fallback);
    else fallback();
  }

  protected editInCode() {
    this.store.importFromBlocks();
    this.store.setMode('code');
  }
}
