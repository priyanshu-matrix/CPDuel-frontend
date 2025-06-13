import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from './login';

const ProtectedRoute = ({ children }) => {
    const { user, loading, token } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user || !token) {
        return <Login />;
    }

    return children;
};

export default ProtectedRoute;
