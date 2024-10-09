import { useContext } from "react"
import { SettingsContext } from "@/base/BasePage"
import { cardToCardURL } from "@/util/cards"
import { Card } from "@backend/types/Card"
import CardImage from "./CardImage"

function PlayingStageCards(props: { cards: Card[]; playerNames: string[] }) {
    const { settings } = useContext(SettingsContext)

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
