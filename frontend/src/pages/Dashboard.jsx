import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [status, setStatus] = useState("...");

  useEffect(() => {
    api.get("/auth/me")
      .then(res => setStatus(`Hello ${res.data.user.email}`))
      .catch(() => setStatus("Auth error. Try logging in again."));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button onClick={logout} className="px-3 py-1 rounded-lg bg-gray-800 text-white">Logout</button>
      </div>
      <div className="text-gray-700">{status}</div>
      {user && <div className="text-sm text-gray-500">User ID: {user.id}</div>}
    </div>
  );
}
