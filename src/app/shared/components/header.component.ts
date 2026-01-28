// src/app/shared/components/header.component.ts
import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; 
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar color="primary" class="header">
      <span class="logo">Project Manangement System</span>

      <div class="nav-links" *ngIf="isAuthenticated()">
        <a mat-button routerLink="/dashboard" routerLinkActive="active">
          <mat-icon>dashboard</mat-icon> Dashboard
        </a>
        <a mat-button routerLink="/projects" routerLinkActive="active">
          <mat-icon>folder</mat-icon> Projects
        </a>
        <a mat-button routerLink="/my-tasks" routerLinkActive="active">
          <mat-icon>assignment</mat-icon> My Tasks
        </a>
      </div>

      <span class="spacer"></span>

      <div class="user-info" *ngIf="currentUser()">
        <span class="user-name">{{ currentUser()?.name }}</span>
        <span class="user-role" [class.manager]="isManager()">
          {{ currentUser()?.role }}
        </span>

        <button mat-icon-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
        </button>

        <mat-menu #userMenu="matMenu">
          <button mat-menu-item (click)="switchToManager()">
            <mat-icon>admin_panel_settings</mat-icon> Login as Manager
          </button>
          <button mat-menu-item (click)="switchToTeamMember()">
            <mat-icon>person</mat-icon> Login as Team Member
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon> Logout
          </button>
        </mat-menu>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .header {
      display: flex;
      align-items: center;
      padding: 0 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,.1);
    }
    .logo {
      font-size: 1.25rem;
      font-weight: 500;
      margin-right: 32px;
    }
    .nav-links {
      display: flex;
      gap: 8px;
    }
    .nav-links a {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 4px;
      transition: background .2s;
    }
    .nav-links a.active {
      background: rgba(255,255,255,.2);
    }
    .spacer {
      flex: 1;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .user-name {
      font-weight: 500;
    }
    .user-role {
      font-size: .75rem;
      background: rgba(255,255,255,.2);
      padding: 2px 8px;
      border-radius: 12px;
      text-transform: uppercase;
    }
    .user-role.manager {
      background: #4caf50;
      color: white;
    }
    @media (max-width: 768px) {
      .nav-links span {
        display: none;
      }
      .user-name {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  currentUser = computed(() => this.authService.currentUser());
  isAuthenticated = computed(() => this.authService.isAuthenticated());
  isManager = computed(() => this.authService.isManager());

  constructor(
    private authService: AuthService,
    private router: Router   
  ) {}

  logout(): void {
    this.authService.logout();
  }

  switchToManager(): void {
    this.router.navigate(['/login'], { queryParams: { id: 'user-1' } });
  }

  switchToTeamMember(): void {
    this.router.navigate(['/login'], { queryParams: { id: 'user-2' } });
  }
}