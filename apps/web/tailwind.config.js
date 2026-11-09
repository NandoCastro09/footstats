/**
 * Design system FootStats — tema escuro (protótipo v2).
 *
 * Regra das cores de destaque: no fundo escuro, a mesma cor não serve para
 * texto e para fundo de texto branco. Por isso cada uma tem dois papéis:
 *   - `DEFAULT` (ex.: `text-primary`): texto, ícones e bordas sobre o escuro.
 *   - `solid` (ex.: `bg-primary-solid`): fundo de botão/pílula com texto branco.
 *
 * Contrastes conferidos (WCAG AA), sobre `surface` (#171C22):
 *   ink 15:1 · ink.soft 10:1 · ink.muted 6.2:1 · primary 6.4:1 · success 9:1
 *   danger 6.5:1 · warning.text 8.6:1 · live.text 7.9:1
 * Texto branco sobre: primary.solid 6.5:1 · danger.solid 5.9:1 · live.strong 5.7:1
 * `live.DEFAULT` (#E8734A) com texto branco NÃO passa: use só em pontos e bordas.
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
          DEFAULT: "#5AA2E8", // azul — links, ícones, valores em destaque
          bright: "#8CC0F2", // hover de links, texto sobre fundo `light`
          solid: "#185FA5", // fundo de botão/pílula ativa (texto branco)
          "solid-hover": "#1E6CB8",
          light: "#1D2B3A", // fundo sutil (azul a ~14%)
        },
        success: {
          DEFAULT: "#9BD05C", // verde — vitórias, gols, aproveitamento
          light: "#243223",
        },
        live: {
          DEFAULT: "#E8734A", // coral — ponto pulsante e bordas de "ao vivo"
          text: "#F0A183", // texto coral
          strong: "#BA3A18", // fundo de pílula/botão com texto branco
          dark: "#9E3013", // hover
          light: "#302422",
        },
        warning: {
          DEFAULT: "#D99A2B", // âmbar — cartões, bordas de aviso
          text: "#E5B45C",
          light: "#332D20",
        },
        danger: {
          DEFAULT: "#E8837F", // texto/ícone de erro e derrota
          solid: "#B23B37", // fundo de botão destrutivo (texto branco)
          "solid-hover": "#9A302C",
          light: "#322427",
        },
        ink: {
          DEFAULT: "#F3F2ED", // texto principal
          soft: "#C9C9C2", // texto secundário forte (nomes do time perdedor etc.)
          muted: "#9C9C95", // rótulos e legendas
          inverse: "#0F1317", // texto escuro sobre fundos claros (forma V/E/D)
        },
        line: {
          DEFAULT: "#2A3038", // bordas de cards e divisores
          strong: "#6B727B", // bordas de inputs (3.3:1, WCAG 1.4.11)
        },
        surface: {
          DEFAULT: "#171C22", // cards
          subtle: "#0F1317", // fundo da página
          raised: "#1A2027", // pílulas, inputs, áreas internas
          strong: "#4A5058", // empate na forma, trilhos de barras
          deep: "#0A0D10", // rodapé
        },
      },
      backgroundImage: {
        // Cabeçalho de time/liga: azul que se dissolve no fundo da página.
        "gradient-hero":
          "linear-gradient(165deg, #17578F 0%, #123F68 55%, #0F1317 100%)",
        // Card de partida ao vivo.
        "gradient-live":
          "linear-gradient(150deg, #1B6AB5 0%, #134A80 55%, #0E3A66 100%)",
      },
      boxShadow: {
        hero: "0 12px 28px rgba(0, 0, 0, 0.45)",
      },
      keyframes: {
        "live-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.3", transform: "scale(0.7)" },
        },
      },
      animation: {
        "live-pulse": "live-pulse 1.4s ease-in-out infinite",
      },
      letterSpacing: {
        label: "0.14em", // rótulos em caixa alta ("PRÓXIMOS JOGOS")
      },
      fontFamily: {
        sans: ["Raleway", "system-ui", "sans-serif"], // corpo
        display: ["Roboto", "system-ui", "sans-serif"], // títulos e números
      },
      borderRadius: {
        control: "10px", // botões e inputs
        card: "14px", // cards
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
