import { useCallback, ChangeEvent, FormEvent, useMemo, useEffect } from 'react';
import { Place, addPlaceToTrip, updatePlaceInTrip } from '../services/tripsService.ts';
import useForm from './useForm.ts';

interface PlaceFormData {
    locationName: string;
    notes: string;
    dayNumber: number;
}

interface PlaceFormHook {
    formData: PlaceFormData;
    isEditMode: boolean;
    handleTextareaChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: FormEvent) => void;
}

const getInitialState = (place: Place | null): PlaceFormData => ({
    locationName: place?.locationName || '',
    notes: place?.notes || '',
    dayNumber: place?.dayNumber || 1,
});

function usePlaceForm(tripId: number, placeToEdit: Place | null, onClose: () => void, onUpdate: () => void): PlaceFormHook {
    
    // Використовуємо setFormData напряму замість baseHandleChange
    const { formData, setFormData } = useForm<PlaceFormData>(getInitialState(placeToEdit));
    
    const isEditMode = useMemo(() => !!placeToEdit, [placeToEdit]);

    useEffect(() => {
        setFormData(getInitialState(placeToEdit));
    }, [placeToEdit, setFormData]);

    const handleTextareaChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, [setFormData]);
    
    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, [setFormData]);

    const handleNumberChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setFormData(prev => ({ ...prev, [e.target.name]: value }));
    }, [setFormData]);

    const handleSubmit = useCallback((e: FormEvent) => {
        e.preventDefault();

        if (formData.dayNumber < 1) {
            alert('Номер дня має бути не менше 1.');
            return;
        }

        const data = {
            locationName: formData.locationName,
            notes: formData.notes,
            dayNumber: formData.dayNumber,
        };

        let result;

        if (isEditMode && placeToEdit) {
            result = updatePlaceInTrip(tripId, placeToEdit.id, data);
        } else {
            result = addPlaceToTrip(tripId, data);
        }
        
        if (result.success) {
            onUpdate();
            onClose();
        } else {
            alert(result.message);
        }
    }, [isEditMode, placeToEdit, tripId, formData, onClose, onUpdate]);
    
    return {
        formData,
        isEditMode,
        handleTextareaChange,
        handleInputChange,
        handleNumberChange,
        handleSubmit,
    };
}

export default usePlaceForm;