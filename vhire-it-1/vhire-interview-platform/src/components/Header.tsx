// src/components/Header.tsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Header: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useUser();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Function to determine if a link is active
    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        setShowProfileMenu(false);
    };

    return (
        <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link 
                            to="/" 
                            className={`text-2xl font-bold transition-colors duration-200 ${
                                isActive('/') ? 'text-primary' : 'text-gray-800 hover:text-primary'
                            }`}
                        >
                            VHire
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex items-center space-x-4">
                        <Link 
                            to="/" 
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                isActive('/') 
                                    ? 'text-primary bg-primary/10' 
                                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                            }`}
                        >
                            Home
                        </Link>
                        
                        {!user ? (
                            <>
                                <Link 
                                    to="/login" 
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                        isActive('/login') 
                                            ? 'text-primary bg-primary/10' 
                                            : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                                    }`}
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/register" 
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                        isActive('/register') 
                                            ? 'text-primary bg-primary/10' 
                                            : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                                    }`}
                                >
                                    Register
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link 
                                    to="/dashboard" 
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                        isActive('/dashboard') 
                                            ? 'text-primary bg-primary/10' 
                                            : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                                    }`}
                                >
                                    Dashboard
                                </Link>
                                
                                {/* Profile Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50"
                                    >
                                        <span>{user.name}</span>
                                        <svg
                                            className={`h-4 w-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {showProfileMenu && (
                                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                            <div className="py-1">
                                                <Link
                                                    to="/profile"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setShowProfileMenu(false)}
                                                >
                                                    Profile
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;