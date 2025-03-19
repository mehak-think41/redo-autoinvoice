import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }: { children: any }) => {
    const { isAuthenticated, user } = useAuth();

    if (user === null) {
        return <div>Loading...</div>; // Prevent premature redirect
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};


export default ProtectedRoute;
