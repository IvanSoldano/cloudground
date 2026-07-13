import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';
import { TaskComponent } from '../task/task.component';
import { TaskService } from '../../services/task.service';
import { PersonService } from '../../services/person.service';
import { RouterLink } from '@angular/router';
import { RaciCategoryService } from '../../services/raci-category.service';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    TaskComponent,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSelectModule
  ],
  template: `
    <div class="task-list-container">
      <mat-card class="task-card">
        <mat-card-header class="custom-header">
          <div class="header-main">
            <mat-card-title>Cloud Tasks</mat-card-title>
            <mat-card-subtitle>Stay organized and productive.</mat-card-subtitle>
          </div>
          <a mat-stroked-button color="primary" routerLink="/people" class="team-btn">
            <mat-icon>people</mat-icon>
            Manage Team
          </a>
        </mat-card-header>

        <mat-card-content>
          <div class="input-group">
            <mat-form-field appearance="outline" class="title-field">
              <mat-label>Add a new task...</mat-label>
              <input 
                matInput
                type="text" 
                [(ngModel)]="newTaskTitle" 
                (keyup.enter)="addTask()"
              />
            </mat-form-field>

            <mat-form-field appearance="outline" class="assignee-field">
              <mat-label>Assignee</mat-label>
              <mat-select [(ngModel)]="selectedPersonId">
                <mat-option [value]="null">Unassigned</mat-option>
                @for (person of personService.people(); track person.id) {
                  <mat-option [value]="person.id">{{ person.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <button mat-fab color="primary" (click)="addTask()" [disabled]="!newTaskTitle().trim()" class="add-btn">
              <mat-icon>add</mat-icon>
            </button>
          </div>

          <div class="tasks-container">
            @if (taskService.tasks().length === 0) {
              <div class="empty-state">
                <mat-icon color="primary" class="large-icon">check_circle_outline</mat-icon>
                <p>No tasks yet. Start by adding one above!</p>
              </div>
            } @else {
              <div class="stats">
                <span>{{ completedCount() }} of {{ taskService.tasks().length }} tasks completed</span>
              </div>
              
              <div class="task-list-wrapper">
                @for (task of taskService.tasks(); track task.id) {
                  <app-task 
                    [task]="task" 
                    [people]="personService.people()"
                    (toggle)="toggleTask($event)" 
                    (delete)="deleteTask($event)"
                    (assignPerson)="assignPerson($event.taskId, $event.personId)"
                  ></app-task>
                }
              </div>
            }
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .task-list-container {
      max-width: 1000px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    .task-list-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .task-card {
      padding: 1.5rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 16px;
    }
    .custom-header {
      margin-bottom: 2rem;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 0;
    }
    .header-main {
      text-align: left;
    }
    mat-card-title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }
    .team-btn {
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
    }
    .input-group {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }
    .title-field {
      flex: 2;
    }
    .assignee-field {
      flex: 1;
      min-width: 140px;
    }
    .add-btn {
      margin-top: 4px;
    }
    .stats {
      font-size: 0.85rem;
      margin-bottom: 1rem;
      padding-left: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--mat-sys-on-surface-variant);
      font-weight: 600;
    }
    .empty-state {
      text-align: center;
      padding: 3rem 0;
    }
    .large-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 1rem;
    }
  `]
})
export class TaskListComponent implements OnInit {
  taskService = inject(TaskService);
  personService = inject(PersonService);
  raciCategoryService = inject(RaciCategoryService);
  
  newTaskTitle = signal('');
  selectedPersonId = signal<string | null>(null);

  completedCount = computed(() => 
    this.taskService.tasks().filter(t => t.completed).length
  );

  ngOnInit() {
    this.taskService.loadTasks();
    this.personService.loadPeople();
    this.personService.loadPersons();
    this.raciCategoryService.loadCategories();
  }

  addTask() {
    const title = this.newTaskTitle().trim();
    if (!title) return;

    this.taskService.addTask(title, this.selectedPersonId());
    this.newTaskTitle.set('');
    this.selectedPersonId.set(null);
  }

  toggleTask(task: Task) {
    this.taskService.updateTask(task.id, { completed: !task.completed }).subscribe();
  }

  assignPerson(taskId: string, personId: string | null) {
    this.taskService.assignPerson(taskId, personId);
  }

  deleteTask(id: string) {
    this.taskService.deleteTask(id);
  }
}

