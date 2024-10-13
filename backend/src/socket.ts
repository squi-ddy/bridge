import { Socket } from "socket.io"
import { Bet } from "types/Bet"
import { Card } from "types/Card"
import {
    ClientToServerEvents,
    InterServerEvents,
    ServerToClientEvents,
    SocketData,
} from "types/Socket"
import { SocketReturnData, SocketReturnStatus } from "types/SocketReturn"
import { v4 as uuidv4 } from "uuid"
import { addGame, deleteGame, getGame } from "./games"
import { settings } from "./settings"

const pidToGid = new Map<string, string>()
const reconnectionTimeouts = new Map<string, NodeJS.Timeout>()

export function onConnection(
    socket: Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >,
) {
    socket.data = { pid: "" }

    socket.on(
        "joinGame",
        (
            gid: string,
            name: string,
            callback: (data: SocketReturnData<string>) => void,
        ): void => {
            if (!gid.match(/^[A-Z]{4}$/)) {
                return callback({ status: false })
            }
            if (!getGame(gid)) {
                addGame(gid)
            }
            const game = getGame(gid)!
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

    socket.on(
        "leaveGame",
        (callback: (data: SocketReturnStatus) => void): void => {
            const gid = pidToGid.get(socket.data.pid)
            if (!gid) {
                return callback({ status: false })
            }
            const game = getGame(gid)
            if (!game) {
                return callback({ status: false })
            }
            if (game.removePlayer(socket.data.pid)) {
                pidToGid.delete(socket.data.pid)
                socket.data = { pid: "" }
                if (game.isEmpty()) deleteGame(gid)
                return callback({ status: true })
            } else {
                return callback({ status: false })
            }
        },
    )

    socket.on(
        "reconnect",
        (
            pid: string,
            callback: (data: SocketReturnData<number>) => void,
        ): void => {
            const gid = pidToGid.get(pid)
            if (!gid) {
                return callback({ status: false })
            }
            const game = getGame(gid)
            if (!game) {
                return callback({ status: false })
            }
            const status = game.resyncSocket(pid, socket)
            if (status === 2) {
                socket.data = { pid }
                clearTimeout(reconnectionTimeouts.get(pid))
                reconnectionTimeouts.delete(pid)
            }
            return callback({ status: true, data: status })
        },
    )

    socket.on("rearrange", (rel: number): void => {
        const gid = pidToGid.get(socket.data.pid)
        if (!gid) {
            return
        }
        const game = getGame(gid)
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
        const game = getGame(gid)
        if (!game) {
            return
        }
        game.toggleToStart(socket.data.pid)
    })

    socket.on(
        "submitWash",
        (
            accept: boolean,
            callback: (data: SocketReturnStatus) => void,
        ): void => {
            const gid = pidToGid.get(socket.data.pid)
            if (!gid) {
                return callback({ status: false })
            }
            const game = getGame(gid)
            if (!game) {
                return callback({ status: false })
            }
            return callback({
                status: game.submitWash(socket.data.pid, accept),
            })
        },
    )

    socket.on(
        "submitBet",
        (
            bet: Bet | null,
            callback: (data: SocketReturnStatus) => void,
        ): void => {
            const gid = pidToGid.get(socket.data.pid)
            if (!gid) {
                return callback({ status: false })
            }
            const game = getGame(gid)
            if (!game) {
                return callback({ status: false })
            }
            return callback({ status: game.submitBet(socket.data.pid, bet) })
        },
    )

    socket.on(
        "submitPartner",
        (card: Card, callback: (data: SocketReturnStatus) => void): void => {
            const gid = pidToGid.get(socket.data.pid)
            if (!gid) {
                return callback({ status: false })
            }
            const game = getGame(gid)
            if (!game) {
                return callback({ status: false })
            }
            return callback({
                status: game.submitPartner(socket.data.pid, card),
            })
        },
    )

    socket.on(
        "playCard",
        (card: Card, callback: (data: SocketReturnStatus) => void): void => {
            const gid = pidToGid.get(socket.data.pid)
            if (!gid) {
                return callback({ status: false })
            }
            const game = getGame(gid)
            if (!game) {
                return callback({ status: false })
            }
            return callback({ status: game.playCard(socket.data.pid, card) })
        },
    )

    socket.on(
        "submitMoveOn",
        (callback: (data: SocketReturnStatus) => void): void => {
            const gid = pidToGid.get(socket.data.pid)
            if (!gid) {
                return callback({ status: false })
            }
            const game = getGame(gid)
            if (!game) {
                return callback({ status: false })
            }
            return callback({ status: game.submitMoveOn(socket.data.pid) })
        },
    )

    socket.on("disconnect", () => {
        if (socket.data) {
            const { pid } = socket.data
            const gid = pidToGid.get(pid)
            if (!gid) {
                return
            }
            const game = getGame(gid)
            if (game) {
                game.removeSocket(pid)
            }
            reconnectionTimeouts.set(
                pid,
                setTimeout(() => {
                    if (game) {
                        game.removePlayer(pid)
                        if (game.isEmpty()) deleteGame(gid)
                    }
                    pidToGid.delete(pid)
                }, settings.RECONNECTION_TIMEOUT),
            )
        }
    })
}
