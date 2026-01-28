import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TaskService } from '../../core/services/task.service';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';
import { Task } from '../../core/models/project.model';

@Component({
  selector: 'app-project-tasks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
  ],
  template: `
    <div class="container">
      <div class="header">
        <button mat-icon-button (click)="goBack()" class="back-btn">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ project?.title || 'Project Tasks' }}</h1>
        <button 
          *ngIf="isManager()" 
          mat-raised-button 
          color="primary" 
          (click)="openTaskForm()"
          class="create-btn">
          <mat-icon>add</mat-icon> Create Task
        </button>
      </div>

      <!-- Project Info Card -->
      <mat-card class="project-info-card" *ngIf="project">
        <mat-card-header>
          <mat-icon mat-card-avatar>folder</mat-icon>
          <mat-card-title>{{ project.title }}</mat-card-title>
          <mat-card-subtitle>{{ project.description }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="project-meta">
            <div class="dates">
              <span><mat-icon>calendar_today</mat-icon> Start: {{ project.startDate | date:'shortDate' }}</span>
              <span><mat-icon>event</mat-icon> End: {{ project.endDate | date:'shortDate' }}</span>
            </div>
            <mat-chip [ngClass]="project.status">{{ project.status | titlecase }}</mat-chip>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Task Statistics -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>assignment</mat-icon>
            <mat-card-title>Total Tasks</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-number">{{ getTotalTaskCount() }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>schedule</mat-icon>
            <mat-card-title>Not Started</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-number">{{ getTasksByStatus('Not Started') }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>play_circle</mat-icon>
            <mat-card-title>In Progress</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-number">{{ getTasksByStatus('In Progress') }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>check_circle</mat-icon>
            <mat-card-title>Completed</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-number">{{ getTasksByStatus('Completed') }}</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Task Filters -->
      <div class="filters-card">
        <h3>Filter Tasks</h3>
        <div class="filter-row">
          <mat-form-field appearance="outline">
            <mat-label>Search Tasks</mat-label>
            <input 
              matInput 
              [(ngModel)]="searchTerm" 
              placeholder="Search by title or description">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="statusFilter">
              <mat-option [value]="null">All Statuses</mat-option>
              <mat-option value="Not Started">Not Started</mat-option>
              <mat-option value="In Progress">In Progress</mat-option>
              <mat-option value="Completed">Completed</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Priority</mat-label>
            <mat-select [(ngModel)]="priorityFilter">
              <mat-option [value]="null">All Priorities</mat-option>
              <mat-option value="low">Low</mat-option>
              <mat-option value="medium">Medium</mat-option>
              <mat-option value="high">High</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-raised-button color="accent" (click)="clearFilters()">
            <mat-icon>clear</mat-icon> Clear
          </button>
        </div>
      </div>

      <!-- Tasks List -->
      <div class="tasks-grid">
        <mat-card *ngFor="let task of filteredTasks" class="task-card">
          <mat-card-header>
            <mat-icon 
              mat-card-avatar 
              [ngClass]="getPriorityClass(task.priority)">
              {{ getPriorityIcon(task.priority) }}
            </mat-icon>
            <mat-card-title>{{ task.title }}</mat-card-title>
            <mat-card-subtitle>
              Assigned to: {{ task.assigneeName }} | Due: {{ task.dueDate | date:'shortDate' }}
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <p class="description">{{ task.description }}</p>

            <div class="task-meta">
              <mat-chip-set>
                <mat-chip [ngClass]="task.status">
                  {{ task.status }}
                </mat-chip>
                <mat-chip [ngClass]="task.priority">
                  {{ task.priority | titlecase }} Priority
                </mat-chip>
              </mat-chip-set>

              <div class="due-date">
                <mat-icon>calendar_today</mat-icon>
                <span [ngClass]="{'overdue': isOverdue(task)}">
                  Due: {{ task.dueDate | date:'shortDate' }}
                </span>
              </div>
            </div>
          </mat-card-content>

          <mat-card-actions align="end">
            <button 
              mat-stroked-button 
              *ngIf="task.status !== 'Not Started'"
              (click)="updateTaskStatus(task.id, 'Not Started')">
              Reset
            </button>
            <button 
              mat-stroked-button 
              *ngIf="task.status !== 'In Progress'"
              (click)="updateTaskStatus(task.id, 'In Progress')">
              Start
            </button>
            <button 
              mat-raised-button 
              color="primary"
              *ngIf="task.status !== 'Completed'"
              (click)="updateTaskStatus(task.id, 'Completed')">
              <mat-icon>check</mat-icon> Complete
            </button>

            <button 
              mat-icon-button 
              color="accent"
              *ngIf="canEditTask(task)"
              (click)="editTask(task)">
              <mat-icon>edit</mat-icon>
            </button>
            <button 
              mat-icon-button 
              color="warn"
              *ngIf="canDeleteTask(task)"
              (click)="deleteTask(task.id)">
              <mat-icon>delete</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="filteredTasks.length === 0">
        <mat-icon class="empty-icon">assignment</mat-icon>
        <h2>No Tasks Found</h2>
        <p *ngIf="searchTerm || statusFilter || priorityFilter">
          Try adjusting your filters.
        </p>
        <p *ngIf="!searchTerm && !statusFilter && !priorityFilter">
          No tasks have been created for this project yet.
        </p>
        <button 
          *ngIf="isManager()" 
          mat-raised-button 
          color="primary" 
          (click)="openTaskForm()">
          Create First Task
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

    .back-btn {
      margin-right: 1rem;
    }

    .create-btn {
      margin-left: auto;
    }

    .project-info-card {
      margin-bottom: 2rem;
      border-left: 4px solid #3f51b5;
    }

    .project-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .dates {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .dates span {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .filters-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .filter-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      align-items: end;
    }

    .tasks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .task-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transition: transform 0.2s;

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

    .task-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .due-date {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.85rem;
    }

    .due-date .overdue {
      color: #f44336;
      font-weight: bold;
    }

    mat-card-actions {
      border-top: 1px solid #eee;
      padding-top: 0.5rem;
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

      .filter-row {
        grid-template-columns: 1fr;
      }

      .tasks-grid {
        grid-template-columns: 1fr;
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
export class ProjectTasksComponent implements OnInit {
  project: any = null;
  projectId: string = '';
  searchTerm = '';
  statusFilter: string | null = null;
  priorityFilter: string | null = null;
  filteredTasks: Task[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private projectService: ProjectService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.projectId = params['id'];
      console.log('Loading tasks for project:', this.projectId);
      this.loadProjectAndTasks();
    });
  }

  loadProjectAndTasks(): void {
    this.projectService.getProject(this.projectId).subscribe(project => {
      this.project = project;
      console.log('Project loaded:', this.project);
    });

    this.updateFilteredTasks();
  }

  updateFilteredTasks(): void {
    let tasks = this.taskService.tasks().filter((task: Task) => task.projectId === this.projectId);
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      tasks = tasks.filter((t: Task) => 
        t.title.toLowerCase().includes(term) || 
        t.description.toLowerCase().includes(term)
      );
    }
    
    if (this.statusFilter) {
      tasks = tasks.filter((t: Task) => t.status === this.statusFilter);
    }
    
    if (this.priorityFilter) {
      tasks = tasks.filter((t: Task) => t.priority === this.priorityFilter);
    }
    
    this.filteredTasks = tasks;
  }

  getTotalTaskCount(): number {
    return this.taskService.tasks().filter((task: Task) => task.projectId === this.projectId).length;
  }

  getTasksByStatus(status: string): number {
    return this.taskService.tasks().filter((task: Task) => 
      task.projectId === this.projectId && task.status === status
    ).length;
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority}`;
  }

  getPriorityIcon(priority: string): string {
    const icons = {
      high: 'error',
      medium: 'warning',
      low: 'info',
    };
    return icons[priority as keyof typeof icons];
  }

  isOverdue(task: Task): boolean {
    return task.status !== 'Completed' && new Date(task.dueDate) < new Date();
  }

  canEditTask(task: Task): boolean {
    return this.authService.isManager() || task.assigneeId === this.authService.currentUser()?.id;
  }

  canDeleteTask(task: Task): boolean {
    return this.authService.isManager();
  }

  isManager(): boolean {
    return this.authService.isManager();
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }

  openTaskForm(): void {
    import('../tasks/task-form.component').then(m => {
      const dialogRef = this.dialog.open(m.TaskFormComponent, {
        width: '700px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        data: { 
          projectId: this.projectId,
          projectTitle: this.project?.title 
        },
        autoFocus: false,
        restoreFocus: false,
        disableClose: false,
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          this.taskService.createTask(result);
          this.updateFilteredTasks();
        }
      });
    });
  }

  updateTaskStatus(taskId: string, status: Task['status']): void {
    this.taskService.updateTaskStatus(taskId, status);
    this.updateFilteredTasks();
  }

  editTask(task: Task): void {
    import('../tasks/task-form.component').then(m => {
      const dialogRef = this.dialog.open(m.TaskFormComponent, {
        width: '700px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        data: task,
        autoFocus: false,
        restoreFocus: false,
        disableClose: false,
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          this.taskService.updateTask(task.id, result);
          this.updateFilteredTasks();
        }
      });
    });
  }

  deleteTask(taskId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId);
      this.updateFilteredTasks();
    }
  }

  clearFilters(): void {
    console.log('Clearing filters...');
    this.searchTerm = '';
    this.statusFilter = null;
    this.priorityFilter = null;
    this.updateFilteredTasks();
  }
}