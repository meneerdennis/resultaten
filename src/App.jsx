import React, { useEffect, useState } from "react";
import LottoView from "./LottoView.jsx";
import LottoDetail from "./LottoDetail.jsx";
import EuroMillionsView from "./EuroMillionsView.jsx";
import EuroMillionsDetail from "./EuroMillionsDetail.jsx";
import LottoCharts from "./LottoCharts.jsx";
import EuroMillionsCharts from "./EuroMillionsCharts.jsx";
import HomeLatest from "./HomeLatest.jsx";

function parseRoute() {
  const hash = location.hash.replace(/^#\/?/, "");
  if (!hash) return { section: "home" };
  const [section, part2] = hash.split("/");
  return { section, part2 };
}

export default function App() {
  const [route, setRoute] = useState(parseRoute());
  useEffect(() => {
    const onHash = () => setRoute(parseRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const isHome = route.section === "home" || !route.section;

  return (
    <div
      style={{
        fontFamily: "system-ui",
        padding: 24,
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <h1 style={{ marginBottom: 16 }}>Lotto & EuroMillions Dashboard</h1>

      {/* Startpagina: recentste resultaten + 2 kolommen */}
      {isHome && <HomeLayout />}

      {/* Routes blijven werken voor detailpagina's */}
      {route.section === "lotto" && route.part2 && route.part2 !== "charts" && (
        <LottoDetail date={route.part2} />
      )}
      {route.section === "euromillions" &&
        route.part2 &&
        route.part2 !== "charts" && <EuroMillionsDetail date={route.part2} />}
    </div>
  );
}

/* Home lay-out: bovenaan laatste resultaten, daaronder twee kolommen */
function HomeLayout() {
  const [leftTab, setLeftTab] = useState("lotto"); // grafieken-tab
  const [rightTab, setRightTab] = useState("lotto"); // resultaten-tab

  return (
    <>
      <HomeLatest />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginTop: 16,
        }}
      >
        {/* Linker kolom: grafieken */}
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button
              onClick={() => setLeftTab("lotto")}
              style={tabBtn(leftTab === "lotto")}
            >
              Lotto grafieken
            </button>
            <button
              onClick={() => setLeftTab("euromillions")}
              style={tabBtn(leftTab === "euromillions")}
            >
              EuroMillions grafieken
            </button>
          </div>
          <div style={cardStyle}>
            {leftTab === "lotto" ? <LottoCharts /> : <EuroMillionsCharts />}
          </div>
        </div>

        {/* Rechter kolom: uitgebreide resultaten */}
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button
              onClick={() => setRightTab("lotto")}
              style={tabBtn(rightTab === "lotto")}
            >
              Lotto resultaten
            </button>
            <button
              onClick={() => setRightTab("euromillions")}
              style={tabBtn(rightTab === "euromillions")}
            >
              EuroMillions resultaten
            </button>
          </div>
          <div style={cardStyle}>
            {rightTab === "lotto" ? <LottoView /> : <EuroMillionsView />}
          </div>
        </div>
      </div>
    </>
  );
}

/* stijlen */
const cardStyle = {
  border: "1px solid #eee",
  borderRadius: 12,
  padding: 12,
  background: "#fff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

function tabBtn(active) {
  return {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: active ? "#111" : "#f7f7f7",
    color: active ? "#fff" : "#111",
    cursor: "pointer",
    fontWeight: 600,
  };
}
