import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { authContext } from '../AuthProvider/AuthProvider';

const AvailableCamps = () => {
  const { user } = useContext(authContext);
  const { campId } = useParams();
  const navigate = useNavigate();
  const [camps, setCamps] = useState([]);
  const [filteredCamps, setFilteredCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isThreeColumn, setIsThreeColumn] = useState(true);
  const [sortOption, setSortOption] = useState('default');
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const response = await fetch('https://pulse-portal-server.vercel.app/camps');
        if (!response.ok) throw new Error('Failed to fetch camps');
        const data = await response.json();
        setCamps(data);
        setFilteredCamps(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching camps:', error);
        toast.error('Failed to load camps.');
        setLoading(false);
      }
    };
    fetchCamps();
  }, []);

  const onSearch = (data) => {
    const keyword = data.keyword?.toLowerCase() || '';
    const filtered = camps.filter(
      (camp) =>
        camp.campName.toLowerCase().includes(keyword) ||
        camp.location.toLowerCase().includes(keyword) ||
        camp.description.toLowerCase().includes(keyword)
    );
    setFilteredCamps(filtered);
    reset();
  };

  const handleSort = (option) => {
    setSortOption(option);
    let sorted = [...filteredCamps];
    if (option === 'most-registered') {
      sorted.sort((a, b) => b.participantCount - a.participantCount);
    } else if (option === 'camp-fees') {
      sorted.sort((a, b) => a.campFees - b.campFees);
    } else if (option === 'alphabetical') {
      sorted.sort((a, b) => a.campName.localeCompare(b.campName));
    }
    setFilteredCamps(sorted);
  };

  const toggleLayout = () => {
    setIsThreeColumn(!isThreeColumn);
  };

  const handleJoinCamp = async (camp) => {
    if (!user) {
      toast.error('Please log in to join a camp.');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      // Register the user for the camp
      const registrationResponse = await fetch('https://pulse-portal-server.vercel.app/reg_camps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campId: camp._id,
          campName: camp.campName,
          userId: user.uid,
          userEmail: user.email,
          dateTime: camp.dateTime,
          location: camp.location,
          healthcareProfessional: camp.healthcareProfessional,
          campFees: camp.campFees,
          status: 'Unpaid',
          registrationDate: new Date().toISOString(),
        }),
      });

      if (!registrationResponse.ok) throw new Error('Failed to register for camp');
      const registrationResult = await registrationResponse.json();
      console.log('Registration Result:', registrationResult);

      // Update participant count in the database
      const updateResponse = await fetch(`https://pulse-portal-server.vercel.app/update-camp/${camp._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantCount: camp.participantCount + 1,
        }),
      });

      if (!updateResponse.ok) throw new Error('Failed to update participant count');
      const updateResult = await updateResponse.json();
      console.log('Update Participant Count Result:', updateResult);

      // Update local state
      setCamps((prevCamps) =>
        prevCamps.map((c) =>
          c._id === camp._id ? { ...c, participantCount: c.participantCount + 1 } : c
        )
      );
      setFilteredCamps((prevCamps) =>
        prevCamps.map((c) =>
          c._id === camp._id ? { ...c, participantCount: c.participantCount + 1 } : c
        )
      );

      toast.success('Successfully registered for the camp!');
      navigate('/available-camps');
    } catch (error) {
      console.error('Error registering for camp:', error);
      toast.error(`Failed to register: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (campId) {
    const camp = camps.find((camp) => camp._id === campId);
    if (!camp && !loading) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen flex items-center justify-center bg-gray-100"
        >
          <p className="text-gray-600">Camp not found.</p>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-gray-100 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200 w-full max-w-4xl">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <img
                src={camp?.image}
                alt={camp?.campName}
                className="w-full h-64 object-cover rounded-md mb-4"
                onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">{camp?.campName}</h2>
              <div className="space-y-3">
                <p className="text-gray-600">
                  <span className="font-medium">Date & Time:</span>{' '}
                  {camp?.dateTime ? new Date(camp.dateTime).toLocaleString() : 'N/A'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Location:</span> {camp?.location || 'N/A'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Healthcare Professional:</span>{' '}
                  {camp?.healthcareProfessional || 'N/A'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Participant Count:</span> {camp?.participantCount || 0}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Camp Fees:</span> ${camp?.campFees?.toFixed(2) || '0.00'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Status:</span> Unpaid
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Description:</span> {camp?.description || 'N/A'}
                </p>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => handleJoinCamp(camp)}
                  disabled={isSubmitting}
                  className={`bg-cyan-600 text-white px-6 py-2 rounded-md hover:bg-cyan-700 flex items-center justify-center ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
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
                  ) : (
                    'Join Camp'
                  )}
                </button>
                <Link
                  to="/available-camps"
                  className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
                >
                  Back to Camps
                </Link>
              </div>
            </div>
          </div>
        </div>
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Available Camps</h2>

      {/* Search Bar */}
      <form onSubmit={handleSubmit(onSearch)} className="mb-6 flex justify-center">
        <div className="flex w-full max-w-md">
          <input
            type="text"
            {...register('keyword')}
            placeholder="Search camps by name, location, or description"
            className="w-full p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            type="submit"
            className="bg-cyan-600 text-white px-4 py-2 rounded-r-md hover:bg-cyan-700"
          >
            Search
          </button>
        </div>
      </form>

      {/* Sort and Layout Controls */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
          <select
            value={sortOption}
            onChange={(e) => handleSort(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500"
          >
            <option value="default">Default</option>
            <option value="most-registered">Most Registered</option>
            <option value="camp-fees">Camp Fees</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
        <button
          onClick={toggleLayout}
          className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700"
        >
          {isThreeColumn ? 'Switch to 2 Columns' : 'Switch to 3 Columns'}
        </button>
      </div>

      {/* Camp Cards */}
      {filteredCamps.length === 0 ? (
        <p className="text-center text-gray-600">No camps found.</p>
      ) : (
        <div
          className={`grid gap-6 ${
            isThreeColumn ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'
          }`}
        >
          {filteredCamps.map((camp) => (
            <motion.div
              key={camp._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200"
            >
              <img
                src={camp.image}
                alt={camp.campName}
                className="w-full h-40 object-cover rounded-md mb-4"
                onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
              />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{camp.campName}</h3>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Date & Time:</span>{' '}
                {camp.dateTime ? new Date(camp.dateTime).toLocaleString() : 'N/A'}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Location:</span> {camp.location || 'N/A'}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Healthcare Professional:</span>{' '}
                {camp.healthcareProfessional || 'N/A'}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Participants:</span> {camp.participantCount || 0}
              </p>
              <p className="text-gray-600 mb-4 line-clamp-2">
                <span className="font-medium">Description:</span> {camp.description || 'N/A'}
              </p>
              <div className="text-center">
                <Link
                  to={`/available-camps/${camp._id}`}
                  className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700"
                >
                  Details
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AvailableCamps;