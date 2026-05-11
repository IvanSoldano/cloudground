import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../models/task.model';
import { TaskComponent } from '../task/task.component';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskComponent],
  template: `
    <div class="task-list-container">
      <header class="list-header">
        <h1>Cloud Tasks</h1>
        <p class="subtitle">Stay organized and productive.</p>
      </header>

      <div class="input-group">
        <input 
          type="text" 
          [(ngModel)]="newTaskTitle" 
          (keyup.enter)="addTask()"
          placeholder="Add a new task..."
          class="task-input"
        />
        <button (click)="addTask()" class="add-btn" [disabled]="!newTaskTitle().trim()">
          <span>Add Task</span>
        </button>
      </div>

      <div class="tasks-container">
        @if (taskService.tasks().length === 0) {
          <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <p>No tasks yet. Start by adding one above!</p>
          </div>
        } @else {
          <div class="stats">
            <span>{{ completedCount() }} of {{ taskService.tasks().length }} tasks completed</span>
          </div>
          
          @for (task of taskService.tasks(); track task.id) {
            <app-task 
              [task]="task" 
              (toggle)="toggleTask($event)" 
              (delete)="deleteTask($event)"
            ></app-task>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .task-list-container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 2rem;
      background: rgba(15, 15, 20, 0.7);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    }

    .list-header {
      margin-bottom: 2rem;
      text-align: center;

      h1 {
        font-size: 2.5rem;
        font-weight: 800;
        margin: 0;
        background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .subtitle {
        color: #94a3b8;
        font-size: 1.1rem;
        margin-top: 0.5rem;
      }
    }

    .input-group {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }

    .task-input {
      flex: 1;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 0.8rem 1.2rem;
      color: white;
      font-size: 1rem;
      transition: all 0.3s ease;

      &:focus {
        outline: none;
        border-color: #6366f1;
        background: rgba(255, 255, 255, 0.08);
        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
      }

      &::placeholder {
        color: rgba(255, 255, 255, 0.3);
      }
    }

    .add-btn {
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 12px;
      padding: 0 1.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        background: #4f46e5;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        filter: grayscale(1);
      }
    }

    .stats {
      font-size: 0.85rem;
      color: #64748b;
      margin-bottom: 1rem;
      padding-left: 0.5rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 0;
      color: #475569;

      svg {
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      p {
        font-size: 1.1rem;
      }
    }

    .tasks-container {
      min-height: 200px;
    }
  `]
})
export class TaskListComponent implements OnInit {
  taskService = inject(TaskService);
  
  newTaskTitle = signal('');

  completedCount = computed(() => 
    this.taskService.tasks().filter(t => t.completed).length
  );

  ngOnInit() {
    this.taskService.loadTasks();
  }

  addTask() {
    const title = this.newTaskTitle().trim();
    if (!title) return;

    this.taskService.addTask(title);
    this.newTaskTitle.set('');
  }

  toggleTask(id: string) {
    this.taskService.toggleTask(id);
  }

  deleteTask(id: string) {
    this.taskService.deleteTask(id);
  }
}
