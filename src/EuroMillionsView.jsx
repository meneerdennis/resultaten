import React, { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";

function Euro({ value }) {
  return (
    <span>
      {(value ?? 0).toLocaleString(undefined, {
        style: "currency",
        currency: "EUR",
      })}
    </span>
  );
}

function Pill({ children }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        background: "#f4f4f4",
        marginRight: 6,
      }}
    >
      {children}
    </span>
  );
}

export default function EuroMillionsView() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "euromillions_draws"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => b.id.localeCompare(a.id)); // desc op doc-id
      setRows(data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div>Loading…</div>;

  return (
    <div>
      <h2 style={{ marginBottom: 8 }}>EuroMillions</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                borderBottom: "1px solid #ddd",
                padding: 8,
              }}
            >
              Datum
            </th>
            <th
              style={{
                textAlign: "left",
                borderBottom: "1px solid #ddd",
                padding: 8,
              }}
            >
              Nummers
            </th>
            <th
              style={{
                textAlign: "left",
                borderBottom: "1px solid #ddd",
                padding: 8,
              }}
            >
              Sterren
            </th>
            <th
              style={{
                textAlign: "right",
                borderBottom: "1px solid #ddd",
                padding: 8,
              }}
            >
              Totaal winst
            </th>
            <th
              style={{
                textAlign: "left",
                borderBottom: "1px solid #ddd",
                padding: 8,
              }}
            >
              Details
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td style={{ padding: 8 }}>
                <a
                  href={`#/${"euromillions"}/${r.id}`}
                  style={{ textDecoration: "none", fontWeight: 600 }}
                >
                  {r.id}
                </a>
              </td>
              <td style={{ padding: 8 }}>
                {(r.numbers || []).map((n) => (
                  <Pill key={n}>{n}</Pill>
                ))}
              </td>
              <td style={{ padding: 8 }}>
                {(r.stars || []).map((s) => (
                  <Pill key={s}>★ {s}</Pill>
                ))}
              </td>
              <td style={{ padding: 8, textAlign: "right" }}>
                <Euro value={r.total_win} />
              </td>
              <td style={{ padding: 8 }}>
                <a href={`#/${"euromillions"}/${r.id}`}>bekijk</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
