import { Component, ElementRef, inject } from '@angular/core';
import { PlaygroundStore } from '../../playground/playground-store';
import { BlockPalette } from '../block-palette/block-palette';
import { BlockStack } from '../block-stack/block-stack';
import { CodePanel } from '../code-panel/code-panel';
import { PreviewFrame } from '../preview-frame/preview-frame';
import { Splitter } from '../splitter/splitter';

const GUTTER = 6;
const MIN_RIGHT = 320;

/** "Blocks" tab: palette | stack | preview + generated code, all resizable. */
@Component({
  selector: 'app-blocks-mode',
  imports: [BlockPalette, BlockStack, PreviewFrame, CodePanel, Splitter],
  template: `
    <app-block-palette />
    <app-splitter (moved)="resizePalette($event)" (reset)="store.resetLayout('palette')" />
    <app-block-stack />
    <app-splitter (moved)="resizeStack($event)" (reset)="store.resetLayout('stack')" />
    <section #right class="panel right" [style.--split]="layout().blocksSplit + '%'">
      <app-preview-frame [doc]="store.blocksDoc()" [delay]="220" />
      <app-splitter axis="y" (moved)="resizeSplit($event, right)" (reset)="store.resetLayout('blocksSplit')" />
      <app-code-panel />
    </section>
  `,
  styles: `
    :host {
      height: 100%;
      display: grid;
      /* minmax lets the columns shrink gracefully when the window gets smaller */
      grid-template-columns:
        minmax(160px, var(--palette)) var(--gutter)
        minmax(220px, var(--stack)) var(--gutter)
        minmax(320px, 1fr);
    }
    @media (max-width: 860px) {
      :host { height: auto; grid-template-columns: 1fr; grid-auto-rows: minmax(360px, auto); }
      app-splitter.x { display: none; }
      .right { min-height: 720px; }
    }
  `,
  host: {
    '[style.--palette]': "layout().palette + 'px'",
    '[style.--stack]': "layout().stack + 'px'",
  },
})
export class BlocksMode {
  protected readonly store = inject(PlaygroundStore);
  protected readonly layout = this.store.layout;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected resizePalette(dx: number) {
    const l = this.layout();
    const max = this.host.nativeElement.clientWidth - l.stack - 2 * GUTTER - MIN_RIGHT;
    this.store.setLayout({ palette: clamp(l.palette + dx, 160, Math.min(420, max)) });
  }

  protected resizeStack(dx: number) {
    const l = this.layout();
    const max = this.host.nativeElement.clientWidth - l.palette - 2 * GUTTER - MIN_RIGHT;
    this.store.setLayout({ stack: clamp(l.stack + dx, 220, max) });
  }

  protected resizeSplit(dy: number, right: HTMLElement) {
    const pct = this.layout().blocksSplit + (dy / right.clientHeight) * 100;
    this.store.setLayout({ blocksSplit: clamp(pct, 12, 88) });
  }
}

const clamp = (v: number, min: number, max: number) => Math.round(Math.max(min, Math.min(max, v)) * 10) / 10;
