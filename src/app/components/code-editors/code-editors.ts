import { Component, inject } from '@angular/core';
import { CodeParts } from '../../playground/codegen';
import { PlaygroundStore } from '../../playground/playground-store';

const EDITORS: { part: keyof CodeParts; name: string; desc: 'htmlDesc' | 'cssDesc' | 'jsDesc' }[] = [
  { part: 'html', name: 'HTML', desc: 'htmlDesc' },
  { part: 'css', name: 'CSS', desc: 'cssDesc' },
  { part: 'js', name: 'JavaScript', desc: 'jsDesc' },
];

/** Left side of the "Write code" tab: tips plus one textarea each for HTML, CSS and JS. */
@Component({
  selector: 'app-code-editors',
  templateUrl: './code-editors.html',
  styleUrl: './code-editors.css',
  host: { class: 'panel board' },
})
export class CodeEditors {
  protected readonly store = inject(PlaygroundStore);
  protected readonly s = this.store.s;
  protected readonly editors = EDITORS;

  protected onInput(part: keyof CodeParts, e: Event) {
    this.store.setCode(part, (e.target as HTMLTextAreaElement).value);
  }

  /** Tab inserts two spaces instead of leaving the textarea. */
  protected onTab(part: keyof CodeParts, e: Event) {
    e.preventDefault();
    const ta = e.target as HTMLTextAreaElement;
    ta.setRangeText('  ', ta.selectionStart, ta.selectionEnd, 'end');
    this.store.setCode(part, ta.value);
  }
}
