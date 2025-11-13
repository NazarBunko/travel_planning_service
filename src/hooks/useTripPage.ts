import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTripById, Trip, Place, deleteTrip } from '../services/tripsService.ts';
import { getUsersPublicDataByIds, UserPublic } from '../services/authService.ts'; 
import useTripPlaceCard, { TripPlaceCardHook } from './useTripPlaceCard.ts';
import { useAuthStore } from './useAuthStore.ts';

export interface TripPageHook extends TripPlaceCardHook {
    trip: Trip | null;
    currentUser: UserPublic | null;
    isLoading: boolean;
    isOwnerOrCollaborator: boolean;
    placesByDay: Map<number, Place[]>;
    dayNumbers: number[];
    formatUserList: (ids: string[]) => string;
    
    placeToEdit: Place | null;
    setPlaceToEdit: React.Dispatch<React.SetStateAction<Place | null>>;
    handleEditPlaceView: (place: Place) => void;
    
    isTripModalOpen: boolean;
    handleOpenTripModal: () => void;
    handleCloseTripModal: () => void;
    
    isPlaceModalOpen: boolean;
    handleOpenPlaceModal: () => void;
    handleClosePlaceModal: () => void;

    isCollabModalOpen: boolean;
    handleOpenCollabModal: () => void;
    handleCloseCollabModal: () => void;

    handleDeleteTrip: () => void;
    
    loadTripData: () => Promise<void>;
}

function useTripPage(): TripPageHook {
    const { tripId } = useParams<{ tripId: string }>();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [placeToEdit, setPlaceToEdit] = useState<Place | null>(null);
    const [isTripModalOpen, setIsTripModalOpen] = useState(false);
    const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
    const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
    const [userMap, setUserMap] = useState<Map<string, string>>(new Map());
    const currentUser = useAuthStore((state) => state.user);
    const navigate = useNavigate();

    const loadTripData = useCallback(async () => {
        if (!tripId) return; 
        setIsLoading(true);

        const foundTrip = await getTripById(tripId); 
        setTrip(foundTrip || null);

        if (foundTrip) {
            const allUids = new Set([
                foundTrip.ownerId, 
                ...foundTrip.collaboratorIds, 
                ...foundTrip.memberIds
            ]);
            
            const users = await getUsersPublicDataByIds(Array.from(allUids));
            
            const map = new Map<string, string>();
            users.forEach(u => map.set(u.uid, u.name));
            setUserMap(map);
        }
        
        setIsLoading(false);
    }, [tripId]);

    const { handleDelete: handleDeletePlace, handleEdit: handleUpdatePlace } = useTripPlaceCard(
        trip?.id || '0', 
        loadTripData
    );

    useEffect(() => {
        loadTripData();
    }, [tripId, loadTripData]);

    const formatUserList = useCallback((ids: string[]): string => {
        if (!ids || ids.length === 0) return 'немає';
        
        return ids.map(id => userMap.get(id) || 'Невідомий користувач').join(', ');
    }, [userMap]);

    const groupPlacesByDay = useCallback((places: Place[]): Map<number, Place[]> => {
        const sortedPlaces = places.sort((a, b) => a.dayNumber - b.dayNumber);
        
        return sortedPlaces.reduce((acc, place) => {
            if (!acc.has(place.dayNumber)) {
                acc.set(place.dayNumber, []);
            }
            acc.get(place.dayNumber)!.push(place);
            return acc;
        }, new Map<number, Place[]>());
    }, []);

    const handleOpenTripModal = useCallback(() => setIsTripModalOpen(true), []);
    const handleCloseTripModal = useCallback(() => setIsTripModalOpen(false), []);
    
    const handleOpenCollabModal = useCallback(() => setIsCollabModalOpen(true), []);
    const handleCloseCollabModal = useCallback(() => setIsCollabModalOpen(false), []);

    const handleOpenPlaceModal = useCallback(() => {
        setPlaceToEdit(null);
        setIsPlaceModalOpen(true);
    }, []); 
    
    const handleClosePlaceModal = useCallback(() => {
        setPlaceToEdit(null);
        setIsPlaceModalOpen(false);
    }, []);

    const handleEditPlaceView = useCallback((place: Place) => {
        setPlaceToEdit(place);
        setIsPlaceModalOpen(true);
    }, []);

    const handleDeleteTrip = useCallback(() => {
        if (trip && window.confirm(`Ви впевнені, що хочете видалити подорож "${trip.title}"?`)) {
            deleteTrip(trip.id);
            navigate("/trips");
        }
    }, [trip]);

    const isOwnerOrCollaborator: boolean = (
        currentUser && trip 
            ? currentUser.uid === trip.ownerId || trip.collaboratorIds.includes(currentUser.uid)
            : false
    );
    
    const placesByDay = trip ? groupPlacesByDay(trip.places) : new Map<number, Place[]>();
    const dayNumbers = Array.from(placesByDay.keys());

    return {
        trip,
        currentUser,
        isLoading,
        isOwnerOrCollaborator,
        placesByDay,
        dayNumbers,
        formatUserList,
        handleDelete: handleDeletePlace,
        handleEdit: handleUpdatePlace,
        
        placeToEdit,
        setPlaceToEdit,
        handleEditPlaceView,
        
        isTripModalOpen,
        handleOpenTripModal,
        handleCloseTripModal,
        
        isPlaceModalOpen,
        handleOpenPlaceModal,
        handleClosePlaceModal,

        isCollabModalOpen,
        handleOpenCollabModal,
        handleCloseCollabModal,

        handleDeleteTrip,
        
        loadTripData,
    };
}

export default useTripPage;