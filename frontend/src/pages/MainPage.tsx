import { motion } from "framer-motion"
import { FaChalkboardTeacher, FaPeopleCarry } from "react-icons/fa"
import { FaPerson } from "react-icons/fa6"
import MotionButton from "@/components/MotionButton"
import SetTitle from "@/components/SetTitle"
import { useNavigate } from "react-router-dom"
import SlidingText from "@/components/SlidingText"
import { useContext } from "react"
import { UserContext } from "@/base/BasePage"
import HomePage from "./HomePage"

const itemVariants = {
    hidden: { transform: "translateY(-20px)", opacity: 0 },
    visible: { transform: "translateY(0)", opacity: 1 },
    exit: { opacity: 0 },
}

function MainPage() {
    const navigate = useNavigate()

    const { user } = useContext(UserContext)

    if (user) return <HomePage />

    return (
        <>
            <SetTitle title="Peerly" />
            <div className="grow-[2]" />
            <motion.h1 variants={itemVariants} className="text-8xl">
                A place for
            </motion.h1>
            <motion.div variants={itemVariants}>
                <SlidingText />
            </motion.div>

            <div className="grow-[3]" />

            <motion.h1 className="text-4xl" variants={itemVariants}>
                Peerly is a place for students to{" "}
                <span className="text-orange-400">collaborate</span> and{" "}
                <span className="text-orange-400">learn</span> together.
            </motion.h1>
            <motion.h1 className="text-4xl" variants={itemVariants}>
                Students can <span className="text-orange-400">mentor</span>{" "}
                each other, and <span className="text-orange-400">bond</span>{" "}
                with each other.
            </motion.h1>
            <div className="flex gap-2 w-full justify-center">
                <MotionButton
                    variants={itemVariants}
                    whileHover={{ transform: "translateY(-5px)" }}
                    text="Join Peerly"
                    textSize="text-2xl"
                    emphasis
                    onClick={() => {
                        navigate("/auth/register")
                    }}
                />
            </div>
            <div className="grow" />
            <div className="flex gap-4 w-full justify-center">
                <motion.div
                    variants={itemVariants}
                    className="border-2 rounded-xl p-4 w-1/5 aspect-square h-auto flex flex-col items-center justify-center gap-2"
                >
                    <FaChalkboardTeacher className="grow aspect-square w-auto max-h-[40%]" />
                    <h1 className="text-4xl text-orange-400 font-bold">
                        Mentorship
                    </h1>
                    <p className="text-xl text-center">
                        Students can mentor each other, learning from others,
                        but also reinforcing their own knowledge.
                    </p>
                </motion.div>
                <motion.div
                    variants={itemVariants}
                    className="border-2 rounded-xl p-4 w-1/5 aspect-square h-auto flex flex-col items-center justify-center gap-2"
                >
                    <FaPeopleCarry className="grow aspect-square w-auto max-h-[40%]" />
                    <h1 className="text-4xl text-orange-400 font-bold">
                        Bonding
                    </h1>
                    <p className="text-xl text-center">
                        Tutoring helps students bond with each other, and form
                        friendships that last a lifetime.
                    </p>
                </motion.div>
                <motion.div
                    variants={itemVariants}
                    className="border-2 rounded-xl p-4 w-1/5 aspect-square h-auto flex flex-col items-center justify-center gap-2"
                >
                    <FaPerson className="grow aspect-square w-auto max-h-[40%]" />
                    <h1 className="text-4xl text-orange-400 font-bold">
                        Personal
                    </h1>
                    <p className="text-xl text-center">
                        Peerly assigns 1-on-1 tutoring sessions, so that
                        students can get the most out of their time.
                    </p>
                </motion.div>
            </div>
            <div className="grow-[2]" />
        </>
    )
}

export default MainPage
