export type SocketReturnData<T> =
    | {
          status: true
          data: T
      }
    | {
          status: false
          code?: number
      }

export type SocketReturnStatus = {
    status: boolean
}
