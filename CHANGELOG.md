# Changelog

## [1.1.0] - 2025-12-04

### ✨ Agregado

#### ESLint + Prettier Integration
- **Nuevo**: `eslint.config.js` - Configuración ESLint 9 con soporte Angular
- **Nuevo**: `.prettierrc.json` - Configuración Prettier
- **Nuevo**: `.lintstagedrc.json` - Git hooks con lint-staged
- **Nuevo**: `.husky/pre-commit` - Validación automática en commits
- **Scripts**: Agregados `npm run lint`, `lint:fix`, `format`, `format:check`

#### CI/CD Pipeline
- **Nuevo**: `.github/workflows/ci.yml` - GitHub Actions workflow
  - Ejecuta en PRs y push a main/develop
  - Pasos: install → lint → test (headless) → build → coverage
  - Subida de coverage a codecov

#### Automatización de Dependencias
- **Nuevo**: `.github/dependabot.yml` - Dependabot configuration
  - Actualizaciones semanales automáticas
  - PRs etiquetadas con "dependencies"
  - Límite de 10 PRs abiertas simultáneamente

#### Documentación
- **Mejorado**: `README.md` - Completamente reescrito
  - Estructura clara con badges
  - Instrucciones de instalación y setup
  - Comandos principales documentados
  - Estructura de proyecto explicada
  - Próximas mejoras listadas
- **Nuevo**: `CONTRIBUTING.md` - Guía de contribución
  - Proceso de contribución paso a paso
  - Estándares de código
  - Convenciones de commits
  - Cómo reportar issues

### 🔄 Actualizado

- **Angular**: 17.3.12 → 19.2.17
- **TypeScript**: 5.2.2 → 5.8.3
- **@angular-eslint**: Agregado suite completa (21.0.1)
- **ESLint**: Agregado 9.39.1 con @typescript-eslint
- **Prettier**: Agregado 3.4.2
- **Husky**: Agregado 9.1.7
- **lint-staged**: Agregado 15.2.13

### 🐛 Corregido

- Removed unused imports (Router, RouterOutlet, Comment)
- Fixed console.log statements → console.warn/error
- Fixed any type annotations
- Fixed unused variables in ticket-detail, dashboard, navbar, auth.interceptor
- Resolved TypeScript compilation errors
- Agregados globals para browser APIs (window, localStorage, document)

### 🛡️ Seguridad

- ✅ 0 vulnerabilidades (antes: 19 high, 6 moderate, 4 low)
- Ejecutado `npm audit fix --force`
- Configurado Dependabot para monitoreo continuo

### 📊 Calidad de Código

- **ESLint**: 0 errores, 33 warnings (expected: console.log, any types)
- **TypeScript**: strict mode habilitado
- **Build**: Exitoso sin errores
  - Initial bundle: 330.96 kB (minified: 90.37 kB)
  - Lazy chunks optimizados

### 📝 Cambios en package.json

```json
{
  "scripts": {
    "lint": "eslint src --ext .ts,.html",
    "lint:fix": "eslint src --ext .ts,.html --fix",
    "format": "prettier --write src",
    "format:check": "prettier --check src",
    "prepare": "husky install"
  },
  "devDependencies": {
    "@angular-eslint/builder": "^21.0.1",
    "@angular-eslint/eslint-plugin": "^21.0.1",
    "@angular-eslint/eslint-plugin-template": "^21.0.1",
    "@angular-eslint/template-parser": "^21.0.1",
    "@typescript-eslint/eslint-plugin": "^8.23.0",
    "@typescript-eslint/parser": "^8.23.0",
    "@eslint/js": "^9.39.1",
    "eslint": "^9.39.1",
    "prettier": "^3.4.2",
    "husky": "^9.1.7",
    "lint-staged": "^15.2.13"
  }
}
```

### 📁 Nuevos Archivos

```
.github/
├── workflows/
│   └── ci.yml          # GitHub Actions workflow
└── dependabot.yml      # Dependabot config

.husky/
└── pre-commit          # Git hook

eslint.config.js        # ESLint 9 configuration
.eslintrc.json          # ESLint legacy config (deprecated)
.prettierrc.json        # Prettier configuration
.prettierignore         # Files to skip for Prettier
.lintstagedrc.json      # lint-staged configuration

CONTRIBUTING.md         # Contribution guidelines
README.md               # Actualizado completamente
```

## Próximas mejoras planeadas

- [ ] Pruebas E2E con Cypress
- [ ] Aumentar cobertura unitaria a >=80%
- [ ] Lazy loading de módulos
- [ ] Manejo centralizado de errores
- [ ] Accesibilidad mejorada (a11y)
- [ ] Dockerización
- [ ] Documentación API

---

**Fecha**: Diciembre 4, 2025  
**Autor**: @dede-08  
**Commit**: Múltiples cambios - Setup CI/CD y tooling
