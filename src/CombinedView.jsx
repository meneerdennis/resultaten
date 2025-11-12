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
        padding: isMobile ? "6px 8px" : "4px 10px",
        borderRadius: 999,
        background: type === "lotto" ? "#e3f2fd" : "#f3e5f5",
        marginRight: isMobile ? 4 : 6,
        fontSize: isMobile ? "12px" : "14px",
        border: `1px solid ${type === "lotto" ? "#2196f3" : "#9c27b0"}`,
      }}
    >
      {children}
    </span>
  );
}

function CalendarView({ draws, onDateClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = windowWidth < 900;

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const formatDateKey = (year, month, day) => {
    const monthStr = (month + 1).toString().padStart(2, "0");
    const dayStr = day.toString().padStart(2, "0");
    return `${year}-${monthStr}-${dayStr}`;
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Create maps for lotto and euromillions wins
  const lottoWins = {};
  const euromillionsWins = {};

  draws.forEach((draw) => {
    if (draw.type === "lotto") {
      lottoWins[draw.id] = draw.total_win || 0;
    } else if (draw.type === "euromillions") {
      euromillionsWins[draw.id] = draw.total_win || 0;
    }
  });

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const monthNames = [
      "Januari",
      "Februari",
      "Maart",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Augustus",
      "September",
      "Oktober",
      "November",
      "December",
    ];

    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(year, month, day);
      const lottoWin = lottoWins[dateKey] || 0;
      const euromillionsWin = euromillionsWins[dateKey] || 0;
      const hasLottoData = lottoWin > 0;
      const hasEuroData = euromillionsWin > 0;
      const hasAnyData = hasLottoData || hasEuroData;

      days.push(
        <div
          key={day}
          className={`calendar-day ${hasAnyData ? "has-data" : ""} ${
            isMobile ? "mobile" : ""
          }`}
          onClick={() => {
            if (hasLottoData) onDateClick(dateKey, "lotto");
            else if (hasEuroData) onDateClick(dateKey, "euromillions");
          }}
          style={{
            padding: isMobile ? "4px 2px" : "8px",
            border: "1px solid #eee",
            borderRadius: isMobile ? "4px" : "8px",
            textAlign: "center",
            cursor: hasAnyData ? "pointer" : "default",
            background: hasAnyData
              ? hasLottoData && hasEuroData
                ? "linear-gradient(135deg, #e3f2fd 50%, #f3e5f5 50%)" // Both
                : hasLottoData
                ? "rgba(33, 150, 243, 0.1)" // Lotto only
                : "rgba(156, 39, 176, 0.1)" // Euro only
              : "transparent",
            transition: "all 0.2s ease",
            position: "relative",
            minHeight: isMobile ? "45px" : "60px",
            maxHeight: isMobile ? "45px" : "60px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: isMobile ? "12px" : "14px",
              fontWeight: "600",
              lineHeight: 1.2,
            }}
          >
            {day}
          </div>
          {hasAnyData && (
            <div
              style={{
                fontSize: isMobile ? "8px" : "10px",
                marginTop: "1px",
                display: "flex",
                flexDirection: "column",
                gap: "0.5px",
                lineHeight: 1.1,
                overflow: "hidden",
              }}
            >
              {hasLottoData && (
                <div
                  style={{
                    color: "#2196f3",
                    fontWeight: "500",
                    fontSize: isMobile ? "7px" : "9px",
                    lineHeight: 1,
                  }}
                >
                  <Euro value={lottoWin} />
                </div>
              )}
              {hasEuroData && (
                <div
                  style={{
                    color: "#9c27b0",
                    fontWeight: "500",
                    fontSize: isMobile ? "7px" : "9px",
                    lineHeight: 1,
                  }}
                >
                  <Euro value={euromillionsWin} />
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <button
            onClick={() => navigateMonth(-1)}
            style={{
              padding: "8px 12px",
              border: "none",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            ←
          </button>
          <h3 style={{ margin: 0, fontSize: isMobile ? "16px" : "18px" }}>
            {monthNames[month]} {year}
          </h3>
          <button
            onClick={() => navigateMonth(1)}
            style={{
              padding: "8px 12px",
              border: "none",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            →
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))", // Allow columns to shrink
            gap: isMobile ? "2px" : "4px",
            marginBottom: "8px",
            minWidth: 0, // Allow container to shrink
          }}
        >
          {["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"].map((day) => (
            <div
              key={day}
              style={{
                textAlign: "center",
                fontWeight: "600",
                fontSize: isMobile ? "10px" : "12px",
                color: "#666",
                padding: isMobile ? "2px" : "4px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {day}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))", // Allow columns to shrink
            gap: isMobile ? "2px" : "4px",
            minWidth: 0, // Allow container to shrink
          }}
        >
          {days}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        marginBottom: "24px",
        padding: isMobile ? "12px" : "16px",
        border: "1px solid rgba(102, 126, 234, 0.1)",
        borderRadius: "16px",
        background: "rgba(255, 255, 255, 0.9)",
        boxShadow: "0 4px 20px rgba(102, 126, 234, 0.08)",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <h3
        style={{
          marginBottom: "12px",
          fontSize: isMobile ? "16px" : "20px",
          textAlign: "center",
        }}
      >
        Maandelijks winstoverzicht:
      </h3>
      <div
        style={{
          marginBottom: "8px",
          fontSize: isMobile ? "11px" : "14px",
          color: "#666",
          textAlign: "center",
        }}
      >
        <span style={{ color: "#2196f3" }}>●</span> Lotto &nbsp;
        <span style={{ color: "#9c27b0" }}>●</span> EuroMillions
      </div>
      <div
        style={{
          maxWidth: "100%",
          overflowX: "auto",
        }}
      >
        {renderCalendar()}
      </div>
      <div
        style={{
          marginTop: "8px",
          fontSize: isMobile ? "11px" : "14px",
          color: "#666",
          textAlign: "center",
        }}
      >
        💡 Klik op een dag om de beschikbare loterij-details te bekijken
      </div>
    </div>
  );
}

export default function CombinedView() {
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

  const handleDateClick = (date, type) => {
    window.location.hash = `#/${type}/${date}`;
  };

  const renderNumberPills = (numbers, stars = []) => {
    const allNumbers = [...(numbers || []), ...(stars || [])];
    return allNumbers.map((num, index) => (
      <Pill
        key={`${num}-${index}`}
        type={stars.includes(num) ? "euromillions" : "lotto"}
      >
        {stars.includes(num) ? `★ ${num}` : num}
      </Pill>
    ));
  };

  return (
    <div>
      <CalendarView draws={draws} onDateClick={handleDateClick} />

      {isMobile ? (
        // Mobile: Card layout
        <div style={{ display: "grid", gap: 12 }}>
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
        <div
          style={{
            border: "1px solid rgba(102, 126, 234, 0.1)",
            borderRadius: "16px",
            background: "rgba(255, 255, 255, 0.9)",
            overflow: "hidden",
          }}
        ></div>
      )}
    </div>
  );
}
