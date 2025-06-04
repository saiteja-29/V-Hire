import React, { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

interface InterviewPaymentInfo {
  id: string;
  interviewer_email_id: string;
  upi_id: string;
  Interview_id: string;
  payment_info: string;
  payment_status: string;
}

const PaymentDashboard: React.FC = () => {
  const { user } = useUser();
  const [payments, setPayments] = useState<InterviewPaymentInfo[]>([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        if (!user?.email) return;

        const q = query(
          collection(db, 'interviewer_payment_info'),
          where('interviewer_email_id', '==', user.email)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<InterviewPaymentInfo, 'id'>),
        }));
        setPayments(data);
      } catch (error) {
        console.error('Error fetching interviewer payments:', error);
      }
    };

    fetchPayments();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Your Interview Payments</h1>
        {payments.length ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="p-3">Interview ID</th>
                {/* <th className="p-3">UPI ID</th> */}
                <th className="p-3">Payment Info</th>
                <th className="p-3">Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{p.Interview_id}</td>
                  {/* <td className="p-3">{p.upi_id}</td> */}
                  <td className="p-3">{p.payment_info}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${
                        p.payment_status.toLowerCase() === 'received'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {p.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No payment records found.</p>
        )}
      </div>
    </div>
  );
};

export default PaymentDashboard;
