import { useContext, useState } from "react";
import { ImGoogle } from "react-icons/im";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { authContext } from "../AuthProvider/AuthProvider";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { getIdToken } from "firebase/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase/firebase.init";

const Login = () => {
    const { loginUser, user, setUser, loading, setLoading, dashboard, setDashboard } =
        useContext(authContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [role, setRole] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const provider = new GoogleAuthProvider();

    const fetchAndUpdateUser = async (user) => {
        try {
            const idToken = await getIdToken(user);

            const response = await fetch(`https://pulse-portal-server.vercel.app/users/${user.uid}`, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });

            if (!response.ok) throw new Error("Failed to fetch user data");

            const userData = await response.json();
            console.log(userData);
            setUser(userData);
            setRole(userData.role || "customer");

            setDashboard(user.role === "admin" ? "/admin-dashboard" : "/customer-dashboard");

            navigate("/");
        } catch (err) {
            console.error("Error fetching user data:", err);
            setError("Failed to fetch user data");
            setDashboard("/customer-dashboard");
            navigate("/");
        }
    };

    const handleGoogleLogin = async () => {
        setIsSubmitting(true);
        try {
            const res = await signInWithPopup(auth, provider);
            const user = res.user;

            toast.success("Google Registration successful!");
            setUser(user);
            setRole("customer");

            setDashboard("/customer-dashboard");

            toast.success("Google Login successful!");
            navigate("/");
        } catch (error) {
            toast.error("Registration failed!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError("");
        try {
            const result = await loginUser(email, password);
            const user = result.user;
            await fetchAndUpdateUser(user);

            toast.success("Login successful!");
        } catch (err) {
            setError(err.message);
            toast.error("Login failed!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100 relative">
            {isSubmitting && (
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
                    <svg
                        className="animate-spin h-16 w-16 text-blue-600"
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
            )}

            <div className={`${isSubmitting ? "opacity-50" : "opacity-100"} transition duration-300 w-full max-w-md`}>
                <div className="bg-white p-8 rounded-xl shadow-2xl w-full">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome Back</h2>

                    {error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
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
                            Log In
                        </button>
                    </form>

                    <div className="mt-6">
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
                        >
                            <ImGoogle className="text-red-500" />
                            Sign in with Google
                        </button>
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-gray-600">
                            Don't have an account?{" "}
                            <Link to="/register" className="text-blue-600 hover:underline">
                                Sign Up
                            </Link>
                        </p>
                        <Link to="/register">
                            <button
                                className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                            >
                                Register
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
