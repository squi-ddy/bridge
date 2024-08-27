import SetTitle from "@/components/SetTitle"
import { useNavigate } from "react-router-dom"
import Button from "@/components/Button"
import { useContext } from "react"
import { SocketContext } from "@/base/BasePage"

function LobbyPage() {
    const navigate = useNavigate()

    const { gameState, setGameState, socket } = useContext(SocketContext)

    if (!gameState) return <></>

    return (
        <>
            <SetTitle title={`Room ${gameState.roomCode}`} />

            <div className="flex gap-2 justify-center items-center border-b-2 p-2 w-full text-2xl">
                Room code:{" "}
                <span className="font-bold text-orange-400">
                    {gameState.roomCode}
                </span>
            </div>

            <div className="flex flex-col gap-2 justify-center items-center border-b-2 p-2 mb-2 w-full grow">
                <p className="text-2xl underline">Players</p>
                {gameState.playerData.playerNames.map((player, idx) => (
                    <p key={player} className="text-xl">
                        {idx + 1}.{" "}
                        <span
                            className={
                                idx === gameState.playerData.order
                                    ? "text-orange-400"
                                    : ""
                            }
                        >
                            {player}
                        </span>
                        {gameState.playerData.ready[idx] ? " (✓)" : ""}
                    </p>
                ))}
                <div className="grow" />
            </div>

            <div className="flex gap-2 justify-center items-center p-2 pt-0 w-full">
                <Button
                    text="Leave Room"
                    onClick={() => {
                        socket?.emit("leaveGame", (data) => {
                            if (data.status) {
                                navigate("/")
                                localStorage.removeItem("pid")
                                if (setGameState) setGameState(null)
                            }
                        })
                    }}
                ></Button>
                <Button
                    text="↑"
                    onClick={() => {
                        socket?.emit("rearrange", -1)
                    }}
                ></Button>
                <Button
                    text="↓"
                    onClick={() => {
                        socket?.emit("rearrange", 1)
                    }}
                ></Button>
                <Button
                    text="Ready"
                    onClick={() => {
                        socket?.emit("toggleStartGame")
                    }}
                    emphasis={
                        gameState.playerData.ready[gameState.playerData.order]
                    }
                ></Button>
            </div>
        </>
    )
}

export default LobbyPage
