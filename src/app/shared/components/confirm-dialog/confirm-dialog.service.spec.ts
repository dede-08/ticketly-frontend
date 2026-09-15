import { ConfirmDialogService } from './confirm-dialog.service';

describe('ConfirmDialogService', () => {
  it('resuelve true al confirmar y limpia el request', async () => {
    const service = new ConfirmDialogService();

    const pending = service.confirm('Título', 'Mensaje');
    expect(service.request()).toBeTruthy();

    service.respond(true);

    await expectAsync(pending).toBeResolvedTo(true);
    expect(service.request()).toBeNull();
  });

  it('resuelve false al cancelar', async () => {
    const service = new ConfirmDialogService();

    const pending = service.confirm('Título', 'Mensaje');
    service.respond(false);

    await expectAsync(pending).toBeResolvedTo(false);
  });
});
