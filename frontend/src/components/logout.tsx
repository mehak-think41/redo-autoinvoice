import { useLogout } from "../context/AuthContext";

const LogoutButton = () => {
    const logout = useLogout();

    return <button onClick={logout}>Logout</button>;
};

export default LogoutButton;
