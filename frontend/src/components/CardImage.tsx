import { cardToCardURL } from "@/util/cards"
import { Card } from "@backend/types/Card"

function CardImage(props: {
    card: Card
    balatro: boolean
    className?: string
    onClick?: () => void
}) {
    return (
        <img
            src={cardToCardURL(props.card, props.balatro)}
            className={`${props.className} ${
                props.balatro ? "rounded-lg" : "rounded-sm"
            }`}
            style={props.balatro ? { imageRendering: "pixelated" } : {}}
            onClick={props.onClick}
        />
    )
}

export default CardImage
