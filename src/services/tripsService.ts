import { getCurrentUser, UserPublic } from './authService.ts';

const TRIP_DB_KEY = 'meeting_app_trips_db';

export interface Place {
    id: number;
    locationName: string;
    notes?: string;
    dayNumber: number;
}

export interface Trip {
    id: number;
    ownerId: number;
    collaboratorIds: number[];
    memberIds: number[];
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
    collaboratorIds: number[];
    memberIds: number[];
}

export interface ServiceResult<T = undefined> {
    success: boolean;
    message?: string;
    data?: T;
}

const loadTrips = (): Trip[] => {
    return JSON.parse(localStorage.getItem(TRIP_DB_KEY) || '[]');
};

const saveTrips = (trips: Trip[]): void => {
    localStorage.setItem(TRIP_DB_KEY, JSON.stringify(trips));
};

const generateNextTripId = (trips: Trip[]): number => {
    if (trips.length === 0) return 1;
    const maxId = trips.reduce((max, trip) => (trip.id > max ? trip.id : max), 0);
    return maxId + 1;
};

const generateNextPlaceId = (trip: Trip): number => {
    if (trip.places.length === 0) return 1;
    const maxId = trip.places.reduce((max, place) => (place.id > max ? place.id : max), 0);
    return maxId + 1;
};

export const getTripById = (tripId: number): Trip | undefined => {
    const trips = loadTrips();
    return trips.find(t => t.id === tripId);
};

export const getAuthorizedUserTrips = (): ServiceResult<Trip[]> => {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'Користувач не авторизований.' };

    const userId = currentUser.id;
    const trips = loadTrips();

    const authorizedTrips = trips.filter(t => 
        t.ownerId === userId || 
        t.collaboratorIds.includes(userId) ||
        t.memberIds.includes(userId)
    );
    
    return { success: true, data: authorizedTrips };
};

export const createTrip = (data: TripData): ServiceResult<Trip> => {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'Користувач не авторизований.' };

    const trips = loadTrips();
    const newTrip: Trip = {
        id: generateNextTripId(trips),
        ownerId: currentUser.id,
        collaboratorIds: data.collaboratorIds || [],
        memberIds: data.memberIds || [],
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        places: [],
    };

    saveTrips([...trips, newTrip]);
    return { success: true, data: newTrip };
};

export const updateTrip = (tripId: number, data: Partial<TripData>): ServiceResult<Trip> => {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'Користувач не авторизований.' };

    const trips = loadTrips();
    const tripIndex = trips.findIndex(t => t.id === tripId);
    
    if (tripIndex === -1) return { success: false, message: 'Подорож не знайдена.' };

    const trip = trips[tripIndex];
    const isAuthorized = trip.ownerId === currentUser.id;

    if (!isAuthorized) return { success: false, message: 'Недостатньо прав для редагування.' };

    const updatedTrip = { ...trip, ...data };
    
    const newTrips = [...trips];
    newTrips[tripIndex] = updatedTrip;
    
    saveTrips(newTrips);

    return { success: true, data: updatedTrip };
};

export const deleteTrip = (tripId: number): ServiceResult => {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'Користувач не авторизований.' };

    const trips = loadTrips();
    const tripIndex = trips.findIndex(t => t.id === tripId);
    
    if (tripIndex === -1) return { success: false, message: 'Подорож не знайдена.' };

    const trip = trips[tripIndex];
    const isAuthorized = trip.ownerId === currentUser.id;

    if (!isAuthorized) return { success: false, message: 'Недостатньо прав для видалення.' };

    trips.splice(tripIndex, 1);
    saveTrips(trips);

    return { success: true };
};

export const addUserToTripList = (tripId: number, userId: number, listType: 'collaborator' | 'member'): ServiceResult<Trip> => {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'Користувач не авторизований.' };

    const trips = loadTrips();
    const tripIndex = trips.findIndex(t => t.id === tripId);
    
    if (tripIndex === -1) return { success: false, message: 'Подорож не знайдена.' };
    
    const trip = trips[tripIndex];
    
    if (trip.ownerId !== currentUser.id && currentUser.role !== 'Admin') {
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
    
    const updatedTrip: Trip = { 
        ...trip, 
        collaboratorIds: newCollaborators,
        memberIds: newMembers 
    };
    
    const newTrips = [...trips];
    newTrips[tripIndex] = updatedTrip;
    
    saveTrips(newTrips);

    return { success: true, data: updatedTrip };
};

const checkPlaceAccess = (trip: Trip, currentUser: UserPublic): boolean => {
    return trip.ownerId === currentUser.id || trip.collaboratorIds.includes(currentUser.id);
};

export const getTripPlaces = (tripId: number): ServiceResult<Place[]> => {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'Користувач не авторизований.' };

    const trip = getTripById(tripId);
    if (!trip) return { success: false, message: 'Подорож не знайдена.' };

    const hasViewAccess = checkPlaceAccess(trip, currentUser) || trip.memberIds.includes(currentUser.id);

    if (!hasViewAccess) {
         return { success: false, message: 'Недостатньо прав для перегляду місць.' };
    }

    const sortedPlaces = trip.places.sort((a, b) => a.dayNumber - b.dayNumber);
    return { success: true, data: sortedPlaces };
};

export const addPlaceToTrip = (tripId: number, data: Omit<Place, 'id' | 'locationName'> & { locationName: string }): ServiceResult<Place> => {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'Користувач не авторизований.' };

    const trips = loadTrips();
    const tripIndex = trips.findIndex(t => t.id === tripId);
    
    if (tripIndex === -1) return { success: false, message: 'Подорож не знайдена.' };
    
    const trip = trips[tripIndex];
    if (!checkPlaceAccess(trip, currentUser)) return { success: false, message: 'Недостатньо прав для додавання місць.' };

    const newPlace: Place = {
        ...data,
        id: generateNextPlaceId(trip),
    };

    const newPlaces = [...trip.places, newPlace];
    const updatedTrip = { ...trip, places: newPlaces };
    
    const newTrips = [...trips];
    newTrips[tripIndex] = updatedTrip;

    saveTrips(newTrips);

    return { success: true, data: newPlace };
};

export const updatePlaceInTrip = (tripId: number, placeId: number, data: Partial<Omit<Place, 'id'>>): ServiceResult<Place> => {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'Користувач не авторизований.' };

    const trips = loadTrips();
    const tripIndex = trips.findIndex(t => t.id === tripId);
    
    if (tripIndex === -1) return { success: false, message: 'Подорож не знайдена.' };
    
    const trip = trips[tripIndex];
    if (!checkPlaceAccess(trip, currentUser)) return { success: false, message: 'Недостатньо прав для редагування місць.' };

    const placeIndex = trip.places.findIndex(p => p.id === placeId);
    if (placeIndex === -1) return { success: false, message: 'Місце не знайдено.' };

    const updatedPlace = { ...trip.places[placeIndex], ...data };
    
    const newPlaces = [...trip.places];
    newPlaces[placeIndex] = updatedPlace;

    const updatedTrip = { ...trip, places: newPlaces }; 
    
    const newTrips = [...trips];
    newTrips[tripIndex] = updatedTrip;
    
    saveTrips(newTrips);

    return { success: true, data: updatedPlace };
};

export const deletePlaceFromTrip = (tripId: number, placeId: number): ServiceResult => {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'Користувач не авторизований.' };

    const trips = loadTrips();
    const tripIndex = trips.findIndex(t => t.id === tripId);
    
    if (tripIndex === -1) return { success: false, message: 'Подорож не знайдена.' };
    
    const trip = trips[tripIndex];
    if (!checkPlaceAccess(trip, currentUser)) return { success: false, message: 'Недостатньо прав для видалення місць.' };

    const initialLength = trip.places.length;
    
    const newPlaces = trip.places.filter(p => p.id !== placeId);
    
    if (newPlaces.length === initialLength) return { success: false, message: 'Місце не знайдено.' };
    
    const updatedTrip = { ...trip, places: newPlaces };
    
    const newTrips = [...trips];
    newTrips[tripIndex] = updatedTrip;
    
    saveTrips(newTrips);

    return { success: true };
};


(function initTrips(): void {
    const trips = loadTrips();
    if (trips.length === 0) {
        const testTrips: Trip[] = [
            {
                id: 1,
                ownerId: 1,
                collaboratorIds: [],
                memberIds: [2],
                title: 'Подорож до Карпат',
                description: 'Чотири дні у горах та лісах, підкорення Говерли.',
                startDate: '2025-07-01',
                endDate: '2025-07-04',
                places: [
                    { id: 1, locationName: 'Яремче', notes: 'Заселення, водоспад Пробій.', dayNumber: 1 },
                    { id: 2, locationName: 'Говерла (підйом)', dayNumber: 3 },
                    { id: 3, locationName: 'Буковель', notes: 'Вечірній відпочинок та вечеря.', dayNumber: 2 },
                    { id: 4, locationName: 'Івано-Франківськ', notes: 'Повернення додому.', dayNumber: 4 },
                ],
            },
            {
                id: 2,
                ownerId: 2,
                collaboratorIds: [1],
                memberIds: [],
                title: 'Поїздка до Одеси',
                description: 'Вихідні на морі з друзями.',
                startDate: '2025-08-15',
                endDate: '2025-08-18',
                places: [
                    { id: 1, locationName: 'Пляж Аркадія', dayNumber: 2 },
                    { id: 2, locationName: 'Дерибасівська', notes: 'Кава та прогулянка.', dayNumber: 1 },
                ],
            },
            {
                id: 3,
                ownerId: 1,
                collaboratorIds: [],
                memberIds: [3],
                title: 'Відрядження до Києва',
                description: 'Ділові зустрічі.',
                startDate: '2025-09-10',
                endDate: '2025-09-11',
                places: [],
            },
        ];
        saveTrips(testTrips);
        console.log("Тестові подорожі ініціалізовано.");
    }
})();