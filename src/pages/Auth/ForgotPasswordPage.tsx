import React, { FC } from 'react';
import Input from '../../components/UI/Input.tsx'; 
import Button from '../../components/UI/Button.tsx';
import useForgotPasswordForm, { ForgotPasswordFormHook } from '../../hooks/useForgotPasswordForm.ts'; 

const ForgotPasswordPage: FC = () => {
    const {
        formData,
        isLoading,
        statusMessage,
        handleChange,
        handleSubmit,
        isSubmitDisabled,
        isPasswordMismatch,
    }: ForgotPasswordFormHook = useForgotPasswordForm();

    const isError = statusMessage && statusMessage.startsWith('Помилка');
    const statusClass = isError ? 'text-red-600' : 'text-green-600';

    return (
        <div className="max-w-md mx-auto mt-12 p-6 border border-gray-300 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Відновлення паролю</h2>
            <form onSubmit={handleSubmit} className="space-y-4">

                <Input 
                    type="email" 
                    name="email" 
                    placeholder="Електронна пошта" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                />
                <Input 
                    type="password" 
                    name="newPassword" 
                    placeholder="Новий пароль" 
                    value={formData.newPassword} 
                    onChange={handleChange} 
                    required 
                />
                <Input 
                    type="password" 
                    name="confirmPassword" 
                    placeholder="Підтвердіть пароль" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    required 
                />

                {statusMessage && (
                    <p className={`text-sm mt-1 mb-1 ${statusClass}`}>
                        {statusMessage}
                    </p>
                )}
                {isPasswordMismatch && (
                    <p className="text-red-600 text-sm mt-1 mb-1">
                        Паролі не співпадають.
                    </p>
                )}
                
                <Button 
                    type="submit"
                    loading={isLoading}
                    disabled={isSubmitDisabled} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 text-base"
                >
                    Скинути пароль
                </Button>

                <p className="text-center text-sm text-gray-600 pt-1">
                    <a href='/login' className="text-blue-600 hover:underline">Назад до входу</a>
                </p>
            </form>
        </div>
    );
}

export default ForgotPasswordPage;