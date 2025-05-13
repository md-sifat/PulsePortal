import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../../firebase/firebase.init";

export const authContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserdata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [camps, setCamps] = useState([]);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    fetch("https://pulse-portal-server.vercel.app/camps")
      .then((res) => res.json())
      .then((data) => setCamps(data))
      .catch((error) => console.error("Error fetching camps:", error));
  }, []);

  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const loginUser = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const SignOut = () => {
    setLoading(true);
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const authData = {
    user,
    createUser,
    loginUser,
    SignOut,
    loading,
    setLoading,
    setUser,
    camps,
    setCamps,
    setDashboard,
    dashboard,
    userData,
    setUserdata,
  };

  return (
    <authContext.Provider value={authData}>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <svg
            className="animate-spin h-16 w-16 text-cyan-600"  
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      ) : (
        children
      )}


    </authContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
