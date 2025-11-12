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

export default function CalendarView({ type, onDateClick }) {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    (async () => {
      const collectionName =
        type === "lotto" ? "lotto_draws" : "euromillions_draws";
      const snap = await getDocs(collection(db, collectionName));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setDraws(data);
      setLoading(false);
    })();
  }, [type]);

  if (loading) return <div>Loading calendar...</div>;

  // Create a map of dates to winning amounts
  const winsByDate = {};
  draws.forEach((draw) => {
    winsByDate[draw.id] = draw.total_win || 0;
  });

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
      const winAmount = winsByDate[dateKey] || 0;
      const hasData = winAmount > 0;

      days.push(
        <div
          key={day}
          className={`calendar-day ${hasData ? "has-data" : ""} ${
            isMobile ? "mobile" : ""
          }`}
          onClick={() => hasData && onDateClick(dateKey)}
          style={{
            padding: isMobile ? "8px 4px" : "12px",
            border: "1px solid #eee",
            borderRadius: "8px",
            textAlign: "center",
            cursor: hasData ? "pointer" : "default",
            background: hasData ? "rgba(102, 126, 234, 0.1)" : "transparent",
            transition: "all 0.2s ease",
            position: "relative",
            minHeight: isMobile ? "50px" : "60px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            "&:hover": hasData
              ? {
                  background: "rgba(102, 126, 234, 0.2)",
                  transform: "scale(1.05)",
                }
              : {},
          }}
        >
          <div
            style={{ fontSize: isMobile ? "14px" : "16px", fontWeight: "600" }}
          >
            {day}
          </div>
          {hasData && (
            <div
              style={{
                fontSize: isMobile ? "10px" : "12px",
                color: "#667eea",
                fontWeight: "500",
                marginTop: "2px",
              }}
            >
              <Euro value={winAmount} />
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
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: isMobile ? "4px" : "8px",
            marginBottom: "8px",
          }}
        >
          {["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"].map((day) => (
            <div
              key={day}
              style={{
                textAlign: "center",
                fontWeight: "600",
                fontSize: isMobile ? "12px" : "14px",
                color: "#666",
                padding: "4px",
              }}
            >
              {day}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: isMobile ? "4px" : "8px",
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
        padding: isMobile ? "16px" : "20px",
        border: "1px solid rgba(102, 126, 234, 0.1)",
        borderRadius: "16px",
        background: "rgba(255, 255, 255, 0.9)",
        boxShadow: "0 4px 20px rgba(102, 126, 234, 0.08)",
      }}
    >
      <h3
        style={{ marginBottom: "16px", fontSize: isMobile ? "18px" : "20px" }}
      >
        {type === "lotto" ? "Lotto" : "EuroMillions"} - Winstoverzicht
      </h3>
      {renderCalendar()}
      <div
        style={{
          marginTop: "12px",
          fontSize: isMobile ? "12px" : "14px",
          color: "#666",
          textAlign: "center",
        }}
      >
        💡 Klik op een dag met winst om de details te bekijken
      </div>
    </div>
  );
}
