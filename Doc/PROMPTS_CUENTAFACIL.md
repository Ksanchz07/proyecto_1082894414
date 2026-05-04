# PROMPTS DE IMPLEMENTACIÓN — CuentaFácil
> Prompts secuenciales para construir el sistema fase por fase
> Plan de referencia: `doc/PLAN_CUENTAFACIL.md`
> Estado de progreso: `doc/ESTADO_EJECUCION_CUENTAFACIL.md`

---

## INSTRUCCIONES DE USO

1. Ejecuta primero el **Prompt 0** — crea el archivo de seguimiento del proyecto.
2. Para cada fase siguiente, copia el bloque completo y pégalo en tu sesión de IA.
3. La IA leerá el plan, ejecutará la fase y dejará el estado actualizado.
4. No avances a la siguiente fase hasta que el resumen esté generado y el estado marcado como completado.

---

## PROTOCOLO DE EJECUCIÓN — APLICA A TODOS LOS PROMPTS

```
ANTES de escribir código:
1. Leer doc/PLAN_CUENTAFACIL.md
2. Leer doc/ESTADO_EJECUCION_CUENTAFACIL.md
3. Verificar que las fases previas estén completadas
4. Registrar inicio: estado En progreso + fecha y hora

DESPUÉS de completar el trabajo:
5. Registrar cierre: estado Completada + fecha y hora
6. Documentar: acciones ejecutadas, archivos creados/modificados, observaciones
7. Crear doc/RESUMEN_FASE_N_NOMBRE.md con: objetivo, acciones, archivos,
   decisiones técnicas y por qué, problemas encontrados y resolución,
   qué se probó y resultado, estado final EXITOSO / CON OBSERVACIONES / FALLIDO,
   prerrequisitos para la siguiente fase

NUNCA avanzar sin completar este protocolo.
```

---

---

## PROMPT 0 — Crear archivo de estado del proyecto

```
Actúa como Ingeniero de Proyectos. Tu única tarea es leer
doc/PLAN_CUENTAFACIL.md y crear el archivo
doc/ESTADO_EJECUCION_CUENTAFACIL.md.

El archivo debe contener:
- Información del proyecto: nombre, archivos de referencia, estudiante,
  fecha de inicio, estado general
- Dashboard de fases: tabla con todas las fases del plan incluyendo número,
  nombre, rol asignado, estado (todas inician como Pendiente), columnas para
  fecha de inicio, fecha de cierre y archivo de resumen
- Leyenda de estados: Pendiente, En progreso, Completada, Bloqueada, Pausada
- Historial de ejecución: sección append-only con fecha, hora, fase, evento y detalle

Toma los datos directamente del plan. No inventes fases ni cambies nombres ni roles.

Cuando termines escribe en el chat el nombre de cada fase detectada y confirma
que el archivo está listo para comenzar la Fase 1.

Tu trabajo termina aquí.
```

---

---

## PROMPT FASE 1 — Bootstrap, Login y `dataService` base

### Rol: `Ingeniero Fullstack Senior — Arquitecto del sistema y seguridad`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en
arquitectura de persistencia serverless, autenticación segura con JWT y
diseño de sistemas de gestión documental para el sector de servicios en
Colombia.

Tu mentalidad: CuentaFácil es una herramienta de trabajo real para
contratistas colombianos. Su propósito es eliminar el tiempo que pierde
un profesional llenando el mismo documento a mano una y otra vez. La
arquitectura tiene que ser sólida y la experiencia tiene que ser rápida
— el contratista genera su cuenta de cobro, la imprime y la envía, en
menos de 2 minutos.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_CUENTAFACIL.md — secciones 8 (stack — nota que CuentaFácil
   NO usa Resend), 9 (estructura del seed.json con solo el admin), 11
   (la lógica crítica de generateInvoice — especialmente la sección de
   por qué el request del cliente NO incluye los datos del cobrador), 12
   (modelo de datos — nota que los campos de perfil del cobrador están
   en la tabla users, no en una tabla separada), y 18 (identidad visual
   del login — azul índigo, logo de documento)
2. doc/ESTADO_EJECUCION_CUENTAFACIL.md — registra el inicio de la Fase 1

Puntos críticos que no puedes ignorar:

— Los campos de perfil del cobrador (identification_number, address,
  bank_name, bank_account, account_type) van directamente en la tabla
  users como columnas nullable. Los usuarios admin tienen esos campos
  en NULL. Esto simplifica el modelo — no hay tabla cobrador_profiles
  separada, no hay joins complejos.

— No hay registro público. El formulario de login no tiene link de
  "Crear cuenta". El admin crea los usuarios cobrador desde el panel.

— El JWT incluye el role ('cobrador' o 'admin'). La redirección
  post-login es: ambos roles → /dashboard (el cobrador ve su historial;
  el admin ve el panel de gestión de cobradores).

— El token de Blob lazy, get() del SDK de Blob, withFileLock — patrón
  estándar del curso.

— La identidad visual del login: fondo azul marino suave (#EFF3FB),
  logo de documento con sello de aprobación en azul índigo (#4F46E5),
  tipografía Inter. Sección 18 del plan.

Al terminar:
- npm run typecheck — cero errores
- Probar: login admin del seed → cookie HttpOnly con role='admin' → modo seed
- Registra el cierre en ESTADO_EJECUCION_CUENTAFACIL.md
- Crea doc/RESUMEN_FASE_1_BOOTSTRAP.md

Tu trabajo termina aquí. No avances a la Fase 2.
```

---

---

## PROMPT FASE 2 — Layout, Dashboard y bootstrap

### Rol: `Diseñador Frontend Obsesivo + Ingeniero de Sistemas`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero de
Sistemas trabajando en conjunto. CuentaFácil es una herramienta
profesional — el sidebar tiene que ser limpio y funcional, y el botón
"Nueva Cuenta de Cobro" tiene que ser el elemento más prominente del
dashboard porque es la acción principal del sistema.

Tu mentalidad: un contratista que entra a CuentaFácil tiene una sola
cosa en mente — generar su cuenta de cobro para cobrarle al cliente de
hoy. El dashboard no puede ser una pantalla de bienvenida genérica: tiene
que ofrecer acceso inmediato a esa acción con un botón grande y claro.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_CUENTAFACIL.md — paleta de colores (sección 18 — azul índigo
   como primario), los sidebars por rol (cobrador vs admin), los componentes
   InvoiceRow y EmptyState, y la Fase 2 completa
2. doc/ESTADO_EJECUCION_CUENTAFACIL.md — verifica Fase 1 completada,
   registra inicio de Fase 2

Puntos críticos que no puedes ignorar:

— El sidebar del cobrador: "Inicio" (historial), "Nueva Cuenta de Cobro"
  (acción principal), "Mi Perfil". Sin más opciones.
  El sidebar del admin: "Cobradores", "Usuarios", "Auditoría",
  "Administración del Sistema". El admin NO ve "Nueva Cuenta" — esa
  acción es solo para cobradores.

— En el dashboard del cobrador, el botón "Nueva Cuenta de Cobro" es el
  CTA principal: color azul índigo (#4F46E5), tamaño grande, con ícono
  de documento. No puede pasar desapercibido.

— El dashboard del admin muestra un listado de cobradores con el número
  de cuentas generadas por cada uno (métrica agregada, no datos de las
  cuentas). En esta fase puede ser un placeholder.

— El middleware protege /admin/* solo para role='admin'. El cobrador que
  intenta acceder a /admin/cobradores recibe redirect a /dashboard.

— La página /admin/db-setup informa: "Aplicará 2 migrations y cargará:
  1 usuario admin."

Al terminar:
- Probar el sidebar con ambos roles
- Verificar que el botón "Nueva Cuenta de Cobro" no aparece para el admin
- Bootstrap completo → modo live
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_2_LAYOUT.md

Tu trabajo termina aquí. No avances a la Fase 3.
```

---

---

## PROMPT FASE 3 — Gestión de Cobradores

### Rol: `Ingeniero Fullstack — Perfiles de cobrador con datos bancarios`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack especializado en gestión
de perfiles de usuarios con datos sensibles (cuentas bancarias) y flujos
de incorporación segura con contraseñas temporales.

Tu mentalidad: los datos del cobrador (nombre, CC, dirección, banco,
cuenta) son la materia prima de cada cuenta de cobro que se genere.
Si están mal cargados, todas las cuentas que genere ese cobrador van a
tener errores. El admin tiene que poder revisarlos y corregirlos en
cualquier momento.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_CUENTAFACIL.md — la migration 0001 (tabla users con los
   campos de perfil del cobrador en la misma tabla), regla RN-11 (cobrador
   con facturas no puede eliminarse), regla RN-09 (solo admin edita perfiles),
   el flujo de contraseña temporal, y la Fase 3 completa
2. doc/ESTADO_EJECUCION_CUENTAFACIL.md — verifica Fases 1 y 2 completadas,
   registra inicio de Fase 3

Puntos críticos que no puedes ignorar:

— Al crear un cobrador, el admin completa DOS grupos de datos en el mismo
  formulario:
  (1) Datos de acceso: nombre, email, rol='cobrador' (automático).
  (2) Datos de perfil: identification_number (CC), address, bank_name,
      bank_account, account_type ('ahorros' o 'corriente').
  Se guarda todo en una sola INSERT en la tabla users. La contraseña
  se genera con crypto.randomBytes (12 chars alfanuméricos), se hashea
  con bcrypt, must_change_password=true. La contraseña en claro se
  retorna en la respuesta una sola vez para que el admin se la entregue
  al cobrador — mostrar en un modal con botón "Copiar" y advertencia
  "Esta contraseña no se mostrará nuevamente."

— En login: si must_change_password=true → redirect a /profile para
  cambio obligatorio. El cobrador no puede usar el sistema hasta cambiar
  la contraseña temporal.

— RN-11: al eliminar un cobrador, verificar:
  SELECT COUNT(*) FROM invoices WHERE cobrador_id = ?
  Si COUNT > 0: retornar 409 con "Este cobrador tiene [N] cuentas de
  cobro generadas. No puede eliminarse." Si COUNT = 0: eliminar.

— El cobrador puede ver sus datos en /profile (solo lectura — no puede
  editarlos, RN-09). Solo puede cambiar su contraseña desde /profile.

— El formulario de edición del cobrador (para el admin) muestra todos
  los campos del perfil. Advertencia visible: "Cambiar estos datos solo
  afectará las cuentas de cobro futuras — las ya generadas conservan los
  datos que tenían al momento de su emisión."

Al terminar:
- Crear cobrador con datos completos → contraseña temporal visible una vez
- Cobrador hace login → redirige a /profile para cambiar contraseña →
  login con nueva contraseña → accede al dashboard
- Editar dirección del cobrador → verificar que el cambio se guardó
- Intentar eliminar cobrador con facturas (insertar una manualmente en
  Supabase para la prueba) → 409
- El cobrador en /profile ve sus datos pero no tiene botones de edición
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_3_COBRADORES.md

Tu trabajo termina aquí. No avances a la Fase 4.
```

---

---

## PROMPT FASE 4 — Generación de Cuentas de Cobro, Historial y PDF

### Rol: `Ingeniero Fullstack + Diseñador Frontend — La operación central del sistema`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack y Diseñador Frontend
trabajando en conjunto. La generación de la cuenta de cobro es la razón
de ser de CuentaFácil. La plantilla del documento tiene que ser
profesional — apta para presentarla a una empresa o entidad pública en
Colombia. El PDF tiene que verse exactamente igual a la vista en pantalla.

Tu mentalidad: el contratista va a imprimir este documento y entregarlo
físicamente o enviarlo por correo. Si el PDF se ve mal — columnas
desalineadas, texto cortado, logo pixelado — el sistema no sirve para
su propósito real. La página de impresión tiene que funcionar
perfectamente en Chrome en Android y en computador.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_CUENTAFACIL.md — migration 0002 (invoices con snapshots),
   la implementación completa de generateInvoice (sección 10.2 — el
   request del cliente SOLO contiene companyNit, concept y amount), la
   estructura visual de la plantilla (sección 12.2), la estrategia de
   PDF con window.print() (sección 12.1), la función numberToWords
   (sección 12.3), y la Fase 4 completa
2. doc/ESTADO_EJECUCION_CUENTAFACIL.md — verifica Fases 1 a 3 completadas,
   registra inicio de Fase 4

Puntos críticos que no puedes ignorar:

— PRIMERO: crear lib/numberToWords.ts. Esta función es necesaria para
  renderizar el componente InvoiceDocument. Implementar para COP:
  numberToWords(1500000) → "Un millón quinientos mil pesos colombianos M/CTE"
  numberToWords(350000) → "Trescientos cincuenta mil pesos colombianos M/CTE"
  numberToWords(1000) → "Un mil pesos colombianos M/CTE"
  Cubrir: unidades, decenas, centenas, miles, millones.
  Sin dependencias externas — implementación propia en TypeScript.

— generateInvoice en el servidor: el request que llega de POST /api/invoices
  contiene SOLO { companyNit, concept, amount }. El servidor obtiene los
  datos del cobrador haciendo getUserById(JWT.userId). NUNCA el cliente
  envía nombre, CC ni datos bancarios — los lee el servidor directamente
  de la DB (RN-06).

— Los snapshots en la tabla invoices:
  cobrador_name, cobrador_cc, cobrador_address, cobrador_bank,
  cobrador_account, cobrador_account_type
  Se copian en el INSERT desde el perfil del cobrador en ese momento.
  Si el admin cambia la dirección del cobrador mañana, las facturas de
  hoy siguen teniendo la dirección de hoy.

— La página /invoices/[id]/print es una ruta especial:
  (1) NO usa AppLayout — renderiza solo el InvoiceDocument.
  (2) En el componente: useEffect(() => { window.print() }, []).
  (3) CSS global de impresión: `@media print { .no-print { display: none } body { margin: 0 } }`.
  (4) Botón de fallback visible en pantalla: "Si el diálogo no se abrió,
      haz clic aquí" que también llama window.print(). Este botón tiene
      clase no-print — no aparece al imprimir.

— El InvoiceDocument tiene dos versiones visuales:
  En pantalla: fondo blanco, borde suave, sombra, máximo 800px de ancho,
  centrado, con botones de acción en la parte superior.
  Al imprimir: sin sombra, sin borde redondeado, sin padding extra,
  sin botones. Solo el documento con márgenes de 2cm.

— La plantilla del documento (sección 12.2 del plan) tiene estas secciones:
  Header: título "CUENTA DE COBRO" en grande, número correlativo,
  "CuentaFácil" como sistema emisor.
  Fecha: "Ciudad, DD de [mes] de YYYY" — la fecha la asigna el servidor.
  Sección "COBRADOR": nombre, CC, dirección.
  Sección "EMPRESA PAGADORA": NIT formateado (ej: 900.123.456).
  Sección "CONCEPTO": el texto del concepto.
  Sección "VALOR": el monto en COP ($X.XXX.XXX) y el monto en letras.
  Sección "DATOS BANCARIOS": banco, tipo de cuenta, número de cuenta.
  Footer: línea de firma, nombre y CC del cobrador.

— El NIT se formatea para mostrarlo: si tiene 9 dígitos: XXX.XXX.XXX;
  si tiene 10: XXX.XXX.XXX-X (dígito de verificación). Implementar la
  función formatNIT(nit: string): string en lib/dateUtils.ts o en un
  util separado.

Al terminar (estas pruebas son obligatorias):

Verificación de RN-06 (crítica):
Abrir DevTools → Network → capturar el request de POST /api/invoices →
verificar que el body SOLO contiene companyNit, concept y amount. NO
debe contener nombre, CC ni datos bancarios. Si los contiene, la
arquitectura está comprometida y la fase no puede cerrarse.

Verificación de snapshots:
(1) Generar una cuenta de cobro con dirección "Calle 10 # 5-32".
(2) El admin edita la dirección del cobrador a "Carrera 20 # 15-40".
(3) Ver la cuenta generada en el paso (1): debe mostrar "Calle 10 # 5-32".
(4) Generar una segunda cuenta: debe mostrar "Carrera 20 # 15-40".

Verificación de numeración correlativa:
Generar 3 cuentas → verificar que tienen números 1, 2, 3 en ese orden.

Verificación del PDF:
Abrir /invoices/[id]/print en Chrome → el diálogo se abre automáticamente
→ elegir "Guardar como PDF" → verificar que el PDF tiene aspecto
profesional sin navegación, sin botones de la app, con todos los campos
completos y legibles.

- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_4_GENERACION.md

Tu trabajo termina aquí. No avances a la Fase 5.
```

---

---

## PROMPT FASE 5 — Auditoría y Pulido Final

### Rol: `Diseñador Frontend Obsesivo + Ingeniero Fullstack — Cierre del proyecto`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero
Fullstack trabajando en conjunto. Esta es la fase de cierre de CuentaFácil.

Tu mentalidad: CuentaFácil lo usa un contratista independiente para
cobrar su trabajo. Si la app genera un PDF con el nombre equivocado, con
la dirección desactualizada o con el monto en letras mal escrito, el
contratista puede tener un problema con la empresa que le paga. El
sistema tiene que ser confiable en cada detalle.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_CUENTAFACIL.md — Fase 5 completa, los requerimientos no
   funcionales (RNF-01 al RNF-07) y las restricciones del sistema
   (sección 20)
2. doc/ESTADO_EJECUCION_CUENTAFACIL.md — verifica Fases 1 a 4 completadas,
   registra inicio de Fase 5

Lo que debes completar en esta fase:

Administración:
Crear app/admin/users/page.tsx: tabla de usuarios con nombre, email,
rol y estado (activo/suspendido). Acciones: activar/suspender. El admin
no puede suspenderse a sí mismo.
Crear app/admin/audit/page.tsx: AuditViewer con selector de mes.

Empty states con el tono de CuentaFácil — directo y profesional:
- Historial vacío del cobrador: "Aún no has generado ninguna cuenta de
  cobro. Haz clic en 'Nueva Cuenta' para empezar."
- Lista de cobradores vacía: "No hay cobradores registrados. Agrega el
  primero para comenzar a usar el sistema."

Manejo de errores con mensajes específicos por campo:
Los errores de validación del formulario de generación deben mostrarse
inline debajo de cada campo, no como un toast genérico:
- NIT inválido: "El NIT debe contener solo números (9 o 10 dígitos)."
- Concepto muy corto: "El concepto debe tener al menos 10 caracteres.
  Actualmente tiene [N]."
- Concepto muy largo: "El concepto no puede superar 500 caracteres."
- Valor inválido: "El valor debe ser mayor a cero."
- 401 (sesión expirada): toast + redirect a /login.
- 403 (cobrador en ruta del admin): redirect silencioso a /dashboard.
- 500: toast "Ocurrió un error. Por favor intenta de nuevo."

Prueba de numberToWords en escenarios reales:
Verificar que la función numberToWords retorna texto correcto para:
- 1.000 → "Un mil pesos colombianos M/CTE"
- 350.000 → "Trescientos cincuenta mil pesos colombianos M/CTE"
- 1.500.000 → "Un millón quinientos mil pesos colombianos M/CTE"
- 12.000.000 → "Doce millones de pesos colombianos M/CTE"
- 1.234.567 → texto correcto con millón + miles + unidades
Si cualquier resultado es incorrecto, corregir la función antes de cerrar.

Prueba de la plantilla con datos extremos:
- Concepto de exactamente 500 caracteres: verificar que cabe en el
  documento sin desbordarse.
- Dirección muy larga: verificar que el layout no se rompe.
- Monto de $99.999.999: verificar que el monto en letras es correcto.

Verificar la impresión en celular:
Abrir /invoices/[id]/print en Chrome móvil (375px) → el diálogo de
impresión se abre → verificar que el documento se ve completo (no
cortado ni escalado incorrectamente).

Para el cierre técnico:
- npm run typecheck — cero errores
- npm run lint — cero warnings
- npm run build — build exitoso
- Deploy en Vercel con todas las variables de entorno:
  NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, BLOB_READ_WRITE_TOKEN,
  JWT_SECRET, ADMIN_BOOTSTRAP_SECRET

Probar en producción el flujo completo:
Admin: bootstrap → crear cobrador con datos completos → entregar
contraseña temporal.
Cobrador: primer login → cambiar contraseña → ver dashboard vacío →
generar cuenta de cobro (NIT real, concepto y valor) → ver el documento
en pantalla → imprimir como PDF → verificar el PDF final.

Al cerrar el proyecto:
- Registra la Fase 5 como Completada en ESTADO_EJECUCION_CUENTAFACIL.md
  con la URL de producción en el historial
- Crea doc/RESUMEN_FASE_5_PULIDO_FINAL.md con: URL de producción, URL del
  repositorio, funcionalidades implementadas, stack, tablas de Supabase,
  decisiones técnicas destacadas (snapshot de datos del cobrador para
  integridad documental, datos de perfil en tabla users sin tabla separada,
  numeración correlativa por cobrador, generación PDF con window.print()
  sin librerías, numberToWords propio en TypeScript, campo generated_at
  asignado por el servidor) y estado final del proyecto

El proyecto CuentaFácil está terminado. Tu trabajo en este repositorio
concluye aquí.
```

---

> Keiner Sánchez — Doc: 1082894414
> Curso: Lógica y Programación — SIST0200
