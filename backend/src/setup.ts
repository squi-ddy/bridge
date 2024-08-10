import http from "http"
import express from "express"
import compression from "compression"
import helmet from "helmet"
import cors from "cors"
import { Server } from "socket.io"

const app = express()
const server = http.createServer(app)

const allowedOrigins = [
    new RegExp("http://localhost:[0-9]+"),
    "https://squiddy.me",
]

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
    },
})

app.use(
    cors({
        origin: allowedOrigins,
    }),
)
app.use(helmet())
app.use(compression())
app.use(express.json({ limit: "50mb" }))

export { server, io }
