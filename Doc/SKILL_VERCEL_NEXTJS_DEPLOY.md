# Skill: Despliegue Next.js en Vercel — Solución de errores

## Problema original

Al desplegar en Vercel con Next.js 16, la app devolvía:

```
Error: MIDDLEWARE_INVOCATION_FAILED
[ReferenceError: __dirname is not defined]
```

Y al eliminar el middleware, devolvía **404: NOT_FOUND** en todas las rutas.

---

## Causa raíz

1. **`bcryptjs` usa `__dirname`** — una API de Node.js que NO existe en el edge runtime de Vercel.
2. **Next.js bundlea dependencias transitivas al edge** — aunque `bcryptjs` solo se usaba en `lib/auth.ts` (server-side), el bundler lo incluía en el middleware (edge runtime).
3. **Next.js 16 genera un "Proxy (Middleware)" automático** — incluso sin archivo `middleware.ts`, lo que hacía imposible evitar el error.
4. **Sin middleware, Vercel devolvía 404** — el middleware es necesario para que el routing funcione correctamente en Vercel.

---

## Solución aplicada (paso a paso)

### 1. Downgrade de Next.js 16 → 15.5.18

```bash
npm install next@15 eslint-config-next@15 --legacy-peer-deps
```

Next.js 15 NO genera proxy automático y tiene compatibilidad completa con Vercel.

### 2. Dynamic import de bcryptjs en `lib/auth.ts`

**ANTES (rompe edge runtime):**
```typescript
import * as bcrypt from 'bcryptjs';

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}
```

**DESPUÉS (edge-safe):**
```typescript
async function getBcrypt() {
  const bcrypt = await import('bcryptjs');
  return bcrypt.default || bcrypt;
}

export async function hashPassword(password: string) {
  const bcrypt = await getBcrypt();
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}
```

El `import()` dinámico evita que el bundler incluya `bcryptjs` en el edge bundle.

### 3. serverExternalPackages en `next.config.mjs`

```javascript
const nextConfig = {
  typescript: { ignoreBuildErrors: false },
  serverExternalPackages: ['bcryptjs', 'postgres'],
};
```

Esto le dice a Next.js que NO bundle estos paquetes — se cargan en runtime del servidor.

### 4. Middleware mínimo (solo cookie check)

```typescript
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectedRoutes = ['/dashboard', '/admin', '/cattle', '/sheds', '/milk', '/vaccinations', '/reproduction', '/reports'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    const token = request.cookies.get('sig-bovino-session')?.value;
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|setup-database).*)'],
};
```

**Reglas del middleware en Vercel:**
- SOLO importar de `next/server`
- NUNCA importar paquetes que usen APIs de Node.js (`fs`, `path`, `crypto`, `__dirname`)
- NO usar `bcryptjs`, `jose`, `jsonwebtoken`, `crypto` nativo
- La validación real del JWT se hace en los API routes con `withAuth`

### 5. ESLint config para Next.js 15 (flat config)

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  { rules: { "@typescript-eslint/no-explicit-any": "warn", ... } },
];

export default eslintConfig;
```

### 6. vercel.json explícito

```json
{
  "framework": "nextjs"
}
```

### 7. Tipos correctos en formularios

```typescript
// <select> → HTMLSelectElement (NO HTMLInputElement)
onChange={(e: React.ChangeEvent<HTMLSelectElement>) => ...}

// <textarea> → HTMLTextAreaElement (NO HTMLInputElement)
onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => ...}
```

---

## Reglas de oro para Vercel + Next.js

| Regla | Detalle |
|-------|---------|
| **Versión de Next.js** | Usar Next.js 15.x (no 16) hasta que Vercel soporte el auto-proxy |
| **Middleware** | Solo `next/server` imports. Cero Node.js APIs |
| **bcryptjs** | Siempre dynamic import: `await import('bcryptjs')` |
| **postgres** | Agregar a `serverExternalPackages` |
| **JWT en middleware** | NO verificar JWT en middleware. Solo check cookie existe |
| **JWT en API** | Verificar JWT completo en API routes con `withAuth` |
| **Build cache** | Si hay errores fantasma: Vercel Dashboard → Redeploy → "Clear Build Cache" ✅ |

---

## Checklist pre-deploy

- [ ] `middleware.ts` solo importa `next/server`
- [ ] `bcryptjs` se importa con `await import()`
- [ ] `serverExternalPackages` incluye `bcryptjs` y `postgres`
- [ ] `npm run build` local pasa sin errores
- [ ] Build output NO muestra "Proxy (Middleware)" (Next.js 15)
- [ ] Build output SÍ muestra "ƒ Middleware" con tamaño razonable (~34 kB)
