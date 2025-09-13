export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  seccao: number;
  isAdmin: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'operator' | 'viewer';
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  role?: 'admin' | 'operator' | 'viewer';
  active?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AppConfig {
  Producao: {
    BD_Servidor: string;
    BD_Path: string;
    BD_Username: string;
    BD_Password: string;
  };
  Gescom: {
    BD2_Servidor: string;
    BD2_Path: string;
    BD2_Username: string;
    BD2_Password: string;
  };
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

export interface MenuItem {
  label: string;
  path: string;
  icon?: string;
}