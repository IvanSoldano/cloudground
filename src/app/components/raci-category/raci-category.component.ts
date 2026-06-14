import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';

interface RaciCategory {
  id: number;
  alias: string;
  description: string;
  created_at: string;
}

@Component({
  selector: 'app-raci-category',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule],
  template: `
    <div class="container">
      <mat-card appearance="outlined" class="raci-card">
        <mat-card-header>
          <mat-card-title>RACI Matrix Categories</mat-card-title>
          <mat-card-subtitle>Responsibility levels by role</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="dataSource()" class="mat-elevation-z0">
            <!-- ID Column -->
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef> ID </th>
              <td mat-cell *matCellDef="let element"> {{element.id}} </td>
            </ng-container>

            <!-- Alias Column -->
            <ng-container matColumnDef="alias">
              <th mat-header-cell *matHeaderCellDef> Alias </th>
              <td mat-cell *matCellDef="let element"> <strong>{{element.alias}}</strong> </td>
            </ng-container>

            <!-- Description Column -->
            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef> Description </th>
              <td mat-cell *matCellDef="let element"> {{element.description}} </td>
            </ng-container>

            <!-- Created At Column -->
            <ng-container matColumnDef="created_at">
              <th mat-header-cell *matHeaderCellDef> Created At </th>
              <td mat-cell *matCellDef="let element"> {{element.created_at | date:'medium'}} </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .raci-card {
      margin-top: 1rem;
    }
    table {
      width: 100%;
      margin-top: 1rem;
    }
    th.mat-header-cell {
      font-weight: 600;
    }
    .mat-mdc-card-header {
      margin-bottom: 1rem;
    }
  `]
})
export class RaciCategoryComponent implements OnInit {
  private http = inject(HttpClient);
  displayedColumns: string[] = ['id', 'alias', 'description', 'created_at'];
  dataSource = signal<RaciCategory[]>([]);

  ngOnInit() {
    this.http.get<RaciCategory[]>('/api/raci_task_category').subscribe({
      next: (data) => this.dataSource.set(data),
      error: (err) => console.error('Failed to load RACI categories', err)
    });
  }
}
