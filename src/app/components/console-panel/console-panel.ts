import { afterRenderEffect, Component, ElementRef, inject, input, viewChild } from '@angular/core';
import { PreviewMessage } from '../../playground/codegen';
import { PlaygroundStore } from '../../playground/playground-store';

/** Shows console.log() output and errors from the code-mode preview. */
@Component({
  selector: 'app-console-panel',
  templateUrl: './console-panel.html',
  styleUrl: './console-panel.css',
  host: { class: 'board' },
})
export class ConsolePanel {
  readonly entries = input.required<PreviewMessage[]>();

  protected readonly s = inject(PlaygroundStore).s;
  private readonly out = viewChild.required<ElementRef<HTMLElement>>('out');

  constructor() {
    // Keep the newest entry visible
    afterRenderEffect(() => {
      this.entries();
      const el = this.out().nativeElement;
      el.scrollTop = el.scrollHeight;
    });
  }
}
