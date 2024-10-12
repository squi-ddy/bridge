const settings = {
    SOCKET_URL: import.meta.env.VITE_SOCKET_URL || "http://localhost:3001",
    SOCKET_SERVER_PATH:
        (import.meta.env.VITE_SOCKET_SERVER_PATH || "/") + "socket.io/",
    BASE_URL: import.meta.env.BASE_URL.endsWith("/")
        ? import.meta.env.BASE_URL
        : import.meta.env.BASE_URL + "/",
}

export { settings }
