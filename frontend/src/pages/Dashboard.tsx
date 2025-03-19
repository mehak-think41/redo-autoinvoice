import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { watchLive } from "@/api";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="h-screen flex items-center justify-center flex-col bg-gray-100 p-6">
      {user ? (
        <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center w-96">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.picture} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>

          <h1 className="text-2xl font-semibold mt-4">{user.name}</h1>
          <p className="text-gray-500">{user.email}</p>

          <div className="mt-6 space-y-3 w-full">
            <Button onClick={() => navigate("/inbox")} className="w-full bg-blue-500 hover:bg-blue-600">
              📩 Go to Inbox
            </Button>

            <Button onClick={watchLive} className="w-full bg-blue-500 hover:bg-blue-600">
              watchLive
            </Button>

            <Button onClick={logout} className="w-full bg-red-500 hover:bg-red-600">
              Logout
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-gray-700 text-lg">Loading user...</p>
      )}
    </div>
  );
};

export default Dashboard;
