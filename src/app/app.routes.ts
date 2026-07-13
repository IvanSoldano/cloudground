import { Routes } from '@angular/router';
import { TaskListComponent } from './components/tasklist/tasklist.component';
import { LandingComponent } from './components/landing/landing.component';
<<<<<<< HEAD
import { PeopleManagerComponent } from './components/people-manager/people-manager.component';
import { WikiListComponent } from './components/wiki/wiki-list/wiki-list.component';
import { WikiPageComponent } from './components/wiki/wiki-page/wiki-page.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'tasks', component: TaskListComponent },
  { path: 'people', component: PeopleManagerComponent },
  { path: 'wiki', component: WikiListComponent },
  { path: 'wiki/:slug', component: WikiPageComponent },
=======
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
>>>>>>> 44ffd9146989b7a3a3f5ca631341274d1aa4daac
  { path: '**', redirectTo: '' }
];

