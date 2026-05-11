import { Routes } from '@angular/router';
import { TaskListComponent } from './tasklist/tasklist.component';
import { LandingComponent } from './landing/landing.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'tasks', component: TaskListComponent },
  { path: '**', redirectTo: '' }
];
