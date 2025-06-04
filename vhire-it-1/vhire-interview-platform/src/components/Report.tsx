import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { db } from "../config/firebaseConfig";
import { doc, addDoc,updateDoc, getDocs, collection, query, where } from "firebase/firestore";
const Report: React.FC = () => {
  const [rating, setRating] = useState<number>(0);
  const [status, setStatus] = useState<string>('');
  const [verdict, setVerdict] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = location.state || {};
  const {user,login}= useUser();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const interviewsQuery = query(
        collection(db, "interviews"),
        where("roomId", "==", roomId)
      );
      const interviewSnapshot = await getDocs(interviewsQuery);
      const interviewDoc = interviewSnapshot.docs[0];
      const interview_id = interviewDoc.data().interview_id;
      const interviewDocRef = interviewDoc.ref;
      const reportRef = doc(db, "interview_report", roomId);
      await updateDoc(reportRef, {
        rating,
        verdict,
        status,
        completedAt: new Date().toISOString(),
        interview_id,
      });
      await updateDoc(interviewDocRef, {
        interview_status: "completed",
      });
  
      if(user){
        const interviewerEmail = user.email;
        const interviewerQuery = query(
          collection(db, "interviewer_Users"),
          where("email", "==", interviewerEmail)
        );
        const interviewerSnapshot = await getDocs(interviewerQuery);
        if (!interviewerSnapshot.empty) {
          const interviewerDoc = interviewerSnapshot.docs[0];
          const upiID = interviewerDoc.data().upiID;
    
          // Store in interviewer_payment_info
          await addDoc(collection(db, "interviewer_payment_info"), {
            Interview_id:interview_id,
            upid_id:upiID,
            interviewer_email_id: interviewerEmail,
            payment_id:"",
            payment_info:"",
            payment_status: "pending",
          });
        } else {
          console.warn("No matching interviewer found for email:", interviewerEmail);
        }
      }
    // Fetch upiID from interviewerUsers collection
      navigate('/dashboard');
    } catch (error) {
      console.error("Error saving report:", error);
      alert("Failed to save report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Interview Report</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating (1-5)
            </label>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`w-10 h-10 rounded-full ${
                    rating === value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } flex items-center justify-center transition-colors`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verdict
            </label>
            <textarea
              value={verdict}
              onChange={(e) => setVerdict(e.target.value)}
              rows={4}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your verdict about the candidate..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <textarea
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              rows={4}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your status about the candidate..."
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting || !rating || !verdict}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Report;