import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

const PSTATUS = ["active", "completed", "archived"];

export default function ClientDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ name: "", status: "active", due_date: "" });

  const load = async () => {
    setErr("");
    try {
      const [cRes, pRes] = await Promise.all([
        api.get(`/clients/${id}`),
        api.get("/projects/", { params: { client_id: id } }),
      ]);
      setClient(cRes.data);
      setProjects(pRes.data);
    } catch (e) {
      setErr(e?.response?.data?.error?.message || "Failed to load client");
    }
  };

  useEffect(() => { load(); }, [id]);

  const createProject = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await api.post("/projects/", {
        client_id: Number(id),
        name: form.name.trim(),
        status: form.status,
        due_date: form.due_date || null
      });
      setForm({ name: "", status: "active", due_date: "" });
      await load();
    } catch (e) {
      setErr(e?.response?.data?.error?.message || "Failed to create project");
    }
  };

  const updateStatus = async (pid, status) => {
    try {
      await api.patch(`/projects/${pid}`, { status });
      setProjects(prev => prev.map(p => p.id === pid ? { ...p, status } : p));
    } catch { load(); }
  };

  const remove = async (pid) => {
    if (!confirm("Delete this project?")) return;
    try { await api.delete(`/projects/${pid}`); setProjects(prev => prev.filter(p => p.id !== pid)); }
    catch { load(); }
  };

  const rows = useMemo(() => projects, [projects]);

  if (!client) return <div className="space-y-4"><div className="card"><div className="card-inner">Loading…</div></div></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button className="text-blue-600 underline" onClick={() => nav(-1)}>← Back</button>
        <h1>{client.name}</h1>
      </div>

      <div className="card">
        <div className="card-inner">
          <div className="text-gray-600">
            {client.company || "-"} • {client.email || "-"} • stage: {client.stage}
          </div>
          {err && <div className="text-red-600 text-sm mt-2">{err}</div>}
        </div>
      </div>

      <section className="card">
        <div className="card-inner space-y-3">
          <h2 className="font-semibold">Projects</h2>
          {rows.length === 0 ? (
            <div className="text-gray-600">No projects yet.</div>
          ) : (
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="min-w-full">
                <thead className="text-left border-b">
                  <tr>
                    <th className="p-2">Name</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Due</th>
                    <th className="p-2 w-28">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(p => (
                    <tr key={p.id} className="border-b last:border-b-0">
                      <td className="p-2">
                        <Link className="text-blue-600 underline" to={`/projects/${p.id}`}>{p.name}</Link>
                      </td>
                      <td className="p-2">
                        <select className="p-1" value={p.status}
                          onChange={(e) => updateStatus(p.id, e.target.value)}>
                          {PSTATUS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="p-2">{p.due_date || "-"}</td>
                      <td className="p-2">
                        <button className="text-red-600" onClick={() => remove(p.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="card">
        <div className="card-inner space-y-3">
          <h3 className="font-semibold">New Project</h3>
          <form onSubmit={createProject} className="grid grid-cols-3 gap-3">
            <input className="border rounded-lg p-2 col-span-2" placeholder="Project name"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <select className="border rounded-lg p-2" value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {PSTATUS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="date" className="border rounded-lg p-2"
              value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            <div className="col-span-2"></div>
            <button className="btn">Create</button>
          </form>
        </div>
      </section>
    </div>
  );
}
