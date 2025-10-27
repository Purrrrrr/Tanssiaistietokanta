import { createProxyMiddleware } from 'http-proxy-middleware'

import backendConfig from './backendConfig.json'

export default function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: `http://${backendConfig.host}:${backendConfig.port}`,
      pathRewrite: { '^/api': '' },
      changeOrigin: true,
    }),
  )
}
