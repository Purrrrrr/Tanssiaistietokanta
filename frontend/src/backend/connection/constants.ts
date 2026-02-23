import createDebug from 'utils/debug'

export const backendHost = window.location.origin
export const backendPath = '/api'
export const backendUrl = (url: string) => `${backendHost}${backendPath}/${url}`

export const debug = createDebug('connection')
