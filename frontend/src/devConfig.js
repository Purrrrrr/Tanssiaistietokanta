import backendConfig from './backendConfig.json'

const config = {
  backendUrl: `http://${backendConfig.host}:${backendConfig.port}`,
}
export default config
