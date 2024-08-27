import { Game } from "classes/Game"
import { Socket } from "socket.io"
import { Bet } from "types/Bet"
import { Card } from "types/Card"
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "types/Socket"
import { SocketReturnData, SocketReturnStatus } from "types/SocketReturn"
import { v4 as uuidv4 } from "uuid"

const games = new Map<string, Game>()
const pidToGid = new Map<string, string>()

export function onConnection(socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
    socket.data = { pid: "" }

    socket.on(
        "joinGame",
        (gid: string, name: string, callback: (data: SocketReturnData<string>) => void): void => {
            if (!gid.match(/^[A-Z]{4}$/)) {
                return callback({ status: false })
            }
            if (!games.has(gid)) {
                games.set(gid, new Game(gid))
            }
            const game = games.get(gid)!
            const pid = uuidv4()
            pidToGid.set(pid, gid)
            const status = game.addPlayer(socket, pid, name)
            if (status === 0) {
                socket.data = { pid }
                return callback({ status: true, data: pid })
            } else {
                return callback({ status: false, code: status })
            }
        },
    )

    socket.on("leaveGame", (callback: (data: SocketReturnStatus) => void):void => {
        const gid = pidToGid.get(socket.data.pid)
        if (!gid) {
            return callback({ status: false })
        }
        const game = games.get(gid)
        if (!game) {
            return callback({ status: false })
        }
        if (game.removePlayer(socket.data.pid)) {
            pidToGid.delete(socket.data.pid)
            socket.data = { pid: "" }
            if (game.isEmpty()) games.delete(gid)
            return callback({ status: true })
        } else {
            return callback({ status: false })
        }
    })

    socket.on("reconnect", (pid: string, callback: (data: SocketReturnData<number>) => void): void => {
        const gid = pidToGid.get(pid)
        if (!gid) {
            return callback({ status: false })
        }
        const game = games.get(gid)
        if (!game) {
            return callback({ status: false })
        }
        const status = game.resyncSocket(pid, socket)
        if (status === 2) {
            socket.data = { pid }
        }
        return callback({ status: true, data: status })
    })

    socket.on("rearrange", (rel: number): void => {
        const gid = pidToGid.get(socket.data.pid)
        if (!gid) {
            return
        }
        const game = games.get(gid)
        if (!game) {
            return
        }
        if (rel !== -1 && rel !== 1) {
            return
        }
        game.movePlayer(socket.data.pid, rel)
    })

    socket.on("toggleStartGame", (): void => {
        const gid = pidToGid.get(socket.data.pid)
        if (!gid) {
            return
        }
        const game = games.get(gid)
        if (!game) {
            return
        }
        game.toggleToStart(socket.data.pid)
    })

    socket.on("submitWash", (accept: boolean, callback: (data: SocketReturnStatus) => void): void => {
        const gid = pidToGid.get(socket.data.pid)
        if (!gid) {
            return callback({ status: false })
        }
        const game = games.get(gid)
        if (!game) {
            return callback({ status: false })
        }
        return callback({ status: game.submitWash(socket.data.pid, accept) })
    })

    socket.on("submitBet", (bet: Bet | null, callback: (data: SocketReturnStatus) => void): void => {
        const gid = pidToGid.get(socket.data.pid)
        if (!gid) {
            return callback({ status: false })
        }
        const game = games.get(gid)
        if (!game) {
            return callback({ status: false })
        }
        return callback({ status: game.submitBet(socket.data.pid, bet) })
    })

    socket.on(
        "submitPartner",
        (card: Card, callback: (data: SocketReturnStatus) => void): void => {
            const gid = pidToGid.get(socket.data.pid)
            if (!gid) {
                return callback({ status: false })
            }
            const game = games.get(gid)
            if (!game) {
                return callback({ status: false })
            }
            return callback({ status: game.submitPartner(socket.data.pid, card) })
        },
    )

    socket.on("playCard", (card: Card, callback: (data: SocketReturnStatus) => void): void => {
        const gid = pidToGid.get(socket.data.pid)
        if (!gid) {
            return callback({ status: false })
        }
        const game = games.get(gid)
        if (!game) {
            return callback({ status: false })
        }
        return callback({ status: game.playCard(socket.data.pid, card) })
    })

    socket.on("submitMoveOn", (callback: (data: SocketReturnStatus) => void): void => {
        const gid = pidToGid.get(socket.data.pid)
        if (!gid) {
            return callback({ status: false })
        }
        const game = games.get(gid)
        if (!game) {
            return callback({ status: false })
        }
        return callback({ status: game.submitMoveOn(socket.data.pid) })
    })

    socket.on("disconnect", () => {
        if (socket.data) {
            const { pid } = socket.data
            const gid = pidToGid.get(pid)
            if (!gid) {
                return
            }
            const game = games.get(gid)
            if (game) {
                game.removeSocket(pid)
            }
        }
    })
}
