import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../utils/axiosClient';

const Logout = () => {
  const { user, setUser } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(true);

  useEffect(() => {
    const performLogout = async () => {
      if (user) {
        try {
          // Send request to clear server sessions/tokens
          await axiosClient.post('/users/logout');
        } catch (error) {
          console.error("Server logout request failed:", error);
        } finally {
          // Clear global app user state whether the server call succeeded or failed
          setUser(null);
          setIsLoggingOut(false);
        }
      } else {
        // If there's no active user session, turn off loading immediately
        setIsLoggingOut(false);
      }
    };

    performLogout();
  }, [user, setUser]);

  // 1. Show this beautiful loading layout spinner while the API call completes
  if (isLoggingOut) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#393939] light:bg-zinc-50 transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          {/* Animated Spinner Ring */}
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-600 border-t-indigo-500 light:border-zinc-200 light:border-t-indigo-600" />
          <p className="text-sm font-medium text-zinc-400 light:text-zinc-500 animate-pulse">
            Logging you out securely...
          </p>
        </div>
      </div>
    );
  }

  // 2. Once states swap, declarative redirect fires cleanly out of history stack
  return <Navigate to="/auth#login" replace />;
};

export default Logout;