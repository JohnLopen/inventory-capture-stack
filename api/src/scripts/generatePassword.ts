import { configDotenv } from "dotenv";
import { checkPassword, hashPassword } from "../app/auth/helper";

configDotenv();

(async () => {
    const passwordPlain = '12345678'
    const password = await hashPassword(passwordPlain)
    console.log('New user password', password)

    // Compare
    const passed = await checkPassword(passwordPlain, password)
    console.log('passed', passed)
})()