import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PersonService } from '../../services/person.service';
import { Person } from '../../models/person.model';

@Component({
  selector: 'app-person-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <form [formGroup]="personForm" class="person-form">
      <mat-form-field appearance="outline">
        <mat-label>Name</mat-label>
        <input matInput formControlName="name" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Surname</mat-label>
        <input matInput formControlName="surname" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>DNI</mat-label>
        <input matInput formControlName="dni" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>CUIL</mat-label>
        <input matInput formControlName="cuil" />
      </mat-form-field>
      
      <div class="actions">
        <button mat-button type="button" (click)="onCancel()">Cancel</button>
        <button mat-flat-button color="primary" [disabled]="personForm.invalid" (click)="onSave()">Save</button>
      </div>
    </form>
  `,
  styles: [`
    .person-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding-top: 1rem;
      min-width: 300px;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1rem;
    }
  `]
})
export class PersonFormComponent {
  @Output() save = new EventEmitter<Person>();
  @Output() cancel = new EventEmitter<void>();

  personService = inject(PersonService);
  fb = inject(FormBuilder);

  personForm = this.fb.group({
    name: ['', Validators.required],
    surname: ['', Validators.required],
    dni: ['', Validators.required],
    cuil: ['', Validators.required]
  });

  onSave() {
    if (this.personForm.valid) {
      this.personService.addPerson(this.personForm.value as any).subscribe((newPerson) => {
        this.save.emit(newPerson);
      });
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
