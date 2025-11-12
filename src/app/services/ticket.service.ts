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

  addComment(ticketId: number, content: string, isInternal: boolean = false): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.apiUrl}/tickets/${ticketId}/add_comment/`,
      { content, is_internal: isInternal }
    );
  }

  assignTicket(ticketId: number, userId: number | null): Observable<Ticket> {
    return this.http.post<Ticket>(
      `${this.apiUrl}/tickets/${ticketId}/assign/`,
      { user_id: userId }
    );
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

  // Categorías
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories/`);
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories/`, category);
  }

  // Prioridades
  getPriorities(): Observable<Priority[]> {
    return this.http.get<Priority[]>(`${this.apiUrl}/priorities/`);
  }

  // Estados
  getStatuses(): Observable<Status[]> {
    return this.http.get<Status[]>(`${this.apiUrl}/statuses/`);
  }

  // Comentarios
  getComments(ticketId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/comments/?ticket=${ticketId}`);
  }
}