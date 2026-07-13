import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { JsonPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, JsonPipe, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected readonly title = signal('cloudground');
  protected readonly apiData = signal<any>(null);

  constructor() {
    fetch('/api/data')
      .then((res) => res.json())
      .then((data) => this.apiData.set(data))
      .catch((err) => console.error('Error fetching API:', err));
  }
}
