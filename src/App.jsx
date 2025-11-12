import React, { useEffect, useState } from "react";
import LottoView from "./LottoView.jsx";
import EuroMillionsView from "./EuroMillionsView.jsx";
import EuroMillionsDetail from "./EuroMillionsDetail.jsx";
import LottoDetail from "./LottoDetail.jsx";
import CombinedView from "./CombinedView.jsx";
import CombinedCharts from "./CombinedCharts.jsx";
import LottoCharts from "./LottoCharts.jsx";
import EuroMillionsCharts from "./EuroMillionsCharts.jsx";
import HomeLatest from "./HomeLatest.jsx";
import CombinedDrawsTable from "./CombinedDrawsTable.jsx";

function parseRoute() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (!hash) return { section: "home" };
  const [section, part2] = hash.split("/");
  return { section, part2 };
}

export default function App() {
  const [route, setRoute] = useState(parseRoute());
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onHash = () => setRoute(parseRoute());
    window.addEventListener("hashchange", onHash);

    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const isHome = route.section === "home" || !route.section;
  const isMobile = windowWidth < 900;

  return (
    <div
      style={{
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: isMobile ? 12 : 32,
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: 24,
          padding: isMobile ? 16 : 32,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <h1
          style={{
            margin: "0 0 32px 0",
            fontSize: isMobile ? 24 : 36,
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

        {/* Lotto overzicht pagina */}
        {route.section === "lotto" && !route.part2 && <LottoView />}

        {/* Lotto detail pagina */}
        {route.section === "lotto" &&
          route.part2 &&
          route.part2 !== "charts" && <LottoDetail date={route.part2} />}

        {/* EuroMillions overzicht pagina */}
        {route.section === "euromillions" && !route.part2 && (
          <EuroMillionsView />
        )}

        {/* EuroMillions detail pagina */}
        {route.section === "euromillions" &&
          route.part2 &&
          route.part2 !== "charts" && <EuroMillionsDetail date={route.part2} />}

        {/* Combined view pagina */}
        {route.section === "combined" && <CombinedView />}

        {/* Combined charts pagina */}
        {route.section === "combined-charts" && <CombinedCharts />}
      </div>
    </div>
  );
}

/* Home lay-out: bovenaan laatste resultaten, daaronder twee kolommen */
function HomeLayout() {
  const [leftTab, setLeftTab] = useState("combined"); // grafieken-tab
  const [rightTab, setRightTab] = useState("combined"); // resultaten-tab
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = windowWidth < 900;
  const isNarrow = windowWidth < 1100;

  return (
    <>
      <HomeLatest />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? 12 : 16,
          marginTop: 16,
          alignItems: "stretch", // Make columns equal height
        }}
      >
        {/* Linker kolom: kalenderview */}
        <div
          style={{
            minWidth: 0, // Allow column to shrink
            overflow: "hidden", // Prevent overflow
            display: "flex", // Use flexbox for equal height
            flexDirection: "column", // Stack content vertically
          }}
        >
          <div
            style={{
              ...cardStyle,
              padding: isNarrow ? 12 : 20, // Reduce padding on narrow screens
              flex: 1, // Take available space
              display: "flex",
              flexDirection: "column",
            }}
          >
            {rightTab === "combined" ? (
              <CombinedView />
            ) : rightTab === "lotto" ? (
              <LottoView />
            ) : (
              <EuroMillionsView />
            )}
          </div>
        </div>

        {/* Rechter kolom: grafieken */}
        <div
          style={{
            minWidth: 0, // Allow column to shrink
            overflow: "hidden", // Prevent overflow
            display: "flex", // Use flexbox for equal height
            flexDirection: "column", // Stack content vertically
          }}
        >
          <div
            style={{
              ...cardStyle,
              padding: isNarrow ? 12 : 20, // Reduce padding on narrow screens
              flex: 1, // Take available space
              display: "flex",
              flexDirection: "column",
            }}
          >
            {leftTab === "combined" ? (
              <CombinedCharts />
            ) : leftTab === "lotto" ? (
              <LottoCharts />
            ) : (
              <EuroMillionsCharts />
            )}
          </div>
        </div>
      </div>

      {/* Combined Draws Table Section */}
      <div
        style={{
          marginTop: 16,
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            ...cardStyle,
            padding: isNarrow ? 12 : 20,
          }}
        >
          <CombinedDrawsTable />
        </div>
      </div>
    </>
  );
}

/* Modern Design System */
const cardStyle = {
  border: "1px solid rgba(102, 126, 234, 0.1)",
  borderRadius: 16,
  padding: 20,
  background: "rgba(255, 255, 255, 0.9)",
  boxShadow: "0 4px 20px rgba(102, 126, 234, 0.08)",
  backdropFilter: "blur(10px)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
};

function tabBtn(active, isMobile) {
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
