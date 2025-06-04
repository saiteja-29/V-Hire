import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const CreateScheduleMeet: React.FC = () => {
    const navigate = useNavigate();
    const auth = getAuth();
    const currentUser = auth.currentUser; // Get the current user
    

    // State for form fields
    const [candidateEmail, setCandidateEmail] = useState('');
    const [roomId, setRoomId] = useState(generateRoomId());
    const [description, setDescription] = useState('');
    const [interviewType, setInterviewType] = useState('Technical');
    const [exactTiming, setExactTiming] = useState('');
    const [interviewerEmail, setInterviewerEmail] = useState('');

    // Function to generate a random room ID
    function generateRoomId() {
        const randomId = Math.random().toString(36).substring(2, 9);
        const timestamp = Date.now().toString().substring(-4);// Generates a random string
        return randomId + timestamp;
    }

    useEffect(() => {
        if (currentUser) {
            setInterviewerEmail(currentUser.email || ''); // Set the interviewer email if user is logged in
        }
    }, [currentUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Prepare data to be stored
        const interviewData = {
            candidateEmail,
            roomId,
            description,
            interviewType,
            exactTiming,
            interviewerEmail, // Include the interviewer's email
        };

        try {
            // Update Firestore document
            await setDoc(doc(db, "InterviewScheduled", roomId), interviewData);
            console.log("Document successfully written!");
            // Optionally navigate or reset form
            navigate('/dashboard'); // Redirect to a success page or reset form
        } catch (error) {
            console.error("Error writing document: ", error);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Schedule Meet</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Candidate Email:</label>
                        <input 
                            type="email" 
                            value={candidateEmail} 
                            onChange={(e) => setCandidateEmail(e.target.value)} 
                            required 
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Room ID:</label>
                        <input 
                            type="text" 
                            value={roomId} 
                            readOnly 
                            className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Interviewer Email:</label>
                        <input 
                            type="email" 
                            value={interviewerEmail} 
                            readOnly 
                            className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Description:</label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            required 
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Interview Type:</label>
                        <select 
                            value={interviewType} 
                            onChange={(e) => setInterviewType(e.target.value)} 
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Technical">Technical</option>
                            <option value="HR">HR</option>
                            <option value="Leadership">Leadership</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Exact Timing:</label>
                        <input 
                            type="datetime-local" 
                            value={exactTiming} 
                            onChange={(e) => setExactTiming(e.target.value)} 
                            required 
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-blue-500 text-white font-semibold py-3 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Schedule Meet
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreateScheduleMeet;

