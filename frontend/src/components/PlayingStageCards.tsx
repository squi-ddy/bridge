import { use } from "react"
import { SettingsContext } from "@/base/BasePage.js"
import { cardToCardURL } from "@/util/cards.js"
import { Card } from "@backend/types/Card.js"
import CardImage from "./CardImage.js"

function PlayingStageCards(props: { cards: Card[]; playerNames: string[] }) {
    const { settings } = use(SettingsContext)

    return (
        <div className="flex w-full gap-2 mb-4 justify-center">
            {props.cards.map((card, idx) => (
                <div
                    key={cardToCardURL(card, settings.balatro)}
                    className="flex flex-col gap-2 items-center"
                >
                    <CardImage card={card} balatro={settings.balatro} />
                    <p className="text-2xl">From {props.playerNames[idx]}</p>
                </div>
            ))}
        </div>
    )
}

export default PlayingStageCards
