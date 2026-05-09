import { SignInButton } from "@clerk/react";
import { Button } from "./ui/button";

export const SignInOAuthButtons = () => {
  return (
    <SignInButton mode="modal" forceRedirectUrl="/auth-callback">
      <Button
        type="button"
        variant="secondary"
        className="w-full text-white border-zinc-200 h-11"
      >
        <img src="/google.png" alt="Google" className="size-5" />
        Continue with Google
      </Button>
    </SignInButton>
  );
};
