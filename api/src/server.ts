// src/server.ts
import mainApp from './app';

import { configDotenv } from 'dotenv';
configDotenv()

const PORT = process.env.PORT || 3000;

mainApp.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
});
