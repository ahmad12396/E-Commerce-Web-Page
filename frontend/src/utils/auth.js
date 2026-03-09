const DJANGO_BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000";

const USER_ACCESS = "user_access_token";
const USER_REFRESH = "user_refresh_token";
const ADMIN_ACCESS = "admin_access_token";
const ADMIN_REFRESH = "admin_refresh_token";

export const tokenUtils = {
    setTokens: (access, refresh, isAdmin = false) => {
        localStorage.setItem(isAdmin ? ADMIN_ACCESS : USER_ACCESS, access);
        localStorage.setItem(isAdmin ? ADMIN_REFRESH : USER_REFRESH, refresh);
    },

    getAccessToken: (isAdmin = false) => localStorage.getItem(isAdmin ? ADMIN_ACCESS : USER_ACCESS),
    
    getRefreshToken: (isAdmin = false) => localStorage.getItem(isAdmin ? ADMIN_REFRESH : USER_REFRESH),

    removeTokens: (isAdmin = false) => {
        localStorage.removeItem(isAdmin ? ADMIN_ACCESS : USER_ACCESS);
        localStorage.removeItem(isAdmin ? ADMIN_REFRESH : USER_REFRESH);
    },

    isAuthenticated: (isAdmin = false) => {
        const token = localStorage.getItem(isAdmin ? ADMIN_ACCESS : USER_ACCESS);
        if (!token) return false;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            if (isAdmin && !payload.is_staff) return false; 
            
            return Date.now() < payload.exp * 1000;
        } catch (e) {
            return false;
        }
    }
};



export const authFetch = async (url, options = {}) => {
    const isAdminRequest = url.includes('/api/admin/');
    let token = tokenUtils.getAccessToken(isAdminRequest);
    const headers = options.headers ? { ...options.headers } : {};
   
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    let response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        const refresh = tokenUtils.getRefreshToken(isAdminRequest);
        
        if (refresh) {
            const refreshRes = await fetch(`${DJANGO_BASE_URL}/api/token/refresh/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh }),
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                tokenUtils.setTokens(data.access, refresh, isAdminRequest);
                headers["Authorization"] = `Bearer ${data.access}`;
                return fetch(url, { ...options, headers });
            } else {
                tokenUtils.removeTokens(isAdminRequest);
                window.location.href = isAdminRequest ? "/admin/login" : "/login";
            }
        }
    }

    return response;
};