import { Component, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../core/services/task.service';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
  ],
  template: `
    <div class="dashboard-container">
      <h1>Project Management Dashboard</h1>
      
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>folder</mat-icon>
            <mat-card-title>Total Projects</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-number">{{ projectCount() }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>task</mat-icon>
            <mat-card-title>Total Tasks</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-number">{{ stats().total }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card overdue">
          <mat-card-header>
            <mat-icon mat-card-avatar>warning</mat-icon>
            <mat-card-title>Overdue Tasks</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-number warning">{{ stats().overdue }}</div>
            <div class="stat-label">Need attention!</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card completed">
          <mat-card-header>
            <mat-icon mat-card-avatar>check_circle</mat-icon>
            <mat-card-title>Completed Tasks</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-number success">{{ stats().completed }}</div>
            <div class="stat-label">Great job!</div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="status-breakdown">
        <h2>Task Status Breakdown</h2>
        <div class="status-grid">
          <div class="status-item not-started">
            <div class="status-count">{{ stats().notStarted }}</div>
            <div class="status-label">Not Started</div>
          </div>
          <div class="status-item in-progress">
            <div class="status-count">{{ stats().inProgress }}</div>
            <div class="status-label">In Progress</div>
          </div>
          <div class="status-item completed">
            <div class="status-count">{{ stats().completed }}</div>
            <div class="status-label">Completed</div>
          </div>
        </div>
      </div>

      <div class="overdue-section" *ngIf="overdueTasks().length > 0">
        <h2>⚠️ Overdue Tasks Requiring Attention</h2>
        <div class="overdue-list">
          <mat-card *ngFor="let task of overdueTasks()" class="overdue-item">
            <mat-card-content>
              <h3>{{ task.title }}</h3>
              <p>{{ task.description }}</p>
              <div class="task-meta">
                <span class="assignee">Assigned to: {{ task.assigneeName }}</span>
                <span class="due-date">Due: {{ task.dueDate | date:'shortDate' }}</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <div class="actions-section" *ngIf="isManager()">
        <h2>Quick Actions</h2>
        <div class="action-buttons">
          <button mat-raised-button color="primary" routerLink="/projects/new">
            <mat-icon>add</mat-icon> Create New Project
          </button>
          <button mat-raised-button color="accent" routerLink="/projects">
            <mat-icon>folder_open</mat-icon> View All Projects
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    h1 {
      color: #3f51b5;
      margin-bottom: 2rem;
      font-size: 2rem;
    }

    h2 {
      color: #673ab7;
      margin: 2rem 0 1rem 0;
      font-size: 1.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.15);
      }
    }

    .stat-card.overdue {
      border-left: 4px solid #f44336;
    }

    .stat-card.completed {
      border-left: 4px solid #4caf50;
    }

    .stat-number {
      font-size: 3rem;
      font-weight: bold;
      color: #3f51b5;
      margin: 1rem 0;
    }

    .stat-number.warning {
      color: #f44336;
    }

    .stat-number.success {
      color: #4caf50;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #666;
      font-style: italic;
    }

    .status-breakdown {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-top: 1rem;
    }

    .status-item {
      text-align: center;
      padding: 1.5rem;
      border-radius: 8px;
      transition: transform 0.2s;

      &:hover {
        transform: scale(1.05);
      }
    }

    .status-item.not-started {
      background: linear-gradient(135deg, #e3f2fd, #bbdefb);
    }

    .status-item.in-progress {
      background: linear-gradient(135deg, #fff3e0, #ffe0b2);
    }

    .status-item.completed {
      background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
    }

    .status-count {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }

    .status-item.not-started .status-count {
      color: #1976d2;
    }

    .status-item.in-progress .status-count {
      color: #f57c00;
    }

    .status-item.completed .status-count {
      color: #388e3c;
    }

    .status-label {
      font-weight: 500;
      text-transform: uppercase;
      font-size: 0.8rem;
    }

    .overdue-section {
      margin-top: 2rem;
    }

    .overdue-list {
      display: grid;
      gap: 1rem;
    }

    .overdue-item {
      border-left: 4px solid #f44336;
    }

    .overdue-item h3 {
      margin: 0 0 0.5rem 0;
      color: #d32f2f;
    }

    .overdue-item p {
      margin: 0 0 1rem 0;
      color: #666;
    }

    .task-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: #999;
    }

    .actions-section {
      margin-top: 2rem;
      padding: 1.5rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .action-buttons button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    mat-icon {
      margin-right: 0.5rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .status-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }

      .action-buttons button {
        width: 100%;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  tasks = computed(() => this.taskService.tasks());
  projectCount = computed(() => this.projectService.projects().length);
  stats = computed(() => this.taskService.getTaskStats());
  overdueTasks = computed(() => this.taskService.getOverdueTasks());
  isManager = computed(() => this.authService.isManager());

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('Dashboard initialized');
  }
}