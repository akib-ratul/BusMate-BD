// Shared type definitions
export type Role = 'PASSENGER' | 'DRIVER' | 'OPERATOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  profile?: any;
}
