import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Ticket, TicketService, Comment } from '../../services/ticket.service';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './ticket-detail.component.html',
  styleUrl: './ticket-detail.component.css'
})
export class TicketDetailComponent implements OnInit {
  private ticketService = inject(TicketService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ticket = signal<Ticket | null>(null);
  loading = signal(true);
  addingComment = signal(false);
  
  newComment = '';
  isInternalComment = false;

  ngOnInit() {
    this.route.params.subscribe(params => {
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
      }
    });
  }

  addComment() {
    if (!this.newComment.trim() || !this.ticket()) return;

    this.addingComment.set(true);
    this.ticketService.addComment(
      this.ticket()!.id,
      this.newComment,
      this.isInternalComment
    ).subscribe({
      next: (comment) => {
        // Recargar ticket para obtener el comentario actualizado
        this.loadTicket(this.ticket()!.id);
        this.newComment = '';
        this.isInternalComment = false;
        this.addingComment.set(false);
      },
      error: (error) => {
        console.error('Error adding comment:', error);
        this.addingComment.set(false);
      }
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
        }
      });
    }
  }

  getStatusClass(statusName: string): string {
    const classes: Record<string, string> = {
      'OPEN': 'bg-blue-100 text-blue-800',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
      'ON_HOLD': 'bg-orange-100 text-orange-800',
      'RESOLVED': 'bg-green-100 text-green-800',
      'CLOSED': 'bg-gray-100 text-gray-800'
    };
    return classes[statusName] || 'bg-gray-100 text-gray-800';
  }

  getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      'status': 'Estado',
      'priority': 'Prioridad',
      'assigned_to': 'Asignación',
      'category': 'Categoría'
    };
    return labels[fieldName] || fieldName;
  }
}
