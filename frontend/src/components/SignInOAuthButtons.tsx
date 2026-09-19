import { SignInButton } from "@clerk/react";
import { Button } from "./ui/button";

export const SignInOAuthButtons = () => {
  return (
    <SignInButton mode="modal" forceRedirectUrl="/auth-callback">
      <Button
        type="button"
        variant="secondary"
        aria-label="Continue with Google"
        className="h-10 shrink-0 px-3 sm:px-4 text-white border-zinc-200"
      >
        <img src="/google.png" alt="" className="size-5 shrink-0" />
        <span className="hidden sm:inline">Continue with Google</span>
        <span className="sm:hidden">Sign in</span>
      </Button>
    </SignInButton>
  );
};
