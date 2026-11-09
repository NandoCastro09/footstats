import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

// Abre a conexão com a API e já "cutuca" o /health assim que o HTML chega,
// antes do JavaScript do app baixar. Se o Render estiver dormindo, ele começa a acordar mais cedo.
function apiWarmup(apiUrl: string | undefined): Plugin {
  return {
    name: 'footstats-api-warmup',
    transformIndexHtml() {
      if (!apiUrl) return []
      const origin = new URL(apiUrl).origin
      return [
        { tag: 'link', attrs: { rel: 'preconnect', href: origin, crossorigin: '' }, injectTo: 'head-prepend' },
        {
          tag: 'script',
          children: `fetch(${JSON.stringify(`${origin}/health`)},{mode:"no-cors",cache:"no-store"}).catch(function(){});`,
          injectTo: 'head',
        },
      ]
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const buildId = env.VERCEL_GIT_COMMIT_SHA || String(Date.now())

  return {
    plugins: [react(), apiWarmup(env.VITE_API_URL)],
    define: {
      'import.meta.env.VITE_BUILD_ID': JSON.stringify(buildId),
    },
  }
})
