import { Routes } from '@angular/router';
import { TaskListComponent } from './components/tasklist/tasklist.component';
import { LandingComponent } from './components/landing/landing.component';
import { PersonPageComponent } from './components/person-page/person-page.component';
import { GanttChartComponent } from './components/gantt-chart/gantt-chart.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'tasks', component: TaskListComponent },
  { path: 'persons/new', component: PersonPageComponent },
  { path: 'gantt', component: GanttChartComponent },
  { path: '**', redirectTo: '' }
];
