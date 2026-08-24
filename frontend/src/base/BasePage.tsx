import { useEffect, useMemo, useState } from "react"
import { socket } from "@/socket.js"
import { CensoredGameState } from "@backend/types/CensoredGameState.js"
import SettingsContext from "./SettingsContext.js"
import SocketContext from "./SocketContext.js"
import { TbWifi, TbWifiOff } from "react-icons/tb"

function BasePage(props: { children?: React.ReactNode }) {
    const [currentGameState, setCurrentGameState] =
        useState<CensoredGameState | null>(null)
    const [socketConnected, setSocketConnected] = useState(false)
    const [showSocketStatus, setShowSocketStatus] = useState(false)

    const attemptReconnect = () => {
        const pid = localStorage.getItem("pid")
        if (pid === null) {
            // no pid, not connected
            return
        }

        console.log("Attempting to reconnect with pid", pid)

        socket.emit("reconnect", pid, (data) => {
            if (!data.status || data.data === 0) {
                // failed to resync
                console.log("Failed to reconnect")
                setCurrentGameState(null)
                localStorage.removeItem("pid")
            } else if (data.data === 1) {
                // already connected
                alert("You're already connected!")
                socket.disconnect()
            } else {
                // success
                setSocketConnected(true)
                console.log("Reconnected")
            }
        })
    }

    useEffect(() => {
        const cleanup = () => {
            socket.off("connect")
            socket.off("syncState")
            socket.off("disconnect")
            socket.disconnect()
        }

        socket.on("connect", () => {
            attemptReconnect()
        })

        socket.on("syncState", (state: CensoredGameState) => {
            setCurrentGameState(state)
        })

        socket.on("disconnect", (reason) => {
            if (reason === "io client disconnect") {
                // client disconnected, do nothing
                return
            }

            setSocketConnected(false)
        })

        // connect the socket
        socket.connect()

        return cleanup
    }, [])

    const socketContextValue = useMemo(() => {
        return {
            gameState: currentGameState,
            setGameState: setCurrentGameState,
            socket,
            setShowSocketStatus,
            setSocketConnected,
        }
    }, [currentGameState])

    const [settings, setSettings] = useState({ balatro: false })

    if (currentGameState === undefined) {
        return <></>
    }

    return (
        <div id="root" className="font-nunito">
            <SettingsContext value={{ settings, setSettings }}>
                <SocketContext value={socketContextValue}>
                    <div className="relative bg-linear-to-r from-sky-900 to-sky-800 w-full h-20">
                        <div className="px-5 flex items-center justify-center p-2 gap-2 h-full">
                            <p
                                className={`text-5xl text-orange-400 drop-shadow-lg font-bold ${
                                    settings.balatro ? "font-balatro" : ""
                                }`}
                            >
                                <span
                                    className="cursor-pointer"
                                    onClick={() =>
                                        setSettings((prev) => {
                                            return {
                                                ...prev,
                                                balatro: !prev.balatro,
                                            }
                                        })
                                    }
                                >
                                    B
                                </span>
                                ridge
                            </p>
                        </div>
                        {showSocketStatus &&
                            (socketConnected ? (
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-green-400 font-bold h-1/2 aspect-square">
                                    <TbWifi
                                        size="100%"
                                        aria-label="Connected"
                                    />
                                </div>
                            ) : (
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-red-400 font-bold h-1/2 aspect-square">
                                    <TbWifiOff
                                        size="100%"
                                        aria-label="Disconnected"
                                    />
                                </div>
                            ))}
                    </div>

                    {props.children}
                </SocketContext>
            </SettingsContext>
        </div>
    )
}

export default BasePage
