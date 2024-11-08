"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugify = exports.sleep = exports.randomSleep = void 0;
// Random sleep between 3 - 10 seconds
const randomSleep = (min = 1, max = 6) => {
    const randomSeconds = Math.random() * (max - min) + min;
    console.log(`Sleeping for ${randomSeconds} seconds`);
    return new Promise(resolve => setTimeout(resolve, randomSeconds * 1000));
};
exports.randomSleep = randomSleep;
// To pause or sleep
const sleep = (sec) => new Promise(resolve => setTimeout(() => resolve(), sec * 1000));
exports.sleep = sleep;
const slugify = (str) => {
    return str
        .toLowerCase() // Convert to lowercase
        .trim() // Remove leading and trailing spaces
        .replace(/\s+/g, '') // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, '') // Remove non-alphanumeric characters except hyphens
        .replace(/-+/g, ''); // Replace multiple hyphens with a single hyphen
};
exports.slugify = slugify;
