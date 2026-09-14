import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoggerService } from './logger.service';
import {
  User,
  AuthResponse,
  RegisterData,
  RegisterResponse,
  LoginData,
} from '../../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private logger = inject(LoggerService);
  private apiUrl = `${environment.apiUrl}/api/auth`;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  isAuthenticated = signal(false);
  currentUser = signal<User | null>(null);

  constructor() {
    this.logger.debug('AuthService inicializado');
    //cargar usuario desde localStorage inmediatamente
    this.loadUserFromStorage();
  }

  //cargar usuario desde localStorage (sincrónico - instantáneo)
  private loadUserFromStorage(): void {
    const token = this.getAccessToken();
    const userStr = localStorage.getItem('current_user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this.currentUser.set(user);
        this.currentUserSubject.next(user);
        this.isAuthenticated.set(true);
        this.logger.debug('Usuario cargado desde localStorage');
      } catch (error) {
        this.logger.error('Error al parsear usuario desde storage:', error);
        localStorage.removeItem('current_user');
      }
    } else {
      this.logger.debug('No hay token o usuario en localStorage');
    }
  }

  //guardar usuario en localStorage
  private saveUserToStorage(user: User): void {
    try {
      localStorage.setItem('current_user', JSON.stringify(user));
      this.logger.debug('Usuario guardado en localStorage');
    } catch (error) {
      this.logger.error('Error al guardar usuario en storage:', error);
    }
  }

  login(credentials: LoginData): Observable<AuthResponse> {
    this.logger.debug('Intentando login...');
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/`, credentials).pipe(
      tap((response) => {
        this.logger.debug('Login exitoso, tokens recibidos');
        this.setTokens(response.access, response.refresh);
        //cargar info del usuario despues del login
        this.loadUserInfo().subscribe({
          next: () => this.logger.debug('Usuario cargado después del login'),
          error: (err) => this.logger.error('Error cargando usuario:', err),
        });
      })
    );
  }

  register(userData: RegisterData): Observable<RegisterResponse> {
    this.logger.debug('Intentando registro...');
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register/`, userData).pipe(
      tap((response) => {
        if (response.tokens && response.user) {
          this.logger.debug('Registro exitoso');
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
      this.http.post(`${this.apiUrl}/logout/`, { refresh: refreshToken }).subscribe({
        next: () => {
          this.logger.debug('Logout exitoso');
          this.clearSession();
        },
        error: () => {
          this.logger.debug('Error en logout, limpiando sesión de todas formas');
          this.clearSession();
        },
      });
    } else {
      this.clearSession();
    }
  }

  loadUserInfo(): Observable<User | null> {
    this.logger.debug('Cargando información del usuario desde API...');

    return this.http.get<User>(`${this.apiUrl}/user/`).pipe(
      tap((user) => {
        this.logger.debug('Usuario recibido desde API');
        this.currentUser.set(user);
        this.currentUserSubject.next(user);
        this.isAuthenticated.set(true);
        this.saveUserToStorage(user);
      }),
      catchError((error) => {
        this.logger.error('Error al cargar usuario desde API:', error);
        return of(null);
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/refresh/`, {
        refresh: refreshToken,
      })
      .pipe(
        tap((response) => {
          this.logger.debug('Token refrescado');
          this.setAccessToken(response.access);
        })
      );
  }

  private setTokens(access: string, refresh: string): void {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    this.isAuthenticated.set(true);
    this.logger.debug('Tokens guardados');
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
    this.logger.debug('Limpiando sesión');
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
