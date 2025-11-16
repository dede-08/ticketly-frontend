import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-role-badge',
  standalone: true,
  imports: [],
  templateUrl: './role-badge.component.html',
  styleUrl: './role-badge.component.css'
})
export class RoleBadgeComponent {
  authService = inject(AuthService);

  getRoleIcon(): string {
    const user = this.authService.currentUser();
    if (!user) return '👤';
    
    if (user.is_superuser) return '👑';
    
    const roleIcons: Record<string, string> = {
      'Administrador': '👑',
      'Supervisor': '👨‍💼',
      'Agente de Soporte': '🛠️',
      'Usuario Normal': '👤'
    };
    
    return roleIcons[user.role || ''] || '👤';
  }

  getRoleClass(): string {
    const user = this.authService.currentUser();
    if (!user) return 'bg-gray-100 text-gray-800';
    
    if (user.is_superuser) return 'bg-purple-100 text-purple-800 border border-purple-300';
    
    const roleClasses: Record<string, string> = {
      'Administrador': 'bg-purple-100 text-purple-800 border border-purple-300',
      'Supervisor': 'bg-blue-100 text-blue-800 border border-blue-300',
      'Agente de Soporte': 'bg-green-100 text-green-800 border border-green-300',
      'Usuario Normal': 'bg-gray-100 text-gray-800 border border-gray-300'
    };
    
    return roleClasses[user.role || ''] || 'bg-gray-100 text-gray-800';
  }
}
