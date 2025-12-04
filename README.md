# Ticketly Frontend

Una aplicación Angular moderna y escalable para gestión de tickets. Construida con Angular 19, TypeScript y Tailwind CSS.

## Características

- **Autenticación**: Sistema seguro de login y registro con JWT
- **Gestión de Tickets**: Crear, editar, ver y eliminar tickets
- **Comentarios**: Agregar comentarios públicos e internos a tickets
- **Adjuntos**: Soporte para upload de archivos y vista previa de imágenes
- **Dashboard**: Estadísticas y resumen de tickets
- **Roles y Permisos**: Control basado en roles (admin, agent, user)
- **Responsive**: Diseño mobile-first con Tailwind CSS
- **Type-Safe**: TypeScript strict mode habilitado

## Requisitos

- Node.js ^20.18.0
- npm ^11.0.0
- Angular CLI 19.x


## Comandos principales

```bash
# Desarrollo - servidor local con hot reload
npm start

# Build para producción
npm run build

# Ejecutar pruebas unitarias
npm run test

# Linter - verificar código
npm run lint

# Linter - corregir automáticamente
npm run lint:fix

# Formateo de código
npm run format

# Verificar formato
npm run format:check

# Watch mode - rebuild automático
npm run watch
```

## Estructura del proyecto

```
src/
├── app/
│   ├── components/          # Componentes UI
│   ├── services/            # Servicios HTTP
│   ├── guards/              # Route guards
│   ├── interceptors/        # HTTP interceptors
│   ├── app.routes.ts        # Rutas
│   └── app.config.ts        # Configuración
├── assets/                  # Recursos estáticos
└── environments/            # Configuración por ambiente
```

## Autenticación

Utiliza tokens JWT. Los tokens se guardan en localStorage y se envían automáticamente en cada petición HTTP.

## Testing

```bash
npm run test                           # Ejecutar tests
npm run test -- --watch               # Modo watch
npm run test -- --code-coverage       # Con coverage
```


## Licencia

MIT

---

Última actualización: Diciembre 2025

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
