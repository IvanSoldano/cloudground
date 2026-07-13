import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { PersonFormComponent } from '../person-form/person-form.component';
import { Person } from '../../models/person.model';

@Component({
  selector: 'app-person-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    PersonFormComponent
  ],
  template: `
    <div class="page-container">
      <mat-card class="person-card">
        <mat-card-header>
          <mat-card-title>Create New Person</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <app-person-form (save)="onSave($event)" (cancel)="onCancel()"></app-person-form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    .person-card {
      padding: 1rem;
    }
    mat-card-header {
      margin-bottom: 2rem;
    }
  `]
})
export class PersonPageComponent {
  router = inject(Router);

  onSave(newPerson: Person) {
    // Navigate back to tasks or show a success message
    this.router.navigate(['/tasks']);
  }

  onCancel() {
    this.router.navigate(['/tasks']);
  }
}
