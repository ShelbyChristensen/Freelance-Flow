import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

const TSTATUS = ["todo", "doing", "done"];

export default function ProjectDetail() {
  const { id } = useParams(); // project id
  const nav = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ title: "", status: "todo", due_date: "", notes: "" });

  const load = async () => {
    setErr("");
    try {
      const res = await api.get("/tasks/", { params: { project_id: id } });
      setTasks(res.data);
    } catch (e) {
      setErr(e?.response?.data?.error?.message || "Failed to load tasks");
    }
  };

  useEffect(() => { load(); }, [id]);

  const createTask = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await api.post("/tasks/", {
        project_id: Number(id),
        title: form.title.trim(),
        status: form.status,
        due_date: form.due_date || null,
        notes: form.notes || null
      });
      setForm({ title: "", status: "todo", due_date: "", notes: "" });
      await load();
    } catch (e) {
      setErr(e?.response?.data?.error?.message || "Failed to create task");
    }
  };

  const updateStatus = async (tid, status) => {
    try { await api.patch(`/tasks/${tid}`, { status }); setTasks(prev => prev.map(t => t.id === tid ? { ...t, status } : t)); }
    catch { load(); }
  };

  const remove = async (tid) => {
    if (!confirm("Delete this task?")) return;
    try { await api.delete(`/tasks/${tid}`); setTasks(prev => prev.filter(t => t.id !== tid)); }
    catch { load(); }
  };

  const rows = useMemo(() => tasks, [tasks]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button className="text-blue-600 underline" onClick={() => nav(-1)}>← Back</button>
        <h1>Project {id}</h1>
      </div>

      {err && <div className="card"><div className="card-inner text-red-600 text-sm">{err}</div></div>}

      <section className="card">
        <div className="card-inner space-y-3">
          <h2 className="font-semibold">Tasks</h2>
          {rows.length === 0 ? (
            <div className="text-gray-600">No tasks yet.</div>
          ) : (
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="min-w-full">
                <thead className="text-left border-b">
                  <tr>
                    <th className="p-2">Title</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Due</th>
                    <th className="p-2">Notes</th>
                    <th className="p-2 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(t => (
                    <tr key={t.id} className="border-b last:border-b-0">
                      <td className="p-2">{t.title}</td>
                      <td className="p-2">
                        <select className="p-1" value={t.status}
                          onChange={(e) => updateStatus(t.id, e.target.value)}>
                          {TSTATUS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="p-2">{t.due_date || "-"}</td>
                      <td className="p-2 whitespace-pre-wrap text-sm text-gray-700">{t.notes || "-"}</td>
                      <td className="p-2">
                        <button className="text-red-600" onClick={() => remove(t.id)}>Delete</button>
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
          <h3 className="font-semibold">New Task</h3>
          <form onSubmit={createTask} className="grid grid-cols-3 gap-3">
            <input className="border rounded-lg p-2 col-span-2" placeholder="Task title"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <select className="border rounded-lg p-2" value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {TSTATUS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="date" className="border rounded-lg p-2"
              value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            <textarea rows={3} className="border rounded-lg p-2 col-span-2" placeholder="Notes"
              value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <button className="btn">Create</button>
          </form>
        </div>
      </section>
    </div>
  );
}
