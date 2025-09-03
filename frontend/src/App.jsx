import { Routes, Route, Link } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients"; 
import ClientDetail from "./pages/ClientDetail";
import ProjectDetail from "./pages/ProjectDetail";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="p-4 bg-white border-b flex gap-4">
        <Link to="/" className="font-semibold">FreelanceFlow</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/clients">Clients</Link> 
        <div className="ml-auto flex gap-3">
          <Link to="/login" className="text-blue-600">Login</Link>
          <Link to="/register" className="text-blue-600">Register</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<div className="p-6">Welcome</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} /> 
        <Route path="/clients/:id" element={<ProtectedRoute><ClientDetail /></ProtectedRoute>} />
        <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
        <Route path="*" element={<div className="p-6">Not Found</div>} />
      </Routes>
    </div>
  );
}
