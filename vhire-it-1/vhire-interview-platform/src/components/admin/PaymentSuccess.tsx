import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const email = params.get('email');
  const interviewId = params.get('interviewId');
  const [statusMessage, setStatusMessage] = useState('Verifying your payment...');

  useEffect(() => {
    const verifyAndUpdate = async () => {
      if (!email || !interviewId) return;

      try {
        const res = await axios.get('http://localhost:5001/check-payment-status', {
          params: { email, interviewId },
        });

        const message = res.data?.message || res.data;

        setStatusMessage(message); // Show updated message on screen

        // Wait a moment, then confirm and close
        setTimeout(() => {
          const confirmed = window.confirm(message + "\n\nClick OK to return to Dashboard.");
          if (confirmed) {
            if (window.opener && !window.opener.closed) {
              window.opener.location.reload();
            }
            window.close();
          }
        }, 500);
      } catch (err: any) {
        console.error('Verification failed:', err);
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          'Verification failed.';
        setStatusMessage(errorMessage);
      }
    };

    verifyAndUpdate();
  }, [email, interviewId]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h2 className="text-xl font-semibold text-center px-4">{statusMessage}</h2>
    </div>
  );
};

export default PaymentSuccess;
