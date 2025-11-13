import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config.ts';
import { loginUser, logoutUser, getUserPublicData, UserPublic } from '../services/authService.ts';

interface AuthState {
    user: UserPublic | null;
    isAuthenticated: boolean;
    isInitialized: boolean;
    
    initializeUser: () => void;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isInitialized: false,

    initializeUser: () => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userPublic = await getUserPublicData(user.uid);
                if (userPublic) {
                    set({ user: userPublic, isAuthenticated: true, isInitialized: true });
                    return;
                }
            } 
            set({ user: null, isAuthenticated: false, isInitialized: true });
        });
    },

    login: async (email, password) => {
        const result = await loginUser(email, password);
        
        if (result.success) {
            // onAuthStateChanged оновить стан
            return true;
        }
        return false;
    },

    logout: async () => {
        await logoutUser();
        // onAuthStateChanged оновить стан
    },
}));