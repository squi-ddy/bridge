import { SocketContext } from "@/base/BasePage"
import { useContext } from "react"
import Button from "./Button"

function WashStage() {
    const { gameState, socket } = useContext(SocketContext)

    const handPoints = gameState!.playerData.handPoints

    if (handPoints <= 4) {
        return (
            <>
                <p className="text-3xl">{`Your hand has ${handPoints} points. Do you want to wash?`}</p>
                <div className="flex gap-2">
                    <Button
                        text="Wash"
                        textSize="text-xl"
                        onClick={() => socket?.emitWithAck("submitWash", true)}
                    />
                    <Button
                        text="Don't Wash"
                        textSize="text-xl"
                        onClick={() => socket?.emitWithAck("submitWash", false)}
                    />
                </div>
            </>
        )
    } else {
        return (
            <>
                <p className="text-3xl">{`Waiting for washes...`}</p>
            </>
        )
    }
}

export default WashStage
