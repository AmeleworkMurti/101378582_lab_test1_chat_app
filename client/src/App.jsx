import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Rooms from "./pages/Rooms";
import RoomChat from "./pages/RoomChat";
import PrivateChat from "./pages/PrivateChat";

const isLoggedIn = () => !!localStorage.getItem("user");

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/rooms"
          element={isLoggedIn() ? <Rooms /> : <Navigate to="/login" />}
        />
        <Route
          path="/chat/:room"
          element={isLoggedIn() ? <RoomChat /> : <Navigate to="/login" />}
        />
        <Route
          path="/dm/:toUser"
          element={isLoggedIn() ? <PrivateChat /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}
