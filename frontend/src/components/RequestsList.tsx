import { UserContext } from "@/base/BasePage"
import { Time } from "@backend/types/timeslot"
import { IPendingTutelage } from "@backend/types/tutelage"
import { AnimatePresence, motion } from "framer-motion"
import Fuse from "fuse.js"
import { useContext, useMemo, useState } from "react"
import { days } from "./Calendar"

const itemVariants = {
    hidden: { transform: "translateY(-20px)", opacity: 0 },
    visible: { transform: "translateY(0)", opacity: 1 },
    exit: { opacity: 0 },
}

function RequestsList(props: {
    tutelages: IPendingTutelage[]
    setHoverIndex: (index: number) => void
}) {
    const [filter, setFilter] = useState("")
    const [selected, setSelected] = useState(-1)

    const { user } = useContext(UserContext)

    const fuse = useMemo(
        () =>
            new Fuse(props.tutelages, {
                keys: [
                    "tutor.username",
                    "learner.username",
                    "timeslots.subject.name",
                ],
                threshold: 0.1,
            }),
        [props.tutelages],
    )

    const visibleTutelages = useMemo(() => {
        let filteredTutelages = props.tutelages
        if (filter) {
            filteredTutelages = fuse.search(filter).map((r) => r.item)
        }
        return filteredTutelages
    }, [fuse, filter, props.tutelages])

    return (
        <>
            <motion.h1
                key="join"
                variants={itemVariants}
                className="text-3xl"
                layout
            >
                Pending Tutelages
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
                    {visibleTutelages.map((tutelage, idx) => {
                        const learnerIsUser =
                            tutelage.learner["student-id"] ===
                            user?.["student-id"]
                        const tutorIsUser =
                            tutelage.tutor["student-id"] ===
                            user?.["student-id"]

                        const subjectNamesUnique = new Map<
                            string,
                            [string, string]
                        >()
                        tutelage.timeslots
                            .map((ts) => ts.subject)
                            .forEach((s) =>
                                subjectNamesUnique.set(s["subject-code"], [
                                    s["subject-code"],
                                    s.name,
                                ]),
                            )
                        const subjects = Array.from(subjectNamesUnique.values())

                        return (
                            <motion.div
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                key={tutelage["tutelage-id"]}
                                className={`flex flex-col w-full gap-4 items-center p-4 border-b-2 border-white ${
                                    selected === idx
                                        ? "bg-sky-900"
                                        : "hover:bg-sky-900/50"
                                } transition-colors`}
                                layout
                                onMouseEnter={() => {
                                    if (selected === -1)
                                        props.setHoverIndex(idx)
                                }}
                                onMouseLeave={() => {
                                    if (selected === -1) props.setHoverIndex(-1)
                                }}
                                onClick={() => {
                                    if (selected === idx) {
                                        setSelected(-1)
                                        props.setHoverIndex(idx)
                                    } else {
                                        setSelected(idx)
                                        props.setHoverIndex(idx)
                                    }
                                }}
                            >
                                <div className="flex flex-row gap-2 w-full">
                                    <p
                                        className={`${
                                            tutorIsUser
                                                ? "border-sky-500"
                                                : "border-white"
                                        } border rounded-lg text-base px-2 transition-colors flex items-center justify-center`}
                                    >
                                        Tutor
                                    </p>
                                    {tutorIsUser ? (
                                        <p className="text-2xl font-bold flex justify-center items-center">
                                            You
                                        </p>
                                    ) : (
                                        <>
                                            <p className="text-2xl font-bold flex justify-center items-center">
                                                {tutelage.tutor.username}
                                            </p>
                                            <p className="text-lg flex items-end">
                                                {tutelage.tutor["student-id"]}
                                            </p>
                                        </>
                                    )}
                                    <p className="text-2xl font-bold flex justify-center items-center">
                                        &harr;
                                    </p>
                                    <p
                                        className={`${
                                            learnerIsUser
                                                ? "border-sky-500"
                                                : "border-white"
                                        } border rounded-lg text-base px-2 transition-colors flex items-center justify-center`}
                                    >
                                        Learner
                                    </p>
                                    {learnerIsUser ? (
                                        <p className="text-2xl font-bold flex justify-center items-center">
                                            You
                                        </p>
                                    ) : (
                                        <>
                                            <p className="text-2xl font-bold flex justify-center items-center">
                                                {tutelage.learner.username}
                                            </p>
                                            <p className="text-lg flex items-end">
                                                {tutelage.learner["student-id"]}
                                            </p>
                                        </>
                                    )}
                                </div>
                                <div className="flex flex-row w-full gap-2 flex-wrap">
                                    {tutelage["timeslots"].map(
                                        (timeslot, idx) => (
                                            <p
                                                key={idx}
                                                className={`border-white border rounded-lg text-base px-2`}
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
                                        ),
                                    )}
                                </div>
                                <div className="flex flex-row w-full gap-2">
                                    {subjects.map((subject) => (
                                        <motion.p
                                            layout
                                            key={subject[0]}
                                            className={`border-white border rounded-lg text-base px-2 transition-colors`}
                                        >
                                            {subject[1]}
                                        </motion.p>
                                    ))}
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>
        </>
    )
}

export default RequestsList
