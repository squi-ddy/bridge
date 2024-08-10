import { getCurrentProfile, patchCurrentUser } from "@/api"
import { UserContext } from "@/base/BasePage"
import MotionButton from "@/components/MotionButton"
import SetTitle from "@/components/SetTitle"
import FormCheckboxInput from "@/components/forms/FormCheckboxInput"
import FormNumberInput from "@/components/forms/FormNumberInput"
import FormPasswordInput from "@/components/forms/FormPasswordInput"
import FormTextInput from "@/components/forms/FormTextInput"
import {
    InputErrorFunction,
    InputFunctionContainer,
    InputFunctionItems,
} from "@/types/FormDefinition"
import { preciseFloor } from "@/util"
import { IUserFull, IUserPatch } from "@backend/types/user"
import { LayoutGroup, motion } from "framer-motion"
import {
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react"
import { useNavigate } from "react-router-dom"
import { IValidation } from "typia"

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

const fieldNames = [
    "username",
    "email",
    "password",
    "confirmPassword",
    "class",
    "tutor",
    "learner",
] as const

const defaultInputContainer = {
    password: {
        submitFunc: () => "",
        errorFunc: () => "",
        value: "",
    } as InputFunctionItems<string>,
    username: {
        submitFunc: () => "",
        errorFunc: () => "",
        value: "",
    } as InputFunctionItems<string>,
    email: {
        submitFunc: () => "",
        errorFunc: () => "",
        value: "",
    } as InputFunctionItems<string>,
    confirmPassword: {
        submitFunc: () => "",
        errorFunc: () => "",
        value: "",
    } as InputFunctionItems<string>,
    class: {
        submitFunc: () => 101,
        errorFunc: () => "",
        value: 101,
    } as InputFunctionItems<number>,
    tutor: {
        submitFunc: () => false,
        errorFunc: () => "",
        value: false,
    } as InputFunctionItems<boolean>,
    learner: {
        submitFunc: () => false,
        errorFunc: () => "",
        value: false,
    } as InputFunctionItems<boolean>,
} satisfies InputFunctionContainer<typeof fieldNames>

function ProfilePageRow(props: { title: string; children: ReactNode }) {
    return (
        <motion.tr variants={itemVariants} layout>
            <th className="w-1/3 py-2">{props.title}</th>
            <td className="w-2/3 py-2">
                <div className="flex justify-center">{props.children}</div>
            </td>
        </motion.tr>
    )
}

const currYear = new Date().getFullYear() % 100

function ProfilePage() {
    const navigate = useNavigate()
    const { user, updateUser } = useContext(UserContext)
    const [profileData, setProfileData] = useState<IUserFull | undefined>(
        undefined,
    )

    const [edit, setEdit] = useState(false)

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

    useEffect(() => {
        if (!user) {
            navigate("/auth")
        } else
            getCurrentProfile().then((data) => {
                if (data) {
                    setProfileData(data)
                }
            })
    }, [user, navigate])

    const submit: () => Promise<boolean> = useCallback(async () => {
        if (!profileData) return false
        let anyNulls = false
        for (const field of fieldNames) {
            const value = inputContainer.current[field].submitFunc()
            if (value === null) {
                anyNulls = true
                continue
            }
            inputContainer.current[field].value = value
        }
        if (anyNulls) return false
        const username = inputContainer.current.username.value
        const email = inputContainer.current.email.value
        const password = inputContainer.current.password.value
        const confirmPassword = inputContainer.current.confirmPassword.value
        const studentClass3Digit = inputContainer.current.class.value
        const isTutor = inputContainer.current.tutor.value
        const isLearner = inputContainer.current.learner.value
        if (password !== confirmPassword) {
            inputContainer.current.confirmPassword.errorFunc(
                "Passwords do not match",
            )
            return false
        }
        const year = preciseFloor(studentClass3Digit, 100)
        const studentClass = currYear * 1000 + studentClass3Digit
        const data: IUserPatch = {
            username:
                username === profileData["username"] ? undefined : username,
            email: email === profileData.email ? undefined : email,
            password: password === "" ? undefined : password,
            year: year === profileData.year ? undefined : year,
            class:
                studentClass === profileData.class ? undefined : studentClass,
            "is-tutor":
                isTutor === profileData["is-tutor"] ? undefined : isTutor,
            "is-learner":
                isLearner === profileData["is-learner"] ? undefined : isLearner,
        }

        if (Object.values(data).every((v) => v === undefined)) {
            // no changes, short circuit
            return true
        }

        const res = await patchCurrentUser(data)
        if (!res.success) {
            const message = res.response!.data!.message
            if (message === "Validation error") {
                const errors: string[] = (
                    res.response!.data!.errors as IValidation.IError[]
                ).map((e) => e.path)
                for (const field of fieldNames) {
                    for (const errorField of errors) {
                        if (errorField.includes(field)) {
                            inputContainer.current[field].errorFunc(
                                "Unknown error",
                            )
                        }
                    }
                }
            } else {
                alert(`Unknown error ${message}`)
            }
            return false
        }

        // update profileData
        await updateUser()
        const newProfileData = await getCurrentProfile()
        if (newProfileData) {
            setProfileData(newProfileData)
        }
        return true
    }, [profileData, updateUser])

    if (!profileData) {
        return <></>
    }

    return (
        <>
            <SetTitle title="Profile" />
            <LayoutGroup>
                <motion.div
                    variants={itemVariants}
                    layout
                    className="mb-1 flex flex-row w-2/3"
                >
                    <motion.h1 variants={itemVariants} className="text-5xl">
                        Your Profile
                    </motion.h1>
                    <div className="grow" />
                    <MotionButton
                        text={edit ? "Save" : "Edit"}
                        textSize="text-2xl"
                        layout
                        onClick={async () => {
                            if (edit) {
                                if (!(await submit())) return
                            }
                            setEdit(!edit)
                        }}
                    />
                </motion.div>
                <div className="h-4/5 w-full flex flex-col items-center">
                    <motion.div
                        className="table-container w-2/3"
                        variants={mainVariants}
                        layout
                    >
                        <table
                            className="vert-table text-2xl"
                            cellSpacing={0}
                            cellPadding={0}
                        >
                            <tbody>
                                <ProfilePageRow title="Student ID">
                                    <div className="h-14 flex items-center">
                                        {profileData["student-id"]}
                                    </div>
                                </ProfilePageRow>
                                <ProfilePageRow title="Username">
                                    <FormTextInput
                                        fieldName={"username"}
                                        fieldPlaceholder={""}
                                        width="w-1/2"
                                        edit={edit}
                                        fieldValue={profileData.username}
                                        z="z-[7]"
                                        setErrorFunction={setErrorFunction(
                                            "username",
                                        )}
                                        setSubmitFunction={setSubmitFunction(
                                            "username",
                                        )}
                                        checker={(value: string) => {
                                            if (!value)
                                                return {
                                                    success: false,
                                                    message:
                                                        "Username is required",
                                                }
                                            if (value.length > 255) {
                                                return {
                                                    success: false,
                                                    message:
                                                        "Username is too long",
                                                }
                                            }
                                            if (
                                                !/^[a-zA-Z0-9_]+$/.test(value)
                                            ) {
                                                return {
                                                    success: false,
                                                    message:
                                                        "Username can only contain letters, numbers, and underscores",
                                                }
                                            }
                                            return { success: true }
                                        }}
                                    />
                                </ProfilePageRow>
                                <ProfilePageRow title="Email">
                                    <FormTextInput
                                        fieldName={"email"}
                                        type={"email"}
                                        fieldPlaceholder={""}
                                        width="w-1/2"
                                        edit={edit}
                                        fieldValue={profileData.email}
                                        z="z-[6]"
                                        setErrorFunction={setErrorFunction(
                                            "email",
                                        )}
                                        setSubmitFunction={setSubmitFunction(
                                            "email",
                                        )}
                                        checker={(value: string) => {
                                            if (!value)
                                                return {
                                                    success: false,
                                                    message:
                                                        "Email is required",
                                                }
                                            if (value.length > 255) {
                                                return {
                                                    success: false,
                                                    message:
                                                        "Email is too long",
                                                }
                                            }
                                            return { success: true }
                                        }}
                                    />
                                </ProfilePageRow>
                                {edit && (
                                    <>
                                        <ProfilePageRow title="Password">
                                            <FormPasswordInput
                                                width="w-1/2"
                                                fieldName="password"
                                                fieldPlaceholder="Password"
                                                z="z-[5]"
                                                setErrorFunction={setErrorFunction(
                                                    "password",
                                                )}
                                                setSubmitFunction={setSubmitFunction(
                                                    "password",
                                                )}
                                                checker={(value: string) => {
                                                    if (!value)
                                                        // ok, don't change password
                                                        return {
                                                            success: true,
                                                        }
                                                    if (value.length < 8) {
                                                        return {
                                                            success: false,
                                                            message:
                                                                "Password is too short",
                                                        }
                                                    }
                                                    if (value.length > 255) {
                                                        return {
                                                            success: false,
                                                            message:
                                                                "Password is too long",
                                                        }
                                                    }
                                                    return { success: true }
                                                }}
                                            />
                                        </ProfilePageRow>
                                        <ProfilePageRow title="Confirm Password">
                                            <FormPasswordInput
                                                width="w-1/2"
                                                fieldName="confirmPassword"
                                                z="z-[4]"
                                                fieldPlaceholder="Confirm Password"
                                                setErrorFunction={setErrorFunction(
                                                    "confirmPassword",
                                                )}
                                                setSubmitFunction={setSubmitFunction(
                                                    "confirmPassword",
                                                )}
                                            />
                                        </ProfilePageRow>
                                    </>
                                )}
                                <ProfilePageRow title="Class">
                                    <FormNumberInput
                                        fieldName={"class"}
                                        fieldPlaceholder={`M${
                                            edit
                                                ? currYear.toString()
                                                : preciseFloor(
                                                      profileData.class,
                                                      1000,
                                                  )
                                        }`}
                                        edit={edit}
                                        numberWidth="w-20"
                                        fieldValue={profileData.class % 1000}
                                        min={101}
                                        max={699}
                                        z="z-[3]"
                                        setErrorFunction={setErrorFunction(
                                            "class",
                                        )}
                                        setSubmitFunction={setSubmitFunction(
                                            "class",
                                        )}
                                        checker={(value: number) => {
                                            if (value < 101 || value > 699)
                                                return {
                                                    success: false,
                                                    message: "Invalid class",
                                                }
                                            if (!Number.isInteger(value))
                                                return {
                                                    success: false,
                                                    message:
                                                        "Class must be an integer",
                                                }
                                            return { success: true }
                                        }}
                                    />
                                </ProfilePageRow>

                                <ProfilePageRow title="Year">
                                    <div className="h-14 flex items-center">
                                        {profileData.year}
                                    </div>
                                </ProfilePageRow>
                                <ProfilePageRow title="UUID">
                                    <div className="h-14 flex items-center">
                                        {profileData.uuid}
                                    </div>
                                </ProfilePageRow>
                                <ProfilePageRow title="Is Tutor?">
                                    <FormCheckboxInput
                                        fieldName={"isTutor"}
                                        fieldPlaceholder={""}
                                        width="w-1/2"
                                        z="z-[2]"
                                        edit={!profileData["is-tutor"] && edit}
                                        fieldValue={profileData["is-tutor"]}
                                        setSubmitFunction={setSubmitFunction(
                                            "tutor",
                                        )}
                                        setErrorFunction={setErrorFunction(
                                            "tutor",
                                        )}
                                    />
                                </ProfilePageRow>
                                {edit && profileData["is-tutor"] && (
                                    <ProfilePageRow title="Edit Tutor Details">
                                        <MotionButton
                                            text="Save and Edit..."
                                            onClick={async () => {
                                                if (!(await submit())) return
                                                navigate("/options/tutor")
                                            }}
                                        />
                                    </ProfilePageRow>
                                )}
                                <ProfilePageRow title="Is Learner?">
                                    <FormCheckboxInput
                                        fieldName={"isLearner"}
                                        fieldPlaceholder={""}
                                        width="w-1/2"
                                        z="z-[1]"
                                        edit={
                                            !profileData["is-learner"] && edit
                                        }
                                        fieldValue={profileData["is-learner"]}
                                        setSubmitFunction={setSubmitFunction(
                                            "learner",
                                        )}
                                        setErrorFunction={setErrorFunction(
                                            "learner",
                                        )}
                                    />
                                </ProfilePageRow>
                                {edit && profileData["is-learner"] && (
                                    <ProfilePageRow title="Edit Learner Details">
                                        <MotionButton
                                            text="Save and Edit..."
                                            onClick={async () => {
                                                if (!(await submit())) return
                                                navigate("/options/learner")
                                            }}
                                        />
                                    </ProfilePageRow>
                                )}
                            </tbody>
                        </table>
                    </motion.div>
                </div>
            </LayoutGroup>
        </>
    )
}

export default ProfilePage
