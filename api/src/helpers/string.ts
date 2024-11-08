// Random sleep between 3 - 10 seconds
export const randomSleep = (min: number = 1, max: number = 6) => {
    const randomSeconds = Math.random() * (max - min) + min;
    console.log(`Sleeping for ${randomSeconds} seconds`)
    return new Promise<void>(resolve => setTimeout(resolve, randomSeconds * 1000));
}

// To pause or sleep
export const sleep = (sec: number) => new Promise<void>(resolve => setTimeout(() => resolve(), sec * 1000))

export const slugify = (str: string): string => {
    return str
        .toLowerCase() // Convert to lowercase
        .trim() // Remove leading and trailing spaces
        .replace(/\s+/g, '') // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, '') // Remove non-alphanumeric characters except hyphens
        .replace(/-+/g, ''); // Replace multiple hyphens with a single hyphen
}