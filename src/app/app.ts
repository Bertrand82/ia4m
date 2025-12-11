import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Ia4m } from './component-root-ia4m/component-root-ia4m';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Ia4m],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ia4m');
}
