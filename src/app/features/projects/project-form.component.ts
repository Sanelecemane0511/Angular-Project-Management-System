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
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Project } from '../../core/models/project.model';
import { AuthService } from '../../core/services/auth.service';
import { ProjectService } from '../../core/services/project.service';

@Component({
  selector: 'app-project-form',
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
    MatIconModule,
    MatProgressBarModule,
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title class="dialog-title">
        {{ isEditMode ? 'Edit Project' : 'Create New Project' }}
      </h2>

      <mat-dialog-content class="dialog-content">
        <form #projectForm="ngForm" class="project-form">
          
          <!-- Project Title -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Project Title *</mat-label>
            <input 
              matInput 
              [(ngModel)]="project.title" 
              name="title"
              required
              minlength="3"
              maxlength="100"
              placeholder="Enter project title (e.g., Website Redesign)">
            <mat-hint align="end">{{ project.title.length }}/100</mat-hint>
            <mat-error *ngIf="projectForm.submitted && !project.title">
              Title is required
            </mat-error>
            <mat-error *ngIf="project.title && project.title.length < 3">
              Title must be at least 3 characters
            </mat-error>
          </mat-form-field>

          <!-- Description -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Project Description *</mat-label>
            <textarea 
              matInput 
              [(ngModel)]="project.description" 
              name="description"
              rows="4"
              required
              minlength="10"
              maxlength="500"
              placeholder="Describe project objectives, scope, and expected outcomes"></textarea>
            <mat-hint align="end">{{ project.description.length }}/500</mat-hint>
            <mat-error *ngIf="projectForm.submitted && !project.description">
              Description is required
            </mat-error>
            <mat-error *ngIf="project.description && project.description.length < 10">
              Description must be at least 10 characters
            </mat-error>
          </mat-form-field>

          <!-- Date Row -->
          <div class="date-row">
            <mat-form-field appearance="outline">
              <mat-label>Start Date *</mat-label>
              <input 
                matInput 
                [matDatepicker]="startPicker"
                [(ngModel)]="project.startDate" 
                name="startDate"
                required
                [min]="minDate"
                [max]="project.endDate">
              <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
              <mat-error *ngIf="projectForm.submitted && !project.startDate">
                Start date is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>End Date *</mat-label>
              <input 
                matInput 
                [matDatepicker]="endPicker"
                [(ngModel)]="project.endDate" 
                name="endDate"
                required
                [min]="project.startDate">
              <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
              <mat-error *ngIf="projectForm.submitted && !project.endDate">
                End date is required
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Status -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Project Status *</mat-label>
            <mat-select [(ngModel)]="project.status" name="status" required>
              <mat-option value="active">
                <mat-icon color="primary">play_circle</mat-icon> Active
              </mat-option>
              <mat-option value="completed">
                <mat-icon color="accent">check_circle</mat-icon> Completed
              </mat-option>
              <mat-option value="on-hold">
                <mat-icon color="warn">pause_circle</mat-icon> On Hold
              </mat-option>
            </mat-select>
            <mat-error *ngIf="projectForm.submitted && !project.status">
              Status is required
            </mat-error>
          </mat-form-field>

          <!-- Progress Indicator -->
          <div class="progress-section">
            <h4>Form Progress</h4>
            <mat-progress-bar 
              mode="determinate" 
              [value]="formProgress()">
            </mat-progress-bar>
            <span class="progress-text">{{ formProgress() }}% Complete</span>
          </div>

        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button mat-dialog-close type="button">
          <mat-icon>close</mat-icon> Cancel
        </button>
        <button 
          mat-raised-button 
          color="primary"
          type="button"
          [disabled]="!projectForm.form.valid"
          (click)="saveProject()">
          <mat-icon>{{ isEditMode ? 'save' : 'add' }}</mat-icon>
          {{ isEditMode ? 'Update Project' : 'Create Project' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 0;
      background: #fafafa;
    }

    .dialog-title {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      margin: 0;
      padding: 20px;
      font-size: 1.3rem;
      font-weight: 500;
    }

    .dialog-content {
      padding: 24px;
      background: white;
      max-height: 70vh;
      overflow-y: auto;
    }

    .dialog-actions {
      padding: 16px 24px;
      background: #f5f5f5;
      border-top: 1px solid #e0e0e0;
    }

    .project-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .date-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .progress-section {
      margin-top: 20px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .progress-text {
      display: block;
      text-align: center;
      margin-top: 8px;
      font-weight: 500;
      color: #666;
    }

    mat-icon {
      margin-right: 8px;
      vertical-align: middle;
    }

    mat-form-field {
      width: 100%;
    }

    mat-error {
      font-size: 12px;
      margin-top: 4px;
    }

    mat-hint {
      font-size: 12px;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .date-row {
        grid-template-columns: 1fr;
      }
      
      .dialog-content {
        padding: 16px;
      }
      
      .dialog-actions {
        flex-direction: column;
        gap: 8px;
      }

      .dialog-actions button {
        width: 100%;
      }
    }

    /* Custom scrollbar for dialog content */
    .dialog-content::-webkit-scrollbar {
      width: 6px;
    }

    .dialog-content::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .dialog-content::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }
  `]
})
export class ProjectFormComponent implements OnInit {
  project: any = {
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    status: 'active',
    teamMembers: [],
    teamSize: 0,
    maxTeamSize: 8,
  };
  isEditMode = false;
  minDate = new Date();
  availableTeamMembers: any[] = [];
  selectedTeamMembers: any[] = [];
  maxTeamSize: number = 8;

  projects = computed(() => this.projectService.projects());
  formProgress = computed(() => {
    let progress = 0;
    if (this.project.title?.length >= 3) progress += 25;
    if (this.project.description?.length >= 10) progress += 25;
    if (this.project.startDate && this.project.endDate) progress += 25;
    if (this.project.status) progress += 25;
    return progress;
  });

  constructor(
    private dialogRef: MatDialogRef<ProjectFormComponent>,
    @Inject(MAT_DIALOG_DATA) private data: Project | null,
    private authService: AuthService,
    private projectService: ProjectService
  ) {
    this.availableTeamMembers = [
      { id: 'user-2', name: 'Mike Chen', email: 'mike@company.com', role: 'team-member' },
      { id: 'user-3', name: 'Emily Davis', email: 'emily@company.com', role: 'team-member' },
      { id: 'user-4', name: 'David Wilson', email: 'david@company.com', role: 'team-member' },
      { id: 'user-5', name: 'Sarah Brown', email: 'sarah@company.com', role: 'team-member' },
    ];
  }

  ngOnInit(): void {
    if (this.data) {
      this.isEditMode = true;
      this.project = { ...this.data };
      this.project.startDate = new Date(this.data.startDate);
      this.project.endDate = new Date(this.data.endDate);
      this.selectedTeamMembers = [...(this.data.teamMembers || [])];
      this.maxTeamSize = this.data.maxTeamSize || 8;
    } else {
      this.project.startDate = new Date();
      this.project.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      this.maxTeamSize = 8;
      this.selectedTeamMembers = [];
    }
  }

  onTeamChange(selectedMembers: any[]): void {
    this.selectedTeamMembers = selectedMembers;
    this.project.teamMembers = selectedMembers;
    this.project.teamSize = selectedMembers.length;
  }

  saveProject(): void {
    console.log('Saving project:', this.project);
    
    if (this.project.startDate > this.project.endDate) {
      alert('End date must be after start date!');
      return;
    }

    if (!this.isEditMode) {
      this.project.managerId = this.authService.currentUser()?.id || 'user-1';
    }

    this.project.teamMembers = this.selectedTeamMembers;
    this.project.teamSize = this.selectedTeamMembers.length;
    this.project.maxTeamSize = this.maxTeamSize;

    console.log('Project validated and ready:', this.project);
    this.dialogRef.close(this.project);
  }
}