export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'pending';
  status: string; // Additional status field if needed
}
