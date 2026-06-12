import {
    createContext,
    Dispatch,
    SetStateAction,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import { createSocket } from "@/socket.js"
import { CensoredGameState } from "@backend/types/CensoredGameState.js"
import {
    ClientToServerEvents,
    ServerToClientEvents,
} from "@backend/types/Socket.js"
import { Socket } from "socket.io-client"

export const SocketContext = createContext<{
    gameState: CensoredGameState | null | undefined
    setGameState?: Dispatch<SetStateAction<CensoredGameState | null>>
    socket?: Socket<ServerToClientEvents, ClientToServerEvents>
}>({ gameState: undefined })

export type SettingsType = {
    balatro: boolean
}

export type SettingsContextType = {
    settings: SettingsType
    setSettings: (globalContext: SettingsType) => void
}

export const SettingsContext = createContext<SettingsContextType>({
    settings: { balatro: false },
    setSettings: () => {},
})

function BasePage(props: { children?: React.ReactNode }) {
    const [currentGameState, setCurrentGameState] =
        useState<CensoredGameState | null>(null)
    const socketRef =
        useRef<Socket<ServerToClientEvents, ClientToServerEvents>>(
            createSocket(),
        )

    useEffect(() => {
        const socket = socketRef.current
        const cleanup = () => {
            socket.off("syncState")
            socket.disconnect()
        }

        socket.on("syncState", (state: CensoredGameState) => {
            setCurrentGameState(state)
        })

        const pid = localStorage.getItem("pid")
        if (pid === null) {
            // no pid, not connected
            return cleanup
        }

        socketRef.current.emit("reconnect", pid, (data) => {
            if (!data.status || data.data === 0) {
                // failed to resync
                console.log("Failed to reconnect")
                setCurrentGameState(null)
                localStorage.removeItem("pid")
            } else if (data.data === 1) {
                // already connected
                alert("You're already connected!")
                socketRef.current.disconnect()
            } else {
                // success
                console.log("Reconnected")
            }
        })

        return cleanup
    }, [])

    const socketContextValue = useMemo(() => {
        return {
            gameState: currentGameState,
            setGameState: setCurrentGameState,
            socket: socketRef.current,
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
                    <div className="bg-linear-to-r from-sky-900 to-sky-800 w-full h-20">
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
                    </div>

                    {props.children}
                </SocketContext>
            </SettingsContext>
        </div>
    )
}

export default BasePage
