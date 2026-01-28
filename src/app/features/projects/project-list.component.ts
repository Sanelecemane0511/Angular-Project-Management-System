import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { RouterModule, Router } from '@angular/router';
import { ProjectService } from '../../core/services/project.service';
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { Project } from '../../core/models/project.model';
import { ProjectFormComponent } from './project-form.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    RouterModule,
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Project Management</h1>
        <button 
          *ngIf="isManager()" 
          mat-raised-button 
          color="primary" 
          (click)="openProjectForm()">
          <mat-icon>add</mat-icon> Create New Project
        </button>
      </div>

      <div class="projects-grid">
        <mat-card *ngFor="let project of projects()" class="project-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>folder</mat-icon>
            <mat-card-title>{{ project.title }}</mat-card-title>
            <mat-card-subtitle>
              Manager: {{ getManagerName(project.managerId) }}
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <p class="description">{{ project.description }}</p>
            
            <div class="project-meta">
              <div class="dates">
                <div class="date-item">
                  <mat-icon>calendar_today</mat-icon>
                  <span>Start: {{ project.startDate | date:'shortDate' }}</span>
                </div>
                <div class="date-item">
                  <mat-icon>event</mat-icon>
                  <span>End: {{ project.endDate | date:'shortDate' }}</span>
                </div>
              </div>

              <mat-chip-set>
                <mat-chip [ngClass]="project.status">
                  {{ project.status | titlecase }}
                </mat-chip>
              </mat-chip-set>
            </div>

            <div class="task-stats">
              <span class="stat">
                <mat-icon>assignment</mat-icon>
                <strong>{{ getTaskCount(project.id) }}</strong> total tasks
              </span>
              <span class="stat">
                <mat-icon>schedule</mat-icon>
                <strong>{{ getTaskCountByStatus(project.id, 'Not Started') }}</strong> not started
              </span>
              <span class="stat">
                <mat-icon>play_circle</mat-icon>
                <strong>{{ getTaskCountByStatus(project.id, 'In Progress') }}</strong> in progress
              </span>
              <span class="stat">
                <mat-icon>check_circle</mat-icon>
                <strong>{{ getTaskCountByStatus(project.id, 'Completed') }}</strong> completed
              </span>
            </div>
          </mat-card-content>

          <mat-card-actions align="end">
            <button 
              mat-button 
              color="primary" 
              (click)="viewProjectTasks(project.id)"
              class="view-tasks-btn">
              <mat-icon>visibility</mat-icon> View Tasks
            </button>
            
            <button 
              mat-button 
              color="accent" 
              *ngIf="canManageProject(project)"
              (click)="manageProjectTasks(project)"
              class="manage-tasks-btn">
              <mat-icon>build</mat-icon> Manage Tasks
            </button>
            
            <button 
              mat-icon-button 
              color="accent" 
              *ngIf="canManageProject(project)"
              (click)="editProject(project)">
              <mat-icon>edit</mat-icon>
            </button>
            
            <button 
              mat-icon-button 
              color="warn" 
              *ngIf="canManageProject(project)"
              (click)="deleteProject(project.id)">
              <mat-icon>delete</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div class="empty-state" *ngIf="projects().length === 0">
        <mat-icon class="empty-icon">folder_open</mat-icon>
        <h2>No Projects Yet</h2>
        <p>Create your first project to get started!</p>
        <button 
          *ngIf="isManager()" 
          mat-raised-button 
          color="primary" 
          (click)="openProjectForm()">
          Create Project
        </button>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    h1 {
      color: #3f51b5;
      margin: 0;
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .project-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      }
    }

    .description {
      color: #666;
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    .project-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .dates {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .date-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #666;
    }

    .date-item mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .task-stats {
      display: flex;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.85rem;
      color: #666;
    }

    mat-card-actions {
      border-top: 1px solid #eee;
      padding-top: 0.5rem;
    }

    /* Status chip colors */
    ::ng-deep .mat-mdc-chip.active {
      background: #e3f2fd !important;
      color: #1976d2 !important;
    }

    ::ng-deep .mat-mdc-chip.completed {
      background: #e8f5e9 !important;
      color: #388e3c !important;
    }

    ::ng-deep .mat-mdc-chip.on-hold {
      background: #fff3e0 !important;
      color: #f57c00 !important;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }

    .empty-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #bdbdbd;
      margin-bottom: 1rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      .projects-grid {
        grid-template-columns: 1fr;
      }

      .project-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      mat-card-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      mat-card-actions button {
        width: 100%;
      }
    }
  `]
})
export class ProjectListComponent {
  projects = computed(() => this.projectService.projects());
  isManager = computed(() => this.authService.isManager());

  constructor(
    private projectService: ProjectService,
    private taskService: TaskService,
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  getManagerName(managerId: string): string {
    const managers: Record<string, string> = {
      'user-1': 'Sarah Johnson',
    };
    return managers[managerId] || 'Unknown Manager';
  }

  getTaskCount(projectId: string): number {
    return this.taskService.tasks().filter((task: any) => task.projectId === projectId).length;
  }

  getTaskCountByStatus(projectId: string, status: string): number {
    return this.taskService.tasks().filter(
      (task: any) => task.projectId === projectId && task.status === status
    ).length;
  }

  canManageProject(project: any): boolean {
    return this.projectService.canManageProject(project);
  }

  openProjectForm(): void {
    import('./project-form.component').then(m => {
      const dialogRef = this.dialog.open(m.ProjectFormComponent, {
        width: '600px',
        maxHeight: '90vh',
        data: null,
        autoFocus: false,
        restoreFocus: false,
        disableClose: false,
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.projectService.createProject(result);
        }
      });
    });
  }

  editProject(project: Project): void {
    import('./project-form.component').then(m => {
      const dialogRef = this.dialog.open(m.ProjectFormComponent, {
        width: '600px',
        maxHeight: '90vh',
        data: project,
        autoFocus: false,
        restoreFocus: false,
        disableClose: false,
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.projectService.updateProject(project.id, result);
        }
      });
    });
  }

  deleteProject(projectId: string): void {
    if (confirm('Are you sure you want to delete this project? All tasks will also be deleted.')) {
      this.projectService.deleteProject(projectId);
    }
  }

  viewProjectTasks(projectId: string): void {
    console.log('Navigating to tasks for project:', projectId);
    this.router.navigate(['/projects', projectId, 'tasks']);
  }

  manageProjectTasks(project: Project): void {
    console.log('Managing tasks for project:', project.title);
    this.projectService.setCurrentProject(project);
    this.router.navigate(['/projects', project.id, 'tasks']);
  }
}