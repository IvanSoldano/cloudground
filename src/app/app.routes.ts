import { Routes } from '@angular/router';
import { TaskListComponent } from './components/tasklist/tasklist.component';
import { LandingComponent } from './components/landing/landing.component';
import { PersonPageComponent } from './components/person-page/person-page.component';
import { GanttChartComponent } from './components/gantt-chart/gantt-chart.component';
import { LoginComponent } from './components/login/login.component';
import { PendingApprovalComponent } from './components/pending-approval/pending-approval.component';
import { RaciCategoryComponent } from './components/raci-category/raci-category.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'pending-approval', component: PendingApprovalComponent },
  { path: 'tasks', component: TaskListComponent, canActivate: [authGuard] },
  { path: 'persons/new', component: PersonPageComponent, canActivate: [authGuard] },
  { path: 'gantt', component: GanttChartComponent, canActivate: [authGuard] },
  { path: 'raci', component: RaciCategoryComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
