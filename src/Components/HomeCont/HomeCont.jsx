import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import Slider from 'react-slick';
import { authContext } from '../AuthProvider/AuthProvider';
import { FaHospital, FaUsers, FaHandsHelping, FaHeartbeat } from 'react-icons/fa';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Success stories for the slider
const successStories = [
    {
        title: 'Community Health Triumph',
        description: 'Over 500 residents received free screenings at our 2024 camp.',
        image: 'https://i.ibb.co/ZpWDHrTM/istockphoto-486596345-612x612.jpg',
    },
    {
        title: 'Empowering Rural Care',
        description: 'Trained 50+ local volunteers to support ongoing health initiatives.',
        image: 'https://images.unsplash.com/photo-1580281658626-ee379f3cce93?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
    },
    {
        title: 'Life-Saving Interventions',
        description: 'Identified critical cases, saving lives through timely referrals.',
        image: 'https://images.unsplash.com/photo-1576765607924-3a7bd1c73d84?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
    },
];

const HomeCont = () => {
    const { user } = useContext(authContext);
    const { campId } = useParams();
    const navigate = useNavigate();
    const [camps, setCamps] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm();

    // Fetch camps and feedbacks
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch camps
                const campsResponse = await fetch('https://pulse-portal-server.vercel.app/camps');
                if (!campsResponse.ok) throw new Error('Failed to fetch camps');
                const campsData = await campsResponse.json();
                // Sort by participant count and take top 6
                const sortedCamps = campsData
                    .sort((a, b) => b.participantCount - a.participantCount)
                    .slice(0, 6);
                setCamps(sortedCamps);

                // Fetch feedbacks
                const feedbackResponse = await fetch('https://pulse-portal-server.vercel.app/feedbacks');
                if (!feedbackResponse.ok) throw new Error('Failed to fetch feedbacks');
                const feedbackData = await feedbackResponse.json();
                setFeedbacks(feedbackData);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load data.');
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Slider settings
    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true,
    };

    // Handle Join Camp submission
    const onSubmit = async (data) => {
        if (!user) {
            toast.error('Please log in to join a camp.');
            navigate('/login');
            return;
        }

        setIsSubmitting(true);
        try {
            const camp = camps.find((c) => c._id === campId) || (await fetchCamp(campId));
            // Post registration
            const regResponse = await fetch('https://pulse-portal-server.vercel.app/reg_camps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campId,
                    campName: camp.campName,
                    userId: user.uid,
                    userEmail: user.email,
                    participantName: user.displayName || data.participantName,
                    campFees: camp.campFees,
                    location: camp.location,
                    healthcareProfessional: camp.healthcareProfessional,
                    age: parseInt(data.age),
                    phone: data.phone,
                    gender: data.gender,
                    emergencyContact: data.emergencyContact,
                }),
            });

            if (!regResponse.ok) throw new Error('Failed to register for camp');

            // Update participant count
            const updateResponse = await fetch(`https://pulse-portal-server.vercel.app/camps/${campId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ participantCount: camp.participantCount + 1 }),
            });

            if (!updateResponse.ok) throw new Error('Failed to update participant count');

            setCamps((prev) =>
                prev.map((c) =>
                    c._id === campId ? { ...c, participantCount: c.participantCount + 1 } : c
                )
            );
            setIsModalOpen(false);
            reset();
            toast.success('Successfully registered for the camp!');
        } catch (error) {
            console.error('Error registering for camp:', error);
            toast.error(`Failed to register: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Fetch single camp for details page
    const fetchCamp = async (id) => {
        const response = await fetch(`https://pulse-portal-server.vercel.app/camps/${id}`);
        if (!response.ok) throw new Error('Failed to fetch camp');
        return await response.json();
    };

    // Render star ratings
    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <svg
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ));
    };

    // Camp Details Page
    if (campId) {
        const camp = camps.find((c) => c._id === campId);
        if (!camp && !loading) {
            return (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="min-h-screen flex items-center justify-center bg-gray-200"
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
                className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 max-w-2xl mx-auto my-8"
            >
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{camp?.campName}</h2>
                <div className="space-y-4">
                    <img
                        src={camp?.image}
                        alt={camp?.campName}
                        className="w-full h-48 object-cover rounded-md"
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
                    />
                    <p className="text-gray-600">
                        <span className="font-medium">Camp Fees:</span> ${camp?.campFees?.toFixed(2) || '0.00'}
                    </p>
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
                        <span className="font-medium">Description:</span> {camp?.description || 'N/A'}
                    </p>
                    <div className="text-center">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-md hover:from-cyan-600 hover:to-blue-600 transition-all duration-300"
                        >
                            Join Camp
                        </button>
                    </div>
                </div>

                {/* Registration Modal */}
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-lg p-6 max-w-lg w-full mx-4"
                        >
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Join Camp</h3>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-cyan-600">Camp Name</label>
                                    <input
                                        type="text"
                                        value={camp?.campName}
                                        readOnly
                                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-cyan-600">Camp Fees</label>
                                    <input
                                        type="text"
                                        value={`$${camp?.campFees?.toFixed(2)}`}
                                        readOnly
                                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-cyan-600">Location</label>
                                    <input
                                        type="text"
                                        value={camp?.location}
                                        readOnly
                                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-cyan-600">Healthcare Professional</label>
                                    <input
                                        type="text"
                                        value={camp?.healthcareProfessional}
                                        readOnly
                                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-cyan-600">Participant Name</label>
                                    <input
                                        type="text"
                                        value={user?.displayName || ''}
                                        readOnly
                                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-cyan-600">Participant Email</label>
                                    <input
                                        type="email"
                                        value={user?.email}
                                        readOnly
                                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-cyan-600">Age</label>
                                    <input
                                        type="number"
                                        {...register('age', {
                                            required: 'Age is required',
                                            min: { value: 1, message: 'Age must be at least 1' },
                                        })}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500"
                                    />
                                    {errors.age && (
                                        <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-cyan-600">Phone Number</label>
                                    <input
                                        type="text"
                                        {...register('phone', {
                                            required: 'Phone number is required',
                                            pattern: {
                                                value: /^\+?\d{10,15}$/,
                                                message: 'Enter a valid phone number (e.g., +1234567890)',
                                            },
                                        })}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500"
                                    />
                                    {errors.phone && (
                                        <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-cyan-600">Gender</label>
                                    <select
                                        {...register('gender', { required: 'Gender is required' })}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.gender && (
                                        <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-cyan-600">Emergency Contact</label>
                                    <input
                                        type="text"
                                        {...register('emergencyContact', {
                                            required: 'Emergency contact is required',
                                            pattern: {
                                                value: /^\+?\d{10,15}$/,
                                                message: 'Enter a valid phone number (e.g., +1234567890)',
                                            },
                                        })}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500"
                                    />
                                    {errors.emergencyContact && (
                                        <p className="mt-1 text-sm text-red-600">{errors.emergencyContact.message}</p>
                                    )}
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-md hover:from-cyan-600 hover:to-blue-600 flex items-center ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
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
                                            'Register'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </motion.div>
        );
    }

    // Home Page
    return (
        <div className="w-full min-h-[100vh] max-h-max flex flex-col bg-gray-200">
            {/* Banner Section */}
            <section className="relative mt-16 mx-auto w-[85%] rounded-3xl shadow-2xl overflow-hidden bg-white">
                <Slider {...sliderSettings}>
                    {successStories.map((story, index) => (
                        <div key={index} className="relative h-[500px] rounded-3xl overflow-hidden shadow-lg">
                            {/* Background Image */}
                            <img
                                src={story.image}
                                alt={story.title}
                                className="w-full h-full object-cover rounded-3xl"
                            />

                            {/* Overlay with reduced opacity */}
                            <div className="absolute inset-0 bg-black/40 z-10 rounded-3xl" />

                            {/* Text content */}
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className="text-center px-4"
                                >
                                    <h2 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-3">
                                        {story.title}
                                    </h2>
                                    <p className="text-lg md:text-xl text-gray-100 max-w-xl mx-auto drop-shadow-md">
                                        {story.description}
                                    </p>
                                </motion.div>
                            </div>
                        </div>
                    ))}
                </Slider>
            </section>


            {/* Popular Medical Camps */}
            <section className="py-12 px-4">
                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl font-bold text-gray-800 text-center mb-8"
                >
                    Popular Medical Camps
                </motion.h2>
                {loading ? (
                    <div className="flex justify-center">
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
                    </div>
                ) : camps.length === 0 ? (
                    <p className="text-center text-gray-600">No popular camps available.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        {camps.map((camp) => (
                            <motion.div
                                key={camp._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 hover:shadow-lg transition-shadow duration-300"
                            >
                                <img
                                    src={camp.image}
                                    alt={camp.campName}
                                    className="w-full h-40 object-cover rounded-md mb-4"
                                    onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
                                />
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">{camp.campName}</h3>
                                <p className="text-gray-600 mb-1">
                                    <span className="font-medium">Fees:</span> ${camp.campFees?.toFixed(2) || '0.00'}
                                </p>
                                <p className="text-gray-600 mb-1">
                                    <span className="font-medium">Date & Time:</span>{' '}
                                    {camp.dateTime ? new Date(camp.dateTime).toLocaleString() : 'N/A'}
                                </p>
                                <p className="text-gray-600 mb-1">
                                    <span className="font-medium">Location:</span> {camp.location || 'N/A'}
                                </p>
                                <p className="text-gray-600 mb-1">
                                    <span className="font-medium">Professional:</span>{' '}
                                    {camp.healthcareProfessional || 'N/A'}
                                </p>
                                <p className="text-gray-600 mb-4">
                                    <span className="font-medium">Participants:</span> {camp.participantCount || 0}
                                </p>
                                <div className="text-center">
                                    <Link
                                        to={`/camp-details/${camp._id}`}
                                        className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-md hover:from-cyan-600 hover:to-blue-600 transition-all duration-300"
                                    >
                                        Details
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
                <div className="text-center mt-8">
                    <Link
                        to="/available-camps"
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-md hover:from-cyan-600 hover:to-blue-600 transition-all duration-300"
                    >
                        See All Camps
                    </Link>
                </div>
            </section>

            {/* Feedback and Ratings */}
            <section className="py-12 px-4 bg-gray-100">
                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl font-bold text-gray-800 text-center mb-8"
                >
                    Participant Feedback
                </motion.h2>
                {loading ? (
                    <div className="flex justify-center">
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
                    </div>
                ) : feedbacks.length === 0 ? (
                    <p className="text-center text-gray-600">No feedback available.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        {feedbacks.slice(0, 6).map((feedback) => (
                            <motion.div
                                key={feedback._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200"
                            >
                                <div className="flex items-center mb-2">{renderStars(feedback.rating)}</div>
                                <p className="text-gray-600 mb-2 line-clamp-3">{feedback.feedback}</p>
                                <p className="text-sm text-gray-500">
                                    - {feedback.userEmail.split('@')[0]} (Participant)
                                </p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {/* Our Mission Section */}
            <section className="py-16 px-4 bg-gradient-to-r from-cyan-50 to-blue-50">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-7xl mx-auto text-center"
                >
                    <img
                        src="https://via.placeholder.com/150?text=Medical+Logo"
                        alt="Medical Logo"
                        className="w-24 h-24 mx-auto mb-6 rounded-full border-2 border-cyan-500"
                    />
                    <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Mission</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
                        We are committed to transforming healthcare access by connecting communities with
                        life-changing medical camps. Our platform empowers organizers, engages participants, and
                        delivers measurable health impacts worldwide.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: <FaHospital className="w-12 h-12 text-cyan-500" />,
                                title: 'Accessibility',
                                description: 'Making medical camps available to underserved and remote communities.',
                            },
                            {
                                icon: <FaUsers className="w-12 h-12 text-cyan-500" />,
                                title: 'Community',
                                description: 'Fostering strong community bonds through collaborative health initiatives.',
                            },
                            {
                                icon: <FaHandsHelping className="w-12 h-12 text-cyan-500" />,
                                title: 'Empowerment',
                                description: 'Educating and training participants and organizers for sustainable impact.',
                            },
                            {
                                icon: <FaHeartbeat className="w-12 h-12 text-cyan-500" />,
                                title: 'Health Impact',
                                description: 'Delivering measurable improvements in community health outcomes.',
                            },
                        ].map((category, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="flex justify-center mb-4">{category.icon}</div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{category.title}</h3>
                                <p className="text-gray-600">{category.description}</p>
                            </motion.div>
                        ))}
                    </div>
                    <div className="mt-12">
                        <Link
                            to="/available-camps"
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-md hover:from-cyan-600 hover:to-blue-600 transition-all duration-300"
                        >
                            Join a Camp Today
                        </Link>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default HomeCont;