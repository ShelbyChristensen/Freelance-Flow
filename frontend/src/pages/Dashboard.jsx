import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Dashboard() {
  const [email, setEmail] = useState("");
  const [counts, setCounts] = useState({ lead:0, prospect:0, active:0, archived:0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const me = await api.get("/auth/me");
        setEmail(me.data.user.email);
        const res = await api.get("/clients/");
        const cts = { lead:0, prospect:0, active:0, archived:0 };
        res.data.forEach(c => { if (cts[c.stage] !== undefined) cts[c.stage] += 1; });
        setCounts(cts);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="text-gray-600">Welcome {email}</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(counts).map(([k,v]) => (
          <div key={k} className="bg-white rounded-xl shadow p-4">
            <div className="text-sm text-gray-500">{k}</div>
            <div className="text-2xl font-semibold">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
