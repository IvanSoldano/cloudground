import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Person } from '../models/person.model';
import { catchError, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  persons = signal<Person[]>([]);

  private localFallback: Person[] = [
    { id: 'p1', name: 'Alice', surname: 'Smith', dni: '12345678', cuil: '20-12345678-0' },
    { id: 'p2', name: 'Bob', surname: 'Jones', dni: '87654321', cuil: '20-87654321-0' },
  ];

  constructor(private http: HttpClient) {}

  loadPersons() {
    this.http.get<Person[]>('/api/persons').pipe(
      tap((data) => this.persons.set(data)),
      catchError((error) => {
        console.warn('Backend unavailable, falling back to local persons.', error);
        this.persons.set([...this.localFallback]);
        return of(this.localFallback);
      })
    ).subscribe();
  }

  addPerson(personData: Omit<Person, 'id'>) {
    return this.http.post<Person>('/api/persons', personData).pipe(
      tap((created) => {
        this.persons.update(ps => [...ps, created]);
      }),
      catchError((error) => {
        console.warn('Backend unavailable, saving person locally.', error);
        const fallbackPerson: Person = {
          id: crypto.randomUUID(),
          ...personData
        };
        this.localFallback = [...this.localFallback, fallbackPerson];
        this.persons.set([...this.localFallback]);
        return of(fallbackPerson);
      })
    );
  }
}
