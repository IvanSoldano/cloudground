import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { PersonService } from '../../services/person.service';
import { TaskService } from '../../services/task.service';
import { PersonDialogComponent } from '../person-dialog/person-dialog.component';
import { Task } from '../../models/task.model';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Person } from '../../models/person.model';

@Component({
  selector: 'app-task-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatAutocompleteModule
  ],
  template: `
    <h2 mat-dialog-title>Edit Task</h2>
    <mat-dialog-content>
      <form [formGroup]="taskForm" class="task-form">
        <mat-form-field appearance="outline">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" />
        </mat-form-field>

        <div class="assignee-row">
          <mat-form-field appearance="outline" class="flex-grow">
            <mat-label>Assignee</mat-label>
            <input type="text" matInput formControlName="assigneeInput" [matAutocomplete]="auto">
            <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayFn" (optionSelected)="onPersonSelected($event.option.value)">
              @for (person of filteredPersons | async; track person.id) {
                <mat-option [value]="person">
                  {{person.name}} {{person.surname}} - {{person.dni}}
                </mat-option>
              }
            </mat-autocomplete>
          </mat-form-field>
          <button mat-icon-button color="primary" (click)="openCreatePersonDialog()" type="button" matTooltip="Create Person">
            <mat-icon>person_add</mat-icon>
          </button>
        </div>

        <div class="dates-row">
          <mat-form-field appearance="outline">
            <mat-label>Start Date</mat-label>
            <input matInput type="date" formControlName="startDate" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>End Date</mat-label>
            <input matInput type="date" formControlName="endDate" />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Justification (Optional, for logging)</mat-label>
          <textarea matInput formControlName="justification" rows="3" placeholder="Why are you changing dates or assignee?"></textarea>
          <mat-hint>If provided, a log entry will be created.</mat-hint>
        </mat-form-field>

        @if (logs().length > 0) {
          <div class="logs-section">
            <h3>Change History</h3>
            <ul class="logs-list">
              @for (log of logs(); track log.id) {
                <li>
                  <strong>{{ log.timestamp | date:'short' }}</strong>: 
                  Changed {{ log.fieldChanged }} from {{ log.oldValue || 'none' }} to {{ log.newValue }}. 
                  <em>Reason: {{ log.justification }}</em>
                </li>
              }
            </ul>
          </div>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="taskForm.invalid">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .task-form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding-top: 1rem;
      min-width: 400px;
    }
    .assignee-row {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .flex-grow {
      flex: 1;
    }
    .dates-row {
      display: flex;
      gap: 1rem;
    }
    .dates-row mat-form-field {
      flex: 1;
    }
    .logs-section {
      margin-top: 1rem;
      background: rgba(0,0,0,0.03);
      padding: 1rem;
      border-radius: 8px;
    }
    .logs-section h3 {
      margin-top: 0;
      font-size: 1rem;
    }
    .logs-list {
      margin: 0;
      padding-left: 1rem;
      font-size: 0.85rem;
    }
  `]
})
export class TaskEditDialogComponent implements OnInit {
  dialogRef = inject(MatDialogRef<TaskEditDialogComponent>);
  data: { task: Task } = inject(MAT_DIALOG_DATA);
  personService = inject(PersonService);
  taskService = inject(TaskService);
  dialog = inject(MatDialog);
  fb = inject(FormBuilder);

  logs = signal<any[]>([]);

  taskForm = this.fb.group({
    title: [this.data.task.title, Validators.required],
    assigneeInput: [''],
    assigneeId: [this.data.task.assigneeId],
    startDate: [this.data.task.startDate || ''],
    endDate: [this.data.task.endDate || ''],
    justification: ['']
  });

  filteredPersons!: Observable<Person[]>;

  ngOnInit() {
    this.personService.loadPersons();
    
    // Set initial value for autocomplete based on existing assigneeId
    if (this.data.task.assigneeId) {
      const p = this.personService.persons().find(x => x.id === this.data.task.assigneeId);
      if (p) {
        this.taskForm.patchValue({ assigneeInput: p as any });
      }
    }

    this.filteredPersons = this.taskForm.get('assigneeInput')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : (value as any)?.name;
        return name ? this._filter(name as string) : this.personService.persons().slice();
      }),
    );

    // Load logs
    this.taskService.getLogs(this.data.task.id).subscribe(logs => this.logs.set(logs));
  }

  displayFn(person: Person): string {
    return person && person.name ? `${person.name} ${person.surname}` : '';
  }

  private _filter(value: string): Person[] {
    const filterValue = value.toLowerCase();
    return this.personService.persons().filter(p => 
      p.name.toLowerCase().includes(filterValue) || 
      p.surname.toLowerCase().includes(filterValue) ||
      p.dni.toLowerCase().includes(filterValue) ||
      p.cuil.toLowerCase().includes(filterValue)
    );
  }

  onPersonSelected(person: Person) {
    this.taskForm.patchValue({ assigneeId: person.id });
  }

  openCreatePersonDialog() {
    const dialogRef = this.dialog.open(PersonDialogComponent);
    dialogRef.afterClosed().subscribe((newPerson: Person) => {
      if (newPerson) {
        this.taskForm.patchValue({
          assigneeInput: newPerson as any,
          assigneeId: newPerson.id
        });
      }
    });
  }

  save() {
    if (this.taskForm.invalid) return;

    const val = this.taskForm.value;
    const originalTask = this.data.task;

    const updates: Partial<Task> = {
      title: val.title!,
      assigneeId: val.assigneeId || undefined,
      startDate: val.startDate || undefined,
      endDate: val.endDate || undefined
    };

    const justification = val.justification?.trim();

    // Determine what changed for logs
    if (justification) {
      if (originalTask.endDate !== val.endDate) {
        this.taskService.addActivityLog(originalTask.id, {
          fieldChanged: 'endDate',
          oldValue: originalTask.endDate,
          newValue: val.endDate,
          justification
        }).subscribe();
      } else if (originalTask.startDate !== val.startDate) {
        this.taskService.addActivityLog(originalTask.id, {
          fieldChanged: 'startDate',
          oldValue: originalTask.startDate,
          newValue: val.startDate,
          justification
        }).subscribe();
      }
      // Can add more field checks as necessary
    }

    this.taskService.updateTask(originalTask.id, updates).subscribe(() => {
      this.dialogRef.close(true);
    });
  }
}
