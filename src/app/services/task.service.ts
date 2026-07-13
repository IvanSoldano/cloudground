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
    { id: 'local-1', title: 'Design premium task interface (Local)', completed: true, assignedPersonId: 'p3' },
    { id: 'local-2', title: 'Integrate Angular signals (Local)', completed: true, assignedPersonId: 'p1' },
    { id: 'local-3', title: 'Deploy to Cloudflare Workers (Local)', completed: false, assignedPersonId: 'p2' },
    { id: 'local-4', title: 'Add dark mode support (Local)', completed: false, assignedPersonId: null },
  ];

  constructor(private http: HttpClient) {}

  /**
   * Load tasks from the backend. If it fails, load local fallback.
   */
  loadTasks() {
    this.http.get<Task[]>('/api/tasks').pipe(
      tap((data) => {
        console.log('Successfully fetched tasks from backend:', data);
        const mapped = data.map(t => ({
          ...t,
          assignedPersonId: t.assignedPersonId || t.assigned_person_id || null
        }));
        this.tasks.set(mapped);
      }),
      catchError((error) => {
        console.warn('Backend unavailable, falling back to local mock data.', error);
        this.tasks.set([...this.localFallback]);
        return of(this.localFallback);
      })
    ).subscribe();
  }

  addTask(title: string, assignedPersonId: string | null = null) {
    const newTask = { title, assignedPersonId };
    
    this.http.post<Task>('/api/tasks', newTask).pipe(
      tap((createdTask) => {
        const mapped = {
          ...createdTask,
          assignedPersonId: createdTask.assignedPersonId || createdTask.assigned_person_id || null
        };
        this.tasks.update(tasks => [mapped, ...tasks]);
      }),
      catchError((error) => {
        console.warn('Backend unavailable, saving task locally.', error);
        const fallbackTask: Task = {
          id: crypto.randomUUID(),
          title,
          completed: false,
          assignedPersonId
        };
        this.localFallback = [fallbackTask, ...this.localFallback];
        this.tasks.set([...this.localFallback]);
        return of(fallbackTask);
      })
    ).subscribe();
  }

  toggleTask(id: string) {
    this.http.put<Task>(`/api/tasks/${id}`, {}).pipe(
      tap((updatedTask) => {
        this.tasks.update(tasks => 
          tasks.map(t => t.id === id ? { 
            ...t, 
            completed: updatedTask.completed !== undefined ? updatedTask.completed : !t.completed,
            assignedPersonId: updatedTask.assignedPersonId || updatedTask.assigned_person_id || t.assignedPersonId 
          } : t)
        );
      }),
      catchError((error) => {
        console.warn('Backend unavailable, toggling task locally.', error);
        this.localFallback = this.localFallback.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        this.tasks.set([...this.localFallback]);
        return of(null);
      })
    ).subscribe();
  }

  assignPerson(taskId: string, personId: string | null) {
    this.http.put<Task>(`/api/tasks/${taskId}`, { assignedPersonId: personId }).pipe(
      tap((updatedTask) => {
        this.tasks.update(tasks =>
          tasks.map(t => t.id === taskId ? { 
            ...t, 
            assignedPersonId: updatedTask.assignedPersonId || updatedTask.assigned_person_id || personId 
          } : t)
        );
      }),
      catchError((error) => {
        console.warn('Backend unavailable, assigning person locally.', error);
        this.localFallback = this.localFallback.map(t => t.id === taskId ? { ...t, assignedPersonId: personId } : t);
        this.tasks.set([...this.localFallback]);
        return of(null);
      })
    ).subscribe();
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
