export interface Person {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  avatar_url?: string; // Support database snake_case directly
}
