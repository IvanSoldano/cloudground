import { Observable } from 'rxjs';
import { User } from '../models/user.model';

export abstract class AuthService {
  abstract currentUser$: Observable<User | null>;
  
  abstract loginWithOAuth(provider: 'google' | 'github'): Promise<void>;
  abstract loginWithEmail(email: string, password?: string): Promise<void>;
  abstract signUpWithEmail(email: string, password?: string): Promise<{ confirmEmail: boolean }>;
  abstract logout(): Promise<void>;
  abstract getSession(): Promise<any>;
  
  // Local dev helper
  abstract devBypass(): void;
}
