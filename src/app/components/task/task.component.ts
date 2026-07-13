<<<<<<< HEAD
import { Component, input, output, computed } from '@angular/core';
import { Task } from '../../models/task.model';
import { Person } from '../../models/person.model';
import { NgClass } from '@angular/common';
=======
import { Component, computed, inject, input, output } from '@angular/core';
import { Task } from '../../models/task.model';
import { CommonModule } from '@angular/common';
>>>>>>> 44ffd9146989b7a3a3f5ca631341274d1aa4daac

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
<<<<<<< HEAD
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
=======
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { PersonService } from '../../services/person.service';
import { RaciCategoryService } from '../../services/raci-category.service';
import { TaskEditDialogComponent } from '../task-edit-dialog/task-edit-dialog.component';
>>>>>>> 44ffd9146989b7a3a3f5ca631341274d1aa4daac

@Component({
  selector: 'app-task',
  standalone: true,
<<<<<<< HEAD
  imports: [
    NgClass, 
    MatCheckboxModule, 
    MatIconButton, 
    MatIconModule, 
    MatListModule,
    MatMenuModule,
    MatTooltipModule
  ],
=======
  imports: [CommonModule, MatCheckboxModule, MatButtonModule, MatIconModule, MatListModule, MatChipsModule],
>>>>>>> 44ffd9146989b7a3a3f5ca631341274d1aa4daac
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
      
<<<<<<< HEAD
      <div matListItemMeta class="assignee-actions-wrapper">
        <!-- Assignee Slot with Menu Trigger -->
        <button 
          mat-icon-button 
          [matMenuTriggerFor]="assignMenu" 
          [matTooltip]="assignedPerson() ? 'Assigned to ' + assignedPerson()!.name + ' (' + assignedPerson()!.role + ')' : 'Assign team member'" 
          class="assignee-trigger"
        >
          @if (assignedPerson()) {
            <div class="avatar-circle">
              @if (assignedPerson()!.avatarUrl && !assignedPerson()!.avatarUrl!.includes('dicebear')) {
                <img [src]="assignedPerson()!.avatarUrl" [alt]="assignedPerson()!.name" />
              } @else {
                <div class="initials-badge" [style.background]="getGradient(assignedPerson()!.name)">
                  {{ getInitials(assignedPerson()!.name) }}
                </div>
              }
            </div>
          } @else {
            <div class="unassigned-placeholder">
              <mat-icon>person_add</mat-icon>
            </div>
          }
        </button>

        <mat-menu #assignMenu="matMenu">
          <div class="menu-title">Assign to...</div>
          @for (person of people(); track person.id) {
            <button mat-menu-item (click)="assignPerson.emit({ taskId: task().id, personId: person.id })">
              <div class="menu-item-content">
                <div class="mini-avatar">
                  <div class="initials-badge-mini" [style.background]="getGradient(person.name)">
                    {{ getInitials(person.name) }}
                  </div>
                </div>
                <div class="menu-item-text">
                  <div class="menu-item-name">{{ person.name }}</div>
                  <div class="menu-item-role">{{ person.role }}</div>
                </div>
              </div>
            </button>
          }
          @if (people().length === 0) {
            <div class="menu-empty-message">No team members registered yet.</div>
          }
          @if (assignedPerson()) {
            <button mat-menu-item class="clear-item" (click)="assignPerson.emit({ taskId: task().id, personId: null })">
              <mat-icon color="warn">clear</mat-icon>
              <span>Unassign</span>
            </button>
          }
        </mat-menu>

        <button mat-icon-button color="warn" (click)="delete.emit(task().id)" aria-label="Delete task">
          <mat-icon>delete_outline</mat-icon>
        </button>
      </div>
    </mat-list-item>
=======
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
>>>>>>> 44ffd9146989b7a3a3f5ca631341274d1aa4daac
  `,
  styles: [`
    .task-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      margin-bottom: 0.5rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 8px;
<<<<<<< HEAD
      transition: border-color 0.2s, background-color 0.2s;
    }
    .task-item:hover {
      border-color: var(--mat-sys-primary);
      background: rgba(var(--mat-sys-surface-variant-rgb), 0.04);
=======
      background: var(--mat-sys-surface);
      gap: 1rem;
>>>>>>> 44ffd9146989b7a3a3f5ca631341274d1aa4daac
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
<<<<<<< HEAD
    .assignee-actions-wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .assignee-trigger {
      width: 40px;
      height: 40px;
      padding: 0;
      min-width: 0;
      border-radius: 50%;
    }
    .avatar-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
      border: 2px solid var(--mat-sys-surface);
    }
    .avatar-circle img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .initials-badge {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.8rem;
      font-weight: 700;
    }
    .unassigned-placeholder {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1.5px dashed var(--mat-sys-outline);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--mat-sys-on-surface-variant);
      opacity: 0.6;
      transition: opacity 0.2s, border-color 0.2s;
    }
    .assignee-trigger:hover .unassigned-placeholder {
      opacity: 1;
      border-color: var(--mat-sys-primary);
      color: var(--mat-sys-primary);
    }
    .menu-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--mat-sys-primary);
      padding: 0.75rem 1rem 0.5rem 1rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .menu-empty-message {
      font-size: 0.8rem;
      color: var(--mat-sys-on-surface-variant);
      padding: 0.75rem 1rem;
      text-align: center;
    }
    .menu-item-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .mini-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      overflow: hidden;
    }
    .initials-badge-mini {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.7rem;
      font-weight: 700;
    }
    .menu-item-text {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }
    .menu-item-name {
      font-weight: 600;
      font-size: 0.85rem;
    }
    .menu-item-role {
      font-size: 0.7rem;
      color: var(--mat-sys-on-surface-variant);
    }
    .clear-item {
      border-top: 1px solid var(--mat-sys-outline-variant);
      margin-top: 0.25rem;
=======
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
>>>>>>> 44ffd9146989b7a3a3f5ca631341274d1aa4daac
    }
  `]
})
export class TaskComponent {
  task = input.required<Task>();
<<<<<<< HEAD
  people = input.required<Person[]>();
  
  toggle = output<string>();
  delete = output<string>();
  assignPerson = output<{ taskId: string, personId: string | null }>();

  assignedPerson = computed(() => {
    const list = this.people();
    const id = this.task().assignedPersonId;
    return list.find(p => p.id === id) || null;
  });

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  getGradient(name: string): string {
    const gradients = [
      'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
      'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      'linear-gradient(135deg, #10b981 0%, #047857 100%)'
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
=======
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
>>>>>>> 44ffd9146989b7a3a3f5ca631341274d1aa4daac
  }
}

