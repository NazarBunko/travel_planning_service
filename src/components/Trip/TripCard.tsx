import React, { FC } from 'react';
import Button from '../UI/Button.tsx';
import { getCurrentUser, UserPublic } from '../../services/authService.ts';
import { Trip } from '../../services/tripsService.ts';

interface TripCardProps {
    trip: Trip;
    onShow: (trip: Trip) => void;
    onDelete: (id: number) => void;
}

const TripCard: FC<TripCardProps> = ({ trip, onShow, onDelete }) => {
    const currentUser: UserPublic | null = getCurrentUser();
    
    const formattedStartDate = trip.startDate 
        ? new Date(trip.startDate).toLocaleDateString('uk-UA') 
        : 'Н/Д';
    const formattedEndDate = trip.endDate 
        ? new Date(trip.endDate).toLocaleDateString('uk-UA') 
        : 'Н/Д';

    if (!currentUser) return null;

    const isOwnerOrCollaborator: boolean = (
        currentUser.id === trip.ownerId ||
        trip.collaboratorIds.includes(currentUser.id)
    );
    
    const canManage: boolean = isOwnerOrCollaborator || currentUser.role === "Admin";

    return (
        <div className="border border-gray-300 p-4 mb-3 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow-md">
            <div className="mb-3 md:mb-0">
                <h3 className="text-xl font-bold text-gray-900">{trip.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{trip.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                    <span className="font-semibold">Дати:</span> {formattedStartDate} – {formattedEndDate}
                </p>
            </div>
            
            <div className="flex space-x-2 flex-shrink-0">
                {canManage && (
                <>
                        <Button 
                            onClick={() => onDelete(trip.id)} 
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            Видалити
                        </Button>
                    </>
                )}
                <Button 
                    onClick={() => onShow(trip)} 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-sm"
                >
                    Переглянути
                </Button>
            </div>
        </div>
    );
}

export default TripCard;