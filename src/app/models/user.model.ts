export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'pending';
  status: 'approved' | 'pending' | 'inactive' | 'suspended';
  persona_id?: number | null;
}
