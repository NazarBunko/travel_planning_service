import { useCallback } from 'react';
import { deletePlaceFromTrip, updatePlaceInTrip, Place } from '../services/tripsService.ts';

export interface TripPlaceCardHook {
    handleDelete: (placeId: number) => void;
    handleEdit: (placeId: number, data: Partial<Omit<Place, 'id'>>) => void;
}

function useTripPlaceCard(tripId: number, onTripUpdate: () => void): TripPlaceCardHook {

    const handleDelete = useCallback((placeId: number) => {
        if (window.confirm('Ви впевнені, що хочете видалити це місце з подорожі?')) {
            const result = deletePlaceFromTrip(tripId, placeId);
            if (result.success) {
                onTripUpdate();
            } else {
                alert(result.message);
            }
        }
    }, [tripId, onTripUpdate]);

    const handleEdit = useCallback((placeId: number, data: Partial<Omit<Place, 'id'>>) => {
        const result = updatePlaceInTrip(tripId, placeId, data);
        if (result.success) {
            onTripUpdate();
        } else {
            alert(result.message);
        }
    }, [tripId, onTripUpdate]);

    return {
        handleDelete,
        handleEdit,
    };
}

export default useTripPlaceCard;