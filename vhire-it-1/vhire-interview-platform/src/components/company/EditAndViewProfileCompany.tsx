import React, { useEffect, useState, useCallback } from 'react';
import { useUser } from '../../context/UserContext';
import { db } from '../../config/firebaseConfig';
import { collection, getDocs, query, updateDoc, where } from 'firebase/firestore';

// InputField - memoized
const InputField = React.memo(({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
}) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
        />
    </div>
));

const Display = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <span className="text-base text-gray-800">{value || '-'}</span>
    </div>
);

const ProfileCompany: React.FC = () => {
    const { user, login } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [companyData, setCompanyData] = useState<any>(null);

    const fetchCompanyProfile = async () => {
        try {
            const q = query(collection(db, "company_users"), where("email", "==", user?.email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                setCompanyData(querySnapshot.docs[0].data());
            }
        } catch (err) {
            console.error('Error fetching company data:', err);
        }
    };

    useEffect(() => {
        if (user?.role === 'company') {
            fetchCompanyProfile();
        }
    }, [user]);

    const handleChange = useCallback((field: string, value: string | string[]) => {
        setCompanyData((prev: any) => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !companyData) return;

        setLoading(true);
        setError(null);

        try {
            const q = query(collection(db, "company_users"), where("email", "==", user.email));
            const snapshot = await getDocs(q);
            const docRef = snapshot.docs[0].ref;

            await updateDoc(docRef, {
                briefDesc: companyData.briefDesc,
                companyName: companyData.companyName,
                companyType: companyData.companyType,
                contacts: companyData.contacts,
                numEmployees: companyData.numEmployees,
                specialMessage: companyData.specialMessage,
                yearEstablished: companyData.yearEstablished
            });

            login({ ...user, name: companyData.companyName }); // Update name in context
            setIsEditing(false);
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-gray-600">Loading...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-10">
            <div className="max-w-4xl mx-auto px-6">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">Company Profile</h2>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {user.role === 'company' && companyData ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <InputField label="Company Name" value={companyData.companyName || ''} onChange={(val) => handleChange('companyName', val)} />
                                    <InputField label="Brief Description" value={companyData.briefDesc || ''} onChange={(val) => handleChange('briefDesc', val)} />
                                    <InputField label="Company Type" value={companyData.companyType || ''} onChange={(val) => handleChange('companyType', val)} />
                                    <InputField label="Number of Employees" value={companyData.numEmployees || ''} onChange={(val) => handleChange('numEmployees', val)} />
                                    <InputField label="Special Message" value={companyData.specialMessage || ''} onChange={(val) => handleChange('specialMessage', val)} />
                                    <InputField label="Year Established" value={companyData.yearEstablished || ''} onChange={(val) => handleChange('yearEstablished', val)} />
                                    <InputField
                                        label="Contacts (comma-separated)"
                                        value={companyData.contacts?.join(', ') || ''}
                                        onChange={(val) => handleChange('contacts', val.split(',').map((v) => v.trim()))}
                                    />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <InputField label="Name" value={user.name || ''} onChange={(val) => handleChange('name', val)} />
                                    <InputField label="Email" value={user.email || ''} onChange={(val) => handleChange('email', val)} />
                                </div>
                            )}

                            <div className="flex justify-end gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 bg-gray-100 text-sm font-semibold text-gray-700 rounded-md hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {user.role === 'company' && companyData ? (
                                <>
                                    <Display label="Company Name" value={companyData.companyName} />
                                    <Display label="Brief Description" value={companyData.briefDesc} />
                                    <Display label="Company Type" value={companyData.companyType} />
                                    <Display label="Number of Employees" value={companyData.numEmployees} />
                                    <Display label="Special Message" value={companyData.specialMessage} />
                                    <Display label="Year Established" value={companyData.yearEstablished} />
                                    <Display label="Contacts" value={companyData.contacts?.join(', ')} />
                                </>
                            ) : (
                                <>
                                    <Display label="Name" value={user.name} />
                                    <Display label="Email" value={user.email} />
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileCompany;
