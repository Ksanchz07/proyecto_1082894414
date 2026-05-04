# Resumen Fase 1 — Bootstrap, Login y dataService base

## Objetivo
Implementar la base de autenticación y el acceso inicial a los datos del sistema, con soporte para modo seed cuando Supabase no está configurado.

## Acciones ejecutadas
- Creé `data/seed.json` con el usuario admin semilla.
- Implementé `src/lib/dataService.ts` con modo seed y soporte de usuarios desde `data/seed.json`.
- Añadí `src/lib/auth.ts`, `src/lib/withAuth.ts` y `src/lib/withRole.ts` para manejar JWT, cookies y autorización.
- Crear rutas API de autenticación:
  - `src/app/api/auth/login/route.ts`
  - `src/app/api/auth/logout/route.ts`
  - `src/app/api/auth/me/route.ts`
  - `src/app/api/auth/change-password/route.ts`
- Añadí rutas de sistema para modo y bootstrap:
  - `src/app/api/system/mode/route.ts`
  - `src/app/api/system/diagnose/route.ts`
  - `src/app/api/system/bootstrap/route.ts`
- Implementé la interfaz de login en `src/app/login/page.tsx` con identidad visual de CuentaFácil.
- Añadí páginas básicas de navegación:
  - `src/app/page.tsx` → redirige a `/login`
  - `src/app/dashboard/page.tsx`
  - `src/app/admin/db-setup/page.tsx`
- Agregué la migration `supabase/migrations/0001_init_users.sql` y soporte de seed.
- Actualicé el estado de ejecución en `doc/ESTADO_EJECUCION_CUENTAFACIL.md`.

## Archivos creados/modificados
- `src/lib/auth.ts`
- `src/lib/withAuth.ts`
- `src/lib/withRole.ts`
- `src/lib/dataService.ts`
- `src/lib/seedReader.ts`
- `src/lib/supabase.ts`
- `src/lib/pgMigrate.ts`
- `src/lib/blobAudit.ts`
- `src/lib/types.ts`
- `src/lib/schemas.ts`
- `src/app/login/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/admin/db-setup/page.tsx`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/auth/me/route.ts`
- `src/app/api/auth/change-password/route.ts`
- `src/app/api/system/mode/route.ts`
- `src/app/api/system/diagnose/route.ts`
- `src/app/api/system/bootstrap/route.ts`
- `data/seed.json`
- `supabase/migrations/0001_init_users.sql`
- `src/app/page.tsx`
- `src/app/globals.css`

## Decisiones técnicas y por qué
- La autenticación se basa en JWT firmado con `jose` y almacenado en cookie HttpOnly para seguridad.
- El modo seed permite iniciar sesión sin depender de Supabase, usando `data/seed.json` como fuente de usuarios.
- El `dataService` abstrae la forma de obtener usuarios y habilita la migración hacia Supabase en fases posteriores.
- El login no ofrece registro público, cumpliendo la restricción del plan.
- Se mantienen los campos de perfil del cobrador en la tabla `users` y en el seed también aparecen como `null` para admin.

## Problemas encontrados y resolución
- Se corrigió un error de tipo con `jose` al convertir `JWTPayload` a la interfaz interna `JwtPayload`.
- Se ajustó la creación de cookies para no requerir `Secure` en desarrollo y permitir pruebas locales.

## Qué se probó y resultado
- `npm run type-check` — sin errores.
- Estructura de rutas creada y compilación de TypeScript verificada.

## Estado final
- **EXITOSO**

## Prerrequisitos para la siguiente fase
- Revisar que la página de login y el flujo de auth funcionan en el navegador.
- Implementar el dashboard real y el bootstrap de migrations en modo live.
