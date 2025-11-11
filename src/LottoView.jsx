import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
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
  const isMobile = window.innerWidth < 700;
  return (
    <span
      style={{
        display: "inline-block",
        padding: isMobile ? "6px 8px" : "4px 10px",
        borderRadius: 999,
        background: "#f4f4f4",
        marginRight: isMobile ? 4 : 6,
        fontSize: isMobile ? "12px" : "14px",
      }}
    >
      {children}
    </span>
  );
}

export default function LottoView() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "lotto_draws"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => b.id.localeCompare(a.id)); // desc op doc-id (YYYY-MM-DD)
      setRows(data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div>Loading…</div>;

  const isMobile = window.innerWidth < 700;

  return (
    <div>
      <h2
        style={{
          marginBottom: 8,
          fontSize: isMobile ? "18px" : "20px",
        }}
      >
        Lotto
      </h2>

      {isMobile ? (
        // Mobile/Small: Card layout
        <div style={{ display: "grid", gap: 12 }}>
          {rows.map((r) => (
            <div
              key={r.id}
              style={{
                border: "1px solid #eee",
                borderRadius: 8,
                padding: 12,
                background: "#fff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <a
                  href={`#/${"lotto"}/${r.id}`}
                  style={{
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "16px",
                  }}
                >
                  {r.id}
                </a>
              </div>

              <div
                style={{
                  marginBottom: 8,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px",
                }}
              >
                {(r.numbers || []).map((n) => (
                  <Pill key={n}>{n}</Pill>
                ))}
                <Pill>Bonus: {r.bonus}</Pill>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "14px",
                }}
              >
                <span>Totaal winst:</span>
                <strong>
                  <Euro value={r.total_win} />
                </strong>
              </div>

              <div style={{ marginTop: 8, textAlign: "right" }}>
                <a
                  href={`#/${"lotto"}/${r.id}`}
                  style={{
                    fontSize: "12px",
                    color: "#007bff",
                    textDecoration: "none",
                  }}
                >
                  bekijk details →
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Large: Table layout
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
                Getallen
              </th>
              <th
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                  padding: 8,
                }}
              >
                Bonus
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
                    href={`#/${"lotto"}/${r.id}`}
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
                  <Pill>{r.bonus}</Pill>
                </td>
                <td style={{ padding: 8, textAlign: "right" }}>
                  <Euro value={r.total_win} />
                </td>
                <td style={{ padding: 8 }}>
                  <a href={`#/${"lotto"}/${r.id}`}>bekijk</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
