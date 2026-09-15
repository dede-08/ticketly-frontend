import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('añade el header Authorization si hay token', () => {
    localStorage.setItem('access_token', 'tok-123');
    localStorage.setItem('refresh_token', 'ref-123');

    http.get('/api/tickets/').subscribe();

    const req = httpMock.expectOne('/api/tickets/');
    expect(req.request.headers.get('Authorization')).toBe('Bearer tok-123');
    req.flush([]);
  });

  it('omite el token en login y register', () => {
    localStorage.setItem('access_token', 'tok-123');

    http.post('/api/auth/login/', {}).subscribe();
    const loginReq = httpMock.expectOne('/api/auth/login/');
    expect(loginReq.request.headers.has('Authorization')).toBeFalse();
    loginReq.flush({});

    http.post('/api/auth/register/', {}).subscribe();
    const registerReq = httpMock.expectOne('/api/auth/register/');
    expect(registerReq.request.headers.has('Authorization')).toBeFalse();
    registerReq.flush({});
  });
});
