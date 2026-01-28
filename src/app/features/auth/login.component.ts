import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/project.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="login-wrapper">
      <mat-card class="login-card">
        <mat-card-header>
          <div mat-card-avatar class="logo"></div>
          <mat-card-title>Secure Login</mat-card-title>
          <mat-card-subtitle>Enter your credentials</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input
                matInput
                type="email"
                formControlName="email"
                placeholder="name@company.com"
              />
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">Email is required</mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">Invalid e-mail format</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input
                matInput
                [type]="hidePassword ? 'password' : 'text'"
                formControlName="password"
                placeholder="Min. 8 characters"
              />
              <button
                mat-icon-button
                matSuffix
                (click)="hidePassword = !hidePassword"
                type="button"
              >
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Password is required</mat-error>
              <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">At least 8 characters</mat-error>
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="loginForm.invalid"
              class="full-width"
            >
              <mat-icon>login</mat-icon> Login
            </button>

            <div *ngIf="loginError" class="error-box">{{ loginError }}</div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 24px;
      box-shadow: 0 12px 40px rgba(0,0,0,.3);
    }
    .logo {
      background: #3f51b5;
      border-radius: 50%;
    }
    .full-width {
      width: 100%;
    }
    .error-box {
      color: #f44336;
      margin-top: 16px;
      text-align: center;
    }
    .hint-box {
      margin-top: 24px;
      padding: 12px;
      background: #e8eaf6;
      border-radius: 8px;
      font-size: 13px;
      text-align: center;
    }
    button[type="submit"] {
      margin-top: 8px;
    }
  `]
})
export class LoginComponent {
  hidePassword = true;
  loginError = '';
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute 
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        const user = this.auth.users().find(u => u.id === id);
        if (user) {
          this.loginForm.patchValue({ email: user.email });
        }
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const payload: LoginRequest = this.loginForm.value;
    const ok = this.auth.login(payload);
    if (!ok) {
      this.loginError = 'Invalid e-mail or password.';
      this.loginForm.markAsTouched();
    }
  }
}