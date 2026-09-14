import { User } from './auth.model';

// Re-export para que los features puedan importar User desde un solo sitio.
export type { User } from './auth.model';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
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
  attachments: Attachment[];
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
