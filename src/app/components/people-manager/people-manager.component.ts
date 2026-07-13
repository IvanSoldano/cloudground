import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonService } from '../../services/person.service';
import { TaskService } from '../../services/task.service';
import { Person } from '../../models/person.model';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-people-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatChipsModule
  ],
  template: `
    <div class="people-dashboard-container">
      <!-- Dashboard Header -->
      <div class="dashboard-header">
        <div class="header-text">
          <h1>Team Directory</h1>
          <p class="subtitle">Manage team members and monitor real-time workloads.</p>
        </div>
        <a mat-stroked-button color="primary" routerLink="/tasks" class="tasks-btn">
          <mat-icon>task_alt</mat-icon>
          Go to Tasks
        </a>
      </div>

      <!-- Quick Stats Widgets -->
      <div class="stats-grid">
        <mat-card class="stat-card team-stat">
          <mat-card-content>
            <div class="stat-icon-wrapper">
              <mat-icon>people</mat-icon>
            </div>
            <div class="stat-value">{{ personService.people().length }}</div>
            <div class="stat-label">Total Team Size</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card task-stat">
          <mat-card-content>
            <div class="stat-icon-wrapper">
              <mat-icon>assignment_turned_in</mat-icon>
            </div>
            <div class="stat-value">{{ activeTasksCount() }}</div>
            <div class="stat-label">Total Active Tasks</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card coverage-stat">
          <mat-card-content>
            <div class="stat-icon-wrapper">
              <mat-icon>assessment</mat-icon>
            </div>
            <div class="stat-value">{{ coveragePercent() }}%</div>
            <div class="stat-label">Task Assignment Coverage</div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="main-layout">
        <!-- Add Team Member Form -->
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Add Team Member</mat-card-title>
            <mat-card-subtitle>Onboard a new teammate into Cloudground</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <form (submit)="addPerson(); $event.preventDefault()" class="person-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Full Name</mat-label>
                <input matInput [(ngModel)]="newName" name="name" required placeholder="e.g. Robin Hood" />
                <mat-icon matSuffix>person</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email Address</mat-label>
                <input matInput type="email" [(ngModel)]="newEmail" name="email" required placeholder="e.g. robin@cloudground.io" />
                <mat-icon matSuffix>email</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Role / Position</mat-label>
                <mat-select [(ngModel)]="newRole" name="role" required>
                  @for (role of availableRoles; track role) {
                    <mat-option [value]="role">{{ role }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <button mat-flat-button color="primary" class="full-width submit-btn" type="submit" [disabled]="!isFormValid()">
                <mat-icon>person_add</mat-icon>
                Register Member
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- People Grid -->
        <div class="people-grid-container">
          @if (personService.people().length === 0) {
            <div class="empty-state">
              <mat-icon class="empty-icon" color="primary">group_add</mat-icon>
              <h3>No team members yet</h3>
              <p>Add some people using the form to start assigning them to tasks!</p>
            </div>
          } @else {
            <div class="people-grid">
              @for (person of personService.people(); track person.id) {
                <mat-card class="person-card">
                  <div class="avatar-banner" [style.background]="getGradient(person.name)">
                    <img 
                      [src]="person.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + person.name" 
                      [alt]="person.name" 
                      class="person-avatar"
                    />
                  </div>
                  <mat-card-content class="person-content">
                    <h3 class="person-name">{{ person.name }}</h3>
                    <p class="person-email">{{ person.email }}</p>
                    
                    <span class="role-badge" [ngClass]="getRoleClass(person.role)">
                      {{ person.role }}
                    </span>

                    <div class="workload-stats">
                      <div class="workload-item">
                        <span class="workload-value">{{ getAssignedTasksCount(person.id) }}</span>
                        <span class="workload-label">Assigned Tasks</span>
                      </div>
                    </div>
                  </mat-card-content>
                  
                  <div class="card-actions">
                    <button mat-icon-button color="warn" (click)="deletePerson(person.id)" aria-label="Remove person">
                      <mat-icon>delete_outline</mat-icon>
                    </button>
                  </div>
                </mat-card>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .people-dashboard-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }
    
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    
    .header-text h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 0.25rem 0;
      background: linear-gradient(135deg, var(--mat-sys-primary) 0%, #a855f7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .subtitle {
      color: var(--mat-sys-on-surface-variant);
      margin: 0;
      font-size: 1.1rem;
    }
    
    .tasks-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
      border-radius: 8px;
    }

    /* Stats Widgets */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }

    .stat-card {
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 16px;
      overflow: hidden;
      position: relative;
      background: rgba(var(--mat-sys-surface-container), 0.4);
      backdrop-filter: blur(10px);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }

    .stat-icon-wrapper {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(var(--mat-sys-primary-rgb), 0.1);
      color: var(--mat-sys-primary);
    }

    .team-stat .stat-icon-wrapper { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .task-stat .stat-icon-wrapper { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
    .coverage-stat .stat-icon-wrapper { background: rgba(16, 185, 129, 0.1); color: #10b981; }

    .stat-value {
      font-size: 2.2rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.9rem;
      color: var(--mat-sys-on-surface-variant);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Main Layout */
    .main-layout {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 2rem;
      align-items: flex-start;
    }

    @media (max-width: 900px) {
      .main-layout {
        grid-template-columns: 1fr;
      }
    }

    /* Form Styles */
    .form-card {
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 16px;
      padding: 1rem;
    }

    .person-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .full-width {
      width: 100%;
    }

    .submit-btn {
      padding: 1.25rem;
      border-radius: 8px;
      font-weight: 600;
    }

    /* Grid Styles */
    .people-grid-container {
      min-height: 400px;
    }

    .empty-state {
      text-align: center;
      padding: 5rem 2rem;
      border: 2px dashed var(--mat-sys-outline-variant);
      border-radius: 16px;
      background: rgba(var(--mat-sys-surface-variant-rgb), 0.05);
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 1.5rem;
    }

    .people-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1.5rem;
    }

    .person-card {
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 16px;
      overflow: hidden;
      transition: transform 0.25s, box-shadow 0.25s;
      position: relative;
    }

    .person-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
    }

    .avatar-banner {
      height: 70px;
      position: relative;
      margin-bottom: 35px;
    }

    .person-avatar {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid var(--mat-sys-surface);
      position: absolute;
      bottom: -35px;
      left: 20px;
      background: white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }

    .person-content {
      padding: 0 1.25rem 1.25rem 1.25rem;
    }

    .person-name {
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 0 0.2rem 0;
    }

    .person-email {
      font-size: 0.85rem;
      color: var(--mat-sys-on-surface-variant);
      margin: 0 0 1rem 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .role-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 20px;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .role-frontend { background: rgba(59, 130, 246, 0.12); color: #2563eb; }
    .role-backend { background: rgba(168, 85, 247, 0.12); color: #7c3aed; }
    .role-design { background: rgba(236, 72, 153, 0.12); color: #db2777; }
    .role-product { background: rgba(245, 158, 11, 0.12); color: #d97706; }
    .role-default { background: rgba(107, 114, 128, 0.12); color: #4b5563; }

    .workload-stats {
      border-top: 1px solid var(--mat-sys-outline-variant);
      padding-top: 0.75rem;
      margin-top: 0.5rem;
      display: flex;
    }

    .workload-item {
      display: flex;
      flex-direction: column;
    }

    .workload-value {
      font-size: 1.1rem;
      font-weight: 700;
    }

    .workload-label {
      font-size: 0.75rem;
      color: var(--mat-sys-on-surface-variant);
    }

    .card-actions {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: rgba(255, 255, 255, 0.85);
      border-radius: 50%;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .person-card:hover .card-actions {
      opacity: 1;
    }
  `]
})
export class PeopleManagerComponent implements OnInit {
  personService = inject(PersonService);
  taskService = inject(TaskService);

  newName = '';
  newEmail = '';
  newRole = '';

  availableRoles = [
    'Frontend Engineer',
    'Backend Engineer',
    'UI/UX Designer',
    'Product Manager'
  ];

  gradients = [
    'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
    'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    'linear-gradient(135deg, #10b981 0%, #047857 100%)'
  ];

  activeTasksCount = computed(() => 
    this.taskService.tasks().filter(t => !t.completed).length
  );

  coveragePercent = computed(() => {
    const total = this.taskService.tasks().length;
    if (total === 0) return 0;
    const assigned = this.taskService.tasks().filter(t => t.assignedPersonId != null).length;
    return Math.round((assigned / total) * 100);
  });

  ngOnInit() {
    this.personService.loadPeople();
    this.taskService.loadTasks();
  }

  isFormValid(): boolean {
    return this.newName.trim().length > 0 && 
           this.newEmail.trim().length > 0 && 
           this.newRole.trim().length > 0 &&
           this.newEmail.includes('@');
  }

  addPerson() {
    if (!this.isFormValid()) return;
    this.personService.addPerson(
      this.newName.trim(),
      this.newEmail.trim(),
      this.newRole
    );
    this.newName = '';
    this.newEmail = '';
    this.newRole = '';
  }

  deletePerson(id: string) {
    if (confirm('Are you sure you want to remove this team member? All of their task assignments will be cleared.')) {
      this.personService.deletePerson(id);
      // Let's reload tasks to show updated assignment signals immediately
      setTimeout(() => this.taskService.loadTasks(), 100);
    }
  }

  getAssignedTasksCount(personId: string): number {
    return this.taskService.tasks().filter(t => t.assignedPersonId === personId && !t.completed).length;
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'Frontend Engineer': return 'role-frontend';
      case 'Backend Engineer': return 'role-backend';
      case 'UI/UX Designer': return 'role-design';
      case 'Product Manager': return 'role-product';
      default: return 'role-default';
    }
  }

  getGradient(name: string): string {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return this.gradients[hash % this.gradients.length];
  }
}
