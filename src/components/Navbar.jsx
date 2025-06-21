import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { API_URLS } from "../config/server";

const navLinks = [
    { href: "/home", label: "Home" },
    { href: "/contest", label: "Contest" },
    { href: "/sheets", label: "Sheets" },
    { href: "/stats", label: "Stats" },
];

const Navbar = () => {
    const { logout: authLogout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [userName, setUserName] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    const logout = () => {
        // Remove specific tokens
        authLogout();
        
        // Remove all contest-related code items
        Object.keys(localStorage).forEach(key => {
            if (key.match(/^contest-.+-problem-.+-code$/)) {
                localStorage.removeItem(key);
            }
        });
        
        window.location.href = "/";
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.log("No token found");
                    setUserName("Guest");
                    return;
                }

                const response = await fetch(API_URLS.USERS.INFO, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();

                if (response.ok) {
                    setUserName(data.name);
                    setIsAdmin(data.isAdmin || false);
                } else {
                    console.error("API error:", data.message || "Unknown error");
                    setUserName("User");
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setUserName("User");
                setIsAdmin(false);
            }
        };

        if (isProfileOpen) {
            fetchUserData();
        }
    }, [isProfileOpen]);

    return (
        <header className="bg-gray-900 border-b border-gray-800 shadow-sm">
            <nav className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                <Link
                    to="/home"
                    className="flex items-center gap-2 text-2xl font-extrabold text-amber-400 tracking-wide hover:text-amber-300 transition"
                >
                    CP Duel
                </Link>
                <div className="flex gap-8 items-center">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            to={link.href}
                            className="text-gray-200 font-medium hover:text-amber-400 transition px-2 py-1 rounded"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <button
                        onClick={toggleProfile}
                        className="text-gray-200 font-medium hover:text-amber-400 transition px-2 py-1 rounded"
                    >
                        Profile
                    </button>
                </div>
            </nav>

            {/* Profile Sidebar */}
            {isProfileOpen && (
                <div
                    className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm z-50"
                    onClick={toggleProfile}
                >
                    <div
                        className="absolute top-0 right-0 w-80 h-full bg-gray-800 p-4 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={toggleProfile}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-300"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                                className="h-6 w-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                        <h2 className="text-2xl font-bold text-white mb-4">Profile</h2>
                        <p className="text-gray-300">
                            {userName ? (
                                <>
                                    Welcome, {userName}
                                    {isAdmin && <sub className="text-green-500 ml-1">Admin</sub>}
                                </>
                            ) : (
                                "Loading user data..."
                            )}
                        </p>
                        <Link
                            to="/stats"
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mt-4 block text-center"
                            onClick={toggleProfile}
                        >
                            📊 View Stats
                        </Link>
                        {isAdmin && (
                            <Link
                                to="/add-contest"
                                className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-2 px-4 rounded mt-4 block text-center"
                                onClick={toggleProfile}
                            >
                                Add Contest
                            </Link>
                        )}
                        {isAdmin && (
                            <Link
                                to="/createproblems"
                                className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-2 px-4 rounded mt-4 block text-center"
                                onClick={toggleProfile}
                            >
                                Create Problems
                            </Link>
                        )}
                        <button
                            onClick={() => {
                                logout();
                                toggleProfile();
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
