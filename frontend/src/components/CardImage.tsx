import { cardToCardURL } from "@/util/cards"
import { Card } from "@backend/types/Card"
import { CSSProperties } from "react"

function CardImage(props: {
    card: Card
    balatro: boolean
    className?: string
    onClick?: () => void
    style?: CSSProperties
}) {
    return (
        <img
            src={cardToCardURL(props.card, props.balatro)}
            className={`${props.className ?? ""} w-40 rounded-lg`}
            style={
                props.balatro
                    ? { ...props.style, imageRendering: "pixelated" }
                    : props.style
            }
            onClick={props.onClick}
        />
    )
}

export default CardImage
