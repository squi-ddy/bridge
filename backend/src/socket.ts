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
    socket.data = { gid: "", pid: "" }

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
                socket.data = { gid, pid }
                return callback({ status: true, data: pid })
            } else {
                return callback({ status: false, code: status })
            }
        },
    )

    socket.on("leaveGame", (pid: string, callback: (data: SocketReturnStatus) => void):void => {
        const gid = pidToGid.get(pid)
        if (!gid) {
            return callback({ status: false })
        }
        const game = games.get(gid)
        if (!game) {
            return callback({ status: false })
        }
        if (game.getPlayerSocket(pid) !== socket) {
            return callback({ status: false })
        }
        if (game.removePlayer(pid)) {
            pidToGid.delete(pid)
            socket.data = { gid: "", pid: "" }
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
            socket.data = { gid, pid }
        }
        return callback({ status: true, data: status })
    })

    socket.on("rearrange", (pid: string, rel: number, callback: (data: SocketReturnStatus) => void): void => {
        const gid = pidToGid.get(pid)
        if (!gid) {
            return callback({ status: false })
        }
        const game = games.get(gid)
        if (!game) {
            return callback({ status: false })
        }
        if (game.getPlayerSocket(pid) !== socket) {
            return callback({ status: false })
        }
        if (rel !== -1 && rel !== 1) {
            return
        }
        return callback({ status: game.movePlayer(pid, rel) })
    })

    socket.on("toggleStartGame", (pid: string, callback: (data: SocketReturnStatus) => void): void => {
        const gid = pidToGid.get(pid)
        if (!gid) {
            return callback({ status: false })
        }
        const game = games.get(gid)
        if (!game) {
            return callback({ status: false })
        }
        if (game.getPlayerSocket(pid) !== socket) {
            return callback({ status: false })
        }
        return callback({ status: game.toggleToStart(pid) })
    })

    socket.on("submitWash", (pid: string, callback: (data: SocketReturnStatus) => void): void => {
        const gid = pidToGid.get(pid)
        if (!gid) {
            return callback({ status: false })
        }
        const game = games.get(gid)
        if (!game) {
            return callback({ status: false })
        }
        if (game.getPlayerSocket(pid) !== socket) {
            return callback({ status: false })
        }
        return callback({ status: game.submitWash(pid) })
    })

    socket.on("submitBet", (pid: string, bet: Bet, callback: (data: SocketReturnStatus) => void): void => {
        const gid = pidToGid.get(pid)
        if (!gid) {
            return callback({ status: false })
        }
        const game = games.get(gid)
        if (!game) {
            return callback({ status: false })
        }
        if (game.getPlayerSocket(pid) !== socket) {
            return callback({ status: false })
        }
        return callback({ status: game.submitBet(pid, bet) })
    })

    socket.on(
        "choosePartnerSubmit",
        (pid: string, card: Card, callback: (data: SocketReturnStatus) => void): void => {
            const gid = pidToGid.get(pid)
            if (!gid) {
                return callback({ status: false })
            }
            const game = games.get(gid)
            if (!game) {
                return callback({ status: false })
            }
            if (game.getPlayerSocket(pid) !== socket) {
                return callback({ status: false })
            }
            return callback({ status: game.choosePartnerSubmit(pid, card) })
        },
    )

    socket.on("playCard", (pid: string, card: Card, callback: (data: SocketReturnStatus) => void): void => {
        const gid = pidToGid.get(pid)
        if (!gid) {
            return callback({ status: false })
        }
        const game = games.get(gid)
        if (!game) {
            return callback({ status: false })
        }
        if (game.getPlayerSocket(pid) !== socket) {
            return callback({ status: false })
        }
        return callback({ status: game.playCard(pid, card) })
    })

    socket.on("disconnect", () => {
        if (socket.data) {
            const { gid, pid } = socket.data
            const game = games.get(gid)
            if (game) {
                game.removeSocket(pid)
            }
        }
    })
}
