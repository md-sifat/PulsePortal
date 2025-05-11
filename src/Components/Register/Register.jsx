import { useContext, useState } from "react";
import { ImGoogle } from "react-icons/im";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { authContext } from "../AuthProvider/AuthProvider";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { updateProfile, getIdToken } from "firebase/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase/firebase.init";

const Register = () => {
    const { createUser , user, setUser, loading, setLoading, dashboard, setDashboard } =
        useContext(authContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [photoURL, setPhotoURL] = useState("");
    const [role, setRole] = useState("customer"); 
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const provider = new GoogleAuthProvider();

    // Function to post user data to API
    const postUserData = async (user, userData) => {
        try {
            const idToken = await getIdToken(user);

            const response = await fetch("https://pulse-portal-server.vercel.app/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) throw new Error("Failed to save user data");

            const savedData = await response.json();
            setUser(savedData);
            setDashboard(userData.role === "admin" ? "/admin-dashboard" : "/customer-dashboard");

            return savedData;
        } catch (err) {
            console.error("Error posting user data:", err);
            throw new Error("Failed to save user data");
        }
    };

    // Handle Google registration (auto customer role)

    const handleGoogleRegister = () => {
        signInWithPopup(auth, provider)
            .then((res) => {
                const user = res.user;
                const userData = {
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName || "Google User",
                    photoURL: user.photoURL || "",
                    role: "customer",
                };

                postUserData(user, userData);
                setDashboard("/customer-dashboard");
                toast.success("Google Registration successful!");
                navigate("/login");


            })
            .catch((error) => {
                toast.error("Registration failed!");
            });
    };

    // Handle email/password registration
    const handleRegister = async (event) => {
        event.preventDefault();
        setError("");

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
        if (!passwordRegex.test(password)) {
            setError("Password must be at least 6 characters with one uppercase and one lowercase letter.");
            toast.error("Invalid password!");
            return;
        }

        try {
            const result = await createUser(email, password);
            const user = result.user;
            await updateProfile(user, { displayName: name, photoURL });

            const userData = {
                uid: user.uid,
                email,
                name,
                photoURL: photoURL || "",
                role,
            };

            await postUserData(user, userData);

            toast.success("Registration successful!");
            navigate("/login");
        } catch (err) {
            setError(err.message);
            toast.error("Registration failed!");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create Your Account</h2>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
                        {error}
                    </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            required
                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="photoURL" className="block text-sm font-medium text-gray-700">
                            Profile Image URL
                        </label>
                        <input
                            type="text"
                            id="photoURL"
                            value={photoURL}
                            onChange={(e) => setPhotoURL(e.target.value)}
                            placeholder="Enter your image URL"
                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                            Role
                        </label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        >
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                        Register
                    </button>
                </form>

                {/* Google Registration */}
                <div className="mt-6">
                    <button
                        onClick={handleGoogleRegister}
                        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
                    >
                        <ImGoogle className="text-red-500" />
                        Register with Google
                    </button>
                </div>

                {/* Login Link and Button */}
                <div className="mt-4 text-center">
                    <p className="text-gray-600">
                        Already have an account?{" "}
                        <Link to="/login" className="text-blue-600 hover:underline">
                            Log In
                        </Link>
                    </p>
                    <Link to="/login">
                        <button
                            className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                        >
                            Log In
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;