import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { authContext } from '../../AuthProvider/AuthProvider';

const ManageCamp = () => {
  const { user } = useContext(authContext);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCamp, setEditingCamp] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const response = await fetch('https://pulse-portal-server.vercel.app/camps');
        if (!response.ok) throw new Error('Failed to fetch camps');
        const data = await response.json();
        setCamps(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching camps:', error);
        toast.error('Failed to load camps.');
        setLoading(false);
      }
    };
    fetchCamps();
  }, []);

  const isValidUrl = (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const isFutureDate = (value) => {
    const selectedDate = new Date(value);
    const now = new Date();
    return selectedDate > now || 'Date and time must be in the future';
  };

  const handleUpdate = (camp) => {
    setEditingCamp(camp);
    reset({
      campName: camp.campName,
      image: camp.image,
      campFees: camp.campFees,
      dateTime: new Date(camp.dateTime).toISOString().slice(0, 16),
      location: camp.location,
      healthcareProfessional: camp.healthcareProfessional,
      description: camp.description,
    });
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`https://pulse-portal-server.vercel.app/update-camp/${editingCamp._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campName: data.campName,
          image: data.image,
          campFees: parseFloat(data.campFees),
          dateTime: data.dateTime,
          location: data.location,
          healthcareProfessional: data.healthcareProfessional,
          description: data.description,
          participantCount: editingCamp.participantCount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update camp');
      }

      const result = await response.json();
      console.log('Update API Result:', result);

      const campResponse = await fetch(`https://pulse-portal-server.vercel.app/camps/${editingCamp._id}`);
      if (!campResponse.ok) throw new Error('Failed to fetch updated camp');
      const updatedCamp = await campResponse.json();

      const updatedCampData = {
        _id: editingCamp._id,
        campName: updatedCamp.campName || data.campName,
        image: updatedCamp.image || data.image,
        campFees: updatedCamp.campFees || parseFloat(data.campFees),
        dateTime: updatedCamp.dateTime || data.dateTime,
        location: updatedCamp.location || data.location,
        healthcareProfessional: updatedCamp.healthcareProfessional || data.healthcareProfessional,
        description: updatedCamp.description || data.description,
        participantCount: updatedCamp.participantCount || editingCamp.participantCount,
      };

      setCamps(camps.map((camp) => (camp._id === editingCamp._id ? updatedCampData : camp)));
      setEditingCamp(null);
      reset();
      toast.success('Camp updated successfully!');
    } catch (error) {
      console.error('Error updating camp:', error.message, error);
      toast.error(`Failed to update camp: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (campId) => {
    if (!window.confirm('Are you sure you want to delete this camp?')) return;
    try {
      const response = await fetch(`https://pulse-portal-server.vercel.app/delete-camp/${campId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete camp');
      setCamps(camps.filter((camp) => camp._id !== campId));
      toast.success('Camp deleted successfully!');
    } catch (error) {
      console.error('Error deleting camp:', error);
      toast.error('Failed to delete camp.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-start mt-4 text-3xl justify-center ">Loading camps...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 max-w-4xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Manage Camps</h2>

      {!editingCamp ? (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left text-sm font-medium text-gray-700">Camp Name</th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">Date & Time</th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">Location</th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">Healthcare Professional</th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {camps.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-3 text-center text-gray-600">No camps found.</td>
                </tr>
              ) : (
                camps.map((camp) => (
                  <tr key={camp._id} className="border-b border-gray-200">
                    <td className="p-3 text-gray-800">{camp.campName || 'N/A'}</td>
                    <td className="p-3 text-gray-800">
                      {camp.dateTime ? new Date(camp.dateTime).toLocaleString() : 'N/A'}
                    </td>
                    <td className="p-3 text-gray-800">{camp.location || 'N/A'}</td>
                    <td className="p-3 text-gray-800">{camp.healthcareProfessional || 'N/A'}</td>
                    <td className="p-3 flex space-x-2">
                      <button
                        onClick={() => handleUpdate(camp)}
                        className="bg-cyan-600 text-white px-3 py-1 rounded-md hover:bg-cyan-700"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(camp._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-cyan-600 mb-1">Camp Name</label>
            <input
              type="text"
              {...register('campName', { required: 'Camp name is required' })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500"
            />
            {errors.campName && <p className="mt-1 text-sm text-red-600">{errors.campName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-600 mb-1">Image URL</label>
            <input
              type="text"
              {...register('image', {
                required: 'Image URL is required',
                validate: (value) => isValidUrl(value) || 'Please enter a valid URL',
              })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500"
            />
            {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-600 mb-1">Camp Fees ($)</label>
            <input
              type="number"
              step="0.01"
              {...register('campFees', {
                required: 'Camp fees are required',
                min: { value: 0, message: 'Fees cannot be negative' },
              })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500"
            />
            {errors.campFees && <p className="mt-1 text-sm text-red-600">{errors.campFees.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-600 mb-1">Date & Time</label>
            <input
              type="datetime-local"
              {...register('dateTime', {
                required: 'Date and time are required',
                validate: isFutureDate,
              })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500"
            />
            {errors.dateTime && <p className="mt-1 text-sm text-red-600">{errors.dateTime.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-600 mb-1">Location</label>
            <input
              type="text"
              {...register('location', { required: 'Location is required' })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500"
            />
            {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-600 mb-1">Healthcare Professional</label>
            <input
              type="text"
              {...register('healthcareProfessional', { required: 'Healthcare professional is required' })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500"
            />
            {errors.healthcareProfessional && (
              <p className="mt-1 text-sm text-red-600">{errors.healthcareProfessional.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-600 mb-1">Description</label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500"
              rows="4"
            ></textarea>
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>

          <div className="flex justify-center space-x-4">
            <button
              type="submit"
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
                'Save'
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingCamp(null);
                reset();
              }}
              className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
};

export default ManageCamp;