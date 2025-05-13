import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { authContext } from '../../AuthProvider/AuthProvider';

const RegisteredCamp = () => {
  const { user } = useContext(authContext);
  const [registeredCamps, setRegisteredCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(null);
  const [showPayConfirm, setShowPayConfirm] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (!user) return;

    const fetchRegisteredCamps = async () => {
      try {
        const response = await fetch('https://pulse-portal-server.vercel.app/reg_camps', {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to fetch registered camps');
        const data = await response.json();
        // Filter camps for the current user
        const userCamps = data.filter((camp) => camp.userEmail === user.email);
        setRegisteredCamps(userCamps);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching registered camps:', error);
        toast.error('Failed to load registered camps.');
        setLoading(false);
      }
    };
    fetchRegisteredCamps();
  }, [user]);

  const handlePay = async (camp) => {
    setIsSubmitting(true);
    try {
      const transactionId = `TXN_${Math.random().toString(36).substr(2, 9)}`;
      
      // Update payment status
      const updateResponse = await fetch(
        `https://pulse-portal-server.vercel.app/reg_camps/${camp._id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Paid' }),
        }
      );
      if (!updateResponse.ok) throw new Error('Failed to update payment status');

      // Store transaction details
      const transactionResponse = await fetch(
        'https://pulse-portal-server.vercel.app/transactions',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campId: camp.campId,
            campName: camp.campName,
            userEmail: user.email,
            transactionId,
            amount: camp.campFees,
            date: new Date().toISOString(),
          }),
        }
      );
      if (!transactionResponse.ok) throw new Error('Failed to save transaction');

      setRegisteredCamps((prev) =>
        prev.map((c) =>
          c._id === camp._id ? { ...c, paymentStatus: 'Paid' } : c
        )
      );
      toast.success(`Payment successful! Transaction ID: ${transactionId}`);
      setShowPayConfirm(null);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error(`Payment failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (camp) => {
    if (camp.paymentStatus === 'Paid') return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `https://pulse-portal-server.vercel.app/reg_camps/${camp._id}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) throw new Error('Failed to cancel registration');

      setRegisteredCamps((prev) => prev.filter((c) => c._id !== camp._id));
      toast.success('Registration cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling registration:', error);
      toast.error(`Cancellation failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitFeedback = async (data, campId) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        'https://pulse-portal-server.vercel.app/feedbacks',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campId,
            campName: registeredCamps.find((c) => c._id === campId).campName,
            userEmail: user.email,
            feedback: data.feedback,
            rating: parseInt(data.rating),
            date: new Date().toISOString(),
          }),
        }
      );
      if (!response.ok) throw new Error('Failed to submit feedback');

      toast.success('Feedback submitted successfully!');
      setShowFeedbackForm(null);
      reset();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(`Feedback submission failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gray-100"
      >
        <p className="text-gray-600">Please log in to view registered camps.</p>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gray-100"
      >
        <svg
          className="animate-spin h-8 w-8 text-cyan-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto py-8 px-4"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        My Registered Camps
      </h2>

      {registeredCamps.length === 0 ? (
        <p className="text-center text-gray-600">No registered camps found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
            <thead>
              <tr className="bg-cyan-600 text-white">
                <th className="py-3 px-4 text-left">Camp Name</th>
                <th className="py-3 px-4 text-left">Camp Fees</th>
                <th className="py-3 px-4 text-left">Participant Name</th>
                <th className="py-3 px-4 text-left">Payment Status</th>
                <th className="py-3 px-4 text-left">Confirmation Status</th>
                <th className="py-3 px-4 text-left">Feedback</th>
                <th className="py-3 px-4 text-left">Cancel</th>
              </tr>
            </thead>
            <tbody>
              {registeredCamps.map((camp) => (
                <tr key={camp._id} className="border-b border-gray-200">
                  <td className="py-3 px-4">{camp.campName}</td>
                  <td className="py-3 px-4">${camp.campFees?.toFixed(2)}</td>
                  <td className="py-3 px-4">{user.displayName || user.email}</td>
                  <td className="py-3 px-4">
                    {camp.paymentStatus === 'Paid' ? (
                      <span className="text-green-600">Paid</span>
                    ) : (
                      <button
                        onClick={() => setShowPayConfirm(camp._id)}
                        className="bg-cyan-600 text-white px-3 py-1 rounded-md hover:bg-cyan-700"
                        disabled={isSubmitting}
                      >
                        Pay
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {camp.status === 'Confirmed' ? (
                      <span className="text-green-600">Confirmed</span>
                    ) : (
                      <span className="text-yellow-600">Pending</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {camp.paymentStatus === 'Paid' &&
                    camp.status === 'Confirmed' ? (
                      <button
                        onClick={() => setShowFeedbackForm(camp._id)}
                        className="bg-cyan-600 text-white px-3 py-1 rounded-md hover:bg-cyan-700"
                        disabled={isSubmitting}
                      >
                        Feedback
                      </button>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleCancel(camp)}
                      className={`px-3 py-1 rounded-md ${
                        camp.paymentStatus === 'Paid'
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                      disabled={camp.paymentStatus === 'Paid' || isSubmitting}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Confirmation Dialog */}
      {showPayConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Payment</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to pay for{' '}
              {registeredCamps.find((c) => c._id === showPayConfirm)?.campName}?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowPayConfirm(null)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handlePay(registeredCamps.find((c) => c._id === showPayConfirm))
                }
                className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Pay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Form */}
      {showFeedbackForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Submit Feedback</h3>
            <form onSubmit={handleSubmit((data) => onSubmitFeedback(data, showFeedbackForm))}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback
                </label>
                <textarea
                  {...register('feedback', { required: true })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500"
                  rows="4"
                  placeholder="Enter your feedback"
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <select
                  {...register('rating', { required: true })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select rating</option>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num} Star{num > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowFeedbackForm(null)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default RegisteredCamp;