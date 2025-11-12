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

function Pill({ children, type }) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = windowWidth < 900;

  return (
    <span
      style={{
        display: "inline-block",
        padding: isMobile ? "4px 6px" : "4px 10px",
        borderRadius: 999,
        background: type === "lotto" ? "#e3f2fd" : "#f3e5f5",
        marginRight: isMobile ? 3 : 6,
        fontSize: isMobile ? "11px" : "14px",
        border: `1px solid ${type === "lotto" ? "#2196f3" : "#9c27b0"}`,
      }}
    >
      {children}
    </span>
  );
}

export default function CombinedDrawsTable() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        // Fetch both lotto and euromillions draws
        const [lottoSnap, euromillionsSnap] = await Promise.all([
          getDocs(collection(db, "lotto_draws")),
          getDocs(collection(db, "euromillions_draws")),
        ]);

        // Combine and format data
        const lottoData = lottoSnap.docs.map((d) => ({
          id: d.id,
          type: "lotto",
          ...d.data(),
        }));

        const euromillionsData = euromillionsSnap.docs.map((d) => ({
          id: d.id,
          type: "euromillions",
          ...d.data(),
        }));

        // Combine and sort by date (newest first)
        const allDraws = [...lottoData, ...euromillionsData];
        allDraws.sort((a, b) => b.id.localeCompare(a.id));

        setDraws(allDraws);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading...</div>;

  const isMobile = windowWidth < 900;

  return (
    <div
      style={{
        border: "1px solid rgba(102, 126, 234, 0.1)",
        borderRadius: "16px",
        background: "rgba(255, 255, 255, 0.9)",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(102, 126, 234, 0.08)",
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          background: "rgba(102, 126, 234, 0.05)",
          borderBottom: "1px solid rgba(102, 126, 234, 0.1)",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: isMobile ? "18px" : "20px",
            color: "#333",
          }}
        >
          Alle Lotterijresultaten
        </h3>
      </div>

      {isMobile ? (
        // Mobile: Card layout
        <div style={{ display: "grid", gap: 12, padding: 16 }}>
          {draws.map((r) => (
            <div
              key={`${r.type}-${r.id}`}
              style={{
                border: `2px solid ${
                  r.type === "lotto" ? "#2196f3" : "#9c27b0"
                }`,
                borderRadius: 8,
                padding: 12,
                background: "#fff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  marginBottom: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <a
                  href={`#/${r.type}/${r.id}`}
                  style={{
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "16px",
                    color: r.type === "lotto" ? "#2196f3" : "#9c27b0",
                  }}
                >
                  {r.id}
                </a>
                <span
                  style={{
                    fontSize: "12px",
                    padding: "4px 8px",
                    borderRadius: 12,
                    background: r.type === "lotto" ? "#e3f2fd" : "#f3e5f5",
                    color: r.type === "lotto" ? "#1976d2" : "#7b1fa2",
                    fontWeight: "600",
                  }}
                >
                  {r.type === "lotto" ? "LOTTO" : "EUROMILLIONS"}
                </span>
              </div>

              <div
                style={{
                  marginBottom: 8,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px",
                }}
              >
                {r.type === "lotto"
                  ? (r.numbers || []).map((n) => (
                      <Pill key={n} type="lotto">
                        {n}
                      </Pill>
                    ))
                  : [
                      ...(r.numbers || []).map((n) => (
                        <Pill key={`n-${n}`} type="euromillions">
                          {n}
                        </Pill>
                      )),
                      ...(r.stars || []).map((s) => (
                        <Pill key={`s-${s}`} type="euromillions">
                          ★ {s}
                        </Pill>
                      )),
                    ]}
                {r.type === "lotto" && r.bonus && (
                  <Pill type="lotto">Bonus: {r.bonus}</Pill>
                )}
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
                  href={`#/${r.type}/${r.id}`}
                  style={{
                    fontSize: "12px",
                    color: r.type === "lotto" ? "#2196f3" : "#9c27b0",
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
        // Desktop: Table layout
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: "12px 8px",
                    background: "rgba(102, 126, 234, 0.05)",
                    width: "15%",
                    fontSize: "14px",
                  }}
                >
                  Datum
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: "12px 8px",
                    background: "rgba(102, 126, 234, 0.05)",
                    width: "15%",
                    fontSize: "14px",
                  }}
                >
                  Type
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: "12px 8px",
                    background: "rgba(102, 126, 234, 0.05)",
                    width: "35%",
                    fontSize: "14px",
                  }}
                >
                  Getallen/Sterren
                </th>
                <th
                  style={{
                    textAlign: "right",
                    borderBottom: "1px solid #ddd",
                    padding: "12px 8px",
                    background: "rgba(102, 126, 234, 0.05)",
                    width: "20%",
                    fontSize: "14px",
                  }}
                >
                  Totaal winst
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: "12px 8px",
                    background: "rgba(102, 126, 234, 0.05)",
                    width: "15%",
                    fontSize: "14px",
                  }}
                >
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {draws.map((r) => (
                <tr key={`${r.type}-${r.id}`}>
                  <td style={{ padding: "12px 8px", fontSize: "14px" }}>
                    <a
                      href={`#/${r.type}/${r.id}`}
                      style={{ textDecoration: "none", fontWeight: 600 }}
                    >
                      {r.id}
                    </a>
                  </td>
                  <td style={{ padding: "12px 8px", fontSize: "14px" }}>
                    <span
                      style={{
                        fontSize: "12px",
                        padding: "4px 8px",
                        borderRadius: 8,
                        background: r.type === "lotto" ? "#e3f2fd" : "#f3e5f5",
                        color: r.type === "lotto" ? "#1976d2" : "#7b1fa2",
                        fontWeight: "600",
                        display: "inline-block",
                      }}
                    >
                      {r.type === "lotto" ? "LOTTO" : "EUROMILLIONS"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 8px", fontSize: "14px" }}>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "4px",
                        maxWidth: "100%",
                      }}
                    >
                      {r.type === "lotto"
                        ? (r.numbers || []).map((n) => (
                            <Pill key={n} type="lotto">
                              {n}
                            </Pill>
                          ))
                        : [
                            ...(r.numbers || []).map((n) => (
                              <Pill key={`n-${n}`} type="euromillions">
                                {n}
                              </Pill>
                            )),
                            ...(r.stars || []).map((s) => (
                              <Pill key={`s-${s}`} type="euromillions">
                                ★ {s}
                              </Pill>
                            )),
                          ]}
                      {r.type === "lotto" && r.bonus && (
                        <Pill type="lotto">Bonus: {r.bonus}</Pill>
                      )}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "12px 8px",
                      textAlign: "right",
                      fontSize: "14px",
                    }}
                  >
                    <Euro value={r.total_win} />
                  </td>
                  <td style={{ padding: "12px 8px", fontSize: "14px" }}>
                    <a href={`#/${r.type}/${r.id}`}>bekijk</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
