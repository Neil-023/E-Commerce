const RAW_API_URL = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000').replace(/\/+$/, '');

export const API_BASE_URL = RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL}/api`;
const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

export const buildApiUrl = (path = '') => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

export const buildAssetUrl = (path = '') => {
    if (!path) {
        return API_ORIGIN;
    }

    return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
};
