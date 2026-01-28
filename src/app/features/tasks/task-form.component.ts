import { Component, Inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { Task, User } from '../../core/models/project.model';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ isEditMode ? 'Edit Task' : 'Create New Task' }}
    </h2>

    <mat-dialog-content>
      <form #taskForm="ngForm" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Task Title</mat-label>
          <input 
            matInput 
            [(ngModel)]="task.title" 
            name="title"
            required
            placeholder="Enter task title">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea 
            matInput 
            [(ngModel)]="task.description" 
            name="description"
            rows="4"
            required
            placeholder="Describe what needs to be done"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Project</mat-label>
          <mat-select [(ngModel)]="task.projectId" name="projectId" required>
            <mat-option *ngFor="let project of projects()" [value]="project.id">
              {{ project.title }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <div class="dual-row">
          <mat-form-field appearance="outline">
            <mat-label>Priority</mat-label>
            <mat-select [(ngModel)]="task.priority" name="priority" required>
              <mat-option value="low">Low</mat-option>
              <mat-option value="medium">Medium</mat-option>
              <mat-option value="high">High</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="task.status" name="status" required>
              <mat-option value="Not Started">Not Started</mat-option>
              <mat-option value="In Progress">In Progress</mat-option>
              <mat-option value="Completed">Completed</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Assigned To</mat-label>
          <mat-select [(ngModel)]="task.assigneeId" name="assigneeId" required>
            <mat-option *ngFor="let user of teamMembers()" [value]="user.id">
              {{ user.name }} ({{ user.role }})
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Due Date</mat-label>
          <input 
            matInput 
            [matDatepicker]="duePicker"
            [(ngModel)]="task.dueDate" 
            name="dueDate"
            required>
          <mat-datepicker-toggle matSuffix [for]="duePicker"></mat-datepicker-toggle>
          <mat-datepicker #duePicker></mat-datepicker>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button 
        mat-raised-button 
        color="primary"
        [disabled]="!taskForm.form.valid"
        (click)="saveTask()">
        {{ isEditMode ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      margin: 0;
      color: #3f51b5;
    }

    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem 0;
      min-width: 500px;
    }

    .full-width {
      width: 100%;
    }

    .dual-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    mat-form-field {
      width: 100%;
    }

    mat-dialog-actions {
      padding: 1rem;
      border-top: 1px solid #eee;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .form-grid {
        min-width: auto;
        width: 90vw;
      }

      .dual-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TaskFormComponent implements OnInit {
  task: any = {
    title: '',
    description: '',
    projectId: '',
    priority: 'medium',
    status: 'Not Started',
    assigneeId: '',
    assigneeName: '',
    dueDate: new Date(),
  };
  isEditMode = false;

  projects = computed(() => this.projectService.projects());
  teamMembers = computed(() => {
  return [
    { id: 'user-1', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'manager' },
    { id: 'user-2', name: 'Mike Chen', email: 'mike@company.com', role: 'team-member' },
    { id: 'user-3', name: 'Emily Davis', email: 'emily@company.com', role: 'team-member' },
  ];
});

  constructor(
    private dialogRef: MatDialogRef<TaskFormComponent>,
    @Inject(MAT_DIALOG_DATA) private data: Task | null,
    private projectService: ProjectService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.isEditMode = true;
      this.task = { ...this.data };
      this.task.dueDate = new Date(this.data.dueDate);
    } else {
      this.task.dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
  }

  saveTask(): void {
    if (!this.task.title || !this.task.description || !this.task.projectId || 
        !this.task.assigneeId || !this.task.dueDate) {
      alert('Please fill in all required fields!');
      return;
    }

    const assignee = this.teamMembers().find(u => u.id === this.task.assigneeId);
  }
}