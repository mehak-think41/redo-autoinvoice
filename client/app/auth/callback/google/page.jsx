"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getCurrentUser } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("Initializing authentication...");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // The code parameter is sent by Google after successful authentication
        const code = searchParams.get("code");
        
        if (!code) {
          // If there's no code, something went wrong with the Google authentication
          const error = searchParams.get("error");
          throw new Error(error || "Authentication failed");
        }

        setStatus("Received authentication code, fetching user data...");
        console.log("Google auth code received, fetching user data");
        
        // The backend should have already exchanged the code for tokens
        // and set the necessary cookies. Now we can fetch the user data.
        const userData = await getCurrentUser();
        
        console.log("User data received:", userData);
        setStatus("User data received, updating authentication state...");
        
        // Update auth context with user data
        login(userData);
        
        // Show success message
        toast({
          title: "Success",
          description: "Login with Google successful!",
        });
        
        setStatus("Authentication complete, redirecting to dashboard...");
        console.log("Authentication complete, redirecting to dashboard");
        
        // Redirect to dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 500); // Small delay to ensure state is updated
      } catch (error) {
        console.error("Authentication error:", error);
        setError(error.message || "Authentication failed");
        setStatus("Authentication failed");
        
        toast({
          title: "Authentication Failed",
          description: error.message || "Failed to complete Google authentication",
          variant: "destructive",
        });
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    };

    fetchUserData();
  }, [searchParams, login, router, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {error ? "Authentication Failed" : "Completing Authentication"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {error
              ? `Error: ${error}. Redirecting to login page...`
              : status}
          </p>
          
          {!error && (
            <div className="mt-5 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
