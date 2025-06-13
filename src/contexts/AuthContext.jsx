import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../utils/firebase/firebase';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Token refresh interval (55 minutes - Firebase tokens expire after 1 hour)
    const TOKEN_REFRESH_INTERVAL = 55 * 60 * 1000;

    const refreshToken = async (forceRefresh = false) => {
        try {
            if (auth.currentUser) {
                // console.log('🔄 Refreshing token...', { forceRefresh });
                const newToken = await auth.currentUser.getIdToken(forceRefresh);
                localStorage.setItem('token', newToken);
                setToken(newToken);
                // console.log('✅ Token refreshed successfully');
                return newToken;
            }
        } catch (error) {
            console.error('❌ Error refreshing token:', error);
            // If token refresh fails, logout user
            logout();
            throw error;
        }
    };

    const logout = () => {
        // Clear authentication tokens
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        
        // Clear contest-related data (as mentioned in the guide)
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('contest_') || key.startsWith('problem_')) {
                localStorage.removeItem(key);
            }
        });
        
        setToken(null);
        setUser(null);
        auth.signOut();
        window.location.href = '/';
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                try {
                    // Get fresh token when user state changes
                    const freshToken = await firebaseUser.getIdToken();
                    localStorage.setItem('token', freshToken);
                    setToken(freshToken);
                } catch (error) {
                    console.error('Error getting initial token:', error);
                }
            } else {
                setUser(null);
                setToken(null);
                localStorage.removeItem('token');
                localStorage.removeItem('isAdmin');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let refreshInterval;

        if (user && token) {
            // Set up automatic token refresh
            refreshInterval = setInterval(() => {
                refreshToken(true);
            }, TOKEN_REFRESH_INTERVAL);

            // Refresh token immediately if it's close to expiration
            const checkTokenExpiration = async () => {
                try {
                    if (auth.currentUser) {
                        const tokenResult = await auth.currentUser.getIdTokenResult();
                        const expirationTime = new Date(tokenResult.expirationTime).getTime();
                        const currentTime = Date.now();
                        const timeUntilExpiration = expirationTime - currentTime;

                        // If token expires in less than 5 minutes, refresh it now
                        if (timeUntilExpiration < 5 * 60 * 1000) {
                            await refreshToken(true);
                        }
                    }
                } catch (error) {
                    console.error('Error checking token expiration:', error);
                }
            };

            checkTokenExpiration();
        }

        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    }, [user, token]);

    // Set up visibility change listener to refresh token when tab becomes active
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && user) {
                // Tab became active, refresh token to ensure it's fresh
                refreshToken(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [user]);

    const value = {
        user,
        token,
        loading,
        refreshToken,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
