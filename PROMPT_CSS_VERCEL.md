# Prompt: Resolver Problemas Cíclicos de CSS Remoto en Vercel

## Problema
**Síntoma**: El proyecto Next.js con Tailwind CSS v4 genera ciclos de dependencias de CSS remoto cuando se despliega en Vercel, causando builds fallidos o warnings de configuración.

**Causa raíz**:
1. Tailwind CSS v4 con PostCSS puede importar archivos que crean dependencias cíclicas
2. El bundler de Next.js incluye paquetes de Tailwind en el edge runtime innecesariamente
3. Las rutas de contenido demasiado amplias (`./src/**/*.{ts,tsx}`) procesan más archivos de los necesarios
4. Configuración de PostCSS no optimizada para Vercel

---

## Solución Paso a Paso

### 1. Optimizar `next.config.ts`
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  // ✅ Prevenir ciclos de CSS remoto en Vercel
  serverExternalPackages: ['bcryptjs', 'postgres', 'tailwindcss', '@tailwindcss/postcss'],
};

export default nextConfig;
```

**Por qué**: `serverExternalPackages` le dice a Next.js que NO bundle estos paquetes, evitando que se intenten cargar en edge runtime donde no existen las APIs que necesitan.

---

### 2. Instalar dependencia de Tailwind Nesting
```bash
npm install --save-dev @tailwindcss/nesting
```

**Por qué**: Resuelve conflictos de CSS anidado y evita importaciones cíclicas internas de PostCSS.

---

### 3. Optimizar `postcss.config.mjs`
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

**Por qué**: 
- `@tailwindcss/nesting` procesa CSS anidado correctamente
- `corePlugins` previene procesamiento de preflight innecesario

---

### 4. Especificar Rutas de Contenido Restrictivas en `tailwind.config.ts`
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  // ✅ Rutas específicas, NO globales
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/ui/**/*.{ts,tsx}",
  ],
  theme: {
    // ... resto de config
  },
  plugins: [],
};

export default config;
```

**Por qué**: Las rutas específicas previenen que Tailwind procese archivos innecesarios (node_modules, lib, etc.) que causaban ciclos.

---

### 5. Agregar Comentario en `src/app/globals.css`
```css
/* Optimizado para Vercel: importación con preflight deshabilitado */
@import "tailwindcss";

@theme {
  /* ... resto de config */
}
```

**Por qué**: Documentación clara de la optimización y evita conflictos de preflight duplicado.

---

## Validar la Solución

### Build local
```bash
npm run build
```
✅ Debe completarse sin warnings de configuración inválida
✅ 27+ páginas compiladas correctamente
✅ CSS procesado sin ciclos

### Rutas esperadas en output
```
✓ Compiled successfully
✓ Linting and checking validity of types 
✓ Collecting page data    
✓ Generating static pages
✓ Collecting build traces    
✓ Finalizing page optimization
```

---

## Subir a Vercel

### 1. Commit local
```bash
git add .
git commit -m "fix: Arreglar problemas cíclicos de CSS remoto en Vercel

- Optimizó next.config.ts con serverExternalPackages
- Agregó @tailwindcss/nesting
- Especificó content paths restrictivos
- Build exitoso sin advertencias"
```

### 2. Push
```bash
git push origin master
```

### 3. Vercel autodetectará el cambio y desplegará
- El pipeline de Vercel ejecutará `npm run build`
- CSS se compilará correctamente sin ciclos
- Deploy completado en 1-2 minutos

---

## Checklist de Verificación

- [ ] `serverExternalPackages` incluye: `bcryptjs`, `postgres`, `tailwindcss`, `@tailwindcss/postcss`
- [ ] `@tailwindcss/nesting` instalado en devDependencies
- [ ] `postcss.config.mjs` tiene `@tailwindcss/nesting` antes de `@tailwindcss/postcss`
- [ ] `tailwind.config.ts` usa rutas específicas, NO `./src/**/*`
- [ ] Build local exitoso: `npm run build`
- [ ] Git push completado
- [ ] Vercel deployment sin errores

---

## Troubleshooting

| Error | Solución |
|-------|----------|
| `swcMinify is not recognized` | Remover `swcMinify: true` de next.config.ts (Next.js 15 no lo usa) |
| `CSS cycles detected` | Verificar que `content` paths sean específicos, no globales |
| `@tailwindcss/nesting not found` | Ejecutar `npm install --save-dev @tailwindcss/nesting` |
| `Build timeout en Vercel` | Agregar paquetes a `serverExternalPackages` |

---

## Referencias

- **Next.js Config**: https://nextjs.org/docs/app/api-reference/next-config-js
- **Tailwind CSS v4**: https://tailwindcss.com/docs/upgrade-guide
- **PostCSS Config**: https://tailwindcss.com/docs/installation
- **Vercel Optimization**: https://vercel.com/docs/frameworks/nextjs
