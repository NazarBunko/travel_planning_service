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

    const containerStyle: React.CSSProperties = { 
        maxWidth: '400px', 
        margin: '50px auto', 
        padding: '20px', 
        border: '1px solid #ddd', 
        borderRadius: '8px' 
    };

    const headerStyle: React.CSSProperties = { 
        textAlign: 'center' 
    };

    const errorStyle: React.CSSProperties = {
        color: 'red', 
        fontSize: '0.9em', 
        margin: '5px 0'
    };
    
    const textStyle: React.CSSProperties = {
        textAlign: 'center', 
        fontSize: '0.9em'
    };

    return (
        <div style={containerStyle}>
            <h2 style={headerStyle}>Реєстрація</h2>
            <form onSubmit={handleSubmit}>

                <Input type="text" name="name" placeholder="Ім'я" value={formData.name} onChange={handleChange} required />
                <Input type="email" name="email" placeholder="Електронна пошта" value={formData.email} onChange={handleChange} required />
                <Input type="password" name="password" placeholder="Пароль" value={formData.password} onChange={handleChange} required />
                <Input type="password" name="confirmPassword" placeholder="Підтвердіть пароль" value={formData.confirmPassword} onChange={handleChange} required />

                {error && <p style={errorStyle}>{error}</p>}
                
                <Button 
                    type="submit"
                    loading={isLoading}
                    disabled={isSubmitDisabled} 
                >
                    Зареєструватись
                </Button>

                <p style={textStyle}>Вже зареєстровані? <a href='/login'>Увійти</a></p>
            </form>
        </div>
    );
}

export default RegistrationPage;