import { Component, effect, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { PreviewMessage } from '../../playground/codegen';
import { PlaygroundStore } from '../../playground/playground-store';

/** Sandboxed iframe that renders a full HTML document, with a fullscreen toggle. */
@Component({
  selector: 'app-preview-frame',
  templateUrl: './preview-frame.html',
  styleUrl: './preview-frame.css',
  host: {
    '[class.full]': 'full()',
    '(document:keydown.escape)': 'full.set(false)',
    '(window:message)': 'onMessage($event)',
  },
})
export class PreviewFrame {
  /** The document to show. */
  readonly doc = input.required<string>();
  /** Debounce in ms before a changed document is loaded. */
  readonly delay = input(0);

  /** Fired every time the iframe gets a new document. */
  readonly reloaded = output<void>();
  /** console.log() calls and errors coming from the previewed page. */
  readonly consoleMessage = output<PreviewMessage>();

  protected readonly s = inject(PlaygroundStore).s;
  protected readonly full = signal(false);
  private readonly frame = viewChild.required<ElementRef<HTMLIFrameElement>>('frame');

  constructor() {
    effect((onCleanup) => {
      const doc = this.doc();
      const timer = setTimeout(() => {
        this.frame().nativeElement.srcdoc = doc;
        this.reloaded.emit();
      }, this.delay());
      onCleanup(() => clearTimeout(timer));
    });
  }

  protected onMessage(e: MessageEvent) {
    const d = e.data as PreviewMessage | null;
    if (!d || !d.__pg || e.source !== this.frame().nativeElement.contentWindow) return;
    this.consoleMessage.emit(d);
  }
}
