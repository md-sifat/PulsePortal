import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { authContext } from '../../AuthProvider/AuthProvider';

const PaymentHistory = () => {
  const { user } = useContext(authContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch transactions and filter by user
  useEffect(() => {
    if (user?.uid) {
      const fetchTransactions = async () => {
        try {
          const response = await fetch('https://pulse-portal-server.vercel.app/reg_camps');
          if (!response.ok) throw new Error('Failed to fetch payment history');
          const data = await response.json();
          // Filter transactions by userId
          const userTransactions = data.filter((transaction) => transaction.userId === user.uid);
          setTransactions(userTransactions);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching payment history:', error);
          toast.error('Failed to load payment history.');
          setLoading(false);
        }
      };
      fetchTransactions();
    }
  }, [user]);

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
      className="max-w-4xl mx-auto py-8 px-4"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Payment History</h2>

      {transactions.length === 0 ? (
        <p className="text-center text-gray-600">No payment history found.</p>
      ) : (
        <div className="space-y-6">
          {transactions.map((transaction) => (
            <motion.div
              key={transaction._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{transaction.campName}</h3>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Fees:</span> ${transaction.campFees?.toFixed(2) || '0.00'}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Date & Time:</span>{' '}
                {transaction.dateTime ? new Date(transaction.dateTime).toLocaleString() : 'N/A'}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Location:</span> {transaction.location || 'N/A'}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Healthcare Professional:</span>{' '}
                {transaction.healthcareProfessional || 'N/A'}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default PaymentHistory;