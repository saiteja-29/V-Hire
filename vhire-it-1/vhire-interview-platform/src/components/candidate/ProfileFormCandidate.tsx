import React, { useState } from "react";
import { useUser } from "../../context/UserContext";
import { db } from '../../config/firebaseConfig'; // Firebase config
import { collection, addDoc ,query, where, getDocs} from 'firebase/firestore';
import AuthService from "../../services/auth.service";
import { useNavigate } from "react-router-dom";

const ProfileCandidateForm: React.FC = () => {
    const { user, login } = useUser();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        FullName: user?.name || "",
        email: user?.email || "",
        phone: "",
        dreamCompanyList: [""],
    });

    const handleCompanyChange = (index: number, value: string) => {
        const updatedCompanies = [...formData.dreamCompanyList];
        updatedCompanies[index] = value;
        setFormData({ ...formData, dreamCompanyList: updatedCompanies });
    };

    const addCompanyField = () => {
        setFormData({ ...formData, dreamCompanyList: [...formData.dreamCompanyList, ""] });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const candidateRef = collection(db, 'candidate_Users');
        const q = query(candidateRef, where('email', '==', formData.email));
        // Prepare data to store
        try {
            // Add data to Firestore
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                // candidate with same email already exists
                alert('A candidate with same email already exists');
                return;
            }
            const candidateData = {
                formData
            };
            const candidateref = collection(db, 'candidate_Users');
            await addDoc(candidateref, candidateData);
            alert('Candidate registration successful!');
            navigate("/dashboard");
        } catch (error) {
            console.error('Error adding document: ', error);
            alert('Error occurred during registration');
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-6 mt-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Edit Your Profile</h2>
            <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={formData.FullName}
                        onChange={(e) => setFormData({ ...formData, FullName: e.target.value })}
                        className="mt-1 w-full border rounded-md p-2 shadow-sm focus:ring focus:ring-blue-200"
                        required
                    />
                </div>


                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1 w-full border rounded-md p-2 shadow-sm focus:ring focus:ring-blue-200"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Companies I Like</label>
                    {formData.dreamCompanyList.map((company, index) => (
                        <input
                            key={index}
                            type="text"
                            value={company}
                            onChange={(e) => handleCompanyChange(index, e.target.value)}
                            className="mb-2 w-full border rounded-md p-2 shadow-sm focus:ring focus:ring-blue-200"
                            placeholder={`Company ${index + 1}`}
                        />
                    ))}
                    <button
                        type="button"
                        onClick={addCompanyField}
                        className="inline-flex items-center mt-2 px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                        Add Company
                    </button>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save Profile"}
                    </button>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}
                {success && <p className="text-sm text-green-600">Profile updated successfully!</p>}
            </form>
        </div>
    );
};

export default ProfileCandidateForm;
