import { useSelector } from "react-redux";
import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error, syncStatus } = useSelector(
    (state) => state.auth
  );
  const { isSignedIn } = useUser();
  const { getToken, signOut } = useClerkAuth();

  return {
    user,
    isAuthenticated: isAuthenticated && isSignedIn,
    isLoading,
    error,
    syncStatus,
    getToken,
    signOut,
    // Helper methods
    isAdmin: user?.isAdmin || false,
    isVerified: user?.isVerified || false,
    fullName:
      user?.fullName ||
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
  };
};
