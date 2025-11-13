import { useState, useCallback, FormEvent, ChangeEvent, useMemo } from 'react';
import { resetPassword } from '../services/authService.ts';

interface FormData {
    email: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ForgotPasswordFormHook {
    formData: FormData;
    isLoading: boolean;
    statusMessage: string | null;
    handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (event: FormEvent) => void;
    isSubmitDisabled: boolean;
    isPasswordMismatch: boolean;
}

function useForgotPasswordForm(): ForgotPasswordFormHook {
    const [formData, setFormData] = useState<FormData>({ email: '', newPassword: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setStatusMessage(null);
    }, []);

    const isPasswordMismatch = useMemo(() => {
        return formData.newPassword !== formData.confirmPassword;
    }, [formData.newPassword, formData.confirmPassword]);

    const isSubmitDisabled = useMemo(() => {
        return !formData.email || !formData.newPassword || !formData.confirmPassword || isPasswordMismatch || isLoading;
    }, [formData.email, formData.newPassword, formData.confirmPassword, isPasswordMismatch, isLoading]);


    const handleSubmit = useCallback((e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatusMessage(null);

        if (isPasswordMismatch) {
            setIsLoading(false);
            setStatusMessage('Помилка: Паролі не співпадають.');
            return;
        }

        const result = resetPassword(formData.email, formData.newPassword);
        
        setTimeout(() => {
            setIsLoading(false);
            if (result.success) {
                setStatusMessage('Пароль успішно змінено. Можете увійти.');
                setFormData({ email: formData.email, newPassword: '', confirmPassword: '' });
            } else {
                setStatusMessage(`Помилка: ${result.message}`);
            }
        }, 500);
    }, [formData.email, formData.newPassword, isPasswordMismatch]);

    return {
        formData,
        isLoading,
        statusMessage,
        handleChange,
        handleSubmit,
        isSubmitDisabled,
        isPasswordMismatch,
    };
}

export default useForgotPasswordForm;