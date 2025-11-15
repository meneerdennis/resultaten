import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

function Pill({ children, isMatch }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        background: isMatch ? "#4caf50" : "#f4f4f4",
        color: isMatch ? "#fff" : "#000",
        fontWeight: isMatch ? "bold" : "normal",
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
  const [drawData, setDrawData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const drawDoc = doc(db, "euromillions_draws", date);
      const drawSnap = await getDoc(drawDoc);
      if (drawSnap.exists()) {
        setDrawData(drawSnap.data());
      }

      const subcol = collection(drawDoc, "tickets");
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

      {drawData && (
        <div
          style={{
            background: "#e3f2fd",
            border: "2px solid #2196f3",
            borderRadius: 8,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Winnende Nummers</h3>
          <div style={{ marginBottom: 8 }}>
            <strong>Nummers: </strong>
            {(drawData.numbers || []).map((n) => (
              <Pill key={n}>{n}</Pill>
            ))}
          </div>
          <div>
            <strong>Sterren: </strong>
            {(drawData.stars || []).map((s) => (
              <Pill key={s}>★ {s}</Pill>
            ))}
          </div>
        </div>
      )}

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
          {tickets.map((t) => {
            const winningNumbers = drawData?.numbers || [];
            const winningStars = drawData?.stars || [];

            return (
              <tr key={t.id}>
                <td style={{ padding: 8 }}>{t.id}</td>
                <td style={{ padding: 8 }}>
                  {t.numbers.map((n) => (
                    <Pill key={n} isMatch={winningNumbers.includes(n)}>
                      {n}
                    </Pill>
                  ))}
                </td>
                <td style={{ padding: 8 }}>
                  {(t.stars || []).map((s) => (
                    <Pill key={s} isMatch={winningStars.includes(s)}>
                      ★ {s}
                    </Pill>
                  ))}
                </td>
                <td style={{ padding: 8 }}>{t.matches_numbers}</td>
                <td style={{ padding: 8 }}>{t.matches_stars}</td>
                <td style={{ padding: 8, textAlign: "right" }}>
                  <Euro value={t.win_amount} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
