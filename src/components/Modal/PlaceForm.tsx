import React, { FC } from 'react';
import Input from '../UI/Input.tsx';
import Button from '../UI/Button.tsx';
import { Place } from '../../services/tripsService.ts';
import usePlaceForm from '../../hooks/usePlaceForm.ts';

interface PlaceFormProps {
    tripId: number;
    placeToEdit: Place | null;
    onClose: () => void;
    onUpdate: () => void;
}

const PlaceForm: FC<PlaceFormProps> = ({ tripId, placeToEdit, onClose, onUpdate }) => {
    
    const { 
        formData,
        isEditMode,
        handleInputChange,
        handleTextareaChange,
        handleNumberChange,
        handleSubmit,
    } = usePlaceForm(tripId, placeToEdit, onClose, onUpdate);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{isEditMode ? 'Редагування місця' : 'Додавання нового місця'}</h2>

            <Input
                name="locationName"
                placeholder="Місце (Назва)"
                value={formData.locationName}
                onChange={handleInputChange}
                required
            />
            <textarea
                name="notes"
                placeholder="Нотатки (Опціонально)"
                value={formData.notes}
                onChange={handleTextareaChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            />
            <Input
                type="number"
                name="dayNumber"
                placeholder="День подорожі (≥ 1)"
                value={formData.dayNumber}
                onChange={handleNumberChange}
                min="1"
                required
            />
            
            <div className="pt-2">
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    {isEditMode ? 'Зберегти зміни' : 'Додати місце'}
                </Button>
            </div>
        </form>
    );
};

export default PlaceForm;