import { RoleColorPipe } from './role-color.pipe';

describe('RoleColorPipe', () => {
  const pipe = new RoleColorPipe();
  const baseUser = {
    id: 1,
    username: 'demo',
    email: 'demo@test.com',
    first_name: 'De',
    last_name: 'Mo',
  };

  it('devuelve gris si no hay usuario', () => {
    expect(pipe.transform(null)).toBe('bg-gray-400');
    expect(pipe.transform(undefined)).toBe('bg-gray-400');
  });

  it('los superusuarios son morados', () => {
    expect(pipe.transform({ ...baseUser, is_superuser: true })).toBe('bg-purple-500');
  });

  it('mapea cada rol a su color', () => {
    expect(pipe.transform({ ...baseUser, role: 'Supervisor' })).toBe('bg-blue-500');
    expect(pipe.transform({ ...baseUser, role: 'Agente de Soporte' })).toBe('bg-green-500');
  });

  it('roles desconocidos caen al gris', () => {
    expect(pipe.transform({ ...baseUser, role: 'Otro' })).toBe('bg-gray-400');
  });
});
