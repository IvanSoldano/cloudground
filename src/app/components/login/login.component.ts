import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  template: `
    <div class="login-container">
      <div class="login-content">
        <h2>Sign in to Cloudground</h2>
        <p class="subtitle">Access your workspace and tools</p>
        
        <div class="error-msg" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>

        <div class="success-msg" *ngIf="successMessage">
          <mat-icon>mark_email_read</mat-icon>
          <span>{{ successMessage }}</span>
        </div>

        <form class="email-form" (ngSubmit)="loginWithEmail()">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" [(ngModel)]="email" name="email" required [disabled]="isLoading">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput type="password" [(ngModel)]="password" name="password" required [disabled]="isLoading">
          </mat-form-field>

          <div class="email-actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="isLoading || !email || !password">
              Sign In
            </button>
            <button mat-stroked-button type="button" (click)="signUpWithEmail()" [disabled]="isLoading || !email || !password">
              Sign Up
            </button>
          </div>
        </form>

        <div class="divider">
          <span>OR</span>
        </div>
        
        <div class="auth-buttons">
          <button mat-stroked-button type="button" (click)="login('google')" [disabled]="isLoading">
            <mat-icon>login</mat-icon>
            Sign in with Google
          </button>
          
          <button mat-stroked-button type="button" (click)="login('github')" [disabled]="isLoading">
            <mat-icon>code</mat-icon>
            Sign in with GitHub
          </button>
          
          <!-- Dev Bypass Option (Hidden in Production) -->
          <button *ngIf="!isProduction" mat-button color="warn" type="button" (click)="bypassDevAuth()" [disabled]="isLoading" class="bypass-btn">
            <mat-icon>bug_report</mat-icon>
            Bypass Auth (Local Dev)
          </button>
        </div>
        
        <div class="loading-state" *ngIf="isLoading">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Authenticating...</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      padding: 4rem 1rem;
    }
    .login-content {
      width: 100%;
      max-width: 400px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    h2 {
      margin: 0;
      font-size: 2rem;
      font-weight: 500;
    }
    .subtitle {
      color: #666;
      margin-top: -0.5rem;
      margin-bottom: 0.5rem;
    }
    .error-msg {
      background-color: #fce4e4;
      color: #c92a2a;
      padding: 1rem;
      border-radius: 4px;
      font-size: 0.95rem;
    }
    .success-msg {
      background-color: #e6f9e6;
      color: #2b8a3e;
      padding: 1rem;
      border-radius: 4px;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .email-form {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .email-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-top: 0.5rem;
    }
    .email-actions button {
      padding: 1.25rem;
      font-size: 1.05rem;
    }
    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      color: #aaa;
    }
    .divider::before, .divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid #ddd;
    }
    .divider span {
      padding: 0 1rem;
    }
    .auth-buttons {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .auth-buttons button {
      padding: 1.25rem 1rem;
      font-size: 1.05rem;
    }
    .bypass-btn {
      margin-top: 1rem;
    }
    .loading-state {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 1rem;
      color: #666;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  
  isProduction = environment.production;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  email = '';
  password = '';

  async login(provider: 'google' | 'github') {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      await this.authService.loginWithOAuth(provider);
    } catch (error: any) {
      this.errorMessage = error.message || 'Login failed';
      this.isLoading = false;
    }
  }

  async loginWithEmail() {
    if (!this.email || !this.password) return;
    this.isLoading = true;
    this.errorMessage = '';
    try {
      await this.authService.loginWithEmail(this.email, this.password);
    } catch (error: any) {
      this.errorMessage = error.message || 'Invalid email or password';
      this.isLoading = false;
    }
  }

  async signUpWithEmail() {
    if (!this.email || !this.password) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    try {
      await this.authService.signUpWithEmail(this.email, this.password);
      this.successMessage = 'Registro exitoso. Revisa tu correo electrónico y confirma tu cuenta haciendo clic en el enlace de verificación.';
      this.isLoading = false;
    } catch (error: any) {
      this.errorMessage = error.message || 'Sign up failed';
      this.isLoading = false;
    }
  }

  bypassDevAuth() {
    this.authService.devBypass();
  }
}
