import React, { useContext } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaPlus, FaCampground, FaList } from 'react-icons/fa';
import { authContext } from '../AuthProvider/AuthProvider';

const AdminDashboard = () => {
  const { user } = useContext(authContext);
  const location = useLocation();

  // Static organizer (replace with dynamic data later)
  const organizer = { name: 'Admin Organizer' };

  // Define dashboard routes with titles and icons (no components)
  const dashboardRoutes = [
    { path: 'profile-a', title: 'Organizer Profile', icon: <FaUser /> },
    { path: 'add-camp', title: 'Add A Camp', icon: <FaPlus /> },
    { path: 'manage-camp', title: 'Manage Camps', icon: <FaCampground /> },
    { path: 'manage-rcamp', title: 'Manage Registered Camps', icon: <FaList /> },
  ];

  // Check if user is admin
  if (!user || user.email !== 'admin@gmail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
          <p className="mt-2 text-gray-600">You must be an admin to access this page.</p>
          <Link to="/" className="mt-4 inline-block text-cyan-600 hover:underline">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Check if on index route (no child route active)
  const isIndexRoute = location.pathname === '/admin-dashboard';

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Admin Dashboard - {organizer.name}
        </h1>

        {/* Dashboard Boxes */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {dashboardRoutes.map((route) => {
            const isActive = location.pathname.includes(route.path);
            return (
              <Link
                key={route.path}
                to={`/admin-dashboard/${route.path}`}
                className={`flex-1 min-w-[150px] max-w-[200px] bg-white p-4 rounded-lg shadow-md border-2 ${
                  isActive ? 'border-cyan-600' : 'border-gray-200'
                } hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center text-center text-gray-700 hover:bg-gray-50`}
              >
                <div className="text-2xl mb-2 text-cyan-600">{route.icon}</div>
                <span className="text-sm font-semibold">{route.title}</span>
              </Link>
            );
          })}
        </div>

        {/* Child Routes or Welcome Title with Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200"
          >
            {isIndexRoute ? (
              <div className="p-6 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Welcome to Admin Dashboard</h2>
                <p className="mt-2 text-gray-600">Select an option above to get started.</p>
              </div>
            ) : (
              <Outlet />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;