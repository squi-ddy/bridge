import { CensoredGameState } from "@backend/types/CensoredGameState.js"
import {
    ServerToClientEvents,
    ClientToServerEvents,
} from "@backend/types/Socket.js"
import { createContext, Dispatch, SetStateAction } from "react"
import { Socket } from "socket.io-client"

const SocketContext = createContext<{
    gameState: CensoredGameState | null | undefined
    setGameState?: Dispatch<SetStateAction<CensoredGameState | null>>
    socket?: Socket<ServerToClientEvents, ClientToServerEvents>
    setSocketConnected: Dispatch<SetStateAction<boolean>>
    setShowSocketStatus: Dispatch<SetStateAction<boolean>>
}>({
    gameState: undefined,
    setSocketConnected: () => {},
    setShowSocketStatus: () => {},
})

export default SocketContext
