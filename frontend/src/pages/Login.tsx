import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getGoogleAuthUrl } from "../api";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";

const Login = () => {
    const handleLogin = async () => {
        try {
            const url = await getGoogleAuthUrl();
            window.location.href = url;
        } catch (error) {
            console.error("Failed to get Google authentication URL.");
        }
    };

    return (
        <div className="h-screen flex items-center justify-center flex-col">
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            <Button onClick={handleLogin}>Login with Google</Button>
        </div>
    );
};

export default Login;
