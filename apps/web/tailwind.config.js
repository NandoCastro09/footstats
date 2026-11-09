/**
 * Design system FootStats — "placar de estádio".
 *
 * Fundo preto esverdeado, um único destaque verde-limão (`lime`) e títulos/números
 * em fonte condensada. Sem gradientes.
 *
 * Regras:
 *   - Texto SOBRE lime (ou sobre qualquer cor de zona) é sempre `ink-inverse` (#0A0D0B).
 *   - `primary` = lime (os nomes antigos continuam valendo e apontam para a paleta nova).
 *   - Bordas de campos de formulário usam `line-field` (3:1, WCAG 1.4.11);
 *     `line-strong` (#2E3A31) é só para botões secundários, que já têm texto.
 *
 * Contrastes conferidos (WCAG AA), sobre `surface` (#121714):
 *   ink 16:1 · ink-2 9.5:1 · muted 7.1:1 · lime 13.9:1 · alert 7:1 · alert-text 8.7:1
 *   live 5.8:1 · zone-sula 6.6:1 · line-field 3.4:1
 * Texto #0A0D0B sobre: lime 15:1 · zone-pre 11:1 · zone-sula 7.1:1 · alert 7.6:1
 * Texto branco sobre: live.strong 5.8:1 · danger.solid 5.6:1
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
        // ---- Paleta "placar de estádio" (nomes do documento de redesign) ----
        bg: "#0A0D0B", // fundo da página
        lime: "#C8F135", // ÚNICO destaque: ativo, CTA, números importantes
        muted: "#9AA59C", // rótulos
        alert: {
          DEFAULT: "#FF7A45", // derrota, rebaixamento, erro
          text: "#FF9A62", // texto de alerta
        },
        zone: {
          liberta: "#C8F135",
          pre: "#6FD89A",
          sula: "#4FA3E0",
          z4: "#FF7A45",
        },

        // ---- Nomes usados nos componentes, agora com a paleta nova ----
        primary: {
          DEFAULT: "#C8F135", // lime — links, ícones, valores em destaque
          bright: "#DAF77A", // hover de links
          solid: "#C8F135", // fundo de botão/pílula ativa (texto ink-inverse!)
          "solid-hover": "#B4DB22",
          light: "#222B14", // lime a ~12% sobre o fundo
        },
        success: {
          DEFAULT: "#6FD89A", // verde — gols marcados, aproveitamento
          light: "#18291F",
        },
        live: {
          DEFAULT: "#FF5A36", // bolinha pulsante e bordas de "ao vivo"
          text: "#FF9A62", // texto "ao vivo"
          strong: "#B83A14", // fundo de pílula com texto branco
          dark: "#9A3010", // hover
          light: "#2A1A14",
        },
        warning: {
          DEFAULT: "#D99A2B", // âmbar — cartões, bordas de aviso
          text: "#E5B45C",
          light: "#2B2616",
        },
        danger: {
          DEFAULT: "#FF9A62", // texto/ícone de erro e derrota
          solid: "#B8401A", // fundo de botão destrutivo (texto branco)
          "solid-hover": "#9A3414",
          light: "#2A1A14",
        },
        ink: {
          DEFAULT: "#EEF2EC", // texto principal
          2: "#B4BEB5", // texto secundário
          soft: "#B4BEB5", // = ink-2 (nome antigo)
          muted: "#9AA59C", // = muted (nome antigo)
          inverse: "#0A0D0B", // texto sobre lime e cores de zona
        },
        line: {
          DEFAULT: "#1E2721", // bordas sutis
          strong: "#2E3A31", // bordas de botões secundários
          field: "#5F6E62", // bordas de inputs/selects (3.4:1, WCAG 1.4.11)
        },
        surface: {
          DEFAULT: "#121714", // cards, tabela, filtros
          2: "#0E1310", // resultados encerrados, áreas internas
          subtle: "#0A0D0B", // = bg (nome antigo)
          raised: "#0E1310", // = surface-2 (nome antigo)
          strong: "#3A463D", // empate na forma, trilhos de barras
          deep: "#0A0D0B", // rodapé
        },
      },
      keyframes: {
        // Brilho que atravessa o skeleton (parado com prefers-reduced-motion).
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "live-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.3", transform: "scale(0.7)" },
        },
      },
      animation: {
        "live-pulse": "live-pulse 1.4s ease-in-out infinite",
        shimmer: "shimmer 1.6s ease-in-out infinite",
      },
      letterSpacing: {
        label: "0.14em", // rótulos em caixa alta ("PRÓXIMOS JOGOS")
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"], // corpo
        display: ['"Barlow Condensed"', "sans-serif"], // títulos e números
      },
      borderRadius: {
        control: "10px", // botões e inputs
        card: "14px", // cards
        panel: "20px", // cards grandes (jogo em destaque, formulário)
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
