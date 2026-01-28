import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/project.model';

@Component({
  selector: 'app-team-management',
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
    MatDialogModule,
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Team Management</h1>
        <button 
          mat-raised-button 
          color="primary" 
          (click)="openAddMemberDialog()">
          <mat-icon>person_add</mat-icon> Add Team Member
        </button>
      </div>

      <!-- Team Members List -->
      <div class="team-grid">
        <mat-card *ngFor="let member of teamMembers" class="member-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>person</mat-icon>
            <mat-card-title>{{ member.name }}</mat-card-title>
            <mat-card-subtitle>{{ member.email }}</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <div class="member-details">
              <div class="detail-item">
                <mat-icon>badge</mat-icon>
                <span>{{ member.role | titlecase }}</span>
              </div>
              <div class="detail-item">
                <mat-icon>fingerprint</mat-icon>
                <span>ID: {{ member.id }}</span>
              </div>
            </div>
          </mat-card-content>
          
          <mat-card-actions align="end">
            <button 
              mat-icon-button 
              color="accent" 
              (click)="editMember(member)">
              <mat-icon>edit</mat-icon>
            </button>
            <button 
              mat-icon-button 
              color="warn" 
              (click)="deleteMember(member)"
              *ngIf="canDeleteMember(member)">
              <mat-icon>delete</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="teamMembers.length === 0">
        <mat-icon class="empty-icon">people</mat-icon>
        <h2>No Team Members</h2>
        <p>Add team members to start managing your project team.</p>
        <button 
          mat-raised-button 
          color="primary" 
          (click)="openAddMemberDialog()">
          <mat-icon>person_add</mat-icon> Add First Member
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

    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .member-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      }
    }

    .member-details {
      padding: 16px 0;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      color: #666;
    }

    .detail-item mat-icon {
      color: #3f51b5;
      font-size: 20px;
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

    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      .team-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TeamManagementComponent implements OnInit {
  teamMembers: User[] = [];

  constructor(
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTeamMembers();
  }

  loadTeamMembers(): void {
    this.teamMembers = this.authService.getTeamMembers().map(tm => ({
      id: tm.id,
      name: tm.name,
      email: tm.email,
      role: tm.role,
      password: '4de18a21a'   
    }));
  }

  openAddMemberDialog(): void {
    // For now, we'll use a simple prompt - you can expand this to a full dialog later
    const name = prompt('Enter team member name:');
    if (!name) return;

    const email = prompt('Enter team member email:');
    if (!email) return;

    const newMember: Omit<User, 'id'> = {
      name: name,
      email: email,
      role: 'team-member',
      password: '4de18a21a'
    };

    const createdMember = this.authService.addUser(newMember);
    this.loadTeamMembers();
    alert(`Team member ${createdMember.name} added successfully!`);
  }

  editMember(member: User): void {
    const newName = prompt(`Edit name for ${member.name}:`, member.name);
    if (newName && newName !== member.name) {
      this.authService.updateUser(member.id, { name: newName });
      this.loadTeamMembers();
    }
  }

  deleteMember(member: User): void {
    if (confirm(`Are you sure you want to remove ${member.name} from the team?`)) {
      this.authService.deleteUser(member.id);
      this.loadTeamMembers();
    }
  }

  canDeleteMember(member: User): boolean {
    // Don't allow deleting the current user or the last team member
    const currentUser = this.authService.currentUser();
    return currentUser?.id !== member.id && this.teamMembers.length > 1;
  }
}