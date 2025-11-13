import React, { FC, ReactElement } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/Auth/LoginPage.tsx';
import RegistrationPage from './pages/Auth/RegistrationPage.tsx';

import { getCurrentUserToken } from './services/authService.ts';

const isLoggedIn = (): boolean => !!getCurrentUserToken();

interface AuthRedirectProps {
    element: ReactElement;
}

const AuthRedirectIfLoggedIn: FC<AuthRedirectProps> = ({ element }) => {
    return isLoggedIn() ? <Navigate to="/trips" replace /> : element;
};

const App: FC = () => {
    return (
        <Router>
            <Routes>

                <Route 
                    path="/" 
                    element={<Navigate to={isLoggedIn() ? "/trips" : "/login"} replace />} 
                />

                <Route 
                    path="/login" 
                    element={<AuthRedirectIfLoggedIn element={<LoginPage />} />} 
                />
                <Route 
                    path="/register" 
                    element={<AuthRedirectIfLoggedIn element={<RegistrationPage />} />} 
                />
                
                <Route path="*" element={
                    <div style={{ padding: '50px', textAlign: 'center' }}>
                        <h1>404: Сторінку не знайдено</h1>
                        <p>Повернутися на <a href="/">Головну</a></p>
                    </div>
                } />

            </Routes>
        </Router>
    );
}

export default App;