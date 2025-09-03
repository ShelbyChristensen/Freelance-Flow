import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const STAGES = ["lead", "prospect", "active", "archived"];

export default function Clients() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [stage, setStage] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ name: "", email: "", company: "", stage: "lead", next_action_date: "" });
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true); setErr("");
    try {
      const params = {};
      if (q) params.q = q;
      if (stage) params.stage = stage;
      const { data } = await api.get("/clients/", { params });
      setItems(data);
    } catch (e) {
      setErr(e?.response?.data?.error?.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* on mount */ }, []);
  // reload when filters change (debounce search lightly)
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, stage]);

  const onCreate = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await api.post("/clients/", {
        name: form.name.trim(),
        email: form.email.trim() || null,
        company: form.company.trim() || null,
        stage: form.stage,
        next_action_date: form.next_action_date || null,
      });
      setForm({ name: "", email: "", company: "", stage: "lead", next_action_date: "" });
      setCreating(false);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.error?.message || "Failed to create client");
    }
  };

  const updateStage = async (id, newStage) => {
    try {
      await api.patch(`/clients/${id}`, { stage: newStage });
      setItems(prev => prev.map(it => it.id === id ? { ...it, stage: newStage } : it));
    } catch {
      // fallback: reload
      load();
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this client?")) return;
    try {
      await api.delete(`/clients/${id}`);
      setItems(prev => prev.filter(it => it.id !== id));
    } catch {
      load();
    }
  };

  const rows = useMemo(() => items, [items]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Clients</h1>

      <div className="flex gap-3 items-end flex-wrap">
        <div>
          <label className="block text-sm mb-1">Search</label>
          <input
            className="border rounded-lg p-2 w-64"
            placeholder="name, email, company…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Stage</label>
          <select className="border rounded-lg p-2" value={stage} onChange={(e)=>setStage(e.target.value)}>
            <option value="">All</option>
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <button className="ml-auto rounded-lg px-3 py-2 bg-blue-600 text-white" onClick={()=>setCreating(true)}>
          + New Client
        </button>
      </div>

      {err && <div className="text-red-600 text-sm">{err}</div>}
      {loading ? (
        <div className="text-gray-600">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-gray-600">No clients yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow">
            <thead className="text-left border-b">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Company</th>
                <th className="p-3">Stage</th>
                <th className="p-3">Next Action</th>
                <th className="p-3 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b last:border-b-0">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.email || "-"}</td>
                  <td className="p-3">{c.company || "-"}</td>
                  <td className="p-3">
                    <select
                      className="border rounded-lg p-1"
                      value={c.stage}
                      onChange={(e)=>updateStage(c.id, e.target.value)}
                    >
                      {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-3">{c.next_action_date || "-"}</td>
                  <td className="p-3">
                    <button className="text-red-600" onClick={()=>remove(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Simple inline "modal" */}
      {creating && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <form onSubmit={onCreate} className="w-full max-w-lg bg-white rounded-2xl shadow p-6 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">New Client</h2>
              <button type="button" className="text-gray-600" onClick={()=>setCreating(false)}>✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm mb-1">Name *</label>
                <input className="w-full border rounded-lg p-2" value={form.name} required
                  onChange={(e)=>setForm({...form, name:e.target.value})}/>
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input className="w-full border rounded-lg p-2" value={form.email}
                  onChange={(e)=>setForm({...form, email:e.target.value})}/>
              </div>
              <div>
                <label className="block text-sm mb-1">Company</label>
                <input className="w-full border rounded-lg p-2" value={form.company}
                  onChange={(e)=>setForm({...form, company:e.target.value})}/>
              </div>
              <div>
                <label className="block text-sm mb-1">Stage</label>
                <select className="w-full border rounded-lg p-2" value={form.stage}
                  onChange={(e)=>setForm({...form, stage:e.target.value})}>
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Next action date</label>
                <input type="date" className="w-full border rounded-lg p-2"
                  value={form.next_action_date}
                  onChange={(e)=>setForm({...form, next_action_date:e.target.value})}/>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button type="button" className="px-3 py-2 rounded-lg border" onClick={()=>setCreating(false)}>Cancel</button>
              <button className="px-3 py-2 rounded-lg bg-blue-600 text-white">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
