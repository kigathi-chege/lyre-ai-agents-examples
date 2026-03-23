export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/tailwind.css'],
  runtimeConfig: {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    axisBackendUrl: process.env.NUXT_AXIS_BACKEND_URL || 'http://localhost:8000',
    lyreAgentId: process.env.NUXT_LYRE_AGENT_ID || 'default-agent',
  },
});
