import { configDotenv } from "dotenv";
import { User } from "../app/user/User";
import { generateToken } from "../app/auth/helper";

configDotenv();

(async () => {
    const user = await new User().guard(['password']).find(1)
    const token = generateToken(user)
    console.log('New user token', token)
})()