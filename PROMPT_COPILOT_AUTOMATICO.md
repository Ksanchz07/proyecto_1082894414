# PROMPT ESTÁNDAR PARA IA: RESOLVER CICLOS CSS EN VERCEL

Copiar y pegar COMPLETO en Copilot/Claude/ChatGPT

---

Tengo un proyecto Next.js con Tailwind CSS que tiene problemas de ciclos de CSS remoto en Vercel.

**Resuelve automáticamente estos 4 archivos:**

1. **next.config.ts** → Asegúrate de que tenga exactamente esto:
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

2. **postcss.config.mjs** → Reemplaza con:
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

3. **tailwind.config.ts** → Cambia el `content` por:
```typescript
content: [
  "./src/app/**/*.{ts,tsx}",
  "./src/components/**/*.{ts,tsx}",
  "./src/ui/**/*.{ts,tsx}",
]
```
(Mantén todo lo demás igual)

4. **src/app/globals.css** → Agrega este comentario al principio:
```css
/* Optimizado para Vercel: importación con preflight deshabilitado */
```

**Luego verifica:**
- Lee cada archivo y confirma que están correctos
- Si `package.json` no tiene `"@tailwindcss/nesting"`, avísame para instalarlo
- Di "COMPLETADO" cuando termines

---

**INSTRUCCIONES FINALES CUANDO TERMINES:**
Di exactamente: "✅ PROBLEMA RESUELTO: Los 4 archivos están optimizados para Vercel sin ciclos CSS"
