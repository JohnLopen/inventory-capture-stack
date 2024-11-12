import moment from 'moment-timezone'


// Return current date & time
export const now = (format?: string) =>
    moment().tz('America/Los_Angeles').format(format || 'Y-MM-DD HH:mm:s')

// Reformat
export const formatDate = (dt: string, format?: string) =>
    moment(dt).format(format || 'Y-MM-DD HH:mm:s')

// Return the date 7 days ago
export const sevenDaysAgo = (format?: string) =>
    moment().tz('America/Los_Angeles').subtract(7, 'days').format(format || 'Y-MM-DD HH:mm:s')
