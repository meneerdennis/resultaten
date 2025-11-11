import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

function Pill({ children }) {
  const isMobile = window.innerWidth < 1024;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: isMobile ? "8px 12px" : "6px 14px",
        borderRadius: 999,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#fff",
        marginRight: isMobile ? 6 : 8,
        marginBottom: isMobile ? 6 : 4,
        fontSize: isMobile ? "13px" : "14px",
        fontWeight: 600,
        boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
      }}
    >
      {children}
    </span>
  );
}

function Euro({ value }) {
  return (
    <span
      style={{
        fontWeight: 700,
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        fontSize: "1.1em",
      }}
    >
      {(Number(value) || 0).toLocaleString(undefined, {
        style: "currency",
        currency: "EUR",
      })}
    </span>
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

  const isMobile = window.innerWidth < 1024;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: window.innerWidth < 1024 ? "1fr" : "1fr 1fr",
        gap: isMobile ? 12 : 16,
      }}
    >
      {/* Lotto card */}
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "column",
            gap: isMobile ? "12px" : "0",
            marginBottom: "8px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: isMobile ? "20px" : "22px",
              fontWeight: 700,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.02em",
            }}
          >
            Laatste Lotto
          </h2>
          {lotto && (
            <a
              href={`#/${"lotto"}/${lotto.id}`}
              style={{
                fontSize: isMobile ? "13px" : "14px",
                alignSelf: "flex-end",
                color: "#667eea",
                textDecoration: "none",
                fontWeight: 600,
                padding: "6px 12px",
                borderRadius: "8px",
                background: "rgba(102, 126, 234, 0.1)",
                transition: "all 0.2s ease",
                border: "1px solid rgba(102, 126, 234, 0.2)",
              }}
              onMouseOver={(e) => {
                e.target.style.background = "rgba(102, 126, 234, 0.2)";
                e.target.style.transform = "translateY(-1px)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "rgba(102, 126, 234, 0.1)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Bekijk detail →
            </a>
          )}
        </div>
        {lotto ? (
          <>
            <div
              style={{
                color: "#6b7280",
                marginTop: 4,
                fontSize: "15px",
                fontWeight: 500,
                marginBottom: "12px",
              }}
            >
              {lotto.id}
            </div>
            <div
              style={{
                marginTop: 8,
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
              }}
            >
              {(lotto.numbers || []).map((n) => (
                <Pill key={n}>{n}</Pill>
              ))}
              <Pill>★ {lotto.bonus}</Pill>
            </div>
            <div
              style={{
                marginTop: 16,
                fontSize: "16px",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              Totaal winst: <Euro value={lotto.total_win} />
            </div>
          </>
        ) : (
          <div
            style={{
              color: "#6b7280",
              fontStyle: "italic",
              padding: "20px",
              textAlign: "center",
              background: "rgba(107, 114, 128, 0.05)",
              borderRadius: "12px",
            }}
          >
            Geen Lotto-data gevonden.
          </div>
        )}
      </div>

      {/* EuroMillions card */}
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "column",
            gap: isMobile ? "12px" : "0",
            marginBottom: "8px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: isMobile ? "20px" : "22px",
              fontWeight: 700,
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.02em",
            }}
          >
            Laatste EuroMillions
          </h2>
          {em && (
            <a
              href={`#/${"euromillions"}/${em.id}`}
              style={{
                fontSize: isMobile ? "13px" : "14px",
                alignSelf: "flex-end",
                color: "#10b981",
                textDecoration: "none",
                fontWeight: 600,
                padding: "6px 12px",
                borderRadius: "8px",
                background: "rgba(16, 185, 129, 0.1)",
                transition: "all 0.2s ease",
                border: "1px solid rgba(16, 185, 129, 0.2)",
              }}
              onMouseOver={(e) => {
                e.target.style.background = "rgba(16, 185, 129, 0.2)";
                e.target.style.transform = "translateY(-1px)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "rgba(16, 185, 129, 0.1)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Bekijk detail →
            </a>
          )}
        </div>
        {em ? (
          <>
            <div
              style={{
                color: "#6b7280",
                marginTop: 4,
                fontSize: "15px",
                fontWeight: 500,
                marginBottom: "12px",
              }}
            >
              {em.id}
            </div>
            <div
              style={{
                marginTop: 8,
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
              }}
            >
              {(em.numbers || []).map((n) => (
                <Pill
                  key={n}
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                >
                  {n}
                </Pill>
              ))}
              {(em.stars || []).map((s) => (
                <Pill
                  key={s}
                  style={{
                    background:
                      "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  }}
                >
                  ⭐ {s}
                </Pill>
              ))}
            </div>
            <div
              style={{
                marginTop: 16,
                fontSize: "16px",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              Totaal winst: <Euro value={em.total_win} />
            </div>
          </>
        ) : (
          <div
            style={{
              color: "#6b7280",
              fontStyle: "italic",
              padding: "20px",
              textAlign: "center",
              background: "rgba(107, 114, 128, 0.05)",
              borderRadius: "12px",
            }}
          >
            Geen EuroMillions-data gevonden.
          </div>
        )}
      </div>
    </div>
  );
}

const cardStyle = {
  border: "1px solid rgba(102, 126, 234, 0.1)",
  borderRadius: 20,
  padding: "24px",
  background: "rgba(255, 255, 255, 0.9)",
  boxShadow: "0 8px 32px rgba(102, 126, 234, 0.1)",
  backdropFilter: "blur(20px)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
  },
};
