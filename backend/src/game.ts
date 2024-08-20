import { Game } from "classes/Game"
import { io } from "setup"
import { Bet } from "types/Bet"
import { Card } from "types/Card"
import { SocketReturnData, SocketReturnStatus } from "types/SocketReturn"
import { v4 as uuidv4 } from "uuid"

const games = new Map<string, Game>()
const pidToGid = new Map<string, string>()

io.on("connection", (socket) => {
    socket.on(
        "joinGame",
        (gid: string, name: string): SocketReturnData<string> => {
            if (!gid.match(/^[A-Z]{4}$/)) {
                return { status: false }
            }
            if (!games.has(gid)) {
                games.set(gid, new Game())
            }
            const game = games.get(gid)!
            const pid = uuidv4()
            pidToGid.set(pid, gid)
            const status = game.addPlayer(socket, pid, name)
            if (status) {
                return { status: true, data: pid }
            } else {
                return { status: false }
            }
        },
    )

    socket.on("leaveGame", (pid: string): SocketReturnStatus => {
        const gid = pidToGid.get(pid)
        if (!gid) {
            return { status: false }
        }
        const game = games.get(gid)
        if (!game) {
            return { status: false }
        }
        if (game.getPlayerSocket(pid) !== socket) {
            return { status: false }
        }
        if (game.removePlayer(pid)) {
            pidToGid.delete(pid)
            return { status: true }
        } else {
            return { status: false }
        }
    })

    socket.on("reconnect", (pid: string): SocketReturnStatus => {
        const gid = pidToGid.get(pid)
        if (!gid) {
            return { status: false }
        }
        const game = games.get(gid)
        if (!game) {
            return { status: false }
        }
        return { status: game.resyncSocket(pid, socket) }
    })

    socket.on("toggleStartGame", (pid: string): SocketReturnStatus => {
        const gid = pidToGid.get(pid)
        if (!gid) {
            return { status: false }
        }
        const game = games.get(gid)
        if (!game) {
            return { status: false }
        }
        if (game.getPlayerSocket(pid) !== socket) {
            return { status: false }
        }
        return { status: game.toggleToStart(pid) }
    })

    socket.on("submitWash", (pid: string): SocketReturnStatus => {
        const gid = pidToGid.get(pid)
        if (!gid) {
            return { status: false }
        }
        const game = games.get(gid)
        if (!game) {
            return { status: false }
        }
        if (game.getPlayerSocket(pid) !== socket) {
            return { status: false }
        }
        return { status: game.submitWash(pid) }
    })

    socket.on("submitBet", (pid: string, bet: Bet): SocketReturnStatus => {
        const gid = pidToGid.get(pid)
        if (!gid) {
            return { status: false }
        }
        const game = games.get(gid)
        if (!game) {
            return { status: false }
        }
        if (game.getPlayerSocket(pid) !== socket) {
            return { status: false }
        }
        return { status: game.submitBet(pid, bet) }
    })

    socket.on(
        "choosePartnerSubmit",
        (pid: string, card: Card): SocketReturnStatus => {
            const gid = pidToGid.get(pid)
            if (!gid) {
                return { status: false }
            }
            const game = games.get(gid)
            if (!game) {
                return { status: false }
            }
            if (game.getPlayerSocket(pid) !== socket) {
                return { status: false }
            }
            return { status: game.choosePartnerSubmit(pid, card) }
        },
    )

    socket.on("playCard", (pid: string, card: Card): SocketReturnStatus => {
        const gid = pidToGid.get(pid)
        if (!gid) {
            return { status: false }
        }
        const game = games.get(gid)
        if (!game) {
            return { status: false }
        }
        if (game.getPlayerSocket(pid) !== socket) {
            return { status: false }
        }
        return { status: game.playCard(pid, card) }
    })

    socket.on("disconnect", () => {
        console.log("A user disconnected")
    })
})
