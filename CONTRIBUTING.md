# Guía de Contribución

Gracias por tu interés en contribuir a Ticketly Frontend. Este documento describe las pautas para hacerlo.

## Antes de empezar

- Lee el `README.md` para entender la arquitectura
- Familiarízate con [Angular Best Practices](https://angular.io/guide/styleguide)
- Instala las herramientas recomendadas: ESLint, Prettier

## Proceso de Contribución

### 1. Setup

```bash
git clone https://github.com/dede-08/ticketly-frontend.git
cd ticketly-frontend
npm install
```

### 2. Crear rama de feature

```bash
git checkout -b feature/mi-feature
```

Usa nombres descriptivos: `feature/`, `bugfix/`, `chore/`, `docs/`

### 3. Hacer cambios

- Mantén los commits pequeños y descriptivos
- Usa conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
- Ejecuta linter y tests antes de hacer push:

```bash
npm run lint:fix
npm run format
npm run test
npm run build
```

### 4. Commit y Push

```bash
git add .
git commit -m "feat: descripción clara del cambio"
git push origin feature/mi-feature
```

### 5. Pull Request

- Abre un PR en GitHub
- Describe qué cambios hiciste y por qué
- Vincula issues relacionados: `Closes #123`
- Asegúrate de que CI/CD pase

## Estándares de Código

### TypeScript

- Usa strict mode (`strict: true`)
- Evita `any` - sé específico con tipos
- Usa const/let en lugar de var
- Funciones con return types explícitos

```typescript
// ✅ Bien
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Mal
export function calculateTotal(items: any): any {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### Angular

- Componentes funcionales (sin clases cuando sea posible)
- Inyección de dependencias con `inject()`
- Signals para state management
- Standalone components

```typescript
// ✅ Bien
@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class TicketComponent implements OnInit {
  private ticketService = inject(TicketService);
  tickets = signal<Ticket[]>([]);

  ngOnInit(): void {
    this.loadTickets();
  }

  private loadTickets(): void {
    // ...
  }
}
```

### Estilos

- Usa Tailwind CSS clases utility
- Evita CSS custom cuando posible
- Responsive mobile-first

### Commits

```
feat: descripción clara
fix: corregir bug específico
docs: actualizar documentación
refactor: mejorar código sin cambiar funcionalidad
test: agregar o actualizar tests
chore: actualizar deps, config, etc
```

## Pruebas

Todas las PRs deben incluir tests:

```bash
# Crear tests para nuevas funcionalidades
npm run test

# Verificar coverage
npm run test -- --code-coverage
```

## Linting

El proyecto usa ESLint + Prettier. Antes de hacer push:

```bash
npm run lint:fix
npm run format
```

Los commits fallarán linting gracias a Husky. Usa `npm run lint:fix` para corregir.

## Reportar Issues

- Usa GitHub Issues
- Sé descriptivo: qué esperas, qué pasó
- Incluye versión de Node, navegador
- Incluye pasos para reproducir

## Preguntas?

- Abre una discussion en GitHub
- Abre un issue con etiqueta `question`

¡Gracias por contribuir! 🙏

---

Última actualización: Diciembre 2025
