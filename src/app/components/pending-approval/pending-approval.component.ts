import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pending-approval',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="pending-container">
      <div class="pending-content">
        <mat-icon class="pending-icon">hourglass_empty</mat-icon>
        <h2>Solicitud en revisión</h2>
        <p class="message">
          Tu cuenta ha sido creada exitosamente. Un administrador debe aprobar tu acceso 
          antes de que puedas utilizar la aplicación.
        </p>
        <p class="sub-message">
          La solicitud está siendo revisada. Te notificaremos cuando tu acceso sea aprobado.
        </p>
        <button mat-stroked-button (click)="logout()">
          <mat-icon>logout</mat-icon>
          Cerrar sesión
        </button>
      </div>
    </div>
  `,
  styles: [`
    .pending-container {
      display: flex;
      justify-content: center;
      padding: 4rem 1rem;
    }
    .pending-content {
      width: 100%;
      max-width: 500px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 1rem;
    }
    .pending-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      color: #f59f00;
    }
    h2 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 500;
    }
    .message {
      font-size: 1.1rem;
      line-height: 1.6;
      color: #555;
    }
    .sub-message {
      font-size: 0.95rem;
      color: #888;
      font-style: italic;
    }
    button {
      margin-top: 1rem;
    }
  `]
})
export class PendingApprovalComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
