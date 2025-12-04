import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Ticket, TicketService } from '../../services/ticket.service';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './ticket-detail.component.html',
  styleUrl: './ticket-detail.component.css',
})
export class TicketDetailComponent implements OnInit {
  private ticketService = inject(TicketService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ticket = signal<Ticket | null>(null);
  loading = signal(true);
  addingComment = signal(false);
  uploadingFile = signal(false);
  uploadError = signal('');
  isDragging = signal(false);
  imagePreviewUrl = signal<string | null>(null);

  newComment = '';
  isInternalComment = false;

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = +params['id'];
      this.loadTicket(id);
    });
  }

  loadTicket(id: number) {
    this.loading.set(true);
    this.ticketService.getTicket(id).subscribe({
      next: (ticket) => {
        this.ticket.set(ticket);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading ticket:', error);
        this.loading.set(false);
      },
    });
  }

  // Drag & Drop handlers
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.uploadFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  uploadFile(file: File): void {
    if (!this.ticket()) return;

    // Validar tamaño (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.uploadError.set('El archivo es demasiado grande. Máximo 10MB');
      return;
    }

    this.uploadingFile.set(true);
    this.uploadError.set('');

    this.ticketService.uploadAttachment(this.ticket()!.id, file).subscribe({
      next: () => {
        this.uploadingFile.set(false);
        // Recargar ticket para mostrar el nuevo archivo
        this.loadTicket(this.ticket()!.id);
      },
      error: (error) => {
        this.uploadingFile.set(false);
        this.uploadError.set(error.error?.error || 'Error al subir el archivo');
        console.error('Error uploading file:', error);
      },
    });
  }

  deleteAttachment(attachmentId: number): void {
    if (!this.ticket()) return;

    if (confirm('¿Estás seguro de eliminar este archivo?')) {
      this.ticketService.deleteAttachment(this.ticket()!.id, attachmentId).subscribe({
        next: () => {
          this.loadTicket(this.ticket()!.id);
        },
        error: (error) => {
          console.error('Error deleting attachment:', error);
          alert('Error al eliminar el archivo');
        },
      });
    }
  }

  viewImage(url: string) {
    this.imagePreviewUrl.set(url);
  }

  closeImagePreview() {
    this.imagePreviewUrl.set(null);
  }

  addComment(): void {
    if (!this.newComment.trim() || !this.ticket()) return;

    this.addingComment.set(true);
    this.ticketService
      .addComment(this.ticket()!.id, this.newComment, this.isInternalComment)
      .subscribe({
        next: () => {
          this.loadTicket(this.ticket()!.id);
          this.newComment = '';
          this.isInternalComment = false;
          this.addingComment.set(false);
        },
        error: (error) => {
          console.error('Error adding comment:', error);
          this.addingComment.set(false);
        },
      });
  }

  deleteTicket() {
    if (!this.ticket()) return;

    if (confirm('¿Estás seguro de que deseas eliminar este ticket?')) {
      this.ticketService.deleteTicket(this.ticket()!.id).subscribe({
        next: () => {
          this.router.navigate(['/tickets']);
        },
        error: (error) => {
          console.error('Error deleting ticket:', error);
          alert('Error al eliminar el ticket');
        },
      });
    }
  }

  getStatusClass(statusName: string): string {
    const classes: Record<string, string> = {
      OPEN: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      ON_HOLD: 'bg-orange-100 text-orange-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
    };
    return classes[statusName] || 'bg-gray-100 text-gray-800';
  }

  getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      status: 'Estado',
      priority: 'Prioridad',
      assigned_to: 'Asignación',
      category: 'Categoría',
    };
    return labels[fieldName] || fieldName;
  }
}
