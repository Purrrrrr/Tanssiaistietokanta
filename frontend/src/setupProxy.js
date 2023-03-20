// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createProxyMiddleware } = require('http-proxy-middleware')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const backendConfig = require('./backendConfig.json')

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: `http://${backendConfig.host}:${backendConfig.port}`,
      pathRewrite: {'^/api' : ''},
      changeOrigin: true,
    })
  )
}
