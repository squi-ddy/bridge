import { io, Socket } from 'socket.io-client'
import { settings } from './settings'
import { ClientToServerEvents, ServerToClientEvents } from '@backend/types/Events'

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(settings.SOCKET_URL)