import { useState, useCallback, ChangeEvent } from 'react';

function useForm<T>(initialState: T) {
    const [formData, setFormData] = useState<T>(initialState);

    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, [initialState]);

    const resetForm = useCallback(() => setFormData(initialState), [initialState]);

    return {
        formData,
        handleChange,
        resetForm,
        setFormData
    };
}

export default useForm;