import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await register(form.email.trim().toLowerCase(), form.password);
      nav("/dashboard");
    } catch (e) {
      setErr(e?.response?.data?.error?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold">Create account</h1>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input className="w-full border rounded-lg p-2" type="email"
            value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input className="w-full border rounded-lg p-2" type="password"
            value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})} required />
        </div>
        <button className="w-full rounded-lg p-2 bg-blue-600 text-white font-medium">Register</button>
        <p className="text-sm text-gray-600">Already have an account? <Link className="text-blue-600 underline" to="/login">Sign in</Link></p>
      </form>
    </div>
  );
}
