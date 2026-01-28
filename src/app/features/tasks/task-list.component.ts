import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { Task } from '../../core/models/project.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatDialogModule,
    MatButtonToggleModule,
    RouterModule,
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Task Management</h1>
        <button 
          *ngIf="isManager()" 
          mat-raised-button 
          color="primary" 
          (click)="openTaskForm()">
          <mat-icon>add</mat-icon> Create New Task
        </button>
      </div>

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

      <div class="view-toggle" *ngIf="!isManager()">
        <mat-button-toggle-group [(ngModel)]="showOnlyMyTasks">
          <mat-button-toggle [value]="true">My Tasks Only</mat-button-toggle>
          <mat-button-toggle [value]="false">All Tasks</mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      <div class="tasks-grid">
        <mat-card *ngFor="let task of filteredTasks()" class="task-card">
          <mat-card-header>
            <mat-icon 
              mat-card-avatar 
              [ngClass]="getPriorityClass(task.priority)">
              {{ getPriorityIcon(task.priority) }}
            </mat-icon>
            <mat-card-title>{{ task.title }}</mat-card-title>
            <mat-card-subtitle>
              Project: {{ getProjectName(task.projectId) }} | 
              Assigned to: {{ task.assigneeName }}
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

      <div class="empty-state" *ngIf="filteredTasks().length === 0">
        <mat-icon class="empty-icon">assignment</mat-icon>
        <h2>No Tasks Found</h2>
        <p *ngIf="searchTerm || statusFilter || priorityFilter">
          Try adjusting your filters.
        </p>
        <p *ngIf="!searchTerm && !statusFilter && !priorityFilter">
          No tasks have been created yet.
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

    h1 {
      color: #3f51b5;
      margin: 0;
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

    .view-toggle {
      margin-bottom: 1rem;
      text-align: center;
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

    .priority-high {
      color: #f44336;
    }

    .priority-medium {
      color: #ff9800;
    }

    .priority-low {
      color: #4caf50;
    }

    ::ng-deep .mat-mdc-chip.Not\ Started {
      background: #e3f2fd !important;
      color: #1976d2 !important;
    }

    ::ng-deep .mat-mdc-chip.In\ Progress {
      background: #fff3e0 !important;
      color: #f57c00 !important;
    }

    ::ng-deep .mat-mdc-chip.Completed {
      background: #e8f5e9 !important;
      color: #388e3c !important;
    }

    ::ng-deep .mat-mdc-chip.high {
      background: #ffcdd2 !important;
      color: #c62828 !important;
    }

    ::ng-deep .mat-mdc-chip.medium {
      background: #ffe0b2 !important;
      color: #ef6c00 !important;
    }

    ::ng-deep .mat-mdc-chip.low {
      background: #c8e6c9 !important;
      color: #2e7d32 !important;
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
export class TaskListComponent {
  searchTerm = signal('');
  statusFilter = signal<string | null>(null);
  priorityFilter = signal<string | null>(null);
  showOnlyMyTasks = signal(false);

  filteredTasks = computed(() => {
    let tasks = this.showOnlyMyTasks() ? this.taskService.myTasks() : this.taskService.tasks();
    
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      tasks = tasks.filter(t => 
        t.title.toLowerCase().includes(term) || 
        t.description.toLowerCase().includes(term)
      );
    }

    if (this.statusFilter()) {
      tasks = tasks.filter(t => t.status === this.statusFilter());
    }

    if (this.priorityFilter()) {
      tasks = tasks.filter(t => t.priority === this.priorityFilter());
    }

    return tasks;
  });

  isManager = computed(() => this.authService.isManager());

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  getProjectName(projectId: string): string {
    const projects: Record<string, string> = {
      'project-1': 'Website Redesign',
      'project-2': 'Mobile App Development',
    };
    return projects[projectId] || 'Unknown Project';
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
    return this.isManager() || task.assigneeId === this.authService.currentUser()?.id;
  }

  canDeleteTask(task: Task): boolean {
    return this.isManager();
  }

  openTaskForm(): void {
    import('./task-form.component').then(({ TaskFormComponent }) => {
      const dialogRef = this.dialog.open(TaskFormComponent, {
        width: '700px',
        maxWidth: '90vw',
        data: null,
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.taskService.createTask(result);
        }
      });
    });
  }

  editTask(task: Task): void {
    import('./task-form.component').then(({ TaskFormComponent }) => {
      const dialogRef = this.dialog.open(TaskFormComponent, {
        width: '700px',
        maxWidth: '90vw',
        data: task,
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.taskService.updateTask(task.id, result);
        }
      });
    });
  }

  deleteTask(taskId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId);
    }
  }

  updateTaskStatus(taskId: string, status: Task['status']): void {
    this.taskService.updateTaskStatus(taskId, status);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set(null);
    this.priorityFilter.set(null);
  }
}