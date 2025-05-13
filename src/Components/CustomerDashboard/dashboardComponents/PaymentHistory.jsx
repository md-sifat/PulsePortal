import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { authContext } from '../../AuthProvider/AuthProvider';

const PaymentHistory = () => {
  const { user } = useContext(authContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      const fetchTransactions = async () => {
        try {
          const res = await fetch('https://pulse-portal-server.vercel.app/reg_camps');
          if (!res.ok) throw new Error('Failed to fetch payment history');
          const data = await res.json();
          const userTransactions = data.filter((t) => t.userId === user.uid);
          setTransactions(userTransactions);
        } catch (err) {
          console.error(err);
          toast.error('Failed to load payment history.');
        } finally {
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
        <svg className="animate-spin h-8 w-8 text-cyan-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto px-4 py-10"
    >
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Payment History</h2>

      {transactions.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No payment history found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {transactions.map((transaction) => (
            <motion.div
              key={transaction._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md p-6 transition-all"
            >
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-cyan-700">{transaction.campName}</h3>
                <p className="text-sm text-gray-500">{transaction.location || 'N/A'}</p>
              </div>
              <div className="space-y-2 text-gray-700 text-sm">
                <p><span className="font-medium">Fees:</span> ${transaction.campFees?.toFixed(2) || '0.00'}</p>
                <p><span className="font-medium">Date:</span> {transaction.dateTime ? new Date(transaction.dateTime).toLocaleDateString() : 'N/A'}</p>
                <p><span className="font-medium">Time:</span> {transaction.dateTime ? new Date(transaction.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
                <p><span className="font-medium">Professional:</span> {transaction.healthcareProfessional || 'N/A'}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default PaymentHistory;
