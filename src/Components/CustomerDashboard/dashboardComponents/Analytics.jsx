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

  useEffect(() => {
    if (user?.uid) {
      const fetchRegisteredCamps = async () => {
        try {
          const response = await fetch('https://pulse-portal-server.vercel.app/reg_camps');
          if (!response.ok) throw new Error('Failed to fetch registered camps');
          const data = await response.json();
          const userCamps = data.filter((camp) => camp.userId === user.uid);
          setRegisteredCamps(userCamps);
        } catch (error) {
          console.error(error);
          toast.error('Failed to load analytics data.');
        } finally {
          setLoading(false);
        }
      };
      fetchRegisteredCamps();
    }
  }, [user]);

  const chartData = registeredCamps.map((camp) => ({
    name: camp.campName || 'Unnamed',
    fees: Number(camp.campFees || 0),
    date: camp.dateTime ? new Date(camp.dateTime).toLocaleDateString() : 'N/A',
    location: camp.location || 'N/A',
  }));

  const totalCamps = chartData.length;
  const totalFees = chartData.reduce((sum, c) => sum + c.fees, 0);
  const avgFees = totalCamps ? (totalFees / totalCamps).toFixed(2) : 0;
  const highestFeeCamp = chartData.reduce((max, c) => (c.fees > max.fees ? c : max), { fees: 0 });

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gray-100"
      >
        <div className="animate-spin h-8 w-8 border-4 border-cyan-600 border-t-transparent rounded-full"></div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto my-10 px-6"
    >
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Your Camp Analytics</h2>

        {totalCamps === 0 ? (
          <p className="text-center text-gray-600">You have not registered for any camps yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-cyan-50 border border-cyan-200 p-4 rounded-lg text-center">
                <h3 className="text-sm font-medium text-cyan-800">Total Camps</h3>
                <p className="text-2xl font-semibold text-cyan-900">{totalCamps}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg text-center">
                <h3 className="text-sm font-medium text-emerald-800">Total Fees</h3>
                <p className="text-2xl font-semibold text-emerald-900">${totalFees.toFixed(2)}</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-center">
                <h3 className="text-sm font-medium text-amber-800">Average Fee</h3>
                <p className="text-2xl font-semibold text-amber-900">${avgFees}</p>
              </div>
            </div>

            <div className="text-center mb-6 text-gray-700">
              <p>
                <span className="font-medium text-gray-900">Most Expensive Camp:</span>{' '}
                {highestFeeCamp.name} (${highestFeeCamp.fees})
              </p>
              <p>
                <span className="font-medium text-gray-900">Location:</span> {highestFeeCamp.location}
              </p>
              <p>
                <span className="font-medium text-gray-900">Date:</span> {highestFeeCamp.date}
              </p>
            </div>

            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value, name) => [`$${value}`, name === 'fees' ? 'Fees' : name]}
                    labelFormatter={(label) => `Camp: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="fees" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Camp Fees" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Analytics;
