// src/components/Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import { useUser } from '../context/UserContext';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('candidate');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useUser();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        console.log(name);
        console.log(email);
        console.log(role);
        
        

        try {
            const user = await AuthService.register(email, password, name, role);
            
            // Update local user state
            login({
                id: user.uid,
                name,
                email: user.email!,
                role: role as 'candidate' | 'company' | 'interviewer' | 'admin'
            });
            console.log(role);
            
            if(role == 'company'){
                navigate('/companyform');
            }else if(role == 'candidate'){
                navigate('/candidateform');
            }else if(role == 'interviewer'){
                navigate('/interviewerform')
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            const errorMessage = error.message || 'Registration failed. Please try again.';
        
            if (
                error.code === 'auth/email-already-in-use' || 
                errorMessage.toLowerCase().includes('email already in use') || 
                errorMessage.toLowerCase().includes('already registered')
            ) {
                setError('This email is already registered. Redirecting to login...');
                setTimeout(() => navigate('/login'), 3000); // Redirect after 3s
            } else {
                setError(errorMessage);
            }
        }finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
                <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">Create Account</h2>
                <p className="text-gray-500 mb-6 text-center">Fill in your details to get started</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

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

                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                            Role
                        </label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="candidate">Candidate</option>
                            <option value="interviewer">Interviewer</option>
                            <option value="company">Company</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                    >
                        {loading ? (
                            <span className="animate-spin h-5 w-5 border-4 border-white border-t-transparent rounded-full"></span>
                        ) : (
                            'Create Account'
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

export default Register;
