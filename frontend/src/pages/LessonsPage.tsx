import { LayoutGroup, motion } from "framer-motion"
import SetTitle from "@/components/SetTitle"
import { lessons } from "@/data"
import { useState } from "react"
import Fuse from "fuse.js"

const lessonsStringDate: {
    tutor: string
    learner: string
    subject: string
    date: string
}[] = lessons.map((lesson) => ({
    ...lesson,
    date: lesson.date.toLocaleString(),
}))

const fuse = new Fuse(lessonsStringDate, {
    keys: ["tutor", "learner", "subject", "date"],
    threshold: 0.1,
})

const itemVariants = {
    hidden: { transform: "translateY(-20px)", opacity: 0 },
    visible: { transform: "translateY(0)", opacity: 1 },
    exit: { opacity: 0 },
}

const mainVariants = {
    hidden: { opacity: 0, transform: "translateY(-20px)" },
    visible: {
        opacity: 1,
        transform: "translateY(0)",
        transition: { when: "beforeChildren", staggerChildren: 0.1 },
    },
    exit: {
        opacity: 0,
        transition: { when: "afterChildren", staggerChildren: 0.01 },
    },
}

function LessonsPage() {
    const [visibleLessons, setVisibleLessons] = useState(lessonsStringDate)

    return (
        <>
            <SetTitle title="Lessons" />
            <LayoutGroup>
                <motion.h1
                    key="join"
                    variants={itemVariants}
                    className="text-5xl"
                    layout
                >
                    Lessons
                </motion.h1>
                <motion.input
                    variants={itemVariants}
                    type="text"
                    placeholder="Search..."
                    className="border-2 rounded-xl bg-transparent text-2xl w-5/6 p-2 text-center min-w-0 focus:border-sky-400 focus:outline-none"
                    onInput={async (e) => {
                        const target = e.target
                        if (
                            "value" in target &&
                            typeof target.value === "string" &&
                            target.value.length > 0
                        ) {
                            const value = target.value
                            const res = await fuse.search(value)
                            res.sort((a, b) => a.refIndex - b.refIndex)
                            setVisibleLessons(res.map((r) => r.item))
                        }
                    }}
                />
                <div className="h-4/5 w-full flex flex-col items-center">
                    <motion.div
                        className="table-container"
                        variants={mainVariants}
                        layout
                    >
                        <table
                            className="data-table"
                            cellSpacing={0}
                            cellPadding={0}
                        >
                            <thead>
                                <motion.tr variants={itemVariants} layout>
                                    <th className="w-[25%]">Tutor</th>
                                    <th className="w-[25%]">Learner</th>
                                    <th className="w-[25%]">Subject</th>
                                    <th className="w-[25%]">Date</th>
                                </motion.tr>
                            </thead>
                            <tbody>
                                {visibleLessons.map((lesson) => {
                                    return (
                                        <motion.tr
                                            variants={itemVariants}
                                            key={
                                                lesson.tutor +
                                                lesson.learner +
                                                lesson.subject +
                                                lesson.date
                                            }
                                            layout
                                        >
                                            <td>{lesson.tutor}</td>
                                            <td>{lesson.learner}</td>
                                            <td>{lesson.subject}</td>
                                            <td>
                                                {lesson.date.toLocaleString()}
                                            </td>
                                        </motion.tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </motion.div>
                </div>
            </LayoutGroup>
        </>
    )
}

export default LessonsPage
