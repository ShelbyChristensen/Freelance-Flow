import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Dashboard() {
  const [email, setEmail] = useState("");
  const [counts, setCounts] = useState({ lead: 0, prospect: 0, active: 0, archived: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const me = await api.get("/auth/me");
        setEmail(me.data.user.email);
        const res = await api.get("/clients/");
        const cts = { lead: 0, prospect: 0, active: 0, archived: 0 };
        res.data.forEach(c => { if (cts[c.stage] !== undefined) cts[c.stage] += 1; });
        setCounts(cts);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) return <div className="space-y-4"><div className="card"><div className="card-inner">Loading…</div></div></div>;

  return (
    <div className="space-y-4">
      <h1>Dashboard</h1>

      <div className="card">
        <div className="card-inner">
          <div className="text-gray-600">Welcome {email}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(counts).map(([k, v]) => (
          <div key={k} className="card">
            <div className="card-inner">
              <div className="text-sm text-slate-500 capitalize">{k}</div>
              <div className="text-2xl font-semibold">{v}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
