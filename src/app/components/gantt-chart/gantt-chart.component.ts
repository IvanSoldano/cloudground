import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-gantt-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="gantt-container">
      <mat-card class="gantt-card">
        <mat-card-header>
          <mat-card-title>Task Timeline</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (ganttTasks().length === 0) {
            <p>No tasks with start and end dates available to display on the timeline.</p>
          } @else {
            <div class="gantt-scroll-wrapper">
              <div class="gantt-grid" [style.grid-template-columns]="gridColumns()">
                
                <!-- Header Row -->
                <div class="gantt-header-cell task-title-header">Task</div>
                @for (day of days(); track day.getTime()) {
                  <div class="gantt-header-cell day-header">
                    {{ day | date:'MMM d' }}
                  </div>
                }
                
                <!-- Task Rows -->
                @for (task of ganttTasks(); track task.id) {
                  <!-- Background grid lines for the row -->
                  <div class="gantt-row-bg" [style.grid-column]="'1 / -1'"></div>

                  <!-- Task Title Column -->
                  <div class="gantt-cell task-title-cell">{{ task.title }}</div>
                  
                  <!-- The Task Bar -->
                  <div class="gantt-task-bar-container" [style.grid-column]="getGridColumn(task)">
                    <div class="gantt-task-bar" [class.completed]="task.completed" [title]="task.title">
                      {{ task.title }}
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .gantt-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    .gantt-card {
      padding: 1rem;
    }
    mat-card-header {
      margin-bottom: 2rem;
    }
    .gantt-scroll-wrapper {
      overflow-x: auto;
      padding-bottom: 1rem;
    }
    .gantt-grid {
      display: grid;
      min-width: 800px;
      border: 1px solid rgba(0,0,0,0.12);
      border-radius: 4px;
      background: #fafafa;
    }
    .gantt-header-cell {
      padding: 0.75rem 0.5rem;
      font-weight: 500;
      background: #f0f0f0;
      border-bottom: 1px solid rgba(0,0,0,0.12);
      border-right: 1px solid rgba(0,0,0,0.06);
      text-align: center;
      font-size: 0.85rem;
      white-space: nowrap;
    }
    .task-title-header {
      text-align: left;
      position: sticky;
      left: 0;
      z-index: 2;
      background: #f0f0f0;
    }
    .gantt-row-bg {
      border-bottom: 1px solid rgba(0,0,0,0.06);
      grid-row: auto;
    }
    .gantt-cell {
      padding: 0.75rem 0.5rem;
      display: flex;
      align-items: center;
      border-bottom: 1px solid rgba(0,0,0,0.06);
      border-right: 1px solid rgba(0,0,0,0.06);
      background: white;
    }
    .task-title-cell {
      position: sticky;
      left: 0;
      z-index: 1;
      font-weight: 500;
      background: white;
      border-right: 1px solid rgba(0,0,0,0.12);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .gantt-task-bar-container {
      padding: 0.5rem;
      display: flex;
      align-items: center;
      grid-row: auto; /* aligns with the current row */
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }
    .gantt-task-bar {
      background: #3f51b5;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.85rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: background 0.2s;
    }
    .gantt-task-bar.completed {
      background: #4caf50;
    }
  `]
})
export class GanttChartComponent implements OnInit {
  taskService = inject(TaskService);

  ganttTasks = computed(() => {
    return this.taskService.tasks().filter(t => t.startDate && t.endDate);
  });

  days = computed(() => {
    const tasks = this.ganttTasks();
    if (tasks.length === 0) return [];

    let min = new Date(tasks[0].startDate!);
    let max = new Date(tasks[0].endDate!);

    for (const t of tasks) {
      const start = new Date(t.startDate!);
      const end = new Date(t.endDate!);
      if (start < min) min = start;
      if (end > max) max = end;
    }

    // Add some padding (3 days before and after)
    min.setDate(min.getDate() - 3);
    max.setDate(max.getDate() + 3);

    const d = [];
    let current = new Date(min);
    while (current <= max) {
      d.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return d;
  });

  gridColumns = computed(() => {
    const numDays = this.days().length;
    return `250px repeat(${numDays}, minmax(60px, 1fr))`;
  });

  ngOnInit() {
    this.taskService.loadTasks();
  }

  getGridColumn(task: Task): string {
    const allDays = this.days();
    if (allDays.length === 0 || !task.startDate || !task.endDate) return '2 / 3';

    const start = new Date(task.startDate);
    const end = new Date(task.endDate);

    // Normalize times to midnight to avoid timezone shift issues
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);
    const firstDay = new Date(allDays[0]);
    firstDay.setHours(0,0,0,0);

    const msPerDay = 1000 * 60 * 60 * 24;
    const startIndex = Math.floor((start.getTime() - firstDay.getTime()) / msPerDay);
    const endIndex = Math.floor((end.getTime() - firstDay.getTime()) / msPerDay);

    // Column 1 is the Task Title, Day 1 is Column 2
    const startCol = 2 + startIndex;
    // End column is exclusive
    const endCol = 2 + endIndex + 1;

    return `${startCol} / ${endCol}`;
  }
}
