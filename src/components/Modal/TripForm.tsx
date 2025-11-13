import React, { FC } from 'react';
import Input from '../UI/Input.tsx';
import Button from '../UI/Button.tsx';
import { Trip } from '../../services/tripsService.ts';
import useTripFormLogic from '../../hooks/useTripForm.ts';

interface TripFormProps {
    trip?: Trip;
    onClose: () => void;
    onUpdate: () => void;
}

const TripForm: FC<TripFormProps> = ({ trip, onClose, onUpdate }) => {
    
    const { 
        formData, 
        handleChange, 
        handleSubmit, 
        isEditMode, 
        isInvalidDateRange,
        isFormValid
    } = useTripFormLogic(trip, onClose, onUpdate);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{isEditMode ? 'Редагування подорожі' : 'Створення нової подорожі'}</h2>
            
            <Input
                name="title"
                placeholder="Назва подорожі"
                value={formData.title}
                onChange={handleChange}
                required
            />
            <Input
                name="description"
                placeholder="Опис"
                value={formData.description}
                onChange={handleChange}
                required
            />
            <Input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
            />
            <Input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
            />
            
            {isInvalidDateRange && (
                <p className="text-red-500 text-sm">Дата початку не може бути пізнішою за дату кінця.</p>
            )}

            <div className="pt-2">
                <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!isFormValid}
                >
                    {isEditMode ? 'Зберегти зміни' : 'Створити Подорож'}
                </Button>
            </div>
        </form>
    );
};

export default TripForm;