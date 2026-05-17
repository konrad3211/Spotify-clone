import { Server } from "socket.io";
import { Message } from "../models/message.model.js";
import { clerkClient } from "@clerk/express";

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });
  //👉 Map to struktura danych przechowująca pary klucz → wartość, np. userId → socketId.
  //to jest array wszystkich userow wygladac moze tak:
  //key -> value
  //"123" -> "socketABC"
  //"456" -> "socketXYZ"
  const userSockets = new Map();
  const userActivities = new Map();

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      return socket.disconnect();
    }
    userSockets.set(userId, socket.id);
    userActivities.set(userId, "Idle");

    io.emit("user_connected", userId);

    //„Wyślij TEMU konkretnemu userowi listę wszystkich online userId”
    socket.emit("users_online", Array.from(userSockets.keys()));

    io.emit("activities", Array.from(userActivities.entries()));

    socket.on("update_activity", ({ userId, activity }) => {
      console.log("activity updated", userId, activity);
      userActivities.set(userId, activity);
      io.emit("activity_updated", { userId, activity });
    });

    socket.on("typing", ({ receiverId }) => {
      const receiverSocketId = userSockets.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("user_typing", {
          userId,
        });
      }
    });

    socket.on("messages_read", async ({ senderId }) => {
      await Message.updateMany(
        {
          //!to osoba, której wiadomości właśnie odczytałeś.
          senderId,
          //!to Ty, z handshake.
          receiverId: userId,
          read: false,
        },
        {
          read: true,
        },
      );

      const senderSocketId = userSockets.get(senderId);

      if (senderSocketId) {
        io.to(senderSocketId).emit("messages_read_update", {
          readerId: userId,
        });
      }
    });

    socket.on("send_message", async (data) => {
      try {
        const { receiverId, content } = data;
        const sender = await clerkClient.users.getUser(userId);
        const senderName = sender.fullName;
        const senderImg = sender.imageUrl;
        const message = await Message.create({
          senderId: userId,
          receiverId,
          content,
        });
        //! to zwraca socket uzytkownika do ktorego wysyalmy msg
        const receiverSocketId = userSockets.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", {
            message,
            senderName,
            senderImg,
          });
        }
        //* tutaj wysylamy te wiadomosc do siebie
        socket.emit("message_sent", message);
      } catch (error) {
        //!jak mam takie coś to console.err wyskoczy w konsoli servera a to socket.emit mogę odebrać we froncie i zrobić coś z tym
        console.error("Message error:", error);
        socket.emit("message_error", error.message);
      }
    });

    //we froncie robimy socket.disconnect(); i później odbieramy to info tutaj
    //!jak ktoś się rozłączy to w środku tej funckji mam dostęp do socket.id które jest równe userowi który się rozłączył
    // socket.on("disconnect", () => {
    //   let disconnectedUserId;
    //   //!entries zwraca cale map czyli wszystkie key -> value
    //   //przypisujemy key = userId , value = socketId
    //   for (const [userId, socketId] of userSockets.entries()) {
    //     if (socketId === socket.id) {
    //       disconnectedUserId = userId;
    //       userSockets.delete(userId);
    //       userActivities.delete(userId);
    //       break;
    //     }
    //   }
    //   if (disconnectedUserId) {
    //     io.emit("user_disconnected", disconnectedUserId);
    //   }
    // });

    socket.on("disconnect", () => {
      userSockets.delete(userId);
      userActivities.delete(userId);
      io.emit("user_disconnected", userId);
    });
  });
};
