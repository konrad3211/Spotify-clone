import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import LeftSidebar from "./components/LeftSidebar";
import { Link, Outlet } from "react-router-dom";
import FriendsActivity from "./components/FriendsActivity";
import AudioPlayer from "./components/AudioPlayer";
import PlaybackControls from "./components/PlaybackControls";
import { useEffect, useState } from "react";
import { Show } from "@clerk/react";
import { HomeIcon, MessageCircle } from "lucide-react";

const MainLayout = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="h-dvh bg-black text-white flex flex-col overflow-hidden">
        <AudioPlayer />

        <nav className="shrink-0 px-2 pt-2" aria-label="Mobile navigation">
          <div className="h-12 rounded-lg bg-zinc-900 flex items-center justify-around px-2">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <HomeIcon className="size-5" />
              <span className="text-sm font-medium">Home</span>
            </Link>

            <Show when="signed-in">
              <Link
                to="/chat"
                className="flex items-center gap-2 px-4 py-2 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <MessageCircle className="size-5" />
                <span className="text-sm font-medium">Messages</span>
              </Link>
            </Show>
          </div>
        </nav>

        <main className="min-h-0 flex-1 overflow-hidden p-2">
          <Outlet />
        </main>

        <PlaybackControls />
      </div>
    );
  }

  return (
    <div className="h-dvh bg-black text-white flex flex-col overflow-hidden">
      <ResizablePanelGroup
        orientation="horizontal"
        className="flex-1 min-h-0 overflow-hidden p-2"
      >
        <AudioPlayer />

        <ResizablePanel defaultSize="20%" minSize="10%" maxSize="30%">
          <LeftSidebar />
        </ResizablePanel>

        <ResizableHandle className="w-2 bg-black rounded-lg transition-colors" />

        <ResizablePanel defaultSize="60%">
          <Outlet />
        </ResizablePanel>

        <ResizableHandle className="w-2 bg-black rounded-lg transition-colors" />

        <ResizablePanel
          defaultSize="20%"
          minSize="0%"
          maxSize="25%"
          collapsedSize="0%"
          collapsible
        >
          <FriendsActivity />
        </ResizablePanel>
      </ResizablePanelGroup>

      <PlaybackControls />
    </div>
  );
};

export default MainLayout;
