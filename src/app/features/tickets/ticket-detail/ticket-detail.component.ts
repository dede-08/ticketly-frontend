import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';
import { Ticket } from '../../../models/ticket.model';
import { LoggerService } from '../../../core/services/logger.service';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';
import { StatusClassPipe } from '../../../shared/pipes/status-class.pipe';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusClassPipe],
  templateUrl: './ticket-detail.component.html',
  styleUrl: './ticket-detail.component.css',
})
export class TicketDetailComponent implements OnInit {
  private ticketService = inject(TicketService);
  private logger = inject(LoggerService);
  private confirmDialog = inject(ConfirmDialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  ticket = signal<Ticket | null>(null);
  loading = signal(true);
  addingComment = signal(false);
  uploadingFile = signal(false);
  uploadError = signal('');
  actionError = signal('');
  isDragging = signal(false);
  imagePreviewUrl = signal<string | null>(null);

  newComment = '';
  isInternalComment = false;

  ngOnInit() {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = +params['id'];
      this.loadTicket(id);
    });
  }

  loadTicket(id: number) {
    this.loading.set(true);
    this.ticketService
      .getTicket(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ticket) => {
          this.ticket.set(ticket);
          this.loading.set(false);
        },
        error: (error) => {
          this.logger.error('Error loading ticket:', error);
          this.loading.set(false);
        },
      });
  }

  //drag & drop handlers
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

    //validar tamaño (10MB)
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
        //recargar ticket para mostrar el nuevo archivo
        this.loadTicket(this.ticket()!.id);
      },
      error: (error) => {
        this.uploadingFile.set(false);
        this.uploadError.set(error.error?.error || 'Error al subir el archivo');
        this.logger.error('Error uploading file:', error);
      },
    });
  }

  async deleteAttachment(attachmentId: number): Promise<void> {
    if (!this.ticket()) return;

    const confirmed = await this.confirmDialog.confirm(
      'Eliminar archivo',
      '¿Estás seguro de eliminar este archivo?',
      'Eliminar'
    );
    if (!confirmed) return;

    this.ticketService.deleteAttachment(this.ticket()!.id, attachmentId).subscribe({
      next: () => {
        this.actionError.set('');
        this.loadTicket(this.ticket()!.id);
      },
      error: (error) => {
        this.logger.error('Error deleting attachment:', error);
        this.actionError.set('Error al eliminar el archivo');
      },
    });
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
          this.logger.error('Error adding comment:', error);
          this.addingComment.set(false);
        },
      });
  }

  async deleteTicket(): Promise<void> {
    if (!this.ticket()) return;

    const confirmed = await this.confirmDialog.confirm(
      'Eliminar ticket',
      '¿Estás seguro de que deseas eliminar este ticket?',
      'Eliminar'
    );
    if (!confirmed) return;

    this.ticketService.deleteTicket(this.ticket()!.id).subscribe({
      next: () => {
        this.router.navigate(['/tickets']);
      },
      error: (error) => {
        this.logger.error('Error deleting ticket:', error);
        this.actionError.set('Error al eliminar el ticket');
      },
    });
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
