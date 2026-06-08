import { create } from "zustand";

const getStoredAuth = () => {
    try {
        const stored = localStorage.getItem('auth');
        return stored ? JSON.parse(stored) : { user: null, token: null };
    } catch {
        return { user: null, token: null };
    }
};

const initial = getStoredAuth();

export const useAuthStore = create((set) => ({
    user: initial.user,
    token: initial.token,
    isAuthenticated: !!initial.token,

    setAuth: (user, token) => {
        localStorage.setItem('auth', JSON.stringify({ user, token }));
        set({ user, token, isAuthenticated: true });
    },

    clearAuth: () => {
        localStorage.removeItem('auth');
        set({ user: null, token: null, isAuthenticated: false });
    },

    getAuthHeaders: () => {
        const state = useAuthStore.getState();
        return state.token ? { Authorization: `Bearer ${state.token}` } : {};
    },
}));
