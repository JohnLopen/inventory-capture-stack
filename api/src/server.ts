// src/server.ts
import mainApp from './app';

import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3000;

mainApp.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
