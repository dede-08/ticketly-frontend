import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface Priority {
  id: number;
  name: string;
  display_name: string;
  level: number;
  color: string;
}

export interface Status {
  id: number;
  name: string;
  display_name: string;
  is_closed: boolean;
}

export interface Comment {
  id: number;
  ticket: number;
  user: User;
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

export interface TicketHistory {
  id: number;
  ticket: number;
  user: User;
  field_name: string;
  old_value: string;
  new_value: string;
  created_at: string;
}

export interface Attachment {
  id: number;
  ticket: number;
  uploaded_by: User;
  file: string;
  file_url: string;
  filename: string;
  file_size: number;
  file_size_display: string;
  file_type: string;
  file_extension: string;
  is_image: boolean;
  uploaded_at: string;
  description: string;
}

export interface Ticket {
  id: number;
  ticket_number: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  created_by: User;
  assigned_to: User | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  attachments: any[];
  tags: string[];
  comments?: Comment[];
  history?: TicketHistory[];
  attachments_files?: Attachment[];
  comments_count?: number;
}

export interface TicketCreate {
  title: string;
  description: string;
  category: number;
  priority: number;
  status: number;
  assigned_to?: number | null;
  tags?: string[];
}

export interface TicketStatistics {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  by_priority: Array<{ priority__name: string; count: number }>;
  by_category: Array<{ category__name: string; count: number }>;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api`;

  //TICKETS

  getTickets(params?: any): Observable<Ticket[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<Ticket[]>(`${this.apiUrl}/tickets/`, { params: httpParams });
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
    return this.http.get<Ticket[]>(`${this.apiUrl}/tickets/my_tickets/`);
  }

  getAssignedToMe(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/tickets/assigned_to_me/`);
  }

  getStatistics(): Observable<TicketStatistics> {
    return this.http.get<TicketStatistics>(`${this.apiUrl}/tickets/statistics/`);
  }

  assignTicket(ticketId: number, userId: number | null): Observable<Ticket> {
    return this.http.post<Ticket>(
      `${this.apiUrl}/tickets/${ticketId}/assign/`,
      { user_id: userId }
    );
  }

  //COMENTARIOS

  addComment(ticketId: number, content: string, isInternal: boolean = false): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.apiUrl}/tickets/${ticketId}/add_comment/`,
      { content, is_internal: isInternal }
    );
  }

  getComments(ticketId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/comments/?ticket=${ticketId}`);
  }

  //ARCHIVOS ADJUNTOS

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

  deleteAttachment(ticketId: number, attachmentId: number): Observable<any> {
    return this.http.request('delete', 
      `${this.apiUrl}/tickets/${ticketId}/delete_attachment/`,
      { 
        body: { attachment_id: attachmentId }
      }
    );
  }

  getAttachments(ticketId: number): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(`${this.apiUrl}/tickets/${ticketId}/attachments/`);
  }

  downloadAttachment(fileUrl: string): void {
    window.open(fileUrl, '_blank');
  }

  //CATEGORIAS

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories/`);
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

  //PRIORIDADES

  getPriorities(): Observable<Priority[]> {
    return this.http.get<Priority[]>(`${this.apiUrl}/priorities/`);
  }

  //ESTADOS

  getStatuses(): Observable<Status[]> {
    return this.http.get<Status[]>(`${this.apiUrl}/statuses/`);
  }

  //UTILIDADES
  
  //valida si un archivo es de un tipo permitido
  isValidFileType(file: File): boolean {
    const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'txt', 'zip', 'rar'];
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