import React, { useEffect, useState } from "react";
import LottoView from "./LottoView.jsx";
import EuroMillionsView from "./EuroMillionsView.jsx";
import EuroMillionsDetail from "./EuroMillionsDetail.jsx";
import LottoCharts from "./LottoCharts.jsx";
import EuroMillionsCharts from "./EuroMillionsCharts.jsx";
import HomeLatest from "./HomeLatest.jsx";

function parseRoute() {
  const hash = window.location.hash.replace(/^#\/?/, "");
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
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: window.innerWidth < 768 ? 16 : 32,
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: 24,
          padding: window.innerWidth < 768 ? 20 : 32,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <h1
          style={{
            margin: "0 0 32px 0",
            fontSize: window.innerWidth < 768 ? 28 : 36,
            fontWeight: 700,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.02em",
          }}
        >
          Lotto & EuroMillions Dashboard
        </h1>

        {/* Startpagina: recentste resultaten + 2 kolommen */}
        {isHome && <HomeLayout />}

        {route.section === "euromillions" &&
          route.part2 &&
          route.part2 !== "charts" && <EuroMillionsDetail date={route.part2} />}
      </div>
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
          gridTemplateColumns: window.innerWidth < 768 ? "1fr" : "1fr 1fr",
          gap: window.innerWidth < 768 ? 12 : 16,
          marginTop: 16,
        }}
      >
        {/* Linker kolom: grafieken */}
        <div>
          <div
            style={{
              display: "flex",
              gap: window.innerWidth < 768 ? 4 : 8,
              marginBottom: 8,
              flexWrap: window.innerWidth < 768 ? "wrap" : "nowrap",
            }}
          >
            <button
              onClick={() => setLeftTab("lotto")}
              style={tabBtn(leftTab === "lotto")}
            >
              {window.innerWidth < 768 ? "Lotto" : "Lotto grafieken"}
            </button>
            <button
              onClick={() => setLeftTab("euromillions")}
              style={tabBtn(leftTab === "euromillions")}
            >
              {window.innerWidth < 768 ? "EuroM" : "EuroMillions grafieken"}
            </button>
          </div>
          <div style={cardStyle}>
            {leftTab === "lotto" ? <LottoCharts /> : <EuroMillionsCharts />}
          </div>
        </div>

        {/* Rechter kolom: uitgebreide resultaten */}
        <div>
          <div
            style={{
              display: "flex",
              gap: window.innerWidth < 768 ? 4 : 8,
              marginBottom: 8,
              flexWrap: window.innerWidth < 768 ? "wrap" : "nowrap",
            }}
          >
            <button
              onClick={() => setRightTab("lotto")}
              style={tabBtn(rightTab === "lotto")}
            >
              {window.innerWidth < 768 ? "Lotto" : "Lotto resultaten"}
            </button>
            <button
              onClick={() => setRightTab("euromillions")}
              style={tabBtn(rightTab === "euromillions")}
            >
              {window.innerWidth < 768 ? "EuroM" : "EuroMillions resultaten"}
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

/* Modern Design System */
const cardStyle = {
  border: "1px solid rgba(102, 126, 234, 0.1)",
  borderRadius: 16,
  padding: window.innerWidth < 768 ? 16 : 20,
  background: "rgba(255, 255, 255, 0.9)",
  boxShadow: "0 4px 20px rgba(102, 126, 234, 0.08)",
  backdropFilter: "blur(10px)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
};

function tabBtn(active) {
  const isMobile = window.innerWidth < 768;
  return {
    padding: isMobile ? "12px 16px" : "10px 16px",
    borderRadius: 12,
    border: "none",
    background: active
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      : "rgba(102, 126, 234, 0.08)",
    color: active ? "#fff" : "#4a5568",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: isMobile ? "14px" : "13px",
    minHeight: isMobile ? "48px" : "auto",
    flex: isMobile ? "1" : "none",
    minWidth: isMobile ? "0" : "auto",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: active
      ? "0 4px 12px rgba(102, 126, 234, 0.3)"
      : "0 1px 3px rgba(0, 0, 0, 0.1)",
    transform: active ? "scale(1.02)" : "scale(1)",
    "&:hover": {
      background: active
        ? "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)"
        : "rgba(102, 126, 234, 0.12)",
      transform: active ? "scale(1.04)" : "scale(1.02)",
    },
  };
}
