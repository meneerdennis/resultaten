import React, { useEffect, useState } from "react";
import { collection, getDocs, doc } from "firebase/firestore";
import { db } from "./firebase";

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

export default function EuroMillionsDetail({ date }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const subcol = collection(doc(db, "euromillions_draws", date), "tickets");
      const snap = await getDocs(subcol);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTickets(data);
      setLoading(false);
    })();
  }, [date]);

  if (loading) return <div>Bezig met laden…</div>;

  return (
    <div>
      <a href="#/" style={{ display: "inline-block", marginBottom: 12 }}>
        ← Terug naar overzicht
      </a>
      <h2>Trekking {date}</h2>
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
              Ticket
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
                textAlign: "left",
                borderBottom: "1px solid #ddd",
                padding: 8,
              }}
            >
              Juiste cijfers
            </th>
            <th
              style={{
                textAlign: "left",
                borderBottom: "1px solid #ddd",
                padding: 8,
              }}
            >
              Juiste sterren
            </th>
            <th
              style={{
                textAlign: "right",
                borderBottom: "1px solid #ddd",
                padding: 8,
              }}
            >
              Winst
            </th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.id}>
              <td style={{ padding: 8 }}>{t.id}</td>
              <td style={{ padding: 8 }}>
                {t.numbers.map((n) => (
                  <Pill key={n}>{n}</Pill>
                ))}
              </td>
              <td style={{ padding: 8 }}>
                {(t.stars || []).map((s) => (
                  <Pill key={s}>★ {s}</Pill>
                ))}
              </td>
              <td style={{ padding: 8 }}>{t.matches_numbers}</td>
              <td style={{ padding: 8 }}>{t.matches_stars}</td>
              <td style={{ padding: 8, textAlign: "right" }}>
                <Euro value={t.win_amount} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
