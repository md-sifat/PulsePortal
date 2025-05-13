import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTwitter, FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import logo from '../../assets/logo.webp'

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12 px-4"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* About Section */}
        <div className="space-y-4">
          <img
            src={logo}
            alt="Pulse Portal Logo"
            className="w-24 h-24 rounded-full border-2 border-cyan-500"
          />
          <h3 className="text-xl font-semibold">Pulse Portal</h3>
          <p className="text-gray-300 text-sm">
            Connecting communities with accessible medical camps to improve health outcomes and
            empower wellness.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/"
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/available-camps"
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300"
              >
                Available Camps
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300"
              >
                Join Us
              </Link>
            </li>
           
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <span className="font-medium">Email:</span>{' '}
              <a
                href="mailto:support@pulseportal.com"
                className="hover:text-cyan-400 transition-colors duration-300"
              >
                support@pulseportal.com
              </a>
            </li>
            <li>
              <span className="font-medium">Phone:</span>{' '}
              <a
                href="tel:+18005551234"
                className="hover:text-cyan-400 transition-colors duration-300"
              >
                +1-800-555-1234
              </a>
            </li>
            <li>
              <span className="font-medium">Address:</span> 123 Health St, Wellness City, USA
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-cyan-400 transition-colors duration-300"
            >
              <FaTwitter className="w-6 h-6" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-cyan-400 transition-colors duration-300"
            >
              <FaFacebookF className="w-6 h-6" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-cyan-400 transition-colors duration-300"
            >
              <FaInstagram className="w-6 h-6" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-cyan-400 transition-colors duration-300"
            >
              <FaLinkedinIn className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm text-gray-300">
        &copy; {new Date().getFullYear()} Pulse Portal. All rights reserved.
      </div>
    </motion.footer>
  );
};

export default Footer;