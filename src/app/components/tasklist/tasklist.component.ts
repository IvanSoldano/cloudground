import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';
import { TaskComponent } from '../task/task.component';
import { TaskService } from '../../services/task.service';
import { PersonService } from '../../services/person.service';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    TaskComponent,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule
  ],
  template: `
    <div class="task-list-container">
      <mat-card class="task-card">
        <mat-card-header>
          <mat-card-title>Cloud Tasks</mat-card-title>
          <mat-card-subtitle>Stay organized and productive.</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="input-group">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Add a new task...</mat-label>
              <input 
                matInput
                type="text" 
                [(ngModel)]="newTaskTitle" 
                (keyup.enter)="addTask()"
              />
            </mat-form-field>
            <button mat-fab color="primary" (click)="addTask()" [disabled]="!newTaskTitle().trim()">
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
              
              <mat-nav-list>
                @for (task of taskService.tasks(); track task.id) {
                  <app-task 
                    [task]="task" 
                    (toggle)="toggleTask($event)" 
                    (delete)="deleteTask($event)"
                  ></app-task>
                }
              </mat-nav-list>
            }
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .task-list-container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    .task-card {
      padding: 1rem;
    }
    mat-card-header {
      margin-bottom: 2rem;
      justify-content: center;
      text-align: center;
    }
    mat-card-title {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    .input-group {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      margin-bottom: 1rem;
    }
    .full-width {
      flex: 1;
    }
    .stats {
      font-size: 0.85rem;
      margin-bottom: 1rem;
      padding-left: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
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
  
  newTaskTitle = signal('');

  completedCount = computed(() => 
    this.taskService.tasks().filter(t => t.completed).length
  );

  ngOnInit() {
    this.taskService.loadTasks();
    this.personService.loadPersons();
  }

  addTask() {
    const title = this.newTaskTitle().trim();
    if (!title) return;

    this.taskService.addTask(title);
    this.newTaskTitle.set('');
  }

  toggleTask(task: Task) {
    this.taskService.updateTask(task.id, { completed: !task.completed }).subscribe();
  }

  deleteTask(id: string) {
    this.taskService.deleteTask(id);
  }
}
