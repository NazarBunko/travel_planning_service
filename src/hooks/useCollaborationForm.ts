import { useState, useCallback, FormEvent, ChangeEvent } from 'react';
import { findUserByEmail } from '../services/authService.ts';
import { addUserToTripList, removeUserFromTrip } from '../services/tripsService.ts';

interface FormData {
    email: string;
    role: 'collaborator' | 'member' | 'delete';
}

interface CollaborationFormHook {
    formData: FormData;
    statusMessage: string | null;
    handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleSelectChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    handleSubmit: (e: FormEvent) => void;
}

function useCollaborationForm(tripId: number, onUpdate: () => void, initialState: FormData): CollaborationFormHook {
    const [formData, setFormData] = useState<FormData>(initialState);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSelectChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, role: e.target.value as 'collaborator' | 'member' | 'delete' }));
    }, []);

    const handleSubmit = useCallback((e: FormEvent) => {
        e.preventDefault();
        setStatusMessage(null);

        const foundUser = findUserByEmail(formData.email);

        if (!foundUser) {
            setStatusMessage(`Помилка: Користувача з email "${formData.email}" не знайдено.`);
            return;
        }

        const listType = formData.role;
        let result;

        if (listType === 'delete') {
            result = removeUserFromTrip(tripId, foundUser.id); 
        } else {
            result = addUserToTripList(tripId, foundUser.id, listType);
        }

        if (result.success) {
            let successMessage;
            if (listType === 'delete') {
                successMessage = `Користувач ${foundUser.name} успішно видалений зі списків учасників подорожі.`;
            } else {
                successMessage = `Користувач ${foundUser.name} успішно доданий як ${listType === 'collaborator' ? 'Співавтор' : 'Турист'}.`;
            }
            setStatusMessage(successMessage);
            onUpdate();
        } else {
            setStatusMessage(`Помилка: ${result.message}`);
        }
    }, [tripId, formData.email, formData.role, onUpdate]);

    return {
        formData,
        statusMessage,
        handleInputChange,
        handleSelectChange,
        handleSubmit,
    };
}

export default useCollaborationForm;