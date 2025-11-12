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

export default function CombinedCharts() {
  const [combinedData, setCombinedData] = useState([]);
  const [monthCombinedData, setMonthCombinedData] = useState([]);
  const [monthTicks, setMonthTicks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Fetch both lottery types
        const [lottoSnap, euromillionsSnap] = await Promise.all([
          getDocs(collection(db, "lotto_draws")),
          getDocs(collection(db, "euromillions_draws")),
        ]);

        const lottoRows = lottoSnap.docs.map((d) => ({
          id: d.id,
          type: "lotto",
          ...d.data(),
        }));

        const euromillionsRows = euromillionsSnap.docs.map((d) => ({
          id: d.id,
          type: "euromillions",
          ...d.data(),
        }));

        if (!lottoRows.length && !euromillionsRows.length) {
          setCombinedData([]);
          setMonthCombinedData([]);
          setLoading(false);
          return;
        }

        // Combine all data and find the most recent year
        const allRows = [...lottoRows, ...euromillionsRows];
        allRows.sort((a, b) => a.id.localeCompare(b.id));

        const years = Array.from(
          new Set(allRows.map((r) => r.id.slice(0, 4)))
        ).sort();
        const targetYear = years[years.length - 1];

        const lottoInYear = lottoRows.filter((r) =>
          r.id.startsWith(targetYear)
        );
        const euroInYear = euromillionsRows.filter((r) =>
          r.id.startsWith(targetYear)
        );

        // Process lotto data
        const lottoCum = [];
        const lottoTicks = [];
        let lastMonth = "";
        let lottoRunning = 0;

        for (const r of lottoInYear) {
          const val = Number(r.total_win || 0);
          lottoRunning += val;

          const monthKey = r.id.slice(0, 7);
          if (monthKey !== lastMonth) {
            lottoTicks.push(r.id);
            lastMonth = monthKey;
          }

          lottoCum.push({
            date: r.id,
            cum_win: lottoRunning,
          });
        }

        // Process euromillions data
        const euroCum = [];
        lastMonth = "";
        let euroRunning = 0;

        for (const r of euroInYear) {
          const val = Number(r.total_win || 0);
          euroRunning += val;

          const monthKey = r.id.slice(0, 7);
          if (monthKey !== lastMonth) {
            lastMonth = monthKey;
          }

          euroCum.push({
            date: r.id,
            cum_win: euroRunning,
          });
        }

        // Combine cumulative data for line chart
        const combinedCum = [];
        const lottoCumMap = new Map(
          lottoCum.map((item) => [item.date, item.cum_win])
        );
        const euroCumMap = new Map(
          euroCum.map((item) => [item.date, item.cum_win])
        );

        // Get all unique dates
        const allDates = new Set([...lottoCumMap.keys(), ...euroCumMap.keys()]);
        const sortedDates = Array.from(allDates).sort();

        // Process combined cumulative data maintaining proper cumulative flow
        let runningLotto = 0;
        let runningEuro = 0;

        for (const date of sortedDates) {
          const lottoValue = lottoCumMap.get(date);
          const euroValue = euroCumMap.get(date);

          // Only update running totals if there's actual data for this date
          if (lottoValue !== undefined) {
            runningLotto = lottoValue;
          }
          if (euroValue !== undefined) {
            runningEuro = euroValue;
          }

          combinedCum.push({
            date,
            lotto_cum: runningLotto,
            euro_cum: runningEuro,
            total_cum: runningLotto + runningEuro,
          });
        }

        // Process monthly data for bar chart
        const lottoByMonth = new Map();
        for (const r of lottoInYear) {
          const key = r.id.slice(0, 7);
          const val = Number(r.total_win || 0);
          lottoByMonth.set(key, (lottoByMonth.get(key) || 0) + val);
        }

        const euroByMonth = new Map();
        for (const r of euroInYear) {
          const key = r.id.slice(0, 7);
          const val = Number(r.total_win || 0);
          euroByMonth.set(key, (euroByMonth.get(key) || 0) + val);
        }

        // Combine monthly data
        const allMonths = new Set([
          ...lottoByMonth.keys(),
          ...euroByMonth.keys(),
        ]);
        const sortedMonths = Array.from(allMonths).sort();

        const monthData = sortedMonths.map((month) => ({
          month,
          lotto_sum: lottoByMonth.get(month) || 0,
          euro_sum: euroByMonth.get(month) || 0,
          total_sum:
            (lottoByMonth.get(month) || 0) + (euroByMonth.get(month) || 0),
        }));

        setCombinedData(combinedCum);
        setMonthCombinedData(monthData);
        setMonthTicks(lottoTicks); // Use lotto ticks as reference
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Grafieken laden…</div>;

  return (
    <div>
      <ChartCard title="Winst doorheen het jaar">
        <ResponsiveContainer>
          <LineChart data={combinedData}>
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
              dataKey="lotto_cum"
              stroke="#2196f3"
              strokeWidth={2}
              dot={false}
              name="Lotto Cumulatief"
            />
            <Line
              type="monotone"
              dataKey="euro_cum"
              stroke="#9c27b0"
              strokeWidth={2}
              dot={false}
              name="EuroMillions Cumulatief"
            />
            <Line
              type="monotone"
              dataKey="total_cum"
              stroke="#ff6b35"
              strokeWidth={3}
              dot={false}
              name="Totaal Cumulatief"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Winst per maand">
        <ResponsiveContainer>
          <BarChart data={monthCombinedData}>
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
            <Bar dataKey="lotto_sum" name="Lotto" fill="#2196f3" />
            <Bar dataKey="euro_sum" name="EuroMillions" fill="#9c27b0" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div
        style={{
          marginTop: "16px",
          padding: "12px",
          background: "rgba(102, 126, 234, 0.05)",
          borderRadius: "8px",
          fontSize: "14px",
        }}
      >
        <div style={{ marginBottom: "8px", fontWeight: "600" }}>Legenda:</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{ width: "20px", height: "3px", background: "#2196f3" }}
            ></div>
            <span>Lotto Cumulatief</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{ width: "20px", height: "3px", background: "#9c27b0" }}
            ></div>
            <span>EuroMillions Cumulatief</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "20px",
                height: "3px",
                background: "#ff6b35",
                borderStyle: "dashed",
                borderWidth: "1px",
              }}
            ></div>
            <span>Totaal Cumulatief</span>
          </div>
        </div>
      </div>
    </div>
  );
}
