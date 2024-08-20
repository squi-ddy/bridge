import { motion } from "framer-motion"
import { createContext, useCallback, useEffect, useMemo, useState } from "react"
import { createSocket } from "@/socket"
import { CensoredGameState } from "@backend/types/CensoredGameState"
import { ClientToServerEvents, ServerToClientEvents } from "@backend/types/Socket"
import { Socket } from "socket.io-client"

export const SocketContext = createContext<{
    gameState: CensoredGameState | null | undefined
    socket?: Socket<ServerToClientEvents, ClientToServerEvents>
    firstRender: boolean
}>({ gameState: undefined, socket: undefined, firstRender: true })

const topBarVariants = {
    visible: {
        transform: "translateY(-20px)",
    },
    hidden: {
        transform: "translateY(-100%)",
    },
    exit: {
        transform: "translateY(-100%)",
    },
}

const itemVariants = {
    visible: {
        opacity: 1,
        transform: "translateY(0px)",
        transition: { duration: 0.3 },
    },
    hidden: {
        opacity: 0,
        transform: "translateY(-20px)",
    },
    exit: {
        opacity: 0,
        transform: "translateY(-20px)",
    },
}

function BasePage(props: { children?: React.ReactNode }) {
    const [currentGameState, setCurrentGameState] =
        useState<CensoredGameState | null>(null)
    const [firstRender, setFirstRender] = useState(true)
    const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | undefined>(undefined)

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

    const contextValue = useMemo(() => {
        return {
            gameState: currentGameState,
            socket,
            firstRender,
        }
    }, [currentGameState, socket, firstRender])

    if (currentGameState === undefined) {
        return <></>
    }

    return (
        <div id="root">
            <SocketContext.Provider value={contextValue}>
                <motion.div
                    variants={topBarVariants}
                    initial={"hidden"}
                    animate={"visible"}
                    exit={"exit"}
                    id="header"
                    className="pt-[20px] bg-gradient-to-r from-sky-900 to-sky-800 w-full mb-[-20px]"
                >
                    <div className="px-5 flex items-center justify-center p-2 gap-2">
                        <motion.p
                            variants={itemVariants}
                            initial={"hidden"}
                            animate={"visible"}
                            exit={"exit"}
                            className="text-5xl justify-self-start my-1 font-bold text-orange-400 drop-shadow-md"
                        >
                            Bridge
                        </motion.p>
                    </div>
                </motion.div>

                {props.children}
            </SocketContext.Provider>
        </div>
    )
}

export default BasePage
