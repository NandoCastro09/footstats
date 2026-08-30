# ⚽ FootStats

Platform de estatísticas de futebol com React + TypeScript + Fastify.

## 🚀 Quick Start

### Pré-requisitos
- Node.js 20+
- Docker & Docker Compose
- pnpm

### Setup

\\\ash
# Instala dependências
pnpm install

# Inicia banco + cache
docker compose up -d

# Dev (em paralelo)
pnpm dev
\\\

Frontend: http://localhost:5173
Backend: http://localhost:3000
Health Check: http://localhost:3000/health

## 📁 Estrutura

\\\
footstats/
├── apps/
│   ├── web/          (React + TypeScript + Vite)
│   └── api/          (Fastify + Node.js)
├── packages/
│   ├── ui/           (Componentes compartilhados)
│   └── types/        (Tipos TypeScript)
└── docker-compose.yml
\\\

## 🛠️ Scripts

\\\ash
pnpm dev              # Dev mode (frontend + backend)
pnpm build            # Build
pnpm test             # Testes
pnpm lint             # Lint
pnpm format           # Prettier
\\\

---

v1.0.0 - Agosto 2026