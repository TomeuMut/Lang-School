import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-15',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
  app: {
    head: {
      title: 'Lang School · Tu próxima meta, B2',
      htmlAttrs: { lang: 'es' },
      meta: [{ name: 'description', content: 'Practica catalán e inglés de A1 a C2. Ejercicios, explicaciones y progreso personal, con el B2 como próxima meta.' }],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
})
