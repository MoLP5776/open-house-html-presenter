import { afterNextRender, Component, computed, ElementRef, inject, input, signal } from '@angular/core';
import { Block, blockDef, FieldKey } from '../../playground/blocks';
import { PlaygroundStore } from '../../playground/playground-store';

/** One block in the stack: header with move/delete buttons plus its editable fields. */
@Component({
  selector: 'app-block-card',
  templateUrl: './block-card.html',
  styleUrl: './block-card.css',
  host: {
    class: 'sblock',
    '[attr.data-id]': 'block().id',
    '[style.--c]': "'var(--' + def().cat + ')'",
    '[class.pop]': 'pop()',
    '[class.dragging]': 'store.draggingId() === block().id',
  },
})
export class BlockCard {
  readonly block = input.required<Block>();

  protected readonly store = inject(PlaygroundStore);
  protected readonly s = this.store.s;
  protected readonly def = computed(() => blockDef(this.block().type));
  protected readonly pop = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // A freshly added block pops in and scrolls into view
    afterNextRender(() => {
      if (this.store.flashId() !== this.block().id) return;
      this.pop.set(true);
      this.host.nativeElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }

  protected value(k: FieldKey): string {
    return this.block().values[k] ?? '';
  }

  protected onInput(k: FieldKey, e: Event) {
    this.store.setValue(this.block().id, k, (e.target as HTMLInputElement | HTMLSelectElement).value);
  }

  protected onDragStart(e: DragEvent) {
    const id = this.block().id;
    this.store.drag = { kind: 'move', id };
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', 'move');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setDragImage(this.host.nativeElement, 20, 20);
    }
    // Fade only after the browser has taken the drag image
    setTimeout(() => this.store.draggingId.set(id));
  }
}
