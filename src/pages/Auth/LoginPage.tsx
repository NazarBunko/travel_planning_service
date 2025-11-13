import React, { FC } from 'react';
import Input from '../../components/UI/Input.tsx'; 
import Button from '../../components/UI/Button.tsx';
import useLoginForm, { LoginFormHook } from '../../hooks/useLoginForm.ts'; 

const LoginPage: FC = () => {
    const { 
        formData, 
        isLoading, 
        handleChange, 
        handleSubmit 
    }: LoginFormHook = useLoginForm();

    return (
        <div className="max-w-md mx-auto mt-12 p-5 border border-gray-300 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">Вхід у Систему</h2>
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
                    name="password"
                    placeholder="Пароль"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                
                <Button 
                    type="submit"
                    loading={isLoading}
                    disabled={!formData.email || !formData.password}
                >
                    Увійти
                </Button>

                <p className="text-center text-sm mt-4 text-gray-600">
                    Ще не зареєстровані? <a href='/register' className="text-blue-600 hover:underline">Зареєструватись</a>
                </p>

                <p className="text-center text-sm mt-4 text-gray-600">
                    Забули пароль? <a href='/forgot-password' className="text-blue-600 hover:underline">Відновити</a>
                </p>
                
            </form>
        </div>
    );
}

export default LoginPage;