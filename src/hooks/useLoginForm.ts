import { useState, useCallback, FormEvent } from 'react';
import { useAuthStore } from './useAuthStore.ts'; 

interface FormData {
    email: string;
    password: string;
}

export interface LoginFormHook {
    formData: FormData;
    isLoading: boolean;
    handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (event: FormEvent) => void;
}

function useLoginForm(): LoginFormHook {
    const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    const login = useAuthStore((state) => state.login);

    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = useCallback((e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const success = login(formData.email, formData.password); 
        
        setTimeout(() => {
            setIsLoading(false);
            if (success) {
                alert(`Вхід успішний для: ${formData.email}`);
            } else {
                alert('Невірний email або пароль.');
            }
        }, 500);
    }, [formData, login]);

    return {
        formData,
        isLoading,
        handleChange,
        handleSubmit,
    };
}

export default useLoginForm;