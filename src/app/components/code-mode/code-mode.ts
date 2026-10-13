import { Component, ElementRef, inject, signal } from '@angular/core';
import { PreviewMessage } from '../../playground/codegen';
import { PlaygroundStore } from '../../playground/playground-store';
import { CodeEditors } from '../code-editors/code-editors';
import { ConsolePanel } from '../console-panel/console-panel';
import { PreviewFrame } from '../preview-frame/preview-frame';
import { Splitter } from '../splitter/splitter';

/** "Write code" tab: editors | preview + console, all resizable. */
@Component({
  selector: 'app-code-mode',
  imports: [CodeEditors, PreviewFrame, ConsolePanel, Splitter],
  template: `
    <app-code-editors />
    <app-splitter (moved)="resizeEditors($event)" (reset)="store.resetLayout('editors')" />
    <section #right class="panel right" [style.--split]="layout().codeSplit + '%'">
      <app-preview-frame
        [doc]="store.codeDoc()"
        [delay]="400"
        (reloaded)="logs.set([])"
        (consoleMessage)="log($event)"
      />
      <app-splitter axis="y" (moved)="resizeSplit($event, right)" (reset)="store.resetLayout('codeSplit')" />
      <app-console-panel [entries]="logs()" />
    </section>
  `,
  styles: `
    :host {
      height: 100%;
      display: grid;
      grid-template-columns: minmax(300px, var(--editors-fr)) var(--gutter) minmax(320px, var(--right-fr));
    }
    @media (max-width: 860px) {
      :host { height: auto; grid-template-columns: 1fr; grid-auto-rows: minmax(600px, auto); }
      app-splitter.x { display: none; }
    }
  `,
  host: {
    '[style.--editors-fr]': "layout().editors + 'fr'",
    '[style.--right-fr]': "(100 - layout().editors) + 'fr'",
  },
})
export class CodeMode {
  protected readonly store = inject(PlaygroundStore);
  protected readonly layout = this.store.layout;
  protected readonly logs = signal<PreviewMessage[]>([]);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected log(m: PreviewMessage) {
    this.logs.update((l) => [...l, m]);
  }

  protected resizeEditors(dx: number) {
    const pct = this.layout().editors + (dx / this.host.nativeElement.clientWidth) * 100;
    this.store.setLayout({ editors: clamp(pct, 20, 80) });
  }

  protected resizeSplit(dy: number, right: HTMLElement) {
    const pct = this.layout().codeSplit + (dy / right.clientHeight) * 100;
    this.store.setLayout({ codeSplit: clamp(pct, 15, 90) });
  }
}

const clamp = (v: number, min: number, max: number) => Math.round(Math.max(min, Math.min(max, v)) * 10) / 10;
