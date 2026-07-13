import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';

export interface RaciCategory {
  id: number;
  alias: string;
  description: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class RaciCategoryService {
  categories = signal<RaciCategory[]>([]);

  private localFallback: RaciCategory[] = [
    { id: 1, alias: 'R', description: 'Responsible', created_at: new Date().toISOString() },
    { id: 2, alias: 'A', description: 'Accountable', created_at: new Date().toISOString() },
    { id: 3, alias: 'C', description: 'Consulted', created_at: new Date().toISOString() },
    { id: 4, alias: 'I', description: 'Informed', created_at: new Date().toISOString() },
  ];

  constructor(private http: HttpClient) {}

  loadCategories() {
    this.http.get<RaciCategory[]>('/api/raci_task_category').pipe(
      tap((data) => this.categories.set(data)),
      catchError((error) => {
        console.warn('Backend unavailable, falling back to local RACI categories.', error);
        this.categories.set([...this.localFallback]);
        return of(this.localFallback);
      })
    ).subscribe();
  }
}
