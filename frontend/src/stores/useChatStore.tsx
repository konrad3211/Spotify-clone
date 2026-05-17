import { axiosInstance } from "@/lib/axios";
import type { Message, User } from "@/types";
import axios from "axios";
import { create } from "zustand";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import MessageToast from "./MessageToast.tsx";

interface ChatStore {
  users: User[];
  isLoading: boolean;
  error: string | null;
  socket: any;
  isConnected: boolean;
  onlineUsers: Set<string>;
  userActivities: Map<string, string>;
  messages: Message[];
  selectedUser: User | null;
  typingUsers: Set<string>;
  messageNotification: Set<string>;
  fetchUsers: () => Promise<void>;
  initSocket: (userId: string) => void;
  disconnectSocket: () => void;
  sendMessage: (receiverId: string, content: string) => void;
  setSelectedUser: (user: User | null) => void;
  fetchMessages: (userId: string) => Promise<void>;
}

const baseURL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";
const socket = io(baseURL, {
  autoConnect: false,
  withCredentials: true,
});
const typingTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

export const useChatStore = create<ChatStore>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,
  socket: socket,
  isConnected: false,
  onlineUsers: new Set(),
  userActivities: new Map(),
  messages: [],
  selectedUser: null,
  typingUsers: new Set(),
  messageNotification: new Set(),

  setSelectedUser: (user) => {
    set((state) => {
      const updatedNotifications = new Set(state.messageNotification);
      if (user) {
        updatedNotifications.delete(user.clerkId);
      }
      return {
        selectedUser: user,
        messageNotification: updatedNotifications,
      };
    });
  },

  initSocket: (userId: string) => {
    if (!get().isConnected) {
      //!to auth to jest od socket ale ja decyduje co tam wrzuce
      socket.auth = { userId };
      socket.connect();

      socket.on("users_online", (users) => {
        set({ onlineUsers: new Set(users) });
      });

      socket.on("activities", (activities: [string, string][]) => {
        set({ userActivities: new Map(activities) });
      });

      socket.on("user_connected", (userId: string) => {
        set((state) => ({
          onlineUsers: new Set([...state.onlineUsers, userId]),
        }));
      });
      socket.on("messages_read_update", ({ readerId }) => {
        set((state) => {
          const updatedMessages = state.messages.map((message) =>
            message.receiverId === readerId
              ? { ...message, read: true }
              : message,
          );
          return {
            messages: updatedMessages,
          };
        });
      });

      socket.on("user_disconnected", (userId: string) => {
        set((state) => {
          const newOnlineUsers = new Set(state.onlineUsers);
          newOnlineUsers.delete(userId);
          return { onlineUsers: newOnlineUsers };
        });
      });

      socket.on("user_typing", ({ userId }) => {
        //! dodaj usera do typingUsers
        set((state) => ({
          typingUsers: new Set([...state.typingUsers, userId]),
        }));

        //! sprawdz czy juz istnieje timer dla tego usera
        const existingTimeout = typingTimeouts.get(userId);

        //! jak istnieje to usun stary timer
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        //! stworz nowy timer
        const timeout = setTimeout(() => {
          set((state) => {
            const updated = new Set(state.typingUsers);

            //! usun usera po 1.5s bez pisania
            updated.delete(userId);

            return {
              typingUsers: updated,
            };
          });

          //! usun timer z mapy
          typingTimeouts.delete(userId);
        }, 1500);

        //! zapisz timer dla usera
        typingTimeouts.set(userId, timeout);
      });

      //!tutaj nasluchuje nowych wiadomosci

      socket.on("receive_message", ({ message, senderName, senderImg }) => {
        const selectedUser = get().selectedUser;

        const isChatOpenWithSender =
          selectedUser && message.senderId === selectedUser.clerkId;

        if (!isChatOpenWithSender) {
          set((state) => ({
            messageNotification: new Set([
              ...state.messageNotification,
              message.senderId,
            ]),
          }));
          toast.custom(
            (t) => (
              <MessageToast
                t={t}
                messageId={message._id}
                senderName={senderName}
                content={message.content}
                img={senderImg}
              />
            ),
            {
              id: message._id,
            },
          );
        }

        if (isChatOpenWithSender) {
          set((state) => ({
            messages: [...state.messages, message],
          }));
        }
      });

      socket.on("message_sent", (message: Message) => {
        const selectedUser = get().selectedUser;

        if (selectedUser && message.receiverId === selectedUser.clerkId) {
          set((state) => ({
            messages: [...state.messages, message],
          }));
        }
      });

      socket.on("activity_updated", ({ userId, activity }) => {
        set((state) => {
          const newActivities = new Map(state.userActivities);
          newActivities.set(userId, activity);
          return { userActivities: newActivities };
        });
      });

      set({ isConnected: true });
    }
  },
  //!wysylamy do fronta info ze sie wylogowujemy
  disconnectSocket: () => {
    if (get().isConnected) {
      socket.removeAllListeners();
      socket.disconnect();
      set({
        isConnected: false,
        onlineUsers: new Set(),
        userActivities: new Map(),
      });
    }
  },
  sendMessage: (receiverId, content) => {
    const socket = get().socket;
    if (!socket.connected) {
      return console.log("Socket not connected");
    }
    socket.emit("send_message", { receiverId, content });
  },

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get("/users");
      set({ users: res.data });
    } catch (error) {
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.message || "Something went wrong"
        : "Something went wrong";

      set({ error: msg });
    } finally {
      set({ isLoading: false });
    }
  },

  //!tutaj dostaje stare wiadomosci
  fetchMessages: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get(`/users/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.message || "Something went wrong"
        : "Something went wrong";

      set({ error: msg });
    } finally {
      set({ isLoading: false });
    }
  },
}));
