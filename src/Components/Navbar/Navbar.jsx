import React, { useContext, useEffect, useState } from 'react';
import { authContext } from '../AuthProvider/AuthProvider';
import logo from '../../assets/logo.webp';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase.init';
import { FaHome, FaCampground, FaUserPlus, FaSignOutAlt, FaSearch } from 'react-icons/fa';

const Navbar = () => {
  const { user, setUser, dashboard, setDashboard } = useContext(authContext);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);

  useEffect(() => {
    if (user) {
      console.log('User email:', user.email);
      setDashboard(user.email === "admin@gmail.com" ? '/admin-dashboard' : '/customer-dashboard');
    }
  }, [user, setDashboard]);

  useEffect(() => {
    const fetchCamps = async () => {
      if (searchQuery.trim() === '') {
        setSearchResults([]);
        setIsSearchDropdownOpen(false);
        return;
      }
      try {
        const response = await fetch('https://pulse-portal-server.vercel.app/camps');
        const camps = await response.json();
        console.log('Fetched camps:', camps);
        const filteredCamps = camps.filter(camp =>
          camp.campName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          camp.location.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filteredCamps);
        setIsSearchDropdownOpen(true);
      } catch (error) {
        console.error('Error fetching camps:', error);
        toast.error('Failed to fetch camps');
      }
    };
    const debounce = setTimeout(fetchCamps, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  console.log('Dashboard:', dashboard);

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

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCampSelect = (campId) => {
    console.log('Camp selected with ID:', campId);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchDropdownOpen(false);
    navigate(`/available-camps/${campId}`);
  };

  return (
    <div className="w-full px-6 bg-gradient-to-r from-cyan-700 to-cyan-800 min-h-[12vh] rounded-b-2xl shadow-lg">
      <ToastContainer />
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo and Website Name */}
        <Link to="/" className="flex items-center space-x-2 sm:space-x-6">
          <img src={logo} alt="Logo" className="h-14 w-14 rounded-full" />
          <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Pulse Portal</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6 lg:space-x-10">
          <div className="relative">
            <div className="flex items-center bg-white rounded-full px-3 py-2">
              <FaSearch className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search camps..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                className="bg-transparent text-gray-800 focus:outline-none w-40 lg:w-64"
              />
            </div>
            {isSearchDropdownOpen && searchResults.length > 0 && (
              <div
                className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-20 max-h-96 overflow-y-auto"
                role="listbox"
              >
                {searchResults.map((camp) => (
                  <div
                    key={camp._id}
                    onClick={() => handleCampSelect(camp._id)}
                    className="px-4 py-3 border-b last:border-b-0 text-gray-700 hover:bg-cyan-100 cursor-pointer transition-colors duration-200"
                    role="option"
                    aria-selected="false"
                  >
                    <div className="font-semibold">{camp.campName}</div>
                    <div className="text-sm">Price: ${camp.campFees}</div>
                    <div className="text-sm">Participants: {camp.participantCount}</div>
                    <div className="text-sm">Location: {camp.location}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
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