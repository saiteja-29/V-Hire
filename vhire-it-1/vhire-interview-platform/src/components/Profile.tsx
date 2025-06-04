import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import AuthService from '../services/auth.service';

const Profile: React.FC = () => {
    const { user, login } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        role: (user?.role || 'candidate') as 'candidate' | 'company' | 'interviewer' | 'admin'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError(null);
 
        try {
            // Only include fields that have changed
            const updates: { name?: string; email?: string; role?: string } = {};
            
            if (formData.name !== user.name) updates.name = formData.name;
            if (formData.email !== user.email) updates.email = formData.email;
            if (formData.role !== user.role) updates.role = formData.role;

            // Only proceed if there are actual changes
            if (Object.keys(updates).length > 0) {
                // Update profile in Firestore and Firebase Auth
                const updatedData = await AuthService.updateProfile(user.id, updates);

                // Update local user state
                login({
                    ...user,
                    ...formData
                });

                setIsEditing(false);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update profile. Please try again.');
            console.error('Profile update error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            {/* <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                    Role
                                </label>
                                <select
                                    id="role"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'candidate' | 'company' | 'interviewer' | 'admin' })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="candidate">Candidate</option>
                                    <option value="interviewer">Interviewer</option>
                                    <option value="company">Company</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div> */}

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>

                            {error && (
                                <p className="mt-2 text-sm text-red-600">{error}</p>
                            )}
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                                <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Role</h3>
                                <p className="mt-1 text-sm text-gray-900 capitalize">{user.role}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile; 