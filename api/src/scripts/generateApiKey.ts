import { configDotenv } from "dotenv";
import { User } from "../app/user/User";
import { generateApiKey } from "../app/auth/helper";

configDotenv();

(async () => {
    // const userId = 1
    const api_key = generateApiKey()
    console.log({ api_key })
    // await new User().update({ api_key }, userId)
    // console.log('New api key issued for user with id ', userId)
})()