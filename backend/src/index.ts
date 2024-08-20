import { settings } from "settings"
import { server } from "setup"

const port = settings.PORT
const domain = settings.DOMAIN

server.listen(port, (): void => {
    return console.log(`Express is listening at http://${domain}:${port}`)
})
