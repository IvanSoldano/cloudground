import { Component, input, output, computed } from '@angular/core';
import { Task } from '../../models/task.model';
import { Person } from '../../models/person.model';
import { NgClass } from '@angular/common';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [
    NgClass, 
    MatCheckboxModule, 
    MatIconButton, 
    MatIconModule, 
    MatListModule,
    MatMenuModule,
    MatTooltipModule
  ],
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
  `,
  styles: [`
    .task-item {
      margin-bottom: 0.5rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 8px;
      transition: border-color 0.2s, background-color 0.2s;
    }
    .task-item:hover {
      border-color: var(--mat-sys-primary);
      background: rgba(var(--mat-sys-surface-variant-rgb), 0.04);
    }
    .completed-text {
      text-decoration: line-through;
      opacity: 0.5;
    }
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
    }
  `]
})
export class TaskComponent {
  task = input.required<Task>();
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
  }
}

