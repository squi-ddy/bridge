import { cardToCardURL } from "@/util/cards"
import { Card } from "@backend/types/Card"

function PlayingStageCards(props: { cards: Card[]; playerNames: string[] }) {
    return (
        <div className="flex w-full gap-2 mb-5 justify-center">
            {props.cards.map((card, idx) => (
                <div
                    key={cardToCardURL(card)}
                    className="flex flex-col gap-2 items-center"
                >
                    <img src={cardToCardURL(card)} className={`w-40`} />
                    <p className="text-2xl">From {props.playerNames[idx]}</p>
                </div>
            ))}
        </div>
    )
}

export default PlayingStageCards
