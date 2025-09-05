import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";

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

  useEffect(() => { load(); }, []);
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
    <div className="space-y-4">
      <h1>Clients</h1>

      <div className="card">
        <div className="card-inner">
          <div className="flex gap-3 items-end flex-wrap">
            <div>
              <label className="block text-sm mb-1">Search</label>
              <input
                className="w-64"
                placeholder="name, email, company…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                type="text"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Stage</label>
              <select value={stage} onChange={(e) => setStage(e.target.value)}>
                <option value="">All</option>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <button className="ml-auto btn" onClick={() => setCreating(true)}>
              + New Client
            </button>
          </div>
        </div>
      </div>

      {err && (
        <div className="card">
          <div className="card-inner text-red-600 text-sm">{err}</div>
        </div>
      )}

      {loading ? (
        <div className="card"><div className="card-inner text-gray-600">Loading…</div></div>
      ) : rows.length === 0 ? (
        <div className="card"><div className="card-inner text-gray-600">No clients yet.</div></div>
      ) : (
        <div className="card overflow-x-auto">
          <div className="card-inner p-0">
            <table className="min-w-full">
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
                    <td className="p-3">
                      <Link className="text-blue-600 underline" to={`/clients/${c.id}`}>{c.name}</Link>
                    </td>
                    <td className="p-3">{c.email || "-"}</td>
                    <td className="p-3">{c.company || "-"}</td>
                    <td className="p-3">
                      <select
                        className="p-1"
                        value={c.stage}
                        onChange={(e) => updateStage(c.id, e.target.value)}
                      >
                        {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="p-3">{c.next_action_date || "-"}</td>
                    <td className="p-3">
                      <button className="text-red-600" onClick={() => remove(c.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {creating && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <form onSubmit={onCreate} className="w-full max-w-lg card">
            <div className="card-inner space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold">New Client</h2>
                <button type="button" className="text-gray-600" onClick={() => setCreating(false)}>✕</button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm mb-1">Name *</label>
                  <input className="w-full" value={form.name} required
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Email</label>
                  <input className="w-full" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Company</label>
                  <input className="w-full" value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Stage</label>
                  <select className="w-full" value={form.stage}
                    onChange={(e) => setForm({ ...form, stage: e.target.value })}>
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Next action date</label>
                  <input type="date" className="w-full"
                    value={form.next_action_date}
                    onChange={(e) => setForm({ ...form, next_action_date: e.target.value })} />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" className="btn-ghost" onClick={() => setCreating(false)}>Cancel</button>
                <button className="btn">Create</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
