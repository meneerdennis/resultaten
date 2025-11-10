import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
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
    <strong>
      {(Number(value) || 0).toLocaleString(undefined, {
        style: "currency",
        currency: "EUR",
      })}
    </strong>
  );
}

export default function HomeLatest() {
  const [lotto, setLotto] = useState(null);
  const [em, setEm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // haal beide collecties op en kies de recentste op basis van doc-id (YYYY-MM-DD)
      const [lottoSnap, emSnap] = await Promise.all([
        getDocs(collection(db, "lotto_draws")),
        getDocs(collection(db, "euromillions_draws")),
      ]);

      const lottoRows = lottoSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const emRows = emSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (lottoRows.length) {
        lottoRows.sort((a, b) => b.id.localeCompare(a.id));
        setLotto(lottoRows[0]);
      }

      if (emRows.length) {
        emRows.sort((a, b) => b.id.localeCompare(a.id));
        setEm(emRows[0]);
      }

      setLoading(false);
    })();
  }, []);

  if (loading) return <div>Laatste resultaten laden…</div>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {/* Lotto card */}
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <h2 style={{ margin: 0 }}>Laatste Lotto</h2>
          {lotto && (
            <a href={`#/${"lotto"}/${lotto.id}`} style={{ fontSize: 14 }}>
              detail →
            </a>
          )}
        </div>
        {lotto ? (
          <>
            <div style={{ color: "#666", marginTop: 4 }}>{lotto.id}</div>
            <div style={{ marginTop: 8 }}>
              {(lotto.numbers || []).map((n) => (
                <Pill key={n}>{n}</Pill>
              ))}
              <Pill>Bonus: {lotto.bonus}</Pill>
            </div>
            <div style={{ marginTop: 8 }}>
              Totaal winst: <Euro value={lotto.total_win} />
            </div>
          </>
        ) : (
          <div>Geen Lotto-data gevonden.</div>
        )}
      </div>

      {/* EuroMillions card */}
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <h2 style={{ margin: 0 }}>Laatste EuroMillions</h2>
          {em && (
            <a href={`#/${"euromillions"}/${em.id}`} style={{ fontSize: 14 }}>
              detail →
            </a>
          )}
        </div>
        {em ? (
          <>
            <div style={{ color: "#666", marginTop: 4 }}>{em.id}</div>
            <div style={{ marginTop: 8 }}>
              {(em.numbers || []).map((n) => (
                <Pill key={n}>{n}</Pill>
              ))}
              {(em.stars || []).map((s) => (
                <Pill key={s}>★ {s}</Pill>
              ))}
            </div>
            <div style={{ marginTop: 8 }}>
              Totaal winst: <Euro value={em.total_win} />
            </div>
          </>
        ) : (
          <div>Geen EuroMillions-data gevonden.</div>
        )}
      </div>
    </div>
  );
}

const cardStyle = {
  border: "1px solid #eee",
  borderRadius: 12,
  padding: 16,
  background: "#fff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

// leftover style constant removed to avoid unused-variable ESLint warning
