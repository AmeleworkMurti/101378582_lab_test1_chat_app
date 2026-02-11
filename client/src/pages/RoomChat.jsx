import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";

const API_BASE = "http://localhost:5000";
const SOCKET_URL = "http://localhost:5000";

export default function RoomChat() {
  const navigate = useNavigate();
  const { room } = useParams();
  const decodedRoom = useMemo(() => decodeURIComponent(room || ""), [room]);

  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingText, setTypingText] = useState("");

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimerRef = useRef(null);

  // Load user + old messages
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) {
      navigate("/login");
      return;
    }
    const parsed = JSON.parse(u);
    setUser(parsed);

    // fetch previous room messages from DB
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/messages/group/${encodeURIComponent(decodedRoom)}`);
        const data = await res.json();
        if (res.ok) setMessages(data);
      } catch {
        // ignore fetch errors for now
      }
    })();
  }, [navigate, decodedRoom]);

  // Setup socket + join room
  useEffect(() => {
    if (!user) return;

    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.emit("join_room", decodedRoom);

    socket.on("receive_room_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("show_typing", (txt) => setTypingText(txt));
    socket.on("hide_typing", () => setTypingText(""));

    return () => {
      try {
        socket.emit("leave_room", decodedRoom);
        socket.disconnect();
      } catch {
        // ignore
      }
    };
  }, [user, decodedRoom]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingText]);

  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit("leave_room", decodedRoom);
      socketRef.current.disconnect();
    }
    navigate("/rooms");
  };

  const sendMessage = () => {
    if (!text.trim() || !user) return;

    socketRef.current?.emit("room_message", {
      from_user: user.username,
      room: decodedRoom,
      message: text.trim(),
    });

    setText("");
    socketRef.current?.emit("stop_typing", { room: decodedRoom });
  };

  const onTyping = (val) => {
    setText(val);

    if (!socketRef.current || !user) return;

    socketRef.current.emit("typing", { username: user.username, room: decodedRoom });

    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socketRef.current?.emit("stop_typing", { room: decodedRoom });
    }, 700);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow p-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Room: {decodedRoom}</h1>
            <p className="text-sm text-gray-600">
              Logged in as <span className="font-semibold">{user.username}</span>
            </p>
          </div>
          <button
            onClick={leaveRoom}
            className="rounded-lg bg-black text-white px-4 py-2 font-semibold"
          >
            Leave room
          </button>
        </div>

        {/* Chat box */}
        <div className="mt-4 bg-white rounded-2xl shadow p-4 h-[60vh] overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-sm">No messages yet. Say hi 👋</p>
          ) : (
            <div className="space-y-2">
              {messages.map((m) => (
                <div
                  key={m._id || `${m.from_user}-${m.date_sent}-${Math.random()}`}
                  className={`p-3 rounded-xl border ${
                    m.from_user === user.username ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <div className="text-xs text-gray-500 flex justify-between">
                    <span className="font-semibold">{m.from_user}</span>
                    <span>
                      {m.date_sent ? new Date(m.date_sent).toLocaleTimeString() : ""}
                    </span>
                  </div>
                  <div className="mt-1">{m.message}</div>
                </div>
              ))}
            </div>
          )}

          {typingText && (
            <p className="mt-3 text-sm text-gray-500 italic">{typingText}</p>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="mt-3 bg-white rounded-2xl shadow p-3 flex gap-2">
          <input
            value={text}
            onChange={(e) => onTyping(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            className="flex-1 rounded-lg border p-2 focus:outline-none focus:ring"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="rounded-lg bg-black text-white px-4 font-semibold"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
