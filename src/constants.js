export const apiServer = 'http://127.0.0.1:5000';

export const apiEndpoints = {
    login: apiServer + '/customer/login',
    register: apiServer + '/customer/register',
    trainSchedule: apiServer + '/train/fetch/schedule',
    trainStops: apiServer + '/train/fetch/stops',
};