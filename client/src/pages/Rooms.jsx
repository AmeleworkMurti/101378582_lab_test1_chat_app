import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ROOMS = [
  "devops",
  "cloud computing",
  "covid19",
  "sports",
  "nodeJS",
  "javascript",
  "java",
  "docker",
];

export default function Rooms() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(u));
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const joinRoom = (room) => {
    // encode room name for URL 
    navigate(`/chat/${encodeURIComponent(room)}`);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Choose a room</h1>
            <p className="text-sm text-gray-600">
              Logged in as <span className="font-semibold">{user.username}</span>
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg bg-black text-white px-4 py-2 font-semibold"
          >
            Logout
          </button>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          {ROOMS.map((room) => (
            <button
              key={room}
              onClick={() => joinRoom(room)}
              className="bg-white rounded-2xl shadow p-5 text-left hover:shadow-md transition"
            >
              <p className="text-lg font-semibold">{room}</p>
              <p className="text-sm text-gray-600 mt-1">
                Join and chat with others in this room.
              </p>
            </button>
          ))}
        </div>

        <div className="mt-6 text-sm text-gray-600">
          Tip: open two browsers (Chrome + Edge) and join the same room to test
          real-time chat.
        </div>
      </div>
    </div>
  );
}
