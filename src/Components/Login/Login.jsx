import { useContext, useState } from "react";
import { ImGoogle } from "react-icons/im";
import { authContext } from "../AuthProvider/AuthProvider";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase/firebase.init";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
    const { loginUser } = useContext(authContext);
    const navigate = useNavigate();
    const provider = new GoogleAuthProvider();
    const [showPassword, setShowPassword] = useState(false);

    const handleGoogleRegister = () => {
        signInWithPopup(auth, provider)
            .then((res) => {
                toast.success("Log In successful!");
                navigate("/login");
            }).catch((error) => {
                toast.error("Log In failed!");
            });
    };

    const handleLogin = (event) => {
        event.preventDefault();
        const email = event.target.email.value;
        const password = event.target.password.value;

        loginUser(email, password)
            .then(() => {
                toast.success("Log In successful!");
                navigate("/login");
            })
            .catch(() => {
                toast.error("Log In failed!");
            });
    };

    return (
       <>
       </>
    );
};

export default Login;