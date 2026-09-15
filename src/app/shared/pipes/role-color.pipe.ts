import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../../models/auth.model';

const ROLE_COLORS: Record<string, string> = {
  Administrador: 'bg-purple-500',
  Supervisor: 'bg-blue-500',
  'Agente de Soporte': 'bg-green-500',
  'Usuario Normal': 'bg-gray-400',
};

const DEFAULT_COLOR = 'bg-gray-400';

/** Color que identifica el rol del usuario (punto de color, sin badge). */
@Pipe({
  name: 'appRoleColor',
  standalone: true,
})
export class RoleColorPipe implements PipeTransform {
  transform(user: User | null | undefined): string {
    if (!user) return DEFAULT_COLOR;
    if (user.is_superuser) return 'bg-purple-500';
    return ROLE_COLORS[user.role ?? ''] ?? DEFAULT_COLOR;
  }
}
