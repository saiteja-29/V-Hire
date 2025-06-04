// src/components/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import AuthService from "../services/auth.service";
import { db } from '../config/firebaseConfig'; 
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { login } = useUser();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { user, userData } = await AuthService.login(email, password);
            
            login({
                id: user.uid,
                name: userData.name,
                email: user.email!,
                role: userData.role,
            });

            console.log(userData);
            
            if(userData.role ==='company'){
                const companyRef = collection(db, 'company_users');
                const q = query(companyRef, where('email', '==', userData.email));
                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty) {
                    navigate('/companyform');
                }
                else{
                    navigate('/dashboard');
                }
            }else if(userData.role ==='candidate'){
                const companyRef = collection(db, 'candidate_users');
                const q = query(companyRef, where('email', '==', userData.email));
                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty) {
                    navigate("/candidateform");
                }
                else{
                    navigate('/dashboard');
                }
            }else if(userData.role ==='interviewer'){
                console.log("I am here")
                const companyRef = collection(db, 'interviewer_Users');
                const q = query(companyRef, where('email', '==', userData.email));
                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty) {
                    navigate("/interviewerform")
                }
                else{
                    navigate('/dashboard');
                }
            }
            else if(userData.role ==='admin'){
                console.log("I am here")
                navigate('/dashboard')
            }
            
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Failed to login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
                <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">Welcome Back!</h2>
                <p className="text-gray-500 mb-6 text-center">Sign in with your email and password</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                    >
                        {loading ? (
                            <span className="animate-spin h-5 w-5 border-4 border-white border-t-transparent rounded-full"></span>
                        ) : (
                            'Sign In'
                        )}
                    </button>

                    {error && (
                        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Login;
