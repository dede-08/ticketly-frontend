import { Pipe, PipeTransform } from '@angular/core';

const STATUS_CLASSES: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  ON_HOLD: 'bg-orange-100 text-orange-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

const DEFAULT_CLASS = 'bg-gray-100 text-gray-800';

/** Clases Tailwind para el badge de estado de un ticket. */
@Pipe({
  name: 'appStatusClass',
  standalone: true,
})
export class StatusClassPipe implements PipeTransform {
  transform(statusName: string): string {
    return STATUS_CLASSES[statusName] ?? DEFAULT_CLASS;
  }
}
