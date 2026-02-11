import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

export default function PrivateChat() {
  const navigate = useNavigate();
  const { toUser } = useParams();
  const decodedToUser = useMemo(() => decodeURIComponent(toUser || ""), [toUser]);

  const [me, setMe] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingText, setTypingText] = useState("");

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimerRef = useRef(null);

  // Load logged-in user
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) {
      navigate("/login");
      return;
    }
    setMe(JSON.parse(u));
  }, [navigate]);

  // Connect socket + register user
  useEffect(() => {
    if (!me) return;

    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.emit("register_user", me.username);

    socket.on("receive_private_message", (msg) => {
      // only show messages that are between me and decodedToUser
      const involved =
        (msg.from_user === me.username && msg.to_user === decodedToUser) ||
        (msg.from_user === decodedToUser && msg.to_user === me.username);

      if (involved) setMessages((prev) => [...prev, msg]);
    });

    socket.on("show_private_typing", (txt) => setTypingText(txt));
    socket.on("hide_private_typing", () => setTypingText(""));

    return () => {
      try {
        socket.disconnect();
      } catch {}
    };
  }, [me, decodedToUser]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingText]);

  const goBack = () => navigate("/rooms");

  const send = () => {
    if (!text.trim() || !me) return;

    socketRef.current?.emit("private_message", {
      from_user: me.username,
      to_user: decodedToUser,
      message: text.trim(),
    });

    setText("");
    socketRef.current?.emit("private_stop_typing", { to_user: decodedToUser });
  };

  const onTyping = (val) => {
    setText(val);

    if (!socketRef.current || !me) return;

    socketRef.current.emit("private_typing", {
      from_user: me.username,
      to_user: decodedToUser,
    });

    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socketRef.current?.emit("private_stop_typing", { to_user: decodedToUser });
    }, 700);
  };

  if (!me) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow p-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              Private chat: <span className="underline">{decodedToUser}</span>
            </h1>
            <p className="text-sm text-gray-600">
              You: <span className="font-semibold">{me.username}</span>
            </p>
          </div>
          <button
            onClick={goBack}
            className="rounded-lg bg-black text-white px-4 py-2 font-semibold"
          >
            Back to rooms
          </button>
        </div>

        {/* Messages */}
        <div className="mt-4 bg-white rounded-2xl shadow p-4 h-[60vh] overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No DMs yet. Start the conversation 👋
            </p>
          ) : (
            <div className="space-y-2">
              {messages.map((m) => (
                <div
                  key={m._id || `${m.from_user}-${m.date_sent}-${Math.random()}`}
                  className={`p-3 rounded-xl border ${
                    m.from_user === me.username ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <div className="text-xs text-gray-500 flex justify-between">
                    <span className="font-semibold">
                      {m.from_user} ➜ {m.to_user}
                    </span>
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
              if (e.key === "Enter") send();
            }}
            className="flex-1 rounded-lg border p-2 focus:outline-none focus:ring"
            placeholder={`Message ${decodedToUser}...`}
          />
          <button
            onClick={send}
            className="rounded-lg bg-black text-white px-4 font-semibold"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
