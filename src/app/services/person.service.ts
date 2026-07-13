import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Person } from '../models/person.model';
import { catchError, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  people = signal<Person[]>([]);
  persons = this.people;

  private localFallback: Person[] = [
    { id: 'p1', name: 'Alex Rivera', email: 'alex@cloudground.io', role: 'Frontend Engineer', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', surname: 'Rivera', dni: '11111111', cuil: '20-11111111-0' },
    { id: 'p2', name: 'Jordan Lee', email: 'jordan@cloudground.io', role: 'Backend Engineer', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', surname: 'Lee', dni: '22222222', cuil: '20-22222222-0' },
    { id: 'p3', name: 'Taylor Chen', email: 'taylor@cloudground.io', role: 'UI/UX Designer', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', surname: 'Chen', dni: '33333333', cuil: '20-33333333-0' }
  ];

  constructor(private http: HttpClient) {}

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
        return of(this.localFallback);
      })
    ).subscribe();
  }

  loadPersons() {
    this.loadPeople();
  }

  addPerson(personDataOrName: string | Omit<Person, 'id'>, email?: string, role?: string): any {
    if (typeof personDataOrName === 'string') {
      const name = personDataOrName;
      const newPersonPayload = { name, email, role };
      this.http.post<Person>('/api/people', newPersonPayload).pipe(
        tap((created) => {
          const mapped = {
            ...created,
            avatarUrl: created.avatarUrl || created.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(created.name)}`
          };
          this.people.update(people => [...people, mapped]);
        }),
        catchError((error) => {
          console.warn('Backend unavailable, saving person locally.', error);
          const fallbackPerson: Person = {
            id: crypto.randomUUID(),
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
    } else {
      const personData = personDataOrName;
      return this.http.post<Person>('/api/persons', personData).pipe(
        tap((created) => {
          this.people.update(ps => [...ps, created]);
        }),
        catchError((error) => {
          console.warn('Backend unavailable, saving person locally.', error);
          const fallbackPerson: Person = {
            id: crypto.randomUUID(),
            ...personData
          };
          this.localFallback = [...this.localFallback, fallbackPerson];
          this.people.set([...this.localFallback]);
          return of(fallbackPerson);
        })
      );
    }
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
  }
}
