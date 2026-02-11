import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.username || !form.password) {
      setErr("Username and password are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErr(data?.message || "Login failed.");
        return;
      }

      // store session in localStorage
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/rooms");
    } catch (e2) {
      setErr("Network error. Is the server running on port 5000?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-sm text-gray-600 mb-6">
          Login to join a room and start chatting.
        </p>

        {err && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium">Username</label>
            <input
              name="username"
              value={form.username}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border p-2 focus:outline-none focus:ring"
              placeholder="your username"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border p-2 focus:outline-none focus:ring"
              placeholder="••••"
              autoComplete="current-password"
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-lg bg-black text-white py-2 font-semibold disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4">
          New here?{" "}
          <Link className="underline" to="/signup">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
