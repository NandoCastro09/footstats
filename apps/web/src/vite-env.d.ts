/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  /** Definido no vite.config.ts (commit da Vercel ou horário do build). */
  readonly VITE_BUILD_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
