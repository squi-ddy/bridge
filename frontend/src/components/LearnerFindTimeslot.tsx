import { IFindTimeslotsResult, Time } from "@backend/types/timeslot"
import { AnimatePresence, motion } from "framer-motion"
import Fuse from "fuse.js"
import { useMemo, useState } from "react"
import { days } from "./Calendar"
import MotionButton from "./MotionButton"
import { useNavigate } from "react-router-dom"

const itemVariants = {
    hidden: { transform: "translateY(-20px)", opacity: 0 },
    visible: { transform: "translateY(0)", opacity: 1 },
    exit: { opacity: 0 },
}

function LearnerFindTimeslot(props: {
    timeslots: IFindTimeslotsResult[]
    setHoverIndex: (index: number) => void
    highlightSubject: string
}) {
    const [filter, setFilter] = useState("")
    const navigate = useNavigate()

    const fuse = useMemo(
        () =>
            new Fuse(props.timeslots, {
                keys: [
                    "username",
                    "tutor-sid",
                    ["can-teach-subjects", "name"],
                    {
                        name: "start-times",
                        getFn: (obj: IFindTimeslotsResult) =>
                            obj.timeslots.map((ts) =>
                                Time.fromITime(ts["start-time"]).toString(),
                            ),
                    },
                    {
                        name: "end-times",
                        getFn: (obj: IFindTimeslotsResult) =>
                            obj.timeslots.map((ts) =>
                                Time.fromITime(ts["end-time"]).toString(),
                            ),
                    },
                ],
                threshold: 0.1,
            }),
        [props.timeslots],
    )

    const visibleTutors = useMemo(() => {
        let filteredTutors = props.timeslots
        if (filter) {
            filteredTutors = fuse.search(filter).map((r) => r.item)
        }
        return filteredTutors
    }, [fuse, filter, props.timeslots])

    return (
        <>
            <motion.h1
                key="join"
                variants={itemVariants}
                className="text-3xl"
                layout
            >
                Tutors
            </motion.h1>
            <motion.input
                variants={itemVariants}
                type="text"
                placeholder="Filter..."
                className="border-2 rounded-xl bg-transparent text-2xl w-full p-2 text-center min-w-0 focus:border-sky-400 focus:outline-none"
                onInput={async (e) => {
                    setFilter((e.target as HTMLInputElement).value)
                }}
            />
            <div className="border-2 rounded-xl border-white w-full h-full overflow-y-scroll">
                <AnimatePresence mode="popLayout">
                    {visibleTutors.map((tutor, idx) => (
                        <motion.div
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            key={tutor["tutor-sid"]}
                            className={`flex flex-col w-full gap-2 items-center p-4 border-b-2 border-white hover:bg-sky-900/50 transition-colors`}
                            layout
                            onMouseEnter={() => props.setHoverIndex(idx)}
                            onMouseLeave={() => props.setHoverIndex(-1)}
                        >
                            <div className="flex flex-row w-full gap-2">
                                <p className="text-2xl font-bold flex justify-center items-center">
                                    {tutor.username}
                                </p>
                                <p className="text-lg flex items-end">
                                    {tutor["tutor-sid"]}
                                </p>
                                <div className="grow" />
                                <MotionButton
                                    text="Request"
                                    onClick={() => {
                                        navigate("/request", {
                                            state: { data: tutor },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-row w-full gap-2 flex-wrap">
                                {tutor["timeslots"].map((timeslot, idx) => (
                                    <p
                                        key={idx}
                                        className={`${
                                            timeslot["has-pending"]
                                                ? "border-yellow-500"
                                                : "border-emerald-500"
                                        } border rounded-lg text-base px-2`}
                                        title={
                                            timeslot["has-pending"]
                                                ? "May have conflicts"
                                                : "Available"
                                        }
                                    >
                                        {days[timeslot["day-of-week"]]}{" "}
                                        {Time.fromITime(
                                            timeslot["start-time"],
                                        ).toHMString()}{" "}
                                        -{" "}
                                        {Time.fromITime(
                                            timeslot["end-time"],
                                        ).toHMString()}
                                    </p>
                                ))}
                            </div>
                            <div className="flex flex-row w-full gap-2">
                                {tutor["can-teach-subjects"].map((subject) => (
                                    <motion.p
                                        layout
                                        key={subject["subject-code"]}
                                        className={`${
                                            props.highlightSubject ===
                                            subject["subject-code"]
                                                ? "border-sky-500"
                                                : "border-white"
                                        } border rounded-lg text-base px-2 transition-colors`}
                                    >
                                        {subject.name},{" "}
                                        {subject["subject-gpa"].toFixed(1)}
                                    </motion.p>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </>
    )
}

export default LearnerFindTimeslot
