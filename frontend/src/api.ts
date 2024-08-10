import {
    ILearnerSubject,
    ILearnerSubjectCreate,
    ILearnerSubjectGet,
    ISubject,
    ITutorSubject,
    ITutorSubjectCreate,
    ITutorSubjectGet,
} from "@backend/types/subject"
import {
    IUserCreate,
    IUserFull,
    IUserMinimal,
    IUserPatch,
} from "@backend/types/user"
import axios from "axios"
import {
    isEmptyTimeslotArray,
    isFindTimeslotsResultArray,
    isFullUser,
    isLearnerSubjectArray,
    isMinimalUser,
    isNotificationArray,
    isPendingTutelageArray,
    isSubjectArray,
    isTutorSubjectArray,
} from "./checkers"
import { settings } from "./settings"
import {
    IEmptyTimeslot,
    IEmptyTimeslotCreate,
    IEmptyTimeslotGet,
    IFindTimeslots,
    IFindTimeslotsResult,
} from "@backend/types/timeslot"
import { INotification, INotificationDelete } from "@backend/types/notification"
import {
    IPendingTutelage,
    IPendingTutelageCreate,
} from "@backend/types/tutelage"

axios.defaults.withCredentials = true

let currentUser: IUserMinimal | null | undefined = undefined

export async function login(studentId: string, password: string) {
    try {
        const resp = {
            success: true,
            response: await axios.post(`${settings.API_URL}/acct/login`, {
                studentId,
                password,
            }),
        }
        currentUser = undefined // force refresh
        return resp
    } catch (error) {
        if (!axios.isAxiosError(error)) {
            throw error
        }
        return { success: false, response: error.response }
    }
}

export async function register(data: IUserCreate) {
    try {
        const resp = {
            success: true,
            response: await axios.post(`${settings.API_URL}/acct/signup`, data),
        }
        currentUser = undefined // force refresh
        return resp
    } catch (error) {
        if (!axios.isAxiosError(error)) {
            throw error
        }
        return { success: false, response: error.response }
    }
}

export async function logout() {
    try {
        const resp = {
            success: true,
            response: await axios.post(`${settings.API_URL}/acct/logout`),
        }
        currentUser = null
        return resp
    } catch (error) {
        if (!axios.isAxiosError(error)) {
            throw error
        }
        return { success: false, response: error.response }
    }
}

export async function getCurrentSession(): Promise<IUserMinimal | null> {
    if (currentUser !== undefined) {
        return currentUser
    }
    try {
        const response = await axios.get(`${settings.API_URL}/acct/session`)
        const data = response.data
        if (!isMinimalUser(data)) {
            throw new Error("Invalid user data")
        }
        currentUser = data
        return currentUser
    } catch (error) {
        if (!axios.isAxiosError(error)) {
            throw error
        }
        currentUser = null
        return null
    }
}

export async function getCurrentProfile(): Promise<IUserFull | null> {
    try {
        const response = await axios.get(`${settings.API_URL}/acct/me`)
        const data = response.data
        if (!isFullUser(data)) {
            throw new Error("Invalid user data")
        }
        return data
    } catch (error) {
        if (!axios.isAxiosError(error)) {
            throw error
        }
        return null
    }
}

export async function getSubjects(): Promise<ISubject[] | null> {
    try {
        const response = await axios.get(`${settings.API_URL}/subjects/all`)
        const data = response.data
        if (!isSubjectArray(data)) {
            throw new Error("Invalid subject data")
        }
        return data
    } catch (error) {
        if (!axios.isAxiosError(error)) {
            throw error
        }
        return null
    }
}

export async function sendTutorSubjects(data: ITutorSubjectCreate[]) {
    try {
        const resp = {
            success: true,
            response: await axios.post(
                `${settings.API_URL}/subjects/submitTutor`,
                data,
            ),
        }
        return resp
    } catch (error) {
        if (!axios.isAxiosError(error)) {
            throw error
        }
        return { success: false, response: error.response }
    }
}

export async function sendLearnerSubjects(data: ILearnerSubjectCreate[]) {
    try {
        const resp = {
            success: true,
            response: await axios.post(
                `${settings.API_URL}/subjects/submitLearner`,
                data,
            ),
        }
        return resp
    } catch (error) {
        if (!axios.isAxiosError(error)) {
            throw error
        }
        return { success: false, response: error.response }
    }
}

export async function sendEmptyTimeslots(data: IEmptyTimeslotCreate[]) {
    try {
        const resp = {
            success: true,
            response: await axios.post(
                `${settings.API_URL}/timeslots/setEmpty`,
                data,
            ),
        }
        return resp
    } catch (error) {
        if (!axios.isAxiosError(error)) {
            throw error
        }
        return { success: false, response: error.response }
    }
}

export async function getEmptyTimeslots(
    data: IEmptyTimeslotGet,
): Promise<IEmptyTimeslot[] | null> {
    try {
        const resp = await axios.get(`${settings.API_URL}/timeslots/getEmpty`, {
            params: data,
        })
        const respData = resp.data
        if (!isEmptyTimeslotArray(respData)) {
            throw new Error("Invalid timeslot data")
        }
        return respData
    } catch (error) {
        if (!axios.isAxiosError(error)) {
            throw error
        }
        return null
    }
}

export async function getTutorSubjects(
    data: ITutorSubjectGet,
): Promise<ITutorSubject[] | null> {
    try {
        const resp = await axios.get(`${settings.API_URL}/subjects/getTutor`, {
            params: data,
        })
        const respData = resp.data
        if (!isTutorSubjectArray(respData)) {
            throw new Error("Invalid tutor subject data")
        }
        return respData
    } catch (error) {
        if (!axios.isAxiosError(error)) {
            throw error
        }
        return null
    }
}

export async function getLearnerSubjects(
    data: ILearnerSubjectGet,
): Promise<ILearnerSubject[] | null> {
    try {
        const resp = await axios.get(
            `${settings.API_URL}/subjects/getLearner`,
            {
                params: data,
            },
        )
        const respData = resp.data
        if (!isLearnerSubjectArray(respData)) {
            throw new Error("Invalid learner interest data")
        }
        return respData
    } catch (error) {
        if (!axios.isAxiosError(error)) {
            throw error
        }
        return null
    }
}

export async function patchCurrentUser(data: IUserPatch) {
    try {
        const resp = {
            success: true,
            response: await axios.patch(`${settings.API_URL}/acct/me`, data),
        }
        currentUser = undefined // force refresh
        return resp
    } catch (error) {
        if (!axios.isAxiosError(error)) {
            throw error
        }
        return { success: false, response: error.response }
    }
}

export async function findTimeslots(
    data: IFindTimeslots,
): Promise<IFindTimeslotsResult[] | null> {
    try {
        const resp = await axios.post(
            `${settings.API_URL}/timeslots/findTutors`,
            data,
        )
        const respData = resp.data
        if (!isFindTimeslotsResultArray(respData)) {
            throw new Error("Invalid result data")
        }
        return respData
    } catch (error) {
        if (!axios.isAxiosError(error)) {
            throw error
        }
        return null
    }
}

export async function createPendingTutelage(data: IPendingTutelageCreate) {
    try {
        const resp = {
            success: true,
            response: await axios.post(
                `${settings.API_URL}/tutelages/create`,
                data,
            ),
        }
        return resp
    } catch (error) {
        if (!axios.isAxiosError(error)) {
            throw error
        }
        return { success: false, response: error.response }
    }
}

export async function getPendingTutelages(): Promise<
    IPendingTutelage[] | null
> {
    try {
        const resp = await axios.get(`${settings.API_URL}/tutelages/pending`)
        const respData = resp.data
        if (!isPendingTutelageArray(respData)) {
            throw new Error("Invalid pending tutelage data")
        }
        return respData
    } catch (error) {
        if (!axios.isAxiosError(error)) {
            throw error
        }
        return null
    }
}

export async function getNotifications(): Promise<INotification[] | null> {
    try {
        const resp = await axios.get(`${settings.API_URL}/notifications/all`)
        const respData = resp.data
        if (!isNotificationArray(respData)) {
            throw new Error("Invalid notification data")
        }
        return respData
    } catch (error) {
        if (!axios.isAxiosError(error)) {
            throw error
        }
        return null
    }
}

export async function deleteNotification(data: INotificationDelete) {
    try {
        const resp = {
            success: true,
            response: await axios.delete(
                `${settings.API_URL}/notifications/delete`,
                { data },
            ),
        }
        return resp
    } catch (error) {
        if (!axios.isAxiosError(error)) {
            throw error
        }
        return { success: false, response: error.response }
    }
}
