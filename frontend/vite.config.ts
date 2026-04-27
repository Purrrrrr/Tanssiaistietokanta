import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babelPlugin from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv, Plugin } from 'vite'
import { analyzer } from 'vite-bundle-analyzer'
import checker from 'vite-plugin-checker'
import { jsSizeReporter } from './vite-plugin-js-size'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

import backendConfig from './src/backendConfig.json'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const { PUBLIC_URL } = loadEnv(mode, '.', ['PUBLIC_URL'])

  setEnv(mode)
  return {
    plugins: [
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      react(),
      babelPlugin({
        presets: [reactCompilerPreset()],
      }),
      envPlugin(),
      htmlPlugin(mode),
      checker({
        typescript: true,
      }),
      tailwindcss(),
      analyzer({
        defaultSizes: 'gzip',
        analyzerMode: 'static',
        exclude: /.jpg$/,
        openAnalyzer: false,
      }),
      jsSizeReporter({ watchBranches: ['origin/main', 'main', 'release'] }),
    ],
    // devtools: true,
    base: PUBLIC_URL || '/',
    resolve: {
      tsconfigPaths: true,
      alias: [{ find: /^~([^/])/, replacement: '$1' }],
    },
    build: {
      outDir: 'build',
      sourcemap: true,
    },
    server: {
      host: process.env.ALLOW_ALL_HOSTS ? true : 'localhost',
      port: 3001,
      // forwardConsole: true,
      open: false,
      proxy: {
        '/api/socket.io': {
          target: `ws://${backendConfig.host}:${backendConfig.port}/socket.io`,
          ws: true,
          rewriteWsOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/api': {
          target: `http://${backendConfig.host}:${backendConfig.port}`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      }
    },
  }
})

function setEnv(mode: string) {
  Object.assign(
    process.env,
    loadEnv(mode, '.', ['REACT_APP_', 'NODE_ENV', 'PUBLIC_URL']),
  )
  process.env.NODE_ENV ||= mode
  process.env.PUBLIC_URL ||= '/'
}

// Expose `process.env` environment variables to your client code
// Migration guide: Follow the guide below to replace process.env with import.meta.env in your app, you may also need to rename your environment variable to a name that begins with VITE_ instead of REACT_APP_
// https://vitejs.dev/guide/env-and-mode.html#env-variables
function envPlugin(): Plugin {
  return {
    name: 'env-plugin',
    config(_, { mode }) {
      const env = loadEnv(mode, '.', ['REACT_APP_', 'NODE_ENV', 'PUBLIC_URL'])
      return {
        define: Object.fromEntries(
          Object.entries(env).map(([key, value]) => [
            `process.env.${key}`,
            JSON.stringify(value),
          ]),
        ),
      }
    },
  }
}

// Replace %ENV_VARIABLES% in index.html
// https://vitejs.dev/guide/api-plugin.html#transformindexhtml
// Migration guide: Follow the guide below, you may need to rename your environment variable to a name that begins with VITE_ instead of REACT_APP_
// https://vitejs.dev/guide/env-and-mode.html#html-env-replacement
function htmlPlugin(mode: string): Plugin {
  const env = loadEnv(mode, '.', ['PUBLIC_URL'])
  return {
    name: 'html-plugin',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(/%(.*?)%/g, (match, p1) => env[p1] ?? match)
      },
    },
  }
}
