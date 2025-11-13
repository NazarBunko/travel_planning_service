import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthorizedUserTrips, deleteTrip, Trip, ServiceResult } from '../services/tripsService.ts';

export interface TripListHook {
    trips: Trip[];
    isLoading: boolean;
    error: string | null;
    handleDelete: (id: string) => void;
    handleShow: (trip: Trip) => void;
    loadTrips: () => Promise<void>;
    
    isCreateModalOpen: boolean;
    handleOpenCreateModal: () => void;
    handleCloseCreateModal: () => void;
    
    isEditModalOpen: boolean;
    tripToEdit: Trip | null;
    handleOpenEditModal: (trip: Trip) => void;
    handleCloseEditModal: () => void;
}

function useTripList(): TripListHook {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [tripToEdit, setTripToEdit] = useState<Trip | null>(null);
    
    const navigate = useNavigate();

    const loadTrips = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        const result: ServiceResult<Trip[]> = await getAuthorizedUserTrips();

        if (result.success && result.data) {
            setTrips(result.data);
        } else if (result.message) {
            setError(result.message);
            setTrips([]);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadTrips();
    }, [loadTrips]);

    const handleDelete = useCallback(async (id: string) => {
        if (window.confirm('Ви впевнені, що хочете видалити цю подорож?')) {
            const result: ServiceResult = await deleteTrip(id);
            if (result.success) {
                setTrips(prev => prev.filter(t => t.id !== id));
            } else {
                alert(result.message);
            }
        }
    }, []);

    const handleShow = useCallback((trip: Trip) => {
        navigate('/trips/' + trip.id);
    }, [navigate]);

    const handleOpenEditModal = useCallback((trip: Trip) => {
        setTripToEdit(trip);
        setIsEditModalOpen(true);
    }, []);

    const handleCloseEditModal = useCallback(() => {
        setTripToEdit(null);
        setIsEditModalOpen(false);
    }, []);
    
    const handleOpenCreateModal = useCallback(() => setIsCreateModalOpen(true), []);
    const handleCloseCreateModal = useCallback(() => setIsCreateModalOpen(false), []);

    return {
        trips,
        isLoading,
        error,
        handleDelete,
        handleShow,
        loadTrips,

        isCreateModalOpen,
        handleOpenCreateModal,
        handleCloseCreateModal,
        
        isEditModalOpen,
        tripToEdit,
        handleOpenEditModal,
        handleCloseEditModal,
    };
}

export default useTripList;