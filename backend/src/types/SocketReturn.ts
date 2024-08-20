export type SocketReturnData<T> =
    | {
          status: true
          data: T
      }
    | {
          status: false
      }

export type SocketReturnStatus = {
    status: boolean
}
