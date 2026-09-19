import { LayoutDashboardIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { SignInOAuthButtons } from "./SignInOAuthButtons";
import { Show, UserButton } from "@clerk/react";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";

export const TopBar = () => {
  const { isAdmin } = useAuthStore();

  return (
    <div className="flex items-center justify-between gap-3 p-3 sm:p-4 sticky top-0 bg-zinc-900/80 backdrop-blur-md z-10">
      <div className="flex min-w-0 items-center gap-2 font-semibold">
        <img src="/spotify.png" className="size-8 shrink-0" alt="Spotify logo" />
        <span className="hidden min-[420px]:inline truncate">Spotify</span>
      </div>

      <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-4">
        {isAdmin && (
          <Link
            to="/admin"
            aria-label="Admin Dashboard"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-10 shrink-0 px-3 sm:px-4",
            )}
          >
            <LayoutDashboardIcon className="size-4 sm:mr-2" />
            <span className="hidden sm:inline">Admin Dashboard</span>
          </Link>
        )}

        <Show when="signed-out">
          <SignInOAuthButtons />
        </Show>

        <Show when="signed-in">
          <div className="shrink-0">
            <UserButton />
          </div>
        </Show>
      </div>
    </div>
  );
};
