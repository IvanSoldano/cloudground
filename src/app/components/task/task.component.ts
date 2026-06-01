import { Component, computed, inject, input, output } from '@angular/core';
import { Task } from '../../models/task.model';
import { CommonModule } from '@angular/common';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { PersonService } from '../../services/person.service';
import { TaskEditDialogComponent } from '../task-edit-dialog/task-edit-dialog.component';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule, MatCheckboxModule, MatButtonModule, MatIconModule, MatListModule, MatChipsModule],
  template: `
    <mat-list-item class="task-item">
      <mat-checkbox 
        matListItemIcon
        [checked]="task().completed" 
        (change)="toggle.emit(task())"
        color="primary"
      ></mat-checkbox>
      
      <div matListItemTitle [ngClass]="{ 'completed-text': task().completed }" class="task-title-row">
        <span>{{ task().title }}</span>
        @if (assignee()) {
          <mat-chip class="assignee-chip" highlighted>
            <mat-icon matChipAvatar>person</mat-icon>
            {{ assignee()?.name }} {{ assignee()?.surname }}
          </mat-chip>
        }
      </div>

      <div matListItemLine class="task-dates">
        @if (task().plannedStartDate) {
          <span class="date-badge"><mat-icon inline>event</mat-icon> Start: {{ task().plannedStartDate }}</span>
        }
        @if (task().plannedEndDate) {
          <span class="date-badge"><mat-icon inline>event_available</mat-icon> Due: {{ task().plannedEndDate }}</span>
        }
      </div>
      
      <div matListItemMeta class="actions">
        <button mat-icon-button color="primary" (click)="editTask()" aria-label="Edit task">
          <mat-icon>edit</mat-icon>
        </button>
        <button mat-icon-button color="warn" (click)="delete.emit(task().id)" aria-label="Delete task">
          <mat-icon>delete</mat-icon>
        </button>
      </div>
    </mat-list-item>
  `,
  styles: [`
    .task-item {
      margin-bottom: 0.5rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 8px;
    }
    .task-title-row {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .completed-text {
      text-decoration: line-through;
      opacity: 0.5;
    }
    .task-dates {
      display: flex;
      gap: 1rem;
      font-size: 0.8rem;
      color: var(--mat-sys-on-surface-variant);
      margin-top: 4px;
    }
    .date-badge {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .date-badge mat-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
    }
    .actions {
      display: flex;
    }
    .assignee-chip {
      font-size: 0.75rem;
      min-height: 24px;
    }
  `]
})
export class TaskComponent {
  task = input.required<Task>();
  toggle = output<Task>();
  delete = output<string>();

  personService = inject(PersonService);
  dialog = inject(MatDialog);

  assignee = computed(() => {
    const assigneeId = this.task().assigneeId;
    if (!assigneeId) return null;
    return this.personService.persons().find(p => p.id === assigneeId);
  });

  editTask() {
    this.dialog.open(TaskEditDialogComponent, {
      data: { task: this.task() },
      width: '500px'
    });
  }
}
