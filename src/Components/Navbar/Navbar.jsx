import React, { useContext, useState } from 'react';
import { authContext } from '../AuthProvider/AuthProvider';
import logo from '../../assets/logo.webp';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase.init';
import { FaHome, FaCampground, FaUserPlus, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const { user, setUser, dashboard, setDashboard } = useContext(authContext);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    console.log(dashboard);
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        toast.success('Log Out successful!');
        setUser(null);
        setDashboard(null);
        navigate('/');
        setIsDropdownOpen(false);
      })
      .catch((error) => {
        toast.error('Log Out error!');
        console.error(error);
      });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <div className="w-full px-6 bg-gradient-to-r from-cyan-700 to-cyan-800 min-h-[12vh] rounded-b-2xl shadow-lg">
      <ToastContainer />
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo and Website Name */}
        <Link to="/" className="flex items-center space-x-2 sm:space-x-6">
          <img src={logo} alt="Logo" className="h-14 w-14 rounded-full" />
          <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">CampVibe</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6 lg:space-x-10">
          <Link
            to="/"
            className="flex items-center text-white text-base lg:text-lg hover:text-cyan-200 transition-colors duration-300"
          >
            <FaHome className="mr-2" />
            Home
          </Link>
          <Link
            to="/available-camps"
            className="flex items-center text-white text-base lg:text-lg hover:text-cyan-200 transition-colors duration-300"
          >
            <FaCampground className="mr-2" />
            Available Camps
          </Link>
          {user ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center focus:outline-none cursor-pointer"
                aria-label="Toggle user menu"
              >
                <img
                  src={user.photoURL || 'https://via.placeholder.com/40'}
                  alt="Profile"
                  className="h-10 w-10 rounded-full border-2 border-cyan-300"
                />
              </button>
              <div
                className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-20 transition-all duration-300 ease-in-out transform origin-top ${
                  isDropdownOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
                }`}
              >
                <div className="px-4 py-3 border-b text-gray-800 font-semibold">
                  {user.displayName || 'User'}
                </div>
                <Link
                  to={dashboard || '/'}
                  className="block px-4 py-2 text-gray-700 hover:bg-cyan-100 transition-colors duration-200"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 transition-colors duration-200"
                >
                  <FaSignOutAlt className="inline mr-2" />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center text-white text-base lg:text-lg bg-cyan-600 px-4 py-2 rounded-full hover:bg-cyan-800 transition-colors duration-300"
            >
              <FaUserPlus className="mr-2" />
              Join Us
            </Link>
          )}
        </div>

        {/* Mobile Menu (Profile Photo Dropdown) */}
        <div className="md:hidden">
          {user ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center focus:outline-none cursor-pointer"
                aria-label="Toggle mobile user menu"
              >
                <img
                  src={user.photoURL || 'https://via.placeholder.com/40'}
                  alt="Profile"
                  className="h-10 w-10 rounded-full border-2 border-cyan-300"
                />
              </button>
              <div
                className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-20 transition-all duration-300 ease-in-out transform origin-top ${
                  isDropdownOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
                }`}
              >
                <div className="px-4 py-3 border-b text-gray-800 font-semibold">
                  {user.displayName || 'User'}
                </div>
                <Link
                  to="/"
                  className="block px-4 py-2 text-gray-700 hover:bg-cyan-100 transition-colors duration-200"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaHome className="inline mr-2" />
                  Home
                </Link>
                <Link
                  to="/available-camps"
                  className="block px-4 py-2 text-gray-700 hover:bg-cyan-100 transition-colors duration-200"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaCampground className="inline mr-2" />
                  Available Camps
                </Link>
                <Link
                  to={dashboard || '/'}
                  className="block px-4 py-2 text-gray-700 hover:bg-cyan-100 transition-colors duration-200"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 transition-colors duration-200"
                >
                  <FaSignOutAlt className="inline mr-2" />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center text-white text-base bg-cyan-600 px-4 py-2 rounded-full hover:bg-cyan-800 transition-colors duration-300"
            >
              <FaUserPlus className="mr-2" />
              Join Us
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;