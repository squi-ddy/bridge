import { LayoutGroup, motion } from "framer-motion"
import SetTitle from "@/components/SetTitle"
import { learners } from "@/data"
import { useState } from "react"
import Fuse from "fuse.js"

const fuse = new Fuse(learners, {
    keys: ["name", "subjects", "year"],
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

function LearnersPage() {
    const [visibleLearners, setVisibleLearners] = useState(learners)

    return (
        <>
            <SetTitle title="Learners" />
            <LayoutGroup>
                <motion.h1
                    key="join"
                    variants={itemVariants}
                    className="text-5xl"
                    layout
                >
                    Learners
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
                            setVisibleLearners(res.map((r) => r.item))
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
                                    <th className="w-[35%]">Name</th>
                                    <th className="w-[55%]">Subjects</th>
                                    <th className="w-[10%]">Year</th>
                                </motion.tr>
                            </thead>
                            <tbody>
                                {visibleLearners.map((learner) => {
                                    return (
                                        <motion.tr
                                            variants={itemVariants}
                                            key={learner.name}
                                            layout
                                        >
                                            <td>{learner.name}</td>
                                            <td>
                                                {learner.subjects.join(", ")}
                                            </td>
                                            <td>{learner.year}</td>
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

export default LearnersPage
