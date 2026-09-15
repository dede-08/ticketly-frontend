import { Injectable, signal } from '@angular/core';

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  resolve: (confirmed: boolean) => void;
}

/** Diálogo de confirmación global. Usar en lugar de `confirm()` nativo. */
@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  readonly request = signal<ConfirmRequest | null>(null);

  confirm(
    title: string,
    message: string,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar'
  ): Promise<boolean> {
    //si ya hay un diálogo abierto, se resuelve el anterior como cancelado
    this.request()?.resolve(false);
    return new Promise((resolve) => {
      this.request.set({ title, message, confirmLabel, cancelLabel, resolve });
    });
  }

  respond(confirmed: boolean): void {
    this.request()?.resolve(confirmed);
    this.request.set(null);
  }
}
