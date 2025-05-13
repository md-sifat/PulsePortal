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
      {loading ? <div className="text-center p-10">Loading...</div> : children}
    </authContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
