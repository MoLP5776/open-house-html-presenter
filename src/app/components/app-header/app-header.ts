import { Component, DestroyRef, inject, signal } from '@angular/core';
import { LANGS } from '../../playground/i18n';
import { PlaygroundStore } from '../../playground/playground-store';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.html',
  styleUrl: './app-header.css',
})
export class AppHeader {
  protected readonly store = inject(PlaygroundStore);
  protected readonly s = this.store.s;
  protected readonly langs = LANGS;

  /* Reset needs two clicks so nobody wipes the page by accident */
  protected readonly armed = signal(false);
  private armTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.armTimer));
  }

  protected reset() {
    clearTimeout(this.armTimer);
    if (!this.armed()) {
      this.armed.set(true);
      this.armTimer = setTimeout(() => this.armed.set(false), 2500);
      return;
    }
    this.armed.set(false);
    this.store.reset();
  }
}
