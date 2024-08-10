import { Game } from "classes/Game"
import { io } from "setup"

const games = new Map<number, Game>()

io.on("connection", (socket) => {
    console.log("A user connected")
    socket.on("disconnect", () => {
        console.log("A user disconnected")
    })
})