import devConfig from '../devConfig'

const isProd = process.env.NODE_ENV === 'production'

export const backendHost = isProd
  ? window.location.origin
  : devConfig.backendUrl
export const backendPath = isProd
  ? '/api'
  : ''
export const backendUrl = `${backendHost}${backendPath}`
