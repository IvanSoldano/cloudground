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
      .select('role, status, persona_id, personas(nombre, otros_nombres, apellido, otros_apellidos)')
      .eq('id', supabaseUser.id)
      .single();

    let name = supabaseUser.user_metadata?.['full_name'] || supabaseUser.user_metadata?.['name'] || supabaseUser.email?.split('@')[0] || 'User';
    if (profile?.personas) {
      const p = profile.personas as any;
      const personaName = `${p.nombre || ''} ${p.otros_nombres || ''} ${p.apellido || ''} ${p.otros_apellidos || ''}`.trim();
      if (personaName) {
        name = personaName;
      }
    }

    const user: User = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: name,
      role: profile?.role || 'pending', // Default to pending if no profile or role found
      status: profile?.status || 'pending',
      persona_id: profile?.persona_id || null
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
    
    // Supabase prevents email enumeration by returning a fake success if the email is taken
    // but the identities array will be empty.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      throw new Error('EMAIL_TAKEN');
    }
    
    return { confirmEmail: true };
  }

  async logout(): Promise<void> {
    localStorage.removeItem('dev_bypass');
    this.currentUserSubject.next(null);
    const { error } = await this.supabase.auth.signOut({ scope: 'local' });
    if (error) {
      console.warn('Logout API error (session cleared locally):', error.message);
    }
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
      name: 'Dev User',
      role: 'admin',
      status: 'approved'
    };
    this.currentUserSubject.next(mockUser);
    this.router.navigate(['/tasks']);
  }
}
