import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { getCurrentUser, UserPublic } from './authService.ts';
import { db } from './../firebase/config.ts';

export interface Place {
    id: string;
    locationName: string;
    notes?: string;
    dayNumber: number;
}

export interface Trip {
    id: string;
    ownerId: string;
    collaboratorIds: string[];
    memberIds: string[];
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    places: Place[];
}

export interface TripData {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    collaboratorIds: string[];
    memberIds: string[];
}

export interface ServiceResult<T = undefined> {
    success: boolean;
    message?: string;
    data?: T;
}

const tripsCollection = collection(db, 'trips');

export const getTripById = async (tripId: string): Promise<Trip | undefined> => {
    const docRef = doc(db, 'trips', tripId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Trip;
    }
    return undefined;
};

export const getAuthorizedUserTrips = async (): Promise<ServiceResult<Trip[]>> => {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'Користувач не авторизований.' };

    const userId = currentUser.uid;
    
    const tripsQuery = query(tripsCollection, where('ownerId', '==', userId)); 
    const snapshot = await getDocs(tripsQuery);
    
    const trips: Trip[] = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
    })) as Trip[];
    
    const authorizedTrips = trips.filter(t => 
        t.ownerId === userId || 
        t.collaboratorIds.includes(userId) ||
        t.memberIds.includes(userId)
    );

    return { success: true, data: authorizedTrips };
};

export const createTrip = async (data: TripData): Promise<ServiceResult<Trip>> => {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'Користувач не авторизований.' };

    const newTripData = {
        ownerId: currentUser.uid,
        collaboratorIds: data.collaboratorIds || [],
        memberIds: data.memberIds || [],
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        places: [],
    };
    
    const newDocRef = doc(tripsCollection);
    await setDoc(newDocRef, newTripData);

    const newTrip = { id: newDocRef.id, ...newTripData } as Trip;
    return { success: true, data: newTrip };
};

export const updateTrip = async (tripId: string, data: Partial<TripData>): Promise<ServiceResult<Trip>> => {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'Користувач не авторизований.' };

    const docRef = doc(db, 'trips', tripId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return { success: false, message: 'Подорож не знайдена.' };

    const trip = { id: docSnap.id, ...docSnap.data() } as Trip;
    const isAuthorized = trip.ownerId === currentUser.uid;

    if (!isAuthorized) return { success: false, message: 'Недостатньо прав для редагування.' };

    await updateDoc(docRef, data as any);
    
    const updatedTrip = { ...trip, ...data };

    return { success: true, data: updatedTrip };
};

export const deleteTrip = async (tripId: string): Promise<ServiceResult> => {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'Користувач не авторизований.' };

    const trip = await getTripById(tripId);
    if (!trip) return { success: false, message: 'Подорож не знайдена.' };

    const isAuthorized = trip.ownerId === currentUser.uid;

    if (!isAuthorized) return { success: false, message: 'Недостатньо прав для видалення.' };

    const docRef = doc(db, 'trips', tripId);
    await deleteDoc(docRef);

    return { success: true };
};

export const addUserToTripList = async (tripId: string, userId: string, listType: 'collaborator' | 'member'): Promise<ServiceResult<Trip>> => {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'Користувач не авторизований.' };

    const trip = await getTripById(tripId);
    if (!trip) return { success: false, message: 'Подорож не знайдена.' };
    
    if (trip.ownerId !== currentUser.uid && currentUser.role !== 'Admin') {
         return { success: false, message: 'Недостатньо прав для керування учасниками.' };
    }

    if (userId === trip.ownerId) {
         return { success: false, message: 'Організатор подорожі вже має найвищі права і не може бути доданий в інший список.' };
    }

    let newCollaborators = trip.collaboratorIds;
    let newMembers = trip.memberIds;

    if (listType === 'collaborator') {
        if (newCollaborators.includes(userId)) {
             return { success: false, message: 'Користувач вже є співавтором.' };
        }
        newCollaborators = [...newCollaborators, userId];
        newMembers = newMembers.filter(id => id !== userId);

    } else if (listType === 'member') {
        if (newMembers.includes(userId)) {
             return { success: false, message: 'Користувач вже є туристом.' };
        }
        newMembers = [...newMembers, userId];
        newCollaborators = newCollaborators.filter(id => id !== userId);
    }
    
    const dataToUpdate = { collaboratorIds: newCollaborators, memberIds: newMembers };
    const docRef = doc(db, 'trips', tripId);
    await updateDoc(docRef, dataToUpdate as any);

    const updatedTrip: Trip = { ...trip, ...dataToUpdate };

    return { success: true, data: updatedTrip };
};

export const removeUserFromTrip = async (tripId: string, userId: string): Promise<ServiceResult<Trip>> => {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'Користувач не авторизований.' };

    const trip = await getTripById(tripId);
    if (!trip) return { success: false, message: 'Подорож не знайдена.' };
    
    if (trip.ownerId !== currentUser.uid && currentUser.role !== 'Admin') {
         return { success: false, message: 'Недостатньо прав для керування учасниками.' };
    }

    const newCollaborators = trip.collaboratorIds.filter(id => id !== userId);
    const newMembers = trip.memberIds.filter(id => id !== userId);

    if (newCollaborators.length === trip.collaboratorIds.length && newMembers.length === trip.memberIds.length) {
        return { success: false, message: 'Користувач не знайдений у списках учасників/співавторів цієї подорожі.' };
    }
    
    const updatedTrip: Trip = { 
        ...trip, 
        collaboratorIds: newCollaborators,
        memberIds: newMembers 
    };
    
    const docRef = doc(db, 'trips', tripId);
    await updateDoc(docRef, { collaboratorIds: newCollaborators, memberIds: newMembers } as any);

    return { success: true, data: updatedTrip };
};

const checkPlaceAccess = (trip: Trip, currentUser: UserPublic): boolean => {
    return trip.ownerId === currentUser.uid || trip.collaboratorIds.includes(currentUser.uid);
};

export const getTripPlaces = async (tripId: string): Promise<ServiceResult<Place[]>> => {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'Користувач не авторизований.' };

    const trip = await getTripById(tripId);
    if (!trip) return { success: false, message: 'Подорож не знайдена.' };

    const hasViewAccess = checkPlaceAccess(trip, currentUser) || trip.memberIds.includes(currentUser.uid);

    if (!hasViewAccess) {
         return { success: false, message: 'Недостатньо прав для перегляду місць.' };
    }

    const sortedPlaces = trip.places.sort((a, b) => a.dayNumber - b.dayNumber);
    return { success: true, data: sortedPlaces };
};

export const addPlaceToTrip = async (tripId: string, data: Omit<Place, 'id' | 'locationName'> & { locationName: string }): Promise<ServiceResult<Place>> => {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'Користувач не авторизований.' };

    const trip = await getTripById(tripId);
    if (!trip) return { success: false, message: 'Подорож не знайдена.' };
    if (!checkPlaceAccess(trip, currentUser)) return { success: false, message: 'Недостатньо прав для додавання місць.' };

    const newPlace: Place = {
        ...data,
        id: doc(collection(db, 'trips', tripId, 'places')).id, 
    };

    const newPlaces = [...trip.places, newPlace];
    
    const docRef = doc(db, 'trips', tripId);
    await updateDoc(docRef, { places: newPlaces } as any);

    return { success: true, data: newPlace };
};

export const updatePlaceInTrip = async (tripId: string, placeId: string, data: Partial<Omit<Place, 'id'>>): Promise<ServiceResult<Place>> => {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'Користувач не авторизований.' };

    const trip = await getTripById(tripId);
    if (!trip) return { success: false, message: 'Подорож не знайдена.' };
    if (!checkPlaceAccess(trip, currentUser)) return { success: false, message: 'Недостатньо прав для редагування місць.' };

    const placeIndex = trip.places.findIndex(p => p.id === placeId);
    if (placeIndex === -1) return { success: false, message: 'Місце не знайдено.' };

    const updatedPlace = { ...trip.places[placeIndex], ...data };
    
    const newPlaces = [...trip.places];
    newPlaces[placeIndex] = updatedPlace;

    const docRef = doc(db, 'trips', tripId);
    await updateDoc(docRef, { places: newPlaces } as any);

    return { success: true, data: updatedPlace };
};

export const deletePlaceFromTrip = async (tripId: string, placeId: string): Promise<ServiceResult> => {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'Користувач не авторизований.' };

    const trip = await getTripById(tripId);
    if (!trip) return { success: false, message: 'Подорож не знайдена.' };
    if (!checkPlaceAccess(trip, currentUser)) return { success: false, message: 'Недостатньо прав для видалення місць.' };

    const initialLength = trip.places.length;
    
    const newPlaces = trip.places.filter(p => p.id !== placeId);
    
    if (newPlaces.length === initialLength) return { success: false, message: 'Місце не знайдено.' };
    
    const docRef = doc(db, 'trips', tripId);
    await updateDoc(docRef, { places: newPlaces } as any);

    return { success: true };
};