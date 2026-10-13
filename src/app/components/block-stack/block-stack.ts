import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { PlaygroundStore } from '../../playground/playground-store';
import { BlockCard } from '../block-card/block-card';

/** Middle column: the blocks that make up the page. Drop target for drag & drop. */
@Component({
  selector: 'app-block-stack',
  imports: [BlockCard],
  templateUrl: './block-stack.html',
  styleUrl: './block-stack.css',
  host: {
    class: 'panel',
    '(document:dragend)': 'onDragEnd()',
  },
})
export class BlockStack {
  protected readonly store = inject(PlaygroundStore);
  protected readonly s = this.store.s;

  /** Where the drop indicator is shown, or null when nothing is dragged over the stack. */
  protected readonly dropIndex = signal<number | null>(null);
  private readonly body = viewChild.required<ElementRef<HTMLElement>>('body');

  protected onMouseOver(e: MouseEvent) {
    this.store.hoverTo(this.blockIdAt(e.target));
  }

  protected onFocusIn(e: FocusEvent) {
    const id = this.blockIdAt(e.target);
    if (id != null) this.store.hoverTo(id);
  }

  protected onDragOver(e: DragEvent) {
    const drag = this.store.drag;
    if (!drag) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = drag.kind === 'new' ? 'copy' : 'move';
    this.dropIndex.set(this.indexAt(e.clientY));
  }

  protected onDragLeave(e: DragEvent) {
    if (!this.body().nativeElement.contains(e.relatedTarget as Node | null)) this.dropIndex.set(null);
  }

  protected onDrop(e: DragEvent) {
    const drag = this.store.drag;
    if (!drag) return;
    e.preventDefault();
    const idx = this.indexAt(e.clientY);
    this.dropIndex.set(null);
    if (drag.kind === 'new') this.store.addBlock(drag.type, idx);
    else this.store.moveBlock(drag.id, idx);
    this.store.endDrag();
  }

  protected onDragEnd() {
    this.dropIndex.set(null);
    this.store.endDrag();
  }

  private blockIdAt(target: EventTarget | null): number | null {
    const el = (target as Element | null)?.closest?.('.sblock');
    return el ? Number(el.getAttribute('data-id')) : null;
  }

  private indexAt(y: number): number {
    const items = this.body().nativeElement.querySelectorAll('.sblock');
    for (let i = 0; i < items.length; i++) {
      const r = items[i].getBoundingClientRect();
      if (y < r.top + r.height / 2) return i;
    }
    return items.length;
  }
}
