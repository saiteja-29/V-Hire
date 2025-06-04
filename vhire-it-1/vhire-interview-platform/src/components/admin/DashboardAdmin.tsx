import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from "../../config/firebaseConfig";
import axios from 'axios';

interface InterviewPaymentInfo {
  id: string;
  interviewer_email_id: string;
  upid_id: string;
  Interview_id: string;
  payment_info: string;
  payment_status: string;
}

const DashboardAdmin: React.FC = () => {
  const [payments, setPayments] = useState<InterviewPaymentInfo[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const paymentSnap = await getDocs(collection(db, 'interviewer_payment_info'));
      const interviewSnap = await getDocs(collection(db, 'interviews'));
  
      const paymentsData = paymentSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InterviewPaymentInfo[];
  
      const interviewsMap = new Map<string, any>();
      interviewSnap.docs.forEach(doc => {
        const data = doc.data();
        interviewsMap.set(data.interview_id, data);
      });
  
      const validPayments: InterviewPaymentInfo[] = [];
  
      for (const payment of paymentsData) {
        if (payment.payment_status === 'received') continue;
  
        const interview = interviewsMap.get(payment.Interview_id);
        if (
          !interview ||
          interview.verifiedCandidateEmail !== interview.candidateEmail ||
          interview.verifiedInterviewerEmail !== interview.interviewerEmail
        ) {
          // Delete invalid entry from Firebase
          try {
            await deleteDoc(doc(db, 'interviewer_payment_info', payment.id));
            console.log(`Deleted invalid entry with ID: ${payment.id}`);
          } catch (err) {
            console.error(`Error deleting entry ${payment.id}:`, err);
          }
          continue;
        }
  
        validPayments.push(payment);
      }
  
      validPayments.sort((a, b) => {
        const timeA = parseInt(a.Interview_id.split('-')[1]);
        const timeB = parseInt(b.Interview_id.split('-')[1]);
        return timeB - timeA;
      });
  
      setPayments(validPayments);
    };
  
    fetchData();
  }, []);
  

  const handlePayment = async (entry: InterviewPaymentInfo) => {
    setLoadingId(entry.id);

    try {
      const res = await axios.post('http://localhost:5001/create-payment-link', {
        upiId: entry.upid_id,
        amount: 100,
        name: entry.interviewer_email_id.split('@')[0],
        email: entry.interviewer_email_id,
        interviewId: entry.Interview_id, // reuse existing
      });

      if (res.data.short_url) {
        window.open(res.data.short_url, '_blank');
      }
    } catch (error) {
      console.error('Error creating payment link:', error);
      alert('Failed to create payment link.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm md:text-base text-gray-600">Complete the Pending Interview Payments</p>
        </div>

        <div className="rounded-xl bg-white p-4 md:p-6 shadow-lg overflow-x-auto">
          <h2 className="mb-4 text-lg md:text-xl font-semibold text-gray-900">Pending Payments</h2>
          <table className="min-w-full text-left text-sm md:text-base">
            <thead>
              <tr className="border-b">
                <th className="px-3 py-2 font-medium text-gray-600">Interview ID</th>
                <th className="px-3 py-2 font-medium text-gray-600">Email</th>
                <th className="px-3 py-2 font-medium text-gray-600">UPI ID</th>
                <th className="px-3 py-2 font-medium text-gray-600">Status</th>
                <th className="px-3 py-2 font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((entry) => (
                <tr key={entry.id} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2">{entry.Interview_id}</td>
                  <td className="px-3 py-2 break-words max-w-xs">{entry.interviewer_email_id}</td>
                  <td className="px-3 py-2 break-words max-w-xs">{entry.upid_id}</td>
                  <td className="px-3 py-2 capitalize">{entry.payment_status}</td>
                  <td className="px-3 py-2">
                    <button
                      className={`px-4 py-1 rounded ${
                        loadingId === entry.id
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      } text-white`}
                      onClick={() => handlePayment(entry)}
                      disabled={loadingId === entry.id}
                    >
                      {loadingId === entry.id ? 'Processing...' : 'Pay ₹100'}
                    </button>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-gray-500">
                    No pending payments.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
