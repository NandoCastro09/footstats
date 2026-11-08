/**
 * Design system FootStats.
 * Contrastes conferidos (WCAG AA) — texto branco sobre:
 *   primary 6.5:1 · success 6.2:1 · live.strong 5.7:1 · danger 7.1:1
 * `live.DEFAULT` (#D85A30) e `warning.DEFAULT` (#BA7517) NÃO servem como fundo
 * de texto branco nem como cor de texto: use só em bordas, pontos e ícones
 * (≥ 3:1). Para texto use `live.strong` e `warning.text`.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  // `relative: true` resolve os caminhos a partir deste arquivo, não do cwd.
  content: {
    relative: true,
    files: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  },
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#185FA5", // azul confiança — navegação, botões, headers
          dark: "#124A82", // hover/active
          light: "#E8F0F9", // fundos sutis
        },
        success: {
          DEFAULT: "#3B6D11", // verde campo — vitórias, resultados positivos
          dark: "#2E560D",
          light: "#EAF3E1",
        },
        live: {
          DEFAULT: "#D85A30", // coral urgência — só borda, ponto, ícone
          strong: "#BA3A18", // fundo de botão / texto (5.7:1)
          dark: "#9E3013", // hover
          light: "#FBEDE7",
        },
        warning: {
          DEFAULT: "#BA7517", // amber alerta — cartão amarelo, ícones
          text: "#8A5410", // texto (6.3:1)
          light: "#FBF1E2",
        },
        danger: {
          DEFAULT: "#A32D2D", // vermelho erro — derrotas, erros de formulário
          dark: "#862424",
          light: "#F9E9E9",
        },
        ink: {
          DEFAULT: "#2C2C2A", // texto principal
          muted: "#5F5E5A", // texto secundário
        },
        line: {
          DEFAULT: "#D3D1C7", // bordas decorativas (cards, divisores)
          strong: "#8A887F", // bordas de inputs (3.5:1, WCAG 1.4.11)
        },
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F7F6F2",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"], // corpo
        display: ["Roboto", "system-ui", "sans-serif"], // títulos e números
      },
      borderRadius: {
        control: "8px", // botões e inputs
        card: "12px", // cards
      },
      minHeight: {
        touch: "44px",
      },
      minWidth: {
        touch: "44px",
      },
    },
  },
  plugins: [],
};
