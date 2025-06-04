import React, { useState } from 'react';
import { db } from '../../config/firebaseConfig'; // Firebase config
import { collection, addDoc ,query, where, getDocs} from 'firebase/firestore';
import { useUser } from '../../context/UserContext';
import { useNavigate } from "react-router-dom";
const ProfileFormCompany: React.FC = () => {
    const [companyName, setCompanyName] = useState('');
    const [companyType, setCompanyType] = useState('');
    const [yearEstablished, setYearEstablished] = useState('');
    const [numEmployees, setNumEmployees] = useState('');
    const [briefDesc, setBriefDesc] = useState('');
    const [contacts, setContacts] = useState(['', '', '']);
    const [specialMessage, setSpecialMessage] = useState('');
    const {user,login}= useUser();
    const navigate = useNavigate();
    // Company types (fixed list)
    const companyTypes = ['Tech', 'Finance', 'Healthcare', 'Education', 'Retail'];

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate that at least one contact is filled
        if (contacts.filter(contact => contact.trim() !== '').length === 0) {
            alert('Please provide at least one contact.');
            return;
        }
        const companyRef = collection(db, 'company_users');
        const q = query(companyRef, where('companyName', '==', companyName));
        // Prepare data to store
        try {
            // Add data to Firestore
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                // Company name already exists
                alert('A company with this name already exists. Please choose a different name.');
                return;
            }
            const companyData = {
                companyName,
                companyType,
                yearEstablished,
                numEmployees,
                briefDesc,
                contacts: contacts.filter(contact => contact.trim() !== ''), // Only store non-empty contacts
                specialMessage,
                email: user?.email
            };
            const companyRef = collection(db, 'company_users');
            await addDoc(companyRef, companyData);
            alert('Company registration successful!');
            navigate("/dashboard");
        } catch (error) {
            console.error('Error adding document: ', error);
            alert('Error occurred during registration');
        }
    };

    // Handle change in contact fields
    const handleContactChange = (index: number, value: string) => {
        const newContacts = [...contacts];
        newContacts[index] = value;
        setContacts(newContacts);
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 border border-gray-300 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Company Registration</h2>

            <div className="mb-4">
                <label htmlFor="companyName" className="block text-sm font-medium">Company Name</label>
                <input
                    type="text"
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="companyType" className="block text-sm font-medium">Type of Company</label>
                <select
                    id="companyType"
                    value={companyType}
                    onChange={(e) => setCompanyType(e.target.value)}
                    required
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                >
                    <option value="">Select Type</option>
                    {companyTypes.map((type, index) => (
                        <option key={index} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <label htmlFor="yearEstablished" className="block text-sm font-medium">Year of Establishment</label>
                <input
                    type="number"
                    id="yearEstablished"
                    value={yearEstablished}
                    onChange={(e) => setYearEstablished(e.target.value)}
                    required
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="numEmployees" className="block text-sm font-medium">Number of Employees</label>
                <input
                    type="number"
                    id="numEmployees"
                    value={numEmployees}
                    onChange={(e) => setNumEmployees(e.target.value)}
                    required
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="briefDesc" className="block text-sm font-medium">Brief Description</label>
                <textarea
                    id="briefDesc"
                    value={briefDesc}
                    onChange={(e) => setBriefDesc(e.target.value)}
                    required
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium">Point of Contact (At least one)</label>
                {contacts.map((contact, index) => (
                    <div key={index} className="flex items-center mb-2">
                        <input
                            type="text"
                            value={contact}
                            onChange={(e) => handleContactChange(index, e.target.value)}
                            placeholder={`Contact ${index + 1}`}
                            className="p-2 w-3/4 border border-gray-300 rounded-md mr-2"
                        />
                    </div>
                ))}
            </div>

            <div className="mb-4">
                <label htmlFor="specialMessage" className="block text-sm font-medium">Special Message for Team</label>
                <textarea
                    id="specialMessage"
                    value={specialMessage}
                    onChange={(e) => setSpecialMessage(e.target.value)}
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
            </div>

            <button
                type="submit"
                className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
                Submit
            </button>
        </form>
    );
};

export default ProfileFormCompany;
