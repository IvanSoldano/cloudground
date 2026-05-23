import { Component, input, output } from '@angular/core';
import { Task } from '../../models/task.model';
import { NgClass } from '@angular/common';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [NgClass, MatCheckboxModule, MatIconButton, MatIconModule, MatListModule],
  template: `
    <mat-list-item class="task-item">
      <mat-checkbox 
        matListItemIcon
        [checked]="task().completed" 
        (change)="toggle.emit(task().id)"
        color="primary"
      ></mat-checkbox>
      
      <span matListItemTitle [ngClass]="{ 'completed-text': task().completed }">
        {{ task().title }}
      </span>
      
      <button mat-icon-button matListItemMeta color="warn" (click)="delete.emit(task().id)" aria-label="Delete task">
        <mat-icon>delete</mat-icon>
      </button>
    </mat-list-item>
  `,
  styles: [`
    .task-item {
      margin-bottom: 0.5rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 8px;
    }
    .completed-text {
      text-decoration: line-through;
      opacity: 0.5;
    }
  `]
})
export class TaskComponent {
  task = input.required<Task>();
  toggle = output<string>();
  delete = output<string>();
}
