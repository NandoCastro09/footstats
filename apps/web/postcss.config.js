import { fileURLToPath } from "node:url";

// Caminho explícito: o Tailwind 3 procura a config no diretório atual (cwd),
// o que quebra quando o Vite é iniciado a partir da raiz do monorepo.
export default {
  plugins: {
    tailwindcss: {
      config: fileURLToPath(new URL("./tailwind.config.js", import.meta.url)),
    },
    autoprefixer: {},
  },
};
