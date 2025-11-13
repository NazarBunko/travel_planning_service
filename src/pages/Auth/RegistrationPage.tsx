import React, { FC } from 'react';
import Input from '../../components/UI/Input.tsx'; 
import Button from '../../components/UI/Button.tsx';
import useRegistrationForm, { RegistrationFormHook } from '../../hooks/useRegistrationForm.ts'; 

const RegistrationPage: FC = () => {
    const {
        formData,
        isLoading,
        error,
        handleChange,
        handleSubmit,
        isSubmitDisabled,
    }: RegistrationFormHook = useRegistrationForm();

    return (
        <div className="max-w-md mx-auto mt-12 p-6 border border-gray-300 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Реєстрація</h2>
            <form onSubmit={handleSubmit} className="space-y-4">

                <Input type="text" name="name" placeholder="Ім'я" value={formData.name} onChange={handleChange} required />
                <Input type="email" name="email" placeholder="Електронна пошта" value={formData.email} onChange={handleChange} required />
                <Input type="password" name="password" placeholder="Пароль" value={formData.password} onChange={handleChange} required />
                <Input type="password" name="confirmPassword" placeholder="Підтвердіть пароль" value={formData.confirmPassword} onChange={handleChange} required />

                {error && (
                    <p className="text-red-600 text-sm mt-1 mb-1">
                        {error}
                    </p>
                )}
                
                <Button 
                    type="submit"
                    loading={isLoading}
                    disabled={isSubmitDisabled} 
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 text-base"
                >
                    Зареєструватись
                </Button>

                <p className="text-center text-sm text-gray-600 pt-1">
                    Вже зареєстровані? <a href='/login' className="text-blue-600 hover:underline">Увійти</a>
                </p>
            </form>
        </div>
    );
}

export default RegistrationPage;