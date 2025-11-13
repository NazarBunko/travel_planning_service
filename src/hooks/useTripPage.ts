import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getTripById, Trip, Place } from '../services/tripsService.ts';
import { findUserById, UserPublic, getCurrentUser } from '../services/authService.ts';
import useTripPlaceCard, { TripPlaceCardHook } from './useTripPlaceCard.ts';

export interface TripPageHook extends TripPlaceCardHook {
    trip: Trip | null;
    currentUser: UserPublic | null;
    isLoading: boolean;
    isOwnerOrCollaborator: boolean;
    placesByDay: Map<number, Place[]>;
    dayNumbers: number[];
    formatUserList: (ids: number[]) => string;
    
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
    
    loadTripData: () => void;
}

const formatUserList = (ids: number[]): string => {
    if (!ids || ids.length === 0) return 'немає';
    return ids.map(id => findUserById(id)?.name || 'Невідомий користувач').join(', ');
};

const groupPlacesByDay = (places: Place[]): Map<number, Place[]> => {
    const sortedPlaces = places.sort((a, b) => a.dayNumber - b.dayNumber);
    
    return sortedPlaces.reduce((acc, place) => {
        if (!acc.has(place.dayNumber)) {
            acc.set(place.dayNumber, []);
        }
        acc.get(place.dayNumber)!.push(place);
        return acc;
    }, new Map<number, Place[]>());
};

function useTripPage(): TripPageHook {
    const { tripId } = useParams<{ tripId: string }>();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [placeToEdit, setPlaceToEdit] = useState<Place | null>(null);
    const [isTripModalOpen, setIsTripModalOpen] = useState(false);
    const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
    const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
    const currentUser: UserPublic | null = getCurrentUser();

    const loadTripData = useCallback(() => {
        if (!tripId) return;
        setIsLoading(true);
        const foundTrip = getTripById(Number(tripId)); 
        setTrip(foundTrip || null);
        setIsLoading(false);
    }, [tripId]);

    const { handleDelete: handleDeletePlace, handleEdit: handleUpdatePlace } = useTripPlaceCard(
        trip?.id || 0, 
        loadTripData
    );

    useEffect(() => {
        loadTripData();
    }, [tripId, loadTripData]);

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

    const isOwnerOrCollaborator: boolean = (
        currentUser && trip 
            ? currentUser.id === trip.ownerId || trip.collaboratorIds.includes(currentUser.id)
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
        
        loadTripData,
    };
}

export default useTripPage;