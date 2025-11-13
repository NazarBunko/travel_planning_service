import { useState, useCallback, FormEvent, ChangeEvent, useMemo } from 'react';
import { registerUser } from '../services/authService.ts';
import { useAuthStore } from './useAuthStore.ts';
import { useNavigate } from 'react-router-dom';

interface FormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface RegistrationFormHook {
    formData: FormData;
    isLoading: boolean;
    error: string | null;
    handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (event: FormEvent) => void;
    isSubmitDisabled: boolean;
}

function useRegistrationForm(): RegistrationFormHook {
    const [formData, setFormData] = useState<FormData>({ name: '', email: '', password: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    }, []);

    const isPasswordMismatch = useMemo(() => {
        return formData.password !== formData.confirmPassword;
    }, [formData.password, formData.confirmPassword]);

    const isFormIncomplete = useMemo(() => {
        return !formData.name || !formData.email || !formData.password || !formData.confirmPassword;
    }, [formData.name, formData.email, formData.password, formData.confirmPassword]);

    const isSubmitDisabled = isFormIncomplete || isPasswordMismatch || isLoading;

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault(); 
        setError(null);
        
        if (isPasswordMismatch) {
            setError('Паролі мають співпадати.');
            return;
        }

        setIsLoading(true);
        
        const result = await registerUser(formData.email, formData.password, formData.name); 

        if (result.success) {
            alert(`Реєстрація успішна! Вхід...`);
            navigate('/trips', { replace: true });
        } else {
            setError(result.message || 'Невідома помилка реєстрації.');
        }

        setIsLoading(false);
    }, [formData, isPasswordMismatch, navigate]);

    return {
        formData,
        isLoading,
        error,
        handleChange,
        handleSubmit,
        isSubmitDisabled,
    };
}

export default useRegistrationForm;