import SocketContext from "@/base/SocketContext.js"
import { use, useEffect } from "react"
import LobbyPage from "./LobbyPage.js"
import GamePage from "./GamePage.js"
import { useNavigate, useParams } from "react-router-dom"
import { GameState } from "@backend/types/GameState.js"

function GamePageRouter() {
    const navigate = useNavigate()
    const { gameState, setShowSocketStatus } = use(SocketContext)
    const { roomCode: roomCodeParam } = useParams()

    useEffect(() => {
        if (gameState && gameState.roomCode !== roomCodeParam) {
            navigate("/room/" + gameState.roomCode)
        } else if (gameState === null) {
            navigate("/")
        }
    }, [gameState, navigate, roomCodeParam])

    useEffect(() => {
        setShowSocketStatus(true)
        return () => {
            setShowSocketStatus(false)
        }
    }, [setShowSocketStatus])

    if (gameState?.gameState === GameState.LOBBY) {
        return <LobbyPage />
    } else {
        return <GamePage />
    }
}

export default GamePageRouter
