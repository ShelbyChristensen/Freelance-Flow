import { Routes, Route, Link } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import ProjectDetail from "./pages/ProjectDetail";
import { useAuth } from "./context/AuthContext";

export default function App() {
  // useAuth is expected to provide { user, logout }
  // If your context names differ, adjust here.
  const auth = (typeof useAuth === "function") ? useAuth() : {};
  const user = auth?.user;
  const logout = auth?.logout || (() => { localStorage.clear(); location.href = "/login"; });

  return (
    <div className="min-h-screen">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b">
        <nav className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="font-semibold tracking-tight">
            <span className="text-blue-600">Freelance</span>Flow
          </Link>

          <Link to="/dashboard" className="text-sm text-slate-700 hover:text-slate-900">Dashboard</Link>
          <Link to="/clients" className="text-sm text-slate-700 hover:text-slate-900">Clients</Link>

          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <>
                <span className="chip hidden sm:inline">{user.email}</span>
                <button className="btn-ghost" onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">Login</Link>
                <Link to="/register" className="btn">Register</Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Page container */}
      <main className="container-page">
        <Routes>
          <Route path="/" element={
            <div className="card">
              <div className="card-inner">Welcome!</div>
            </div>
          } />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
          <Route path="/clients/:id" element={<ProtectedRoute><ClientDetail /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />

          <Route path="*" element={
            <div className="card"><div className="card-inner">Not Found</div></div>
          } />
        </Routes>
      </main>
    </div>
  );
}
