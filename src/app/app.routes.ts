import { Routes } from '@angular/router';
import { TaskListComponent } from './components/tasklist/tasklist.component';
import { LandingComponent } from './components/landing/landing.component';
import { PersonPageComponent } from './components/person-page/person-page.component';
import { GanttChartComponent } from './components/gantt-chart/gantt-chart.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'tasks', component: TaskListComponent, canActivate: [authGuard] },
  { path: 'persons/new', component: PersonPageComponent, canActivate: [authGuard] },
  { path: 'gantt', component: GanttChartComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
