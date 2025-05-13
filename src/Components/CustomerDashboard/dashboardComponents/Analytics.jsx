import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { authContext } from '../../AuthProvider/AuthProvider';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const Analytics = () => {
  const { user } = useContext(authContext);
  const [registeredCamps, setRegisteredCamps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch registered camps for the user
  useEffect(() => {
    if (user?.uid) {
      const fetchRegisteredCamps = async () => {
        try {
          const response = await fetch('https://pulse-portal-server.vercel.app/reg_camps');
          if (!response.ok) throw new Error('Failed to fetch registered camps');
          const data = await response.json();
          // Filter camps by userId
          const userCamps = data.filter((camp) => camp.userId === user.uid);
          setRegisteredCamps(userCamps);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching registered camps:', error);
          toast.error('Failed to load analytics data.');
          setLoading(false);
        }
      };
      fetchRegisteredCamps();
    }
  }, [user]);

  // Prepare data for the chart
  const chartData = registeredCamps.map((camp) => ({
    name: camp.campName,
    fees: camp.campFees,
    date: camp.dateTime ? new Date(camp.dateTime).toLocaleDateString() : 'N/A',
    location: camp.location || 'N/A',
  }));

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
      className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 max-w-4xl mx-auto my-8"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Registered Camps Analytics</h2>

      {registeredCamps.length === 0 ? (
        <p className="text-center text-gray-600">No registered camps found.</p>
      ) : (
        <div className="space-y-6">
          <p className="text-center text-gray-600">
            Total Registered Camps: {registeredCamps.length}
          </p>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  label={{
                    value: 'Camp Fees ($)',
                    angle: -90,
                    position: 'insideLeft',
                    offset: -10,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Fees']}
                />
                <Legend />
                <Bar dataKey="fees" fill="#06b6d4" name="Camp Fees" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Analytics;