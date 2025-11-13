import React, { FC } from 'react';
import Button from '../UI/Button.tsx';
import { Place } from '../../services/tripsService.ts';

interface TripPlaceCardProps {
    place: Place;
    canManage: boolean;
    onDelete: (placeId: string) => void;
    onEdit: (place: Place) => void; 
}

const TripPlaceCard: FC<TripPlaceCardProps> = ({ place, canManage, onDelete, onEdit }) => {
    
    return (
        <div className="border border-gray-300 p-4 mb-3 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow-md">
            <div className="mb-3 md:mb-0">
                <h3 className="text-xl font-bold text-gray-900">{place.locationName}</h3>
                <p className="text-sm text-gray-600 mt-1">{place?.notes}</p>
                <p className="text-sm text-gray-500 mt-1">День: {place.dayNumber}</p>
            </div>
            
            <div className="flex space-x-2 flex-shrink-0">
                {canManage && (
                <>
                        <Button 
                            onClick={() => onDelete(place.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            Видалити
                        </Button>
                        <Button 
                            onClick={() => onEdit(place)} 
                            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                        >
                            Редагувати
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

export default TripPlaceCard;