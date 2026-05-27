import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { PersonFormComponent } from '../person-form/person-form.component';
import { Person } from '../../models/person.model';

@Component({
  selector: 'app-person-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    PersonFormComponent
  ],
  template: `
    <h2 mat-dialog-title>Create New Person</h2>
    <mat-dialog-content>
      <app-person-form (save)="onSave($event)" (cancel)="onCancel()"></app-person-form>
    </mat-dialog-content>
  `
})
export class PersonDialogComponent {
  dialogRef = inject(MatDialogRef<PersonDialogComponent>);

  onSave(newPerson: Person) {
    this.dialogRef.close(newPerson);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
