import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div class="landing-container">
      <mat-card class="hero-card">
        <mat-card-header>
          <mat-card-title>Welcome to Cloudground</mat-card-title>
          <mat-card-subtitle>Cloudflare Workers + Angular Material</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p class="description">
            A high-performance, developer-first platform for building modern web applications 
            at the edge. Focus entirely on your data flow and logic.
          </p>
          
          <div class="features-list">
            <div class="feature-item">
              <mat-icon color="primary">bolt</mat-icon>
              <span>Edge Native - 0ms cold starts</span>
            </div>
            <div class="feature-item">
              <mat-icon color="accent">satellite</mat-icon>
              <span>Modern Signals - State-of-the-art reactivity</span>
            </div>
            <div class="feature-item">
              <mat-icon color="warn">security</mat-icon>
              <span>Type Safe - End-to-end type safety</span>
            </div>
          </div>
        </mat-card-content>
        <mat-card-actions align="end">
          <a mat-button routerLink="/people" style="margin-right: 0.5rem;">
            <mat-icon>groups</mat-icon>
            Meet the Team
          </a>
          <a mat-flat-button color="primary" routerLink="/tasks">
            Explore Tasks
            <mat-icon>arrow_forward</mat-icon>
          </a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .landing-container {
      display: flex;
      justify-content: center;
      padding: 2rem 0;
    }
    .hero-card {
      max-width: 800px;
      width: 100%;
    }
    .description {
      font-size: 1.15rem;
      line-height: 1.6;
      margin-bottom: 2.5rem;
    }
    .features-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2.5rem;
    }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 1.05rem;
      padding: 0.5rem 0;
    }
  `]
})
export class LandingComponent {}
