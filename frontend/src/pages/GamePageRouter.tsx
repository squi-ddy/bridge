import { SocketContext } from "@/base/BasePage"
import { useContext, useEffect } from "react"
import LobbyPage from "./LobbyPage"
import GamePage from "./GamePage"
import { useNavigate, useParams } from "react-router-dom"

function GamePageRouter() {
    const navigate = useNavigate()
    const { gameState } = useContext(SocketContext)
    const { roomCode: roomCodeParam } = useParams()

    useEffect(() => {
        if (gameState && gameState.roomCode !== roomCodeParam) {
            navigate("/room/" + gameState.roomCode)
        } else if (gameState === null) {
            navigate("/")
        }
    }, [gameState, navigate, roomCodeParam])

    if (gameState?.gameState === 0) {
        return <LobbyPage />
    } else {
        return <GamePage />
    }
}

export default GamePageRouter
