import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthorizedUserTrips, deleteTrip, Trip, ServiceResult } from '../services/tripsService.ts';
import { logoutUser } from '../services/authService.ts';

export interface TripListHook {
    trips: Trip[];
    isLoading: boolean;
    error: string | null;
    handleDelete: (id: number) => void;
    handleShow: (trip: Trip) => void;
    handleLogout: () => void;
    loadTrips: () => void;
    
    isCreateModalOpen: boolean;
    handleOpenCreateModal: () => void;
    handleCloseCreateModal: () => void;
}

function useTripList(): TripListHook {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    const navigate = useNavigate();

    const loadTrips = useCallback(() => {
        setIsLoading(true);
        setError(null);
        
        const result: ServiceResult<Trip[]> = getAuthorizedUserTrips();

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

    const handleDelete = useCallback((id: number) => {
        if (window.confirm('Ви впевнені, що хочете видалити цю подорож?')) {
            const result: ServiceResult = deleteTrip(id);
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

    const handleLogout = useCallback(() => {
        logoutUser();
        navigate('/login', { replace: true });
    }, [navigate]);

    const handleOpenCreateModal = useCallback(() => setIsCreateModalOpen(true), []);
    const handleCloseCreateModal = useCallback(() => setIsCreateModalOpen(false), []);

    return {
        trips,
        isLoading,
        error,
        handleDelete,
        handleShow,
        handleLogout,
        loadTrips,

        isCreateModalOpen,
        handleOpenCreateModal,
        handleCloseCreateModal,
    };
}

export default useTripList;