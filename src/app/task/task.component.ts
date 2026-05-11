import { Component, input, output } from '@angular/core';
import { Task } from '../models/task.model';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="task-item" [ngClass]="{ 'completed': task().completed }">
      <label class="checkbox-container">
        <input 
          type="checkbox" 
          [checked]="task().completed" 
          (change)="toggle.emit(task().id)"
        />
        <span class="checkmark"></span>
      </label>
      
      <span class="task-title">{{ task().title }}</span>
      
      <button class="delete-btn" (click)="delete.emit(task().id)" aria-label="Delete task">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin-bottom: 0.75rem;
    }

    .task-item {
      display: flex;
      align-items: center;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      gap: 1rem;

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        transform: translateY(-2px);
        border-color: rgba(255, 255, 255, 0.2);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      }

      &.completed {
        .task-title {
          text-decoration: line-through;
          opacity: 0.5;
        }
        background: rgba(255, 255, 255, 0.02);
      }
    }

    .task-title {
      flex: 1;
      font-size: 1rem;
      color: #e0e0e0;
      transition: all 0.3s ease;
    }

    /* Premium Checkbox */
    .checkbox-container {
      display: block;
      position: relative;
      width: 20px;
      height: 20px;
      cursor: pointer;
      user-select: none;

      input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
        height: 0;
        width: 0;

        &:checked ~ .checkmark {
          background-color: #6366f1;
          border-color: #6366f1;
          
          &:after {
            display: block;
          }
        }
      }

      .checkmark {
        position: absolute;
        top: 0;
        left: 0;
        height: 20px;
        width: 20px;
        background-color: transparent;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 6px;
        transition: all 0.2s ease;

        &:after {
          content: "";
          position: absolute;
          display: none;
          left: 6px;
          top: 2px;
          width: 5px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
      }
      
      &:hover input ~ .checkmark {
        border-color: #6366f1;
      }
    }

    .delete-btn {
      background: none;
      border: none;
      color: #ff4d4d;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      opacity: 0;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: rgba(255, 77, 77, 0.1);
        transform: scale(1.1);
      }
    }

    .task-item:hover .delete-btn {
      opacity: 1;
    }
  `]
})
export class TaskComponent {
  task = input.required<Task>();
  toggle = output<string>();
  delete = output<string>();
}
