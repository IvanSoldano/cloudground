import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Person } from '../models/person.model';
import { catchError, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
<<<<<<< HEAD
  people = signal<Person[]>([]);

  private localFallback: Person[] = [
    { id: 'p1', name: 'Alex Rivera', email: 'alex@cloudground.io', role: 'Frontend Engineer', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
    { id: 'p2', name: 'Jordan Lee', email: 'jordan@cloudground.io', role: 'Backend Engineer', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
    { id: 'p3', name: 'Taylor Chen', email: 'taylor@cloudground.io', role: 'UI/UX Designer', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' }
=======
  persons = signal<Person[]>([]);

  private localFallback: Person[] = [
    { id: 'p1', name: 'Alice', surname: 'Smith', dni: '12345678', cuil: '20-12345678-0' },
    { id: 'p2', name: 'Bob', surname: 'Jones', dni: '87654321', cuil: '20-87654321-0' },
>>>>>>> 44ffd9146989b7a3a3f5ca631341274d1aa4daac
  ];

  constructor(private http: HttpClient) {}

<<<<<<< HEAD
  loadPeople() {
    this.http.get<Person[]>('/api/people').pipe(
      tap((data) => {
        console.log('Successfully fetched people from backend:', data);
        const mapped = data.map(p => ({
          ...p,
          avatarUrl: p.avatarUrl || p.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.name)}`
        }));
        this.people.set(mapped);
      }),
      catchError((error) => {
        console.warn('Backend unavailable, falling back to local people mock data.', error);
        this.people.set([...this.localFallback]);
=======
  loadPersons() {
    this.http.get<Person[]>('/api/persons').pipe(
      tap((data) => this.persons.set(data)),
      catchError((error) => {
        console.warn('Backend unavailable, falling back to local persons.', error);
        this.persons.set([...this.localFallback]);
>>>>>>> 44ffd9146989b7a3a3f5ca631341274d1aa4daac
        return of(this.localFallback);
      })
    ).subscribe();
  }

<<<<<<< HEAD
  addPerson(name: string, email: string, role: string) {
    const newPersonPayload = { name, email, role };
    this.http.post<Person>('/api/people', newPersonPayload).pipe(
      tap((created) => {
        const mapped = {
          ...created,
          avatarUrl: created.avatarUrl || created.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(created.name)}`
        };
        this.people.update(people => [...people, mapped]);
=======
  addPerson(personData: Omit<Person, 'id'>) {
    return this.http.post<Person>('/api/persons', personData).pipe(
      tap((created) => {
        this.persons.update(ps => [...ps, created]);
>>>>>>> 44ffd9146989b7a3a3f5ca631341274d1aa4daac
      }),
      catchError((error) => {
        console.warn('Backend unavailable, saving person locally.', error);
        const fallbackPerson: Person = {
          id: crypto.randomUUID(),
<<<<<<< HEAD
          name,
          email,
          role,
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
        };
        this.localFallback = [...this.localFallback, fallbackPerson];
        this.people.set([...this.localFallback]);
        return of(fallbackPerson);
      })
    ).subscribe();
  }

  deletePerson(id: string) {
    this.http.delete(`/api/people/${id}`).pipe(
      tap(() => {
        this.people.update(people => people.filter(p => p.id !== id));
      }),
      catchError((error) => {
        console.warn('Backend unavailable, deleting person locally.', error);
        this.localFallback = this.localFallback.filter(p => p.id !== id);
        this.people.set([...this.localFallback]);
        return of(null);
      })
    ).subscribe();
=======
          ...personData
        };
        this.localFallback = [...this.localFallback, fallbackPerson];
        this.persons.set([...this.localFallback]);
        return of(fallbackPerson);
      })
    );
>>>>>>> 44ffd9146989b7a3a3f5ca631341274d1aa4daac
  }
}
