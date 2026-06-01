import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    const response = await authService.getSession();
    
    // Check if a session exists
    if (response?.data?.session) {
      return true;
    }
  } catch (error) {
    console.error('Auth guard error:', error);
  }

  // If no session exists, redirect to login page
  return router.createUrlTree(['/login']);
};
