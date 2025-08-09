// PostCSS configuration for ES modules
import purgecss from '@fullhuman/postcss-purgecss';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  plugins: [
    // Solo aplicar PurgeCSS en producción
    isProduction && purgecss({
      content: [
        './src/**/*.{js,jsx,ts,tsx}',
        './index.html',
        './public/**/*.html'
      ],
      css: ['./src/**/*.css'],
      // Mantener estas clases que pueden ser generadas dinámicamente
      safelist: {
        standard: [
          /^toast-/,
          /^modal-/,
          /^sidebar-/,
          /^theme-/,
          /^status-/,
          /^error/,
          /^success/,
          /^warning/,
          /^info/,
          /active$/,
          /visible$/,
          /hidden$/,
          /disabled$/,
          /loading$/
        ],
        // Mantener clases que contienen estos patrones
        deep: [
          /dropdown/,
          /calendar/,
          /form/,
          /btn/,
          /input/,
          /table/
        ],
        // Mantener clases que pueden ser agregadas por JavaScript
        greedy: [
          /^react-/,
          /^vite-/,
          /^dnd-/
        ]
      },
      // Extraer clases de atributos dinámicos
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
      // Configuración específica para JSX
      extractors: [
        {
          extractor: content => {
            // Extraer clases de className, clases CSS y variables CSS
            const classRegex = /(?:className|class)=["']([^"']*)["']/g;
            const cssVarRegex = /--[\w-]+/g;
            const classes = [];
            let match;
            
            while ((match = classRegex.exec(content)) !== null) {
              classes.push(...match[1].split(/\s+/));
            }
            
            while ((match = cssVarRegex.exec(content)) !== null) {
              classes.push(match[0]);
            }
            
            return classes;
          },
          extensions: ['jsx', 'js', 'tsx', 'ts']
        }
      ]
    })
  ].filter(Boolean)
}
