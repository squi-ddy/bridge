import {
    createContext,
    Dispatch,
    SetStateAction,
    useEffect,
    useMemo,
    useState,
} from "react"
import { createSocket } from "@/socket"
import { CensoredGameState } from "@backend/types/CensoredGameState"
import {
    ClientToServerEvents,
    ServerToClientEvents,
} from "@backend/types/Socket"
import { Socket } from "socket.io-client"

export const SocketContext = createContext<{
    gameState: CensoredGameState | null | undefined
    setGameState?: Dispatch<SetStateAction<CensoredGameState | null>>
    socket?: Socket<ServerToClientEvents, ClientToServerEvents>
    firstRender: boolean
}>({ gameState: undefined, firstRender: true })

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
    const [firstRender, setFirstRender] = useState(true)
    const [socket, setSocket] = useState<
        Socket<ServerToClientEvents, ClientToServerEvents> | undefined
    >(undefined)

    useEffect(() => {
        if (currentGameState === undefined) {
            // doesn't count
            return
        }
        if (firstRender) {
            setFirstRender(false)
        }
    }, [currentGameState, firstRender])

    useEffect(() => {
        const socket = createSocket()
        setSocket(socket)
        socket.on("syncState", (state: CensoredGameState) => {
            setCurrentGameState(state)
        })

        return () => {
            socket.off("syncState")
            socket.disconnect()
        }
    }, [])

    const resyncGame = useCallback(async () => {
        const pid = localStorage.getItem("pid")
        if (pid === null) {
            setCurrentGameState(null)
            return
        }

        socket?.emit("reconnect", pid, (data) => {
            if (!data.status || data.data === 0) {
                // failed to resync
                console.log("Failed to reconnect")
                setCurrentGameState(null)
                localStorage.removeItem("pid")
            } else if (data.data === 1) {
                // already connected
                alert("You're already connected!")
                socket.disconnect()
                window.close()
            } else {
                // success
                console.log("Reconnected")
            }
        })
    }, [socket])

    useEffect(() => {
        resyncGame()
    }, [resyncGame])

    const socketContextValue = useMemo(() => {
        return {
            gameState: currentGameState,
            setGameState: setCurrentGameState,
            socket,
            firstRender,
        }
    }, [currentGameState, socket, firstRender])

    const [settings, setSettings] = useState({ balatro: false })

    if (currentGameState === undefined) {
        return <></>
    }

    return (
        <div id="root">
            <SettingsContext.Provider value={{ settings, setSettings }}>
                <SocketContext.Provider value={socketContextValue}>
                    <div className="bg-gradient-to-r from-sky-900 to-sky-800 w-full">
                        <div className="px-5 flex items-center justify-center p-2 gap-2">
                            <p className="text-5xl justify-self-start my-1 font-bold text-orange-400 drop-shadow-md">
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
                </SocketContext.Provider>
            </SettingsContext.Provider>
        </div>
    )
}

export default BasePage
