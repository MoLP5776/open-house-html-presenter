import { Component, inject } from '@angular/core';
import { AppHeader } from './components/app-header/app-header';
import { BlocksMode } from './components/blocks-mode/blocks-mode';
import { CodeMode } from './components/code-mode/code-mode';
import { PlaygroundStore } from './playground/playground-store';

@Component({
  imports: [AppHeader, BlocksMode, CodeMode],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly store = inject(PlaygroundStore);
}
