import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import ChartCard from "./ChartCard.jsx";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

function euroFmt(v) {
  return (v ?? 0).toLocaleString(undefined, {
    style: "currency",
    currency: "EUR",
  });
}

export default function EuroMillionsCharts() {
  const [cumData, setCumData] = useState([]);
  const [monthData, setMonthData] = useState([]);
  const [monthTicks, setMonthTicks] = useState([]);
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "euromillions_draws"));
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (!rows.length) {
        setCumData([]);
        setMonthData([]);
        setLoading(false);
        return;
      }
      rows.sort((a, b) => a.id.localeCompare(b.id)); // ASC

      // recentste jaar
      const years = Array.from(
        new Set(rows.map((r) => r.id.slice(0, 4)))
      ).sort();
      const targetYear = years[years.length - 1];
      setYear(targetYear);

      const inYear = rows.filter((r) => r.id.startsWith(targetYear));

      // cumulatieve winst + maandticks
      let running = 0;
      const cum = [];
      const ticks = [];
      let lastMonth = "";

      for (const r of inYear) {
        const val = Number(r.total_win || 0);
        running += val;

        const monthKey = r.id.slice(0, 7);
        if (monthKey !== lastMonth) {
          ticks.push(r.id);
          lastMonth = monthKey;
        }

        cum.push({ date: r.id, total_win: val, cum_win: running });
      }

      // winst per maand
      const byMonth = new Map();
      for (const r of inYear) {
        const key = r.id.slice(0, 7);
        const val = Number(r.total_win || 0);
        byMonth.set(key, (byMonth.get(key) || 0) + val);
      }
      const months = Array.from(byMonth.entries())
        .map(([month, sum]) => ({ month, sum }))
        .sort((a, b) => a.month.localeCompare(b.month));

      setCumData(cum);
      setMonthData(months);
      setMonthTicks(ticks);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div>Grafieken laden…</div>;

  return (
    <div>
      <h2 style={{ marginBottom: 8 }}>EuroMillions – Grafieken ({year})</h2>

      <ChartCard title="Cumulatieve winst doorheen het jaar">
        <ResponsiveContainer>
          <LineChart data={cumData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              ticks={monthTicks}
              tickFormatter={(d) => {
                const dt = new Date(d);
                return dt.toLocaleDateString("nl-BE", { month: "short" });
              }}
            />
            <YAxis />
            <Tooltip formatter={(v) => euroFmt(v)} />
            <Line
              type="monotone"
              dataKey="cum_win"
              stroke="#0ea5e9"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Winst per maand">
        <ResponsiveContainer>
          <BarChart data={monthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickFormatter={(m) => {
                const d = new Date(m + "-01");
                return d.toLocaleDateString("nl-BE", { month: "short" });
              }}
            />
            <YAxis />
            <Tooltip formatter={(v) => euroFmt(v)} />
            <Bar dataKey="sum" name="Maandtotaal" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
