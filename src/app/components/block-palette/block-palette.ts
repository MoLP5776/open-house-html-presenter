import { Component, inject } from '@angular/core';
import { BLOCK_TYPES, BlockType, blockDef, Category } from '../../playground/blocks';
import { PlaygroundStore } from '../../playground/playground-store';

const CATEGORIES: { id: Category; name: string; desc: 'htmlDesc' | 'cssDesc' | 'jsDesc' }[] = [
  { id: 'html', name: 'HTML', desc: 'htmlDesc' },
  { id: 'css', name: 'CSS', desc: 'cssDesc' },
  { id: 'js', name: 'JavaScript', desc: 'jsDesc' },
];

/** Left column: all available blocks, grouped by language. Click or drag to add. */
@Component({
  selector: 'app-block-palette',
  templateUrl: './block-palette.html',
  styleUrl: './block-palette.css',
  host: { class: 'panel' },
})
export class BlockPalette {
  protected readonly store = inject(PlaygroundStore);
  protected readonly s = this.store.s;

  protected readonly categories = CATEGORIES.map((c) => ({
    ...c,
    blocks: BLOCK_TYPES.filter((type) => blockDef(type).cat === c.id).map((type) => ({ type, def: blockDef(type) })),
  }));

  protected onDragStart(e: DragEvent, type: BlockType) {
    this.store.drag = { kind: 'new', type };
    e.dataTransfer?.setData('text/plain', type);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copyMove';
  }
}
