import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { TbMoodSad } from "react-icons/tb"
import SetTitle from "@/components/SetTitle"

const itemVariants = {
    hidden: { transform: "translateY(-20px)", opacity: 0 },
    visible: { transform: "translateY(0)", opacity: 1 },
    exit: { opacity: 0 },
}

function Page404() {
    return (
        <>
            <SetTitle title="404" />
            <div className="grow" />
            <motion.div variants={itemVariants}>
                <TbMoodSad size={200} />
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-5xl text-center">
                This page doesn&#39;t exist
            </motion.h1>
            <motion.h1 variants={itemVariants} className="text-3xl text-center">
                Go back to the{" "}
                <Link
                    to="/"
                    className="underline hover:text-orange-400 transition-color duration-300"
                >
                    home page
                </Link>
                ?
            </motion.h1>
            <div className="grow" />
        </>
    )
}

export default Page404
