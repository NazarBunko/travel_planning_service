import React, { FC } from 'react';
import Button from '../UI/Button.tsx';
import { useAuthStore } from '../../hooks/useAuthStore.ts'; 
import { Trip } from '../../services/tripsService.ts';

interface TripCardProps {
    trip: Trip;
    onShow: (trip: Trip) => void;
    onDelete: (id: string) => void;
}

const TripCard: FC<TripCardProps> = ({ trip, onShow, onDelete }) => {
    const currentUser = useAuthStore((state) => state.user);
    
    const formattedStartDate = trip.startDate 
        ? new Date(trip.startDate).toLocaleDateString('uk-UA') 
        : 'Н/Д';
    const formattedEndDate = trip.endDate 
        ? new Date(trip.endDate).toLocaleDateString('uk-UA') 
        : 'Н/Д';

    if (!currentUser) return null;

    return (
        <div className="border border-gray-300 p-4 mb-3 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow-md">
            <div 
                className="mb-3 md:mb-0 cursor-pointer flex-grow" 
                onClick={() => onShow(trip)}
            >
                <h3 className="text-xl font-bold text-gray-900">{trip.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{trip.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                    <span className="font-semibold">Дати:</span> {formattedStartDate} – {formattedEndDate}
                </p>
            </div>
            
            <div className="flex space-x-2 flex-shrink-0">
                <Button 
                    onClick={() => onShow(trip)} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Переглянути
                </Button>
            </div>
        </div>
    );
}

export default TripCard;