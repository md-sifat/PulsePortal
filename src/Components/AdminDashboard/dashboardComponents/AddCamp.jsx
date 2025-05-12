import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const AddCamp = () => {
  const defaultDescription = 'Join us for an exciting camp experience!';
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      campName: '',
      image: '',
      campFees: '',
      dateTime: '',
      location: '',
      healthcareProfessional: '',
      participantCount: 0,
      description: defaultDescription,
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await fetch('https://pulse-portal-server.vercel.app/camps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          campFees: parseFloat(data.campFees), // Ensure number
          participantCount: 0, 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add camp');
      }

      const result = await response.json();
      toast.success('Camp added successfully!');
      reset(); 
    } catch (error) {
      console.error('Error adding camp:', error);
      toast.error('Failed to add camp. Please try again.');
    }
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 max-w-2xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Add A Camp</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Camp Name */}
        <div>
          <label className="block text-sm font-medium text-cyan-600 mb-1">
            Camp Name
          </label>
          <input
            type="text"
            {...register('campName', { required: 'Camp name is required' })}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Enter camp name"
          />
          {errors.campName && (
            <p className="mt-1 text-sm text-red-600">{errors.campName.message}</p>
          )}
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-cyan-600 mb-1">
            Image URL
          </label>
          <input
            type="text"
            {...register('image', {
              required: 'Image URL is required',
              validate: (value) =>
                isValidUrl(value) || 'Please enter a valid URL (e.g., https://example.com/image.jpg)',
            })}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Enter image URL"
          />
          {errors.image && (
            <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
          )}
        </div>

        {/* Camp Fees */}
        <div>
          <label className="block text-sm font-medium text-cyan-600 mb-1">
            Camp Fees ($)
          </label>
          <input
            type="number"
            step="0.01"
            {...register('campFees', {
              required: 'Camp fees are required',
              min: { value: 0, message: 'Fees cannot be negative' },
            })}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Enter camp fees"
          />
          {errors.campFees && (
            <p className="mt-1 text-sm text-red-600">{errors.campFees.message}</p>
          )}
        </div>

        {/* Date & Time */}
        <div>
          <label className="block text-sm font-medium text-cyan-600 mb-1">
            Date & Time
          </label>
          <input
            type="datetime-local"
            {...register('dateTime', {
              required: 'Date and time are required',
              validate: isFutureDate,
            })}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          {errors.dateTime && (
            <p className="mt-1 text-sm text-red-600">{errors.dateTime.message}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-cyan-600 mb-1">
            Location
          </label>
          <input
            type="text"
            {...register('location', { required: 'Location is required' })}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Enter location"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
          )}
        </div>

        {/* Healthcare Professional Name */}
        <div>
          <label className="block text-sm font-medium text-cyan-600 mb-1">
            Healthcare Professional Name
          </label>
          <input
            type="text"
            {...register('healthcareProfessional', {
              required: 'Healthcare professional name is required',
            })}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Enter healthcare professional name"
          />
          {errors.healthcareProfessional && (
            <p className="mt-1 text-sm text-red-600">{errors.healthcareProfessional.message}</p>
          )}
        </div>

        {/* Participant Count (Hidden) */}
        <input
          type="hidden"
          {...register('participantCount')}
          value={0}
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-cyan-600 mb-1">
            Description
          </label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            rows="4"
            placeholder="Enter camp description"
          ></textarea>
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className="bg-cyan-600 text-white px-6 py-2 rounded-md hover:bg-cyan-700 transition-colors duration-300"
          >
            Add Camp
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddCamp;