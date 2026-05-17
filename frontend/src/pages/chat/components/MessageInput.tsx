import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/react";
import { Send } from "lucide-react";

type MessageInputProps = {
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
};

const MessageInput = ({ newMessage, setNewMessage }: MessageInputProps) => {
  const { user } = useUser();
  const { selectedUser, sendMessage, socket } = useChatStore();

  const handleSend = () => {
    if (!selectedUser || !user || !newMessage) return;
    sendMessage(selectedUser.clerkId, newMessage.trim());
    setNewMessage("");
  };

  return (
    <div className="p-4 mt-auto border-t border-zinc-800">
      <div className="flex gap-2">
        <Input
          placeholder="Type a message"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);

            if (!selectedUser) return;

            socket.emit("typing", {
              receiverId: selectedUser.clerkId,
            });
          }}
          className="bg-zinc-800 border-none"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <Button
          size={"icon"}
          onClick={handleSend}
          disabled={!newMessage.trim()}
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
};
export default MessageInput;
