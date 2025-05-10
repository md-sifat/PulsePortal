import { useContext } from "react";
import { authContext } from "../AuthProvider/AuthProvider";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import PropTypes from "prop-types";


const Private = ({ children }) => {
    const { user, loading, setLoading } = useContext(authContext);
    const location = useLocation();
    if (user) {
        setLoading(false);
        return children;
    }
    if (loading) {
        return <progress className="progress w-56"></progress>
    }

    toast.error("Please Login First to access this contents");

    return <Navigate to="/login" state={{ from: location }} replace></Navigate>
};

Private.propTypes = {
    children: PropTypes.node.isRequired,
}

export default Private;