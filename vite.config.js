// @ts-nocheck
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compression } from 'vite-plugin-compression2'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Optimizaciones de React
      babel: {
        plugins: [
          // Plugin para eliminar console.log en producción
          process.env.NODE_ENV === 'production' && ['transform-remove-console', { exclude: ['error', 'warn'] }]
        ].filter(Boolean)
      }
    }),
    
    // Compresión gzip y brotli (solo en producción)
    process.env.NODE_ENV === 'production' && compression({
      algorithm: 'gzip',
      include: /\.(js|css|html|svg|json|xml)$/,
      threshold: 1024,
      deleteOriginalAssets: false
    }),
    process.env.NODE_ENV === 'production' && compression({
      algorithm: 'brotliCompress',
      include: /\.(js|css|html|svg|json|xml)$/,
      threshold: 1024,
      deleteOriginalAssets: false
    }),
    
    // Visualizador de bundle (solo en build con ANALYZE=true)
    process.env.ANALYZE && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap'
    })
  ].filter(Boolean),
  
  build: {
    // Minificación agresiva
    minify: 'terser',
    terserOptions: {
      compress: {
        arguments: true,
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        unused: true,
        dead_code: true,
        conditionals: true,
        evaluate: true,
        sequences: true,
        booleans: true,
        loops: true,
        hoist_funs: true,
        hoist_vars: true,
        if_return: true,
        join_vars: true,
        cascade: true,
        side_effects: false,
        warnings: false,
        passes: 3,
        reduce_vars: true,
        reduce_funcs: true,
        keep_infinity: true,
        toplevel: true
      },
      mangle: {
        safari10: true,
        toplevel: true,
        properties: {
          regex: /^_/
        }
      },
      format: {
        comments: false,
        beautify: false,
        ascii_only: true
      }
    },
    
    // Optimización de chunks
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n-vendor';
            }
            if (id.includes('axios')) {
              return 'http-vendor';
            }
            if (id.includes('react-dnd')) {
              return 'dnd-vendor';
            }
            return 'vendor';
          }
          
          if (id.includes('src/catalog/')) {
            return 'catalog-module';
          }
          if (id.includes('src/clients/')) {
            return 'clients-module';
          }
          if (id.includes('src/iam/')) {
            return 'iam-module';
          }
          if (id.includes('src/shared/')) {
            return 'shared-module';
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash:8].js',
        entryFileNames: 'assets/js/[name]-[hash:8].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const _ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name)) {
            return `assets/css/[name]-[hash:8].[ext]`;
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash:8].[ext]`;
          }
          return `assets/[ext]/[name]-[hash:8].[ext]`;
        }
      },
      treeshake: {
        preset: 'recommended',
        pureExternalModules: true,
        moduleSideEffects: false,
        unknownGlobalSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false
      }
    },
    
    // Configuración de performance
    chunkSizeWarningLimit: 300,
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: true,
    emptyOutDir: true,
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    assetsInlineLimit: 2048,
    cssMinify: 'lightningcss'
  },
  
  // Servidor de desarrollo
  server: {
    host: true,
    port: 5173,
    headers: {
      'Cache-Control': 'no-cache'
    }
  },
  
  // Preview
  preview: {
    port: 4173,
    host: true
  },
  
  // Optimización de dependencias
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'i18next',
      'react-i18next',
      'axios'
    ],
    exclude: [],
    force: true,
    esbuildOptions: {
      target: 'es2020',
      supported: {
        'dynamic-import': true
      }
    }
  },
  
  // CSS
  css: {
    modules: {
      localsConvention: 'camelCase'
    },
    preprocessorOptions: {
      css: {
        charset: false
      }
    },
    devSourcemap: false
  },
  
  // Assets
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
  
  // Variables de entorno
  // Note: ESLint may not know about `process` in ESM config; these are evaluated by Node at build time.
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production')
  }
})
