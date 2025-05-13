import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const ManageRcamp = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all registered camps
  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const response = await fetch('https://pulse-portal-server.vercel.app/reg_camps');
        if (!response.ok) throw new Error('Failed to fetch registered camps');
        const data = await response.json();
        // Ensure paymentStatus and confirmationStatus have defaults
        const formattedData = data.map((reg) => ({
          ...reg,
          paymentStatus: reg.paymentStatus || 'Unpaid',
          confirmationStatus: reg.confirmationStatus || 'Pending',
        }));
        setRegistrations(formattedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching registrations:', error);
        toast.error('Failed to load registered camps.');
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, []);

  // Handle confirmation status update
  const handleConfirm = async (registrationId, currentPaymentStatus) => {
    if (currentPaymentStatus !== 'Paid') {
      toast.error('Cannot confirm: Payment is not completed.');
      return;
    }

    try {
      const response = await fetch(`https://pulse-portal-server.vercel.app/reg_camps/${registrationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationStatus: 'Confirmed' }),
      });

      if (!response.ok) throw new Error('Failed to confirm registration');
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg._id === registrationId ? { ...reg, confirmationStatus: 'Confirmed' } : reg
        )
      );
      toast.success('Registration confirmed successfully!');
    } catch (error) {
      console.error('Error confirming registration:', error);
      toast.error('Failed to confirm registration.');
    }
  };

  // Handle cancellation
  const handleCancel = async (registrationId) => {
    if (!window.confirm('Are you sure you want to cancel this registration?')) return;

    try {
      const response = await fetch(`https://pulse-portal-server.vercel.app/reg_camps/${registrationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to cancel registration');
      setRegistrations((prev) => prev.filter((reg) => reg._id !== registrationId));
      toast.success('Registration cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling registration:', error);
      toast.error('Failed to cancel registration.');
    }
  };

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
      className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 max-w-5xl mx-auto my-8"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Manage Registered Camps</h2>

      {registrations.length === 0 ? (
        <p className="text-center text-gray-600">No registered camps found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left text-sm font-medium text-gray-700">Camp Name</th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">Camp Fees</th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">Participant</th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">Payment Status</th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">Confirmation Status</th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => {
                const isCancelDisabled =
                  reg.paymentStatus === 'Paid' && reg.confirmationStatus === 'Confirmed';
                return (
                  <tr key={reg._id} className="border-b border-gray-200">
                    <td className="p-3 text-gray-800">{reg.campName || 'N/A'}</td>
                    <td className="p-3 text-gray-800">${reg.campFees?.toFixed(2) || '0.00'}</td>
                    <td className="p-3 text-gray-800">{reg.userEmail || 'N/A'}</td>
                    <td className="p-3 text-gray-800">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reg.paymentStatus === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {reg.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3 text-gray-800">
                      {reg.confirmationStatus === 'Pending' ? (
                        <button
                          onClick={() => handleConfirm(reg._id, reg.paymentStatus)}
                          className="bg-cyan-600 text-white px-3 py-1 rounded-md hover:bg-cyan-700 text-xs"
                        >
                          Pending
                        </button>
                      ) : (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          Confirmed
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleCancel(reg._id)}
                        disabled={isCancelDisabled}
                        className={`bg-red-600 text-white px-3 py-1 rounded-md text-xs ${
                          isCancelDisabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-red-700'
                        }`}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default ManageRcamp;