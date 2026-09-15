import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { User } from '../../models/auth.model';

const API = 'http://localhost:8000/api/auth';

const mockUser: User = {
  id: 1,
  username: 'demo',
  email: 'demo@test.com',
  first_name: 'De',
  last_name: 'Mo',
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: { navigate: jasmine.Spy };

  beforeEach(() => {
    localStorage.clear();
    routerSpy = { navigate: jasmine.createSpy('navigate') };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login guarda los tokens y carga el usuario', () => {
    service.login({ username: 'demo', password: 'secret' }).subscribe();

    const loginReq = httpMock.expectOne(`${API}/login/`);
    expect(loginReq.request.method).toBe('POST');
    loginReq.flush({ access: 'access-123', refresh: 'refresh-123' });

    const userReq = httpMock.expectOne(`${API}/user/`);
    userReq.flush(mockUser);

    expect(localStorage.getItem('access_token')).toBe('access-123');
    expect(localStorage.getItem('refresh_token')).toBe('refresh-123');
    expect(service.isLoggedIn()).toBeTrue();
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.currentUser()?.username).toBe('demo');
  });

  it('register con tokens crea la sesión', () => {
    service
      .register({
        username: 'nuevo',
        email: 'nuevo@test.com',
        password: 'password123',
        password2: 'password123',
        first_name: 'Nue',
        last_name: 'Vo',
      })
      .subscribe();

    const req = httpMock.expectOne(`${API}/register/`);
    req.flush({ tokens: { access: 'a', refresh: 'r' }, user: mockUser });

    expect(service.isLoggedIn()).toBeTrue();
    expect(service.currentUser()?.id).toBe(1);
  });

  it('refreshToken actualiza el access token', () => {
    localStorage.setItem('refresh_token', 'old-refresh');

    service.refreshToken().subscribe();

    const req = httpMock.expectOne(`${API}/refresh/`);
    expect(req.request.body).toEqual({ refresh: 'old-refresh' });
    req.flush({ access: 'new-access', refresh: 'old-refresh' });

    expect(localStorage.getItem('access_token')).toBe('new-access');
  });

  it('logout limpia la sesión y redirige a /login', () => {
    localStorage.setItem('access_token', 'a');
    localStorage.setItem('refresh_token', 'r');

    service.logout();

    const req = httpMock.expectOne(`${API}/logout/`);
    expect(req.request.body).toEqual({ refresh: 'r' });
    req.flush({});

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('isLoggedIn es false sin token', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('loadUserInfo devuelve null si la API falla', (done: DoneFn) => {
    service.loadUserInfo().subscribe((user) => {
      expect(user).toBeNull();
      done();
    });

    httpMock.expectOne(`${API}/user/`).error(new ProgressEvent('error'));
  });
});
