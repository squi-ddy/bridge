import { InputSubmitFunction } from "@/types/FormDefinition"
import { ILearnerSubject, ISubject } from "@backend/types/subject"
import { AnimatePresence, motion } from "framer-motion"
import { useCallback, useRef } from "react"
import FormCheckboxInput from "./forms/FormCheckboxInput"

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
        transition: {
            when: "beforeChildren",
            staggerChildren: 0.05,
            duration: 0.1,
        },
    },
    exit: {
        opacity: 0,
        transition: { when: "afterChildren", staggerChildren: 0.01 },
    },
}

export type IInputSubject = Omit<ILearnerSubject, "learner-sid"> & {
    include: boolean
}

function RequestSubjectSelection(props: {
    subjects: IInputSubject[]
    setGetFilters: (func: () => IInputSubject[]) => void
    clickedSubject: ISubject | undefined
    setClickedSubject: (subject: ISubject | undefined) => void
}) {
    const submitFunctions = useRef<InputSubmitFunction<boolean>[]>([])

    const setFilterSubmitFunction = useCallback(
        (i: number) => (func: InputSubmitFunction<boolean>) => {
            submitFunctions.current[i] = func
        },
        [],
    )

    props.setGetFilters(
        useCallback(
            () =>
                props.subjects.filter((_, idx) =>
                    submitFunctions.current[idx](),
                ),
            [props.subjects],
        ),
    )

    return (
        <>
            <div className="flex flex-row w-full">
                <motion.h1 variants={itemVariants} className="text-3xl">
                    Subjects
                </motion.h1>
                <div className="grow" />
            </div>
            <motion.div
                className="border-2 rounded-xl border-white w-full h-full overflow-y-scroll"
                variants={mainVariants}
            >
                <AnimatePresence mode="popLayout">
                    {props.subjects.map((subject, idx) => (
                        <motion.div
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            key={subject["subject-code"]}
                            className={`flex flex-col w-full gap-2 items-center py-2 px-4 border-b-2 border-white ${
                                subject["subject-code"] ===
                                props.clickedSubject?.["subject-code"]
                                    ? "bg-sky-800"
                                    : "hover:bg-sky-900/50"
                            } transition-colors`}
                            layout
                            onClick={() => props.setClickedSubject(subject)}
                        >
                            <div className="flex flex-row w-full">
                                <p className="text-2xl font-bold flex justify-center items-center">
                                    {subject.name}
                                </p>
                                <div className="grow" />
                                <FormCheckboxInput
                                    h={"h-10"}
                                    width="w-fit"
                                    fieldName="include"
                                    fieldPlaceholder="Include?"
                                    textSize="text-md"
                                    fieldValue={subject.include}
                                    setSubmitFunction={setFilterSubmitFunction(
                                        idx,
                                    )}
                                />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </>
    )
}

export default RequestSubjectSelection
