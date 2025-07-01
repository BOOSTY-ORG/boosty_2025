import React from "react";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { useSelector } from "react-redux";

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
    return (
      <div className="flex items-center space-x-4">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-9 h-9",
              userButtonPopoverCard: "shadow-lg",
              userButtonPopoverActionButton: "hover:bg-gray-100",
            },
          }}
          afterSignOutUrl="/"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <SignUpButton mode="modal">
        <button className="min-w-[80px] min-h-[36px] bg-transparent text-boostyBlack font-medium leading-6 border border-boostyFooterBG rounded-full hover:bg-boostyLightGray transition-colors">
          Sign Up
        </button>
      </SignUpButton>

      <SignInButton mode="modal">
        <button className="min-w-[102px] min-h-[36px] bg-boostyLightGray text-boostyBlack font-bold leading-6 border-[2px] border-boostyFooterBG rounded-full hover:bg-opacity-80 transition-colors">
          Sign In
        </button>
      </SignInButton>
    </div>
  );
};

export default AuthButtons;
