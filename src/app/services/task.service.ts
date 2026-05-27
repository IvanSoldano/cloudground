import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task } from '../models/task.model';
import { catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  // This signal holds the current state of tasks
  tasks = signal<Task[]>([]);
  
  // Local fallback data if backend is not running
  private localFallback: Task[] = [
    { id: 'local-1', title: 'Design premium task interface (Local)', completed: true },
    { id: 'local-2', title: 'Integrate Angular signals (Local)', completed: true },
    { id: 'local-3', title: 'Deploy to Cloudflare Workers (Local)', completed: false },
    { id: 'local-4', title: 'Add dark mode support (Local)', completed: false },
  ];

  constructor(private http: HttpClient) {}

  /**
   * Load tasks from the backend. If it fails, load local fallback.
   */
  loadTasks() {
    this.http.get<Task[]>('/api/tasks').pipe(
      tap((data) => {
        console.log('Successfully fetched tasks from backend:', data);
        this.tasks.set(data);
      }),
      catchError((error) => {
        console.warn('Backend unavailable, falling back to local mock data.', error);
        this.tasks.set([...this.localFallback]);
        return of(this.localFallback);
      })
    ).subscribe();
  }

  addTask(title: string) {
    const newTask = { title };
    
    this.http.post<Task>('/api/tasks', newTask).pipe(
      tap((createdTask) => {
        this.tasks.update(tasks => [createdTask, ...tasks]);
      }),
      catchError((error) => {
        console.warn('Backend unavailable, saving task locally.', error);
        const fallbackTask: Task = {
          id: crypto.randomUUID(),
          title,
          completed: false
        };
        this.localFallback = [fallbackTask, ...this.localFallback];
        this.tasks.set([...this.localFallback]);
        return of(fallbackTask);
      })
    ).subscribe();
  }

  updateTask(id: string, updates: Partial<Task>) {
    return this.http.put(`/api/tasks/${id}`, updates).pipe(
      tap(() => {
        this.tasks.update(tasks => 
          tasks.map(t => t.id === id ? { ...t, ...updates } : t)
        );
      }),
      catchError((error) => {
        console.warn('Backend unavailable, updating task locally.', error);
        this.localFallback = this.localFallback.map(t => t.id === id ? { ...t, ...updates } : t);
        this.tasks.set([...this.localFallback]);
        return of(null);
      })
    );
  }

  getLogs(taskId: string) {
    return this.http.get<any[]>(`/api/tasks/${taskId}/logs`).pipe(
      catchError(() => of([]))
    );
  }

  addActivityLog(taskId: string, log: any) {
    return this.http.post(`/api/tasks/${taskId}/logs`, log).pipe(
      catchError(() => of(null))
    );
  }

  deleteTask(id: string) {
    this.http.delete(`/api/tasks/${id}`).pipe(
      tap(() => {
        this.tasks.update(tasks => tasks.filter(t => t.id !== id));
      }),
      catchError((error) => {
        console.warn('Backend unavailable, deleting task locally.', error);
        this.localFallback = this.localFallback.filter(t => t.id !== id);
        this.tasks.set([...this.localFallback]);
        return of(null);
      })
    ).subscribe();
  }
}
