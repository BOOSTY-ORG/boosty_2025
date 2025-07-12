import React from "react";
import { SignInButton, useUser } from "@clerk/clerk-react";
import { useSelector } from "react-redux";
import CustomUserMenu from "./CustomUserMenu";

const AuthButtons = () => {
  const { isSignedIn } = useUser();
  const { isLoading } = useSelector((state) => state.auth);

  if (isLoading) {
    return (
      <div className="min-w-[102px] min-h-[36px] bg-boostyLightGray text-boostyBlack font-bold leading-6 border-[2px] border-boostyFooterBG rounded-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-boostyBlack"></div>
      </div>
    );
  }

  if (isSignedIn) {
    return <CustomUserMenu />;
  }

  return (
    <SignInButton mode="modal">
      <button className="min-w-[102px] min-h-[36px] bg-boostyLightGray text-boostyBlack font-bold leading-6 border-[2px] border-boostyFooterBG rounded-full hover:bg-opacity-80 transition-colors">
        Sign In
      </button>
    </SignInButton>
  );
};

export default AuthButtons;
