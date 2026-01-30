import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { tokenStore } from "@/core/auth/tokenStore";
import { useAuthStore } from "@/store/auth.store";

/**
 * Типи подій WebSocket (під твоє API)
 */
type ServerToClientEvents = {
  "order:created": (data: any) => void;
  "order:updated": (data: any) => void;
  "order:updateStatus": (data: { orderId: string; status: string }) => void;
};

type ClientToServerEvents = {
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
};

type SocketContextValue = {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  connected: boolean;
};

/**
 * Контекст
 */
const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
});

/**
 * ✅ ХУК — його ти імпортуєш у OrdersPage, Notifications і т.д.
 */
export function useSocket() {
  return useContext(SocketContext);
}

/**
 * ✅ ПРОВАЙДЕР (БЕЗ default export)
 */
export function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = tokenStore.getAccessToken();

    // ❗ Гість — без WebSocket
    if (!token || !user) return;

    // ❗ не створюємо повторно
    if (socketRef.current) return;

    const socket = io(import.meta.env.VITE_API_URL, {
      transports: ["websocket"],
      auth: {
        token,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      console.log("🟢 WS connected", socket.id);

      // Адмін може слухати всі замовлення
      if (user.role === "admin") {
        socket.emit("joinRoom", "admin");
      }
    });

    socket.on("disconnect", () => {
      setConnected(false);
      console.log("🔴 WS disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("WS error:", err.message);
    });

    return () => {
      if (socketRef.current) {
        if (user.role === "admin") {
          socketRef.current.emit("leaveRoom", "admin");
        }
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        connected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
