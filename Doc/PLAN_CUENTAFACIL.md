# CuentaFácil — Plan Maestro del Sistema
> Generador Automático de Cuentas de Cobro | Versión 1.0
> Proyecto Fullstack Individual | Mayo 2026
> Stack: Next.js + TypeScript + Supabase Postgres + Vercel Blob + Vercel
> Estudiante: Keiner Sánchez | Doc: 1082894414

---

## Índice General

1. [Definición del sistema](#1-definición-del-sistema)
2. [Problema que resuelve](#2-problema-que-resuelve)
3. [Actores del sistema](#3-actores-del-sistema)
4. [Roles y permisos](#4-roles-y-permisos)
5. [Casos de uso](#5-casos-de-uso)
6. [Requerimientos funcionales](#6-requerimientos-funcionales)
7. [Reglas de negocio](#7-reglas-de-negocio)
8. [Stack tecnológico](#8-stack-tecnológico)
9. [Arquitectura de persistencia](#9-arquitectura-de-persistencia)
10. [Bootstrap y migrations](#10-bootstrap-y-migrations)
11. [Capa de datos unificada (dataService)](#11-capa-de-datos-unificada)
12. [Modelo de datos — Supabase Postgres](#12-modelo-de-datos--supabase-postgres)
13. [Plantilla de cuenta de cobro y generación de PDF](#13-plantilla-y-pdf)
14. [Auditoría en Vercel Blob](#14-auditoría-en-vercel-blob)
15. [Arquitectura de rutas](#15-arquitectura-de-rutas)
16. [Requerimientos no funcionales](#16-requerimientos-no-funcionales)
17. [Flujos de usuario y de trabajo](#17-flujos-de-usuario-y-de-trabajo)
18. [Diseño de interfaz](#18-diseño-de-interfaz)
19. [Plan de fases de implementación](#19-plan-de-fases-de-implementación)
20. [Restricciones del sistema](#20-restricciones-del-sistema)
21. [Glosario](#21-glosario)

---

## 1. Definición del sistema

**CuentaFácil** es una aplicación web que automatiza la generación de cuentas de cobro para trabajadores independientes y contratistas en Colombia. A partir de tres datos de entrada — NIT de la empresa, concepto del servicio y valor a cobrar — el sistema construye automáticamente un documento formal con todos los datos personales del cobrador (recuperados desde la base de datos), el número correlativo y la fecha del servidor. El documento puede visualizarse en pantalla e imprimirse como PDF directamente desde el navegador.

El nombre del producto es **CuentaFácil** — refleja la propuesta de valor central: generar la cuenta de cobro en segundos sin llenar formularios repetitivos.

---

## 2. Problema que resuelve

| Problema actual | Cómo lo resuelve CuentaFácil |
|---|---|
| El contratista llena manualmente cada cuenta de cobro con sus datos personales. | El sistema auto-completa nombre, CC, dirección y cuenta bancaria desde la DB. |
| Formatos inconsistentes entre documentos. | Plantilla estándar única para todas las cuentas generadas. |
| Fechas equivocadas o en blanco. | La fecha la asigna el servidor automáticamente — el usuario no puede modificarla. |
| Sin numeración correlativa. | Cada cuenta recibe un número correlativo por cobrador (1, 2, 3…). |
| Sin historial — los documentos se pierden. | Historial persistente con todos los documentos generados. |

---

## 3. Actores del sistema

| Actor | Tipo | Descripción |
|---|---|---|
| **Cobrador** | Principal | Trabajador independiente registrado. Genera cuentas de cobro ingresando NIT, concepto y valor. |
| **Administrador** | Secundario | Gestiona los perfiles de los cobradores (datos personales, cuenta bancaria). Crea los usuarios del sistema. |
| **Sistema** | No humano | Auto-completa los datos del cobrador, asigna fecha y número correlativo, guarda el historial, registra auditoría. |

> No hay registro público. El Administrador crea las cuentas de los cobradores con una contraseña temporal.

---

## 4. Roles y permisos

| Recurso / Acción | Cobrador | Administrador |
|---|:-:|:-:|
| Login / cambiar contraseña propia | ✅ | ✅ |
| Acceder a `/admin/db-setup` | ❌ | ✅ |
| **CUENTAS DE COBRO** | | |
| Generar nueva cuenta de cobro | ✅ | ❌ |
| Ver su propio historial | ✅ | ✅ |
| Ver detalle de una cuenta de cobro | ✅ | ✅ |
| Imprimir / descargar PDF | ✅ | ✅ |
| **PERFILES DE COBRADOR** | | |
| Ver sus propios datos personales | ✅ | ✅ |
| Crear / editar perfil de cobrador | ❌ | ✅ |
| Eliminar cobrador | ❌ | ✅ |
| **USUARIOS** | | |
| Crear / activar / suspender cuentas | ❌ | ✅ |
| **AUDITORÍA** | | |
| Ver bitácora de operaciones | ❌ | ✅ |

---

## 5. Casos de uso

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-A1 | Iniciar sesión | Todos | Correo y contraseña. Redirige al panel según el rol. |
| CU-A2 | Cerrar sesión | Todos | Elimina la cookie de sesión. |
| CU-A3 | Cambiar contraseña | Todos | Verifica la contraseña actual. |
| CU-01 | Generar cuenta de cobro | Cobrador | Ingresa NIT, concepto y valor. El sistema valida, auto-completa los datos del cobrador, asigna fecha y número correlativo, genera el documento y lo guarda en el historial. |
| CU-02 | Ver historial | Cobrador / Admin | Lista de todas las cuentas generadas por el cobrador con número, fecha, empresa (NIT) y valor. |
| CU-03 | Ver detalle / Imprimir PDF | Cobrador / Admin | Muestra la cuenta de cobro completa en formato de documento. Botón "Imprimir" usa `window.print()`. |
| CU-04 | Gestionar perfil del cobrador | Admin | Crea, edita y elimina perfiles (nombre, CC/NIT del cobrador, dirección, banco, número de cuenta, tipo de cuenta). |
| CU-05 | Crear usuario cobrador | Admin | Crea la cuenta de acceso y el perfil del cobrador. Contraseña temporal que el cobrador cambia en su primer login. |

---

## 6. Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-B1 | El sistema debe poder ejecutarse sin Supabase configurado, sirviendo el seed de `data/` para login inicial del admin. |
| RF-B2 | El sistema debe ofrecer `/admin/db-setup` para diagnóstico, migrations y seed. |
| RF-01 | El sistema permite login con correo y contraseña para los dos roles. |
| RF-02 | El cobrador puede ingresar NIT, concepto y valor para generar una cuenta de cobro. |
| RF-03 | El sistema recupera automáticamente los datos personales del cobrador desde la DB (RN-06). |
| RF-04 | La fecha del documento la asigna el servidor automáticamente — no puede modificarse (RN-02). |
| RF-05 | El sistema asigna un número correlativo único por cobrador a cada cuenta generada. |
| RF-06 | El sistema valida el NIT (solo números, 9–10 dígitos), el concepto (10–500 caracteres) y el valor (> 0) (RN-03, RN-04, RN-05). |
| RF-07 | El documento generado sigue siempre la misma plantilla estándar (RN-10). |
| RF-08 | El usuario puede visualizar la cuenta de cobro en pantalla e imprimirla como PDF con `window.print()`. |
| RF-09 | El historial muestra todas las cuentas de cobro del cobrador con número, fecha, NIT y valor. |
| RF-10 | El admin puede crear, editar y eliminar perfiles de cobrador (RN-09). |

---

## 7. Reglas de negocio

| ID | Regla | Implementación técnica |
|---|---|---|
| RN-01 | Solo usuarios registrados pueden generar cuentas de cobro. | `withAuth` en el endpoint de generación. |
| RN-02 | La fecha del documento es siempre la fecha del servidor — no modificable por el usuario. | `generated_at TIMESTAMPTZ DEFAULT NOW()` en la tabla. El frontend nunca envía la fecha. |
| RN-03 | El NIT debe contener solo dígitos y tener entre 9 y 10 caracteres (el dígito de verificación es opcional). | Zod: `z.string().regex(/^\d{9,10}$/)`. |
| RN-04 | El concepto es obligatorio, mínimo 10 caracteres y máximo 500. | Zod: `z.string().min(10).max(500)`. |
| RN-05 | El valor debe ser mayor a cero, expresado en COP. | Zod: `z.number().positive()`. CHECK en Postgres: `amount > 0`. |
| RN-06 | Los datos del cobrador se toman exclusivamente de la DB — el usuario no puede modificarlos en el formulario de generación. | El endpoint lee el perfil del cobrador desde la DB usando el `userId` del JWT. El request del cliente no incluye estos datos. |
| RN-07 | Cada cuenta generada queda en el historial con timestamp (RN-02 y RF-09). | INSERT con `DEFAULT NOW()`. |
| RN-08 | El sistema no valida si el NIT existe en registros externos (RUES, DIAN). | Solo validación de formato numérico. |
| RN-09 | Solo el admin puede crear, editar o eliminar perfiles de cobrador. | `withRole(['admin'])` en los endpoints de gestión de perfiles. |
| RN-10 | Todas las cuentas siguen la misma plantilla estándar. | Componente React `<InvoiceDocument>` que renderiza siempre con el mismo layout. |
| RN-11 | Si un cobrador tiene cuentas en el historial, no puede eliminarse físicamente. | Verificar `COUNT(*) FROM invoices WHERE cobrador_id = ?` antes de eliminar. Si > 0: retornar 409. |

---

## 8. Stack tecnológico

| Capa | Tecnología | Versión | Propósito |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.x | Rutas, server components, API routes |
| Lenguaje | TypeScript | 5.x | Tipado estático |
| UI | React | 19.x | Componentes del cliente |
| Estilos | Tailwind CSS | 4.x | Utilidades y responsive |
| Animaciones | Framer Motion | 12.x | Transiciones |
| Validación | Zod | 4.x | Validación servidor y cliente |
| Autenticación | JWT (jose) + bcryptjs | — | Sesiones con cookie HttpOnly |
| Base de datos | Supabase Postgres | — | Datos estructurados |
| Cliente DB (migrations) | `pg` (node-postgres) | 8.x | SQL crudo desde bootstrap |
| Cliente DB (queries) | `@supabase/supabase-js` | 2.x | Queries del día a día |
| PDF | `window.print()` + CSS `@media print` | — | Impresión directa desde el navegador |
| Auditoría | `@vercel/blob` | — | Logs append-only |
| Iconos | Lucide React | — | Iconografía |
| Deploy | Vercel | — | Hosting serverless |

> **Por qué `window.print()` en lugar de una librería PDF:** La cuenta de cobro colombiana es un documento de texto estructurado — no requiere cálculos de layout complejos. Con CSS de impresión adecuado (`@media print { .no-print { display: none } }`) el documento se imprime con calidad profesional desde cualquier navegador. Sin dependencias de servidor, sin procesamiento adicional, sin coste en tiempo de respuesta.

### Variables de entorno requeridas

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
JWT_SECRET=
ADMIN_BOOTSTRAP_SECRET=
```

---

## 9. Bootstrap y migrations

### 9.1 Estructura de `data/` (solo semilla)

```
data/
  config.json     ← { "version": "1.0", "system_name": "CuentaFácil" }
  seed.json       ← {
                      "users": [{
                        email: "admin@cuentafacil.com",
                        password_hash: "<bcrypt admin123>",
                        name: "Administrador",
                        role: "admin"
                      }]
                    }
  README.md
```

### 9.2 Estructura de `supabase/migrations/`

```
supabase/migrations/
  0001_init_users.sql      ← Fase 1: users (con campos de perfil del cobrador) + _migrations
  0002_init_invoices.sql   ← Fase 3: invoices
```

---

## 10. Capa de datos unificada

`lib/dataService.ts` es el **único punto de acceso a datos** desde el resto de la aplicación.

### 10.1 API pública del `dataService`

```typescript
// Sistema
export async function getSystemMode(): Promise<'seed' | 'live'>

// Auth y usuarios
export async function getUserByEmail(email: string): Promise<User | null>
export async function getUserById(id: string): Promise<User | null>
export async function createUser(data: CreateUserRequest): Promise<User>
export async function updateUser(id: string, data: UpdateUserRequest): Promise<User>
export async function listCobradores(): Promise<CobradorProfile[]>
export async function deleteUser(id: string): Promise<void>

// Cuentas de cobro
export async function generateInvoice(userId: string, data: GenerateInvoiceRequest): Promise<Invoice>
export async function getInvoices(userId: string): Promise<Invoice[]>
export async function getInvoiceById(id: string, userId: string): Promise<InvoiceWithProfile | null>
export async function getNextInvoiceNumber(userId: string): Promise<number>

// Auditoría
export async function recordAudit(entry: AuditEntry): Promise<void>
export async function readAuditMonth(yyyymm: string): Promise<AuditEntry[]>
```

### 10.2 Lógica crítica: `generateInvoice`

```typescript
export async function generateInvoice(
  userId: string,
  data: GenerateInvoiceRequest
): Promise<Invoice> {
  // 1. Obtener el perfil completo del cobrador desde la DB (RN-06)
  //    El cliente nunca envía estos datos — el servidor los lee directamente.
  const cobrador = await getUserById(userId);
  if (!cobrador || cobrador.role !== 'cobrador') {
    throw new ForbiddenError('Solo los cobradores pueden generar cuentas de cobro');
  }

  // 2. Calcular el número correlativo del cobrador (RF-05)
  const nextNumber = await getNextInvoiceNumber(userId);

  // 3. Insertar la cuenta en el historial con timestamp del servidor (RN-02, RN-07)
  const { data: invoice } = await supabase
    .from('invoices')
    .insert({
      cobrador_id: userId,
      invoice_number: nextNumber,
      // Snapshot de los datos del cobrador al momento de generar
      cobrador_name: cobrador.name,
      cobrador_cc: cobrador.identification_number,
      cobrador_address: cobrador.address,
      cobrador_bank: cobrador.bank_name,
      cobrador_account: cobrador.bank_account,
      cobrador_account_type: cobrador.account_type,
      // Datos ingresados por el usuario
      company_nit: data.companyNit,
      concept: data.concept,
      amount: data.amount,
      // generated_at lo asigna Postgres con DEFAULT NOW()
    })
    .select()
    .single();

  await recordAudit({
    action: 'generate_invoice',
    entity: 'invoice',
    entity_id: invoice.id,
    summary: `Cuenta de cobro #${nextNumber} generada. NIT: ${data.companyNit}, Valor: $${data.amount.toLocaleString('es-CO')}`,
  });

  return invoice.data;
}
```

> **Snapshot de datos del cobrador:** los campos del cobrador se copian en cada factura al momento de generarla. Si después el admin actualiza la dirección o la cuenta bancaria, las facturas anteriores conservan los datos que tenían en el momento de su emisión. Esto garantiza la integridad del historial documental.

### 10.3 Lógica de numeración correlativa

```typescript
export async function getNextInvoiceNumber(userId: string): Promise<number> {
  const { count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('cobrador_id', userId);
  return (count ?? 0) + 1;
}
```

---

## 11. Modelo de datos — Supabase Postgres

### Migration `0001_init_users.sql`

```sql
-- La tabla users contiene tanto las credenciales de acceso
-- como los datos del perfil del cobrador (RN-06).
-- Para los admins, los campos de perfil quedan NULL.
CREATE TABLE IF NOT EXISTS users (
  id                    UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name                  VARCHAR(150) NOT NULL,
  email                 VARCHAR(255) UNIQUE NOT NULL,
  password_hash         TEXT         NOT NULL,
  role                  VARCHAR(10)  NOT NULL DEFAULT 'cobrador'
                        CHECK (role IN ('cobrador', 'admin')),
  is_active             BOOLEAN      DEFAULT true,
  must_change_password  BOOLEAN      DEFAULT false,
  -- Datos del perfil del cobrador (solo para role='cobrador')
  identification_number VARCHAR(20),   -- CC o NIT del cobrador
  address               TEXT,
  bank_name             VARCHAR(100),
  bank_account          VARCHAR(30),
  account_type          VARCHAR(20)
                        CHECK (account_type IN ('ahorros', 'corriente', NULL)),
  last_login_at         TIMESTAMPTZ,
  created_at            TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);
```

### Migration `0002_init_invoices.sql`

```sql
CREATE TABLE IF NOT EXISTS invoices (
  id                    UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  cobrador_id           UUID          NOT NULL REFERENCES users(id),
  invoice_number        INTEGER       NOT NULL,  -- correlativo por cobrador
  -- Snapshots del cobrador al momento de generar (integridad documental)
  cobrador_name         VARCHAR(150)  NOT NULL,
  cobrador_cc           VARCHAR(20)   NOT NULL,
  cobrador_address      TEXT,
  cobrador_bank         VARCHAR(100),
  cobrador_account      VARCHAR(30),
  cobrador_account_type VARCHAR(20),
  -- Datos del documento
  company_nit           VARCHAR(15)   NOT NULL,
  concept               TEXT          NOT NULL,
  amount                DECIMAL(14,2) NOT NULL CHECK (amount > 0),  -- RN-05
  generated_at          TIMESTAMPTZ   DEFAULT NOW(),  -- RN-02: el servidor asigna
  UNIQUE (cobrador_id, invoice_number)  -- número único por cobrador
);

CREATE INDEX IF NOT EXISTS idx_invoices_cobrador ON invoices(cobrador_id, generated_at DESC);
```

---

## 12. Plantilla y PDF

### 12.1 Estrategia de generación

La cuenta de cobro se renderiza como una página React (`/invoices/[id]/print`) con CSS específico de impresión. Al hacer clic en "Imprimir PDF", se llama `window.print()`. El CSS oculta todo excepto el documento:

```css
@media print {
  .no-print { display: none !important; }
  body { background: white; }
  .invoice-document { box-shadow: none; border: none; }
}
```

El usuario imprime desde el diálogo del navegador y puede guardar como PDF (opción estándar en todos los navegadores modernos: Chrome, Firefox, Safari, Edge).

### 12.2 Estructura del documento (plantilla estándar)

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│               CUENTA DE COBRO                       │
│                  No. 0042                           │
│                                                     │
│  Fecha: Santa Marta, 29 de abril de 2026            │
│                                                     │
├─────────────────────────────────────────────────────┤
│  COBRADOR                                           │
│  Nombre:           Keiner Andrés Sánchez            │
│  C.C.:             1.082.894.414                    │
│  Dirección:        Calle 10 # 5-32, Santa Marta     │
│                                                     │
├─────────────────────────────────────────────────────┤
│  EMPRESA PAGADORA                                   │
│  NIT:              900.123.456-7                    │
│                                                     │
├─────────────────────────────────────────────────────┤
│  CONCEPTO                                           │
│  Prestación de servicios de consultoría en          │
│  sistemas de información para el mes de abril       │
│  de 2026.                                           │
│                                                     │
├─────────────────────────────────────────────────────┤
│  VALOR A COBRAR                                     │
│  $1.500.000                                         │
│  (Un millón quinientos mil pesos colombianos M/CTE) │
│                                                     │
├─────────────────────────────────────────────────────┤
│  DATOS BANCARIOS                                    │
│  Banco:            Bancolombia                      │
│  Tipo de cuenta:   Ahorros                          │
│  No. de cuenta:    123-456789-01                    │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  _______________________________                    │
│  Firma del Cobrador                                 │
│  Keiner Andrés Sánchez                              │
│  C.C. 1.082.894.414                                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 12.3 Valor en letras

El sistema debe mostrar el monto en letras (ej: "Un millón quinientos mil pesos colombianos M/CTE"). Implementar la función `numberToWords(amount: number): string` en `lib/numberToWords.ts`. Esta función convierte el número a su representación en español colombiano.

---

## 13. Auditoría en Vercel Blob

```typescript
type AuditEntry = {
  id: string;
  timestamp: string;
  user_id: string;
  user_email: string;
  user_role: 'cobrador' | 'admin';
  action:
    | 'login' | 'logout'
    | 'generate_invoice'
    | 'create_cobrador' | 'update_cobrador' | 'delete_cobrador'
    | 'create_user' | 'toggle_user'
    | 'bootstrap';
  entity: 'invoice' | 'user' | 'system';
  entity_id?: string;
  summary: string;
  metadata?: Record<string, unknown>;
};
```

---

## 14. Arquitectura de rutas

```
app/
  layout.tsx
  page.tsx                          ← Redirige a /dashboard o /login
  login/page.tsx                    ← Sin link de registro
  dashboard/page.tsx                ← Historial del cobrador + botón "Nueva cuenta"
  invoices/
    new/page.tsx                    ← Formulario de generación (cobrador)
    [id]/page.tsx                   ← Vista previa del documento
    [id]/print/page.tsx             ← Página de impresión (solo el documento, sin nav)
  profile/page.tsx                  ← Ver mis datos de cobrador + cambiar contraseña
  admin/
    db-setup/page.tsx
    cobradores/page.tsx             ← Lista de cobradores con sus datos
    cobradores/new/page.tsx         ← Crear cobrador + su cuenta de usuario
    cobradores/[id]/edit/page.tsx   ← Editar datos del cobrador
    users/page.tsx                  ← Activar/suspender usuarios
    audit/page.tsx

  api/
    system/bootstrap | diagnose | mode
    auth/login | logout | me | change-password
    invoices/
      route.ts                      ← GET historial | POST generar
      [id]/route.ts                 ← GET detalle
    admin/
      cobradores/route.ts           ← GET lista | POST crear
      cobradores/[id]/route.ts      ← GET | PUT | DELETE
    users/route.ts | [id]/route.ts
    audit/route.ts

components/
  ui/
  layout/                           ← AppLayout, Sidebar, SeedModeBanner
  invoices/                         ← InvoiceForm, InvoiceDocument,
                                       InvoiceRow, PrintButton
  admin/                            ← DiagnosticPanel, BootstrapPanel,
                                       CobradorForm, AuditViewer

lib/
  dataService.ts | supabase.ts | blobAudit.ts | pgMigrate.ts | seedReader.ts
  numberToWords.ts
  auth.ts | withAuth.ts | withRole.ts | types.ts | schemas.ts | dateUtils.ts
```

---

## 15. Requerimientos no funcionales

| ID | Requerimiento |
|---|---|
| RNF-01 | La generación de la cuenta de cobro debe completarse en menos de 1 segundo. |
| RNF-02 | El documento impreso debe ser idéntico al visualizado en pantalla. |
| RNF-03 | La interfaz debe ser funcional en celulares — muchos cobradores acceden desde el teléfono. |
| RNF-04 | Las contraseñas se hashean con bcrypt. |
| RNF-05 | Las sesiones se gestionan con JWT en cookie HttpOnly. |
| RNF-06 | Los montos se muestran en formato COP: `$1.500.000` en toda la interfaz. |
| RNF-07 | Los documentos generados deben tener aspecto profesional y formal — aptos para presentar a empresas. |

---

## 16. Flujos de usuario y de trabajo

### Flujo de bootstrap

Login admin del seed → banner modo seed → `/admin/db-setup` → ejecutar bootstrap → modo live. Después el admin crea el primer cobrador desde `/admin/cobradores/new`.

### Flujo de generación de cuenta de cobro

| Paso | Actor | Acción |
|---|---|---|
| 1 | Cobrador | Hace clic en "Nueva Cuenta de Cobro" desde el dashboard. |
| 2 | Cobrador | Ingresa el NIT de la empresa (9–10 dígitos), el concepto (10–500 chars) y el valor en COP. |
| 3 | Sistema | Valida los tres campos con Zod. Si hay errores: muestra mensajes inline y no procede. |
| 4 | Sistema | Lee el perfil del cobrador desde la DB (nombre, CC, dirección, banco, cuenta). |
| 5 | Sistema | Calcula el número correlativo (total de facturas previas + 1). |
| 6 | Sistema | Inserta la cuenta en `invoices` con `DEFAULT NOW()` como fecha. |
| 7 | Sistema | Redirige a `/invoices/[id]` — vista de la cuenta generada. |
| 8 | Cobrador | Revisa el documento, hace clic en "Imprimir / Guardar PDF". |
| 9 | Sistema | Navega a `/invoices/[id]/print` y llama `window.print()` automáticamente. |

---

## 17. Diseño de interfaz

### Identidad visual del Login

CuentaFácil es una herramienta profesional para contratistas. El diseño transmite seriedad, claridad y eficiencia administrativa.

| Elemento | Especificación |
|---|---|
| **Layout** | Pantalla completa. Formulario centrado. |
| **Fondo** | Azul marino suave (`#EFF3FB`). |
| **Tarjeta** | Fondo blanco, `border-radius: 12px`, sombra suave, borde superior de 4px en azul índigo (`#4F46E5`), max-w-sm. |
| **Logo** | SVG de un documento con sello de aprobación en azul índigo, 48px. |
| **Nombre** | "CuentaFácil" en Inter SemiBold 28px, azul oscuro (`#1E3A8A`). |
| **Tagline** | "Genera tu cuenta de cobro en segundos." Inter Regular 13px, gris (`#6B7280`). |
| **Campos** | Borde gris (`#D1D5DB`), focus en azul índigo (`#4F46E5`). |
| **Botón** | bg `#4F46E5`, texto blanco, hover `#4338CA`. |
| **Pie** | Sin link de registro. |
| **Animación** | Framer Motion: `opacity: 0→1`, `y: 10→0`, 0.4s. |

### Paleta de colores

| Elemento | Hex |
|---|---|
| Primario (azul índigo) | `#4F46E5` |
| Primario oscuro | `#4338CA` |
| Primario claro | `#EEF2FF` |
| Fondo principal | `#F8FAFC` |
| Fondo de tarjetas | `#FFFFFF` |
| Texto principal | `#111827` |
| Texto secundario | `#6B7280` |
| Éxito | `#16A34A` |
| Error | `#DC2626` |
| Advertencia | `#D97706` |
| Bordes | `#E5E7EB` |
| Banner modo seed | Fondo `#FEF3C7`, texto `#92400E`, borde `#F59E0B` |

### Componentes clave

| Componente | Descripción |
|---|---|
| `InvoiceForm` | Formulario con 3 campos: NIT (input numérico), Concepto (textarea), Valor (input numérico con formato COP en tiempo real). Validación inline con mensajes bajo cada campo. |
| `InvoiceDocument` | Componente React que renderiza la plantilla de la cuenta de cobro. Tiene estilos normales para pantalla y `@media print` para impresión. |
| `InvoiceRow` | Fila del historial: número de cuenta, fecha, NIT de la empresa, valor en COP. Enlace al detalle. |
| `PrintButton` | Botón "🖨️ Imprimir / Guardar PDF" que navega a la página de impresión y llama `window.print()`. Tiene clase `no-print` para no aparecer en el documento impreso. |
| `CobradorForm` | Formulario de datos del cobrador: nombre, CC, dirección, banco, número de cuenta, tipo de cuenta. |

### Página de impresión (`/invoices/[id]/print`)

Esta página es especial: renderiza solo el `InvoiceDocument` sin ningún elemento de navegación. Al cargar, ejecuta `window.print()` automáticamente con `useEffect`. Tiene un mensaje de fallback: "Si la impresión no se abrió automáticamente, haz clic aquí." con un botón que también llama `window.print()`.

---

## 18. Plan de fases de implementación

### Fase 1 — Bootstrap, Login y `dataService` base
> Rol: Ingeniero Fullstack Senior — Arquitecto del sistema y seguridad

| # | Tarea |
|---|---|
| 1.1 | Instalar: `bcryptjs jose @supabase/supabase-js @vercel/blob pg @types/bcryptjs @types/pg` |
| 1.2 | Crear proyecto en Supabase. Blob Store privado. Variables de entorno. |
| 1.3 | Crear `data/seed.json` con el admin. |
| 1.4 | Crear `supabase/migrations/0001_init_users.sql` con la tabla `users` incluyendo los campos de perfil del cobrador (`identification_number`, `address`, `bank_name`, `bank_account`, `account_type`). |
| 1.5 | Crear `lib/supabase.ts`, `lib/blobAudit.ts` (getBlobToken lazy, withFileLock, get() del SDK), `lib/pgMigrate.ts`, `lib/seedReader.ts`. |
| 1.6 | Crear `lib/dataService.ts` con `getSystemMode`, auth de usuarios y `recordAudit`. |
| 1.7 | Crear `lib/auth.ts`, `lib/withAuth.ts`, `lib/withRole.ts`. JWT incluye `role`. |
| 1.8 | Crear `next.config.ts` con headers `no-store`. |
| 1.9 | API Routes: bootstrap, diagnose, mode, login, logout, me, change-password. |
| 1.10 | Crear `app/login/page.tsx` con la identidad visual de CuentaFácil: azul índigo, logo de documento, sin link de registro. |
| 1.11 | `npm run typecheck` sin errores. Probar: login admin → cookie → modo seed. |

---

### Fase 2 — Layout, Dashboard y bootstrap
> Rol: Diseñador Frontend Obsesivo + Ingeniero de Sistemas

| # | Tarea |
|---|---|
| 2.1 | Crear componentes UI base: Button, Card, Badge, Toast, Modal, EmptyState, Table. |
| 2.2 | Configurar variables CSS de la paleta azul índigo en `globals.css`. Inter con `next/font`. |
| 2.3 | Crear `AppLayout.tsx`: sidebar. Cobrador: Inicio (historial), Nueva Cuenta, Mi Perfil. Admin: Cobradores, Usuarios, Auditoría, Bootstrap. |
| 2.4 | Crear `/admin/db-setup/page.tsx`. |
| 2.5 | Crear `SeedModeBanner.tsx`. |
| 2.6 | Crear `middleware.ts`: `/admin/*` solo para admin. Cobrador → redirect a /dashboard si intenta /admin/*. |
| 2.7 | Crear `app/dashboard/page.tsx`: placeholder del historial (vacío hasta Fase 3) + botón prominente "Nueva Cuenta de Cobro". |
| 2.8 | Probar: bootstrap → modo live. |

---

### Fase 3 — Gestión de Cobradores
> Rol: Ingeniero Fullstack — Perfiles de cobrador con datos bancarios

| # | Tarea |
|---|---|
| 3.1 | Agregar tipos `CobradorProfile`, `CreateCobradorRequest`, `UpdateCobradorRequest` y schemas Zod. |
| 3.2 | Extender `dataService`: `listCobradores`, `createUser` (con todos los campos de perfil), `updateUser` (solo los campos permitidos), `deleteUser` (verifica RN-11). |
| 3.3 | El `createUser` del cobrador genera contraseña temporal, `must_change_password=true`, retorna la contraseña en claro una sola vez para que el admin se la entregue al cobrador. |
| 3.4 | En login: si `must_change_password=true` → redirect a `/profile` para cambio obligatorio. |
| 3.5 | API Routes con `withRole(['admin'])`: `GET/POST /api/admin/cobradores`, `GET/PUT/DELETE /api/admin/cobradores/[id]`. DELETE verifica RN-11. |
| 3.6 | Crear `app/admin/cobradores/page.tsx`: tabla de cobradores con sus datos. |
| 3.7 | Crear `app/admin/cobradores/new/page.tsx` y `[id]/edit/page.tsx`: formulario con todos los campos del perfil. |
| 3.8 | Crear `app/profile/page.tsx`: el cobrador ve sus datos (solo lectura) + formulario de cambio de contraseña. |
| 3.9 | Probar: crear cobrador → contraseña temporal visible una vez → cobrador hace login → redirige a /profile para cambiar contraseña → accede al dashboard. |
| 3.10 | Verificar RN-11: intentar eliminar un cobrador con facturas (insertar manualmente en Supabase) → 409. |

---

### Fase 4 — Generación de Cuentas de Cobro, Historial y PDF
> Rol: Ingeniero Fullstack + Diseñador Frontend — Operación central del sistema

| # | Tarea |
|---|---|
| 4.1 | Crear `supabase/migrations/0002_init_invoices.sql`. Aplicar desde `/admin/db-setup`. |
| 4.2 | Crear `lib/numberToWords.ts`: función `numberToWords(amount: number): string` que convierte montos a texto en español colombiano. Ej: `1500000 → "Un millón quinientos mil pesos colombianos M/CTE"`. Implementar para millones, miles y centenas. |
| 4.3 | Agregar tipos `Invoice`, `InvoiceWithProfile`, `GenerateInvoiceRequest` y schemas Zod (RN-03, RN-04, RN-05). |
| 4.4 | Extender `dataService`: `generateInvoice` (secuencia completa de sección 10.2), `getInvoices` (del cobrador autenticado), `getInvoiceById` (verifica que pertenece al cobrador — RN-01), `getNextInvoiceNumber`. |
| 4.5 | API Routes: `POST /api/invoices` (cobrador — genera), `GET /api/invoices` (historial del cobrador), `GET /api/invoices/[id]` (cobrador — verifica propiedad). |
| 4.6 | Crear el componente `InvoiceDocument.tsx`: renderiza la plantilla completa con todos los campos del spec (sección 12.2). Incluye la función `numberToWords` para el monto en letras. Tiene clases `no-print` para los botones de acción. |
| 4.7 | Crear `app/invoices/new/page.tsx`: `InvoiceForm` con validación inline (RN-03, RN-04, RN-05). Al enviar, muestra un spinner, llama a POST /api/invoices y redirige a `/invoices/[id]`. |
| 4.8 | Crear `app/invoices/[id]/page.tsx`: renderiza el `InvoiceDocument` con los datos reales, botón "🖨️ Imprimir / Guardar PDF" que navega a `/invoices/[id]/print`. |
| 4.9 | Crear `app/invoices/[id]/print/page.tsx`: página especial que renderiza SOLO el `InvoiceDocument` sin ningún layout. En `useEffect`: `window.print()`. CSS `@media print { body { margin: 0 } .no-print { display: none } }`. |
| 4.10 | Conectar `app/dashboard/page.tsx` con el historial real: tabla de `InvoiceRow` con enlace a cada documento. |
| 4.11 | Verificar RN-02: el campo `generated_at` del documento es el timestamp del servidor — verificar en Supabase que no es el del cliente. |
| 4.12 | Verificar RN-06: el request de generación solo contiene `{ companyNit, concept, amount }` — el servidor lee los datos del cobrador de la DB, no del request. Verificar que la tabla `invoices` tiene los snapshots correctos. |
| 4.13 | Verificar la numeración correlativa: generar 3 cuentas → números 1, 2, 3 secuenciales. |
| 4.14 | Probar la impresión en Chrome: `/invoices/[id]/print` → el diálogo de impresión se abre automáticamente → "Guardar como PDF" → verificar que el documento tiene aspecto profesional sin elementos de navegación. |

---

### Fase 5 — Auditoría y Pulido Final
> Rol: Diseñador Frontend Obsesivo + Ingeniero Fullstack

| # | Tarea |
|---|---|
| 5.1 | Crear `app/admin/users/page.tsx` y `app/admin/audit/page.tsx`. |
| 5.2 | Empty states: historial vacío del cobrador ("Aún no has generado ninguna cuenta de cobro. ¡Crea la primera!"), lista de cobradores vacía, historial del admin sin datos. |
| 5.3 | Manejo de errores: 401 (sesión expirada), 403 (cobrador intenta acceder al admin), 400 (validación de NIT/concepto/valor — mensajes específicos por campo), 500. |
| 5.4 | Verificar la plantilla del documento en distintos escenarios: monto con millones, con miles, exactamente 1000, campo dirección muy largo. Ajustar CSS de la plantilla si hay desbordamientos. |
| 5.5 | Verificar que los montos en formato COP se ven correctamente: `$1.500.000`, `$350.000`, `$12.000.000`. |
| 5.6 | `npm run typecheck`, `npm run lint`, `npm run build` — cero errores. |
| 5.7 | Deploy en Vercel con todas las variables de entorno. |
| 5.8 | Probar en producción el flujo completo: admin → bootstrap → crear cobrador → cobrador hace login → cambia contraseña → genera cuenta de cobro → imprime PDF desde Chrome → verifica el documento. |

---

## 19. Restricciones del sistema

| ID | Restricción | Descripción |
|---|---|---|
| RS-01 | Sin registro público | Los cobradores los crea el admin. |
| RS-02 | Sin recuperación de contraseña por correo | Solo cambio de contraseña autenticado. Sin Resend en v1. |
| RS-03 | PDF vía `window.print()` | Sin librería de PDF en el servidor. El usuario guarda como PDF desde el diálogo del navegador. |
| RS-04 | Sin validación de NIT en RUES o DIAN | Solo validación de formato numérico (RN-08). |
| RS-05 | Bootstrap obligatorio | Hasta aplicar migrations + seed, solo permite login admin. |
| RS-06 | Plantilla fija | El sistema tiene una sola plantilla de cuenta de cobro. Personalización queda para v2. |

---

## 20. Glosario

| Término | Definición |
|---|---|
| **Cuenta de cobro** | Documento colombiano usado por contratistas e independientes para cobrar honorarios por servicios prestados. No es una factura electrónica — es un documento más simple. |
| **NIT** | Número de Identificación Tributaria. Identificador fiscal de las empresas en Colombia. 9–10 dígitos. |
| **Cobrador** | Trabajador independiente o contratista que usa CuentaFácil para generar sus cuentas de cobro. |
| **Número correlativo** | Número secuencial (1, 2, 3…) que identifica cada cuenta de cobro generada por un cobrador. Único por cobrador. |
| **Snapshot** | Copia de los datos del cobrador al momento de generar la factura. Preserva la integridad histórica del documento. |
| **`window.print()`** | Método nativo del navegador que abre el diálogo de impresión. Permite guardar como PDF desde cualquier navegador. |
| **Bootstrap** | Proceso inicial donde el admin aplica migrations y carga el seed. |
| **dataService** | Único punto de acceso a datos. |
| **JWT** | JSON Web Token — credencial firmada en cookie HttpOnly. |

---

> Última actualización: Mayo 2026
> Keiner Sánchez | Doc: 1082894414
> Curso: Lógica y Programación — SIST0200
