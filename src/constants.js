export const apiServer = 'http://127.0.0.1:5000';

export const apiEndpoints = {
    login: apiServer + '/customer/login',
    register: apiServer + '/customer/register',
    trainSchedule: apiServer + '/train/fetch/schedule',
    trainStops: apiServer + '/train/fetch/stops',
    reserveTicket: apiServer + '/train/reserve',
    fetchReservations: apiServer + '/train/fetch/reservations',
    cancelReservation: apiServer + '/train/reserve/cancel',
    employeeLogin: apiServer + '/employee/login',
    fetchReps: apiServer + '/employee/fetch/reps',
    createRepresentative: apiServer + '/employee/create/rep',
    updateRepresentative: apiServer + '/employee/update/rep',
    deleteRepresentative: apiServer + '/employee/delete/rep',
    salesReport: apiServer + '/sales/report',
    searchReservations: apiServer + '/employee/search/reservations',
    calculateRevenue: apiServer + '/employee/revenue',
    getMetadata: apiServer + '/employee/metadata',
};