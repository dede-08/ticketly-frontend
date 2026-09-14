import { Pipe, PipeTransform } from '@angular/core';

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
};

/** Etiqueta legible para el nombre de prioridad del backend. */
@Pipe({
  name: 'appPriorityLabel',
  standalone: true,
})
export class PriorityLabelPipe implements PipeTransform {
  transform(priorityName: string): string {
    return PRIORITY_LABELS[priorityName] ?? priorityName;
  }
}
