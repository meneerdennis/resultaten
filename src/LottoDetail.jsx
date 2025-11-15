import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

function Pill({ children, isMatch, isBonus }) {
  let background = "#f4f4f4";
  let color = "#000";
  let fontWeight = "normal";

  if (isBonus) {
    background = "#ff9800";
    color = "#fff";
    fontWeight = "bold";
  } else if (isMatch) {
    background = "#4caf50";
    color = "#fff";
    fontWeight = "bold";
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        background,
        color,
        fontWeight,
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

export default function LottoDetail({ date }) {
  const [tickets, setTickets] = useState([]);
  const [drawData, setDrawData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const drawDoc = doc(db, "lotto_draws", date);
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
            background: "#ffebee",
            border: "2px solid #f44336",
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
            <strong>Bonus: </strong>
            <Pill>{drawData.bonus}</Pill>
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
              Juiste cijfers
            </th>
            <th
              style={{
                textAlign: "left",
                borderBottom: "1px solid #ddd",
                padding: 8,
              }}
            >
              Bonus?
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
            const bonusNumber = drawData?.bonus;

            return (
              <tr key={t.id}>
                <td style={{ padding: 8 }}>{t.id}</td>
                <td style={{ padding: 8 }}>
                  {t.numbers.map((n) => {
                    const isBonusMatch = n === bonusNumber;
                    const isRegularMatch = winningNumbers.includes(n);

                    return (
                      <Pill
                        key={n}
                        isMatch={isRegularMatch}
                        isBonus={isBonusMatch}
                      >
                        {n}
                      </Pill>
                    );
                  })}
                </td>
                <td style={{ padding: 8 }}>{t.matches}</td>
                <td style={{ padding: 8 }}>{t.bonus_hit ? "✅" : "❌"}</td>
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
