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
import { RaciCategoryService } from '../../services/raci-category.service';
import { TaskEditDialogComponent } from '../task-edit-dialog/task-edit-dialog.component';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule, MatCheckboxModule, MatButtonModule, MatIconModule, MatListModule, MatChipsModule],
  template: `
    <div class="task-item">
      <div class="checkbox-container">
        <mat-checkbox 
          [checked]="task().completed" 
          (change)="toggle.emit(task())"
          color="primary"
        ></mat-checkbox>
      </div>
      
      <div class="content-container">
        <div class="task-title-row" [ngClass]="{ 'completed-text': task().completed }">
          <span class="task-title">{{ task().title }}</span>
          @if (assignee()) {
            <mat-chip class="assignee-chip" highlighted>
              <mat-icon matChipAvatar>person</mat-icon>
              {{ assignee()?.name }} {{ assignee()?.surname }}
            </mat-chip>
          }
        </div>

        <div class="task-dates">
          @if (task().plannedStartDate) {
            <span class="date-badge"><mat-icon inline>event</mat-icon> Start: {{ task().plannedStartDate }}</span>
          }
          @if (task().plannedEndDate) {
            <span class="date-badge"><mat-icon inline>event_available</mat-icon> Due: {{ task().plannedEndDate }}</span>
          }
        </div>
      </div>
      
      <div class="meta-section">
        @if (raciCategory()) {
          <div class="raci-col" title="{{ raciCategory()?.description }}">
            <span class="raci-label">Cat.</span>
            <span class="raci-value">{{ raciCategory()?.alias }}</span>
          </div>
        }
        <div class="actions">
          <button mat-icon-button color="primary" (click)="editTask()" aria-label="Edit task">
            <mat-icon>edit</mat-icon>
          </button>
          <button mat-icon-button color="warn" (click)="delete.emit(task().id)" aria-label="Delete task">
            <mat-icon>delete</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .task-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      margin-bottom: 0.5rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 8px;
      background: var(--mat-sys-surface);
      gap: 1rem;
    }
    .checkbox-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .content-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 0; /* allows text wrapping inside flex item */
    }
    .task-title-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .task-title {
      font-size: 1rem;
      font-weight: 500;
      word-break: break-word;
    }
    .completed-text .task-title {
      text-decoration: line-through;
      opacity: 0.5;
    }
    .task-dates {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      font-size: 0.8rem;
      color: var(--mat-sys-on-surface-variant);
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
    .meta-section {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }
    .raci-col {
      display: flex;
      align-items: baseline;
      gap: 4px;
      font-size: 0.85rem;
      padding: 0 8px;
      border-right: 1px solid var(--mat-sys-outline-variant);
    }
    .raci-label {
      font-weight: 500;
      color: var(--mat-sys-on-surface-variant);
    }
    .raci-value {
      font-weight: 700;
      color: var(--mat-sys-primary);
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
  raciCategoryService = inject(RaciCategoryService);
  dialog = inject(MatDialog);

  assignee = computed(() => {
    const assigneeId = this.task().assigneeId;
    if (!assigneeId) return null;
    return this.personService.persons().find(p => p.id === assigneeId);
  });

  raciCategory = computed(() => {
    const catId = this.task().raci_category;
    if (!catId) return null;
    return this.raciCategoryService.categories().find(c => c.id === catId);
  });

  editTask() {
    this.dialog.open(TaskEditDialogComponent, {
      data: { task: this.task() },
      width: '500px'
    });
  }
}
