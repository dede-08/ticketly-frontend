import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/api/auth`;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  isAuthenticated = signal(false);
  currentUser = signal<User | null>(null);

  constructor() {
    console.log('AuthService inicializado');
    //cargar usuario desde localStorage inmediatamente
    this.loadUserFromStorage();
  }

  //cargar usuario desde localStorage (sincrónico - instantáneo)
  private loadUserFromStorage(): void {
    const token = this.getAccessToken();
    const userStr = localStorage.getItem('current_user');
    
    console.log('Token existe:', !!token);
    console.log('Usuario en storage:', userStr);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUser.set(user);
        this.currentUserSubject.next(user);
        this.isAuthenticated.set(true);
        console.log('Usuario cargado desde localStorage:', user.first_name, user.last_name);
      } catch (error) {
        console.error('Error al parsear usuario desde storage:', error);
        localStorage.removeItem('current_user');
      }
    } else {
      console.log('No hay token o usuario en localStorage');
    }
  }

  //guardar usuario en localStorage
  private saveUserToStorage(user: User): void {
    try {
      const userStr = JSON.stringify(user);
      localStorage.setItem('current_user', userStr);
      console.log('Usuario guardado en localStorage:', user);
      console.log('String guardado:', userStr);
    } catch (error) {
      console.error('Error al guardar usuario en storage:', error);
    }
  }

  login(credentials: LoginData): Observable<AuthResponse> {
    console.log('Intentando login...');
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/`, credentials)
      .pipe(
        tap(response => {
          console.log('Login exitoso, tokens recibidos');
          this.setTokens(response.access, response.refresh);
          //cargar info del usuario despues del login
          this.loadUserInfo().subscribe({
            next: () => console.log('Usuario cargado después del login'),
            error: (err) => console.error('Error cargando usuario:', err)
          });
        })
      );
  }

  register(userData: RegisterData): Observable<any> {
    console.log('Intentando registro...');
    return this.http.post(`${this.apiUrl}/register/`, userData)
      .pipe(
        tap((response: any) => {
          if (response.tokens) {
            console.log('Registro exitoso');
            this.setTokens(response.tokens.access, response.tokens.refresh);
            this.currentUser.set(response.user);
            this.currentUserSubject.next(response.user);
            this.isAuthenticated.set(true);
            this.saveUserToStorage(response.user);
          }
        })
      );
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();
    
    if (refreshToken) {
      this.http.post(`${this.apiUrl}/logout/`, { refresh: refreshToken })
        .subscribe({
          next: () => {
            console.log('Logout exitoso');
            this.clearSession();
          },
          error: () => {
            console.log('Error en logout, limpiando sesión de todas formas');
            this.clearSession();
          }
        });
    } else {
      this.clearSession();
    }
  }

  loadUserInfo(): Observable<User | null> {
    console.log('Cargando información del usuario desde API...');
    
    return this.http.get<User>(`${this.apiUrl}/user/`).pipe(
      tap(user => {
        console.log('Usuario recibido desde API:', user);
        console.log('first_name:', user.first_name);
        console.log('last_name:', user.last_name);
        console.log('role:', user.role);
        
        this.currentUser.set(user);
        this.currentUserSubject.next(user);
        this.isAuthenticated.set(true);
        this.saveUserToStorage(user);
        
        //verificar si se guardo correctamente
        const saved = localStorage.getItem('current_user');
        console.log('Verificación - Usuario guardado:', saved);
      }),
      catchError(error => {
        console.error('Error al cargar usuario desde API:', error);
        return of(null);
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh/`, {
      refresh: refreshToken
    }).pipe(
      tap(response => {
        console.log('Token refrescado');
        this.setAccessToken(response.access);
      })
    );
  }

  private setTokens(access: string, refresh: string): void {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    this.isAuthenticated.set(true);
    console.log('Tokens guardados');
  }

  private setAccessToken(access: string): void {
    localStorage.setItem('access_token', access);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private clearSession(): void {
    console.log('Limpiando sesión');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
    this.currentUser.set(null);
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }
}