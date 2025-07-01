import React, { useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useDispatch, useSelector } from "react-redux";
import {
  setUser,
  clearUser,
  setLoading,
  syncUserWithBackend,
} from "../store/authSlice";

const ClerkAuthProvider = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const { syncStatus } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleUserSync = async () => {
      if (isLoaded) {
        dispatch(setLoading(false));

        if (user) {
          // Set user in Redux store
          const userData = {
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            username: user.username || user.firstName + user.lastName,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            imageUrl: user.imageUrl,
            isVerified:
              user.primaryEmailAddress?.verification?.status === "verified",
          };

          dispatch(setUser(userData));

          // Sync with backend if not already synced
          if (syncStatus === "idle") {
            try {
              const clerkToken = await getToken();
              dispatch(
                syncUserWithBackend({
                  ...userData,
                  clerkToken,
                })
              );
            } catch (error) {
              console.error("Failed to get Clerk token:", error);
            }
          }
        } else {
          dispatch(clearUser());
        }
      } else {
        dispatch(setLoading(true));
      }
    };

    handleUserSync();
  }, [user, isLoaded, dispatch, getToken, syncStatus]);

  return <>{children}</>;
};

export default ClerkAuthProvider;
