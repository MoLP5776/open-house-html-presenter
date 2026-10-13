import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { PlaygroundStore } from '../../playground/playground-store';

/**
 * Drag handle between two panels. Emits how many pixels it was moved;
 * the parent layout decides what that means. Arrow keys move it too, double-click resets.
 */
@Component({
  selector: 'app-splitter',
  template: '',
  styleUrl: './splitter.css',
  host: {
    role: 'separator',
    tabindex: '0',
    '[attr.aria-orientation]': "axis() === 'x' ? 'vertical' : 'horizontal'",
    '[attr.aria-label]': 'store.s().resize',
    '[attr.title]': 'store.s().resize',
    '[class.x]': "axis() === 'x'",
    '[class.y]': "axis() === 'y'",
    '[class.active]': 'dragging()',
    '(pointerdown)': 'onDown($event)',
    '(pointermove)': 'onMove($event)',
    '(pointerup)': 'onUp($event)',
    '(pointercancel)': 'onUp($event)',
    '(keydown)': 'onKey($event)',
    '(dblclick)': 'reset.emit()',
  },
})
export class Splitter {
  /** 'x' = sits between columns and moves left/right, 'y' = between rows. */
  readonly axis = input<'x' | 'y'>('x');
  readonly moved = output<number>();
  readonly reset = output<void>();

  protected readonly store = inject(PlaygroundStore);
  protected readonly dragging = signal(false);
  private last = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.setBodyClass(false));
  }

  protected onDown(e: PointerEvent) {
    if (e.button !== 0) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    this.last = this.pos(e);
    this.dragging.set(true);
    this.setBodyClass(true);
  }

  protected onMove(e: PointerEvent) {
    if (!this.dragging()) return;
    const p = this.pos(e);
    if (p !== this.last) this.moved.emit(p - this.last);
    this.last = p;
  }

  protected onUp(e: PointerEvent) {
    if (!this.dragging()) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    this.dragging.set(false);
    this.setBodyClass(false);
  }

  protected onKey(e: KeyboardEvent) {
    const step = e.shiftKey ? 64 : 16;
    const back = this.axis() === 'x' ? 'ArrowLeft' : 'ArrowUp';
    const fwd = this.axis() === 'x' ? 'ArrowRight' : 'ArrowDown';
    if (e.key === back) this.moved.emit(-step);
    else if (e.key === fwd) this.moved.emit(step);
    else return;
    e.preventDefault();
  }

  private pos(e: PointerEvent) {
    return this.axis() === 'x' ? e.clientX : e.clientY;
  }

  private setBodyClass(on: boolean) {
    document.body.classList.toggle('resizing', on);
    document.body.classList.toggle('resizing-' + this.axis(), on);
  }
}
