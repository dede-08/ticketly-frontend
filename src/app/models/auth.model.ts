export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  date_joined?: string;
  groups?: Array<{ id: number; name: string }>;
  role?: string;
  permissions?: string[];
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterResponse {
  tokens?: AuthResponse;
  user?: User;
}
