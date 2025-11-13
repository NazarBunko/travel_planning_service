import React, { FC, ReactElement, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/Auth/LoginPage.tsx';
import RegistrationPage from './pages/Auth/RegistrationPage.tsx';
import TripListPage from './pages/Trip/TripListPage.tsx';
import TripPage from './pages/Trip/TripPage.tsx';

import { useAuthStore } from './hooks/useAuthStore.ts'; 

interface AuthRedirectProps {
    element: ReactElement;
}

interface ProtectedRouteProps {
    element: ReactElement;
}

const AuthRedirectIfLoggedIn: FC<AuthRedirectProps> = ({ element }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return isAuthenticated ? <Navigate to="/trips" replace /> : element;
};

const ProtectedRoute: FC<ProtectedRouteProps> = ({ element }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return isAuthenticated ? element : <Navigate to="/login" replace />;
};

const App: FC = () => {
    const initializeUser = useAuthStore((state) => state.initializeUser);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isInitialized = useAuthStore((state) => state.isInitialized);

    useEffect(() => {
        initializeUser();
    }, [initializeUser]);
    
    if (!isInitialized) {
        return <div className="text-center p-10 text-xl">Перевірка автентифікації...</div>;
    }

    const isAuth = isAuthenticated; 

    return (
        <Router>
            <Routes>

                <Route 
                    path="/" 
                    element={<Navigate to={isAuth ? "/trips" : "/login"} replace />} 
                />

                <Route 
                    path="/trips" 
                    element={<ProtectedRoute element={<TripListPage />} />} 
                />

                <Route 
                    path="/trips/:tripId" 
                    element={<ProtectedRoute element={<TripPage />} />} 
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