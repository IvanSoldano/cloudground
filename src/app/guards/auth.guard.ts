import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { filter, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    const response = await authService.getSession();
    
    // Check if a session exists
    if (response?.data?.session) {
      // Session exists — now check the user's profile status
      // Wait for the currentUser$ to emit a non-null value (profile loaded)
      const user = await firstValueFrom(
        authService.currentUser$.pipe(
          filter(u => u !== null),
          take(1)
        )
      );
      
      if (user && user.status !== 'approved' && user.role !== 'admin') {
        // User is authenticated but not yet approved
        return router.createUrlTree(['/pending-approval']);
      }
      
      return true;
    }
  } catch (error) {
    console.error('Auth guard error:', error);
  }

  // If no session exists, redirect to login page
  return router.createUrlTree(['/login']);
};
