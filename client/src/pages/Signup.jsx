import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    firstname: "",
    lastname: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (!form.username || !form.firstname || !form.lastname || !form.password) {
      setErr("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErr(data?.message || "Signup failed.");
        return;
      }

      setMsg("Signup successful! You can login now.");
      setTimeout(() => navigate("/login"), 700);
    } catch (e2) {
      setErr("Network error. Is the server running on port 5000?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold mb-1">Create account</h1>
        <p className="text-sm text-gray-600 mb-6">
          Sign up to join rooms and chat in real-time.
        </p>

        {err && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">
            {err}
          </div>
        )}
        {msg && (
          <div className="mb-4 rounded-lg bg-green-50 text-green-700 p-3 text-sm">
            {msg}
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
              placeholder="unique username"
              autoComplete="username"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">First name</label>
              <input
                name="firstname"
                value={form.firstname}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border p-2 focus:outline-none focus:ring"
                placeholder="first name"
                autoComplete="given-name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Last name</label>
              <input
                name="lastname"
                value={form.lastname}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border p-2 focus:outline-none focus:ring"
                placeholder="lastname"
                autoComplete="family-name"
              />
            </div>
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
              autoComplete="new-password"
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-lg bg-black text-white py-2 font-semibold disabled:opacity-60"
          >
            {loading ? "Creating..." : "Sign up"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link className="underline" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
