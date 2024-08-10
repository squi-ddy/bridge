import { AnimatePresence, motion } from "framer-motion"
import { useState, useEffect } from "react"

const texts = [
    "mentorship",
    "knowledge",
    "collaboration",
    "learning",
    "bonding",
    "a",
]

const textElements = texts.map((text, index) => {
    return (
        <motion.h1
            initial={{
                opacity: 0,
                transform: index === 0 ? "translateX(0)" : "translateX(40px)",
            }}
            animate={{
                opacity: index === texts.length - 1 ? 0 : 1,
                transform: "translateX(0)",
            }}
            exit={{
                opacity: 0,
                transform:
                    index === texts.length - 2
                        ? "translateX(0)"
                        : "translateX(-40px)",
            }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
            className="text-8xl text-orange-400 font-bold"
            key={index}
        >
            {text}
        </motion.h1>
    )
})

function SlidingText() {
    const [index, setIndex] = useState(0)
    useEffect(() => {
        const interval = setInterval(
            () => {
                setIndex((index + 1) % texts.length)
            },
            index === texts.length - 1 ? 1500 : 3000,
        )

        return () => clearInterval(interval)
    }, [index])

    return <AnimatePresence mode="wait">{textElements[index]}</AnimatePresence>
}

export default SlidingText
