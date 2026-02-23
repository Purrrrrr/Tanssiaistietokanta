export type RestResult<T, E> = {
  type: 'ok'
  status: number
  data: T
} | {
  type: 'error'
  status?: number
  error: E
}
