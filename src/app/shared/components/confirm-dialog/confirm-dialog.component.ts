import { Component, inject } from '@angular/core';
import { ConfirmDialogService } from './confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [],
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  private confirmDialog = inject(ConfirmDialogService);

  request = this.confirmDialog.request;

  onConfirm(): void {
    this.confirmDialog.respond(true);
  }

  onCancel(): void {
    this.confirmDialog.respond(false);
  }
}
