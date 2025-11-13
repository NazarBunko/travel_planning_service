import { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, AuthResult } from '../services/authService.ts'; 

export interface LoginFormData {
    email: string;
    password: string;
}

export interface LoginFormHook {
    formData: LoginFormData;
    isLoading: boolean;
    handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function useLoginForm(): LoginFormHook {
    const [formData, setFormData] = useState<LoginFormData>({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const navigate = useNavigate();

    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault(); 
        setIsLoading(true);

        const result: AuthResult = loginUser(formData.email, formData.password );

        setTimeout(() => {
            setIsLoading(false);
            if (result.success) {
                alert(`Вхід успішний для: ${formData.email}`);
                navigate('/trips', { replace: true });
            } else {
                alert(result.message!); 
            }
        }, 500);
    }, [formData, navigate]);

    return {
        formData,
        isLoading,
        handleChange,
        handleSubmit,
    };
}

export default useLoginForm;