import { Routes } from '@angular/router';
import { TaskListComponent } from './components/tasklist/tasklist.component';
import { LandingComponent } from './components/landing/landing.component';
import { PeopleManagerComponent } from './components/people-manager/people-manager.component';
import { WikiListComponent } from './components/wiki/wiki-list/wiki-list.component';
import { WikiPageComponent } from './components/wiki/wiki-page/wiki-page.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'tasks', component: TaskListComponent },
  { path: 'people', component: PeopleManagerComponent },
  { path: 'wiki', component: WikiListComponent },
  { path: 'wiki/:slug', component: WikiPageComponent },
  { path: '**', redirectTo: '' }
];

