import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SupabaseAuthService implements AuthService {
  private supabase: SupabaseClient;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(private router: Router) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    
    // Check initial session
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.updateUserFromSession(session?.user);
    });

    // Listen to auth state changes
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.updateUserFromSession(session?.user);
    });
  }

  private async updateUserFromSession(supabaseUser: SupabaseUser | undefined | null) {
    if (localStorage.getItem('dev_bypass') === 'true') return;

    if (!supabaseUser) {
      this.currentUserSubject.next(null);
      return;
    }

    // Fetch the user's role from the custom profiles table
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('role, status')
      .eq('id', supabaseUser.id)
      .single();

    const user: User = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      role: profile?.role || 'pending', // Default to pending if no profile or role found
      status: profile?.status || 'pending'
    };

    this.currentUserSubject.next(user);
  }

  async loginWithOAuth(provider: 'google' | 'github'): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: window.location.origin
      }
    });
    
    if (error) {
      console.error('OAuth Login Error:', error.message);
      throw error;
    }
  }

  async loginWithEmail(email: string, password?: string): Promise<void> {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password: password || '' });
    if (error) throw error;
    this.router.navigate(['/tasks']);
  }

  async signUpWithEmail(email: string, password?: string): Promise<{ confirmEmail: boolean }> {
    const { data, error } = await this.supabase.auth.signUp({ email, password: password || '' });
    if (error) throw error;
    // Supabase returns a user with identities = [] if email confirmation is required
    // and the user hasn't confirmed yet. Don't navigate — let the UI show a message.
    return { confirmEmail: true };
  }

  async logout(): Promise<void> {
    localStorage.removeItem('dev_bypass');
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
    this.currentUserSubject.next(null);
  }

  async getSession(): Promise<any> {
    if (localStorage.getItem('dev_bypass') === 'true') {
      return { 
        data: { 
          session: { 
            user: { id: 'dev-user' },
            access_token: 'DEV_BYPASS_TOKEN'
          } 
        } 
      };
    }
    return this.supabase.auth.getSession();
  }

  devBypass(): void {
    localStorage.setItem('dev_bypass', 'true');
    const mockUser: User = {
      id: 'dev-bypass-user',
      email: 'dev@localhost',
      role: 'admin',
      status: 'approved'
    };
    this.currentUserSubject.next(mockUser);
    this.router.navigate(['/tasks']);
  }
}
