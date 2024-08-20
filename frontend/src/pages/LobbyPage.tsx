import { motion } from "framer-motion"
import SetTitle from "@/components/SetTitle"
import { useNavigate, useParams } from "react-router-dom"
import MotionButton from "@/components/MotionButton"
import { useContext, useEffect } from "react"
import { SocketContext } from "@/base/BasePage"
import FormTextInput from "@/components/forms/FormTextInput"

const itemVariants = {
    hidden: { transform: "translateY(-20px)", opacity: 0 },
    visible: { transform: "translateY(0)", opacity: 1 },
    exit: { opacity: 0 },
}

function LobbyPage() {
    const navigate = useNavigate()

    const { gameState } = useContext(SocketContext)
    const { roomCode: roomCodeParam } = useParams()

    useEffect(() => {
        if (gameState && gameState.roomCode !== roomCodeParam) {
            navigate("/room/" + gameState.roomCode)
        } else if (gameState === null) {
            navigate("/")
        }
    }, [gameState, navigate])

    if (!gameState) return <></>

    return (
        <>
            <SetTitle title={`Room ${gameState.roomCode}`} />

            <motion.div
                variants={itemVariants}
                className="flex gap-2 justify-center items-center border-b-2 p-2 w-full text-2xl"
            >
                Room code: <span className="font-bold text-orange-400">{gameState.roomCode}</span>
            </motion.div>

            <motion.div
                variants={itemVariants}
                className="flex flex-col gap-2 justify-center items-center border-b-2 p-2 pt-0 w-full grow"
            >
                <motion.p variants={itemVariants} className="text-2xl underline">Players</motion.p>
                {gameState.players.playerNames.map((player, idx) => (
                    <motion.p variants={itemVariants} key={player}>
                        {idx+1}. <span className={idx === gameState.players.order ? "text-orange-400" : ""}>{player}</span>
                    </motion.p>
                ))}
                <div className="grow" />
            </motion.div>

            <motion.div variants={itemVariants}
            className="flex gap-2 justify-center items-center p-2 pt-0 w-full">
                <MotionButton text="Leave Room"></MotionButton>
                <MotionButton text="↑"></MotionButton>
                <MotionButton text="↓"></MotionButton>
                <MotionButton text="Ready"></MotionButton>
            </motion.div>
        </>
    )
}

export default LobbyPage
