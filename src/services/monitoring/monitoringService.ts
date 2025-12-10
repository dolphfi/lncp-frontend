import axios from 'axios';
import { getApiUrl } from '../../config/api';
import authService from '../authService';

const http = axios.create({
    baseURL: getApiUrl(''),
    withCredentials: true,
});

http.interceptors.request.use((config) => {
    const token = authService.getAccessToken();
    if (token) {
        config.headers = config.headers || {};
        (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
});

http.interceptors.response.use(
    (res) => res,
    (err) => {
        const apiMsg = err?.response?.data?.message || err?.message || 'Erreur réseau';
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.error('[monitoringService] Error:', apiMsg, err?.response?.data);
        }
        return Promise.reject(new Error(apiMsg));
    },
);

export const monitoringService = {
    async getOverview() {
        const url = getApiUrl('/monitoring/overview');
        const res = await http.get(url);
        return res.data;
    },

    async getMetrics() {
        const url = getApiUrl('/monitoring/metrics');
        const res = await http.get(url);
        return res.data;
    },

    async getAlerts() {
        const url = getApiUrl('/monitoring/alerts');
        const res = await http.get(url);
        return res.data;
    },

    async getServices() {
        const url = getApiUrl('/monitoring/services');
        const res = await http.get(url);
        return res.data;
    },

    async getEvents() {
        const url = getApiUrl('/monitoring/events');
        const res = await http.get(url);
        return res.data;
    },

    async getLogs(level?: string) {
        const url = getApiUrl('/monitoring/logs');
        const res = await http.get(url, {
            params: level ? { level } : undefined,
        });
        return res.data;
    },

    async getBackups() {
        const url = getApiUrl('/monitoring/backups');
        const res = await http.get(url);
        return res.data;
    },

    async getSecurity() {
        const url = getApiUrl('/monitoring/security');
        const res = await http.get(url);
        return res.data;
    },
};

export default monitoringService;
