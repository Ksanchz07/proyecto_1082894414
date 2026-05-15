# PROMPT PARA IA: RESOLVER PROBLEMAS CÍCLICOS DE CSS REMOTO EN VERCEL

Copiar y pegar COMPLETO en una IA (Claude, ChatGPT, GitHub Copilot, etc.)

---

## INSTRUCCIÓN

Tengo un proyecto Next.js 15.5.18 con TypeScript, React 19, Tailwind CSS v4 y PostCSS. El proyecto tiene problemas de ciclos de dependencias de CSS remoto cuando se despliega en Vercel.

**Proyecto**: https://github.com/Ksanchz07/proyecto_1082894414.git

**Estructura relevante**:
- `next.config.ts` — Configuración de Next.js
- `postcss.config.mjs` — Configuración de PostCSS
- `tailwind.config.ts` — Configuración de Tailwind
- `src/app/globals.css` — CSS global
- `package.json` — Dependencias

**Problema específico**: El build falla o da warnings en Vercel por ciclos de CSS que no aparecen localmente. Las rutas de contenido de Tailwind son demasiado amplias (`./src/**/*.{ts,tsx}`), lo que causa que procese archivos innecesarios. PostCSS no está optimizado para Vercel. Los paquetes de Tailwind se están bundleando en el edge runtime.

---

## TAREAS A EJECUTAR

### TAREA 1: Optimizar `next.config.ts`
1. Lee el archivo actual `next.config.ts`
2. Asegúrate de que tenga esta configuración:
   - `reactStrictMode: true`
   - `typescript: { ignoreBuildErrors: false }`
   - `serverExternalPackages: ['bcryptjs', 'postgres', 'tailwindcss', '@tailwindcss/postcss']`
3. ELIMINA cualquier configuración NO VÁLIDA en Next.js 15 (como `swcMinify`, `poweredByHeader`)
4. Guarda los cambios

**Valor esperado**:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  serverExternalPackages: ['bcryptjs', 'postgres', 'tailwindcss', '@tailwindcss/postcss'],
};

export default nextConfig;
```

---

### TAREA 2: Optimizar `postcss.config.mjs`
1. Lee el archivo actual `postcss.config.mjs`
2. Reemplaza el contenido por:
```javascript
const config = {
  plugins: {
    "@tailwindcss/nesting": {},
    "@tailwindcss/postcss": {
      corePlugins: {
        preflight: true,
      },
    },
  },
};

export default config;
```
3. Guarda los cambios

**Razón**: `@tailwindcss/nesting` resuelve conflictos de CSS anidado que causan ciclos.

---

### TAREA 3: Optimizar `tailwind.config.ts`
1. Lee el archivo actual `tailwind.config.ts`
2. Cambia la propiedad `content` de:
   - `"./src/**/*.{ts,tsx}"` (GLOBALES)
   
   A (RESTRICTIVAS):
   ```typescript
   content: [
     "./src/app/**/*.{ts,tsx}",
     "./src/components/**/*.{ts,tsx}",
     "./src/ui/**/*.{ts,tsx}",
   ]
   ```
3. Mantén toda la configuración de `theme` y `plugins` igual
4. Guarda los cambios

**Razón**: Las rutas específicas previenen que Tailwind procese archivos innecesarios que causaban ciclos.

---

### TAREA 4: Optimizar `src/app/globals.css`
1. Lee el archivo actual
2. En la primera línea, cambia:
   - `@import "tailwindcss";` 
   
   Por:
   ```css
   /* Optimizado para Vercel: importación con preflight deshabilitado */
   @import "tailwindcss";
   ```
3. Guarda los cambios

**Razón**: Documentación de la optimización.

---

### TAREA 5: Instalar dependencia faltante
Si el archivo `package.json` NO tiene `"@tailwindcss/nesting"` en `devDependencies`, avísame para que se instale con:
```bash
npm install --save-dev @tailwindcss/nesting
```

---

### TAREA 6: Validar Build
Ejecuta:
```bash
npm run build
```

**Resultado esperado**:
- ✅ Build completa sin errores
- ✅ Sin warnings de configuración inválida
- ✅ 27+ páginas compiladas
- ✅ CSS procesado correctamente
- ✅ Output contiene: `✓ Compiled successfully`

---

### TAREA 7: Commit y Push
1. Ejecuta:
```bash
git add .
git commit -m "fix: Arreglar problemas cíclicos de CSS remoto en Vercel

- Optimizó next.config.ts con serverExternalPackages para Tailwind
- Agregó @tailwindcss/nesting en postcss.config.mjs para evitar conflictos CSS
- Especificó content paths restrictivos en tailwind.config.ts
- Optimizó src/app/globals.css para Vercel
- Build exitoso sin advertencias"

git push origin master
```

2. Verifica que el push sea exitoso

---

## VALIDACIÓN FINAL

Confirma que:
- [ ] `next.config.ts` tiene `serverExternalPackages` correcto
- [ ] `postcss.config.mjs` tiene `@tailwindcss/nesting` ANTES de `@tailwindcss/postcss`
- [ ] `tailwind.config.ts` usa rutas específicas (`./src/app/**`, `./src/components/**`, etc.)
- [ ] `src/app/globals.css` tiene el comentario de optimización
- [ ] `npm run build` completa exitosamente
- [ ] Git push completado al repositorio

---

## RESULTADO

Después de estos cambios:
1. ✅ El proyecto buildea sin ciclos de CSS
2. ✅ Vercel desplegará correctamente sin errores
3. ✅ CSS estará optimizado para production
4. ✅ No habrá conflictos de importaciones remotas

---

**COMIENZA AHORA**: Lee los archivos mencionados y ejecuta cada tarea en orden.
