// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createProxyMiddleware } = require('http-proxy-middleware')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const devConfig = require('./devConfig.json')

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: devConfig.backendUrl,
      pathRewrite: {'^/api' : ''},
      changeOrigin: true,
    })
  )
}
