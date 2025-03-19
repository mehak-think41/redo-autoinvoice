"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout as apiLogout } from "../lib/api";

// User type definition
export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: (userData) => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Try to get user data from the API
        const userData = await getCurrentUser();
        setUser(userData);
        // Store authentication state in localStorage for persistence
        localStorage.setItem("isAuth", "true");
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        console.error("Not authenticated via API:", error);
        
        // Fallback: Try to get user data from localStorage if API fails
        // This helps with page refreshes when cookies might be valid but API call fails
        try {
          if (typeof window !== "undefined") {
            const storedUser = localStorage.getItem("user");
            const isAuth = localStorage.getItem("isAuth") === "true";
            
            if (isAuth && storedUser) {
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser);
            } else {
              // Clear any invalid data
              localStorage.removeItem("isAuth");
              localStorage.removeItem("user");
            }
          }
        } catch (localStorageError) {
          console.error("Error accessing localStorage:", localStorageError);
          localStorage.removeItem("isAuth");
          localStorage.removeItem("user");
        }
      } finally {
        setLoading(false);
      }
    };

    // Check if we're in the browser environment before accessing localStorage or making API calls
    if (typeof window !== "undefined") {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    setLoading(false);
    localStorage.setItem("isAuth", "true");
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("isAuth");
      localStorage.removeItem("user");
      router.push("/login");
    }
  };

  // For debugging purposes
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("Auth state:", { 
        isAuthenticated: !!user, 
        user, 
        loading 
      });
    }
  }, [user, loading]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
