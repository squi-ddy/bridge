import { motion } from "framer-motion"
import { ReactNode } from "react"

const baseVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.1,
        },
    },
    exit: {
        transition: {
            staggerChildren: 0.01,
        },
    },
}

function MotionBase(props: { children: ReactNode; layout?: boolean }) {
    return (
        <motion.div
            variants={baseVariants}
            initial={"hidden"}
            animate={"visible"}
            exit={"exit"}
            transition={{ duration: 0 }}
            layout={props.layout}
            className="grow flex flex-col gap-4 justify-center items-center w-full h-full min-h-0 relative z-0"
        >
            {props.children}
        </motion.div>
    )
}

export default MotionBase
