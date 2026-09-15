import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TicketService } from './ticket.service';

const API = 'http://localhost:8000/api';

describe('TicketService', () => {
  let service: TicketService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TicketService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getTickets desenvuelve el paginado y envía los filtros', (done: DoneFn) => {
    service.getTickets({ search: 'bug' }).subscribe((tickets) => {
      expect(tickets.length).toBe(1);
      done();
    });

    const req = httpMock.expectOne(
      (r) => r.url === `${API}/tickets/` && r.params.get('search') === 'bug'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ count: 1, next: null, previous: null, results: [{ id: 1 }] });
  });

  it('getCategories acepta array o respuesta paginada', (done: DoneFn) => {
    service.getCategories().subscribe((first) => {
      expect(first.length).toBe(2);

      service.getCategories().subscribe((second) => {
        expect(second.length).toBe(1);
        done();
      });
      httpMock
        .expectOne(`${API}/categories/`)
        .flush({ count: 1, next: null, previous: null, results: [{ id: 1 }] });
    });

    httpMock.expectOne(`${API}/categories/`).flush([{ id: 1 }, { id: 2 }]);
  });

  it('getAssignedToMe usa el filtro general si el endpoint falla', (done: DoneFn) => {
    service.getAssignedToMe().subscribe((tickets) => {
      expect(tickets.length).toBe(2);
      done();
    });

    httpMock.expectOne(`${API}/tickets/assigned_to_me/`).error(new ProgressEvent('error'));

    const fallback = httpMock.expectOne(
      (r) => r.url === `${API}/tickets/` && r.params.get('assigned_to_me') === 'true'
    );
    fallback.flush({ count: 2, next: null, previous: null, results: [{}, {}] });
  });

  it('getUsers recorre los endpoints alternativos', (done: DoneFn) => {
    service.getUsers().subscribe((users) => {
      expect(users.length).toBe(1);
      done();
    });

    httpMock.expectOne(`${API}/users/`).error(new ProgressEvent('error'));
    httpMock.expectOne(`${API}/auth/user/`).error(new ProgressEvent('error'));
    httpMock.expectOne(`${API}/auth/users/`).flush([{ id: 7 }]);
  });

  it('deleteAttachment envía DELETE con body', () => {
    service.deleteAttachment(5, 9).subscribe();

    const req = httpMock.expectOne(`${API}/tickets/5/delete_attachment/`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toEqual({ attachment_id: 9 });
    req.flush(null);
  });

  describe('utilidades de archivos', () => {
    it('isValidFileType acepta extensiones permitidas', () => {
      expect(service.isValidFileType(new File(['x'], 'doc.pdf'))).toBeTrue();
      expect(service.isValidFileType(new File(['x'], 'foto.JPG'))).toBeTrue();
      expect(service.isValidFileType(new File(['x'], 'bin.exe'))).toBeFalse();
    });

    it('isValidFileSize respeta el límite de 10MB', () => {
      const ok = new File([new ArrayBuffer(1024)], 'a.zip');
      const big = new File([new ArrayBuffer(11 * 1024 * 1024)], 'b.zip');
      expect(service.isValidFileSize(ok)).toBeTrue();
      expect(service.isValidFileSize(big)).toBeFalse();
    });

    it('formatFileSize formatea bytes', () => {
      expect(service.formatFileSize(0)).toBe('0 Bytes');
      expect(service.formatFileSize(1024)).toBe('1 KB');
      expect(service.formatFileSize(1048576)).toBe('1 MB');
    });
  });
});
