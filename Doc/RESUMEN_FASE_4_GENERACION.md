Resumen Fase 4 — Generación de Cuentas de Cobro

Estado: IMPLEMENTACIÓN completada parcialmente — pendientes verificaciones manuales y typecheck.

Cambios realizados (implementación):

- Utilidades
  - src/lib/numberToWords.ts: función numberToWords(amount) implementada para COP (unidades, decenas, centenas, miles, millones). Mantiene formatCOP.
  - src/lib/dateUtils.ts: formatNIT(nit: string) implementado para formatos 9 y 10 dígitos.

- Backend
  - src/lib/dataService.ts: generateInvoice(userId, data) ya implementado; copia snapshots (cobrador_name, cobrador_cc, cobrador_address, cobrador_bank, cobrador_account, cobrador_account_type) al insertar la factura.
  - API routes:
    - POST /api/invoices -> src/app/api/invoices/route.ts (valida body con generateInvoiceSchema y llama generateInvoice). El request esperado en la red contiene SOLO { companyNit, concept, amount }.
    - GET /api/invoices/[id] -> src/app/api/invoices/[id]/route.ts (verifica la propiedad mediante el token).

- Frontend
  - Formulario de generación: src/app/invoices/new/page.tsx (cliente) — envía {companyNit, concept, amount} al backend.
  - Vista de factura: src/app/invoices/[id]/page.tsx — muestra InvoiceDocument y botón "Imprimir / Guardar PDF".
  - Página de impresión: src/app/invoices/[id]/print/page.tsx — renderiza SOLO InvoiceDocument y ejecuta window.print() al cargar; incluye botón fallback con clase no-print.
  - Componente de plantilla: src/components/invoices/InvoiceDocument.tsx — plantilla profesional con secciones: header, fecha, cobrador (snapshot), empresa pagadora (NIT formateado), concepto, valor (número + en letras), datos bancarios, footer.
  - Estilos de impresión: src/app/globals.css se añadió @media print para ocultar .no-print, eliminar sombras y usar márgenes de 2cm.

Verificaciones manuales requeridas (pendientes):

1. RN-06 (CRÍTICO)
   - Abrir DevTools → Network → enviar POST /api/invoices desde la UI y confirmar que el body incluye SOLAMENTE { companyNit, concept, amount } y no datos del cobrador. Si el body incluye datos del cobrador, informar inmediatamente.

2. Snapshots
   - Generar una factura (dirección A).
   - Editar perfil del cobrador y cambiar dirección a B (administrador).
   - Ver la factura generada en el paso 1: debe mostrar dirección A (snapshot).
   - Generar otra factura: debe mostrar dirección B.

3. Numeración correlativa
   - Generar 3 facturas y confirmar que los invoice_number son 1, 2, 3 (por cobrador).

4. PDF / Impresión
   - Abrir /invoices/[id]/print en Chrome (desktop y Android). El diálogo debe abrirse automáticamente. Elegir "Guardar como PDF" y verificar que:
     - El PDF contiene solo el documento (sin navegación ni botones).
     - Márgenes de 2cm.
     - Columnas alineadas, texto legible, logo/elementos nítidos.

5. Typecheck
   - Ejecutar: npm run type-check (local). Nota: en este entorno remoto no está disponible npm.

Tareas completadas por el agente (esta implementación):
- Implementación de código (utilidades, API, UI, impresión) y commits.

Archivos añadidos/actualizados (resumen):
- Añadidos: src/lib/dateUtils.ts, src/app/api/invoices/route.ts, src/app/api/invoices/[id]/route.ts, src/app/invoices/new/page.tsx, src/app/invoices/[id]/page.tsx, src/app/invoices/[id]/print/page.tsx, src/components/invoices/InvoiceDocument.tsx
- Modificados: src/lib/numberToWords.ts, src/app/globals.css

Siguientes pasos recomendados (puedo encargarlos si autoriza):
- Ejecutar pruebas manuales RN-06, snapshots, numeración y PDF en un entorno local/dev.
- Ejecutar npm run type-check y corregir avisos si aparecen.
- Ajustes estéticos finos en InvoiceDocument para cumplir exactamente la plantilla legal — puedo iterar según captura de pantalla.

Responsable: implementación automatizada por el asistente (repositorio). Para cerrar Fase 4 se requiere confirmar las verificaciones manuales arriba.
