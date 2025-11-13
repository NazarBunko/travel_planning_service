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

function useCollaborationForm(tripId: string, onUpdate: () => void, initialState: FormData): CollaborationFormHook {
    const [formData, setFormData] = useState<FormData>(initialState);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSelectChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, role: e.target.value as 'collaborator' | 'member' | 'delete' }));
    }, []);

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        setStatusMessage(null);

        const foundUserResult = await findUserByEmail(formData.email);

        if (!foundUserResult.success || !foundUserResult.user) {
            setStatusMessage(`Помилка: Користувача з email "${formData.email}" не знайдено.`);
            return;
        }

        const foundUser = foundUserResult.user;
        const listType = formData.role;
        let result;

        if (listType === 'delete') {
            result = await removeUserFromTrip(tripId, foundUser.uid); 
        } else {
            result = await addUserToTripList(tripId, foundUser.uid, listType);
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