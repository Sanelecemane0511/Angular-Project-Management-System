import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProjectListComponent } from './features/projects/project-list.component';
import { TaskListComponent } from './features/tasks/task-list.component';
import { ProjectTasksComponent } from './features/projects/project-tasks.component';
import { TeamManagementComponent } from './features/team/team-management.component';
import { LoginComponent } from './features/auth/login.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'projects', component: ProjectListComponent },
  { path: 'my-tasks', component: TaskListComponent },
  { path: 'projects/:id/tasks', component: ProjectTasksComponent },
  { path: 'projects/:id/tasks/manage', component: ProjectTasksComponent, data: { manageMode: true } },
  { path: 'team', component: TeamManagementComponent },
  { path: '',   redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'projects', component: ProjectListComponent },
  { path: 'my-tasks', component: TaskListComponent },
];