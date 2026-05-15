const config = {
  plugins: {
    "@tailwindcss/nesting": {},
    "@tailwindcss/postcss": {
      // Optimizar para Vercel: no procesar archivos node_modules
      corePlugins: {
        preflight: true,
      },
    },
  },
};

export default config;
