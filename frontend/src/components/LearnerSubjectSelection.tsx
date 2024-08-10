import {
    InputErrorFunction,
    InputFunctionContainer,
    InputFunctionItems,
    InputSubmitFunction,
} from "@/types/FormDefinition"
import { ILearnerSubject, ISubject } from "@backend/types/subject"
import {
    FloatingFocusManager,
    FloatingOverlay,
    useFloating,
} from "@floating-ui/react"
import { AnimatePresence, motion } from "framer-motion"
import { ReactElement, useCallback, useEffect, useRef, useState } from "react"
import MotionButton from "./MotionButton"
import FormSelectionInput from "./forms/FormSelectionInput"
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

const fieldNames = ["subject"] as const

const defaultInputContainer = {
    subject: {
        submitFunc: () => -1,
        errorFunc: () => "",
        value: -1,
    } as InputFunctionItems<number>,
} satisfies InputFunctionContainer<typeof fieldNames>

export type IInputSubject = Omit<ILearnerSubject, "learner-sid"> & {
    includeInSearch: boolean
}

function LearnerSubjectSelection(props: {
    subjects: IInputSubject[]
    setSubjects: (subjects: IInputSubject[]) => void
    allSubjects: ISubject[]
    reference: HTMLElement
    setDialog: (dialog: ReactElement | null) => void
    setGetFilters: (func: () => IInputSubject[]) => void
    setHighlightSubject: (subject: string) => void
}) {
    const [addSubjectOpen, setAddSubjectOpen] = useState(false)
    const submitFunctions = useRef<
        Record<number, InputSubmitFunction<boolean>>
    >([])

    const setFilterSubmitFunction = useCallback((i: number) => {
        return (func: InputSubmitFunction<boolean>) => {
            submitFunctions.current[i] = func
        }
    }, [])

    const { refs, context } = useFloating({
        open: addSubjectOpen,
        onOpenChange: setAddSubjectOpen,
        elements: { reference: props.reference },
    })

    const inputContainer = useRef(defaultInputContainer)

    const setSubmitFunction = useCallback(
        (key: keyof typeof defaultInputContainer) => {
            return (
                func: (typeof defaultInputContainer)[typeof key]["submitFunc"],
            ) => {
                inputContainer.current[key]["submitFunc"] = func
            }
        },
        [],
    )

    const setErrorFunction = useCallback(
        (key: keyof typeof defaultInputContainer) => {
            return (func: InputErrorFunction) => {
                inputContainer.current[key]["errorFunc"] = func
            }
        },
        [],
    )

    const { allSubjects, subjects, setSubjects, setDialog } = props

    useEffect(() => {
        setDialog(
            addSubjectOpen ? (
                <FloatingOverlay lockScroll className="bg-black/80">
                    <FloatingFocusManager context={context}>
                        <motion.div
                            variants={mainVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            ref={refs.setFloating}
                            className="relative w-full h-full"
                        >
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-white bg-black border-2 rounded-xl p-4 flex flex-col gap-2 items-center w-1/4">
                                <motion.h1
                                    className="text-2xl"
                                    variants={itemVariants}
                                >
                                    Add Subject
                                </motion.h1>
                                <FormSelectionInput
                                    fieldName="subject"
                                    options={allSubjects.map((s) => s.name)}
                                    fieldPlaceholder="Subject"
                                    variants={itemVariants}
                                    textSize="text-xl"
                                    innerTextSize="text-xl"
                                    h="h-12"
                                    z="z-[3]"
                                    checker={(value) => {
                                        if (value === -1) {
                                            return {
                                                success: false,
                                                message:
                                                    "Please select a subject",
                                            }
                                        }
                                        if (
                                            subjects
                                                .map((s) => s["subject-code"])
                                                .includes(
                                                    allSubjects[value][
                                                        "subject-code"
                                                    ],
                                                )
                                        ) {
                                            return {
                                                success: false,
                                                message:
                                                    "Already added this subject",
                                            }
                                        }
                                        return { success: true }
                                    }}
                                    setSubmitFunction={setSubmitFunction(
                                        "subject",
                                    )}
                                    setErrorFunction={setErrorFunction(
                                        "subject",
                                    )}
                                    errorTextSize="text-sm"
                                />
                                <div className="flex flex-row gap-2 justify-center">
                                    <MotionButton
                                        text="Submit"
                                        variants={itemVariants}
                                        onClick={() => {
                                            let anyNulls = false
                                            for (const field of fieldNames) {
                                                const value =
                                                    inputContainer.current[
                                                        field
                                                    ].submitFunc()
                                                if (value === null) {
                                                    anyNulls = true
                                                    continue
                                                }
                                                inputContainer.current[
                                                    field
                                                ].value = value
                                            }
                                            if (anyNulls) return
                                            setSubjects([
                                                ...subjects,
                                                {
                                                    ...allSubjects[
                                                        inputContainer.current
                                                            .subject.value
                                                    ],
                                                    includeInSearch: true,
                                                },
                                            ])
                                            setAddSubjectOpen(false)
                                        }}
                                    />
                                    <MotionButton
                                        text="Close"
                                        variants={itemVariants}
                                        onClick={() => setAddSubjectOpen(false)}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </FloatingFocusManager>
                </FloatingOverlay>
            ) : null,
        )
    }, [
        addSubjectOpen,
        context,
        allSubjects,
        setSubjects,
        setDialog,
        subjects,
        refs.setFloating,
        setErrorFunction,
        setSubmitFunction,
    ])

    props.setGetFilters(
        useCallback(
            () => subjects.filter((_, idx) => submitFunctions.current[idx]()),
            [subjects],
        ),
    )

    return (
        <>
            <div className="flex flex-row w-full">
                <motion.h1 variants={itemVariants} className="text-3xl">
                    Subjects
                </motion.h1>
                <div className="grow" />
                <MotionButton
                    text="Add"
                    variants={itemVariants}
                    onClick={() => setAddSubjectOpen(true)}
                />
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
                            className={`flex flex-col w-full gap-2 items-center py-2 px-4 border-b-2 border-white hover:bg-sky-900/50 transition-colors`}
                            onMouseEnter={() =>
                                props.setHighlightSubject(
                                    subject["subject-code"],
                                )
                            }
                            onMouseLeave={() => props.setHighlightSubject("")}
                            layout
                        >
                            <div className="flex flex-row w-full">
                                <p className="text-2xl font-bold flex justify-center items-center">
                                    {subject.name}
                                </p>
                                <div className="grow" />
                                <MotionButton
                                    text="Delete"
                                    onClick={() =>
                                        props.setSubjects(
                                            props.subjects.filter(
                                                (s) =>
                                                    s["subject-code"] !==
                                                    subject["subject-code"],
                                            ),
                                        )
                                    }
                                />
                            </div>
                            <FormCheckboxInput
                                h={"h-10"}
                                fieldName="include"
                                fieldPlaceholder="Include in search?"
                                textSize="text-md"
                                fieldValue={subject.includeInSearch}
                                setSubmitFunction={setFilterSubmitFunction(idx)}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </>
    )
}

export default LearnerSubjectSelection
