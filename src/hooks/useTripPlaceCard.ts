import { useCallback } from 'react';
import { deletePlaceFromTrip, updatePlaceInTrip, Place } from '../services/tripsService.ts';

export interface TripPlaceCardHook {
    handleDelete: (placeId: string) => void;
    handleEdit: (placeId: string, data: Partial<Omit<Place, 'id'>>) => void;
}

function useTripPlaceCard(tripId: string, onTripUpdate: () => void): TripPlaceCardHook {

    const handleDelete = useCallback(async (placeId: string) => {
        if (window.confirm('Ви впевнені, що хочете видалити це місце з подорожі?')) {
            const result = await deletePlaceFromTrip(tripId, placeId);
            if (result.success) {
                onTripUpdate();
            } else {
                alert(result.message);
            }
        }
    }, [tripId, onTripUpdate]);

    const handleEdit = useCallback(async (placeId: string, data: Partial<Omit<Place, 'id'>>) => {
        const result = await updatePlaceInTrip(tripId, placeId, data);
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