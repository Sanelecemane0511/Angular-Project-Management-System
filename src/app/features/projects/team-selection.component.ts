import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TeamMember } from '../../core/models/project.model';

@Component({
  selector: 'app-team-selection',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatCheckboxModule,
    MatProgressBarModule,
  ],
  template: `
    <div class="team-selection-container">
      <h3>Team Assignment</h3>
      
      <!-- Team Size Info -->
      <div class="team-size-info">
        <span>Team Size: {{ selectedMembers.length }} / {{ maxTeamSize }}</span>
        <mat-progress-bar 
          mode="determinate" 
          [value]="(selectedMembers.length / maxTeamSize) * 100">
        </mat-progress-bar>
      </div>

      <!-- Available Team Members -->
      <div class="available-members">
        <h4>Available Team Members</h4>
        <mat-selection-list 
          [(ngModel)]="selectedMembers" 
          (ngModelChange)="onSelectionChange()">
          
          <mat-list-option 
            *ngFor="let member of availableMembers" 
            [value]="member"
            [disabled]="isMemberSelected(member) || selectedMembers.length >= maxTeamSize">
            
            <div class="member-option">
              <div class="member-info">
                <strong>{{ member.name }}</strong>
                <span class="member-role">{{ member.role }}</span>
                <span class="member-email">{{ member.email }}</span>
              </div>
              <div class="member-status">
                <mat-chip [color]="getRoleColor(member.role)">
                  {{ member.role }}
                </mat-chip>
              </div>
            </div>
          </mat-list-option>
        </mat-selection-list>
      </div>

      <!-- Selected Team Members -->
      <div class="selected-members" *ngIf="selectedMembers.length > 0">
        <h4>Selected Team Members</h4>
        <div class="chip-container">
          <mat-chip 
            *ngFor="let member of selectedMembers" 
            [removable]="true"
            (removed)="removeMember(member)"
            [color]="getRoleColor(member.role)">
            {{ member.name }}
            <mat-icon matChipRemove>cancel</mat-icon>
          </mat-chip>
        </div>
      </div>

      <!-- Permissions Section -->
      <div class="permissions-section" *ngIf="selectedMembers.length > 0">
        <h4>Team Permissions</h4>
        <div class="permissions-grid">
          <mat-checkbox 
            *ngFor="let permission of availablePermissions" 
            [(ngModel)]="selectedPermissions[permission.value]"
            (change)="onPermissionChange()">
            {{ permission.label }}
          </mat-checkbox>
        </div>
      </div>

      <!-- Validation Messages -->
      <div class="validation-messages" *ngIf="selectedMembers.length === 0">
        <mat-icon color="warn">warning</mat-icon>
        <span>Please select at least one team member</span>
      </div>
    </div>
  `,
  styles: [`
    .team-selection-container {
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      margin-top: 16px;
    }

    h3, h4 {
      margin: 0 0 16px 0;
      color: #3f51b5;
    }

    .team-size-info {
      margin-bottom: 16px;
      text-align: center;
    }

    .available-members, .selected-members {
      margin-bottom: 24px;
    }

    .member-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .member-info {
      display: flex;
      flex-direction: column;
    }

    .member-info strong {
      font-size: 14px;
    }

    .member-role {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }

    .member-email {
      font-size: 12px;
      color: #999;
    }

    .permissions-section {
      background: white;
      padding: 16px;
      border-radius: 8px;
      margin-top: 16px;
    }

    .permissions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-top: 12px;
    }

    .validation-messages {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f44336;
      margin-top: 16px;
    }

    mat-progress-bar {
      margin: 8px 0;
    }

    mat-chip {
      font-size: 12px;
    }

    .chip-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    /* Role colors */
    ::ng-deep .mat-mdc-chip.manager {
      background: #e3f2fd !important;
      color: #1976d2 !important;
    }

    ::ng-deep .mat-mdc-chip.team-member {
      background: #e8f5e9 !important;
      color: #388e3c !important;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .permissions-grid {
        grid-template-columns: 1fr;
      }
      
      .member-option {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `]
})
export class TeamSelectionComponent {
  @Input() availableMembers: TeamMember[] = [];
  @Input() selectedMembers: TeamMember[] = [];
  @Input() maxTeamSize: number = 5;
  @Output() teamChange = new EventEmitter<TeamMember[]>();

  availablePermissions = [
    { value: 'create-tasks', label: 'Create Tasks' },
    { value: 'edit-tasks', label: 'Edit Tasks' },
    { value: 'delete-tasks', label: 'Delete Tasks' },
    { value: 'assign-tasks', label: 'Assign Tasks' },
    { value: 'manage-team', label: 'Manage Team' },
  ];

  selectedPermissions: Record<string, boolean> = {};

  ngOnInit(): void {
    this.updatePermissions();
  }

  onSelectionChange(): void {
    this.teamChange.emit(this.selectedMembers);
    this.updatePermissions();
  }

  onPermissionChange(): void {
    this.selectedMembers.forEach(member => {
      member.permissions = Object.keys(this.selectedPermissions)
        .filter(key => this.selectedPermissions[key]);
    });
  }

  removeMember(member: TeamMember): void {
    const index = this.selectedMembers.indexOf(member);
    if (index > -1) {
      this.selectedMembers.splice(index, 1);
      this.teamChange.emit(this.selectedMembers);
      this.updatePermissions();
    }
  }

  isMemberSelected(member: TeamMember): boolean {
    return this.selectedMembers.some(m => m.id === member.id);
  }

  getRoleColor(role: string): string {
    return role === 'manager' ? 'primary' : 'accent';
  }

  private updatePermissions(): void {
    this.selectedPermissions = {};
    
    this.availablePermissions.forEach(permission => {
      const hasPermission = this.selectedMembers.some(member => 
        member.permissions.includes(permission.value)
      );
      this.selectedPermissions[permission.value] = hasPermission;
    });
  }
}