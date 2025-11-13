import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config.ts';
import { useAuthStore } from '../hooks/useAuthStore.ts';

export interface UserPublic {
    uid: string; 
    email: string;
    name: string;
    role?: 'User' | 'Admin';
}

export interface ServiceResult<T = unknown> {
    success: boolean;
    message?: string;
    user?: UserPublic;
    data?: T;
}

const addUserDocument = async (user: {uid: string, email: string}, name: string): Promise<UserPublic> => {
    const userDocRef = doc(db, 'users', user.uid);
    const userPublic: UserPublic = {
        uid: user.uid,
        email: user.email!,
        name: name,
        role: 'User',
    };
    await setDoc(userDocRef, userPublic, { merge: true });
    return userPublic;
};

export const getUserPublicData = async (uid: string): Promise<UserPublic | null> => {
    const userDocRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
        return docSnap.data() as UserPublic;
    }
    return null;
};

export const getCurrentUser = (): UserPublic | null => {
    const user = useAuthStore.getState().user;
    return user;
};

export const findUserByEmail = async (email: string): Promise<ServiceResult> => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userPublicData = userDoc.data() as UserPublic;
            
            return { success: true, user: userPublicData };
        }
        
        return { success: false, message: 'Користувача не знайдено.' };
    } catch (error: any) {
        return { success: false, message: 'Помилка пошуку користувача.' };
    }
};

export const getUsersPublicDataByIds = async (uids: string[]): Promise<UserPublic[]> => {
    if (uids.length === 0) return [];
    
    const uniqueUids = Array.from(new Set(uids)).slice(0, 10);
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('uid', 'in', uniqueUids));
    
    const querySnapshot = await getDocs(q);
    
    const users: UserPublic[] = querySnapshot.docs.map(doc => doc.data() as UserPublic);
    
    return users;
};

export const findUserById = (uid: string): UserPublic | undefined => {
    console.warn("ATTENTION: findUserById є синхронним, але має бути асинхронним для Firestore!");
    return undefined;
};

export const registerUser = async (email: string, password: string, name: string): Promise<ServiceResult> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const authUser = { uid: userCredential.user.uid, email: userCredential.user.email! };
        const userPublicData = await addUserDocument(authUser, name);
        
        return { success: true, user: userPublicData };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

export const loginUser = async (email: string, password: string): Promise<ServiceResult> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userPublicData = await getUserPublicData(userCredential.user.uid);
        
        return { success: true, user: userPublicData || undefined };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

export const logoutUser = async (): Promise<void> => {
    await signOut(auth);
};

export const resetPassword = (email: string, newPassword: string): ServiceResult => {
    console.error("ATTENTION: resetPassword має бути асинхронною функцією Firestore!");
    return { success: false, message: 'Функція не реалізована для Firestore.' };
};