import { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { registerUser, AuthResult } from '../services/authService.ts';
import { useNavigate } from 'react-router-dom';

export interface RegistrationFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface RegistrationFormHook {
    formData: RegistrationFormData;
    isLoading: boolean;
    error: string | null;
    handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
    isSubmitDisabled: boolean;
}

function useRegistrationForm(): RegistrationFormHook {
    const [formData, setFormData] = useState<RegistrationFormData>({name: '', email: '', password: '', confirmPassword: ''});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        
        setFormData(prev => {
            const updatedFormData = { ...prev, [name]: value };
            
            setError(null);

            if (updatedFormData.password && updatedFormData.confirmPassword && updatedFormData.password !== updatedFormData.confirmPassword) {
                setError('Паролі мають співпадати');
            } else if (!updatedFormData.password || !updatedFormData.confirmPassword) {
                setError(null);
            }
            
            return updatedFormData;
        });
    }, []);

    const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault(); 
        
        const isPasswordMismatch = formData.password !== formData.confirmPassword;

        if (error || isPasswordMismatch) {
            alert("Будь ласка, виправте помилку співпадіння паролів.");
            return;
        }

        setIsLoading(true);
        const result: AuthResult = registerUser({ name: formData.name, email: formData.email, password: formData.password });

        if(result.success){
            setTimeout(() => {
                setIsLoading(false);
                alert(`Реєстрація успішна для: ${formData.email}`);
                navigate('/rooms', { replace: true });
            }, 1500); 
        } else {
            setIsLoading(false);
            alert(result.message!);
        }
    }, [formData, error, navigate]);

    const isFormIncomplete: boolean = !formData.name 
                              || !formData.email 
                              || !formData.password 
                              || !formData.confirmPassword;
    
    const isPasswordMismatch: boolean = formData.password !== formData.confirmPassword;
    
    const isSubmitDisabled: boolean = isFormIncomplete || isPasswordMismatch;


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