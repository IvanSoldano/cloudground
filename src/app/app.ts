import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { JsonPipe } from '@angular/common';
import { TaskListComponent } from './tasklist/tasklist.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, JsonPipe, TaskListComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('cloudground');
  protected readonly apiData = signal<any>(null);

  constructor() {
    fetch('/api/data')
      .then((res) => res.json())
      .then((data) => this.apiData.set(data))
      .catch((err) => console.error('Error fetching API:', err));
  }
}
