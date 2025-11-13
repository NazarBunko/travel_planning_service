const USER_DB_KEY = 'meeting_app_users_db';
const TOKEN_KEY = 'auth_token';

interface User {
    id: number;
    name: string;
    email: string;
    password?: string; 
    role: 'User' | 'Admin';
}

export interface UserPublic {
    id: number;
    name: string;
    email: string;
    role: 'User' | 'Admin';
}

export interface AuthResult {
    success: boolean;
    message?: string;
    user?: UserPublic;
}

export const loadUsers = (): User[] => {
    return JSON.parse(localStorage.getItem(USER_DB_KEY) || '[]');
};

export const saveUsers = (users: User[]): void => {
    localStorage.setItem(USER_DB_KEY, JSON.stringify(users));
};

export const findUserByEmail = (email: string): User | undefined => {
    const users = loadUsers();
    return users.find(u => u.email === email);
};

const generateNextUserId = (users: User[]): number => {
    if (users.length === 0) {
        return 1;
    }
    const maxId = users.reduce((max, user) => (user.id > max ? user.id : max), 0);
    return maxId + 1;
};

export const getCurrentUserToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

export const getCurrentUser = (): UserPublic | null => {
    const token = getCurrentUserToken();
    if (!token) return null;
    const parts = token.split('-');
    const email = parts[1];
    const user = findUserByEmail(email); 
    
    if (user) {
        return { id: user.id, name: user.name, email: user.email, role: user.role };
    }
    
    return null; 
};

export const registerUser = ({ name, email, password }: { name: string, email: string, password: string }): AuthResult => {
    const users = loadUsers();
    if (findUserByEmail(email)) {
        return { success: false, message: 'Користувач з таким email вже існує.' };
    }

    const newUser: User = { 
        id: generateNextUserId(users),
        name, 
        email, 
        password, 
        role: 'User'
    };

    saveUsers([...users, newUser]);
    
    return { success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } };
};

export const loginUser = (email: string, password: string): AuthResult => {
    const user = findUserByEmail(email);

    if (user && user.password === password) {
        const fakeToken = `token-${user.email}-${Date.now()}`;
        localStorage.setItem(TOKEN_KEY, fakeToken);
        return { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
    }
    
    return { success: false, message: 'Неправильний email або пароль.' };
};

export const logoutUser = (): void => {
    localStorage.removeItem(TOKEN_KEY);
};

(function initUsers(): void {
    const users = loadUsers();
    if (users.length === 0) {
        const adminUser: User = {
            id: 1,
            name: 'Admin',
            email: 'admin@app.com',
            password: 'admin',
            role: 'Admin'
        };
        saveUsers([adminUser]);
        console.log("Admin ініціалізовано: admin@app.com / admin");
    }
})();