import { create } from 'zustand';
import { UserPublic, getCurrentUser, loginUser, logoutUser } from '../services/authService.ts';

interface AuthState {
    user: UserPublic | null;
    isAuthenticated: boolean;
    isInitialized: boolean;
    
    initializeUser: () => void;
    login: (email: string, password: string) => boolean;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isInitialized: false,

    initializeUser: () => {
        const user = getCurrentUser();
        set({ user, isAuthenticated: !!user, isInitialized: true }); 
    },

    login: (email, password) => {
        const result = loginUser(email, password);
        
        if (result.success && result.user) {
            set({ user: result.user, isAuthenticated: true });
            return true;
        }
        set({ user: null, isAuthenticated: false });
        return false;
    },

    logout: () => {
        logoutUser();
        set({ user: null, isAuthenticated: false });
    },
}));