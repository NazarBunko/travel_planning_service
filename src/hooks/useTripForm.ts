import { useCallback, FormEvent, useMemo, useEffect } from 'react';
import { Trip, createTrip, updateTrip } from '../services/tripsService.ts';
import useForm from './useForm.ts';

interface TripFormData {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
}

interface TripFormLogicHook {
    formData: TripFormData;
    isEditMode: boolean;
    isInvalidDateRange: boolean;
    isFormValid: boolean;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSubmit: (e: FormEvent) => void;
}

const getInitialState = (trip?: Trip): TripFormData => ({
    title: trip?.title || '',
    description: trip?.description || '',
    startDate: trip?.startDate || '',
    endDate: trip?.endDate || '',
});

function useTripForm(trip?: Trip, onClose?: () => void, onUpdate?: () => void): TripFormLogicHook {
    
    const { formData, handleChange, setFormData } = useForm<TripFormData>(getInitialState(trip));
    
    const isEditMode = useMemo(() => !!trip, [trip]);

    useEffect(() => {
        setFormData(getInitialState(trip));
    }, [trip, setFormData]);

    const isInvalidDateRange = useMemo(() => {
        if (!formData.startDate || !formData.endDate) return false;
        return new Date(formData.startDate) > new Date(formData.endDate);
    }, [formData.startDate, formData.endDate]);
    
    const isFormValid = Boolean(!isInvalidDateRange && formData.title && formData.description && formData.startDate && formData.endDate);

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();

        if (!isFormValid) {
            alert("Будь ласка, заповніть усі поля та перевірте дати.");
            return;
        }

        const baseData = {
            title: formData.title,
            description: formData.description,
            startDate: formData.startDate,
            endDate: formData.endDate,
        };

        let result;
        
        if (isEditMode && trip) {
            result = await updateTrip(trip.id, baseData);
        } else {
            result = await createTrip({
                ...baseData,
                collaboratorIds: [],
                memberIds: [],
            });
        }
        
        if (result.success) {
            if (onUpdate) onUpdate();
            if (onClose) onClose();
        } else {
            alert(result.message);
        }
    }, [isFormValid, isEditMode, trip, formData, onClose, onUpdate]);

    return {
        formData,
        handleChange,
        handleSubmit,
        isEditMode,
        isInvalidDateRange,
        isFormValid,
    };
}

export default useTripForm;