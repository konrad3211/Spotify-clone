import { TopBar } from "@/components/Topbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/react";
import { useEffect, useRef, useState } from "react";
import UsersList from "./components/UsersList";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import ChatHeader from "./components/ChatHeader";
import MessageInput from "./components/MessageInput";

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const ChatPage = () => {
  const [newMessage, setNewMessage] = useState("");

  const { user } = useUser();
  const {
    messages,
    selectedUser,
    fetchMessages,
    typingUsers,
    socket,
    setSelectedUser,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.clerkId);
    }
  }, [fetchMessages, selectedUser]);

  useEffect(() => {
    return () => {
      setSelectedUser(null);
    };
  }, [setSelectedUser]);

  useEffect(() => {
    if (!selectedUser || !socket.connected) return;

    socket.emit("messages_read", {
      senderId: selectedUser.clerkId,
    });
  }, [messages.length, selectedUser, socket]);

  return (
    <main className="h-full rounded-lg bg-linear-to-b from-zinc-800 to-zinc-900 overflow-hidden flex flex-col">
      <TopBar />

      <div className="grid grid-cols-[64px_minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)] min-h-0 flex-1">
        <UsersList />

        <div className="flex min-w-0 min-h-0 flex-col">
          {selectedUser ? (
            <>
              <ChatHeader />

              <ScrollArea className="min-h-0 flex-1">
                <div className="p-3 sm:p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex items-start gap-2 sm:gap-3 ${
                        message.senderId === user?.id ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar className="size-7 sm:size-8 shrink-0">
                        <AvatarImage
                          src={
                            message.senderId === user?.id
                              ? user.imageUrl
                              : selectedUser.imageUrl
                          }
                        />
                      </Avatar>

                      <div
                        className={`rounded-xl p-3 max-w-[82%] sm:max-w-[70%] break-words ${
                          message.senderId === user?.id
                            ? "bg-green-500 text-black"
                            : "bg-zinc-800"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <span
                          className={`text-xs mt-1 block ${
                            message.senderId === user?.id
                              ? "text-black/65"
                              : "text-zinc-300"
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </span>
                        {message.senderId === user?.id && (
                          <span className="text-[10px] text-black/65 mt-1 block">
                            {message.read ? "Seen" : "Sent"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {selectedUser && typingUsers.has(selectedUser.clerkId) && (
                    <p className="text-xs text-zinc-400 italic px-2 sm:px-4">
                      typing...
                    </p>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <MessageInput
                newMessage={newMessage}
                setNewMessage={setNewMessage}
              />
            </>
          ) : (
            <NoConversationPlaceholder />
          )}
        </div>
      </div>
    </main>
  );
};

export default ChatPage;

const NoConversationPlaceholder = () => (
  <div className="flex flex-col items-center justify-center h-full px-6 space-y-6">
    <img src="/spotify.png" alt="Spotify" className="size-16 animate-bounce" />
    <div className="text-center">
      <h3 className="text-zinc-300 text-lg font-medium mb-1">
        No conversation selected
      </h3>
      <p className="text-zinc-500 text-sm">Choose a friend to start chatting</p>
    </div>
  </div>
);
