import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { authContext } from '../../AuthProvider/AuthProvider';
import { updateEmail } from 'firebase/auth';
import { auth } from '../../../firebase/firebase.init'

const ProfileC = () => {
  const { user } = useContext(authContext);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Fetch profile data on mount
  useEffect(() => {
    if (user?.uid) {
      const fetchProfile = async () => {
        try {
          const response = await fetch(`https://pulse-portal-server.vercel.app/users/${user.uid}`);
          if (!response.ok) throw new Error('Failed to fetch profile');
          const data = await response.json();
          const profileData = {
            name: data.name || 'Customer User',
            image: data.photoURL || 'https://via.placeholder.com/150',
            email: data.email || user.email,
            phone: data.phone || '',
          };
          setProfile(profileData);
          reset(profileData);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching profile:', error);
          toast.error('Failed to load profile. Please try again.');
          const defaultProfile = {
            name: 'Customer User',
            image: 'https://via.placeholder.com/150',
            email: user.email,
            phone: '',
          };
          setProfile(defaultProfile);
          reset(defaultProfile);
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [user, reset]);

  // Validate URL format
  const isValidUrl = (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  // Validate email format
  const isValidEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || 'Please enter a valid email address';
  };

  // Validate phone number format (optional)
  const isValidPhone = (value) => {
    if (!value) return true; // Phone is optional
    const phoneRegex = /^\+?\d{10,15}$/;
    return phoneRegex.test(value) || 'Please enter a valid phone number (e.g., +1234567890)';
  };

  // Handle form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Update Firebase email if changed
      if (data.email !== user.email) {
        try {
          await updateEmail(auth.currentUser, data.email);
        } catch (firebaseError) {
          throw new Error('Failed to update email in Firebase. You may need to re-authenticate.');
        }
      }

      // Update profile in database
      const response = await fetch(`https://pulse-portal-server.vercel.app/users/${user.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          image: data.photoURL,
          email: data.email,
          phone: data.phone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      setProfile({
        name: data.name,
        image: data.photoURL,
        email: data.email,
        phone: data.phone,
      });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle edit mode
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    reset({
      name: profile.name,
      image: profile.photoURL,
      email: profile.email,
      phone: profile.phone,
    });
  };

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
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 max-w-2xl mx-auto my-8"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Customer Profile</h2>

      {!isEditing ? (
        <div className="space-y-6">
          <div className="flex justify-center">
            <img
              src={profile.image}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
              onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
            />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">{profile.name}</h3>
            <p className="text-gray-600">
              <span className="font-medium">Email:</span> {profile.email}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Phone:</span> {profile.phone || 'Not provided'}
            </p>
          </div>
          <div className="text-center">
            <button
              onClick={handleEdit}
              className="bg-cyan-600 text-white px-6 py-2 rounded-md hover:bg-cyan-700 transition-colors duration-300"
            >
              Update Profile
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-cyan-600 mb-1">Name</label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Enter your name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-cyan-600 mb-1">Profile Image URL</label>
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
            {profile.image && isValidUrl(profile.image) && (
              <img
                src={profile.image}
                alt="Preview"
                className="mt-2 w-24 h-24 rounded-md object-cover"
                onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
              />
            )}
          </div>

          {/* Contact Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Contact Details</h3>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-cyan-600 mb-1">Email</label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  validate: isValidEmail,
                })}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-cyan-600 mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="text"
                {...register('phone', {
                  validate: isValidPhone,
                })}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter phone number (e.g., +1234567890)"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
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
              onClick={handleCancel}
              className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
};

export default ProfileC;