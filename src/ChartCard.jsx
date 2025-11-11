import React from "react";

export default function ChartCard({ title, children }) {
  const isMobile = window.innerWidth < 768;

  return (
    <div
      style={{
        border: "1px solid rgba(102, 126, 234, 0.1)",
        borderRadius: 20,
        padding: isMobile ? 20 : 24,
        marginBottom: 20,
        background: "rgba(255, 255, 255, 0.9)",
        boxShadow: "0 8px 32px rgba(102, 126, 234, 0.1)",
        backdropFilter: "blur(20px)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "translateY(-2px)";
        e.target.style.boxShadow = "0 12px 40px rgba(102, 126, 234, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "translateY(0)";
        e.target.style.boxShadow = "0 8px 32px rgba(102, 126, 234, 0.1)";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: isMobile ? "18px" : "20px",
            fontWeight: 700,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h3>
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            color: "#fff",
            fontWeight: "bold",
          }}
        >
          📊
        </div>
      </div>
      <div
        style={{
          width: "100%",
          height: isMobile ? 280 : 340,
          marginTop: 8,
          background: "rgba(248, 250, 252, 0.5)",
          borderRadius: "16px",
          padding: "12px",
          border: "1px solid rgba(102, 126, 234, 0.05)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
