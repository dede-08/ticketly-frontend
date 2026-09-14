import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoggerService } from './logger.service';
import {
  PaginatedResponse,
  Category,
  Priority,
  Status,
  Comment,
  Ticket,
  TicketCreate,
  TicketStatistics,
  Attachment,
  User,
} from '../../models/ticket.model';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private apiUrl = `${environment.apiUrl}/api`;

  //tickets
  getTickets(params?: Record<string, string>): Observable<Ticket[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http
      .get<PaginatedResponse<Ticket>>(`${this.apiUrl}/tickets/`, { params: httpParams })
      .pipe(map((response) => response.results));
  }

  getTicket(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/tickets/${id}/`);
  }

  createTicket(ticket: TicketCreate): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.apiUrl}/tickets/`, ticket);
  }

  updateTicket(id: number, ticket: Partial<Ticket>): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.apiUrl}/tickets/${id}/`, ticket);
  }

  deleteTicket(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tickets/${id}/`);
  }

  getMyTickets(): Observable<Ticket[]> {
    return this.http
      .get<PaginatedResponse<Ticket>>(`${this.apiUrl}/tickets/my_tickets/`)
      .pipe(map((response) => response.results));
  }

  getMyTicketsFiltered(): Observable<Ticket[]> {
    //alternativa: usar el endpoint general con filtro created_by_me
    return this.getTickets({ created_by_me: 'true' });
  }

  getAssignedToMe(): Observable<Ticket[]> {
    return this.http.get<PaginatedResponse<Ticket>>(`${this.apiUrl}/tickets/assigned_to_me/`).pipe(
      map((response) => response.results),
      catchError((error) => {
        this.logger.warn('assigned_to_me endpoint no disponible, intentando fallback:', error);
        return this.getTickets({ assigned_to_me: 'true' });
      })
    );
  }

  getStatistics(): Observable<TicketStatistics> {
    return this.http.get<TicketStatistics>(`${this.apiUrl}/tickets/statistics/`);
  }

  assignTicket(ticketId: number, userId: number | null): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.apiUrl}/tickets/${ticketId}/assign/`, {
      user_id: userId,
    });
  }

  //comentarios
  addComment(ticketId: number, content: string, isInternal: boolean = false): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/tickets/${ticketId}/add_comment/`, {
      content,
      is_internal: isInternal,
    });
  }

  getComments(ticketId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/comments/?ticket=${ticketId}`);
  }

  //archivos adjuntos
  uploadAttachment(ticketId: number, file: File, description: string = ''): Observable<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    return this.http.post<Attachment>(
      `${this.apiUrl}/tickets/${ticketId}/upload_attachment/`,
      formData
    );
  }

  deleteAttachment(ticketId: number, attachmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tickets/${ticketId}/delete_attachment/`, {
      body: { attachment_id: attachmentId },
    });
  }

  getAttachments(ticketId: number): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(`${this.apiUrl}/tickets/${ticketId}/attachments/`);
  }

  downloadAttachment(fileUrl: string): void {
    window.open(fileUrl, '_blank');
  }

  //categorias
  getCategories(): Observable<Category[]> {
    return this.http
      .get<Category[] | PaginatedResponse<Category>>(`${this.apiUrl}/categories/`)
      .pipe(
        map((response) => {
          if (Array.isArray(response)) {
            return response;
          }
          return response.results || [];
        })
      );
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories/`, category);
  }

  updateCategory(id: number, category: Partial<Category>): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/categories/${id}/`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}/`);
  }

  //prioridades
  getPriorities(): Observable<Priority[]> {
    return this.http
      .get<Priority[] | PaginatedResponse<Priority>>(`${this.apiUrl}/priorities/`)
      .pipe(
        map((response) => {
          if (Array.isArray(response)) {
            return response;
          }
          return response.results || [];
        })
      );
  }

  //estados
  getStatuses(): Observable<Status[]> {
    return this.http.get<Status[] | PaginatedResponse<Status>>(`${this.apiUrl}/statuses/`).pipe(
      map((response) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response.results || [];
      })
    );
  }

  //usuarios
  getUsers(): Observable<User[]> {
    const unwrap = (response: User[] | PaginatedResponse<User>): User[] => {
      if (Array.isArray(response)) {
        return response;
      }
      return response.results || [];
    };

    return this.http.get<User[] | PaginatedResponse<User>>(`${this.apiUrl}/users/`).pipe(
      map(unwrap),
      catchError(() => {
        //fallback para APIs que exponen solo usuario actual
        return this.http.get<User>(`${this.apiUrl}/auth/user/`).pipe(
          map((user) => (user ? [user] : [])),
          catchError(() => {
            //ultimo recurso: intentar endpoint alternativo
            return this.http
              .get<User[] | PaginatedResponse<User>>(`${this.apiUrl}/auth/users/`)
              .pipe(
                map(unwrap),
                catchError(() => of([]))
              );
          })
        );
      })
    );
  }

  //utilidades
  //valida si un archivo es de un tipo permitido
  isValidFileType(file: File): boolean {
    const allowedExtensions = [
      'pdf',
      'doc',
      'docx',
      'xls',
      'xlsx',
      'jpg',
      'jpeg',
      'png',
      'gif',
      'bmp',
      'txt',
      'zip',
      'rar',
    ];
    const extension = file.name.split('.').pop()?.toLowerCase();
    return extension ? allowedExtensions.includes(extension) : false;
  }

  //valida si un archivo no excede el tamaño máximo (10MB)
  isValidFileSize(file: File, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  //formatea el tamaño del archivo
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
